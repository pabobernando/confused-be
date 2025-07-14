import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
const prisma = new PrismaClient();
const loginSchema = {
    tags: ["Admin"],
    summary: "Admin Login",
    description: "Authenticate admin user and return JWT token",
    body: {
        type: "object",
        required: ["username", "password"],
        properties: {
            username: {
                type: "string",
                description: "Admin username",
                example: "admin",
            },
            password: {
                type: "string",
                description: "Admin password",
                example: "password123",
            },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Login successful" },
                token: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                admin: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "uuid-string" },
                        username: { type: "string", example: "admin" },
                    },
                },
            },
        },
        401: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 401 },
                error: { type: "string", example: "Unauthorized" },
                message: { type: "string", example: "Invalid username or password" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 500 },
                error: { type: "string", example: "Internal Server Error" },
                message: {
                    type: "string",
                    example: "Login failed due to server error",
                },
            },
        },
    },
};
export async function loginHandler(request, reply) {
    try {
        const { username, password } = request.body;
        // Find admin by username
        const admin = await prisma.admin.findUnique({
            where: { username },
        });
        if (!admin) {
            request.log.warn({ username }, "Login attempt with non-existent username");
            return reply.code(401).send({
                statusCode: 401,
                error: "Unauthorized",
                message: "Invalid username or password",
            });
        }
        // Verify password using argon2
        const isValidPassword = await argon2.verify(admin.password, password);
        if (!isValidPassword) {
            request.log.warn({ username, adminId: admin.id }, "Login attempt with invalid password");
            return reply.code(401).send({
                statusCode: 401,
                error: "Unauthorized",
                message: "Invalid username or password",
            });
        }
        // Generate JWT token
        const token = request.server.jwt.sign({
            id: admin.id,
            username: admin.username,
            type: "admin",
        }, {
            expiresIn: "24h",
        });
        request.log.info({ adminId: admin.id, username }, "Admin login successful");
        return reply.code(200).send({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                username: admin.username,
            },
        });
    }
    catch (error) {
        request.log.error("Login error:", error);
        return reply.code(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: "Login failed due to server error",
        });
    }
}
export const login = {
    handler: loginHandler,
    schema: loginSchema,
};
