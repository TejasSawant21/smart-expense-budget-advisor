module.exports = function (req, res, next) {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
