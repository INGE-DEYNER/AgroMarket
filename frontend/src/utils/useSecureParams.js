import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { decryptParam, encryptParam } from "./urlCrypto";

// Clave secreta para encriptar los parámetros de la URL
// En producción, debería venir de una variable de entorno
const SECRET_KEY =
  import.meta.env.VITE_URL_SECRET_KEY || "AgroMarketSecretKey2026";

export function useSecureParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [params, setParams] = useState({});

  useEffect(() => {
    const decryptAll = async () => {
      const decryptedParams = {};
      for (const [key, value] of searchParams.entries()) {
        if (value.length > 20) {
          // Asumimos que los valores largos están encriptados
          const decrypted = await decryptParam(value, SECRET_KEY);
          decryptedParams[key] = decrypted !== null ? decrypted : value;
        } else {
          decryptedParams[key] = value;
        }
      }
      setParams(decryptedParams);
    };

    decryptAll();
  }, [searchParams]);

  const updateSecureParams = async (newParams) => {
    const encryptedParams = {};
    for (const [key, value] of Object.entries(newParams)) {
      if (value) {
        encryptedParams[key] = await encryptParam(String(value), SECRET_KEY);
      }
    }
    setSearchParams(encryptedParams);
  };

  return [params, updateSecureParams];
}
