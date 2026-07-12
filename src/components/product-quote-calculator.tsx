"use client";

import { FormEvent, useMemo, useState } from "react";

import { formatCOP } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type {
  AdicionalProducto,
  ProductoDetalle,
} from "@/types/producto";

interface ClientForm {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  ciudad: string;
  observaciones: string;
}

const initialClientForm: ClientForm = {
  nombre: "",
  empresa: "",
  telefono: "",
  email: "",
  ciudad: "",
  observaciones: "",
};

function additionalCost(adicional: AdicionalProducto, cantidad: number, base: number) {
  if (adicional.tipo_cobro === "por_unidad") return adicional.precio * cantidad;
  if (adicional.tipo_cobro === "porcentaje") return base * (adicional.precio / 100);
  return adicional.precio;
}

function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const err = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [
      err.message,
      err.details,
      err.hint,
      err.code ? `Código: ${err.code}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return "Error desconocido";
}

export function ProductQuoteCalculator({ detalle }: { detalle: ProductoDetalle }) {
  const defaultCustomization = detalle.customizaciones.find((item) => item.es_default);
  const [cantidad, setCantidad] = useState(detalle.cantidad_minima);
  const [customizationId, setCustomizationId] = useState(
    defaultCustomization?.customizacion_posible_id ?? "",
  );
  const [additionalIds, setAdditionalIds] = useState<string[]>([]);
  const [client, setClient] = useState<ClientForm>(initialClientForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCustomization = useMemo(
    () =>
      detalle.customizaciones.find(
        (item) => item.customizacion_posible_id === customizationId,
      ) ?? null,
    [customizationId, detalle.customizaciones],
  );

  const selectedAdditionals = useMemo(
    () => detalle.adicionales.filter((item) => additionalIds.includes(item.id)),
    [additionalIds, detalle.adicionales],
  );

  const totals = useMemo(() => {
    const tier = detalle.tiers_precio.find(
      (item) =>
        cantidad >= item.cantidad_minima &&
        (item.cantidad_maxima === null || cantidad <= item.cantidad_maxima),
    );
    const unitPrice = tier?.precio_unitario ?? 0;
    const base = cantidad * unitPrice;
    const customization = selectedCustomization
      ? selectedCustomization.costo_fijo +
        cantidad * selectedCustomization.costo_unitario_extra
      : 0;
    const additionals = selectedAdditionals.reduce(
      (total, item) => total + additionalCost(item, cantidad, base),
      0,
    );
    const subtotal = base + customization + additionals;
    const iva = subtotal * 0.19;

    return {
      tier,
      unitPrice,
      base,
      customization,
      additionals,
      subtotal,
      iva,
      total: subtotal + iva,
    };
  }, [cantidad, detalle.tiers_precio, selectedAdditionals, selectedCustomization]);

  function updateClient(field: keyof ClientForm, value: string) {
    setClient((current) => ({ ...current, [field]: value }));
  }

  function toggleAdditional(id: string) {
    setAdditionalIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!Number.isInteger(cantidad) || cantidad < detalle.cantidad_minima) {
      setFormError(`La cantidad mínima es de ${detalle.cantidad_minima} unidades.`);
      return;
    }

    if (!totals.tier) {
      setFormError("No encontramos un precio disponible para esta cantidad.");
      return;
    }

    if (detalle.customizaciones.length > 0 && !selectedCustomization) {
      setFormError("Selecciona una opción de personalización.");
      return;
    }

    if (!client.nombre.trim() || !client.telefono.trim()) {
      setFormError("Ingresa el nombre y el teléfono de contacto.");
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      setFormError("No está configurado el número de WhatsApp.");
      return;
    }

    setIsSubmitting(true);
    const clienteId = crypto.randomUUID();
    const cotizacionId = crypto.randomUUID();
    const cotizacionItemId = crypto.randomUUID();
    const codigo = `COT-${Date.now()}`;
    const additionalNames = selectedAdditionals.length
      ? selectedAdditionals.map((item) => item.nombre).join(", ")
      : "Ninguno";
    const message = [
      `*Cotización ${codigo}*`,
      `Producto: ${detalle.nombre}`,
      `Cantidad: ${cantidad}`,
      `Personalización: ${selectedCustomization?.nombre ?? "No aplica"}`,
      `Adicionales: ${additionalNames}`,
      `Subtotal: ${formatCOP(totals.subtotal)}`,
      `IVA (19%): ${formatCOP(totals.iva)}`,
      `Total estimado: ${formatCOP(totals.total)}`,
      "",
      "*Datos del cliente*",
      `Nombre: ${client.nombre.trim()}`,
      `Empresa: ${client.empresa.trim() || "No indicada"}`,
      `Teléfono: ${client.telefono.trim()}`,
      `Email: ${client.email.trim() || "No indicado"}`,
      `Ciudad: ${client.ciudad.trim() || "No indicada"}`,
      client.observaciones.trim()
        ? `Observaciones: ${client.observaciones.trim()}`
        : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    try {
      const { error: clienteError } = await supabase
        .from("clientes")
        .insert({
          id: clienteId,
          nombre: client.nombre.trim(),
          empresa: client.empresa.trim() || null,
          telefono: client.telefono.trim(),
          email: client.email.trim() || null,
          ciudad: client.ciudad.trim() || null,
        });

      if (clienteError) {
        throw new Error(
          `Error creando cliente: ${getSupabaseErrorMessage(clienteError)}`,
        );
      }

      const { error: cotizacionError } = await supabase
        .from("cotizaciones")
        .insert({
          id: cotizacionId,
          codigo,
          cliente_id: clienteId,
          estado: "enviada_whatsapp",
          subtotal: totals.subtotal,
          iva: totals.iva,
          total_estimado: totals.total,
          mensaje_whatsapp: message,
          observaciones: client.observaciones.trim() || null,
        });

      if (cotizacionError) {
        throw new Error(
          `Error creando cotización: ${getSupabaseErrorMessage(cotizacionError)}`,
        );
      }

      const additionalSnapshot = selectedAdditionals.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        tipo_cobro: item.tipo_cobro,
        precio: item.precio,
        costo_calculado: additionalCost(item, cantidad, totals.base),
      }));

      const { error: itemError } = await supabase.from("cotizacion_items").insert({
        id: cotizacionItemId,
        cotizacion_id: cotizacionId,
        producto_id: detalle.id,
        customizacion_posible_id:
          selectedCustomization?.customizacion_posible_id ?? null,
        cantidad,
        nombre_producto_snapshot: detalle.nombre,
        nombre_customizacion_snapshot: selectedCustomization?.nombre ?? null,
        precio_unitario_snapshot: totals.unitPrice,
        costo_fijo_customizacion_snapshot: selectedCustomization?.costo_fijo ?? 0,
        costo_unitario_customizacion_snapshot:
          selectedCustomization?.costo_unitario_extra ?? 0,
        adicionales_snapshot: additionalSnapshot,
        subtotal: totals.subtotal,
      });

      if (itemError) {
        throw new Error(
          `Error creando item de cotización: ${getSupabaseErrorMessage(itemError)}`,
        );
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error("Error guardando cotización:", error);
      setFormError(getSupabaseErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400/60";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Configura tu pedido
        </p>

        <label className="mt-6 block text-sm font-medium text-zinc-200">
          Cantidad
          <input
            type="number"
            min={detalle.cantidad_minima}
            step="1"
            value={cantidad}
            onChange={(event) => setCantidad(Number(event.target.value))}
            className={inputClass}
            required
          />
          <span className="mt-2 block text-xs text-zinc-500">
            Pedido mínimo: {detalle.cantidad_minima.toLocaleString("es-CO")} unidades
          </span>
        </label>

        {detalle.customizaciones.length > 0 ? (
          <label className="mt-6 block text-sm font-medium text-zinc-200">
            Personalización
            <select
              value={customizationId}
              onChange={(event) => setCustomizationId(event.target.value)}
              className={inputClass}
              required
            >
              <option value="">Selecciona una opción</option>
              {detalle.customizaciones.map((item) => (
                <option key={item.customizacion_posible_id} value={item.customizacion_posible_id}>
                  {item.nombre} — fijo {formatCOP(item.costo_fijo)} + {formatCOP(item.costo_unitario_extra)}/unidad
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {detalle.adicionales.length > 0 ? (
          <fieldset className="mt-7">
            <legend className="text-sm font-medium text-zinc-200">Adicionales</legend>
            <div className="mt-3 space-y-3">
              {detalle.adicionales.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-zinc-950/70 p-4"
                >
                  <input
                    type="checkbox"
                    checked={additionalIds.includes(item.id)}
                    onChange={() => toggleAdditional(item.id)}
                    className="mt-1 h-4 w-4 accent-amber-400"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-white">{item.nombre}</span>
                    {item.descripcion ? (
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">
                        {item.descripcion}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm font-semibold text-zinc-300">
                    {item.tipo_cobro === "porcentaje"
                      ? `${item.precio}%`
                      : formatCOP(item.precio)}
                    {item.tipo_cobro === "por_unidad" ? "/u" : ""}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-white">Resumen estimado</h2>
        <dl className="mt-6 space-y-3 text-sm">
          {[
            ["Precio unitario", totals.tier ? formatCOP(totals.unitPrice) : "Sin precio"],
            ["Subtotal base", formatCOP(totals.base)],
            ["Costo de personalización", formatCOP(totals.customization)],
            ["Costo de adicionales", formatCOP(totals.additionals)],
            ["Subtotal", formatCOP(totals.subtotal)],
            ["IVA 19%", formatCOP(totals.iva)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-zinc-400">
              <dt>{label}</dt>
              <dd className="font-medium text-zinc-200">{value}</dd>
            </div>
          ))}
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
            <dt className="font-semibold text-white">Total estimado</dt>
            <dd className="text-2xl font-bold text-amber-400">{formatCOP(totals.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-white">Datos de contacto</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Usaremos estos datos para dar seguimiento comercial a tu solicitud.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-200">
            Nombre *
            <input value={client.nombre} onChange={(e) => updateClient("nombre", e.target.value)} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-zinc-200">
            Empresa
            <input value={client.empresa} onChange={(e) => updateClient("empresa", e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-zinc-200">
            Teléfono *
            <input type="tel" value={client.telefono} onChange={(e) => updateClient("telefono", e.target.value)} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-zinc-200">
            Email
            <input type="email" value={client.email} onChange={(e) => updateClient("email", e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-zinc-200 sm:col-span-2">
            Ciudad
            <input value={client.ciudad} onChange={(e) => updateClient("ciudad", e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-zinc-200 sm:col-span-2">
            Observaciones
            <textarea rows={4} value={client.observaciones} onChange={(e) => updateClient("observaciones", e.target.value)} className={inputClass} placeholder="Cuéntanos sobre fechas, colores o requerimientos especiales." />
          </label>
        </div>
      </section>

      {formError ? (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-14 w-full items-center justify-center rounded-full bg-amber-400 px-7 font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando cotización…" : "Enviar cotización por WhatsApp"}
      </button>
    </form>
  );
}
