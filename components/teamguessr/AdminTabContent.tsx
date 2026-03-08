import type { RefObject } from "react";
import { Database, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Coordinates, GameSet, Picture } from "@/lib/types";

interface AdminTabContentProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  adminMapElRef: RefObject<HTMLDivElement | null>;
  imageYear: string;
  imageTitle: string;
  selectedCoords: Coordinates | null;
  gameSetName: string;
  selectedGameSetPictureIds: number[];
  pictures: Picture[];
  gameSets: GameSet[];
  debugLastUpdate: string;
  onImageYearChange: (value: string) => void;
  onImageTitleChange: (value: string) => void;
  onAddPicture: () => void;
  onGameSetNameChange: (value: string) => void;
  onToggleGameSetPicture: (pictureId: number) => void;
  onSaveGameSet: () => void;
  onSaveData: () => void;
  onLoadData: () => void;
  onClearAll: () => void;
  onRefreshDebug: () => void;
  onDeletePicture: (pictureId: number) => void;
}

export function AdminTabContent({
  fileInputRef,
  adminMapElRef,
  imageYear,
  imageTitle,
  selectedCoords,
  gameSetName,
  selectedGameSetPictureIds,
  pictures,
  gameSets,
  debugLastUpdate,
  onImageYearChange,
  onImageTitleChange,
  onAddPicture,
  onGameSetNameChange,
  onToggleGameSetPicture,
  onSaveGameSet,
  onSaveData,
  onLoadData,
  onClearAll,
  onRefreshDebug,
  onDeletePicture,
}: AdminTabContentProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📷 Add New Picture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="imageUpload">Upload Image</Label>
            <Input ref={fileInputRef} id="imageUpload" type="file" accept="image/*" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="imageYear">Year (1900-2024)</Label>
              <Input
                id="imageYear"
                type="number"
                value={imageYear}
                min={1900}
                max={2024}
                onChange={(e) => onImageYearChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageTitle">Title</Label>
              <Input
                id="imageTitle"
                value={imageTitle}
                onChange={(e) => onImageTitleChange(e.target.value)}
                placeholder="Times Square in the 90s"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Click map to select location</Label>
            <div ref={adminMapElRef} className="admin-map w-full rounded-lg border border-slate-200" />
            <p className="text-sm text-slate-500">
              Coordinates:{" "}
              {selectedCoords
                ? `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                : "Click on map to select"}
            </p>
          </div>
          <Button onClick={onAddPicture} className="w-full md:w-auto">
            <Plus className="h-4 w-4" /> Add Picture
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💾 Save Game Set</CardTitle>
          <CardDescription>Select exactly 5 pictures.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="gameSetName">Game set name</Label>
            <Input
              id="gameSetName"
              value={gameSetName}
              onChange={(e) => onGameSetNameChange(e.target.value)}
              placeholder="Vintage Cities"
            />
          </div>
          <div className="grid gap-2 rounded-lg border border-slate-200 p-3">
            {pictures.length === 0 && (
              <p className="text-sm text-slate-500">No pictures available yet.</p>
            )}
            {pictures.map((picture) => {
              const checked = selectedGameSetPictureIds.includes(picture.id);
              return (
                <label key={picture.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleGameSetPicture(picture.id)}
                  />
                  {picture.title} ({picture.year})
                </label>
              );
            })}
          </div>
          <Button onClick={onSaveGameSet}>Save Game Set</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💾 Data Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={onSaveData}>
            <Save className="h-4 w-4" /> Save Data
          </Button>
          <Button variant="secondary" onClick={onLoadData}>
            <Database className="h-4 w-4" /> Load Data
          </Button>
          <Button variant="danger" onClick={onClearAll}>
            <Trash2 className="h-4 w-4" /> Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Pictures loaded: {pictures.length}</p>
          <p>Game sets loaded: {gameSets.length}</p>
          <p>Last update: {debugLastUpdate}</p>
          <Button variant="outline" size="sm" onClick={onRefreshDebug}>
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📸 Current Pictures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pictures.length === 0 && (
            <p className="text-sm text-slate-500">No pictures added yet.</p>
          )}
          {pictures.map((picture) => (
            <div
              key={picture.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center"
            >
              <img src={picture.image} alt={picture.title} className="h-20 w-32 rounded-md object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-slate-900">{picture.title}</p>
                <p>Year: {picture.year}</p>
                <p>
                  Location: {picture.lat.toFixed(4)}, {picture.lng.toFixed(4)}
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => onDeletePicture(picture.id)}>
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
