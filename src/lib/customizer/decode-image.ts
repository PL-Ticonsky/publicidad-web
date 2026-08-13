import {
  CustomizerFileError,
  validateCustomizerFileEnvelope,
  validateDecodedDimensions,
} from "@/lib/customizer/file-validation";

export type DecodedCustomizerImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

async function decodeWithImageElement(file: File): Promise<DecodedCustomizerImage> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = objectUrl;

  try {
    await image.decode();
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    validateDecodedDimensions(width, height);
    URL.revokeObjectURL(objectUrl);

    return {
      source: image,
      width,
      height,
      dispose: () => {
        image.src = "";
      },
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    image.src = "";
    if (error instanceof CustomizerFileError) throw error;
    throw new CustomizerFileError(
      "decode-failed",
      "El navegador no pudo leer la imagen. Comprueba el archivo o expórtalo de nuevo.",
    );
  }
}

export async function decodeCustomizerImage(
  file: File,
): Promise<DecodedCustomizerImage> {
  await validateCustomizerFileEnvelope(file);

  if (typeof createImageBitmap !== "function") {
    return decodeWithImageElement(file);
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const decodedBitmap = bitmap;
    validateDecodedDimensions(decodedBitmap.width, decodedBitmap.height);
    return {
      source: decodedBitmap,
      width: decodedBitmap.width,
      height: decodedBitmap.height,
      dispose: () => decodedBitmap.close(),
    };
  } catch (error) {
    bitmap?.close();
    if (error instanceof CustomizerFileError) throw error;
    throw new CustomizerFileError(
      "decode-failed",
      "El navegador no pudo leer la imagen. Comprueba el archivo o expórtalo de nuevo.",
    );
  }
}
