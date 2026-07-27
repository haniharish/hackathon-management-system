const isAdministrator = (role) => role === 'administrator' || role === 'admin';

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!allowedRoles.includes(req.user.role) && !(isAdministrator(req.user.role) && allowedRoles.includes('admin'))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};