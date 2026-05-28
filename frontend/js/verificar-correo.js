import api from "./api.js";
import { mostrarError, mostrarExito } from "./ui.js";

const params = new URLSearchParams(window.location.search);
const initialCorreo =
  params.get("correo") ||
  sessionStorage.getItem("pendingVerificationEmail") ||
  localStorage.getItem("correo") ||
  "";
const initialCodigo = params.get("codigo") || "";

const maskedEmailEl = document.getElementById("maskedEmail");
const codeInputs = Array.from(document.querySelectorAll(".otp-input"));
const result = document.getElementById("result");
const timerEl = document.getElementById("timer");
const resendLink = document.getElementById("resendLink");
const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendBtn");
const form = document.getElementById("verifyForm");

const storageKey = `agromarket.verification.expiry.${initialCorreo.toLowerCase() || "default"}`;
let countdownTimer = null;

function maskEmail(correo) {
  if (!correo || !correo.includes("@")) return correo || "tu correo";
  const [user, domain] = correo.split("@");
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function setResult(message, kind = "info") {
  if (!result) return;
  result.textContent = message;
  result.className = `verification-state visible${kind === "error" ? " error" : ""}`;
}

function setCode(value = "") {
  const digits = String(value).replace(/\D/g, "").slice(0, 6).split("");
  codeInputs.forEach((input, index) => {
    input.value = digits[index] || "";
  });
}

function getCode() {
  return codeInputs.map((input) => input.value.trim()).join("");
}

function updateButtonState() {
  const complete = getCode().length === 6;
  if (verifyBtn) {
    verifyBtn.disabled = !complete;
  }
  return complete;
}

function secondsToClock(seconds) {
  const safe = Math.max(seconds, 0);
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const remaining = String(safe % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function getExpiry() {
  const raw = localStorage.getItem(storageKey);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > Date.now() ? parsed : null;
}

function setExpiry(durationMs = 15 * 60 * 1000) {
  const current = getExpiry();
  if (current) return current;
  const expiry = Date.now() + durationMs;
  localStorage.setItem(storageKey, String(expiry));
  return expiry;
}

function renderCountdown() {
  const expiry = getExpiry() || setExpiry();
  const remainingSeconds = Math.ceil((expiry - Date.now()) / 1000);

  if (timerEl) {
    timerEl.textContent = secondsToClock(remainingSeconds);
  }

  const canResend = remainingSeconds <= 0;
  if (resendLink) {
    resendLink.classList.toggle("is-disabled", !canResend);
    resendLink.setAttribute("aria-disabled", String(!canResend));
  }
  if (resendBtn) {
    resendBtn.disabled = !canResend;
  }

  if (remainingSeconds <= 0) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    if (timerEl) timerEl.textContent = "00:00";
    if (resendLink) resendLink.classList.remove("is-disabled");
    if (resendBtn) resendBtn.disabled = false;
    return;
  }
}

function startCountdown() {
  clearInterval(countdownTimer);
  renderCountdown();
  countdownTimer = window.setInterval(renderCountdown, 1000);
}

async function verifyCode() {
  if (!initialCorreo) {
    setResult("No encontramos un correo para verificar.", "error");
    return;
  }

  const codigo = getCode();
  if (codigo.length !== 6) {
    setResult("Ingresa el código completo de 6 dígitos.", "error");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verificando...";

  try {
    await api.verifyEmailCode(initialCorreo, codigo);
    sessionStorage.removeItem("pendingVerificationEmail");
    setResult("Correo verificado. Redirigiendo al inicio de sesión...");
    mostrarExito("Correo verificado correctamente.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);
  } catch (error) {
    const message =
      error?.mensaje || error?.message || "No se pudo verificar el correo.";
    setResult(message, "error");
    mostrarError(result, message);
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verificar código";
    updateButtonState();
  }
}

async function resendCode(event) {
  event?.preventDefault();
  if (!initialCorreo) {
    setResult("No encontramos un correo para reenviar el código.", "error");
    return;
  }

  const expiry = getExpiry();
  if (expiry && expiry > Date.now()) return;

  if (resendBtn) {
    resendBtn.disabled = true;
  }

  try {
    await api.resendVerification(initialCorreo);
    setExpiry();
    startCountdown();
    setResult("Código reenviado. Revisa tu correo.");
    mostrarExito("Te enviamos un nuevo código de verificación.");
  } catch (error) {
    const message =
      error?.mensaje || error?.message || "No se pudo reenviar el código.";
    setResult(message, "error");
    mostrarError(result, message);
  } finally {
    if (resendBtn) {
      resendBtn.disabled = false;
    }
  }
}

function focusIndex(index) {
  const target = codeInputs[index];
  if (target) target.focus();
}

codeInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 1);
    event.target.value = value;

    if (value && index < codeInputs.length - 1) {
      focusIndex(index + 1);
    }
    updateButtonState();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      focusIndex(index - 1);
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setCode(text);
    const nextIndex = Math.min(text.length, codeInputs.length - 1);
    focusIndex(nextIndex);
    updateButtonState();
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  verifyCode();
});

resendLink?.addEventListener("click", resendCode);
resendBtn?.addEventListener("click", resendCode);

if (maskedEmailEl) {
  maskedEmailEl.textContent = maskEmail(initialCorreo);
}

if (initialCodigo && initialCodigo.length === 6) {
  setCode(initialCodigo);
  updateButtonState();
}

if (initialCorreo) {
  sessionStorage.setItem("pendingVerificationEmail", initialCorreo);
} else {
  setResult("No encontramos un correo para verificar.", "error");
  if (verifyBtn) verifyBtn.disabled = true;
  if (resendLink) resendLink.classList.add("is-disabled");
}

setExpiry();
startCountdown();
updateButtonState();
