import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // In a real app, this would validate against a database
  if (email === 'demo@example.com' && password === 'demo123') {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    
    // Set the token as an HTTP-only cookie
    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    }));

    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
} 