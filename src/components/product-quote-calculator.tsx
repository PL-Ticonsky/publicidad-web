"use client";

import { type FormEvent, useMemo, useState } from "react";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form-controls";
import { ShieldIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getAdditionalsByIds } from "@/data/additionals";
import { getTechniquesByIds } from "@/data/techniques";
import { trackCommerceEvent } from "@/lib/analytics";
import { formatCOP } from "@/lib/format";
import { calculateQuote, QuoteValidationError } from "@/lib/quotation/calculate-quote";
import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import type { Product } from "@/types/product";
import type { QuoteContact, QuoteResult } from "@/types/quotation";

interface FieldErrors {
  quantity?: string;
  technique?: string;
  name?: string;
  city?: string;
  phone?: string;
  email?: string;
}

const initialContact: QuoteContact = {
  name: "",
  company: "",
  city: "",
  phone: "",
  email: "",
  comments: "",
  designNotes: "",
};

function contactErrors(contact: QuoteContact): FieldErrors {
  const errors: FieldErrors = {};
  if (!contact.name.trim()) errors.name = "Ingresa tu nombre.";
  if (!contact.city.trim()) errors.city = "Ingresa tu ciudad.";
  if (contact.phone.trim() && contact.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Ingresa un teléfono válido con al menos 7 dígitos.";
  }
  if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }
  return errors;
}

function money(value: number | null): string {
  return value === null ? "Pendiente de validación" : formatCOP(value);
}

