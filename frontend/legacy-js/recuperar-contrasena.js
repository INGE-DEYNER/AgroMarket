import api from "./api.js";
import { mostrarError, mostrarExito } from "./ui.js";

const form = document.getElementById("resetRequestForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const prefillEmail = new URLSearchParams(window.location.search).get("correo");

function setResult(message, kind = "info") {
  if (!result) return;
  result.textContent = message;
  result.className = `result-box visible${kind === "error" ? " error" : ""}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateEmail(showError = false) {
  const value = emailInput.value.trim();
  if (!value) {
    if (showError) {
      emailInput.classList.add("error");
      emailError.textContent = "El correo es requerido.";
      emailError.classList.add("visible");
    }
    return false;
  }
  if (!isValidEmail(value)) {
    emailInput.classList.add("error");
    emailError.textContent = "Ingresa un correo válido.";
    emailError.classList.add("visible");
    return false;
  }

  emailInput.classList.remove("error");
  emailError.classList.remove("visible");
  return true;
}

emailInput?.addEventListener("input", () => validateEmail(false));
emailInput?.addEventListener("blur", () => validateEmail(true));

function togglePasswordVisibility(input, button) {
  if (!input || !button) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  button.textContent = isHidden ? "Ocultar" : "Mostrar";
  button.setAttribute(
    "aria-label",
    isHidden ? "Ocultar contraseña" : "Mostrar contraseña",
  );
  button.setAttribute("aria-pressed", String(isHidden));
}

const togglePasswordBtn = document.getElementById("togglePassword");
const toggleConfirmPasswordBtn = document.getElementById(
  "toggleConfirmPassword",
);

togglePasswordBtn?.addEventListener("click", () => {
  togglePasswordVisibility(
    document.getElementById("password"),
    togglePasswordBtn,
  );
});

toggleConfirmPasswordBtn?.addEventListener("click", () => {
  togglePasswordVisibility(
    document.getElementById("confirm"),
    toggleConfirmPasswordBtn,
  );
});
if (prefillEmail) {
  emailInput.value = prefillEmail;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setResult("", "info");

  if (!validateEmail(true)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    await api.requestPasswordReset(emailInput.value.trim());
    setResult(
      "Si el correo existe, recibirás un enlace de recuperación en unos minutos.",
    );
    mostrarExito("Si el correo existe, enviamos el enlace de recuperación.");
  } catch (error) {
    const message =
      error?.mensaje || error?.message || "No se pudo enviar el enlace.";
    setResult(message, "error");
    mostrarError(result, message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar enlace";
  }
});
