import { FastifyInstance } from "fastify";
import { admin } from "../handlers/admin";
import { tournament } from "../handlers/tournament";

export async function publicRoutes(app: FastifyInstance) {
  app.post(
    "/auth/admin/login",
    { schema: admin.login.schema },
    admin.login.handler
  );
  app.post(
    "/tournament/register",
    { schema: tournament.register.schema },
    tournament.register.handler
  );
}
