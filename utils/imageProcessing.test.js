import { describe, it, expect } from "vitest";
import { computeScaledDimensions } from "./imageProcessing";

describe("computeScaledDimensions", () => {
  it("does not upscale an image already under the max dimension", () => {
    expect(computeScaledDimensions(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales down a landscape image preserving aspect ratio", () => {
    expect(computeScaledDimensions(3200, 1600, 1600)).toEqual({ width: 1600, height: 800 });
  });

  it("scales down a portrait image preserving aspect ratio", () => {
    expect(computeScaledDimensions(1600, 3200, 1600)).toEqual({ width: 800, height: 1600 });
  });

  it("scales a non-round ratio without distortion (width/height stay proportional)", () => {
    const { width, height } = computeScaledDimensions(4000, 3000, 320);
    expect(width).toBe(320);
    expect(height).toBe(240);
  });

  it("returns zero dimensions for invalid input", () => {
    expect(computeScaledDimensions(0, 100, 1600)).toEqual({ width: 0, height: 0 });
    expect(computeScaledDimensions(100, 0, 1600)).toEqual({ width: 0, height: 0 });
    expect(computeScaledDimensions(100, 100, 0)).toEqual({ width: 0, height: 0 });
  });
});
