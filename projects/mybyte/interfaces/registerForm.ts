import {
  DietaryRestrictions,
  Genders,
  Majors,
  ShirtSizes,
  StudentYears,
} from "../enums/registerEnums";

export interface RegisterForm {
  firstName: string;
  lastName: string;
  preferredName: string;
  gender: Genders;
  phoneNumber: string; // Worry about validation with '-'
  year: StudentYears;
  major: Majors;
  inputMajor: string;
  minor: string;
  email: string; // .edu or whitelisted domains
  participated: boolean; // First time participating in a Cadathon?
  hopeToSee: string; // What do you hope to see from UGA Cadathon?
  dietaryRestrictions: DietaryRestrictions; // Vegetarian, etc : Should give options
  inputDietaryRestrictions: string;
  shirtSize: ShirtSizes; // S, M, L, XL, XXL, should be enum
  codeOfConduct: boolean; // MLH Code of COnduct: I have agreed , YES OR NO
  eventLogisticsInfo: boolean; // Yes
  mlhCommunication: boolean;
}
