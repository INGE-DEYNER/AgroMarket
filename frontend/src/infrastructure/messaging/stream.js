/**
 * Stream SSE de mensajería (cliente).
 *
 * Backend: GET /api/v1/messages/stream  (también sirve el alias
 * /api/v1/mensajes/stream porque ApiPathAliasFilter reescribe el prefijo
 * antes de Spring Security y del DispatcherServlet).
 *
 * Eventos emitidos: "connected", "message" (chat) y "ticket" (soporte).
 *
 * Es un singleton a nivel de módulo: todos los componentes de la app
 * comparten un único fetch/stream en lugar de abrir una conexión cada uno.
 */

import { API_BASE } from "@/infrastructure/http/api";

let controller = null;
let active = false;
let reconnectTimer = null;
let reconnectDelay = 2000;

const eventHandlers = new Set();
const statusHandlers = new Set();

function emitStatus(connected) {
  statusHandlers.forEach((handler) => {
    try {
      handler(connected);
    } catch (err) {
      console.error("[mensajeria] status handler error:", err);
    }
  });
}

function emitEvent(event) {
  eventHandlers.forEach((handler) => {
    try {
      handler(event);
    } catch (err) {
      console.error("[mensajeria] event handler error:", err);
    }
  });
}

/** Convierte un bloque SSE en { event, data }. */
export function parseSseBlock(block) {
  const lines = String(block).split("\n");
  let eventName = "message";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (dataLines.length === 0) return null;

  const raw = dataLines.join("\n");
  let data = raw;

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  return { event: eventName, data };
}

function closeStream() {
  active = false;

  if (controller) {
    try {
      controller.abort();
    } catch {
      /* la conexión ya puede estar cerrada */
    }
    controller = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer || statusHandlers.size === 0) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    void openStream();
  }, reconnectDelay);
}

function dispatch(buffer, chunk, flush = false) {
  const joined = buffer + chunk;
  const parts = joined.split("\n\n");
  const rest = flush ? "" : parts.pop() ?? "";

  for (const block of parts) {
    if (!block.trim()) continue;
    const parsed = parseSseBlock(block);
    if (!parsed) continue;
    if (parsed.event === "connected") {
      emitStatus(true);
      continue;
    }
    if (parsed.event === "message" || parsed.event === "ticket") {
      emitEvent(parsed);
    }
  }

  return rest;
}

async function openStream() {
  if (active || statusHandlers.size === 0) return;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) return;

  active = true;
  controller = new AbortController();

  try {
    const response = await fetch(`${API_BASE}/mensajes/stream`, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`stream status ${response.status}`);
    }

    reconnectDelay = 2000;
    emitStatus(true);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (active) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer = dispatch(buffer, decoder.decode(value, { stream: true }));
    }

    if (active && buffer) dispatch("", buffer, true);
  } catch (err) {
    if (err?.name !== "AbortError") {
      console.warn("[mensajeria] stream interrumpido:", err?.message || err);
    }
  } finally {
    const wasActive = active;
    active = false;
    controller = null;
    emitStatus(false);
    if (wasActive) scheduleReconnect();
  }
}

/** Suscribe un handler a los eventos del stream. Devuelve el unsubscribe. */
export function subscribeToMensajeriaStream(handler) {
  eventHandlers.add(handler);
  void openStream();

  return () => {
    eventHandlers.delete(handler);
    if (eventHandlers.size === 0 && statusHandlers.size === 0) closeStream();
  };
}

/** Suscribe un handler al estado de la conexión (true/false). */
export function subscribeToMensajeriaStatus(handler) {
  statusHandlers.add(handler);
  void openStream();

  return () => {
    statusHandlers.delete(handler);
    if (eventHandlers.size === 0 && statusHandlers.size === 0) closeStream();
  };
}

/** Cierra el stream y limpia suscriptores (logout). */
export function closeMensajeriaStream() {
  eventHandlers.clear();
  statusHandlers.clear();
  closeStream();
}

export default {
  parseSseBlock,
  subscribeToMensajeriaStream,
  subscribeToMensajeriaStatus,
  closeMensajeriaStream,
};
