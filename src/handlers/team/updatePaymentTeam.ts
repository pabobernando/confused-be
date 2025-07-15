// src/handlers/team/updatePaymentTeam.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request body for updating team payment
export interface UpdatePaymentTeamBody {
  payment_status: "PENDING" | "PAID" | "FAILED";
}

// Define the shape of the request params
export interface UpdatePaymentTeamParams {
  id: string;
}

// Define the schema for Swagger documentation
const updatePaymentTeamSchema = {
  tags: ["Team"],
  summary: "Update Team Payment Status (Admin Only)",
  description: "Updates the payment status for a team.",
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
    required: ["payment_status"],
    properties: {
      payment_status: {
        type: "string",
        enum: ["PENDING", "PAID", "FAILED"],
        example: "PAID"
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Team payment updated successfully" },
        team: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            payment_status: { type: "string" },
            payment_quantity: { type: "number" }
          }
        }
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
        message: { type: "string", example: "Failed to update team payment." }
      }
    }
  }
};

// The handler function for updating team payment
export async function updatePaymentTeamHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as UpdatePaymentTeamParams;
    const { payment_status } = request.body as UpdatePaymentTeamBody;

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

    const team = await prisma.team.update({
      where: { id },
      data: {
        payment_status
      },
      select: {
        id: true,
        name: true,
        payment_status: true,
        payment_quantity: true
      }
    });

    reply.code(200).send({
      message: "Team payment updated successfully",
      team
    });
  } catch (error) {
    request.log.error("Error updating team payment:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to update team payment."
    });
  }
}

// Export the handler and schema
export const updatePaymentTeam = {
  handler: updatePaymentTeamHandler,
  schema: updatePaymentTeamSchema
};