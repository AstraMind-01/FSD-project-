export const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
      res.status(403);
      return next(new Error('Access Denied: Required role not met'));
    }
    next();
  };
};
