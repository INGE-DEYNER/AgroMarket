import api from "./api.js";

const result = document.getElementById("result");
const token = new URLSearchParams(window.location.search).get("token");

async function run() {
  if (!token) {
    result.textContent = "Token faltante.";
    return;
  }
  try {
    await api.verifyEmail(token);
    result.textContent = "Correo verificado. Ya puedes iniciar sesión.";
    setTimeout(() => (window.location.href = "login.html"), 2000);
  } catch (err) {
    result.textContent = err?.message || "Error al verificar el correo.";
  }
}

run();
