const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message || err);

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ error: message });
};

export default errorHandler;
