import api from "./api.js";
import Auth from "./auth.js";
import { escapeHtml } from "./ui.js";

Auth.requireRole(["comprador", "productor", "admin"]);

const state = {
  contactos: [],
  activeContact: null,
  conversation: [],
};

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(index) {
  const colors = [
    "avatar-green",
    "avatar-blue",
    "avatar-gold",
    "avatar-purple",
    "avatar-red",
  ];
  return colors[index % colors.length];
}

function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  if (!state.contactos.length) {
    list.innerHTML =
      '<div class="empty-state" style="padding:24px;color:var(--text-muted)">No hay conversaciones aún.</div>';
    return;
  }

  list.innerHTML = state.contactos
    .map(
      (contacto, index) => `
    <div class="chat-contact-item ${state.activeContact?.usuarioId === contacto.usuarioId ? "active" : ""}" onclick="openContact(${contacto.usuarioId})">
      <div class="avatar ${avatarColor(index)}">${escapeHtml(initials(contacto.nombre))}</div>
      <div class="chat-contact-info">
        <div class="contact-name">${escapeHtml(contacto.nombre)}</div>
        <div class="contact-last">${escapeHtml(contacto.ultimoMensaje || "Sin mensajes")}</div>
      </div>
      ${contacto.noLeidos ? `<span class="badge badge-green">${contacto.noLeidos}</span>` : ""}
    </div>`,
    )
    .join("");
}

function renderMessages() {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  if (!state.activeContact) {
    box.innerHTML =
      '<div class="empty-state" style="margin:auto"><div class="empty-icon">💬</div><div style="color:var(--text-muted)">Selecciona un contacto para iniciar la conversación.</div></div>';
    return;
  }

  if (!state.conversation.length) {
    box.innerHTML =
      '<div class="empty-state" style="margin:auto"><div class="empty-icon">💬</div><div style="color:var(--text-muted)">No hay mensajes todavía. ¡Envía un mensaje de saludo!</div></div>';
    return;
  }

  const currentUserId = Auth.getUsuario()?.id;
  box.innerHTML = state.conversation
    .map(
      (mensaje) => `
    <div class="msg ${Number(mensaje.remitenteId) === Number(currentUserId) ? "out" : "in"}">
      <div class="msg-bubble">${escapeHtml(mensaje.contenido)}</div>
      <div class="msg-time">${new Date(mensaje.fechaEnvio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</div>
    </div>`,
    )
    .join("");
  box.scrollTop = box.scrollHeight;
}

async function openContact(userId) {
  state.activeContact = state.contactos.find(
    (contacto) => String(contacto.usuarioId) === String(userId),
  );
  if (!state.activeContact) return;

  const idx = state.contactos.findIndex(
    (contacto) => String(contacto.usuarioId) === String(userId),
  );

  const avatarEl = document.getElementById("chatAvatar");
  if (avatarEl) {
    avatarEl.className = `avatar ${avatarColor(idx >= 0 ? idx : 0)}`;
    avatarEl.textContent = initials(state.activeContact.nombre);
  }

  const nameEl = document.getElementById("chatName");
  if (nameEl) nameEl.textContent = state.activeContact.nombre;

  const roleEl = document.getElementById("chatRole");
  if (roleEl) roleEl.textContent = state.activeContact.rol || "Usuario";

  const onlineEl = document.getElementById("onlineBadge");
  if (onlineEl) onlineEl.style.display = "inline-flex";

  const msgInput = document.getElementById("msgInput");
  if (msgInput) msgInput.disabled = false;

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.disabled = false;

  try {
    state.conversation = await api.getConversacion(userId);
    renderContacts();
    renderMessages();
  } catch (error) {
    console.error("Error al recuperar conversación: ", error);
  }
}

async function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text || !state.activeContact) return;

  input.value = "";
  try {
    await api.enviarMensaje(state.activeContact.usuarioId, text);
    state.conversation = await api.getConversacion(
      state.activeContact.usuarioId,
    );
    state.contactos = await api.getContactos();
    renderContacts();
    renderMessages();
  } catch (error) {
    alert(error?.message || "No se pudo enviar el mensaje.");
  }
}

function handleKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

async function cargarMensajeria() {
  try {
    state.contactos = await api.getContactos();
    renderContacts();
    if (state.contactos.length) {
      await openContact(state.contactos[0].usuarioId);
    } else {
      renderMessages();
    }
  } catch (error) {
    console.error("Error al cargar contactos: ", error);
    const box = document.getElementById("chatMessages");
    if (box) {
      box.innerHTML = `<div class="empty-state" style="margin:auto;color:red;">${escapeHtml("Error al cargar mensajería. Inténtalo más tarde.")}</div>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", cargarMensajeria);

window.openContact = openContact;
window.sendMessage = sendMessage;
window.handleKey = handleKey;
