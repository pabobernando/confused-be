import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Define the schema for Swagger documentation and Fastify validation
const createTournamentSchema = {
    tags: ["Tournament"], // Tag for Swagger UI organization
    summary: "Create a new Tournament (Admin Only)",
    description: "Creates a new tournament record in the database.",
    security: [{ BearerAuth: [] }], // Changed from bearerAuth to BearerAuth to match docs.ts
    body: {
        type: "object",
        required: ["title", "poster", "location", "description", "date", "price"],
        properties: {
            title: { type: "string", minLength: 3, example: "Summer Showdown" },
            poster: {
                type: "string",
                format: "uri",
                example: "https://example.com/poster.jpg",
            },
            location: { type: "string", example: "Online" },
            description: { type: "string", example: "Annual esports tournament." },
            date: {
                type: "string",
                format: "date-time",
                example: "2025-09-01T10:00:00Z",
            }, // ISO 8601 format
            price: { type: "string", example: "50 USD" },
        },
    },
    response: {
        201: {
            type: "object",
            properties: {
                message: { type: "string", example: "Tournament created successfully" },
                tournament: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        poster: { type: "string" },
                        location: { type: "string" },
                        date: { type: "string", format: "date-time" },
                    },
                },
            },
        },
        401: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 401 },
                error: { type: "string", example: "Unauthorized" },
                message: { type: "string", example: "Invalid or expired token." },
            },
        },
        403: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 403 },
                error: { type: "string", example: "Forbidden" },
                message: { type: "string", example: "Insufficient permissions." },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 500 },
                error: { type: "string", example: "Internal Server Error" },
                message: { type: "string", example: "Failed to create tournament." },
            },
        },
    },
};
// The handler function for the route - made more generic
export async function createTournamentHandler(request, reply) {
    try {
        const { title, poster, location, description, date, price } = request.body;
        // Parse the date string into a Date object
        const tournamentDate = new Date(date);
        if (isNaN(tournamentDate.getTime())) {
            return reply.code(400).send({
                statusCode: 400,
                error: "Bad Request",
                message: "Invalid date format. Please use ISO 8601 (e.g., 2025-09-01T10:00:00Z).",
            });
        }
        const tournament = await prisma.tournament.create({
            data: {
                title,
                poster,
                location,
                description,
                date: tournamentDate,
                price,
            },
            select: {
                id: true,
                title: true,
                poster: true,
                location: true,
                date: true,
            },
        });
        reply.code(201).send({
            message: "Tournament created successfully",
            tournament,
        });
    }
    catch (error) {
        request.log.error("Error creating tournament:", error);
        reply.code(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: "Failed to create tournament.",
        });
    }
}
// Export the handler and schema following your pattern
export const createTournament = {
    handler: createTournamentHandler,
    schema: createTournamentSchema,
};
