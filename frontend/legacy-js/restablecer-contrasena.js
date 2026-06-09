import api from "./api.js";
import { mostrarError, mostrarExito } from "./ui.js";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const form = document.getElementById("resetForm");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const strengthLabel = document.getElementById("strengthLabel");
const strengthBar = document.getElementById("strengthBar");
const reqLength = document.getElementById("reqLength");
const reqUpper = document.getElementById("reqUpper");
const reqNumber = document.getElementById("reqNumber");
const reqSpecial = document.getElementById("reqSpecial");
const togglePasswordBtn = document.getElementById("togglePassword");
const toggleConfirmPasswordBtn = document.getElementById(
  "toggleConfirmPassword",
);

function setResult(message, kind = "info") {
  if (!result) return;
  result.textContent = message;
  result.className = `result-box visible${kind === "error" ? " error" : ""}`;
}

function passwordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(value),
  };
}

function updateStrength() {
  const value = passwordInput.value;
  const rules = passwordRules(value);
  const count = Object.values(rules).filter(Boolean).length;
  const pct = (count / 4) * 100;

  if (strengthBar) {
    strengthBar.style.width = `${pct}%`;
    strengthBar.style.background =
      pct <= 25
        ? "#dc2626"
        : pct <= 50
          ? "#f59e0b"
          : pct <= 75
            ? "#84cc16"
            : "#2d7a3a";
  }
  if (strengthLabel) {
    strengthLabel.textContent =
      count <= 1
        ? "Débil"
        : count === 2
          ? "Aceptable"
          : count === 3
            ? "Fuerte"
            : "Muy fuerte";
    strengthLabel.style.color =
      pct <= 25
        ? "#dc2626"
        : pct <= 50
          ? "#b45309"
          : pct <= 75
            ? "#4d7c0f"
            : "#2d7a3a";
  }
  if (reqLength)
    reqLength.textContent = `${rules.length ? "✓" : "•"} Mínimo 8 caracteres`;
  if (reqUpper)
    reqUpper.textContent = `${rules.upper ? "✓" : "•"} Una mayúscula`;
  if (reqNumber)
    reqNumber.textContent = `${rules.number ? "✓" : "•"} Un número`;
  if (reqSpecial)
    reqSpecial.textContent = `${rules.special ? "✓" : "•"} Un carácter especial`;

  return rules;
}

function setFieldState(input, errorEl, message, valid) {
  if (!input) return;
  input.classList.remove("error");
  input.style.borderColor = "";
  input.style.boxShadow = "";

  if (valid) {
    input.style.borderColor = "#2d7a3a";
    input.style.boxShadow = "0 0 0 4px rgba(45, 122, 58, 0.08)";
  } else if (message) {
    input.classList.add("error");
    input.style.borderColor = "#dc2626";
    input.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.08)";
  }

  if (errorEl) {
    errorEl.textContent = message || errorEl.textContent;
    errorEl.classList.toggle("visible", Boolean(message && !valid));
  }
}

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

function validatePassword(showError = false) {
  const value = passwordInput.value;
  const rules = updateStrength();
  const valid = rules.length && rules.upper && rules.number && rules.special;

  if (!value && !showError) {
    setFieldState(passwordInput, passwordError, "", true);
    return false;
  }

  if (!valid) {
    setFieldState(
      passwordInput,
      passwordError,
      "Debe tener 8 caracteres, una mayúscula, un número y un carácter especial.",
      false,
    );
    return false;
  }

  setFieldState(passwordInput, passwordError, "", true);
  return true;
}

function validateConfirm(showError = false) {
  const value = confirmInput.value;
  const matches = value && value === passwordInput.value;

  if (!value && !showError) {
    setFieldState(confirmInput, confirmError, "", true);
    return false;
  }

  if (!matches) {
    setFieldState(
      confirmInput,
      confirmError,
      "Las contraseñas no coinciden.",
      false,
    );
    return false;
  }

  setFieldState(confirmInput, confirmError, "", true);
  return true;
}

if (!token) {
  setResult("El enlace no contiene un token válido.", "error");
  if (submitBtn) submitBtn.disabled = true;
}

passwordInput?.addEventListener("input", () => {
  validatePassword(false);
  if (confirmInput.value) {
    validateConfirm(false);
  }
});
passwordInput?.addEventListener("blur", () => validatePassword(true));
confirmInput?.addEventListener("input", () => validateConfirm(false));
confirmInput?.addEventListener("blur", () => validateConfirm(true));
togglePasswordBtn?.addEventListener("click", () =>
  togglePasswordVisibility(passwordInput, togglePasswordBtn),
);
toggleConfirmPasswordBtn?.addEventListener("click", () =>
  togglePasswordVisibility(confirmInput, toggleConfirmPasswordBtn),
);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setResult("", "info");

  if (!token) {
    setResult("El enlace no contiene un token válido.", "error");
    return;
  }

  const isPasswordValid = validatePassword(true);
  const isConfirmValid = validateConfirm(true);
  if (!isPasswordValid || !isConfirmValid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Restableciendo...";

  try {
    await api.confirmPasswordReset(token, passwordInput.value);
    setResult(
      "Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...",
    );
    mostrarExito("Contraseña restablecida con éxito.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);
  } catch (error) {
    const message =
      error?.mensaje ||
      error?.message ||
      "No se pudo restablecer la contraseña.";
    setResult(message, "error");
    mostrarError(result, message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Restablecer contraseña";
  }
});

updateStrength();
