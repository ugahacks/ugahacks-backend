import {
  Genders,
  StudentYears,
  Majors,
  ShirtSizes,
  LevelsOfStudy,
  DietaryRestrictions,
} from "../enums/registerEnums";
import { ReactSelectObject } from "../interfaces/react-select";

export interface RegisterForm {
  firstName: string;
  lastName: string;
  gender: Genders;
  race: string;
  phoneNumber: string; // Worry about validation with '-'
  countryResidence: ReactSelectObject;
  year: StudentYears;
  major: Majors;
  inputMajor: string;
  minor: string;
  school: ReactSelectObject;
  inputSchool: string;
  email: string; // .edu
  participated: boolean; // Have you ever participated in a hackathon? Yes or No
  elCreditInterest: boolean; // Hackers who are interested in ELCredit
  hopeToSee: string; // What do you hope to see from UGA Hacks 8?
  dietaryRestrictions: DietaryRestrictions; // Vegetarian, etc : Should give options
  inputDietaryRestrictions: string;
  shirtSize: ShirtSizes; // S, M, L, XL, XXL, should be enum
  codeOfConduct: boolean; // MLH Code of COnduct: I have agreed , YES OR NO
  eventLogisticsInfo: boolean; // Yes
  mlhCommunication: boolean;
  resume: FileList;
  resumeLink: string;
  age: number;
  levelsOfStudy: LevelsOfStudy;
  // excitement: Number; // Scale of 1- 100
}
