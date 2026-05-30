import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '../middleware/audit.js';

export default async function vaultRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const result = await fastify.db.execute({
      sql: 'SELECT id, title, description, category, created_at, updated_at FROM vault_items WHERE user_id = ?',
      args: [user.id],
    });
    return result.rows;
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const schema = z.object({
      title: z.string(),
      description: z.string().optional(),
      encryptedData: z.string(),
      category: z.string().optional(),
    });

    const body = schema.parse(request.body);
    const id = uuidv4();

    await fastify.db.execute({
      sql: 'INSERT INTO vault_items (id, user_id, title, description, encrypted_data, category) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, user.id, body.title, body.description || null, body.encryptedData, body.category || 'general'],
    });

    await logAudit(fastify, user.id, 'create', 'vault_item', id);

    return { id, title: body.title };
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const result = await fastify.db.execute({
      sql: 'SELECT * FROM vault_items WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Vault item not found' });
    }

    await logAudit(fastify, user.id, 'view', 'vault_item', id);

    return result.rows[0];
  });

  fastify.patch('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      encryptedData: z.string().optional(),
      category: z.string().optional(),
    });

    const body = schema.parse(request.body);

    const existing = await fastify.db.execute({
      sql: 'SELECT id FROM vault_items WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (existing.rows.length === 0) {
      return reply.status(404).send({ error: 'Vault item not found' });
    }

    const updates: string[] = [];
    const args: any[] = [];

    if (body.title) { updates.push('title = ?'); args.push(body.title); }
    if (body.description !== undefined) { updates.push('description = ?'); args.push(body.description); }
    if (body.encryptedData) { updates.push('encrypted_data = ?'); args.push(body.encryptedData); }
    if (body.category) { updates.push('category = ?'); args.push(body.category); }
    
    updates.push('updated_at = datetime("now")');

    args.push(id, user.id);

    await fastify.db.execute({
      sql: `UPDATE vault_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      args,
    });

    await logAudit(fastify, user.id, 'update', 'vault_item', id);

    return { success: true };
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    const result = await fastify.db.execute({
      sql: 'DELETE FROM vault_items WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (result.rowsAffected === 0) {
      return reply.status(404).send({ error: 'Vault item not found' });
    }

    await logAudit(fastify, user.id, 'delete', 'vault_item', id);

    return { success: true };
  });
}
