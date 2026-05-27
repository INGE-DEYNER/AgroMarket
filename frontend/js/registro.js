import api from "./api.js";
import { guardarSesion, normalizarRol } from "./auth.js";
import { mostrarExito } from "./ui.js";

let currentRole = "comprador";

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");

function selectRole(role) {
  currentRole = role;
  document.getElementById("rolSelected").value = role;
  document
    .getElementById("roleComprador")
    .classList.toggle("selected", role === "comprador");
  document
    .getElementById("roleProductor")
    .classList.toggle("selected", role === "productor");
  const ubicacionGroup = document.getElementById("ubicacionGroup");
  if (role === "productor") {
    ubicacionGroup.classList.add("visible");
  } else {
    ubicacionGroup.classList.remove("visible");
    document.getElementById("ubicacion").value = "";
  }
}

function clearErrors() {
  document
    .querySelectorAll(".form-input,.form-select")
    .forEach((el) => el.classList.remove("error"));
  document.querySelectorAll(".form-error").forEach((el) => {
    el.textContent = "";
    el.classList.remove("visible");
  });
}

function showErr(inputId, errorId, message) {
  document.getElementById(inputId).classList.add("error");
  const errorEl = document.getElementById(errorId);
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

document
  .getElementById("roleComprador")
  ?.addEventListener("click", () => selectRole("comprador"));
document
  .getElementById("roleProductor")
  ?.addEventListener("click", () => selectRole("productor"));

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const correo = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const contrasena = document.getElementById("password").value;
  const confirmacion = document.getElementById("confirmPass").value;
  const ubicacion = document.getElementById("ubicacion").value.trim();
  let isValid = true;

  if (!nombre) {
    showErr("nombre", "nombreError", "El nombre es requerido.");
    isValid = false;
  }
  if (!apellido) {
    showErr("apellido", "apellidoError", "El apellido es requerido.");
    isValid = false;
  }
  if (!correo || !validEmail(correo)) {
    showErr("email", "emailError", "Ingresa un correo válido.");
    isValid = false;
  }
  if (!telefono) {
    showErr("telefono", "telefonoError", "El teléfono es requerido.");
    isValid = false;
  }
  if (!contrasena || contrasena.length < 6) {
    showErr("password", "passwordError", "Mínimo 6 caracteres.");
    isValid = false;
  }
  if (confirmacion !== contrasena) {
    showErr("confirmPass", "confirmError", "Las contraseñas no coinciden.");
    isValid = false;
  }
  if (currentRole === "productor" && !ubicacion) {
    showErr("ubicacion", "ubicacionError", "La ubicación es requerida.");
    isValid = false;
  }

  if (!isValid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Creando cuenta...";

  try {
    const authResponse = await api.registro({
      nombre,
      apellido,
      correo,
      telefono,
      contrasena,
      rol: currentRole.toUpperCase(),
      ubicacion: currentRole === "productor" ? ubicacion : null,
    });
    guardarSesion(authResponse);
    successMsg?.classList.add("visible");
    mostrarExito("Cuenta creada correctamente.");
    redirectByRole(authResponse.rol || authResponse.tipo);
  } catch (error) {
    const message = error?.message || "No se pudo crear la cuenta.";
    showErr("email", "emailError", message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Crear cuenta";
  }
});

selectRole(currentRole);
