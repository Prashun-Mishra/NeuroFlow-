export function notFound(req, res, next) {
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { status: 404 }));
}

export function errorMiddleware(error, req, res, next) {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: error.message || "Internal server error" });
}
