import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
const saltRounds = process.env.SALT_ROUNDS || 10;


export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already used' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        categories: {
          create: [
            { name: "Food", description: "For daily expenses" },
            { name: "Transport", description: "For transport costs" },
          ],
        },
      },
      include: { categories: true },
    });

    return res.status(201).json({ message: 'success', userId: user.id, categories: user.categories });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "This email doesn't exist" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Wrong password. Try again' });
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


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Your current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (isMatch && oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the old password' });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error in changePassword:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, profilePic: true, createdAt: true, incomes: true, expenses: true, categories: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const userId = req.user.id;
    const filePath = `/uploads/profile-pictures/${req.file.filename}`;
    await prisma.user.update({
      where: { id: userId },
      data: { profilePic: filePath },
    });
    return res.json({ message: 'Profile picture updated', profilePic: filePath });
  } catch (err) {
    console.error('Error in uploadProfilePic:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};