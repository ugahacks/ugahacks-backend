export interface eSportsForm {
  firstName: string;
  lastName: string;
  gamerTag: string;
  phoneNumber: string;
  selectedGame: string; // Selected game for the tournament
  skillLevelDescription: string; // Selected skill level for the tournament
  setUpDescription: string; // Selected setup for the tournament
  keyBindingsDescription: string; // Selected key bindings for the tournament
  tardyAgreement: boolean; // Tardy agreement for the tournament
}
