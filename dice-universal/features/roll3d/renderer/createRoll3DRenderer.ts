import type { ExpoWebGLRenderingContext } from "expo-gl";
import * as THREE from "three";

type ExpoCompatibleCanvas = {
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  style: Record<string, unknown>;
  addEventListener: () => void;
  removeEventListener: () => void;
  setAttribute: () => void;
};

export function createRoll3DRenderer(
  gl: ExpoWebGLRenderingContext,
): THREE.WebGLRenderer {
  const canvas: ExpoCompatibleCanvas = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    clientWidth: gl.drawingBufferWidth,
    clientHeight: gl.drawingBufferHeight,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as unknown as HTMLCanvasElement,
    context: gl as unknown as WebGLRenderingContext,
  });

  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);

  return renderer;
}
