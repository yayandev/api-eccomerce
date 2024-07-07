const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  next();

  return;
};

export default adminOnly;
