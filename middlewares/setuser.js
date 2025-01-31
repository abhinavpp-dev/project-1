const jwt = require('jsonwebtoken');

const setUser = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      console.error("JWT verification failed:", error);
      req.user = null;
    }
  }

  else {
    req.user = null;
  }
  res.locals.user = req.user; // Make user available in res.locals
  next();
};

module.exports = setUser;
