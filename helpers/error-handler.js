function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // jwt authentication error
    return res.status(401).json({ message: 'The user is not authorized' });
  }

  if (err.name === 'ValidationError') {
    //  validation error
    return res.status(401).json({ message: err });
  }
  next(err);
  // default to 500 server error
}

module.exports = errorHandler;
