import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export async function logAudit(fastify: FastifyInstance, userId: string, action: string, resourceType: string, resourceId?: string, details?: string) {
  await fastify.db.execute({
    sql: 'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    args: [uuidv4(), userId, action, resourceType, resourceId || null, details || null],
  });
}
