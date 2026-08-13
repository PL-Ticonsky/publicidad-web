"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { buttonClass } from "@/components/ui/button";
import styles from "./promotion-splash.module.css";

const PROMOTION_STORAGE_KEY = "tinta:promotion:llavero:seen";

interface PromotionSplashProps {
  productName: string;
  productReference?: string;
  productHref: string;
  imageSrc: string;
  imageAlt: string;
  whatsappUrl: string | null;
}

export function PromotionSplash({
  productName,
  productReference,
  productHref,
  imageSrc,
  imageAlt,
  whatsappUrl,
}: PromotionSplashProps) {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const markAsSeen = useCallback(() => {
    try {
      sessionStorage.setItem(PROMOTION_STORAGE_KEY, "seen");
    } catch {
      // Ignore storage restrictions and keep the actions usable.
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const previous = returnFocusRef.current;
    const fallback = document.querySelector<HTMLElement>('a[href="/"]');
    requestAnimationFrame(() => {
      if (previous && previous !== document.body && document.contains(previous)) previous.focus();
      else fallback?.focus();
    });
  }, []);

  const dismiss = useCallback((shouldRestoreFocus: boolean) => {
    markAsSeen();
    setVisible(false);
    if (shouldRestoreFocus) restoreFocus();
  }, [markAsSeen, restoreFocus]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PROMOTION_STORAGE_KEY) === "seen") return;
    } catch {
      // The promotion still works when storage is unavailable; it simply cannot persist the session flag.
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const revealFrame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(revealFrame);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => initialFocusRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss(true);
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [dismiss, visible]);

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-title"
      aria-describedby="promotion-description"
      tabIndex={-1}
    >
      <button type="button" className={styles.close} onClick={() => dismiss(true)} aria-label="Cerrar promoción">
        <span aria-hidden="true">×</span>
      </button>

      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.label}>Promoción especial · Llaveros</p>
          <h2 id="promotion-title" className={styles.title}>
            <span className={styles.titleMain}>Estamos de promoción</span>
            <em className={styles.titleAccent}>en llaveros.</em>
          </h2>
          <p id="promotion-description" className={styles.support}>
            Usa el cupón LLAVERO al solicitar tu cotización por WhatsApp.
          </p>

          <div className={styles.coupon} aria-label="Código de cupón LLAVERO">
            <span className={styles.couponLabel}>Código de cupón</span>
            <strong className={styles.couponCode}>LLAVERO</strong>
          </div>

          <div className={styles.actions}>
            {whatsappUrl ? (
              <a
                ref={(element) => { initialFocusRef.current = element; }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "min-h-13")}
                onClick={() => dismiss(false)}
              >
                Usar cupón en WhatsApp
              </a>
            ) : (
              <button
                ref={(element) => { initialFocusRef.current = element; }}
                type="button"
                className={buttonClass("primary", "min-h-13")}
                disabled
              >
                WhatsApp no disponible
              </button>
            )}
            <Link
              href={productHref}
              className={buttonClass("outline", "min-h-13 border-[var(--ink)] text-[var(--ink)]")}
              onClick={() => dismiss(false)}
            >
              Ver llavero
            </Link>
          </div>

          <button type="button" className={styles.continue} onClick={() => dismiss(true)}>
            Seguir explorando
          </button>
        </div>

        <figure className={styles.visual}>
          <div className={styles.imageFrame}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 900px) 78vw, 42vw"
              className={styles.image}
            />
          </div>
          <figcaption className={styles.caption}>
            <span>{productName}</span>
            {productReference ? <span>Ref. {productReference}</span> : null}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
