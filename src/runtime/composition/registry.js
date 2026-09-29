import { CompositionEngine } from "./CompositionEngine.js?v=20260929-2350";
import { OceanEffect } from "../OceanEffect.js?v=20260929-2350";
import { ShipEffect } from "../ShipEffect.js?v=20260929-2350";

export function createCompositionEngine(runtime) {
  return new CompositionEngine(runtime, {
    ocean: OceanEffect,
    ship: ShipEffect
  });
}
