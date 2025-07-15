// src/handlers/team/updateTeam.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request body for updating a team
export interface UpdateTeamBody {
  name?: string;
  contact?: string;
  logo?: string;
  player?: string[];
}

// Define the shape of the request params
export interface UpdateTeamParams {
  id: string;
}

// Define the schema for Swagger documentation
const updateTeamSchema = {
  tags: ["Team"],
  summary: "Update Team (Admin Only)",
  description: "Updates an existing team record in the database. Payment updates are handled separately.",
  security: [{ BearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" }
    }
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "Team Alpha" },
      contact: { type: "string", example: "team@example.com" },
      logo: { type: "string", format: "uri", example: "https://example.com/logo.png" },
      player: {
        type: "array",
        items: { type: "string" },
        example: ["Player1", "Player2", "Player3"]
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Team updated successfully" },
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
            }
          }
        }
      }
    },
    400: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        error: { type: "string", example: "Bad Request" },
        message: { type: "string", example: "Team name already exists." }
      }
    },
    401: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        error: { type: "string", example: "Unauthorized" },
        message: { type: "string", example: "Invalid or expired token." }
      }
    },
    403: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 403 },
        error: { type: "string", example: "Forbidden" },
        message: { type: "string", example: "Insufficient permissions." }
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
        message: { type: "string", example: "Failed to update team." }
      }
    }
  }
};

// The handler function for updating a team
export async function updateTeamHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as UpdateTeamParams;
    const updateData = request.body as UpdateTeamBody;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });

    if (!existingTeam) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Team not found."
      });
    }

    // Check if name is being updated and if it already exists
    if (updateData.name && updateData.name !== existingTeam.name) {
      const nameExists = await prisma.team.findUnique({
        where: { name: updateData.name }
      });

      if (nameExists) {
        return reply.code(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: "Team name already exists."
        });
      }
    }

    // Prepare update data (excluding payment fields)
    const updatePayload: any = {};
    
    if (updateData.name !== undefined) updatePayload.name = updateData.name;
    if (updateData.contact !== undefined) updatePayload.contact = updateData.contact;
    if (updateData.logo !== undefined) updatePayload.logo = updateData.logo;
    if (updateData.player !== undefined) updatePayload.player = updateData.player;

    const team = await prisma.team.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        contact: true,
        logo: true,
        player: true
      }
    });

    reply.code(200).send({
      message: "Team updated successfully",
      team
    });
  } catch (error) {
    request.log.error("Error updating team:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to update team."
    });
  }
}

// Export the handler and schema
export const updateTeam = {
  handler: updateTeamHandler,
  schema: updateTeamSchema
};