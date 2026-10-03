import Icon from "@/presentation/shared/components/Icon";

/* ============================================================
   PaymentLogo — logos REALES de medios de pago.

   Regla del proyecto: nunca un <img> roto y nunca un emoji.
   1. Si existe el SVG oficial en /public/payments -> se muestra el SVG.
   2. Si no hay asset oficial del emisor -> se muestra un icono SVG real
      del sistema <Icon> acompañado del nombre del emisor.

   Para añadir una marca nueva: coloca el SVG oficial en
   frontend/public/payments/<clave>.svg y añádela al mapa OFFICIAL.
   ============================================================ */

const OFFICIAL = {
  visa: { src: "/payments/visa.svg", label: "Visa" },
  mastercard: { src: "/payments/mastercard.svg", label: "Mastercard" },
  mercadopago: { src: "/payments/mercadopago.svg", label: "Mercado Pago" },
  pse: { src: "/payments/pse.svg", label: "PSE" },
  nequi: { src: "/payments/nequi.svg", label: "Nequi" },
  daviplata: { src: "/payments/daviplata.svg", label: "Daviplata" },
};

const FALLBACK_ICON = {
  amex: "card",
  bancolombia: "bank",
  davivienda: "bank",
  banco_bogota: "bank",
  card: "card",
  bank: "bank",
  cash: "banknote",
  cashOnDelivery: "banknote",
  wallet: "wallet",
};

export default function PaymentLogo({
  method,
  className = "payment-logo",
  altFallback,
  showName = true,
}) {
  const official = OFFICIAL[method];

  if (official) {
    return (
      <img
        className={className}
        src={official.src}
        alt={altFallback || official.label}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const nombre = altFallback || method;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      title={nombre}
    >
      <Icon name={FALLBACK_ICON[method] || "card"} size={14} />
      {showName && <span>{nombre}</span>}
    </span>
  );
}
