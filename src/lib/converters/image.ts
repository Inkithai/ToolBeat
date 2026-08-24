export type RasterMimeType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Canvas-based raster conversion.
 *
 * Extracted verbatim from the conversion client so image conversions no longer
 * live in a UI component — and, more importantly, so loading this module does
 * not drag in the YAML, CSV, XML and DOCX parsers that used to be statically
 * imported alongside it.
 */
export async function convertImage(
  file: File,
  mimeType: RasterMimeType,
  quality: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    const cleanUp = () => URL.revokeObjectURL(imageUrl);

    image.onload = () => {
      try {
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        if (!width || !height) throw new Error("The image has no readable dimensions.");
        if (width * height > 40_000_000) {
          throw new Error("This image is too large to convert safely in the browser (maximum 40 megapixels).");
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not supported by this browser.");

        // JPG cannot store transparency. A white background avoids the black
        // background browsers otherwise produce for transparent PNG/WebP files.
        if (mimeType === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          cleanUp();
          if (blob && blob.type === mimeType) resolve(blob);
          else reject(new Error(`This browser could not export ${mimeType.replace("image/", "").toUpperCase()}.`));
        }, mimeType, quality);
      } catch (error) {
        cleanUp();
        reject(error);
      }
    };
    image.onerror = () => {
      cleanUp();
      reject(new Error("The image could not be decoded. It may be damaged or unsupported by this browser."));
    };
    image.src = imageUrl;
  });
}
