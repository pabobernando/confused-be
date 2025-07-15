import { getAllTeam } from "./getAllTeam";
import { getTeamById } from "./getTeamById";
import { updatePaymentTeam } from "./updatePaymentTeam";
import { updateTeam } from "./updateTeam";

export const team = {
  getAll: getAllTeam,
  getById: getTeamById,
  update: updateTeam,
  updatePayment: updatePaymentTeam,
};
