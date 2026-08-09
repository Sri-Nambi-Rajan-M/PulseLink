const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Mongoose throws CastError for malformed ObjectIds and ValidationError
  // for schema violations — both are client mistakes (400), not server
  // failures (500). Previously these all fell through as 500s because this
  // handler only ever looked at whatever status code was already set.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let type = "server_error";

  if (err.name === "CastError") {
    statusCode = 400;
    type = "validation";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    type = "validation";
  } else if (statusCode === 404) {
    type = "not_found";
  } else if (statusCode === 400) {
    type = "validation";
  } else if (statusCode === 401 || statusCode === 403) {
    type = "auth";
  }

  res.status(statusCode).json({
    success: false,
    type,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
