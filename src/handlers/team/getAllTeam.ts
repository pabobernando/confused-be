// src/handlers/team/getAllTeam.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the schema for Swagger documentation
const getAllTeamSchema = {
  tags: ["Team"],
  summary: "Get All Teams",
  description: "Retrieves all teams from the database.",
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Teams retrieved successfully" },
        teams: {
          type: "array",
          items: {
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
              _count: {
                type: "object",
                properties: {
                  teamParticipants: { type: "number" }
                }
              }
            }
          }
        },
        total: { type: "number", example: 10 }
      }
    },
    500: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        error: { type: "string", example: "Internal Server Error" },
        message: { type: "string", example: "Failed to retrieve teams." }
      }
    }
  }
};

// The handler function for getting all teams
export async function getAllTeamHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            teamParticipants: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    reply.code(200).send({
      message: "Teams retrieved successfully",
      teams,
      total: teams.length
    });
  } catch (error) {
    request.log.error("Error retrieving teams:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to retrieve teams."
    });
  }
}

// Export the handler and schema
export const getAllTeam = {
  handler: getAllTeamHandler,
  schema: getAllTeamSchema
};