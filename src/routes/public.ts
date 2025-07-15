import { FastifyInstance } from "fastify";
import { admin } from "../handlers/admin";
import { tournament } from "../handlers/tournament";
import { team } from "../handlers/team";

export async function publicRoutes(app: FastifyInstance) {
  app.post(
    "/auth/admin/login",
    { schema: admin.login.schema },
    admin.login.handler
  );

  app.get(
    "/tournaments",
    { schema: tournament.getAll.schema },
    tournament.getAll.handler
  );

  app.get(
    "/tournament/:id",
    { schema: tournament.getById.schema },
    tournament.getById.handler
  );
  app.post(
    "/tournament/register",
    { schema: tournament.register.schema },
    tournament.register.handler
  );

  app.get("/teams", { schema: team.getAll.schema }, team.getAll.handler);

  app.get("/team/:id", { schema: team.getById.schema }, team.getById.handler);
}
