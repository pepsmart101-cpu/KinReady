import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';
// @ts-ignore
import QRCode from 'qrcode';
import crypto from 'crypto';

export default async function authRoutes(fastify: FastifyInstance) {
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  fastify.post('/register', async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    });

    const body = schema.parse(request.body);

    const existingUser = await fastify.db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [body.email],
    });

    if (existingUser.rows.length > 0) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const passwordHash = await argon2.hash(body.password);
    const id = uuidv4();

    await fastify.db.execute({
      sql: `INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified) 
            VALUES (?, ?, ?, ?, ?, 1)`,
      args: [id, body.email, passwordHash, body.firstName || null, body.lastName || null],
    });

    const token = fastify.jwt.sign({ id, email: body.email });

    return reply.status(201).send({ 
      token,
      user: { id, email: body.email, firstName: body.firstName, lastName: body.lastName, role: 'user' },
      message: 'User registered successfully.'
    });
  });

  fastify.post('/verify', async (request, reply) => {
    const schema = z.object({
      token: z.string(),
    });
    const { token } = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT id FROM users WHERE verification_token = ?',
      args: [token],
    });

    if (result.rows.length === 0) {
      return reply.status(400).send({ error: 'Invalid or expired verification token' });
    }

    const userId = result.rows[0].id;

    await fastify.db.execute({
      sql: 'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
      args: [userId],
    });

    return { success: true, message: 'Email verified successfully' };
  });

  fastify.post('/resend-verification', async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
    });
    const { email } = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT id, email_verified FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return { message: 'If that email exists and is not verified, a new link has been sent.' };
    }

    const user = result.rows[0];
    if (user.email_verified) {
      return reply.status(400).send({ error: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await fastify.db.execute({
      sql: 'UPDATE users SET verification_token = ? WHERE id = ?',
      args: [verificationToken, user.id],
    });

    console.log(`[MOCK EMAIL] New verification link for ${email}: /api/v1/auth/verify?token=${verificationToken}`);

    return { message: 'If that email exists and is not verified, a new link has been sent.' };
  });

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
      mfaToken: z.string().optional(),
    });

    const body = schema.parse(request.body);

    const userResult = await fastify.db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [body.email],
    });

    if (userResult.rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const user: any = userResult.rows[0];

    // Check account lockout
    if (user.lockout_until) {
      const lockoutTime = new Date(user.lockout_until).getTime();
      if (lockoutTime > Date.now()) {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
        return reply.status(403).send({ 
          error: 'Account locked', 
          message: `Too many failed attempts. Try again in ${remaining} minutes.` 
        });
      } else {
        // Lockout expired, reset attempts
        await fastify.db.execute({
          sql: 'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?',
          args: [user.id],
        });
      }
    }

    const valid = await argon2.verify(user.password_hash as string, body.password);

    if (!valid) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockoutUntil = null;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      }

      await fastify.db.execute({
        sql: 'UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?',
        args: [attempts, lockoutUntil, user.id],
      });

      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    if (!user.email_verified) {
        return reply.status(403).send({ error: 'Email not verified', message: 'Please verify your email before logging in.' });
    }

    // Reset failed attempts on successful password check
    await fastify.db.execute({
      sql: 'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?',
      args: [user.id],
    });

    if (user.mfa_enabled) {
      if (!body.mfaToken) {
        return reply.status(200).send({ mfaRequired: true });
      }
      const verified = authenticator.verify({
        token: body.mfaToken,
        secret: user.mfa_secret,
      });
      if (!verified) {
        return reply.status(401).send({ error: 'Invalid MFA token' });
      }
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  });

  fastify.post('/forgot-password', async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
    });
    const { email } = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      await fastify.db.execute({
        sql: 'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
        args: [resetToken, resetExpires, user.id],
      });

      console.log(`[MOCK EMAIL] Password reset for ${email}: token=${resetToken}`);
    }

    // Always return success to prevent email enumeration
    return { message: 'If that email exists in our system, a reset link has been sent.' };
  });

  fastify.post('/reset-password', async (request, reply) => {
    const schema = z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    });
    const { token, newPassword } = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > ?',
      args: [token, new Date().toISOString()],
    });

    if (result.rows.length === 0) {
      return reply.status(400).send({ error: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];
    const passwordHash = await argon2.hash(newPassword);

    await fastify.db.execute({
      sql: `UPDATE users SET password_hash = ?, password_reset_token = NULL, 
            password_reset_expires = NULL, failed_login_attempts = 0, lockout_until = NULL 
            WHERE id = ?`,
      args: [passwordHash, user.id],
    });

    return { message: 'Password has been reset successfully' };
  });

  fastify.post('/change-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    const schema = z.object({
      oldPassword: z.string(),
      newPassword: z.string().min(8),
    });

    const body = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [userPayload.id],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const user = result.rows[0];
    const valid = await argon2.verify(user.password_hash as string, body.oldPassword);

    if (!valid) {
      return reply.status(400).send({ error: 'Invalid old password' });
    }

    const newPasswordHash = await argon2.hash(body.newPassword);

    await fastify.db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [newPasswordHash, userPayload.id],
    });

    return { success: true, message: 'Password changed successfully' };
  });

  fastify.post('/mfa/setup', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string; email: string };
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userPayload.email, 'KinReady', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    await fastify.db.execute({
      sql: 'UPDATE users SET mfa_secret = ? WHERE id = ?',
      args: [secret, userPayload.id],
    });

    return { secret, qrCode };
  });

  fastify.post('/mfa/verify', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    const schema = z.object({
      token: z.string(),
    });

    const body = schema.parse(request.body);

    const result = await fastify.db.execute({
      sql: 'SELECT mfa_secret FROM users WHERE id = ?',
      args: [userPayload.id],
    });

    if (result.rows.length === 0 || !result.rows[0].mfa_secret) {
      return reply.status(400).send({ error: 'MFA not set up' });
    }

    const verifyResult = authenticator.verify({
      token: body.token,
      secret: result.rows[0].mfa_secret as string,
    });

    if (!verifyResult) {
      return reply.status(400).send({ error: 'Invalid token' });
    }

    await fastify.db.execute({
      sql: 'UPDATE users SET mfa_enabled = 1 WHERE id = ?',
      args: [userPayload.id],
    });

    return { success: true };
  });
}
