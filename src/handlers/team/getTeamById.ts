// src/handlers/team/getTeamById.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request params
export interface GetTeamByIdParams {
  id: string;
}

// Define the schema for Swagger documentation
const getTeamByIdSchema = {
  tags: ["Team"],
  summary: "Get Team by ID",
  description: "Retrieves a specific team by its ID.",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Team retrieved successfully" },
        team: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            contact: { type: "string" },
            logo: { type: "string" },
            player: {
              type: "array",
              items: { type: "string" }
            },
            payment_status: { type: "string" },
            payment_quantity: { type: "number" },
            teamParticipants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  tournamentId: { type: "string" },
                  registeredAt: { type: "string", format: "date-time" },
                  tournament: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      date: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    404: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        error: { type: "string", example: "Not Found" },
        message: { type: "string", example: "Team not found." }
      }
    },
    500: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        error: { type: "string", example: "Internal Server Error" },
        message: { type: "string", example: "Failed to retrieve team." }
      }
    }
  }
};

// The handler function for getting a team by ID
export async function getTeamByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as GetTeamByIdParams;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        teamParticipants: {
          include: {
            tournament: {
              select: {
                id: true,
                title: true,
                date: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        }
      }
    });

    if (!team) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Team not found."
      });
    }

    reply.code(200).send({
      message: "Team retrieved successfully",
      team
    });
  } catch (error) {
    request.log.error("Error retrieving team:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to retrieve team."
    });
  }
}

// Export the handler and schema
export const getTeamById = {
  handler: getTeamByIdHandler,
  schema: getTeamByIdSchema
};