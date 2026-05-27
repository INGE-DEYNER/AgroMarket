import api from "./api.js";
import { guardarSesion, normalizarRol } from "./auth.js";
import { mostrarError, mostrarExito } from "./ui.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const globalError = document.getElementById("globalError");
const submitBtn = document.getElementById("submitBtn");

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

function showFieldError(input, errorEl, message) {
  input?.classList.add("error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }
}

function redirectByRole(role) {
  const normalized = normalizarRol(role);
  const routes = {
    admin: "admin.html",
    productor: "dashboard-productor.html",
    comprador: "dashboard-comprador.html",
  };
  window.location.href = routes[normalized] || "home.html";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const correo = emailInput.value.trim();
  const contrasena = passwordInput.value;
  let isValid = true;

  if (!correo) {
    showFieldError(emailInput, emailError, "El correo es requerido.");
    isValid = false;
  } else if (!isValidEmail(correo)) {
    showFieldError(emailInput, emailError, "Ingresa un correo válido.");
    isValid = false;
  }

  if (!contrasena) {
    showFieldError(passwordInput, passwordError, "La contraseña es requerida.");
    isValid = false;
  }

  if (!isValid) return;

  submitBtn.textContent = "Verificando...";
  submitBtn.disabled = true;

  try {
    const authResponse = await api.login(correo, contrasena);
    guardarSesion(authResponse);
    mostrarExito(`Bienvenido, ${authResponse.nombre || correo}`);
    redirectByRole(authResponse.rol || authResponse.tipo);
  } catch (error) {
    const message = error?.message || "No se pudo iniciar sesión.";
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
