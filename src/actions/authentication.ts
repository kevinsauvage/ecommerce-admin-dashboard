'use server';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import db from '@/db/db';
import { encrypt } from '@/lib/auth';
import hashPassword from '@/lib/hashPassword';

const expiresIn = process.env.SESSION_EXPIRATION as string;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long',
  }),
});

export async function register(previousState: unknown, formData: FormData) {
  try {
    const result = registerSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!result.success) return result.error.formErrors.fieldErrors;

    const { email, password } = result.data;

    const hashedPassword = await hashPassword(password);

    await db.user.create({
      data: { email, password: hashedPassword, role: 'USER' },
    });
  } catch (error: unknown) {
    console.error('registerAction Error:', error);

    return error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
      ? { email: 'Email is already registered' }
      : { error: 'Something went wrong, please try again' };
  }
  redirect('/login');
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(previousState: unknown, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const result = loginSchema.safeParse(data);

    if (!result.success) return result.error.formErrors.fieldErrors;

    const { email, password } = result.data || {};

    const user = await db.user.findUnique({ where: { email } });

    if (!user) return { email: 'Email is not registered' };

    const hashedPassword = await hashPassword(password);

    if (hashedPassword !== user.password) return { password: 'Wrong password' };

    const expires = new Date(Date.now() + Number(expiresIn));

    const session = await encrypt({
      expires,
      user: { id: user.id, email, role: user.role },
    });

    cookies().set('session', session, { expires, httpOnly: true });
  } catch (error) {
    console.error('loginAction Error:', error);
    return { error: 'Something went wrong, please try again' };
  }

  redirect('/dashboard');
}

export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
  redirect('/login');
}
