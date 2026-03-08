import type { GameData, GameSet, Picture } from '@/lib/types';

declare global {
  interface Window {
    electronAPI?: {
      loadAppData: () => Promise<GameData>;
      saveAppData: (payload: { pictures: Picture[]; gameSets: GameSet[] }) => Promise<{ ok: boolean }>;
      clearAppData: () => Promise<{ ok: boolean }>;
      saveImageFromDataUrl: (payload: { dataUrl: string; pictureId: number }) => Promise<{ fileName: string }>;
      openJsonDialog: () => Promise<{ canceled: boolean; text?: string }>;
      saveJsonDialog: (jsonText: string) => Promise<{ canceled: boolean }>;
    };
  }
}

export {};
