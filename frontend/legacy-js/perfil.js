import api from "./api.js";
import Auth from "./auth.js";
import { mostrarError, mostrarExito, escapeHtml } from "./ui.js";

Auth.requireRole(["comprador", "productor", "administrador", "admin"]);

// ── DOM refs ──────────────────────────────────────────────────────────────────
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const telefonoInput = document.getElementById("telefono");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const avatarLoading = document.getElementById("avatarLoading");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const savePasswordBtn = document.getElementById("savePasswordBtn");
const profileAlert = document.getElementById("profileAlert");
const passwordAlert = document.getElementById("passwordAlert");
const sidebarName = document.getElementById("sidebarUserName");
const sidebarRole = document.getElementById("sidebarUserRole");
const sidebarAvatar = document.getElementById("sidebarUserAvatar");
const backBtn = document.getElementById("backToDashboardBtn");

// password fields
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const strengthLabel = document.getElementById("strengthLabel");
const strengthBar = document.getElementById("strengthBar");
const reqLength = document.getElementById("reqLength");
const reqUpper = document.getElementById("reqUpper");
const reqNumber = document.getElementById("reqNumber");
const reqSpecial = document.getElementById("reqSpecial");
const twoFactorStatus = document.getElementById("twoFactorStatus");
const twoFactorSetupBox = document.getElementById("twoFactorSetupBox");
const twoFactorSecret = document.getElementById("twoFactorSecret");
const twoFactorOtpUrl = document.getElementById("twoFactorOtpUrl");
const twoFactorCode = document.getElementById("twoFactorCode");
const btnInit2FA = document.getElementById("btnInit2FA");
const btnEnable2FA = document.getElementById("btnEnable2FA");
const btnDisable2FA = document.getElementById("btnDisable2FA");

// ── Alert helpers ─────────────────────────────────────────────────────────────
function showAlert(el, message, kind = "success") {
  if (!el) return;
  el.textContent = message;
  el.className = `alert-box ${kind}`;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 5000);
}

// ── Password strength ─────────────────────────────────────────────────────────
function passwordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(value),
  };
}

function updateStrength() {
  const value = newPasswordInput ? newPasswordInput.value : "";
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

// ── Back-to-dashboard navigation ──────────────────────────────────────────────
function resolverDashboard() {
  const user = Auth.getUsuario();
  if (!user) return "login.html";
  const rol = (user.rol || "").toString().toUpperCase();
  if (rol === "PRODUCTOR") return "dashboard-productor.html";
  if (rol === "ADMINISTRADOR" || rol === "ADMIN") return "admin.html";
  return "dashboard-comprador.html";
}

backBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = resolverDashboard();
});

// ── Render sidebar ────────────────────────────────────────────────────────────
function renderSidebar(user) {
  if (!user) return;
  if (sidebarName) sidebarName.textContent = user.nombre || "Usuario";
  if (sidebarRole) {
    const rol = (user.rol || "usuario").toString();
    sidebarRole.textContent =
      rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
  }
  if (sidebarAvatar) {
    sidebarAvatar.textContent = (user.nombre || "U")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
}

function setTwoFactorStatus(enabled) {
  if (!twoFactorStatus) return;
  twoFactorStatus.textContent = enabled
    ? "Estado: autenticación en dos pasos ACTIVADA"
    : "Estado: autenticación en dos pasos DESACTIVADA";
  twoFactorStatus.className = `alert-box ${enabled ? "success" : "info"}`;

  if (btnDisable2FA)
    btnDisable2FA.style.display = enabled ? "inline-flex" : "none";
}

async function loadTwoFactorStatus() {
  try {
    const status = await api.getTwoFactorStatus();
    setTwoFactorStatus(Boolean(status?.enabled));
  } catch (_error) {
    setTwoFactorStatus(false);
  }
}

// ── Load profile ──────────────────────────────────────────────────────────────
async function cargarPerfil() {
  try {
    const perfil = await api.getPerfil();
    if (nombreInput) nombreInput.value = perfil.nombre || "";
    if (correoInput) correoInput.value = perfil.correo || "";
    if (telefonoInput) telefonoInput.value = perfil.telefono || "";

    // Photo
    if (avatarPreview && perfil.fotoPerfil) {
      avatarPreview.src = perfil.fotoPerfil;
    } else if (avatarPreview && perfil.nombre) {
      // keep placeholder; we don't have a foto field yet on the entity
    }

    renderSidebar(perfil);
  } catch (err) {
    showAlert(
      profileAlert,
      err?.mensaje || err?.message || "No se pudo cargar el perfil.",
      "error",
    );
  }
}

// ── Profile form submit ───────────────────────────────────────────────────────
profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = (nombreInput?.value || "").trim();
  const telefono = (telefonoInput?.value || "").trim();

  if (!nombre) {
    document.getElementById("nombreError")?.classList.add("visible");
    return;
  }
  document.getElementById("nombreError")?.classList.remove("visible");

  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = "Guardando...";

  try {
    await api.actualizarPerfil({ nombre, telefono });
    showAlert(profileAlert, "Perfil actualizado correctamente.", "success");
    renderSidebar({ nombre, rol: Auth.getUsuario()?.rol });
  } catch (err) {
    showAlert(
      profileAlert,
      err?.mensaje || err?.message || "No se pudo actualizar el perfil.",
      "error",
    );
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = "Guardar Cambios";
  }
});

