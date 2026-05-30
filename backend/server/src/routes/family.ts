import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export default async function familyRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };

    const result = await fastify.db.execute({
      sql: `
        SELECT fg.*, fm.role as user_role 
        FROM family_groups fg
        JOIN family_members fm ON fg.id = fm.family_group_id
        WHERE fm.user_id = ?
      `,
      args: [user.id],
    });

    return result.rows;
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const schema = z.object({
      name: z.string().min(1),
    });

    const body = schema.parse(request.body);
    const familyId = uuidv4();
    const memberId = uuidv4();

    // Use a manual transaction if needed, but here we'll just execute sequentially
    // for simplicity in this environment.
    await fastify.db.execute({
      sql: 'INSERT INTO family_groups (id, name) VALUES (?, ?)',
      args: [familyId, body.name],
    });

    await fastify.db.execute({
      sql: `
        INSERT INTO family_members (id, family_group_id, user_id, first_name, role) 
        VALUES (?, ?, ?, ?, 'owner')
      `,
      args: [memberId, familyId, user.id, 'Owner'], // In a real app we'd get the user's name
    });

    return { id: familyId, name: body.name };
  });

  fastify.get('/:id/members', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id } = request.params as { id: string };

    // Check if user is member of the group
    const membership = await fastify.db.execute({
      sql: 'SELECT id FROM family_members WHERE family_group_id = ? AND user_id = ?',
      args: [id, user.id],
    });

    if (membership.rows.length === 0) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const members = await fastify.db.execute({
      sql: 'SELECT * FROM family_members WHERE family_group_id = ?',
      args: [id],
    });

    return members.rows;
  });

  fastify.post('/:id/members', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as { id: string };
    const { id: familyGroupId } = request.params as { id: string };
    const schema = z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional(),
      relationship: z.string().optional(),
      email: z.string().email().optional(),
    });

    const body = schema.parse(request.body);

    // Check if user is owner/admin of the group
    const membership = await fastify.db.execute({
      sql: "SELECT role FROM family_members WHERE family_group_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      args: [familyGroupId, user.id],
    });

    if (membership.rows.length === 0) {
      return reply.status(403).send({ error: 'Only owners or admins can add members' });
    }

    let invitedUserId = null;
    if (body.email) {
      const userResult = await fastify.db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [body.email],
      });
      if (userResult.rows.length > 0) {
        invitedUserId = userResult.rows[0].id;
      }
    }

    const memberId = uuidv4();
    await fastify.db.execute({
      sql: `
        INSERT INTO family_members (id, family_group_id, user_id, first_name, last_name, relationship, role) 
        VALUES (?, ?, ?, ?, ?, ?, 'member')
      `,
      args: [
        memberId, 
        familyGroupId, 
        invitedUserId, 
        body.firstName, 
        body.lastName || null, 
        body.relationship || null
      ],
    });

    return { id: memberId, invitedUserId };
  });
}
