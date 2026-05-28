import api from "./api.js";
import Auth from "./auth.js";
import { mostrarExito } from "./ui.js";

let currentRole = "comprador";

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");
const passwordStrengthLabel = document.getElementById("passwordStrengthLabel");
const passwordStrengthBar = document.getElementById("passwordStrengthBar");
const reqLength = document.getElementById("reqLength");
const reqUpper = document.getElementById("reqUpper");
const reqNumber = document.getElementById("reqNumber");
const reqSpecial = document.getElementById("reqSpecial");

function setFieldState(input, errorEl, message, isValid) {
  if (!input) return;
  input.classList.remove("error");
  input.style.borderColor = "";
  input.style.boxShadow = "";

  if (isValid) {
    input.style.borderColor = "#2d6a2d";
    input.style.boxShadow = "0 0 0 3px rgba(45, 106, 45, 0.08)";
  } else if (message) {
    input.classList.add("error");
    input.style.borderColor = "#e53935";
    input.style.boxShadow = "0 0 0 3px rgba(229, 57, 53, 0.08)";
  }

  if (errorEl) {
    errorEl.textContent = message || errorEl.textContent;
    errorEl.classList.toggle("visible", Boolean(message && !isValid));
  }
}

function passwordRules(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(value),
  };
}

function updatePasswordStrength() {
  const value = document.getElementById("password").value;
  const rules = passwordRules(value);
  const satisfied = Object.values(rules).filter(Boolean).length;
  const pct = (satisfied / 4) * 100;

  if (passwordStrengthBar) {
    passwordStrengthBar.style.width = `${pct}%`;
    passwordStrengthBar.style.background =
      pct <= 25
        ? "#dc2626"
        : pct <= 50
          ? "#f59e0b"
          : pct <= 75
            ? "#84cc16"
            : "#2d6a2d";
  }
  if (passwordStrengthLabel) {
    passwordStrengthLabel.textContent =
      satisfied <= 1
        ? "Débil"
        : satisfied === 2
          ? "Aceptable"
          : satisfied === 3
            ? "Fuerte"
            : "Muy fuerte";
    passwordStrengthLabel.style.color =
      pct <= 25
        ? "#dc2626"
        : pct <= 50
          ? "#b45309"
          : pct <= 75
            ? "#4d7c0f"
            : "#2d6a2d";
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
  const rules = passwordRules(value);
  return rules.length && rules.upper && rules.number && rules.special;
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

document.getElementById("password")?.addEventListener("input", () => {
  updatePasswordStrength();
  const value = document.getElementById("password").value;
  if (!value) {
    setFieldState(
      document.getElementById("password"),
      document.getElementById("passwordError"),
      "",
      true,
    );
  }
});

document.getElementById("confirmPass")?.addEventListener("input", () => {
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPass").value;
  const confirmInput = document.getElementById("confirmPass");
  const confirmError = document.getElementById("confirmError");
  if (!confirm) {
    setFieldState(confirmInput, confirmError, "", true);
    return;
  }
  setFieldState(
    confirmInput,
    confirmError,
    confirm === password ? "" : "Las contraseñas no coinciden.",
    confirm === password,
  );
});

document.getElementById("nombre")?.addEventListener("input", () => {
  const input = document.getElementById("nombre");
  const error = document.getElementById("nombreError");
  setFieldState(
    input,
    error,
    input.value.trim() ? "" : "El nombre es requerido.",
    Boolean(input.value.trim()),
  );
});

document.getElementById("email")?.addEventListener("input", () => {
  const input = document.getElementById("email");
  const error = document.getElementById("emailError");
  const value = input.value.trim();
  if (!value) {
    setFieldState(input, error, "", true);
    return;
  }
  setFieldState(
    input,
    error,
    validEmail(value) ? "" : "Ingresa un correo válido.",
    validEmail(value),
  );
});

document.getElementById("telefono")?.addEventListener("input", () => {
  const input = document.getElementById("telefono");
  const error = document.getElementById("telefonoError");
  const value = input.value.trim();
  if (!value) {
    setFieldState(input, error, "", true);
    return;
  }
  setFieldState(
    input,
    error,
    validPhone(value) ? "" : "Debe tener 10 dígitos numéricos.",
    validPhone(value),
  );
});

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
  updatePasswordStrength();
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
    sessionStorage.setItem("pendingVerificationEmail", correo);
    if (successMsg) successMsg.classList.add("visible");
    mostrarExito("Cuenta creada. Revisa tu correo para verificar la cuenta.");
    setTimeout(() => {
      window.location.href = `verificar-correo.html?correo=${encodeURIComponent(correo)}`;
    }, 2000);
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
updatePasswordStrength();
