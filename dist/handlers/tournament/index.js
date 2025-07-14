import { registerTournament } from "./RegisterTournament";
import { createTournament } from "./createTournament";
import { getAllTournament } from "./getAllTournament";
import { getTournamentById } from "./getTournamentById";
export const tournament = {
    create: createTournament,
    getAll: getAllTournament,
    getById: getTournamentById,
    register: registerTournament,
};
