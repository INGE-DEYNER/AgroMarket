import api from "./api.js";
import Auth, { guardarSesion, normalizarRol } from "./auth.js";
import { mostrarExito } from "./ui.js";

let currentRole = "comprador";

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");

function selectRole(role) {
  currentRole = role;
  const inputRol = document.getElementById("rolSelected");
  if (inputRol) inputRol.value = role;

  const roleComp = document.getElementById("roleComprador");
  if (roleComp) roleComp.classList.toggle("selected", role === "comprador");

  const roleProd = document.getElementById("roleProductor");
  if (roleProd) roleProd.classList.toggle("selected", role === "productor");

  const ubicacionGroup = document.getElementById("ubicacionGroup");
  if (role === "productor") {
    if (ubicacionGroup) ubicacionGroup.classList.add("visible");
  } else {
    if (ubicacionGroup) {
      ubicacionGroup.classList.remove("visible");
    }
    const inputUbicacion = document.getElementById("ubicacion");
    if (inputUbicacion) inputUbicacion.value = "";
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
  const input = document.getElementById(inputId);
  if (input) input.classList.add("error");
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  return /^[0-9]{10}$/.test(value);
}

function validPassword(value) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':",.<>/?]).{8,100}$/.test(
    value,
  );
}

function redirectByRole(role) {
  window.location.href = Auth.resolveDashboardRoute(role);
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
  const ubicacion = document.getElementById("ubicacion")?.value.trim() || "";
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
  if (!telefono || !validPhone(telefono)) {
    showErr("telefono", "telefonoError", "Debe tener 10 dígitos numéricos.");
    isValid = false;
  }
  if (!contrasena || !validPassword(contrasena)) {
    showErr(
      "password",
      "passwordError",
      "Debe tener 8 caracteres, una mayúscula, un número y un carácter especial.",
    );
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
    await api.registro({
      nombre,
      apellido,
      correo,
      telefono,
      contrasena,
      rol: currentRole.toUpperCase(),
      ubicacion: currentRole === "productor" ? ubicacion : null,
    });
    if (successMsg) successMsg.classList.add("visible");
    mostrarExito("Cuenta creada. Revisa tu correo para activar la cuenta.");
    setTimeout(() => (window.location.href = "login.html"), 2500);
  } catch (error) {
    const message =
      error?.mensaje || error?.message || "No se pudo crear la cuenta.";
    const campos = error?.campos || {};

    if (Object.keys(campos).length > 0) {
      Object.entries(campos).forEach(([field, fieldMessage]) => {
        const mapping = {
          nombre: ["nombre", "nombreError"],
          apellido: ["apellido", "apellidoError"],
          correo: ["email", "emailError"],
          telefono: ["telefono", "telefonoError"],
          contrasena: ["password", "passwordError"],
          ubicacion: ["ubicacion", "ubicacionError"],
        };
        const target = mapping[field];
        if (target) {
          showErr(target[0], target[1], fieldMessage);
        }
      });
    } else {
      showErr("email", "emailError", message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Crear cuenta";
  }
});

selectRole(currentRole);
