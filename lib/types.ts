export type TabKey = "admin" | "play" | "sets";

export type PlayPhase = "start" | "play" | "end";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Picture {
  id: number;
  title: string;
  year: number;
  lat: number;
  lng: number;
  image: string;
  imageFileName?: string | null;
}

export interface GameSet {
  id: number;
  name: string;
  pictureIds: number[];
}

export interface RoundResult {
  picture: Picture;
  yearGuess: number;
  locationGuess: Coordinates;
  yearScore: number;
  distanceScore: number;
  roundScore: number;
  distance: number;
  yearDiff: number;
}

export interface GameData {
  pictures?: Picture[];
  gameSets?: GameSet[];
}

export interface ActionResult {
  ok: boolean;
  message?: string;
}

export interface GuessResult extends ActionResult {
  result?: RoundResult;
}
