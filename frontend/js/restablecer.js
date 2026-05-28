import api from "./api.js";

const form = document.getElementById("resetForm");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");
const result = document.getElementById("result");

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  passwordError.textContent = "";
  confirmError.textContent = "";
  result.textContent = "";
  const pass = passwordInput.value.trim();
  const conf = confirmInput.value.trim();
  if (pass.length < 8) {
    passwordError.textContent =
      "La contraseña debe tener al menos 8 caracteres.";
    return;
  }
  if (pass !== conf) {
    confirmError.textContent = "Las contraseñas no coinciden.";
    return;
  }
  const token = getQueryParam("token");
  if (!token) {
    result.textContent = "Token de restablecimiento faltante.";
    return;
  }
  try {
    await api.confirmPasswordReset(token, pass);
    result.textContent =
      "Contraseña restablecida. Puedes iniciar sesión con tu nueva contraseña.";
    form.reset();
  } catch (err) {
    result.textContent = err?.message || "Error al restablecer la contraseña.";
  }
});
