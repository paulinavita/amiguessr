import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameSet } from "@/lib/types";

interface GameSetsTabContentProps {
  gameSets: GameSet[];
  onPlayGameSet: (id: number) => void;
  onDeleteGameSet: (id: number) => void;
}

export function GameSetsTabContent({
  gameSets,
  onPlayGameSet,
  onDeleteGameSet,
}: GameSetsTabContentProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📚 Saved Game Sets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameSets.length === 0 && (
            <p className="text-sm text-slate-500">No game sets saved yet.</p>
          )}
          {gameSets.map((gameSet) => (
            <div
              key={gameSet.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">{gameSet.name}</p>
                <p className="text-sm text-slate-500">5 pictures</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onPlayGameSet(gameSet.id)}>
                  Play
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDeleteGameSet(gameSet.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
