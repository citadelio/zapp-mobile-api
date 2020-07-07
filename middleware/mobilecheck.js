module.exports = (req, res, next) => {
  const from = req.header("X-REQUEST-FROM");
  if (!from) {
    return res.json({
      errors: [{ msg: "Invalid request" }]
    });
  }

  if(from !== process.env.APP_SERVER_ID) {
    return res.json({
      errors: [{ msg: "invalid token" }]
    });
  }
  next();
};
