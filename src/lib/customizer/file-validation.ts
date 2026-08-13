import {
  CUSTOMIZER_ALLOWED_MIME_TYPES,
  type CustomizerAllowedMimeType,
} from "@/types/customizer";

export const CUSTOMIZER_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const CUSTOMIZER_MAX_PIXELS = 25_000_000;

export type FileValidationErrorCode =
  | "invalid-type"
  | "file-too-large"
  | "invalid-signature"
  | "decode-failed"
  | "invalid-dimensions"
  | "too-many-pixels";

export class CustomizerFileError extends Error {
  readonly code: FileValidationErrorCode;

  constructor(
    code: FileValidationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CustomizerFileError";
    this.code = code;
  }
}

function hasPngSignature(bytes: Uint8Array) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  return signature.every((byte, index) => bytes[index] === byte);
}

function hasJpegSignature(bytes: Uint8Array) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function hasWebpSignature(bytes: Uint8Array) {
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export function isAllowedCustomizerMimeType(
  mimeType: string,
): mimeType is CustomizerAllowedMimeType {
  return CUSTOMIZER_ALLOWED_MIME_TYPES.some((allowed) => allowed === mimeType);
}

export function matchesDeclaredImageSignature(
  mimeType: CustomizerAllowedMimeType,
  bytes: Uint8Array,
) {
  if (mimeType === "image/png") return hasPngSignature(bytes);
  if (mimeType === "image/jpeg") return hasJpegSignature(bytes);
  return hasWebpSignature(bytes);
}

export async function validateCustomizerFileEnvelope(file: File) {
  if (!isAllowedCustomizerMimeType(file.type)) {
    throw new CustomizerFileError(
      "invalid-type",
      "Usa una imagen PNG, JPEG o WebP. SVG y otros formatos no están permitidos.",
    );
  }

  if (file.size > CUSTOMIZER_MAX_FILE_BYTES) {
    throw new CustomizerFileError(
      "file-too-large",
      "La imagen supera 10 MiB. Reduce su tamaño e inténtalo de nuevo.",
    );
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!matchesDeclaredImageSignature(file.type, header)) {
    throw new CustomizerFileError(
      "invalid-signature",
      "El contenido no coincide con un PNG, JPEG o WebP válido. Exporta la imagen de nuevo.",
    );
  }

  return file.type;
}

export function validateDecodedDimensions(width: number, height: number) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new CustomizerFileError(
      "invalid-dimensions",
      "No fue posible obtener dimensiones válidas de la imagen.",
    );
  }

  if (width > CUSTOMIZER_MAX_PIXELS / height) {
    throw new CustomizerFileError(
      "too-many-pixels",
      "La imagen supera 25 megapíxeles. Reduce su resolución e inténtalo de nuevo.",
    );
  }
}
