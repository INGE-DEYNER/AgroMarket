import api from "./api.js";
import Auth from "./auth.js";

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
      '<div class="empty-state" style="padding:24px;">No hay conversaciones aún.</div>';
    return;
  }

  list.innerHTML = state.contactos
    .map(
      (contacto, index) => `
    <div class="chat-contact-item ${state.activeContact?.usuarioId === contacto.usuarioId ? "active" : ""}" onclick="openContact(${contacto.usuarioId})">
      <div class="avatar ${avatarColor(index)}">${initials(contacto.nombre)}</div>
      <div class="chat-contact-info">
        <div class="contact-name">${contacto.nombre}</div>
        <div class="contact-last">${contacto.ultimoMensaje || "Sin mensajes"}</div>
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
      '<div class="empty-state" style="margin:auto"><div class="empty-icon">💬</div><div>Selecciona un contacto para iniciar la conversación.</div></div>';
    return;
  }

  if (!state.conversation.length) {
    box.innerHTML =
      '<div class="empty-state" style="margin:auto"><div class="empty-icon">💬</div><div>No hay mensajes todavía.</div></div>';
    return;
  }

  const currentUserId = Auth.getUsuario()?.id;
  box.innerHTML = state.conversation
    .map(
      (mensaje) => `
    <div class="msg ${Number(mensaje.remitenteId) === Number(currentUserId) ? "out" : "in"}">
      <div class="msg-bubble">${mensaje.contenido}</div>
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

  document.getElementById("chatAvatar").className =
    `avatar ${avatarColor(state.contactos.findIndex((contacto) => String(contacto.usuarioId) === String(userId)))}`;
  document.getElementById("chatAvatar").textContent = initials(
    state.activeContact.nombre,
  );
  document.getElementById("chatName").textContent = state.activeContact.nombre;
  document.getElementById("chatRole").textContent = state.activeContact.rol;
  document.getElementById("onlineBadge").style.display = "inline-flex";
  document.getElementById("msgInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;

  state.conversation = await api.getConversacion(userId);
  renderContacts();
  renderMessages();
}

async function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text || !state.activeContact) return;

  input.value = "";
  await api.enviarMensaje(state.activeContact.usuarioId, text);
  state.conversation = await api.getConversacion(state.activeContact.usuarioId);
  state.contactos = await api.getContactos();
  renderContacts();
  renderMessages();
}

function handleKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

async function cargarMensajeria() {
  state.contactos = await api.getContactos();
  renderContacts();
  if (state.contactos.length) {
    await openContact(state.contactos[0].usuarioId);
  }
}

document.addEventListener("DOMContentLoaded", cargarMensajeria);

window.openContact = openContact;
window.sendMessage = sendMessage;
window.handleKey = handleKey;
