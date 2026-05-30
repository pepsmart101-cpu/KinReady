import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const schema = z.object({
      message: z.string(),
      sessionId: z.string().optional(),
    });

    const body = schema.parse(request.body);
    let sessionId = body.sessionId;

    if (!sessionId) {
      sessionId = uuidv4();
      await fastify.db.execute({
        sql: 'INSERT INTO ai_chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
        args: [sessionId, user.id, body.message.substring(0, 50)],
      });
    }

    // Store user message
    await fastify.db.execute({
      sql: 'INSERT INTO ai_chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      args: [uuidv4(), sessionId, 'user', body.message],
    });

    // Mock AI Response (Integration point for LLM)
    const aiResponse = `This is a mock response to: "${body.message}". KinReady AI is here to help with your family readiness plans. Please note that I cannot provide legal advice.`;

    // Store AI message
    await fastify.db.execute({
      sql: 'INSERT INTO ai_chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      args: [uuidv4(), sessionId, 'assistant', aiResponse],
    });

    return { sessionId, response: aiResponse };
  });

  fastify.get('/sessions', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const result = await fastify.db.execute({
      sql: 'SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY created_at DESC',
      args: [user.id],
    });
    return result.rows;
  });

  fastify.get('/sessions/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await fastify.db.execute({
      sql: 'SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY timestamp ASC',
      args: [id],
    });
    return result.rows;
  });
}
