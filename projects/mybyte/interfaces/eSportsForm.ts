export interface eSportsForm {
  firstName: string;
  lastName: string;
  gamerTag: string;
  phoneNumber: string;
  selectedGameOne: string; // Selected game for the tournament (First Choice)
  selectedGameTwo: string; // Selected game for the tournament (Second Choice)
  skillLevelDescription: string; // Selected skill level for the tournament
  setUpDescription: string; // Selected setup for the tournament
  keyBindingsDescription: string; // Selected key bindings for the tournament
  tardyAgreement: boolean; // Tardy agreement for the tournament
}
