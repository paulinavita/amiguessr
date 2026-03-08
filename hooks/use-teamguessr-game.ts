"use client";

import { useMemo, useState } from "react";

import { buildRoundResult } from "@/lib/scoring";
import type {
  ActionResult,
  Coordinates,
  GameData,
  GameSet,
  GuessResult,
  Picture,
  PlayPhase,
  RoundResult,
} from "@/lib/types";

interface NextRoundResult {
  finished: boolean;
}

export interface TeamguessrGameState {
  pictures: Picture[];
  gameSets: GameSet[];
  currentGame: Picture[] | null;
  currentRound: number;
  currentPicture: Picture | null;
  totalScore: number;
  gameResults: RoundResult[];
  playPhase: PlayPhase;
  roundResults: RoundResult | null;
  debugLastUpdate: string;
  refreshDebugInfo: () => void;
  loadGameData: (data: GameData) => void;
  addPicture: (picture: Picture) => void;
  deletePicture: (id: number) => void;
  addGameSet: (name: string, pictureIds: number[]) => void;
  deleteGameSet: (id: number) => void;
  startRandomGame: () => ActionResult;
  playGameSet: (gameSetId: number) => ActionResult;
  submitGuess: (yearGuess: string, guessCoords: Coordinates | null) => GuessResult;
  nextRound: () => NextRoundResult;
  restartGame: () => void;
  clearAllData: () => void;
}

export function useTeamguessrGame(): TeamguessrGameState {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [gameSets, setGameSets] = useState<GameSet[]>([]);

  const [currentGame, setCurrentGame] = useState<Picture[] | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameResults, setGameResults] = useState<RoundResult[]>([]);
  const [playPhase, setPlayPhase] = useState<PlayPhase>("start");
  const [roundResults, setRoundResults] = useState<RoundResult | null>(null);
  const [debugLastUpdate, setDebugLastUpdate] = useState("Never");

  const currentPicture = useMemo(
    () => (currentGame ? currentGame[currentRound] : null),
    [currentGame, currentRound]
  );

  function refreshDebugInfo(): void {
    setDebugLastUpdate(new Date().toLocaleTimeString());
  }

  function loadGameData(data: GameData): void {
    setPictures(data.pictures || []);
    setGameSets(data.gameSets || []);
    refreshDebugInfo();
  }

  function addPicture(picture: Picture): void {
    setPictures((prev) => [...prev, picture]);
    refreshDebugInfo();
  }

  function deletePicture(id: number): void {
    setPictures((prev) => prev.filter((p) => p.id !== id));
    refreshDebugInfo();
  }

  function addGameSet(name: string, pictureIds: number[]): void {
    const gameSet: GameSet = {
      id: Date.now(),
      name,
      pictureIds,
    };

    setGameSets((prev) => [...prev, gameSet]);
    refreshDebugInfo();
  }

  function deleteGameSet(id: number): void {
    setGameSets((prev) => prev.filter((gs) => gs.id !== id));
    refreshDebugInfo();
  }

  function startRandomGame(): ActionResult {
    if (pictures.length < 5) {
      return { ok: false, message: "You need at least 5 pictures to start a game." };
    }

    const shuffled = [...pictures].sort(() => 0.5 - Math.random());
    initGame(shuffled.slice(0, 5));
    return { ok: true };
  }

  function playGameSet(gameSetId: number): ActionResult {
    const gameSet = gameSets.find((gs) => gs.id === gameSetId);
    if (!gameSet) {
      return { ok: false, message: "Game set not found." };
    }

    const chosenPictures = gameSet.pictureIds
      .map((id) => pictures.find((p) => p.id === id))
      .filter((value): value is Picture => Boolean(value));

    if (chosenPictures.length !== 5) {
      return {
        ok: false,
        message: "Some pictures in this game set are missing. Please recreate the game set.",
      };
    }

    initGame(chosenPictures);
    return { ok: true };
  }

  function initGame(gamePictures: Picture[]): void {
    setCurrentGame(gamePictures);
    setCurrentRound(0);
    setTotalScore(0);
    setGameResults([]);
    setRoundResults(null);
    setPlayPhase("play");
  }

  function submitGuess(
    yearGuess: string,
    guessCoords: Coordinates | null
  ): GuessResult {
    if (!currentGame || !currentPicture) {
      return { ok: false, message: "Start a game first." };
    }

    const parsedYear = Number.parseInt(yearGuess, 10);
    if (!parsedYear || !guessCoords) {
      return {
        ok: false,
        message: "Please enter a year and click on the map to make your location guess.",
      };
    }

    const result = buildRoundResult(currentPicture, parsedYear, guessCoords);

    setTotalScore((prev) => prev + result.roundScore);
    setGameResults((prev) => [...prev, result]);
    setRoundResults(result);

    return { ok: true, result };
  }

  function nextRound(): NextRoundResult {
    setRoundResults(null);

    const next = currentRound + 1;
    if (next >= 5) {
      setPlayPhase("end");
      return { finished: true };
    }

    setCurrentRound(next);
    return { finished: false };
  }

  function restartGame(): void {
    setCurrentGame(null);
    setCurrentRound(0);
    setTotalScore(0);
    setGameResults([]);
    setRoundResults(null);
    setPlayPhase("start");
  }

  function clearAllData(): void {
    setPictures([]);
    setGameSets([]);
    refreshDebugInfo();
  }

  return {
    pictures,
    gameSets,
    currentGame,
    currentRound,
    currentPicture,
    totalScore,
    gameResults,
    playPhase,
    roundResults,
    debugLastUpdate,
    refreshDebugInfo,
    loadGameData,
    addPicture,
    deletePicture,
    addGameSet,
    deleteGameSet,
    startRandomGame,
    playGameSet,
    submitGuess,
    nextRound,
    restartGame,
    clearAllData,
  };
}
