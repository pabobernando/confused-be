import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { favicon16 } from "./favicon.js";
import { logoKoni } from "./logo.js";

export async function setupDocs(app: FastifyInstance) {
  // Register Swagger with OpenAPI v3
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Confused Tournament App API",
        description: "API documentation fo Confused Tournament app",
        version: "1.0.0", // Use the imported version
      },
      tags: [
        {
          name: "Auth",
          description: "Retrieve and manage authentication",
        },
        {
          name: "Tournament",
          description: "Retrieve and manage tournament",
        },
        {
          name: "Team",
          description: "Retrieve and manage team",
        },
        {
          name: "Player",
          description: "Retrieve and manage player",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "Enter your token only. The API will automatically prepend 'Bearer ' to the token.",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });

  // Register Swagger UI
  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    logo: {
      type: "image/png",
      content: Buffer.from(logoKoni, "base64"),
      href: "/docs",
      target: "_blank",
    },
    theme: {
      favicon: [
        {
          filename: "favicon.png",
          rel: "icon",
          sizes: "16x16",
          type: "image/png",
          content: Buffer.from(favicon16, "base64"),
        },
      ],
    },
  });
}
