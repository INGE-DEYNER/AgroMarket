// File: frontend/src/hooks/useSecureParams.js
import { useState, useEffect } from 'react';
import { encryptParam, decryptParam } from '../utils/urlCrypto.js';

const SENSITIVE_KEYS = ['userId', 'transactionId', 'token', 'id', 'pedidoId', 'productoId'];

export function useSecureParams() {
  const [decryptedParams, setDecryptedParams] = useState({});
  const search = typeof window !== 'undefined' ? window.location.search : '';

  useEffect(() => {
    const decryptAll = async () => {
      const params = new URLSearchParams(search);
      const decrypted = {};
      for (const [key, value] of params.entries()) {
        if (SENSITIVE_KEYS.includes(key) && value) {
          const decryptedValue = await decryptParam(value);
          decrypted[key] = decryptedValue || value;
        } else {
          decrypted[key] = value;
        }
      }
      setDecryptedParams(decrypted);
    };

    decryptAll();
  }, [search]);

  const getParam = (name) => {
    return decryptedParams[name] || '';
  };

  const buildUrl = async (basePath, paramsObj) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(paramsObj)) {
      if (value !== null && value !== undefined) {
        if (SENSITIVE_KEYS.includes(key)) {
          const encrypted = await encryptParam(value);
          searchParams.set(key, encrypted);
        } else {
          searchParams.set(key, String(value));
        }
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return { getParam, buildUrl, decryptedParams };
}
