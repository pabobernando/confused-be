import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const registerTournamentSchema = {
    tags: ["Tournament"],
    summary: "Register for Tournament (Public)",
    description: "Register team for tournament with specified quantity (creates multiple participant entries)",
    body: {
        type: "object",
        required: ["tournamentId", "teamName", "contact", "players", "quantity"],
        properties: {
            tournamentId: { type: "string", example: "uuid-string" },
            teamName: { type: "string", minLength: 2, example: "Team Alpha" },
            contact: { type: "string", example: "team@example.com" },
            logo: { type: "string", example: "https://example.com/logo.jpg" },
            players: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
                example: ["Player1", "Player2", "Player3"],
            },
            quantity: {
                type: "number",
                minimum: 1,
                maximum: 10, // Set reasonable limit
                example: 2,
                description: "Number of participant entries to create for this team",
            },
        },
    },
    response: {
        201: {
            type: "object",
            properties: {
                message: { type: "string", example: "Team registered successfully" },
                team: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        contact: { type: "string" },
                        payment_quantity: { type: "number" },
                        isExisting: { type: "boolean" },
                    },
                },
                registrations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            tournamentId: { type: "string" },
                            teamId: { type: "string" },
                            registeredAt: { type: "string", format: "date-time" },
                        },
                    },
                },
                totalRegistrations: { type: "number" },
            },
        },
        400: {
            type: "object",
            properties: {
                statusCode: { type: "number", example: 400 },
                error: { type: "string", example: "Bad Request" },
                message: {
                    type: "string",
                    example: "Tournament not found or invalid quantity",
                },
            },
        },
    },
};
export async function registerTournamentHandler(request, reply) {
    try {
        const { tournamentId, teamName, contact, logo, players, quantity } = request.body;
        // Validate quantity
        if (quantity < 1 || quantity > 10) {
            return reply.code(400).send({
                statusCode: 400,
                error: "Bad Request",
                message: "Quantity must be between 1 and 10",
            });
        }
        // Check if tournament exists
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
        });
        if (!tournament) {
            return reply.code(400).send({
                statusCode: 400,
                error: "Bad Request",
                message: "Tournament not found",
            });
        }
        // Check if team already exists by name
        let team = await prisma.team.findUnique({
            where: { name: teamName },
        });
        let isExistingTeam = false;
        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // If team doesn't exist, create it
            if (!team) {
                team = await tx.team.create({
                    data: {
                        name: teamName,
                        contact,
                        logo: logo || "",
                        player: players,
                        payment_status: "PENDING",
                        payment_quantity: quantity, // Set the payment quantity
                    },
                });
                isExistingTeam = false;
            }
            else {
                // Team exists, update it and increment payment quantity
                isExistingTeam = true;
                team = await tx.team.update({
                    where: { id: team.id },
                    data: {
                        contact,
                        logo: logo || team.logo,
                        player: players,
                        payment_quantity: team.payment_quantity + quantity, // Add to existing quantity
                    },
                });
            }
            // Create multiple registration entries based on quantity
            const registrations = [];
            for (let i = 0; i < quantity; i++) {
                const registration = await tx.tournamentParticipant.create({
                    data: {
                        tournamentId,
                        teamId: team.id,
                    },
                });
                registrations.push(registration);
            }
            return { team, registrations, isExistingTeam };
        });
        reply.code(201).send({
            message: isExistingTeam
                ? `Existing team registered ${quantity} more time(s) for tournament`
                : `New team created and registered ${quantity} time(s) successfully`,
            team: {
                id: result.team.id,
                name: result.team.name,
                contact: result.team.contact,
                payment_quantity: result.team.payment_quantity,
                isExisting: result.isExistingTeam,
            },
            registrations: result.registrations.map((reg) => ({
                id: reg.id,
                tournamentId: reg.tournamentId,
                teamId: reg.teamId,
                registeredAt: reg.registeredAt,
            })),
            totalRegistrations: result.registrations.length,
        });
    }
    catch (error) {
        request.log.error("Error registering for tournament:", error);
        reply.code(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: "Registration failed",
        });
    }
}
export const registerTournament = {
    handler: registerTournamentHandler,
    schema: registerTournamentSchema,
};
