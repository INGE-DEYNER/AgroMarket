// File: frontend/src/utils/urlCrypto.js

let sessionKeyPromise = null;

function getSessionKey() {
  if (!sessionKeyPromise) {
    sessionKeyPromise = window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  return sessionKeyPromise;
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptParam(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const key = await getSessionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(stringValue);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  const ivAndCiphertext = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  ivAndCiphertext.set(iv, 0);
  ivAndCiphertext.set(new Uint8Array(ciphertext), iv.byteLength);
  
  return bufferToBase64Url(ivAndCiphertext.buffer);
}

export async function decryptParam(cipher) {
  if (!cipher) return "";
  try {
    const key = await getSessionKey();
    const ivAndCiphertext = new Uint8Array(base64UrlToBuffer(cipher));
    if (ivAndCiphertext.byteLength < 12) {
      throw new Error("Invalid cipher text");
    }
    const iv = ivAndCiphertext.slice(0, 12);
    const ciphertext = ivAndCiphertext.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("Failed to decrypt param:", err);
    return "";
  }
}
