import { createContext, useContext } from "react";

/**
 * Contexto de notificaciones emergentes (toasts).
 *
 * Lo consume el ToastProvider de app/providers/ToastContext.jsx, que además
 * define los estilos y las animaciones. Se usa en lugar de window.alert():
 * el diálogo nativo congela la interfaz, ignora el tema oscuro y no se puede
 * posicionar. También evita window.confirm(), que es bloqueante.
 */
const ToastContext = createContext(null);

/**
 * Acceso a los avisos desde cualquier componente.
 * Devuelve funciones inertes si el proveedor no está montado, para que un
 * componente aislado (por ejemplo en pruebas) no rompa al renderizar.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;

  const noop = () => null;
  return {
    success: noop,
    error: noop,
    warning: noop,
    info: noop,
  };
}

export default ToastContext;