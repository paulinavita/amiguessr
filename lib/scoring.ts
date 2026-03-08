import type { Coordinates, Picture, RoundResult } from "@/lib/types";

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateYearScore(yearDiff: number): number {
  if (yearDiff === 0) return 5000;
  if (yearDiff === 1) return 4600;
  if (yearDiff === 2) return 4300;
  if (yearDiff === 3) return 4000;
  if (yearDiff === 4) return 3700;
  if (yearDiff === 5) return 3400;
  if (yearDiff >= 6 && yearDiff <= 8) return 2400;
  if (yearDiff >= 9 && yearDiff <= 12) return 2000;
  if (yearDiff >= 13 && yearDiff <= 18) return 2000;
  return 0;
}

export function calculateDistanceScore(distanceKm: number): number {
  const distanceInMeters = distanceKm * 1000;

  if (distanceInMeters <= 50) return 5000;
  if (distanceInMeters <= 1000) return 5000 - distanceInMeters * 0.02;
  if (distanceInMeters <= 5000) return 4980 - distanceInMeters * 0.016;
  if (distanceInMeters <= 100000) return 4900 - distanceInMeters * 0.004;
  if (distanceInMeters <= 1000000) return 4500 - distanceInMeters * 0.001;
  if (distanceInMeters <= 2000000) return 3500 - distanceInMeters * 0.0005;
  if (distanceInMeters <= 3000000) return 2500 - distanceInMeters * 0.00033333;
  if (distanceInMeters <= 6000000) return 1500 - distanceInMeters * 0.0002;

  return 12;
}

export function buildRoundResult(
  picture: Picture,
  yearGuess: number,
  guessCoords: Coordinates
): RoundResult {
  const yearDiff = Math.abs(yearGuess - picture.year);
  const distance = calculateDistanceKm(
    picture.lat,
    picture.lng,
    guessCoords.lat,
    guessCoords.lng
  );

  const yearScore = Math.round(calculateYearScore(yearDiff));
  const distanceScore = Math.round(calculateDistanceScore(distance));
  const roundScore = Math.round(yearScore + distanceScore);

  return {
    picture,
    yearGuess,
    locationGuess: guessCoords,
    yearScore,
    distanceScore,
    roundScore,
    distance,
    yearDiff,
  };
}
