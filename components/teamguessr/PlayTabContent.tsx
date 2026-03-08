import type { RefObject } from "react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Picture, PlayPhase, RoundResult } from "@/lib/types";

interface PlayTabContentProps {
  playPhase: PlayPhase;
  currentPicture: Picture | null;
  currentRound: number;
  totalScore: number;
  roundResults: RoundResult | null;
  gameResults: RoundResult[];
  yearGuess: string;
  gameMapElRef: RefObject<HTMLDivElement | null>;
  onYearGuessChange: (value: string) => void;
  onStartRandomGame: () => void;
  onSubmitGuess: () => void;
  onNextRound: () => void;
  onRestartGame: () => void;
}

export function PlayTabContent({
  playPhase,
  currentPicture,
  currentRound,
  totalScore,
  roundResults,
  gameResults,
  yearGuess,
  gameMapElRef,
  onYearGuessChange,
  onStartRandomGame,
  onSubmitGuess,
  onNextRound,
  onRestartGame,
}: PlayTabContentProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🎮 Play Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playPhase === "start" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Start a random 5-round game from your picture pool.
              </p>
              <Button onClick={onStartRandomGame}>
                <Play className="h-4 w-4" /> Start Random Game
              </Button>
            </div>
          )}

          {playPhase === "play" && currentPicture && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-900 p-3 text-sm font-medium text-white">
                Round {currentRound + 1} of 5
                <span className="float-right">Total Score: {totalScore}</span>
              </div>

              <img
                src={currentPicture.image}
                alt="Guess this location and year"
                className="max-h-[26rem] w-full rounded-lg object-contain"
              />

              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                <Label>Click map to guess location</Label>
                <div
                  ref={gameMapElRef}
                  className="play-map w-full rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid gap-2 md:max-w-xs">
                <Label htmlFor="yearGuess">Year Guess</Label>
                <Input
                  id="yearGuess"
                  type="number"
                  min={1900}
                  max={2024}
                  value={yearGuess}
                  onChange={(e) => onYearGuessChange(e.target.value)}
                />
              </div>

              {!roundResults && <Button onClick={onSubmitGuess}>Submit Guess</Button>}

              {roundResults && (
                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-lg font-semibold">
                    Round Score: {roundResults.roundScore} / 10000
                  </p>
                  <p>
                    Year: {roundResults.yearGuess} vs {roundResults.picture.year} ({roundResults.yearDiff} years)
                  </p>
                  <p>Distance: {roundResults.distance.toFixed(0)} km</p>
                  <p>
                    Split: Year {roundResults.yearScore} / Location {roundResults.distanceScore}
                  </p>
                  <Button onClick={onNextRound}>
                    {currentRound === 4 ? "Finish Game" : "Next Round"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {playPhase === "end" && (
            <div className="space-y-4">
              <p className="text-2xl font-bold">Final Score: {totalScore} / 50000</p>
              <div className="space-y-2">
                {gameResults.map((result, idx) => (
                  <div
                    key={`${result.picture.id}-${idx}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Round {idx + 1}: {result.picture.title}</p>
                      <p>Year: {result.yearGuess} vs {result.picture.year}</p>
                      <p>Distance: {result.distance.toFixed(0)} km</p>
                      <p>Score: {result.roundScore}</p>
                    </div>
                    <img
                      src={result.picture.image}
                      alt={`Round ${idx + 1} reference`}
                      className="h-16 w-24 shrink-0 rounded-md object-cover"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={onRestartGame}>Play Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
