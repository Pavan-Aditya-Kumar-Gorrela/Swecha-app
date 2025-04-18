import jwt from 'jsonwebtoken';

export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};