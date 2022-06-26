const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const status = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(status);
  res.json({
    message: err.message,
  });
};

export { notFound, errorHandler };
