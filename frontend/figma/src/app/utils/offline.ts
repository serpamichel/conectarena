export function warnIfOffline(action = 'esta ação') {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Simple user-visible feedback; project already uses alert in places.
      alert(`Você está offline. Conexão necessária para ${action}.`);
      return true;
    }
  } catch {
    // ignore environment without navigator
  }
  return false;
}
