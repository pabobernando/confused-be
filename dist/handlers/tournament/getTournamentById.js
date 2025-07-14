import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const getTournamentByIdSchema = {
    tags: ["Tournament"],
    summary: "Get Tournament by ID",
    description: "Retrieves a single tournament by its unique ID.",
    params: {
        type: "object",
        required: ["id"],
        properties: {
            id: {
                type: "string",
                format: "uuid",
                example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                id: { type: "string" },
                title: { type: "string" },
                poster: { type: "string" },
                location: { type: "string" },
                description: { type: "string" },
                date: { type: "string", format: "date-time" },
                price: { type: "string" },
                participants: {
                    type: "array",
                    items: {
                        // <--- THIS IS THE CRITICAL PART FOR ARRAYS
                        type: "object", // <--- ENSURE THIS IS PRESENT AND CORRECT
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            logo: { type: "string" },
                            contact: { type: "string" },
                            player: {
                                type: "array",
                                items: { type: "string" }, // Player is a string array
                            },
                            payment_status: { type: "string" },
                        },
                        // required: ["id", "name", "logo", "contact", "player", "payment_status"] // Consider adding this
                    },
                },
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
                message: { type: "string", example: "Failed to retrieve tournament." },
            },
        },
    },
};
export async function getTournamentByIdHandler(request, reply) {
    try {
        const { id } = request.params;
        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                tournamentParticipants: {
                    select: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                contact: true,
                                player: true,
                                payment_status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!tournament) {
            return reply.code(404).send({
                statusCode: 404,
                error: "Not Found",
                message: `Tournament with ID ${id} not found.`,
            });
        }
        const responseTournament = {
            ...tournament,
            participants: tournament.tournamentParticipants.map((tp) => tp.team),
        };
        delete responseTournament.tournamentParticipants;
        reply.code(200).send(responseTournament);
    }
    catch (error) {
        request.log.error(`Error getting tournament by ID ${request.id}:`, error);
        reply.code(500).send({
            statusCode: 500,
            error: "Internal Server Error",
            message: "Failed to retrieve tournament.",
        });
    }
}
export const getTournamentById = {
    handler: getTournamentByIdHandler,
    schema: getTournamentByIdSchema,
};