export function ProductQuoteCalculator({ product }: { product: Product }) {
  const techniques = useMemo(() => getTechniquesByIds(product.availableTechniqueIds), [product.availableTechniqueIds]);
  const additionals = useMemo(() => getAdditionalsByIds(product.availableAdditionalIds), [product.availableAdditionalIds]);
  const defaultTechnique = techniques.find((technique) => technique.default) ?? techniques[0];
  const [quantity, setQuantity] = useState(product.minimumQuantity);
  const [techniqueId, setTechniqueId] = useState(defaultTechnique?.id ?? "");
  const [additionalIds, setAdditionalIds] = useState<string[]>([]);
  const [contact, setContact] = useState<QuoteContact>(initialContact);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<File | null>(null);

  const selectedTechnique = techniques.find((technique) => technique.id === techniqueId);
  const selectedAdditionals = additionals.filter((additional) => additionalIds.includes(additional.id));
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

  const errors = contactErrors(contact);
  const canSubmit = Boolean(
    calculation.result
    && !calculation.error
    && !errors.name
    && !errors.city
    && !errors.phone
    && !errors.email,
  );

  function updateContact(field: keyof QuoteContact, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  function validateField(field: keyof QuoteContact) {
    const nextErrors = contactErrors(contact);
    if (field === "name" || field === "city" || field === "phone" || field === "email") {
      setFieldErrors((current) => ({ ...current, [field]: nextErrors[field] }));
    }
  }

  function toggleAdditional(id: string) {
    setAdditionalIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = contactErrors(contact);
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

    const message = buildWhatsAppMessage({
      product,
      quantity,
      techniqueName: selectedTechnique?.name,
      additionalNames: selectedAdditionals.map((additional) => additional.name),
      contact,
      result: calculation.result,
    });
    const url = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, message);
    if (!url) {
      setFormError("No está configurado el número de WhatsApp.");
      return;
    }

    trackCommerceEvent("begin_quote", {
      product_id: product.id,
      quantity,
      total: calculation.result.estimatedTotal,
    });
    trackCommerceEvent("quote_completed", { product_id: product.id });
    trackCommerceEvent("whatsapp_click", { product_id: product.id });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const result = calculation.result;
  const quoteOnly = result?.status === "quote-only";
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <form onSubmit={handleSubmit} className="grid gap-x-6 pb-32 lg:grid-cols-[minmax(0,1fr)_340px] lg:pb-0" noValidate>
      <header className="border-t border-[var(--ink)] py-8 lg:col-start-1">
        <p className="eyebrow">Orden de cotización / borrador local</p>
        <h1 className="mt-4 text-[clamp(2.5rem,5vw,3.5rem)] leading-none">Configuremos tu pedido</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Define la cantidad, la personalización y los datos que quieres incluir. Nada se guarda: el resumen se prepara en tu navegador y se envía a WhatsApp.
        </p>
      </header>

      <section className="relative border border-[var(--ink)] bg-[var(--stone-low)] p-5 lg:col-start-1 lg:p-7">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4">
          <h2 className="font-technical text-[10px] uppercase tracking-[.08em]">Manifiesto de producción #001</h2>
          <span className="font-technical text-[9px] uppercase text-[var(--muted)]">{product.sku ? `Ref. ${product.sku}` : "Referencia sin SKU"}</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
          <div className="relative aspect-[4/5] border border-[var(--line)] bg-white grayscale">
            <ProductImage src={primaryImage?.src ?? null} alt={primaryImage?.alt ?? product.name} sizes="150px" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl leading-tight">{product.name}</h2>
            <dl className="font-technical mt-5 grid grid-cols-2 gap-4 text-[9px] uppercase text-[var(--muted)]">
              <div><dt>Pedido mínimo</dt><dd className="mt-1 text-[var(--ink)]">{product.minimumQuantity.toLocaleString("es-CO")} unidades</dd></div>
              <div><dt>Valor estimado desde</dt><dd className="mt-1 text-[var(--ink)]">{product.priceTiers.length ? formatCOP(Math.min(...product.priceTiers.map((tier) => tier.unitPrice))) : "Por validar"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-10 lg:col-start-1">
        <div className="flex items-center gap-3 border-b border-[var(--line-soft)] pb-3">
          <span className="font-technical text-xs text-[var(--signal)]">MÓDULO 02</span>
          <h2 className="text-xl">Configuración técnica</h2>
        </div>

        <label htmlFor="cantidad" className="mt-7 block text-sm font-bold">
          Cantidad
          <span className="mt-2 grid grid-cols-[48px_1fr_48px] border border-[var(--line)] bg-[var(--surface)]">
            <button type="button" className="min-h-12 border-r border-[var(--line)] text-xl" onClick={() => setQuantity((value) => Math.max(product.minimumQuantity, value - 1))} aria-label="Reducir cantidad">−</button>
            <input id="cantidad" type="number" min={product.minimumQuantity} step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-invalid={Boolean(calculation.error)} aria-describedby="cantidad-ayuda cantidad-error" className="min-w-0 bg-transparent px-3 text-center font-semibold outline-none" required />
            <button type="button" className="min-h-12 border-l border-[var(--line)] text-xl" onClick={() => setQuantity((value) => value + 1)} aria-label="Aumentar cantidad">+</button>
          </span>
          <span id="cantidad-ayuda" className="mt-2 block text-xs text-[var(--muted)]">Pedido mínimo: {product.minimumQuantity.toLocaleString("es-CO")} unidades</span>
          {calculation.error ? <span id="cantidad-error" className="mt-1 block text-xs font-semibold text-[var(--color-error)]">{calculation.error}</span> : null}
          <span className="mt-4 grid gap-2 sm:grid-cols-3">
            {product.priceTiers.map((tier) => (
              <button key={tier.id} type="button" onClick={() => setQuantity(tier.minQuantity)} className={`font-technical flex min-h-14 items-center justify-between border px-3 text-[9px] uppercase ${result?.selectedTier?.id === tier.id ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-[var(--surface)]"}`}>
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
                  <input type="radio" name="tecnica" value={technique.id} checked={techniqueId === technique.id} onChange={(event) => setTechniqueId(event.target.value)} className="mt-1 h-4 w-4 accent-[var(--signal)]" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{technique.name}</span>
                    {technique.description ? <span className="mt-1 block text-xs text-[var(--muted)]">{technique.description}</span> : null}
                  </span>
                  <span className="text-right text-xs">
                    {technique.setupPrice ? `${formatCOP(technique.setupPrice)} preparación` : "Sin costo fijo"}
                    <br />
                    {technique.pricingMode === "per-unit" ? `+ ${formatCOP(technique.price)}/u` : "Incluida"}
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
                  <input type="checkbox" checked={additionalIds.includes(additional.id)} onChange={() => toggleAdditional(additional.id)} className="mt-1 h-5 w-5 accent-[var(--signal)]" />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{additional.name}</span>
                    {additional.description ? <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{additional.description}</span> : null}
                  </span>
                  <span className="text-sm font-bold text-[var(--signal)]">
                    {additional.price === 0 ? "Por validar" : formatCOP(additional.price)}
                    {additional.pricingMode === "per-unit" ? "/u" : ""}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>

      <section className="space-y-8 border-t border-[var(--line-soft)] py-8 lg:col-start-1">
        <div className="grid gap-5 bg-[var(--stone)] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="font-technical text-[10px] uppercase tracking-[.08em]">Archivo o referencia gráfica</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">El archivo permanece solo en este dispositivo. WhatsApp no permite adjuntarlo automáticamente; podrás enviarlo en la conversación.</p>
            {artwork ? <p className="font-technical mt-2 text-[9px] uppercase text-[var(--signal)]">Seleccionado: {artwork.name}</p> : null}
          </div>
          <div className="flex gap-2">
            <label className="font-technical inline-flex min-h-11 cursor-pointer items-center bg-[var(--ink)] px-4 text-[10px] uppercase text-[var(--paper)]">
              <input type="file" className="sr-only" accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg" onChange={(event) => setArtwork(event.target.files?.[0] ?? null)} />
              {artwork ? "Reemplazar archivo" : "Seleccionar archivo"}
            </label>
            {artwork ? <button type="button" onClick={() => setArtwork(null)} className="font-technical min-h-11 border border-[var(--ink)] px-3 text-[9px] uppercase">Quitar</button> : null}
          </div>
        </div>
        <label htmlFor="designNotes" className="font-technical block text-[10px] uppercase tracking-[.08em]">
          Observaciones del diseño
          <Textarea id="designNotes" rows={3} value={contact.designNotes} onChange={(event) => updateContact("designNotes", event.target.value)} className="font-sans normal-case" placeholder="Color, ubicación del logo, número de tintas u otras instrucciones." />
        </label>
        <label htmlFor="comments" className="font-technical block text-[10px] uppercase tracking-[.08em]">
          Comentarios
          <Textarea id="comments" rows={3} value={contact.comments} onChange={(event) => updateContact("comments", event.target.value)} className="font-sans normal-case" placeholder="Fecha requerida, empaque, entrega u otra información comercial." />
        </label>
      </section>

      <QuoteSummary product={product} quantity={quantity} result={result} quoteOnly={quoteOnly} canSubmit={canSubmit} />

      <section className="border-y border-[var(--line)] py-8 lg:col-start-1">
        <div className="flex items-center gap-3 border-b border-[var(--line-soft)] pb-3">
          <span className="font-technical text-xs text-[var(--signal)]">MÓDULO 03</span>
          <h2 className="text-xl">Información para el mensaje</h2>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">Estos datos solo se incorporan al mensaje de WhatsApp. No se guardan ni se envían a un servidor.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ContactField id="name" label="Nombre *" value={contact.name} error={fieldErrors.name} autoComplete="name" onChange={(value) => updateContact("name", value)} onBlur={() => validateField("name")} />
          <ContactField id="company" label="Empresa" value={contact.company} autoComplete="organization" onChange={(value) => updateContact("company", value)} />
          <ContactField id="city" label="Ciudad *" value={contact.city} error={fieldErrors.city} autoComplete="address-level2" onChange={(value) => updateContact("city", value)} onBlur={() => validateField("city")} />
          <ContactField id="phone" label="Teléfono (opcional)" value={contact.phone} error={fieldErrors.phone} type="tel" autoComplete="tel" onChange={(value) => updateContact("phone", value)} onBlur={() => validateField("phone")} />
          <ContactField id="email" label="Email (opcional)" value={contact.email} error={fieldErrors.email} type="email" autoComplete="email" onChange={(value) => updateContact("email", value)} onBlur={() => validateField("email")} className="sm:col-span-2" />
        </div>
      </section>

      {formError ? <p role="alert" className="border border-[var(--color-error)]/25 bg-[var(--color-error-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-error)] lg:col-start-1">{formError}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ink)] bg-[var(--stone-highest)] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-between gap-4">
          <div><p className="font-technical text-[8px] uppercase text-[var(--muted)]">{quoteOnly ? "Precio" : "Total estimado"}</p><p className="tabular-nums text-lg font-bold">{quoteOnly ? "Por validar" : money(result?.estimatedTotal ?? null)}</p></div>
          <Button type="submit" disabled={!canSubmit} variant="secondary" className="min-h-12 px-4">Solicitar cotización</Button>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[var(--muted)] lg:col-start-1">
        <ShieldIcon className="h-4 w-4 shrink-0" /> No guardamos tus datos ni esta cotización. Al continuar se abrirá WhatsApp en una pestaña nueva.
      </p>
    </form>
  );
}

function QuoteSummary({ product, quantity, result, quoteOnly, canSubmit }: { product: Product; quantity: number; result: QuoteResult | null; quoteOnly: boolean; canSubmit: boolean }) {
  return (
    <section className="hidden border border-[var(--ink)] bg-white p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:block lg:self-start">
      <h2 className="font-technical border-b border-[var(--line-soft)] pb-4 text-[10px] uppercase tracking-[.16em]">Resumen de solicitud</h2>
      <p className="mt-5 text-sm font-semibold">{product.name}</p>
      <p className="font-technical mt-1 text-[9px] uppercase text-[var(--muted)]">× {quantity.toLocaleString("es-CO")} unidades</p>
      {result?.selectedTier ? <p className="mt-2 text-xs text-[var(--blue-dark)]">Tramo aplicado: {result.selectedTier.minQuantity.toLocaleString("es-CO")}–{result.selectedTier.maxQuantity?.toLocaleString("es-CO") ?? "en adelante"} unidades.</p> : null}
      {quoteOnly ? (
        <p className="mt-6 border-y border-[var(--line-soft)] py-5 text-sm font-semibold">Precio pendiente de validación por un asesor.</p>
      ) : (
        <dl className="mt-4 space-y-2 text-sm">
          <SummaryLine label="Precio base por unidad" value={money(result?.baseUnitPrice ?? null)} />
          <SummaryLine label="Personalización" value={money(result?.techniqueCost ?? null)} />
          <SummaryLine label="Adicionales" value={money(result?.additionalsCost ?? null)} />
          <SummaryLine label="Subtotal estimado" value={money(result?.subtotal ?? null)} />
          <SummaryLine label="IVA estimado (19%)" value={money(result?.taxAmount ?? null)} />
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4">
            <dt className="font-semibold">Total estimado</dt>
            <dd className="text-2xl font-bold">{money(result?.estimatedTotal ?? null)}</dd>
          </div>
        </dl>
      )}
      <p className="font-technical mt-6 text-[8px] uppercase leading-4 text-[var(--muted)]">El valor final puede variar según el diseño, técnica, materiales, disponibilidad, urgencia y entrega.</p>
      <Button type="submit" disabled={!canSubmit} variant="secondary" className="mt-5 min-h-14 w-full"><WhatsAppIcon className="h-4 w-4" /> Solicitar por WhatsApp</Button>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-[var(--muted)]"><dt>{label}</dt><dd className="text-right font-semibold text-[var(--ink)]">{value}</dd></div>;
}

function ContactField({ id, label, value, error, type = "text", autoComplete, className = "", onChange, onBlur }: {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: "text" | "tel" | "email";
  autoComplete?: string;
  className?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label htmlFor={id} className={`text-sm font-bold ${className}`}>
      {label}
      <Input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      {error ? <span id={`${id}-error`} className="mt-1 block text-xs font-semibold text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
}
