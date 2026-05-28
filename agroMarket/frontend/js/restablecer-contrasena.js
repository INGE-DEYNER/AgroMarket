function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const nueva = document.getElementById("nueva");
  const confirm = document.getElementById("confirm");
  const form = document.getElementById("restablecer-form");
  const status = document.getElementById("status");

  const checks = {
    length: document.getElementById("c-length"),
    upper: document.getElementById("c-upper"),
    number: document.getElementById("c-number"),
    special: document.getElementById("c-special"),
  };

  function validatePassword(pw) {
    const r = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
    Object.entries(r).forEach(
      ([k, v]) => (checks[k].className = v ? "ok" : ""),
    );
    return Object.values(r).every(Boolean);
  }

  nueva.addEventListener("input", () => validatePassword(nueva.value));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "hidden";
    const token = getQueryParam("token");
    const pw = nueva.value.trim();
    const pw2 = confirm.value.trim();
    if (!token) {
      status.textContent = "Token no encontrado en la URL.";
      status.className = "error";
      return;
    }
    if (pw !== pw2) {
      status.textContent = "Las contraseñas no coinciden.";
      status.className = "error";
      return;
    }
    if (!validatePassword(pw)) {
      status.textContent = "La contraseña no cumple los requisitos.";
      status.className = "error";
      return;
    }

    try {
      await apiPost("/auth/restablecer-contrasena", {
        token,
        nuevaContrasena: pw,
      });
      status.textContent = "Contraseña restablecida. Redirigiendo al login...";
      status.className = "success";
      setTimeout(() => (window.location.href = "/login.html"), 2000);
    } catch (err) {
      console.error(err);
      status.textContent = err?.message || "Error restableciendo contraseña.";
      status.className = "error";
    }
  });
});
