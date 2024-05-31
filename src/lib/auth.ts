import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET as string;
const key = new TextEncoder().encode(secretKey);

const expiresIn = process.env.SESSION_EXPIRATION as string;

export async function encrypt(
  payload:
    | (JWTPayload & {
        user: { id: string; email: string; role: string };
      })
    | undefined
) {
  const expires = new Date(Date.now() + Number(expiresIn));

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

export async function decrypt(input: string): Promise<
  JWTPayload & {
    user: { id: string; email: string; role: string };
  }
> {
  const { payload } = await jwtVerify(input, key, { algorithms: ['HS256'] });
  return payload as JWTPayload & {
    user: { id: string; email: string; role: string };
  };
}

// Get the session from the cookies from the server
export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return;
  return await decrypt(session);
}

export async function updateSession(session: string | undefined) {
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);

  const expires = new Date(Date.now() + Number(expiresIn));

  parsed.expires = expires;

  const response = NextResponse.next();

  response.cookies.set({
    expires: parsed.expires as Date,
    httpOnly: true,
    name: 'session',
    value: await encrypt(parsed),
  });

  return response;
}
