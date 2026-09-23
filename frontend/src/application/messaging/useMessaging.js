// Mensajería: hooks de tiempo real (SSE) y accesos REST.
//
// Reglas de comunicación implementadas en el backend (fuente de verdad):
//  - Comprador ↔ Productor: chat directo.
//  - Administración → Comprador/Productor: chat directo (el admin inicia).
//  - Comprador/Productor → Administración: TICKETS de soporte.
//
// El backend expone:
//  GET  /api/v1/messages/stream                     (SSE: message | ticket)
//  GET  /api/v1/messages/contactos
//  GET  /api/v1/messages/conversacion/{otroUserId}
//  POST /api/v1/messages
//  GET  /api/v1/messages/tickets
//  POST /api/v1/messages/tickets
//  POST /api/v1/messages/tickets/{id}/mensajes
//
// El frontend usa los alias en español (/mensajes/...): ApiPathAliasFilter
// los reescribe a /api/v1/messages antes de Security y del controlador, así
// que también funcionan en fetch/SSE (no solo en las llamadas de api.js).

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import api from "@/infrastructure/http/api";
import {
  subscribeToMensajeriaStream,
  subscribeToMensajeriaStatus,
} from "@/infrastructure/messaging/stream";

/**
 * Tiempo real de mensajería.
 *
 * @param {object}   options
 * @param {Function} options.onEvent recibe { event: 'message'|'ticket', data }
 * @param {boolean}  options.enabled false para desactivar (sin sesión)
 * @returns {{ connected: boolean }}
 */
export function useMensajeriaStream({ onEvent, enabled = true } = {}) {
  const handlerRef = useRef(onEvent);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return undefined;
    }

    const unsubscribeEvent = subscribeToMensajeriaStream((payload) => {
      if (handlerRef.current) handlerRef.current(payload);
    });
    const unsubscribeStatus = subscribeToMensajeriaStatus(setConnected);

    return () => {
      unsubscribeEvent();
      unsubscribeStatus();
    };
  }, [enabled]);

  return { connected };
}

/**
 * Accesos REST de mensajería y tickets.
 */
export function useMensajeriaApi() {
  const { user } = useAuth();
  const userId = user?.id;

  const listarContactos = useCallback(async () => {
    const data = await api.get("/mensajes/contactos");
    const lista = Array.isArray(data) ? data : data?.content || [];
    return lista
      .map((c) => ({
        userId: c.id ?? c.userId,
        username: c.nombre || c.username || c.email || "Usuario",
        role: c.rol || c.role || "USUARIO",
        iniciales: c.iniciales,
        online: Boolean(c.online),
      }))
      .filter((c) => c.userId !== undefined && c.userId !== null);
  }, []);

  const listarConversacion = useCallback(
    async (contactoId) => {
      if (!contactoId) return [];
      const data = await api.get(`/mensajes/conversacion/${contactoId}`);
      const lista = Array.isArray(data) ? data : data?.content || [];
      return lista.map((m) => ({
        ...m,
        mio: String(m.senderId) === String(userId),
      }));
    },
    [userId],
  );

  const enviarMensaje = useCallback(async (destinatarioId, contenido) => {
    return api.post("/mensajes", { destinatarioId, contenido });
  }, []);

  const listarTickets = useCallback(async () => {
    const data = await api.get("/mensajes/tickets");
    return Array.isArray(data) ? data : data?.content || [];
  }, []);

  const crearTicket = useCallback(async (asunto, descripcion) => {
    return api.post("/mensajes/tickets", { asunto, descripcion });
  }, []);

  const responderTicket = useCallback(async (ticketId, contenido) => {
    return api.post(`/mensajes/tickets/${ticketId}/mensajes`, { contenido });
  }, []);

  return {
    listarContactos,
    listarConversacion,
    enviarMensaje,
    listarTickets,
    crearTicket,
    responderTicket,
  };
}

export default useMensajeriaApi;
