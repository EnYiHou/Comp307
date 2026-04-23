export default function errorMiddleware(err, req, res, next) {
  const statusCode = err.status || (err.name === "ValidationError" ? 400 : 500);

  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
}
