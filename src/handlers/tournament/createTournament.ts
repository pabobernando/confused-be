// src/routes/tournament/createTournament.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of the request body for creating a tournament
export interface CreateTournamentBody {
  title: string;
  poster: string; // Base64 string (with or without data URL prefix)
  location: string;
  description: string;
  date: string; // Will be parsed to Date
  price: string;
}

// Define the schema for Swagger documentation and Fastify validation
const createTournamentSchema = {
  tags: ["Tournament"],
  summary: "Create a new Tournament (Admin Only)",
  description: "Creates a new tournament record in the database.",
  security: [{ BearerAuth: [] }],
  body: {
    type: "object",
    required: ["title", "poster", "location", "description", "date", "price"],
    properties: {
      title: { type: "string", minLength: 3, example: "Summer Showdown" },
      poster: {
        type: "string",
        description: "Tournament poster image as base64 encoded string",
        example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
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
    201: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament created successfully" },
        tournament: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            poster: { type: "string", description: "Base64 encoded image" },
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

// The handler function for the route
export async function createTournamentHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { title, poster, location, description, date, price } =
      request.body as CreateTournamentBody;

    // Parse the date string into a Date object
    const tournamentDate = new Date(date);
    if (isNaN(tournamentDate.getTime())) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Invalid date format. Please use ISO 8601 (e.g., 2025-09-01T10:00:00Z).",
      });
    }

    // Simple validation for base64 format (optional)
    if (!poster || poster.trim() === "") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Poster field is required.",
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        title,
        poster, // Store directly as string
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
      tournament: {
        ...tournament,
        date: tournament.date.toISOString(),
      },
    });
  } catch (error) {
    request.log.error("Error creating tournament:", error);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Failed to create tournament.",
    });
  }
}

// Export the handler and schema
export const createTournament = {
  handler: createTournamentHandler,
  schema: createTournamentSchema,
};
