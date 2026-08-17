"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import { useCustomizerPreview } from "@/components/personalization/customizer-preview-provider";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form-controls";
import { ShieldIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getAdditionalsByIds } from "@/data/additionals";
import { getTechniquesByIds } from "@/data/techniques";
import { trackCommerceEvent } from "@/lib/analytics";
import { formatCOP } from "@/lib/format";
import {
  CONTACT_LIMITS,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type QuoteContact,
} from "@/lib/quotation/contact";
import { calculateQuote, QuoteValidationError } from "@/lib/quotation/calculate-quote";
import { presentQuote } from "@/lib/quotation/present-quote";
import type { QuoteResult } from "@/lib/quotation/types";
import { MAX_QUANTITY_DIGITS, MAX_QUOTE_QUANTITY } from "@/lib/quotation/validate-quotation";
import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import type { Product } from "@/types/product";

const initialContact: QuoteContact = {
  name: "",
  company: "",
  city: "",
  phone: "",
  email: "",
  comments: "",
  designNotes: "",
};

export function ProductQuoteCalculator({ product }: { product: Product }) {
  const { preview, downloaded, downloadPreviewOnce } = useCustomizerPreview();
  const customizerPreview = preview?.productSlug === product.slug ? preview : null;
  const techniques = useMemo(() => getTechniquesByIds(product.availableTechniqueIds), [product.availableTechniqueIds]);
  const additionals = useMemo(() => getAdditionalsByIds(product.availableAdditionalIds), [product.availableAdditionalIds]);
  const defaultTechnique = techniques.find((technique) => technique.default) ?? techniques[0];
  const [quantityInput, setQuantityInput] = useState(String(product.minimumQuantity));
  const [techniqueId, setTechniqueId] = useState(defaultTechnique?.id ?? "");
  const [additionalIds, setAdditionalIds] = useState<string[]>([]);
  const [contact, setContact] = useState<QuoteContact>(initialContact);
  const [fieldErrors, setFieldErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const openingLockRef = useRef(false);

  const quantity = Number(quantityInput);
  const calculation = useMemo<{ result: QuoteResult | null; error: string | null }>(() => {
    try {
      return {
        result: calculateQuote({ product, quantity, techniqueId: techniqueId || undefined, additionalIds }),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof QuoteValidationError ? error.message : "No pudimos calcular esta configuración.",
      };
    }
  }, [additionalIds, product, quantity, techniqueId]);

  const errors = validateContact(contact);
  const canSubmit = Boolean(
    calculation.result
    && !calculation.error
    && Object.keys(errors).length === 0
    && !isOpening,
  );

  function resetOpeningAttempt() {
    openingLockRef.current = false;
    setIsOpening(false);
  }

  function updateContact(field: ContactField, value: string) {
    resetOpeningAttempt();
    setContact((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  function validateField(field: ContactField) {
    const nextErrors = validateContact(contact);
    setFieldErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  }

  function updateQuantity(value: string) {
    resetOpeningAttempt();
    setQuantityInput(value.slice(0, MAX_QUANTITY_DIGITS));
    setFormError(null);
  }

  function setValidQuantity(value: number) {
    updateQuantity(String(Math.min(MAX_QUOTE_QUANTITY, Math.max(product.minimumQuantity, value))));
  }

  function toggleAdditional(id: string) {
    resetOpeningAttempt();
    setAdditionalIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (openingLockRef.current) return;

    const nextErrors = validateContact(contact);
    setFieldErrors(nextErrors);
    setFormError(null);

    if (!calculation.result || calculation.error) {
      setFormError(calculation.error ?? "Revisa la configuración del producto.");
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Revisa los campos marcados antes de continuar.");
      return;
    }

    const normalizedContact = normalizeContact(contact);
    const message = buildWhatsAppMessage({
      contact: normalizedContact,
      result: calculation.result,
      customizationPreviewReady: Boolean(customizerPreview),
    });
    const url = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, message);
    if (!url) {
      setFormError("El canal de WhatsApp no tiene una configuración internacional válida.");
      return;
    }

    // El ref se actualiza de forma síncrona; useState por sí solo no detiene dos
    // eventos submit que ocurren antes del siguiente render de React.
    openingLockRef.current = true;
    setIsOpening(true);
    trackCommerceEvent("begin_quote", {
      product_id: product.id,
      quantity: calculation.result.quantity,
      total: calculation.result.estimatedTotalCop,
      estimate_status: calculation.result.status,
    });
    trackCommerceEvent("quote_completed", { product_id: product.id, estimate_status: calculation.result.status });
    trackCommerceEvent("whatsapp_click", { product_id: product.id });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function downloadCustomizerPreview() {
    const downloadablePreview = downloadPreviewOnce(product.slug);
    if (!downloadablePreview) return;

    const link = document.createElement("a");
    link.href = downloadablePreview.previewObjectUrl;
    link.download = `${product.slug}-previsualizacion.png`;
    document.body.append(link);
    link.click();
    link.remove();
  }

  const result = calculation.result;
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const lowestBasePrice = product.priceTiers.length
    ? Math.min(...product.priceTiers.map((tier) => tier.unitPrice))
    : null;

  return (
    <form onSubmit={handleSubmit} className="grid gap-x-8 pb-32 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0" noValidate>
      <header className="border-t-4 border-[var(--pp-navy)] py-8 lg:col-start-1">
        <p className="eyebrow">Solicitud estimada / borrador local</p>
        <h1 className="mt-4 text-[clamp(3rem,6vw,5.25rem)] leading-[.9]">Configuremos<br /><span className="text-[var(--pp-cyan)]">tu pedido</span></h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--pp-navy-700)]">
          Define la cantidad, la personalización y los datos que quieres incluir. Nada se guarda: el resumen se prepara en tu navegador y se envía a WhatsApp.
        </p>
      </header>

      <section className="relative bg-[var(--pp-paper-cool)] p-5 lg:col-start-1 lg:p-7">
        <div className="flex items-center justify-between border-b border-[var(--pp-line)] pb-4">
          <h2 className="font-technical text-xs uppercase tracking-[var(--pp-tracking-label)]">Resumen del producto</h2>
          <span className="font-technical text-xs uppercase text-[var(--muted)]">{product.sku ? `Ref. ${product.sku}` : "Referencia sin SKU"}</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
          <div className="halftone relative aspect-[5/4] overflow-hidden border border-[var(--pp-line)] bg-white">
            <ProductImage src={primaryImage?.src ?? null} alt={primaryImage?.alt ?? product.name} sizes="150px" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl leading-tight">{product.name}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm text-[var(--pp-navy-700)]">
              <div><dt>Pedido mínimo</dt><dd className="font-display mt-1 text-xl text-[var(--pp-cyan)]">{product.minimumQuantity.toLocaleString("es-CO")} unidades</dd></div>
              <div><dt>Precio base por unidad, desde</dt><dd className="font-display mt-1 text-xl text-[var(--pp-cyan)]">{lowestBasePrice === null ? "Por validar" : formatCOP(lowestBasePrice)}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">“Desde” corresponde al tramo de mayor volumen; no incluye personalización, cargos fijos ni IVA.</p>
          </div>
        </div>
      </section>

      <section className="py-10 lg:col-start-1">
        <div className="flex items-baseline gap-3 border-b border-[var(--pp-line)] pb-3">
          <span className="font-technical text-xs text-[var(--pp-cyan)]">02</span>
          <h2 className="text-2xl">Configuración técnica</h2>
        </div>

        <label htmlFor="cantidad" className="mt-7 block text-sm font-bold">
          Cantidad
          <span className="mt-2 grid grid-cols-[48px_1fr_48px] border border-[var(--pp-line)] bg-[var(--pp-paper-cool)]">
            <button type="button" className="min-h-12 border-r border-[var(--line)] text-xl" onClick={() => setValidQuantity((Number.isSafeInteger(quantity) ? quantity : product.minimumQuantity) - 1)} aria-label="Reducir cantidad">−</button>
            <input id="cantidad" aria-label="Cantidad" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={MAX_QUANTITY_DIGITS} value={quantityInput} onChange={(event) => updateQuantity(event.target.value)} aria-invalid={Boolean(calculation.error)} aria-describedby="cantidad-ayuda cantidad-error" className="min-w-0 bg-transparent px-3 text-center font-semibold outline-none" required />
            <button type="button" className="min-h-12 border-l border-[var(--line)] text-xl" onClick={() => setValidQuantity((Number.isSafeInteger(quantity) ? quantity : product.minimumQuantity) + 1)} aria-label="Aumentar cantidad">+</button>
          </span>
          <span id="cantidad-ayuda" className="mt-2 block text-xs text-[var(--muted)]">Entre {product.minimumQuantity.toLocaleString("es-CO")} y {MAX_QUOTE_QUANTITY.toLocaleString("es-CO")} unidades. Máximo temporal pendiente de aprobación comercial.</span>
          {calculation.error ? <span id="cantidad-error" className="mt-1 block text-xs font-semibold text-[var(--color-error)]">{calculation.error}</span> : null}
          <span className="mt-4 grid gap-2 sm:grid-cols-3">
            {product.priceTiers.map((tier) => (
              <button key={tier.id} type="button" onClick={() => setValidQuantity(tier.minQuantity)} className={`font-technical relative flex min-h-14 items-center justify-between border px-3 text-xs uppercase transition-colors ${result?.selectedTier?.id === tier.id ? "border-[var(--pp-cyan)] text-[var(--pp-cyan)] after:absolute after:-inset-x-px after:-bottom-px after:h-1 after:bg-[var(--pp-cyan)]" : "border-[var(--pp-line)] bg-white hover:border-[var(--pp-cyan)]"}`}>
                <span>{tier.minQuantity.toLocaleString("es-CO")}–{tier.maxQuantity?.toLocaleString("es-CO") ?? "+"}</span>
                <span>{formatCOP(tier.unitPrice)}/u</span>
              </button>
            ))}
          </span>
        </label>

        {techniques.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Técnica de personalización</legend>
            <div className="mt-2 border-t border-[var(--line)]">
              {techniques.map((technique) => (
                <label key={technique.id} className="flex cursor-pointer items-start gap-3 border-b border-[var(--line)] py-4">
                  <input type="radio" name="tecnica" value={technique.id} checked={techniqueId === technique.id} onChange={(event) => { resetOpeningAttempt(); setTechniqueId(event.target.value); }} className="mt-1 h-4 w-4 accent-[var(--pp-cyan)]" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{technique.name}</span>
                    {technique.description ? <span className="mt-1 block text-xs text-[var(--muted)]">{technique.description}</span> : null}
                  </span>
                  <span className="text-right text-xs">
                    {technique.setupPrice ? `${formatCOP(technique.setupPrice)} preparación` : "Sin costo fijo"}
                    <br />
                    {technique.pricingMode === "per-unit" ? `+ ${formatCOP(technique.price)}/u` : technique.pricingMode === "fixed" ? formatCOP(technique.price) : "Incluida"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {additionals.length > 0 ? (
          <fieldset className="mt-7">
            <legend className="text-sm font-bold">Adicionales</legend>
            <div className="mt-3">
              {additionals.map((additional) => (
                <label key={additional.id} className="flex cursor-pointer items-start gap-3 border-b border-[var(--line)] py-4">
                  <input type="checkbox" checked={additionalIds.includes(additional.id)} onChange={() => toggleAdditional(additional.id)} className="mt-1 h-5 w-5 accent-[var(--pp-cyan)]" />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{additional.name}</span>
                    {additional.description ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{additional.description}</span> : null}
                  </span>
                  <span className="text-sm font-bold text-[var(--signal)]">
                    {additional.pricingStatus === "requiresQuote" ? "Requiere validación" : formatCOP(additional.priceCop)}
                    {additional.pricingStatus === "priced" && additional.pricingMode === "per-unit" ? "/u" : ""}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>

      <section className="space-y-8 border-t border-[var(--line-soft)] py-8 lg:col-start-1">
        {customizerPreview ? (
          <div className="grid gap-5 border border-[var(--pp-cyan)] bg-[var(--pp-paper-tint)] p-5 sm:grid-cols-[1fr_auto] sm:items-center" aria-label="Previsualización personalizada">
            <div>
              <p className="eyebrow">Previsualización lista</p>
              <h2 className="mt-2 text-xl">PNG preparado en este navegador</h2>
              <p className="mt-2 break-all text-sm text-[var(--muted)]">{customizerPreview.sourceFileName}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Descarga el PNG una vez y adjúntalo manualmente en WhatsApp. El archivo no se envía automáticamente ni se conserva al recargar.</p>
            </div>
            <Button type="button" onClick={downloadCustomizerPreview} disabled={downloaded} className="min-h-12 w-full sm:w-auto">
              {downloaded ? "PNG descargado" : "Descargar PNG"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 bg-[var(--pp-paper-cool)] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-technical text-xs uppercase tracking-[.08em]">Archivo o referencia gráfica</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">El archivo permanece solo en este dispositivo. WhatsApp no permite adjuntarlo automáticamente; deberás enviarlo en la conversación.</p>
              {artwork ? <p className="font-technical mt-2 text-xs uppercase text-[var(--signal)]">Seleccionado localmente: {artwork.name}</p> : null}
            </div>
            <div className="flex gap-2">
              <label className="font-technical inline-flex min-h-11 cursor-pointer items-center bg-[var(--pp-navy)] px-4 text-xs uppercase text-white transition-colors hover:bg-[var(--pp-cyan)]">
                <input type="file" className="sr-only" accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg" onChange={(event) => { resetOpeningAttempt(); setArtwork(event.target.files?.[0] ?? null); }} />
                {artwork ? "Reemplazar archivo" : "Seleccionar archivo"}
              </label>
              {artwork ? <button type="button" onClick={() => { resetOpeningAttempt(); setArtwork(null); }} className="font-technical min-h-11 border border-[var(--ink)] px-3 text-xs uppercase">Quitar</button> : null}
            </div>
          </div>
        )}
        <ContactTextarea id="designNotes" label="Observaciones del diseño" value={contact.designNotes} error={fieldErrors.designNotes} maxLength={CONTACT_LIMITS.designNotes} onChange={(value) => updateContact("designNotes", value)} onBlur={() => validateField("designNotes")} placeholder="Color, ubicación del logo, número de tintas u otras instrucciones." />
        <ContactTextarea id="comments" label="Comentarios" value={contact.comments} error={fieldErrors.comments} maxLength={CONTACT_LIMITS.comments} onChange={(value) => updateContact("comments", value)} onBlur={() => validateField("comments")} placeholder="Fecha requerida, empaque, entrega u otra información comercial." />
      </section>

      <QuoteSummary result={result} canSubmit={canSubmit} isOpening={isOpening} />

      <section className="border-y border-[var(--pp-line)] py-8 lg:col-start-1">
        <div className="flex items-baseline gap-3 border-b border-[var(--pp-line)] pb-3">
          <span className="font-technical text-xs text-[var(--pp-cyan)]">03</span>
          <h2 className="text-2xl">Información para el mensaje</h2>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">Estos datos solo se incorporan al mensaje de WhatsApp. No se guardan ni se envían a un servidor propio.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ContactInput id="name" label="Nombre *" value={contact.name} error={fieldErrors.name} maxLength={CONTACT_LIMITS.name} autoComplete="name" onChange={(value) => updateContact("name", value)} onBlur={() => validateField("name")} />
          <ContactInput id="company" label="Empresa" value={contact.company} error={fieldErrors.company} maxLength={CONTACT_LIMITS.company} autoComplete="organization" onChange={(value) => updateContact("company", value)} onBlur={() => validateField("company")} />
          <ContactInput id="city" label="Ciudad *" value={contact.city} error={fieldErrors.city} maxLength={CONTACT_LIMITS.city} autoComplete="address-level2" onChange={(value) => updateContact("city", value)} onBlur={() => validateField("city")} />
          <ContactInput id="phone" label="Teléfono (opcional)" value={contact.phone} error={fieldErrors.phone} maxLength={CONTACT_LIMITS.phone} type="tel" autoComplete="tel" onChange={(value) => updateContact("phone", value)} onBlur={() => validateField("phone")} />
          <ContactInput id="email" label="Email (opcional)" value={contact.email} error={fieldErrors.email} maxLength={CONTACT_LIMITS.email} type="email" autoComplete="email" onChange={(value) => updateContact("email", value)} onBlur={() => validateField("email")} className="sm:col-span-2" />
        </div>
      </section>

      {formError ? <p role="alert" className="border border-[var(--color-error)]/25 bg-[var(--color-error-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-error)] lg:col-start-1">{formError}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--pp-navy)] bg-[var(--pp-paper-cool)] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-between gap-4">
          <div><p className="font-technical text-xs uppercase text-[var(--muted)]">{result?.status === "partial" ? "Total parcial" : result?.status === "requiresQuote" ? "Precio" : "Total estimado"}</p><p className="tabular-nums text-lg font-bold">{result?.estimatedTotalCop === null || result?.estimatedTotalCop === undefined ? "Por validar" : formatCOP(result.estimatedTotalCop)}</p></div>
          <Button type="submit" disabled={!canSubmit} variant="secondary" className="min-h-12 px-4">{isOpening ? "Solicitud preparada" : "Continuar en WhatsApp"}</Button>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[var(--muted)] lg:col-start-1">
        <ShieldIcon className="h-4 w-4 shrink-0" /> No guardamos tus datos ni esta solicitud. Al continuar se abrirá WhatsApp una sola vez en una pestaña nueva.
      </p>
    </form>
  );
}

function QuoteSummary({ result, canSubmit, isOpening }: { result: QuoteResult | null; canSubmit: boolean; isOpening: boolean }) {
  const presentation = result ? presentQuote(result) : null;
  return (
    <section aria-label="Desglose de la solicitud" className="bg-[var(--pp-navy)] p-5 text-white lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:block lg:self-start lg:p-6">
      <h2 className="font-technical border-b border-white/20 pb-4 text-xs uppercase tracking-[.16em] text-[var(--pp-cyan-light)]">Resumen de solicitud</h2>
      {result ? (
        <>
          <p className="mt-5 text-sm font-semibold">{result.product.name}</p>
          <p className="font-technical mt-1 text-xs uppercase text-[var(--pp-cyan-pale)]">× {result.quantity.toLocaleString("es-CO")} unidades</p>
          {result.selectedTier ? <p className="mt-2 text-xs text-[var(--pp-cyan-pale)]">Tramo aplicado: {result.selectedTier.minQuantity.toLocaleString("es-CO")}–{result.selectedTier.maxQuantity?.toLocaleString("es-CO") ?? "en adelante"} unidades.</p> : null}
          <p className={`mt-5 border-y border-white/20 py-3 text-sm font-bold ${result.status === "partial" ? "text-[var(--pp-cyan-light)]" : ""}`}>{presentation?.heading}</p>
          {presentation && presentation.lines.length > 0 ? (
            <dl className="mt-4 space-y-2 text-sm">
              {presentation.lines.map((line) => <SummaryLine key={line.id} label={line.label} value={line.value} />)}
              {presentation.totalLabel && presentation.totalValue ? (
                <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/30 pt-4">
                  <dt className="font-semibold">{presentation.totalLabel}</dt>
                  <dd className="text-right text-2xl font-bold">{presentation.totalValue}</dd>
                </div>
              ) : null}
            </dl>
          ) : <p className="mt-4 text-sm">No se muestra un total hasta validar los importes pendientes.</p>}
          {presentation && presentation.excludedCharges.length > 0 ? (
            <div className="mt-5 border border-[var(--pp-cyan-light)] bg-[var(--pp-navy-700)] p-3 text-sm">
              <p className="font-bold">Cargos excluidos por validar</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">{presentation.excludedCharges.map((charge) => <li key={charge}>{charge}</li>)}</ul>
            </div>
          ) : null}
        </>
      ) : <p className="mt-5 text-sm text-[var(--pp-cyan-pale)]">Corrige la configuración para ver el desglose.</p>}
      <p className="font-technical mt-6 text-xs uppercase leading-5 text-[var(--pp-cyan-pale)]">Solicitud estimada, no cotización formal. Los valores requieren validación comercial.</p>
      <Button type="submit" disabled={!canSubmit} variant="secondary" className="mt-5 min-h-14 w-full"><WhatsAppIcon className="h-4 w-4" /> {isOpening ? "Solicitud preparada" : "Continuar en WhatsApp"}</Button>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-[var(--pp-cyan-pale)]"><dt>{label}</dt><dd className="text-right font-semibold text-white">{value}</dd></div>;
}

function ContactInput({ id, label, value, error, maxLength, type = "text", autoComplete, className = "", onChange, onBlur }: {
  id: string;
  label: string;
  value: string;
  error?: string;
  maxLength: number;
  type?: "text" | "tel" | "email";
  autoComplete?: string;
  className?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label htmlFor={id} className={`text-sm font-bold ${className}`}>
      {label}
      <Input id={id} aria-label={label} type={type} autoComplete={autoComplete} maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={`${id}-limit${error ? ` ${id}-error` : ""}`} />
      <span id={`${id}-limit`} className="mt-1 block text-xs font-normal text-[var(--muted)]">Máximo {maxLength.toLocaleString("es-CO")} caracteres.</span>
      {error ? <span id={`${id}-error`} className="mt-1 block text-xs font-semibold text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
}

function ContactTextarea({ id, label, value, error, maxLength, placeholder, onChange, onBlur }: {
  id: "comments" | "designNotes";
  label: string;
  value: string;
  error?: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <label htmlFor={id} className="font-technical block text-xs uppercase tracking-[.08em]">
      {label}
      <Textarea id={id} aria-label={label} rows={3} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className="font-sans normal-case" placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={`${id}-limit${error ? ` ${id}-error` : ""}`} />
      <span id={`${id}-limit`} className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-[var(--muted)]">Máximo {maxLength.toLocaleString("es-CO")} caracteres.</span>
      {error ? <span id={`${id}-error`} className="mt-1 block font-sans text-xs font-semibold normal-case tracking-normal text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
}
