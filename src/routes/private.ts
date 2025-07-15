import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { tournament } from "../handlers/tournament";
import { CreateTournamentBody } from "../handlers/tournament/createTournament";
import { team } from "../handlers/team";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

// Base authentication - verifies token validity.
const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    await request.jwtVerify();
    // Token is cryptographically valid. Log success.
    const userIdForLogging = (request.user as any)?.id; // Attempt to get id for logging
    request.log.info(
      { userId: userIdForLogging || "N/A" },
      "Token successfully verified (base authentication)"
    );
  } catch (err) {
    // This catch block handles errors from jwtVerify (e.g., token expired, malformed)
    request.log.warn({ err }, "JWT verification failed");
    reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token.",
    });
  }
};

export async function privateRoutes(app: FastifyInstance) {
  // Add the authenticate functions to the Fastify instance
  app.decorate("authenticate", authenticate);

  // Define private routes here
  app.post(
    "/tournament",
    {
      schema: tournament.create.schema,
      preHandler: [app.authenticate],
    },
    tournament.create.handler
  );

  app.get(
    "/tournaments",
    { schema: tournament.getAll.schema, preHandler: [app.authenticate] },
    tournament.getAll.handler
  );

  app.get(
    "/tournament/:id",
    { schema: tournament.getById.schema, preHandler: [app.authenticate] },
    tournament.getById.handler
  );

  app.put(
    "/tournament/:id",
    { schema: tournament.update.schema, preHandler: [app.authenticate] },
    tournament.update.handler
  );

  app.delete(
    "/tournament/:id",
    { schema: tournament.delete.schema, preHandler: [app.authenticate] },
    tournament.delete.handler
  );

  app.get(
    "/teams",
    { schema: team.getAll.schema, preHandler: [app.authenticate] },
    team.getAll.handler
  );

  app.get(
    "/team/:id",
    { schema: team.getById.schema, preHandler: [app.authenticate] },
    team.getById.handler
  );

  app.put(
    "/team/:id",
    { schema: team.update.schema, preHandler: [app.authenticate] },
    team.update.handler
  );

  app.put(
    "/team/:id/payment",
    { schema: team.updatePayment.schema, preHandler: [app.authenticate] },
    team.updatePayment.handler
  );
}