// ── Avatar upload ─────────────────────────────────────────────────────────────
avatarInput?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_MB = 5 * 1024 * 1024;

  if (!ALLOWED.includes(file.type)) {
    showAlert(
      profileAlert,
      "Solo se permiten imágenes JPG, PNG o WEBP.",
      "error",
    );
    avatarInput.value = "";
    return;
  }
  if (file.size > MAX_MB) {
    showAlert(profileAlert, "La imagen no puede superar 5 MB.", "error");
    avatarInput.value = "";
    return;
  }

  // Preview local antes de subir
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (avatarPreview) avatarPreview.src = ev.target.result;
  };
  reader.readAsDataURL(file);

  // Subir al servidor usando XHR con progreso
  if (avatarLoading) avatarLoading.style.display = "flex";
  try {
    // El backend todavía no tiene endpoint /usuarios/foto – usamos actualizarPerfil
    // con un FormData si el backend lo acepta. Como no existe, guardamos en localStorage
    // como base64 para preview local. En producción, agregar endpoint.
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    localStorage.setItem("fotoPerfil", base64);
    showAlert(
      profileAlert,
      "Foto de perfil actualizada localmente.",
      "success",
    );
  } catch (err) {
    showAlert(profileAlert, "No se pudo subir la foto.", "error");
  } finally {
    if (avatarLoading) avatarLoading.style.display = "none";
  }
});

// ── Password form submit ──────────────────────────────────────────────────────
newPasswordInput?.addEventListener("input", updateStrength);

passwordForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPass = currentPasswordInput?.value || "";
  const newPass = newPasswordInput?.value || "";
  const confirmPass = confirmPasswordInput?.value || "";

  // Validar contraseña actual
  if (!currentPass) {
    document.getElementById("currentPasswordError")?.classList.add("visible");
    return;
  }
  document.getElementById("currentPasswordError")?.classList.remove("visible");

  // Validar nueva contraseña
  const rules = passwordRules(newPass);
  const valid = rules.length && rules.upper && rules.number && rules.special;
  if (!valid) {
    document.getElementById("newPasswordError")?.classList.add("visible");
    return;
  }
  document.getElementById("newPasswordError")?.classList.remove("visible");

  // Validar confirmación
  if (newPass !== confirmPass) {
    document.getElementById("confirmPasswordError")?.classList.add("visible");
    return;
  }
  document.getElementById("confirmPasswordError")?.classList.remove("visible");

  savePasswordBtn.disabled = true;
  savePasswordBtn.textContent = "Actualizando...";

  try {
    // Endpoint convencional: PUT /api/usuarios/me con contrasenaActual y nuevaContrasena
    await api.actualizarContrasena({
      contrasenaActual: currentPass,
      nuevaContrasena: newPass,
    });
    showAlert(
      passwordAlert,
      "Contraseña actualizada correctamente.",
      "success",
    );
    passwordForm.reset();
    updateStrength();
  } catch (err) {
    showAlert(
      passwordAlert,
      err?.mensaje || err?.message || "No se pudo actualizar la contraseña.",
      "error",
    );
  } finally {
    savePasswordBtn.disabled = false;
    savePasswordBtn.textContent = "Actualizar Contraseña";
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const user = Auth.getUsuario();
  renderSidebar(user);

  // Restore local photo if present
  const localPhoto = localStorage.getItem("fotoPerfil");
  if (localPhoto && avatarPreview) avatarPreview.src = localPhoto;

  await cargarPerfil();
  await loadTwoFactorStatus();
  updateStrength();
});

btnInit2FA?.addEventListener("click", async () => {
  try {
    const setup = await api.initTwoFactorSetup();
    if (twoFactorSetupBox) twoFactorSetupBox.style.display = "block";
    if (twoFactorSecret) twoFactorSecret.value = setup?.secret || "";
    if (twoFactorOtpUrl) twoFactorOtpUrl.value = setup?.otpauthUrl || "";
    if (btnEnable2FA) btnEnable2FA.style.display = "inline-flex";
    showAlert(
      profileAlert,
      "Configura tu app Authenticator y confirma con el código de 6 dígitos.",
      "info",
    );
  } catch (err) {
    showAlert(
      profileAlert,
      err?.mensaje || err?.message || "No se pudo iniciar configuración 2FA.",
      "error",
    );
  }
});

btnEnable2FA?.addEventListener("click", async () => {
  const code = String(twoFactorCode?.value || "").trim();
  if (!/^[0-9]{6}$/.test(code)) {
    showAlert(profileAlert, "Ingresa un código válido de 6 dígitos.", "error");
    return;
  }
  try {
    await api.confirmTwoFactorSetup(code);
    if (twoFactorSetupBox) twoFactorSetupBox.style.display = "none";
    if (btnEnable2FA) btnEnable2FA.style.display = "none";
    if (twoFactorCode) twoFactorCode.value = "";
    await loadTwoFactorStatus();
    showAlert(
      profileAlert,
      "Autenticación en dos pasos activada correctamente.",
      "success",
    );
  } catch (err) {
    showAlert(
      profileAlert,
      err?.mensaje || err?.message || "No se pudo activar 2FA.",
      "error",
    );
  }
});

btnDisable2FA?.addEventListener("click", async () => {
  const code = globalThis.prompt(
    "Ingresa tu código actual de Authenticator para desactivar 2FA:",
  );
  if (!code) return;
  if (!/^[0-9]{6}$/.test(code)) {
    showAlert(profileAlert, "Código inválido.", "error");
    return;
  }
  try {
    await api.disableTwoFactor(code);
    await loadTwoFactorStatus();
    showAlert(
      profileAlert,
      "Autenticación en dos pasos desactivada.",
      "success",
    );
  } catch (err) {
    showAlert(
      profileAlert,
      err?.mensaje || err?.message || "No se pudo desactivar 2FA.",
      "error",
    );
  }
});
