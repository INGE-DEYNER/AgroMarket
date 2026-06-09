import api from "./api.js";

const form = document.getElementById("resetRequestForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const result = document.getElementById("result");

function validEmail(v) {
  return /\S+@\S+\.\S+/.test(v);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailError.textContent = "";
  result.textContent = "";
  const correo = emailInput.value.trim();
  if (!correo || !validEmail(correo)) {
    emailError.textContent = "Ingresa un correo válido.";
    return;
  }
  try {
    await api.requestPasswordReset(correo);
    result.textContent =
      "Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.";
    form.reset();
  } catch (err) {
    result.textContent =
      err?.message || "Ocurrió un error al solicitar el restablecimiento.";
  }
});
