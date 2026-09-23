// src/presentation/shared/components/MicroInteractionPrimitives.jsx
import { useState } from "react";
import Icon from "@/presentation/shared/components/Icon";
import "@/presentation/styles/microinteractions.css";

export function Tooltip({ children, label, className = "" }) {
  return (
    <span className={`am-tooltip ${className}`.trim()} data-tooltip={label}>
      {children}
    </span>
  );
}

export function CheckoutStepper({
  currentStep = 1,
  steps = ["Envío", "Pago", "Confirmación"],
}) {
  return (
    <nav className="am-checkout-stepper" aria-label="Progreso del checkout">
      {steps.map((label, index) => {
        const step = index + 1;
        const state =
          step < currentStep
            ? "is-complete"
            : step === currentStep
              ? "is-active"
              : "";
        return (
          <div className={`am-step ${state}`} key={label}>
            <span
              className="am-step__number"
              aria-current={step === currentStep ? "step" : undefined}
            >
              {step < currentStep ? <Icon name="check" size={14} /> : step}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = Infinity,
  ariaLabel = "Cantidad",
}) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;

  const decrement = () => onChange(Math.max(min, safeValue - 1));
  const increment = () => onChange(Math.min(max, safeValue + 1));

  return (
    <div className="am-quantity" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={decrement}
        disabled={safeValue <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <output aria-live="polite">{safeValue}</output>
      <button
        type="button"
        onClick={increment}
        disabled={safeValue >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}

export function FavoriteButton({
  selected = false,
  onToggle,
  label = "Guardar favorito",
  className = "",
}) {
  return (
    <button
      type="button"
      className={`favorite-button ${selected ? "is-selected" : ""} ${className}`.trim()}
      aria-pressed={selected}
      aria-label={selected ? "Quitar de favoritos" : label}
      title={selected ? "Quitar de favoritos" : label}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M20.8 8.9c0 5-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.9A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.6Z"
          fill={selected ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="am-visually-hidden">
        {selected ? "Guardado" : label}
      </span>
    </button>
  );
}

export function EmptyState({
  title = "¡Ups! No hay productos aquí",
  description = "Prueba con otros filtros o categorías.",
  actionLabel = "Explorar productos",
  onAction,
  icon = "leaf",
}) {
  return (
    <section className="am-empty-state" role="status" aria-live="polite">
      <div className="am-empty-state__illustration" aria-hidden="true">
        {typeof icon === "string" && icon.length <= 12 && /^[a-zA-Z]+$/.test(icon) ? <Icon name={icon} size={34} /> : icon}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export function FieldFeedback({
  id,
  label,
  value,
  error = "",
  success = "",
  required = false,
  onChange,
  type = "text",
  placeholder = "",
}) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;
  const stateClass = hasError
    ? "is-error"
    : hasSuccess
      ? "is-success"
      : focused
        ? "is-focused"
        : "";

  return (
    <div className={`am-field ${stateClass}`}>
      <label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        aria-invalid={hasError}
        aria-describedby={hasError || hasSuccess ? `${id}-feedback` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="am-input"
      />
      {(hasError || hasSuccess) && (
        <div
          id={`${id}-feedback`}
          className={`am-field__feedback ${hasError ? "am-field__feedback--error" : "am-field__feedback--success"}`}
          role={hasError ? "alert" : "status"}
        >
          <span aria-hidden="true">{hasError ? <Icon name="alert" size={14} /> : <Icon name="check" size={14} />}</span>
          <span>{hasError || success}</span>
        </div>
      )}
    </div>
  );
}
