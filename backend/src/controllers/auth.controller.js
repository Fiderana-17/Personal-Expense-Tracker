import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
const SALT_ROUNDS = 10;

// Inscription
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password){
      return res.status(400).json({ message: 'Missing fields' });
    } 

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing){
      return res.status(409).json({ message: 'Email already used' });
    } 

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    });

    return res.status(201).json({ message: 'success', userId: user.id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Connexion
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password){
      return res.status(400).json({ message: 'Missing fields' });
    } 

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user){
      return res.status(401).json({ message: 'Invalid credentials' });
    } 

    const valid = await bcrypt.compare(password, user.password);
    if (!valid){
      return res.status(401).json({ message: 'Invalid credentials' });
    } 

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
