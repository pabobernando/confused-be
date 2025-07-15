import { registerTournament } from "./RegisterTournament";
import { createTournament } from "./createTournament";
import { deleteTournament } from "./deleteTournament";
import { getAllTournament } from "./getAllTournament";
import { getTournamentById } from "./getTournamentById";
import { updateTournament } from "./updateTournament";

export const tournament = {
  create: createTournament,
  getAll: getAllTournament,
  getById: getTournamentById,
  register: registerTournament,
  update: updateTournament,
  delete: deleteTournament,
};
