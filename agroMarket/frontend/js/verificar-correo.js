function maskEmail(email) {
  if (!email) return "";
  const parts = email.split("@");
  const name = parts[0];
  const domain = parts[1] || "";
  const visible = name.length <= 2 ? name[0] : name[0] + "***" + name.slice(-1);
  return visible + "@" + domain;
}

document.addEventListener("DOMContentLoaded", () => {
  const digits = Array.from(document.querySelectorAll(".digit"));
  const status = document.getElementById("status");
  const sentTo = document.getElementById("sent-to");
  const timerEl = document.getElementById("timer");
  const resendBtn = document.getElementById("resend");

  // try to read email from query param for display
  const url = new URL(window.location.href);
  const correo = url.searchParams.get("correo");
  if (correo) sentTo.textContent = "Código enviado a " + maskEmail(correo);

  // inputs auto-advance
  digits.forEach((d, i) => {
    d.addEventListener("input", (e) => {
      const v = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = v;
      if (v && i < digits.length - 1) digits[i + 1].focus();
    });
    d.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !d.value && i > 0) digits[i - 1].focus();
    });
  });

  // countdown 15 minutes
  let remaining = 15 * 60; // seconds
  const tick = () => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = mm + ":" + ss;
    if (remaining-- <= 0) {
      resendBtn.disabled = false;
      clearInterval(interval);
    }
  };
  const interval = setInterval(tick, 1000);
  tick();

  document
    .getElementById("verify-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "hidden";
      const token = digits.map((d) => d.value).join("");
      if (token.length !== 6) {
        status.textContent = "Introduce el código de 6 dígitos";
        status.className = "error";
        return;
      }
      try {
        await apiPost("/auth/verificar", { token });
        status.textContent = "Correo verificado. Redirigiendo al login...";
        status.className = "success";
        setTimeout(() => (window.location.href = "/login.html"), 1500);
      } catch (err) {
        console.error(err);
        status.textContent = err?.message || "Código inválido o expirado.";
        status.className = "error";
      }
    });

  resendBtn.addEventListener("click", async () => {
    status.className = "hidden";
    resendBtn.disabled = true;
    try {
      await apiPost("/auth/reenviar-verificacion", { correo });
      status.textContent = "Código reenviado.";
      status.className = "success";
      // restart timer
      remaining = 15 * 60;
      resendBtn.disabled = true;
      setInterval(tick, 1000);
    } catch (err) {
      console.error(err);
      status.textContent = "Error reenviando código.";
      status.className = "error";
      resendBtn.disabled = false;
    }
  });
});
