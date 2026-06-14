const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits

async function getKey(secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', keyData);
  return crypto.subtle.importKey('raw', hash, { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
}

export async function encryptParam(param, secret) {
  try {
    const key = await getKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encodedParam = encoder.encode(param);

    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encodedParam
    );

    const buffer = new Uint8Array(iv.length + encryptedData.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encryptedData), iv.length);

    // Convert to Base64 URL safe string
    return btoa(String.fromCharCode.apply(null, buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

export async function decryptParam(encryptedParam, secret) {
  try {
    const key = await getKey(secret);
    const buffer = new Uint8Array(
      atob(encryptedParam.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const iv = buffer.slice(0, IV_LENGTH);
    const data = buffer.slice(IV_LENGTH);

    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
