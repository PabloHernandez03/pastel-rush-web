// Decide que origenes pueden llamar a la API.
//
// El juego exportado a HTML5 vive en itch.io, que NO lo sirve desde itch.io
// directamente: usa subdominios de CDN que rotan (p. ej.
// https://html-classic.itch.zone, https://v6p9d9t4.ssl.hwcdn.net). Por eso una
// lista fija de URLs no basta y comprobamos tambien por dominio padre.
//
// La autenticacion es por Bearer token (no cookies), asi que CORS aqui no es la
// frontera de seguridad: las rutas protegidas siguen exigiendo un JWT valido.

// Dominios padre permitidos (el origen debe ser el dominio o un subdominio).
const ALLOWED_SUFFIXES = [
  'itch.io',
  'itch.zone',
  'hwcdn.net',   // CDN que itch.io usa para servir los juegos HTML5
];

function hostnameOf(origin) {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

function matchesSuffix(hostname, suffix) {
  return hostname === suffix || hostname.endsWith('.' + suffix);
}

/**
 * Construye la opcion `origin` de cors() a partir de CORS_ORIGIN.
 * CORS_ORIGIN acepta varias URLs separadas por coma, o '*' para permitir todo.
 */
export function buildCorsOrigin(corsOriginEnv) {
  const configured = String(corsOriginEnv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // '*' explicito: sin restricciones (util para depurar).
  if (configured.includes('*')) return true;

  return (origin, callback) => {
    // Sin cabecera Origin: peticiones que no son del navegador (el juego nativo
    // de escritorio, curl, health checks de Render). No aplica CORS.
    if (!origin) return callback(null, true);

    if (configured.includes(origin)) return callback(null, true);

    const hostname = hostnameOf(origin);
    if (hostname) {
      // Desarrollo local en cualquier puerto.
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return callback(null, true);
      }
      if (ALLOWED_SUFFIXES.some((suffix) => matchesSuffix(hostname, suffix))) {
        return callback(null, true);
      }
    }

    return callback(null, false);  // sin cabecera CORS: el navegador lo bloquea
  };
}
