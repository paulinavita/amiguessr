"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { CircleMarker, LeafletMouseEvent, Map as LeafletMap } from "leaflet";

import type { Coordinates, RoundResult, TabKey } from "@/lib/types";

type LeafletModule = typeof import("leaflet");

interface UseLeafletMapsArgs {
  activeTab: TabKey;
  playPhase: string;
  onAdminMapClick: (coords: Coordinates) => void;
  onGameMapClick: (coords: Coordinates) => void;
  defaultView: [number, number];
  defaultZoom: number;
}

interface UseLeafletMapsResult {
  adminMapElRef: RefObject<HTMLDivElement | null>;
  gameMapElRef: RefObject<HTMLDivElement | null>;
  clearRoundMarkers: () => void;
  clearAdminSelectionMarker: () => void;
  showActualMarker: (result: RoundResult) => void;
  resetGameMapView: () => void;
}

export function useLeafletMaps({
  activeTab,
  playPhase,
  onAdminMapClick,
  onGameMapClick,
  defaultView,
  defaultZoom,
}: UseLeafletMapsArgs): UseLeafletMapsResult {
  const leafletRef = useRef<LeafletModule | null>(null);
  const adminMapRef = useRef<LeafletMap | null>(null);
  const gameMapRef = useRef<LeafletMap | null>(null);
  const adminMarkerRef = useRef<CircleMarker | null>(null);
  const guessMarkerRef = useRef<CircleMarker | null>(null);
  const actualMarkerRef = useRef<CircleMarker | null>(null);

  const adminMapElRef = useRef<HTMLDivElement | null>(null);
  const gameMapElRef = useRef<HTMLDivElement | null>(null);

  const ensureAdminMapMounted = useCallback((): void => {
    const L = leafletRef.current;
    if (!L || !adminMapElRef.current) return;

    if (
      adminMapRef.current &&
      !document.body.contains(adminMapRef.current.getContainer())
    ) {
      adminMapRef.current.remove();
      adminMapRef.current = null;
      adminMarkerRef.current = null;
    }
    if (adminMapRef.current) return;

    adminMapRef.current = L.map(adminMapElRef.current, {
      zoomSnap: 0.25,
      minZoom: 1,
    }).setView(defaultView, defaultZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(adminMapRef.current);

    adminMapRef.current.on("click", (e: LeafletMouseEvent) => {
      onAdminMapClick(e.latlng);

      if (adminMarkerRef.current) {
        adminMapRef.current?.removeLayer(adminMarkerRef.current);
      }

      adminMarkerRef.current = L.circleMarker(e.latlng, {
        radius: 8,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 1,
      }).addTo(adminMapRef.current!);
    });
  }, [defaultView, defaultZoom, onAdminMapClick]);

  const ensureGameMapMounted = useCallback((): void => {
    const L = leafletRef.current;
    if (!L || !gameMapElRef.current) return;

    if (gameMapRef.current && !document.body.contains(gameMapRef.current.getContainer())) {
      gameMapRef.current.remove();
      gameMapRef.current = null;
      guessMarkerRef.current = null;
      actualMarkerRef.current = null;
    }
    if (gameMapRef.current) return;

    gameMapRef.current = L.map(gameMapElRef.current, {
      zoomSnap: 0.25,
      minZoom: 1,
    }).setView(defaultView, defaultZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(gameMapRef.current);

    gameMapRef.current.on("click", (e: LeafletMouseEvent) => {
      if (guessMarkerRef.current) {
        gameMapRef.current?.removeLayer(guessMarkerRef.current);
      }

      guessMarkerRef.current = L.circleMarker(e.latlng, {
        radius: 8,
        color: "#0f766e",
        fillColor: "#14b8a6",
        fillOpacity: 1,
      }).addTo(gameMapRef.current!);

      onGameMapClick(e.latlng);
    });
  }, [defaultView, defaultZoom, onGameMapClick]);

  useEffect(() => {
    let mounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");
      if (!mounted) return;

      leafletRef.current = L;
      ensureAdminMapMounted();
      ensureGameMapMounted();
    }

    void initLeaflet();

    return () => {
      mounted = false;
      adminMapRef.current?.remove();
      adminMapRef.current = null;
      gameMapRef.current?.remove();
      gameMapRef.current = null;
    };
  }, [ensureAdminMapMounted, ensureGameMapMounted]);

  useEffect(() => {
    ensureAdminMapMounted();
    ensureGameMapMounted();

    let raf1: number | null = null;
    let raf2: number | null = null;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (activeTab === "admin") {
          adminMapRef.current?.invalidateSize();
        }
        if (activeTab === "play") {
          gameMapRef.current?.invalidateSize();
        }
      });
    });

    return () => {
      if (raf1 !== null) cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, [activeTab, playPhase, ensureAdminMapMounted, ensureGameMapMounted]);

  const clearRoundMarkers = useCallback((): void => {
    if (gameMapRef.current && guessMarkerRef.current) {
      gameMapRef.current.removeLayer(guessMarkerRef.current);
      guessMarkerRef.current = null;
    }

    if (gameMapRef.current && actualMarkerRef.current) {
      gameMapRef.current.removeLayer(actualMarkerRef.current);
      actualMarkerRef.current = null;
    }
  }, []);

  const clearAdminSelectionMarker = useCallback((): void => {
    if (adminMapRef.current && adminMarkerRef.current) {
      adminMapRef.current.removeLayer(adminMarkerRef.current);
      adminMarkerRef.current = null;
    }
  }, []);

  const showActualMarker = useCallback((result: RoundResult): void => {
    const L = leafletRef.current;
    if (!L || !gameMapRef.current || !guessMarkerRef.current) return;

    if (actualMarkerRef.current) {
      gameMapRef.current.removeLayer(actualMarkerRef.current);
    }

    actualMarkerRef.current = L.circleMarker(
      [result.picture.lat, result.picture.lng],
      {
        radius: 9,
        color: "#b91c1c",
        fillColor: "#ef4444",
        fillOpacity: 1,
      }
    ).addTo(gameMapRef.current);

    const bounds = L.featureGroup([guessMarkerRef.current, actualMarkerRef.current]).getBounds();
    gameMapRef.current.fitBounds(bounds, { padding: [36, 36] });
  }, []);

  const resetGameMapView = useCallback((): void => {
    gameMapRef.current?.setView(defaultView, defaultZoom);
  }, [defaultView, defaultZoom]);

  return {
    adminMapElRef,
    gameMapElRef,
    clearRoundMarkers,
    clearAdminSelectionMarker,
    showActualMarker,
    resetGameMapView,
  };
}
