"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminTabContent } from "@/components/teamguessr/AdminTabContent";
import { GameSetsTabContent } from "@/components/teamguessr/GameSetsTabContent";
import { PlayTabContent } from "@/components/teamguessr/PlayTabContent";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeafletMaps } from "@/hooks/use-leaflet-maps";
import { useTeamguessrGame } from "@/hooks/use-teamguessr-game";
import type { Coordinates, GameData, Picture, TabKey } from "@/lib/types";

const DEFAULT_VIEW: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 2;

interface PickerWindow extends Window {
  showSaveFilePicker?: (options: unknown) => Promise<{
    createWritable: () => Promise<{
      write: (data: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
  showOpenFilePicker?: (
    options: unknown,
  ) => Promise<Array<{ getFile: () => Promise<File> }>>;
}

function getPickerWindow(): PickerWindow {
  return window as PickerWindow;
}

export default function HomePage() {
  const game = useTeamguessrGame();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageYear, setImageYear] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(
    null,
  );
  const [yearGuess, setYearGuess] = useState("");
  const [guessCoords, setGuessCoords] = useState<Coordinates | null>(null);

  const [gameSetName, setGameSetName] = useState("");
  const [selectedGameSetPictureIds, setSelectedGameSetPictureIds] = useState<
    number[]
  >([]);
  const [activeTab, setActiveTab] = useState<TabKey>("admin");
  const {
    adminMapElRef,
    gameMapElRef,
    clearRoundMarkers,
    clearAdminSelectionMarker,
    showActualMarker,
    resetGameMapView,
  } = useLeafletMaps({
    activeTab,
    playPhase: game.playPhase,
    onAdminMapClick: setSelectedCoords,
    onGameMapClick: setGuessCoords,
    defaultView: DEFAULT_VIEW,
    defaultZoom: DEFAULT_ZOOM,
  });

  function clearRoundMarkersAndState(): void {
    clearRoundMarkers();
    setGuessCoords(null);
  }

  async function saveData(): Promise<void> {
    const data: GameData = { pictures: game.pictures, gameSets: game.gameSets };

    try {
      const pickerWindow = getPickerWindow();
      if (pickerWindow.showSaveFilePicker) {
        const handle = await pickerWindow.showSaveFilePicker({
          suggestedName: "timeguessr_data.json",
          types: [
            {
              description: "JSON File",
              accept: { "application/json": [".json"] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
        toast.success("Data saved to file successfully.");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "timeguessr_data.json";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success("Data downloaded as JSON.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save data.");
    }
  }

  async function loadData(): Promise<void> {
    try {
      const pickerWindow = getPickerWindow();
      if (!pickerWindow.showOpenFilePicker) {
        toast.error("This browser does not support file picker.");
        return;
      }

      const [fileHandle] = await pickerWindow.showOpenFilePicker({
        types: [
          {
            description: "JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      const file = await fileHandle.getFile();
      const contents = await file.text();
      const data = JSON.parse(contents) as GameData;

      game.loadGameData(data);
      setActiveTab("admin");
      setSelectedGameSetPictureIds([]);
      toast.success(
        `Loaded ${(data.pictures || []).length} pictures and ${(data.gameSets || []).length} game sets.`,
      );
    } catch {
      toast.error("Load cancelled or invalid JSON file.");
    }
  }

  function handleAddPicture(): void {
    const file = fileInputRef.current?.files?.[0];
    const parsedYear = Number.parseInt(imageYear, 10);

    if (!file || !parsedYear || !imageTitle || !selectedCoords) {
      toast.error("Fill all fields and select a map location.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const image = e.target?.result;
      if (typeof image !== "string") {
        toast.error("Invalid image payload.");
        return;
      }

      const picture: Picture = {
        id: Date.now(),
        title: imageTitle,
        year: parsedYear,
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        image,
      };

      game.addPicture(picture);

      setImageYear("");
      setImageTitle("");
      setSelectedCoords(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      clearAdminSelectionMarker();

      toast.success("Picture added.");
    };

    reader.readAsDataURL(file);
  }

  function handleDeletePicture(id: number): void {
    if (!window.confirm("Delete this picture?")) return;

    game.deletePicture(id);
    setSelectedGameSetPictureIds((prev) => prev.filter((pid) => pid !== id));
    toast.success("Picture deleted.");
  }

  function handleToggleGameSetPicture(pictureId: number): void {
    const checked = selectedGameSetPictureIds.includes(pictureId);
    setSelectedGameSetPictureIds((prev) => {
      if (checked) {
        return prev.filter((id) => id !== pictureId);
      }

      if (prev.length >= 5) {
        toast.error("Only 5 pictures can be selected.");
        return prev;
      }

      return [...prev, pictureId];
    });
  }

  function handleSaveGameSet(): void {
    if (!gameSetName || selectedGameSetPictureIds.length !== 5) {
      toast.error("Enter a name and pick exactly 5 pictures.");
      return;
    }

    game.addGameSet(gameSetName, selectedGameSetPictureIds);
    setGameSetName("");
    setSelectedGameSetPictureIds([]);
    toast.success("Game set saved.");
  }

  function handleDeleteGameSet(id: number): void {
    if (!window.confirm("Delete this game set?")) return;

    game.deleteGameSet(id);
    toast.success("Game set deleted.");
  }

  function handleStartRandomGame(): void {
    const res = game.startRandomGame();
    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setYearGuess("");
    clearRoundMarkersAndState();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resetGameMapView();
      });
    });
  }

  function handlePlayGameSet(id: number): void {
    const res = game.playGameSet(id);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setActiveTab("play");
    setYearGuess("");
    clearRoundMarkersAndState();
  }

  function handleSubmitGuess(): void {
    const res = game.submitGuess(yearGuess, guessCoords);
    if (!res.ok || !res.result) {
      toast.error(res.message);
      return;
    }

    showActualMarker(res.result);
  }

  function handleNextRound(): void {
    const result = game.nextRound();
    clearRoundMarkersAndState();
    setYearGuess("");

    if (!result.finished) {
      resetGameMapView();
    }
  }

  function handleRestartGame(): void {
    game.restartGame();
    clearRoundMarkersAndState();
    setYearGuess("");
    resetGameMapView();
  }

  function handleClearAll(): void {
    if (!window.confirm("Clear all data? This cannot be undone.")) return;

    game.clearAllData();
    setSelectedGameSetPictureIds([]);
    clearRoundMarkersAndState();
    toast.success("All data cleared.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <Card className="border-none bg-slate-900 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Amiguesser</CardTitle>
            <CardDescription className="text-slate-300">
              Upload photos, set locations and years, then challenge your team.
            </CardDescription>
            <p className="text-sm font-semibold text-amber-300">
              Load a JSON data file to restore your picture library.
            </p>
          </CardHeader>
        </Card>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
            <TabsTrigger value="play">Play Game</TabsTrigger>
            <TabsTrigger value="sets">Game Sets</TabsTrigger>
          </TabsList>

          <TabsContent value="admin" forceMount>
            <AdminTabContent
              fileInputRef={fileInputRef}
              adminMapElRef={adminMapElRef}
              imageYear={imageYear}
              imageTitle={imageTitle}
              selectedCoords={selectedCoords}
              gameSetName={gameSetName}
              selectedGameSetPictureIds={selectedGameSetPictureIds}
              pictures={game.pictures}
              gameSets={game.gameSets}
              debugLastUpdate={game.debugLastUpdate}
              onImageYearChange={setImageYear}
              onImageTitleChange={setImageTitle}
              onAddPicture={handleAddPicture}
              onGameSetNameChange={setGameSetName}
              onToggleGameSetPicture={handleToggleGameSetPicture}
              onSaveGameSet={handleSaveGameSet}
              onSaveData={saveData}
              onLoadData={loadData}
              onClearAll={handleClearAll}
              onRefreshDebug={game.refreshDebugInfo}
              onDeletePicture={handleDeletePicture}
            />
          </TabsContent>

          <TabsContent value="play" forceMount>
            <PlayTabContent
              playPhase={game.playPhase}
              currentPicture={game.currentPicture}
              currentRound={game.currentRound}
              totalScore={game.totalScore}
              roundResults={game.roundResults}
              gameResults={game.gameResults}
              yearGuess={yearGuess}
              gameMapElRef={gameMapElRef}
              onYearGuessChange={setYearGuess}
              onStartRandomGame={handleStartRandomGame}
              onSubmitGuess={handleSubmitGuess}
              onNextRound={handleNextRound}
              onRestartGame={handleRestartGame}
            />
          </TabsContent>

          <TabsContent value="sets" forceMount>
            <GameSetsTabContent
              gameSets={game.gameSets}
              onPlayGameSet={handlePlayGameSet}
              onDeleteGameSet={handleDeleteGameSet}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
