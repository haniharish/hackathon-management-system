import mongoose from 'mongoose';

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id) && !id.startsWith('hack-') && !id.startsWith('user-') && !id.startsWith('demo-')) {
    return res.status(400).json({ message: `Invalid ${paramName}` });
  }
  next();
};
