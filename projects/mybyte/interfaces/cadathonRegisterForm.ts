import {
  DietaryRestrictions,
  Genders,
  Majors,
  ShirtSizes,
  StudentYears,
} from "../enums/registerEnums";


export interface CadathonRegisterForm {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string; // .edu or whitelisted domains
  gender: Genders;
  phoneNumber: string;
  year: StudentYears;
  major: Majors;
  inputMajor: string;
  minor: string;
  participated: boolean; // First time at a Cadathon? Yes or No
  hopeToSee: string;
  dietaryRestrictions: DietaryRestrictions;
  inputDietaryRestrictions: string;
  shirtSize: ShirtSizes;
  resume?: FileList;
  resumeLink?: string;
}