import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  apiKey?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate API key method
userSchema.methods.generateApiKey = async function(): Promise<string> {
  const apiKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
  this.apiKey = apiKey;
  await this.save();
  return apiKey;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ apiKey: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 