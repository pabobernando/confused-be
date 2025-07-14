import { tournament } from "../handlers/tournament";
// Base authentication - verifies token validity.
const authenticate = async (request, reply) => {
    try {
        await request.jwtVerify();
        // Token is cryptographically valid. Log success.
        const userIdForLogging = request.user?.id; // Attempt to get id for logging
        request.log.info({ userId: userIdForLogging || "N/A" }, "Token successfully verified (base authentication)");
    }
    catch (err) {
        // This catch block handles errors from jwtVerify (e.g., token expired, malformed)
        request.log.warn({ err }, "JWT verification failed");
        reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid or expired token.",
        });
    }
};
export async function privateRoutes(app) {
    // Add the authenticate functions to the Fastify instance
    app.decorate("authenticate", authenticate);
    // Define private routes here
    app.post("/tournament", {
        schema: tournament.create.schema,
        preHandler: [app.authenticate],
    }, tournament.create.handler);
    app.get("/tournaments", { schema: tournament.getAll.schema, preHandler: [app.authenticate] }, tournament.getAll.handler);
    app.get("/tournament/:id", { schema: tournament.getById.schema, preHandler: [app.authenticate] }, tournament.getById.handler);
}
