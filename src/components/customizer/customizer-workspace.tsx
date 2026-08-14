"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { decodeCustomizerImage, type DecodedCustomizerImage } from "@/lib/customizer/decode-image";
import { CustomizerFileError } from "@/lib/customizer/file-validation";
import {
  renderCustomizerEmptyState,
  renderCustomizerPreview,
} from "@/lib/customizer/render-preview";
import {
  loadCustomizerTemplateLayers,
  type LoadedCustomizerLayers,
} from "@/lib/customizer/template-assets";
import {
  clampCustomizerTransform,
  cssDeltaToCanvasDelta,
  INITIAL_CUSTOMIZER_TRANSFORM,
} from "@/lib/customizer/transform";
import type {
  CustomizerPreview,
  CustomizerTemplate,
  CustomizerTransform,
  ProductCustomizerProps,
} from "@/types/customizer";

type FileState =
  | { status: "empty" }
  | { status: "processing" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | {
      status: "ready";
      fileName: string;
      image: DecodedCustomizerImage;
    };

type LayerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; layers: LoadedCustomizerLayers };

type DragState = {
  pointerId: number;
  clientX: number;
  clientY: number;
};

const MOVEMENT_STEP = 12;

function downloadFileName(sourceFileName: string) {
  const baseName = sourceFileName.replace(/\.[^.]+$/, "");
  const safeName = baseName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${safeName || "arte"}-previsualizacion.png`;
}

function statusMessage(fileState: FileState) {
  if (fileState.status === "processing") return "Procesando la imagen en este dispositivo…";
  if (fileState.status === "ready") return "Imagen lista para ajustar.";
  if (fileState.status === "empty") return "Carga una imagen para comenzar.";
  return fileState.message;
}

export function CustomizerWorkspace({
  template,
  onPreviewChange,
}: {
  template: CustomizerTemplate;
  onPreviewChange?: ProductCustomizerProps["onPreviewChange"];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const componentId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callbackRef = useRef(onPreviewChange);
  const imageRevisionRef = useRef(0);
  const renderRevisionRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const currentImageRef = useRef<DecodedCustomizerImage | null>(null);
  const retiredImagesRef = useRef<DecodedCustomizerImage[]>([]);
  const currentPreviewRef = useRef<CustomizerPreview | null>(null);

  const [fileState, setFileState] = useState<FileState>({ status: "empty" });
  const [layerState, setLayerState] = useState<LayerState>({ status: "loading" });
  const [transform, setTransform] = useState<CustomizerTransform>({
    ...INITIAL_CUSTOMIZER_TRANSFORM,
  });
  const [preview, setPreview] = useState<CustomizerPreview | null>(null);
  const [previewIsCurrent, setPreviewIsCurrent] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    callbackRef.current = onPreviewChange;
  }, [onPreviewChange]);

  const releasePreview = useCallback((notify = true) => {
    renderRevisionRef.current += 1;
    const currentPreview = currentPreviewRef.current;
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview.previewObjectUrl);
      currentPreviewRef.current = null;
    }
    setPreview(null);
    setPreviewIsCurrent(false);
    if (notify) callbackRef.current?.(null);
  }, []);

  const retireCurrentImage = useCallback(() => {
    if (currentImageRef.current) {
      retiredImagesRef.current.push(currentImageRef.current);
    }
    currentImageRef.current = null;
  }, []);

  useEffect(() => {
    const retiredImages = retiredImagesRef.current.splice(0);
    for (const image of retiredImages) image.dispose();
  }, [fileState]);

  useEffect(() => {
    let active = true;
    let loadedLayers: LoadedCustomizerLayers | null = null;
    void loadCustomizerTemplateLayers(template)
      .then((layers) => {
        if (!active) {
          layers.dispose();
          return;
        }
        loadedLayers = layers;
        setLayerState({ status: "ready", layers });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLayerState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "No fue posible preparar la previsualización.",
        });
      });

    return () => {
      active = false;
      loadedLayers?.dispose();
    };
  }, [template]);

  useEffect(() => {
    const retiredImages = retiredImagesRef.current;
    return () => {
      imageRevisionRef.current += 1;
      currentImageRef.current?.dispose();
      currentImageRef.current = null;
      const imagesToDispose = retiredImages.splice(0);
      for (const image of imagesToDispose) image.dispose();
      renderRevisionRef.current += 1;
      const currentPreview = currentPreviewRef.current;
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview.previewObjectUrl);
        currentPreviewRef.current = null;
      }
      callbackRef.current?.(null);
    };
  }, []);

  useEffect(() => {
    if (layerState.status !== "ready") return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    if (fileState.status !== "ready") {
      renderCustomizerEmptyState(context, template, layerState.layers);
      return;
    }

    const revision = ++renderRevisionRef.current;
    const imageRevision = imageRevisionRef.current;
    renderCustomizerPreview(
      context,
      template,
      fileState.image,
      transform,
      layerState.layers,
    );

    canvas.toBlob((blob) => {
      if (
        revision !== renderRevisionRef.current ||
        imageRevision !== imageRevisionRef.current
      ) {
        return;
      }
      if (!blob) {
        releasePreview();
        setExportError(
          "No fue posible generar el PNG. Inténtalo de nuevo en un navegador actualizado.",
        );
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const nextPreview: CustomizerPreview = {
        productSlug: template.productSlug,
        sourceFileName: fileState.fileName,
        previewBlob: blob,
        previewObjectUrl: objectUrl,
        width: template.canvas.width,
        height: template.canvas.height,
      };
      const previousPreview = currentPreviewRef.current;
      currentPreviewRef.current = nextPreview;
      setPreview(nextPreview);
      setPreviewIsCurrent(true);
      if (previousPreview) URL.revokeObjectURL(previousPreview.previewObjectUrl);
      callbackRef.current?.(nextPreview);
    }, "image/png");
  }, [fileState, layerState, releasePreview, template, transform]);

  const selectFile = async (file: File) => {
    const revision = ++imageRevisionRef.current;
    retireCurrentImage();
    releasePreview();
    setTransform({ ...INITIAL_CUSTOMIZER_TRANSFORM });
    setExportError(null);
    setFileState({ status: "processing" });

    try {
      const decodedImage = await decodeCustomizerImage(file);
      if (revision !== imageRevisionRef.current) {
        decodedImage.dispose();
        return;
      }
      currentImageRef.current = decodedImage;
      setFileState({
        status: "ready",
        fileName: file.name,
        image: decodedImage,
      });
    } catch (error) {
      if (revision !== imageRevisionRef.current) return;
      setFileState({
        status: error instanceof CustomizerFileError ? "invalid" : "error",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar la imagen. Inténtalo de nuevo.",
      });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void selectFile(file);
  };

  const removeImage = () => {
    imageRevisionRef.current += 1;
    retireCurrentImage();
    releasePreview();
    setTransform({ ...INITIAL_CUSTOMIZER_TRANSFORM });
    setExportError(null);
    setFileState({ status: "empty" });
    fileInputRef.current?.focus();
  };

  const updateTransform = (
    update: (current: CustomizerTransform) => CustomizerTransform,
  ) => {
    releasePreview();
    setExportError(null);
    setTransform((current) =>
      clampCustomizerTransform(update(current), template.printArea),
    );
  };

  const moveDesign = (x: number, y: number) => {
    updateTransform((current) => ({
      ...current,
      offsetX: current.offsetX + x,
      offsetY: current.offsetY + y,
    }));
  };

  const resetTransform = () => {
    updateTransform(() => ({ ...INITIAL_CUSTOMIZER_TRANSFORM }));
  };

  const centerDesign = () => {
    updateTransform((current) => ({
      ...current,
      offsetX: 0,
      offsetY: 0,
    }));
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (fileState.status !== "ready" || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const delta = cssDeltaToCanvasDelta(
      { x: event.clientX - drag.clientX, y: event.clientY - drag.clientY },
      template.canvas,
      bounds,
    );
    dragRef.current = {
      ...drag,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    moveDesign(delta.x, delta.y);
  };

  const endPointerGesture = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (fileState.status !== "ready") return;
    const step = event.shiftKey ? 25 : MOVEMENT_STEP;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    moveDesign(delta[0], delta[1]);
  };

  const downloadPreview = () => {
    if (!preview || !previewIsCurrent) return;
    const link = document.createElement("a");
    link.href = preview.previewObjectUrl;
    link.download = downloadFileName(preview.sourceFileName);
    link.click();
  };

  const ready = fileState.status === "ready";
  const statusIsError =
    fileState.status === "invalid" ||
    fileState.status === "error" ||
    layerState.status === "error" ||
    exportError !== null;
  const printAreaStyle = {
    left: `${(template.printArea.x / template.canvas.width) * 100}%`,
    top: `${(template.printArea.y / template.canvas.height) * 100}%`,
    width: `${(template.printArea.width / template.canvas.width) * 100}%`,
    height: `${(template.printArea.height / template.canvas.height) * 100}%`,
    borderRadius:
      template.printArea.shape === "ellipse"
        ? "50%"
        : `${((template.printArea.borderRadius ?? 0) / template.canvas.width) * 100}%`,
  };

  return (
    <section
      aria-labelledby={`${componentId}-title`}
      className="min-w-0 border border-[var(--line-soft)] bg-white p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-[var(--line-soft)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Previsualización orientativa</p>
          <h2 id={`${componentId}-title`} className="mt-2 text-2xl">
            Personaliza {template.productName}
          </h2>
        </div>
        {template.visualStatus === "fixture" ? (
          <span className="font-technical self-start border border-[var(--signal)] px-3 py-1 text-[10px] uppercase text-[var(--signal)]">
            Demo · fixture no comercial
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {template.limitation} La imagen se procesa únicamente en este navegador y no se guarda ni se envía.
      </p>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,.65fr)]">
        <div className="min-w-0">
          <div
            className="relative w-full overflow-hidden border border-[var(--line)] bg-[var(--stone)]"
            style={{ aspectRatio: `${template.canvas.width} / ${template.canvas.height}` }}
          >
            <canvas
              ref={canvasRef}
              width={template.canvas.width}
              height={template.canvas.height}
              tabIndex={ready ? 0 : -1}
              aria-label="Lienzo de previsualización. Arrastra la imagen o usa las flechas del teclado para moverla."
              className={`block h-auto w-full select-none ${ready ? "cursor-move focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--signal)]" : ""}`}
              style={{ touchAction: "none" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endPointerGesture}
              onPointerCancel={endPointerGesture}
              onLostPointerCapture={() => {
                dragRef.current = null;
              }}
              onKeyDown={handleCanvasKeyDown}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border-2 border-dashed border-[var(--signal)] shadow-[0_0_0_1px_rgba(255,255,255,.85)]"
              style={printAreaStyle}
            />
            {!ready ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
                <span className="max-w-xs bg-white/90 px-4 py-3 text-sm font-semibold text-[var(--ink)]">
                  Área imprimible de demostración. Carga una imagen para verla recortada dentro de la guía.
                </span>
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            La línea discontinua identifica el área imprimible y no forma parte de los controles descargados.
          </p>
        </div>

        <div className="min-w-0 space-y-5">
          <div>
            <label
              htmlFor={`${componentId}-file`}
              className="font-technical text-xs font-semibold uppercase tracking-[.05em]"
            >
              Imagen PNG, JPEG o WebP
            </label>
            <input
              ref={fileInputRef}
              id={`${componentId}-file`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={fileState.status === "processing"}
              className="mt-2 block min-h-12 w-full min-w-0 border border-[var(--line)] bg-white p-2 text-sm file:mr-3 file:min-h-9 file:border-0 file:bg-[var(--ink)] file:px-3 file:text-xs file:font-semibold file:uppercase file:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-[var(--muted)]">Máximo 10 MiB y 25 megapíxeles. SVG no permitido.</p>
            {fileState.status === "ready" ? (
              <p className="mt-2 min-w-0 text-xs text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">Archivo actual:</span>{" "}
                <span className="break-all">{fileState.fileName}</span>
              </p>
            ) : null}
          </div>

          <div
            role={statusIsError ? "alert" : "status"}
            aria-live={statusIsError ? "assertive" : "polite"}
            className={`border-l-3 px-3 py-2 text-sm ${statusIsError ? "border-[var(--error)] bg-[var(--error-surface)] text-[var(--error)]" : "border-[var(--line)] bg-[var(--stone)] text-[var(--muted)]"}`}
          >
            {layerState.status === "error"
              ? layerState.message
              : exportError ?? statusMessage(fileState)}
          </div>

          <fieldset disabled={!ready} className="space-y-4 disabled:opacity-55">
            <legend className="font-technical text-xs font-semibold uppercase tracking-[.05em]">Ajustes</legend>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`${componentId}-zoom`} className="text-sm font-semibold">Zoom</label>
                <output htmlFor={`${componentId}-zoom`} className="tabular-nums text-sm">{Math.round(transform.zoom * 100)}%</output>
              </div>
              <input
                id={`${componentId}-zoom`}
                type="range"
                min="25"
                max="400"
                step="5"
                value={Math.round(transform.zoom * 100)}
                onChange={(event) => {
                  const zoom = Number(event.target.value) / 100;
                  updateTransform((current) => ({ ...current, zoom }));
                }}
                className="mt-2 min-h-11 w-full accent-[var(--signal)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`${componentId}-rotation`} className="text-sm font-semibold">Rotación</label>
                <output htmlFor={`${componentId}-rotation`} className="tabular-nums text-sm">{transform.rotationDegrees}°</output>
              </div>
              <input
                id={`${componentId}-rotation`}
                type="range"
                min="-180"
                max="180"
                step="1"
                value={transform.rotationDegrees}
                onChange={(event) => {
                  const rotationDegrees = Number(event.target.value);
                  updateTransform((current) => ({ ...current, rotationDegrees }));
                }}
                className="mt-2 min-h-11 w-full accent-[var(--signal)]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">Mover sin arrastrar</p>
              <div className="mt-2 grid grid-cols-3 gap-2" aria-label="Controles para mover la imagen">
                <span />
                <Button type="button" variant="outline" aria-label="Mover imagen arriba" onClick={() => moveDesign(0, -MOVEMENT_STEP)}>↑</Button>
                <span />
                <Button type="button" variant="outline" aria-label="Mover imagen a la izquierda" onClick={() => moveDesign(-MOVEMENT_STEP, 0)}>←</Button>
                <Button type="button" variant="outline" aria-label="Centrar imagen" onClick={centerDesign}>●</Button>
                <Button type="button" variant="outline" aria-label="Mover imagen a la derecha" onClick={() => moveDesign(MOVEMENT_STEP, 0)}>→</Button>
                <span />
                <Button type="button" variant="outline" aria-label="Mover imagen abajo" onClick={() => moveDesign(0, MOVEMENT_STEP)}>↓</Button>
                <span />
              </div>
              <Button type="button" variant="outline" className="mt-2 w-full" onClick={resetTransform}>
                Restablecer ajustes
              </Button>
            </div>
          </fieldset>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Button type="button" variant="secondary" disabled={!preview || !previewIsCurrent} onClick={downloadPreview}>
              {ready && !previewIsCurrent ? "Preparando PNG…" : "Descargar PNG"}
            </Button>
            <Button type="button" variant="outline" disabled={!ready && fileState.status !== "invalid" && fileState.status !== "error"} onClick={removeImage}>
              Eliminar imagen
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
