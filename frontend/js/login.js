import api from "./api.js";
import Auth, { guardarSesion } from "./auth.js";
import { mostrarError, mostrarExito } from "./ui.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const globalError = document.getElementById("globalError");
const submitBtn = document.getElementById("submitBtn");

function setFieldState(input, errorEl, message, isValid) {
  if (!input) return;
  input.classList.remove("error");
  input.style.borderColor = "";
  input.style.boxShadow = "";

  if (isValid) {
    input.style.borderColor = "#2b7a3b";
    input.style.boxShadow = "0 0 0 4px rgba(43, 122, 59, 0.08)";
  } else if (message) {
    input.classList.add("error");
    input.style.borderColor = "#dc2626";
    input.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.08)";
  }

  if (errorEl) {
    errorEl.textContent = message || errorEl.textContent;
    errorEl.classList.toggle("visible", Boolean(message && !isValid));
  }
}

function clearErrors() {
  [emailInput, passwordInput].forEach((el) => el?.classList.remove("error"));
  [emailError, passwordError].forEach(
    (el) => el && ((el.textContent = ""), el.classList.remove("visible")),
  );
  if (globalError) {
    globalError.textContent = "";
    globalError.classList.remove("visible");
  }
}

function getErrorMessage(error) {
  const fieldErrors = error?.campos ? Object.values(error.campos) : [];
  return (
    error?.mensaje ||
    error?.message ||
    fieldErrors[0] ||
    "No se pudo iniciar sesión."
  );
}

function showFieldError(input, errorEl, message) {
  input?.classList.add("error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }
}

function redirectByRole(role) {
  window.location.href = Auth.resolveDashboardRoute(role);
}

function validateEmailField(showMessage = false) {
  const value = emailInput.value.trim();
  if (!value && !showMessage) {
    setFieldState(emailInput, emailError, "", true);
    return false;
  }
  if (!value) {
    setFieldState(emailInput, emailError, "El correo es requerido.", false);
    return false;
  }
  if (!isValidEmail(value)) {
    setFieldState(emailInput, emailError, "Ingresa un correo válido.", false);
    return false;
  }
  setFieldState(emailInput, emailError, "", true);
  return true;
}

function validatePasswordField(showMessage = false) {
  const value = passwordInput.value;
  if (!value && !showMessage) {
    setFieldState(passwordInput, passwordError, "", true);
    return false;
  }
  if (!value) {
    setFieldState(
      passwordInput,
      passwordError,
      "La contraseña es requerida.",
      false,
    );
    return false;
  }
  setFieldState(passwordInput, passwordError, "", true);
  return true;
}

emailInput?.addEventListener("input", () => validateEmailField(false));
emailInput?.addEventListener("blur", () => validateEmailField(true));
passwordInput?.addEventListener("input", () => validatePasswordField(false));
passwordInput?.addEventListener("blur", () => validatePasswordField(true));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const correo = emailInput.value.trim();
  const contrasena = passwordInput.value;
  let isValid = true;

  if (!validateEmailField(true)) isValid = false;
  if (!validatePasswordField(true)) isValid = false;

  if (!isValid) return;

  submitBtn.textContent = "Verificando...";
  submitBtn.disabled = true;

  try {
    const authResponse = await api.login(correo, contrasena);
    guardarSesion(authResponse);
    mostrarExito(`Bienvenido, ${authResponse.nombre || correo}`);
    redirectByRole(authResponse.rol || authResponse.tipo);
  } catch (error) {
    const message = getErrorMessage(error);
    if (error?.status === 403 && /verific/i.test(message)) {
      sessionStorage.setItem("pendingVerificationEmail", correo);
      window.location.href = `verificar-correo.html?correo=${encodeURIComponent(correo)}`;
      return;
    }
    if (globalError) {
      globalError.textContent = message;
      globalError.classList.add("visible");
    } else {
      mostrarError(document.body, message);
    }
  } finally {
    submitBtn.textContent = "Ingresar";
    submitBtn.disabled = false;
  }
});
