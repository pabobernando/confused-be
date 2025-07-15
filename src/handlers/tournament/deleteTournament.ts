// src/handlers/tournament/deleteTournament.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request params
export interface DeleteTournamentParams {
  id: string;
}

// Define the schema for Swagger documentation and Fastify validation
const deleteTournamentSchema = {
  tags: ["Tournament"], // Tag for Swagger UI organization
  summary: "Delete a Tournament (Admin Only)",
  description: "Deletes a tournament record from the database. Cannot delete if participants exist.",
  security: [{ BearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament deleted successfully" },
        deletedTournament: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
          },
        },
      },
    },
    400: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        error: { type: "string", example: "Bad Request" },
        message: { type: "string", example: "Cannot delete tournament with existing participants. Please remove all participants first." },
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
    404: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        error: { type: "string", example: "Not Found" },
        message: { type: "string", example: "Tournament not found." },
      },
    },
    500: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        error: { type: "string", example: "Internal Server Error" },
        message: { type: "string", example: "Failed to delete tournament." },
      },
    },
  },
};

// The handler function for deleting a tournament
export async function deleteTournamentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as DeleteTournamentParams;

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        tournamentParticipants: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingTournament) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Tournament not found.",
      });
    }

    // Check if tournament has participants
    if (existingTournament.tournamentParticipants.length > 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Cannot delete tournament with existing participants. Please remove all participants first.",
      });
    }

    // Delete the tournament
    const deletedTournament = await prisma.tournament.delete({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });

    reply.code(200).send({
      message: "Tournament deleted successfully",
      deletedTournament,
    });
  } catch (error) {
    request.log.error("Error deleting tournament:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to delete tournament.",
    });
  }
}

// Export the handler and schema
export const deleteTournament = {
  handler: deleteTournamentHandler,
  schema: deleteTournamentSchema,
};