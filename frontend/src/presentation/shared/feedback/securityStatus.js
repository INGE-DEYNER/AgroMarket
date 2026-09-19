export function getSecurityStateFromStatus(status) {
  switch (Number(status)) {
    case 403: return "403";
    case 419: return "419";
    case 423: return "423";
    case 451: return "451";
    case 503: return "503";
    case 404: return "404";
    default: return null;
  }
}

export function securityStatePath(status) {
  const state = getSecurityStateFromStatus(status);
  return state ? `/estado/${state}` : null;
}
