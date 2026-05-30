import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '../middleware/audit.js';

export default async function documentRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const result = await fastify.db.execute({
      sql: 'SELECT id, title, status, created_at, updated_at FROM documents WHERE user_id = ?',
      args: [user.id],
    });
    return result.rows;
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const schema = z.object({
      title: z.string(),
      contentEncrypted: z.string(),
      templateId: z.string().optional(),
    });

    const body = schema.parse(request.body);
    const id = uuidv4();

    await fastify.db.execute({
      sql: 'INSERT INTO documents (id, user_id, title, content_encrypted, template_id) VALUES (?, ?, ?, ?, ?)',
      args: [id, user.id, body.title, body.contentEncrypted, body.templateId || null],
    });

    await logAudit(fastify, user.id, 'create', 'document', id);

    return { id, title: body.title };
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const result = await fastify.db.execute({
      sql: 'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    await logAudit(fastify, user.id, 'view', 'document', id);

    return result.rows[0];
  });

  fastify.patch('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };
    const schema = z.object({
      title: z.string().optional(),
      contentEncrypted: z.string().optional(),
      status: z.string().optional(),
    });

    const body = schema.parse(request.body);

    const existing = await fastify.db.execute({
      sql: 'SELECT id FROM documents WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (existing.rows.length === 0) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    const updates: string[] = [];
    const args: any[] = [];

    if (body.title) { updates.push('title = ?'); args.push(body.title); }
    if (body.contentEncrypted) { updates.push('content_encrypted = ?'); args.push(body.contentEncrypted); }
    if (body.status) { updates.push('status = ?'); args.push(body.status); }
    
    updates.push('updated_at = datetime("now")');

    args.push(id, user.id);

    await fastify.db.execute({
      sql: `UPDATE documents SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      args,
    });

    await logAudit(fastify, user.id, 'update', 'document', id);

    return { success: true };
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const result = await fastify.db.execute({
      sql: 'DELETE FROM documents WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (result.rowsAffected === 0) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    await logAudit(fastify, user.id, 'delete', 'document', id);

    return { success: true };
  });
}
