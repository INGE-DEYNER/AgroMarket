document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperar-form");
  const correoInput = document.getElementById("correo");
  const status = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "hidden";
    const correo = correoInput.value.trim();
    if (!correo) return;

    // client-side basic validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      status.textContent = "Introduce un correo válido";
      status.className = "error";
      return;
    }

    try {
      const res = await apiPost("/auth/recuperar-contrasena", { correo });
      // successfully send — do not reveal whether exists
      status.textContent = "Revisa tu correo, te enviamos las instrucciones";
      status.className = "success";
    } catch (err) {
      console.error(err);
      status.textContent = "Error enviando instrucciones. Intenta más tarde.";
      status.className = "error";
    }
  });
});
