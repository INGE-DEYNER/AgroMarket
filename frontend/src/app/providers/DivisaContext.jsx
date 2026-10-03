import { useState, useEffect, useCallback } from "react";
import i18n from "@/i18n/index";
import api from "@/infrastructure/http/api";

import DivisaContext from "@/app/contexts/DivisaContext";

const INTERVALO_TASAS = 60 * 60 * 1000;

const IDIOMA_A_LOCALE = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  zh: "zh-CN",
  ar: "ar-EG",
};

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

/**
 * Tasas de respaldo (aproximadas, base: 1 unidad = N COP).
 * Se usan si el backend no responde o devuelve datos inválidos,
 * para que la conversión de divisa NUNCA dependa exclusivamente
 * de un servicio externo.
 */
const TASAS_RESPALDO = {
  COP: 1.0,
  USD: 4150,
  EUR: 4520,
  GBP: 5280,
  BRL: 780,
  MXN: 245,
  CLP: 4.8,
  JPY: 27.8,
  CNY: 575,
  PEN: 1130,
  ARS: 4.5,
  CAD: 3050,
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
      const valor = value && typeof value === "object" && "tasa" in value
        ? value.tasa
        : value;

      const num = Number(valor);
      if (Number.isFinite(num) && num > 0) {
        tasasData[key] = num;
      }
    });
  }

  // Si el backend no devolvió tasas válidas, usar las de respaldo.
  if (Object.keys(tasasData).length === 0) {
    return { ...TASAS_RESPALDO };
  }

  tasasData.COP = 1.0;
  return tasasData;
}

export const DivisaProvider = ({ children }) => {
  const [divisaActual, setDivisaActual] = useState(obtenerDivisaInicial);

  const [tasas, setTasas] = useState({ ...TASAS_RESPALDO });

  const [loading, setLoading] = useState(true);

  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Idioma activo: fuerza re-render de formatearPrecio cuando cambia el idioma,
  // para que absolutamente todo el proyecto refleje idioma + divisa al instante.
  const [idiomaActivo, setIdiomaActivo] = useState(() =>
    String(i18n.resolvedLanguage || i18n.language || "es").split("-")[0].toLowerCase(),
  );

  useEffect(() => {
    const onLanguage = (language) => {
      setIdiomaActivo(String(language || "es").split("-")[0].toLowerCase());
    };
    i18n.on("languageChanged", onLanguage);
    return () => {
      i18n.off("languageChanged", onLanguage);
    };
  }, []);

  /**
   * Obtiene las tasas de cambio desde el backend.
   */
  const cargarTasas = useCallback(async () => {
    try {
      const respuesta = await api.get("/divisas/tasas");
      const tasasData = normalizarTasas(respuesta);

      if (Object.keys(tasasData).length > 1) {
        setTasas(tasasData);
        setUltimaActualizacion(new Date());
      }
      // Si el backend no devolvió nada válido, conservamos las tasas
      // de respaldo que ya están en el estado.
    } catch (error) {
      console.error("Error cargando tasas de divisas:", error);
      // En error: mantener tasas de respaldo (ya están en el estado).
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
   * Usa el locale del idioma activo para que el formato numérico
   * acompañe al idioma (es-CO, en-US, pt-BR, fr-FR, de-DE, zh-CN, ar-EG).
   */
  const formatearPrecio = useCallback(
    (precioCOP) => {
      const valor = convertir(precioCOP);

      const config = SIMBOLOS_DIVISA[divisaActual] || {
        simbolo: divisaActual,
        decimales: 2,
      };

      const idioma = idiomaActivo;
      const locale = IDIOMA_A_LOCALE[idioma] || "es-CO";

      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: config.decimales,
        maximumFractionDigits: config.decimales,
      }).format(valor);

      return `${config.simbolo} ${formatted}`;
    },
    [convertir, divisaActual, idiomaActivo],
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
