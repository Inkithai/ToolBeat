/**
 * Browser-side image loading and canvas export for the image tools.
 *
 * These functions are inherently client-only (File, Image, canvas); the
 * dimension math they rely on lives in `image-ops` and is unit-tested.
 */

import { maxScaleForPixelLimit } from "./image-ops";

export type LoadedImage = {
  image: HTMLImageElement;
  url: string;
  width: number;
  height: number;
};

/** Decode an image File into a drawable element. Revoke with `revoke`. */
export function loadImageFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (!width || !height) {
        URL.revokeObjectURL(url);
        reject(new Error("The image has no readable dimensions."));
        return;
      }
      resolve({ image, url, width, height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be decoded. It may be damaged or unsupported by this browser."));
    };
    image.src = url;
  });
}

export function revokeLoadedImage(loaded: LoadedImage | null): void {
  if (loaded) URL.revokeObjectURL(loaded.url);
}

export type CanvasExport = {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
};

/**
 * Draw the loaded image onto a canvas at the target dimensions and export it.
 * Transparency is preserved except for JPEG, which gets a white background
 * (matching the converters' behavior).
 */
export function exportImage(
  loaded: LoadedImage,
  targetWidth: number,
  targetHeight: number,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  quality: number,
): Promise<CanvasExport> {
  const scale = maxScaleForPixelLimit(targetWidth, targetHeight);
  const width = Math.max(1, Math.round(targetWidth * scale));
  const height = Math.max(1, Math.round(targetHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is not supported by this browser."));

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(loaded.image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`This browser could not export ${mimeType.split("/")[1].toUpperCase()}.`));
          return;
        }
        const reader = new FileReader();
        reader.onload = () =>
          resolve({ blob, dataUrl: String(reader.result), width, height });
        reader.onerror = () => reject(new Error("The exported image could not be read back."));
        reader.readAsDataURL(blob);
      },
      mimeType,
      quality,
    );
  });
}
