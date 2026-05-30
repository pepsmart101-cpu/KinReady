import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export default async function workflowRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const result = await fastify.db.execute('SELECT * FROM workflows');
    return result.rows;
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const workflow = await fastify.db.execute({
      sql: 'SELECT * FROM workflows WHERE id = ?',
      args: [id],
    });

    if (workflow.rows.length === 0) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    const steps = await fastify.db.execute({
      sql: 'SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_order ASC',
      args: [id],
    });

    return {
      ...workflow.rows[0],
      steps: steps.rows,
    };
  });

  fastify.get('/:id/progress', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id: workflowId } = request.params as { id: string };

    const result = await fastify.db.execute({
      sql: `SELECT ws.id as step_id, ws.title, up.status, up.data 
            FROM workflow_steps ws 
            LEFT JOIN user_progress up ON ws.id = up.workflow_step_id AND up.user_id = ?
            WHERE ws.workflow_id = ?
            ORDER BY ws.step_order ASC`,
      args: [user.id, workflowId],
    });

    return result.rows;
  });

  fastify.post('/:id/steps/:stepId/progress', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { stepId } = request.params as { stepId: string };
    const schema = z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      data: z.string().optional(),
    });

    const body = schema.parse(request.body);

    await fastify.db.execute({
      sql: `INSERT INTO user_progress (id, user_id, workflow_step_id, status, data) 
            VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(user_id, workflow_step_id) DO UPDATE SET 
            status = excluded.status, data = excluded.data, updated_at = datetime('now')`,
      args: [uuidv4(), user.id, stepId, body.status, body.data || null],
    });

    return { success: true };
  });
}
