// app/components/PokerHandEvaluator.tsx
'use client';
import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Types for cards and poker hands
type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
type PlayingCard = { suit: Suit; rank: Rank };
type HandRank = 
  | "Royal Flush"
  | "Straight Flush"
  | "Four of a Kind"
  | "Full House"
  | "Flush"
  | "Straight"
  | "Three of a Kind"
  | "Two Pair"
  | "Pair"
  | "High Card"
  | null

const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const PokerHandEvaluator: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState<PlayingCard[]>([]);
  const [error, setError] = useState<string>("");

  // Generate all possible cards for selection
  const allCards = suits.flatMap(suit => ranks.map(rank => ({ suit, rank }))
    );
  

  // Handle card selection/deselection
  const toggleCard = (card: PlayingCard) => {
    setError("");
    const cardKey = `${card.rank}-${card.suit}`;
    const isSelected = selectedCards.some(c => 
      `${c.rank}-${c.suit}` === cardKey
    );

    if (isSelected) {
      setSelectedCards(cards => cards.filter(c => 
        `${c.rank}-${c.suit}` !== cardKey
      ));
    } else if (selectedCards.length < 5) {
      setSelectedCards(cards => [...cards, card]);
    } else {
      setError("You can only select 5 cards");
    }
  };

  // Poker hand evaluation logic
  const evaluateHand = (): HandRank => {
    if (selectedCards.length !== 5) return null;

    const values = selectedCards.map(card => 
      ranks.indexOf(card.rank) + 2
    ).sort((a, b) => a - b);
    const suitsCount = selectedCards.reduce((acc, card) => {
      acc[card.suit] = (acc[card.suit] || 0) + 1;
      return acc;
    }, {} as Record<Suit, number>);
    const valueCount = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const isFlush = Object.values(suitsCount).some(count => count === 5);
    const isStraight = values.every((val, i) => 
      i === 0 || val === values[i-1] + 1
    ) || (values.join() === "2,3,4,5,14"); // Ace-low straight

    const counts = Object.values(valueCount).sort((a, b) => b - a);

    // Evaluate hand rank from highest to lowest
    if (isFlush && isStraight && values[4] === 14) return "Royal Flush";
    if (isFlush && isStraight) return "Straight Flush";
    if (counts[0] === 4) return "Four of a Kind";
    if (counts[0] === 3 && counts[1] === 2) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (counts[0] === 3) return "Three of a Kind";
    if (counts[0] === 2 && counts[1] === 2) return "Two Pair";
    if (counts[0] === 2) return "Pair";
    return "High Card";
  };

  // Suit symbols for display
  const suitSymbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Poker Hand Evaluator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Cards Display */}
          <div className="flex flex-wrap gap-4 justify-center min-h-[60px]">
            {selectedCards.map((card) => (
              <motion.div
                key={`${card.rank}-${card.suit}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-16 h-24 rounded-md shadow-md flex items-center justify-center text-2xl font-bold cursor-pointer
                  ${card.suit === "hearts" || card.suit === "diamonds" ? "text-red-600" : "text-black"}
                  bg-white`}
                onClick={() => toggleCard(card)}
              >
                {card.rank}<br/>{suitSymbols[card.suit]}
              </motion.div>
            ))}
          </div>

          {/* Hand Evaluation */}
          {selectedCards.length === 5 && evaluateHand() && (
            <div className="text-center text-xl font-semibold text-green-600">
              Hand Rank: {evaluateHand()}
            </div>
          )}
          {error && (
            <div className="text-center text-red-500">{error}</div>
          )}
          {selectedCards.length > 0 && selectedCards.length < 5 && (
            <div className="text-center text-gray-600">
              Select {5 - selectedCards.length} more card(s)
            </div>
          )}

          {/* Card Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-13 gap-1">
            {allCards.map(card => {
              const isSelected = selectedCards.some(c => 
                c.rank === card.rank && c.suit === card.suit
              );
              return (
                <Button
                  key={`${card.rank}-${card.suit}`}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-12 font-bold
                    ${card.suit === "hearts" || card.suit === "diamonds" ? "text-red-600" : "text-black"}
                    ${isSelected ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => toggleCard(card)}
                  disabled={selectedCards.length >= 5 && !isSelected}
                >
                  {card.rank}<br/>{suitSymbols[card.suit]}
                </Button>
              );
            })}
          </div>

          {/* Reset Button */}
          {selectedCards.length > 0 && (
            <div className="text-center">
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedCards([]);
                  setError("");
                }}
              >
                Reset Hand
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PokerHandEvaluator;