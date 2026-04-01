const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400);
    next(new Error(error.errors.map((e) => e.message).join(', ')));
  }
};

module.exports = validate;
