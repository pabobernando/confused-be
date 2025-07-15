// src/routes/tournament/getAllTournament.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the schema for Swagger documentation
const getAllTournamentSchema = {
  tags: ["Tournament"],
  summary: "Get all Tournaments",
  description: "Retrieves a list of all tournaments.",
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          poster: {
            type: "string",
            description: "Base64 encoded image string",
          },
          location: { type: "string" },
          description: { type: "string" },
          date: { type: "string", format: "date-time" },
          price: { type: "string" },
        },
      },
    },
    500: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        error: { type: "string", example: "Internal Server Error" },
        message: { type: "string", example: "Failed to retrieve tournaments." },
      },
    },
  },
};

// The handler function
export async function getAllTournamentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        title: true,
        poster: true, // Now directly returns string
        location: true,
        description: true,
        date: true,
        price: true,
      },
    });

    // Simple transformation to ensure date is in ISO format
    const transformedTournaments = tournaments.map((tournament) => ({
      ...tournament,
      date: tournament.date.toISOString(),
    }));

    reply.code(200).send(transformedTournaments);
  } catch (error) {
    request.log.error("Error getting all tournaments:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to retrieve tournaments.",
    });
  }
}

// Export the handler and schema
export const getAllTournament = {
  handler: getAllTournamentHandler,
  schema: getAllTournamentSchema,
};
