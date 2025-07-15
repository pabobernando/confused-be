// src/handlers/tournament/updateTournament.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request body for updating a tournament
export interface UpdateTournamentBody {
  title?: string;
  poster?: string;
  location?: string;
  description?: string;
  date?: string; // Will be parsed to Date
  price?: string;
}

// Define the shape of the request params
export interface UpdateTournamentParams {
  id: string;
}

// Define the schema for Swagger documentation and Fastify validation
const updateTournamentSchema = {
  tags: ["Tournament"], // Tag for Swagger UI organization
  summary: "Update a Tournament (Admin Only)",
  description: "Updates an existing tournament record in the database.",
  security: [{ BearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
    },
  },
  body: {
    type: "object",
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
      },
      price: { type: "string", example: "50 USD" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament updated successfully" },
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
    400: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        error: { type: "string", example: "Bad Request" },
        message: { type: "string", example: "Invalid date format or tournament ID." },
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
        message: { type: "string", example: "Failed to update tournament." },
      },
    },
  },
};

// The handler function for updating a tournament
export async function updateTournamentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as UpdateTournamentParams;
    const updateData = request.body as UpdateTournamentBody;

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!existingTournament) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Tournament not found.",
      });
    }

    // Prepare update data
    const updatePayload: any = {};
    
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.poster !== undefined) updatePayload.poster = updateData.poster;
    if (updateData.location !== undefined) updatePayload.location = updateData.location;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.price !== undefined) updatePayload.price = updateData.price;
    
    // Handle date parsing if provided
    if (updateData.date !== undefined) {
      const tournamentDate = new Date(updateData.date);
      if (isNaN(tournamentDate.getTime())) {
        return reply.code(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Invalid date format. Please use ISO 8601 (e.g., 2025-09-01T10:00:00Z).",
        });
      }
      updatePayload.date = tournamentDate;
    }

    const tournament = await prisma.tournament.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        title: true,
        poster: true,
        location: true,
        date: true,
      },
    });

    reply.code(200).send({
      message: "Tournament updated successfully",
      tournament,
    });
  } catch (error) {
    request.log.error("Error updating tournament:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to update tournament.",
    });
  }
}

// Export the handler and schema
export const updateTournament = {
  handler: updateTournamentHandler,
  schema: updateTournamentSchema,
};