import { useState, useEffect, useCallback } from "react";
import api from "@/infrastructure/http/api";

import DivisaContext from "@/app/contexts/DivisaContext";

const INTERVALO_TASAS = 60 * 60 * 1000;

const SIMBOLOS_DIVISA = {
  COP: {
    simbolo: "$",
    decimales: 0,
  },
  USD: {
    simbolo: "US$",
    decimales: 2,
  },
  EUR: {
    simbolo: "€",
    decimales: 2,
  },
  GBP: {
    simbolo: "£",
    decimales: 2,
  },
  BRL: {
    simbolo: "R$",
    decimales: 2,
  },
  MXN: {
    simbolo: "MX$",
    decimales: 2,
  },
  CLP: {
    simbolo: "CLP$",
    decimales: 0,
  },
  JPY: {
    simbolo: "¥",
    decimales: 0,
  },
  CNY: {
    simbolo: "¥",
    decimales: 2,
  },
  PEN: {
    simbolo: "S/",
    decimales: 2,
  },
  ARS: {
    simbolo: "AR$",
    decimales: 2,
  },
  CAD: {
    simbolo: "CA$",
    decimales: 2,
  },
};

function obtenerDivisaInicial() {
  return localStorage.getItem("divisa_preferida") || "COP";
}

function normalizarTasas(respuesta) {
  const tasasData = {};
  const sourceTasas = respuesta?.tasas || respuesta;

  if (
    sourceTasas &&
    typeof sourceTasas === "object" &&
    !Array.isArray(sourceTasas)
  ) {
    Object.entries(sourceTasas).forEach(([key, value]) => {
      tasasData[key] =
        value && typeof value === "object" && "tasa" in value
          ? value.tasa
          : value;
    });
  }

  tasasData.COP = 1.0;

  return tasasData;
}

export const DivisaProvider = ({ children }) => {
  const [divisaActual, setDivisaActual] = useState(obtenerDivisaInicial);

  const [tasas, setTasas] = useState({
    COP: 1.0,
  });

  const [loading, setLoading] = useState(true);

  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  /**
   * Obtiene las tasas de cambio desde el backend.
   */
  const cargarTasas = useCallback(async () => {
    try {
      const respuesta = await api.get("/divisas/tasas");
      const tasasData = normalizarTasas(respuesta);

      setTasas(tasasData);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error("Error cargando tasas de divisas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga inicial de tasas y actualización automática
   * cada hora.
   *
   * La carga inicial se programa fuera de la ejecución
   * síncrona del efecto para cumplir las reglas de React
   * Compiler sobre actualizaciones de estado.
   */
  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void cargarTasas();
    }, 0);

    const interval = window.setInterval(() => {
      void cargarTasas();
    }, INTERVALO_TASAS);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [cargarTasas]);

  /**
   * Cambia la divisa seleccionada.
   */
  const cambiarDivisa = useCallback((nuevaDivisa) => {
    if (!nuevaDivisa) {
      return;
    }

    setDivisaActual(nuevaDivisa);

    localStorage.setItem("divisa_preferida", nuevaDivisa);

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    api
      .patch("/usuarios/divisa", {
        divisa: nuevaDivisa,
      })
      .catch((error) => {
        console.error("Error guardando divisa:", error);
      });
  }, []);

  /**
   * Convierte un precio expresado en COP
   * a la divisa actualmente seleccionada.
   */
  const convertir = useCallback(
    (precioCOP) => {
      if (!precioCOP) {
        return 0;
      }

      const tasa = tasas[divisaActual] || 1;

      // Las tasas vienen expresadas como "1 unidad extranjera = N COP"
      // (ej. 1 USD = 4000 COP). Para convertir de COP a la divisa
      // objetivo debemos DIVIDIR, no multiplicar.
      return precioCOP / tasa;
    },
    [tasas, divisaActual],
  );

  /**
   * Formatea un precio según la divisa actual.
   */
  const formatearPrecio = useCallback(
    (precioCOP) => {
      const valor = convertir(precioCOP);

      const config = SIMBOLOS_DIVISA[divisaActual] || {
        simbolo: divisaActual,
        decimales: 2,
      };

      const formatted = new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: config.decimales,
        maximumFractionDigits: config.decimales,
      }).format(valor);

      return `${config.simbolo} ${formatted}`;
    },
    [convertir, divisaActual],
  );

  const value = {
    divisaActual,
    cambiarDivisa,
    convertir,
    formatearPrecio,
    tasas,
    loading,
    ultimaActualizacion,
    cargarTasas,
  };

  return (
    <DivisaContext.Provider value={value}>{children}</DivisaContext.Provider>
  );
};
