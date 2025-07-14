import { FastifyInstance } from "fastify";
import { publicRoutes } from "./public.js";
import { privateRoutes } from "./private.js";
import { notFoundHandler } from "../handlers/custom/notFound.js";
import { homeHandler } from "../handlers/custom/home.js";

export async function setupRoutes(app: FastifyInstance) {
  await app.register(publicRoutes);
  await app.register(privateRoutes);

  // Add home route
  app.get("/", { schema: { hide: true } }, homeHandler);

  // Add a catch-all route for handling 404 errors with styled HTML page
  app.setNotFoundHandler(notFoundHandler);
}
