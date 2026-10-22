const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400);
    const issues = Array.isArray(error.issues) ? error.issues : [];
    const message = issues.length
      ? issues.map((issue) => issue.message).join(', ')
      : error.message || 'Invalid request body';
    next(new Error(message));
  }
};

module.exports = validate;
