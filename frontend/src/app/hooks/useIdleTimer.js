import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Hook personalizado para manejar expiración de sesión por inactividad.
 * 
 * - Detecta inactividad del usuario (mouse, teclado, scroll, click)
 * - Muestra advertencia antes de expirar
 * - Redirige a login después de expiración
 * - Limpia sesión automáticamente
 */
export function useIdleTimer(timeoutMinutes = 1) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const warningTime = (timeoutMinutes * 60 * 1000) - 5000; // 5 segundos antes
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // Reinicia el temporizador
  const resetTimer = useCallback(() => {
    // Limpiar temporizadores existentes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    
    setIsIdle(false);
    setShowWarning(false);

    // Configurar temporizador de advertencia
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningTime);

    // Configurar temporizador de expiración
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      setShowWarning(false);
      logout();
      navigate("/login");
    }, timeoutMinutes * 60 * 1000);
  }, [logout, navigate, timeoutMinutes, warningTime]);

  // Manejar eventos de actividad
  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart", "mousewheel"];
    
    const handleActivity = () => {
      if (!isIdle) {
        resetTimer();
      }
    };

    // Añadir event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Iniciar temporizador
    resetTimer();

    // Limpiar al desmontar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [isIdle, resetTimer]);

  // Pausar temporizador cuando se muestra el warning
  useEffect(() => {
    if (showWarning) {
      // El usuario puede hacer click para mantener la sesión
      const handleKeepSession = () => {
        setShowWarning(false);
        resetTimer();
      };
      
      // Escuchar evento personalizado o click
      const handleClick = (e) => {
        if (e.target.id === "keep-session" || e.target.closest("#keep-session")) {
          handleKeepSession();
        }
      };
      
      window.addEventListener("click", handleClick);
      
      return () => {
        window.removeEventListener("click", handleKeepSession);
      };
    }
  }, [showWarning, resetTimer]);

  // Also pause when modal is open or user is interacting
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    isIdle,
    showWarning,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
