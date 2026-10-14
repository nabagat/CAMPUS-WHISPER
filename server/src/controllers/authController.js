import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  department: z.string().optional().default('General Campus'),
  academicYear: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Staff', 'Alumni', 'Other']).optional().default('1st Year'),
  role: z.enum(['student', 'moderator', 'admin']).optional().default('student'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(userId) {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
}

export async function register(req, res, next) {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: validatedData.password,
      department: validatedData.department,
      academicYear: validatedData.academicYear,
      role: validatedData.role,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
        academicYear: user.academicYear,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please reach out to administration.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
        academicYear: user.academicYear,
        avatarSeed: user.avatarSeed,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        academicYear: req.user.academicYear,
        avatarSeed: req.user.avatarSeed,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
