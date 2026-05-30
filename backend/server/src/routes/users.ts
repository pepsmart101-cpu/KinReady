import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string; email: string };

    const result = await fastify.db.execute({
      sql: `SELECT id, email, first_name, last_name, role, mfa_enabled, email_verified, 
            notification_preferences, theme, privacy_settings, created_at 
            FROM users WHERE id = ?`,
      args: [user.id],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return result.rows[0];
  });

  fastify.patch('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userPayload = request.user as { id: string };
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      notificationPreferences: z.string().optional(),
      theme: z.enum(['light', 'dark']).optional(),
      privacySettings: z.string().optional(),
    });

    const body = schema.parse(request.body);
    const updates: string[] = [];
    const args: any[] = [];

    if (body.firstName !== undefined) {
      updates.push('first_name = ?');
      args.push(body.firstName);
    }
    if (body.lastName !== undefined) {
      updates.push('last_name = ?');
      args.push(body.lastName);
    }
    if (body.notificationPreferences !== undefined) {
      updates.push('notification_preferences = ?');
      args.push(body.notificationPreferences);
    }
    if (body.theme !== undefined) {
      updates.push('theme = ?');
      args.push(body.theme);
    }
    if (body.privacySettings !== undefined) {
      updates.push('privacy_settings = ?');
      args.push(body.privacySettings);
    }

    if (updates.length === 0) {
      return reply.status(400).send({ error: 'No fields to update' });
    }

    args.push(userPayload.id);

    await fastify.db.execute({
      sql: `UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      args,
    });

    return { success: true };
  });

  fastify.delete('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };

    // Explicitly delete all user-related data to ensure completeness
    
    // AI Chat
    await fastify.db.execute({
      sql: 'DELETE FROM ai_chat_messages WHERE session_id IN (SELECT id FROM ai_chat_sessions WHERE user_id = ?)',
      args: [user.id],
    });
    await fastify.db.execute({
      sql: 'DELETE FROM ai_chat_sessions WHERE user_id = ?',
      args: [user.id],
    });

    // Audit Logs
    await fastify.db.execute({
      sql: 'DELETE FROM audit_logs WHERE user_id = ?',
      args: [user.id],
    });

    // Progress
    await fastify.db.execute({
      sql: 'DELETE FROM user_progress WHERE user_id = ?',
      args: [user.id],
    });

    // Vault & Documents
    await fastify.db.execute({
      sql: 'DELETE FROM vault_items WHERE user_id = ?',
      args: [user.id],
    });
    await fastify.db.execute({
      sql: 'DELETE FROM documents WHERE user_id = ?',
      args: [user.id],
    });

    // Family (remove membership)
    await fastify.db.execute({
      sql: 'DELETE FROM family_members WHERE user_id = ?',
      args: [user.id],
    });

    // Consent logs
    await fastify.db.execute({
      sql: 'DELETE FROM consent_logs WHERE user_id = ?',
      args: [user.id],
    });

    // Finally, the user
    await fastify.db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [user.id],
    });

    return { success: true, message: 'Account and all related data deleted successfully' };
  });

  fastify.get('/me/export', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };

    const userData = await fastify.db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [user.id],
    });

    const documents = await fastify.db.execute({
      sql: 'SELECT * FROM documents WHERE user_id = ?',
      args: [user.id],
    });

    const vaultItems = await fastify.db.execute({
      sql: 'SELECT * FROM vault_items WHERE user_id = ?',
      args: [user.id],
    });

    const familyMemberships = await fastify.db.execute({
      sql: 'SELECT * FROM family_members WHERE user_id = ?',
      args: [user.id],
    });

    const progress = await fastify.db.execute({
      sql: 'SELECT * FROM user_progress WHERE user_id = ?',
      args: [user.id],
    });

    const auditLogs = await fastify.db.execute({
      sql: 'SELECT * FROM audit_logs WHERE user_id = ?',
      args: [user.id],
    });

    const aiSessions = await fastify.db.execute({
      sql: 'SELECT * FROM ai_chat_sessions WHERE user_id = ?',
      args: [user.id],
    });

    const exportData = {
      profile: userData.rows[0],
      documents: documents.rows,
      vaultItems: vaultItems.rows,
      familyMemberships: familyMemberships.rows,
      progress: progress.rows,
      auditLogs: auditLogs.rows,
      aiSessions: aiSessions.rows,
      exportedAt: new Date().toISOString(),
    };

    // Remove sensitive fields from export
    if (exportData.profile) {
      delete (exportData.profile as any).password_hash;
      delete (exportData.profile as any).mfa_secret;
      delete (exportData.profile as any).verification_token;
      delete (exportData.profile as any).password_reset_token;
    }

    return exportData;
  });
}
