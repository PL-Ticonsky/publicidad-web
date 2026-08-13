"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CustomizerPreview } from "@/components/customizer";

type PreviewState = {
  preview: CustomizerPreview | null;
  downloaded: boolean;
};

type CustomizerPreviewContextValue = PreviewState & {
  confirmPreview: (preview: CustomizerPreview | null) => boolean;
  downloadPreviewOnce: (productSlug: string) => CustomizerPreview | null;
};

const CustomizerPreviewContext = createContext<CustomizerPreviewContextValue | null>(null);

function isReadyPreview(preview: CustomizerPreview) {
  return preview.productSlug.length > 0
    && preview.previewBlob.size > 0
    && preview.previewBlob.type === "image/png"
    && Number.isSafeInteger(preview.width)
    && preview.width > 0
    && Number.isSafeInteger(preview.height)
    && preview.height > 0;
}

export function CustomizerPreviewProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<PreviewState>({ preview: null, downloaded: false });
  const [state, setState] = useState<PreviewState>({ preview: null, downloaded: false });

  const replaceState = useCallback((nextState: PreviewState) => {
    const previousUrl = stateRef.current.preview?.previewObjectUrl;
    stateRef.current = nextState;
    setState(nextState);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  }, []);

  const confirmPreview = useCallback((preview: CustomizerPreview | null) => {
    if (!preview) {
      replaceState({ preview: null, downloaded: false });
      return true;
    }
    if (!isReadyPreview(preview)) return false;

    try {
      const ownedPreview = {
        ...preview,
        previewObjectUrl: URL.createObjectURL(preview.previewBlob),
      };
      replaceState({ preview: ownedPreview, downloaded: false });
      return true;
    } catch {
      return false;
    }
  }, [replaceState]);

  const downloadPreviewOnce = useCallback((productSlug: string) => {
    const current = stateRef.current;
    if (!current.preview || current.preview.productSlug !== productSlug || current.downloaded) {
      return null;
    }

    const nextState = { ...current, downloaded: true };
    stateRef.current = nextState;
    setState(nextState);
    return current.preview;
  }, []);

  useEffect(() => () => {
    const currentUrl = stateRef.current.preview?.previewObjectUrl;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
  }, []);

  const value = useMemo<CustomizerPreviewContextValue>(() => ({
    ...state,
    confirmPreview,
    downloadPreviewOnce,
  }), [confirmPreview, downloadPreviewOnce, state]);

  return (
    <CustomizerPreviewContext.Provider value={value}>
      {children}
    </CustomizerPreviewContext.Provider>
  );
}

export function useCustomizerPreview() {
  const context = useContext(CustomizerPreviewContext);
  if (!context) throw new Error("useCustomizerPreview requiere CustomizerPreviewProvider.");
  return context;
}
