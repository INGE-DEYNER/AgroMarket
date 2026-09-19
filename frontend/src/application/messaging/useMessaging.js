// Mensajería: envío y recepción en TIEMPO REAL.
//
// - Las lecturas se hacen con los alias del frontend (/mensajes/...).
//   El backend reescribe /api/v1/mensajes -> /api/v1/messages, pero eso
//   NO funciona para EventSource porque es un canal diferente al fetch.
// - El SSE real se conecta en la ruta raíz / y usa una vista unificada.
// - IMPORTANTE: el filtro de alias NO reescribe /api/v1/mensajes/stream
//   porque tiene un sufijo /stream; por eso sin este hook la UI nunca
//   recibe mensajes nuevos en tiempo real (solo por polling).
import { useEffect, useRef } from "react";
import api, { API_BASE } from "@/infrastructure/http/api";
import { useAuth } from "@/app/hooks/useAuth";

export function useMensajeriaStream(onMessage) {
  const { user } = useAuth();
  const streamRef = useRef(null);
  const reconnectTimer = useRef(null);
  const activeRef = useRef(false);
  const userAgentInitRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (userAgentInitRef.current) return;
    userAgentInitRef.current = true;

    // SSE raíz: el backend expone un stream unificado de mensajes en /.
    // Este endpoint está protegido con JWT, así que usamos el token del
    // localStorage y Authorization como cabecera HTTP (EventSource puro no
    // lo permite; en su lugar abrimos el stream con fetch + ReadableStream).
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.set("Accept", "text/event-stream");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const controller = new AbortController();
    const response = fetch(`${API_BASE}/mensajes/stream`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    void response.then(async (res) => {
      if (!res.ok) {
        console.error("[mensajeria] stream status:", res.status);
        scheduleReconnect();
        return;
      }
      activeRef.current = true;

      const reader = res.body?.getReader();
      if (!reader) {
        scheduleReconnect();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (activeRef.current) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;
          try {
            onMessage(block);
          } catch (err) {
            console.error("[mensajeria] onMessage error:", err);
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        console.error("[mensajeria] stream fetch error:", err);
        scheduleReconnect();
      }
    });

    const scheduleReconnect = () => {
      if (reconnectTimer.current) return;
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null;
        void (async () => {
          await new Promise((r) => setTimeout(r, 1500));
          // React re-render: el efecto se reejecutará si el componente
          // sigue vivo. Forzamos la re-conexión invocando la callback.
          onMessage("[reconnect]");
        })();
      }, 4000);
    };

    return () => {
      activeRef.current = false;
      controller.abort();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };
  }, [user, onMessage]);
}
