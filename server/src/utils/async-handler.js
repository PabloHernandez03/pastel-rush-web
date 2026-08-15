// Express 4 no captura las promesas rechazadas de un handler `async`: la
// excepcion escapa como unhandledRejection y tumba el proceso. Este wrapper
// reenvia cualquier error a next(), donde el middleware de errores lo convierte
// en un 500 y el servidor sigue vivo (p. ej. si la BD deja de responder).
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
