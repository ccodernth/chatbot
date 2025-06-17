// app/utils/auth.server.ts
import { redirect } from '@remix-run/node';
import jwt from 'jsonwebtoken';

export async function requireAuth(request: Request) {
  const cookieHeader = request.headers.get('Cookie');
  const token = cookieHeader?.split('token=')[1]?.split(';')[0];

  if (!token) {
    throw redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Here you would normally fetch the user from database
    // For now, we'll return the decoded token data
    return {
      id: decoded.userId,
      role: decoded.role || 'user',
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    throw redirect('/login');
  }
}

export async function getUser(request: Request) {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}