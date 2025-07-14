import Fastify from "fastify";
import fastifyJWT from "@fastify/jwt";
import bcrypt from "fastify-bcrypt";
import fastifyMultipart from "fastify-multipart";
import fastifyCors from "@fastify/cors";
import { setupDocs } from "./plugin/docs.js";
import { setupRoutes } from "./routes/index.js";
import dotenv from "dotenv";

declare module "fastify" {
  interface FastifyRequest {
    startTime?: number;
  }
}

// Load environment variables
dotenv.config();

const app = Fastify({
  logger:
    process.env.NODE_ENV === "production"
      ? true // Use standard JSON logging in production
      : {
          // Use pretty logging in development
          transport: {
            target: "pino-pretty",
            options: {
              singleLine: true,
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
          level: "info",
        },
  ajv: {
    customOptions: {
      strict: false, // Disable strict mode to allow unknown keywords
      keywords: ["example"], // Add "example" as an allowed keyword
    },
  },
});

app.register(bcrypt, {
  saltWorkFactor: 10, // You can adjust this value as needed
});

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10000000, // Optional: Max file size (10 MB)
  },
});

// Hook to log incoming requests
app.addHook("onRequest", async (request) => {
  const timestamp = new Date().toLocaleTimeString();
  const method = request.method;
  const url = request.url;
  const ip = request.ip;

  app.log.info(`[REQ] ${timestamp} | ${method} ${url} | From ${ip}`);
});

app.addHook("onRequest", async (request) => {
  const timestamp = new Date().toLocaleTimeString();
  const { method, url, ip } = request;

  app.log.info(`[REQ] ${timestamp} | ${method} ${url} | From ${ip}`);
});

// Hook to log completed responses
app.addHook("onResponse", async (request, reply) => {
  const timestamp = new Date().toLocaleTimeString();
  const { method, url } = request;
  const statusCode = reply.statusCode;

  // Manually calculate the response time using process.hrtime()
  const startTime = (request as any).startTime;
  const diff = process.hrtime(startTime);
  const responseTime = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

  app.log.info(
    `[RES] ${timestamp} | ${method} ${url} | ${statusCode} | ${responseTime}ms`
  );
});

async function main() {
  // Define allowed origins based on environment
  const allowedOrigin = process.env.CLIENT_PROD_URL;
  const allowedOrigins = [
    allowedOrigin, // e.g. https://bestforia.com
    allowedOrigin?.replace("https://", "https://www."), // e.g. https://www.bestforia.com
  ].filter(Boolean);

  app.log.info({
    msg: "CORS configuration v2",
    allowedOrigins,
    environment: process.env.NODE_ENV,
    defaultOrigin: allowedOrigin,
  });

  // Register CORS plugin
  app.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Register JWT plugin with the secret from environment variables
  app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET as string, // Use the JWT secret from your environment variable
  });

  // Determine if API docs should be enabled
  // Default to true if not specified (convenient for development)
  const enableApiDocs = process.env.ENABLE_API_DOCS !== "false";

  // Check if API docs are enabled in production (security concern)
  if (process.env.NODE_ENV === "production" && enableApiDocs) {
    app.log.warn(
      "⚠️ API documentation is enabled in production environment! This may expose sensitive endpoints. Consider setting ENABLE_API_DOCS=false for security."
    );
  }

  // Setup Swagger documentation if enabled
  if (enableApiDocs) {
    await setupDocs(app);
    app.log.info("📚 API documentation enabled and available at /docs");
  } else {
    app.log.info("📚 API documentation is disabled");
  }

  // Register routes
  await setupRoutes(app);

  // Start the server
  try {
    await app.listen({ port: 3000 });
    console.log("Server running at http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
