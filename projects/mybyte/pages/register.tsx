import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import countryList from "react-select-country-list";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";
import { useRouter } from "next/router";

import { RegisterForm } from "../interfaces/registerForm";

import {
  Genders,
  StudentYears,
  Majors,
  ShirtSizes,
  LevelsOfStudy,
  DietaryRestrictions,
} from "../enums/registerEnums";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "react-phone-number-input/style.css";
import ProtectedRoute from "../components/ProtectedRoute";
import { Card } from "@material-tailwind/react";
import { Circle } from "../components/circle";

export default function Register() {
  const router = useRouter();
  const { storeUserRegistrationInformation, getRegisteredEvents, userInfo } =
    useAuth();
  const {
    control,
    resetField,
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      phoneNumber: "",
      inputMajor: "",
      inputSchool: "",
      inputDietaryRestrictions: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterForm> = (data) => {
    storeUserRegistrationInformation(data);
    router.push("/registrationSuccess");
  };
  //const onSubmit: SubmitHandler<RegisterForm> = data => console.log(data);

  const watchers = watch(["major", "school", "dietaryRestrictions"]); // Watching major  input fields in case user selects "other" option

  const countryOptions = useMemo(() => countryList().getData(), []);
  // ref: http://stackoverflow.com/a/1293163/2343
  // This will parse a delimited string into an array of
  // arrays. The default delimiter is the comma, but this
  // can be overriden in the second argument.
  function CSVToArray(strData: string, strDelimiter: string) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || ",";

    // Create a regular expression to parse the CSV values.
    let objPattern = new RegExp(
      // Delimiters.
      "(\\" +
        strDelimiter +
        "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        // Standard fields.
        '([^"\\' +
        strDelimiter +
        "\\r\\n]*))",
      "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    let arrData: string[][] = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
      // Get the delimiter that was found.
      let strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);
      }

      let strMatchedValue;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
      } else {
        // We found a non-quoted value.
        strMatchedValue = arrMatches[3];
      }

      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
  }
  let schoolOptions: { value: string; label: string }[] = [];
  fetch("/schools.csv")
    .then((resp) => resp.text())
    .then((text) => {
      CSVToArray(text, ",").forEach((row, index) => {
        if (index != 0) {
          schoolOptions.push({ value: row[0], label: row[0] });
        }
      });
    });

  schoolOptions.push({ value: "other", label: "Other" });

  const [otherMajor, setOtherMajor] = useState(false);
  const [otherSchool, setOtherSchool] = useState(false);
  const [otherDietaryRestrictions, setOtherDietaryRestrictions] =
    useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState();
  const [textCount, setTextCount] = useState(0);

  register("major", {
    onChange: (e) => otherMajorInput(e.target.value),
  });

  register("school", {
    onChange: (e) => otherSchoolInput(e.target.value.value),
  });

  register("dietaryRestrictions", {
    onChange: (e) => otherDietaryRestrictionsInput(e.target.value),
  });

  function otherMajorInput(value: string) {
    if (value == "other") {
      setOtherMajor(true);
    } else {
      setOtherMajor(false);
      resetField("inputMajor");
    }
  }

  function otherSchoolInput(value: string) {
    if (value == "other") {
      setOtherSchool(true);
    } else {
      setOtherSchool(false);
      resetField("inputSchool");
    }
  }

  function otherDietaryRestrictionsInput(value: string) {
    if (value == "other") {
      console.log(value);
      setOtherDietaryRestrictions(true);
    } else {
      console.log(value);
      setOtherDietaryRestrictions(false);
      resetField("inputDietaryRestrictions");
    }
  }

  function validateFileInput(value: FileList) {
    const fileRegex = /^.*\.(doc|docx|pdf)$/i;

    return fileRegex.test(value[0]?.name);
  }

  //   const storage = getStorage();
  //   const file = data.resume[0]
  //   const storageRef = ref(storage, 'resume/' + user.uid + '/' + file.name)

  //   const uploadTask = uploadBytesResumable(storageRef, file)

  return (
    <div className="">
      <ProtectedRoute className="h-screen min-h-full min-w-full">
        <Card className="bg-opacity-0">
          <div className="min-h-screen pt-2 font-inter my-8">
            <div className="mx-auto flex flex-column justify-between">
              <div className="min-w-0 w-1/4 shrink grow-0 collapse md:visible">
                <div className="flex flex-col flex-wrap h-full justify-center">
                  <div className="relative min-w-0 w-full h-[600px] shrink grow-0 ml-auto">
                    <Image
                      src="/two_circles_left.png"
                      alt="two circles"
                      fill
                      className="object-contain"
                    ></Image>
                  </div>
                </div>
              </div>
              <div className="inputs w-1/2 min-w-[24rem] max-w-2xl p-6 mx-auto shrink-0 grow">
                <form className="mt-3 pt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="personal w-full pt-2">
                      <h2 className="text-2xl text-gray-900 text-center mb-5">
                        Registration Info:
                      </h2>
                      <div className="flex items-center justify-between mt-4">
                        <div className="w-full md:w-1/2 px-3 mb-6">
                          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            first name<span className="text-red-600">*</span>
                          </label>
                          <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                            {...register("firstName", {
                              required: "Please enter your first name",
                              pattern: {
                                value: /^[a-z ,.'-]+$/i,
                                message: "Contains invalid characters",
                              },
                            })}
                            type="text"
                            maxLength={50}
                          />
                          {errors.firstName ? (
                            <>
                              {errors.firstName.type === "required" && (
                                <p className="text-red-500">
                                  {errors.firstName.message}
                                </p>
                              )}
                              {errors.firstName.type === "pattern" && (
                                <p className="text-red-500">
                                  {errors.firstName.message}
                                </p>
                              )}
                            </>
                          ) : null}
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-6">
                          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            last name<span className="text-red-600">*</span>
                          </label>
                          <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                            {...register("lastName", {
                              required: "Please enter your last name",
                              pattern: {
                                value: /^[a-z ,.'-]+$/i,
                                message: "Contains invalid characters",
                              },
                            })}
                            type="text"
                            maxLength={50}
                          />
                          {errors.lastName ? (
                            <>
                              {errors.lastName.type === "required" && (
                                <p className="text-red-500">
                                  {errors.lastName.message}
                                </p>
                              )}
                              {errors.lastName.type === "pattern" && (
                                <p className="text-red-500">
                                  {errors.lastName.message}
                                </p>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Gender
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("gender", {
                              required: "Select gender",
                            })}
                          >
                            <option value="">Select your gender</option>
                            {Object.keys(Genders).map((key) => (
                              <option key={key} value={key}>
                                {Genders[key as keyof typeof Genders]}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.gender && (
                            <p className="text-red-400">
                              {errors.gender.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Age
                        </label>
                        <Controller
                          name="age"
                          rules={{
                            required: "Please provide an age",
                          }}
                          render={({ field: { name, onChange, value } }) => (
                            <input
                              type="number"
                              placeholder={name}
                              className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                              value={value}
                              onChange={onChange}
                              {...register}
                            />
                          )}
                          control={control}
                        />
                        {errors.age && (
                          <p className="text-red-400">{errors.age.message}</p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Country of Residence
                        </label>
                        <Controller
                          name="countryResidence"
                          rules={{
                            required: "Please select a country of residence",
                          }}
                          render={({ field: { name, onChange, value } }) => (
                            <Select
                              className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                              options={countryOptions}
                              value={value}
                              onChange={onChange}
                              name={name}
                            />
                          )}
                          control={control}
                        />
                        {errors.countryResidence && (
                          <p className="text-red-400">
                            {errors.countryResidence.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Phone Number
                        </label>
                        <div className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500">
                          <Controller
                            name="phoneNumber"
                            control={control}
                            rules={{
                              validate: (value) =>
                                isValidPhoneNumber(value) ||
                                "Invalid phone number",
                              required: "Please enter your phone number",
                            }}
                            render={({ field: { onChange, value } }) => (
                              <PhoneInput
                                value={value}
                                onChange={onChange}
                                defaultCountry="US"
                                id="phoneNumber"
                              />
                            )}
                          />
                          {errors.phoneNumber ? (
                            <>
                              {errors.phoneNumber.type === "required" && (
                                <p className="text-red-500">
                                  {errors.phoneNumber.message}
                                </p>
                              )}
                              {errors.phoneNumber.type === "validate" && (
                                <p className="text-red-500">
                                  {errors.phoneNumber.message}
                                </p>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Level of Study
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("levelsOfStudy", {
                              required: "Select level of study",
                            })}
                          >
                            <option value="">Select your level of study</option>
                            {Object.keys(LevelsOfStudy).map((key) => (
                              <option key={key} value={key}>
                                {
                                  LevelsOfStudy[
                                    key as keyof typeof LevelsOfStudy
                                  ]
                                }
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.levelsOfStudy && (
                            <p className="text-red-400">
                              {errors.levelsOfStudy.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          School
                        </label>
                        <Controller
                          name="school"
                          rules={{ required: "Please select your school" }}
                          render={({ field: { name, onChange, value } }) => (
                            <Select
                              className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                              options={schoolOptions}
                              value={value}
                              onChange={onChange}
                              name={name}
                            />
                          )}
                          control={control}
                        />
                        {errors.school && (
                          <p className="text-red-400">
                            {errors.school.message}
                          </p>
                        )}
                        {otherSchool ? (
                          <input
                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                            {...register("inputSchool", {
                              required: "Please enter your school",
                              pattern: {
                                value: /^[a-z ,.'-]+$/i,
                                message: "Contains invalid characters",
                              },
                            })}
                            type="text"
                            maxLength={100}
                            placeholder="Type your school here"
                          />
                        ) : null}
                        {errors.inputSchool ? (
                          <>
                            {errors.inputSchool.type === "required" && (
                              <p className="text-red-500">
                                {errors.inputSchool.message}
                              </p>
                            )}
                            {errors.inputSchool.type === "pattern" && (
                              <p className="text-red-500">
                                {errors.inputSchool.message}
                              </p>
                            )}
                          </>
                        ) : null}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Year
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("year", {
                              required: "Please select a year",
                            })}
                          >
                            <option value="">Select your year</option>
                            {Object.keys(StudentYears).map((key) => (
                              <option key={key} value={key}>
                                {StudentYears[key as keyof typeof StudentYears]}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.year && (
                            <p className="text-red-400">
                              {errors.year.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Resume
                        </label>
                        <p>
                          NOTE: Resume will be sent to our hackathon sponsors;
                          it WILL NOT be used for hackathon acceptance decisions
                        </p>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("resume", {
                            validate: (value) =>
                              validateFileInput(value) ||
                              "Please submit your resume in .pdf or .doc format",
                          })}
                          type="file"
                        />
                        {errors.resume && (
                          <p className="text-red-400">
                            {errors.resume.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Current Major
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("major", {
                              required: "Please select a major",
                            })}
                          >
                            <option value="">Select your major</option>
                            {Object.keys(Majors).map((key) => (
                              <option key={key} value={key}>
                                {Majors[key as keyof typeof Majors]}
                              </option>
                            ))}
                          </select>
                          {otherMajor ? (
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                              {...register("inputMajor", {
                                required: "Please enter your major",
                                pattern: {
                                  value: /^[a-z ,.'-]+$/i,
                                  message: "Contains invalid characters",
                                },
                              })}
                              type="text"
                              maxLength={100}
                              placeholder="Type your major here"
                            />
                          ) : null}
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.major && (
                            <p className="text-red-400">
                              {errors.major.message}
                            </p>
                          )}
                          {errors.inputMajor ? (
                            <>
                              {errors.inputMajor.type === "required" && (
                                <p className="text-red-500">
                                  {errors.inputMajor.message}
                                </p>
                              )}
                              {errors.inputMajor.type === "pattern" && (
                                <p className="text-red-500">
                                  {errors.inputMajor.message}
                                </p>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Minor
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("minor", {
                            pattern: {
                              value: /^[a-z ,.'-]+$/i,
                              message: "Contains invalid characters",
                            },
                          })}
                          type="text"
                          maxLength={100}
                          placeholder="Type your minor here"
                        />
                        {errors.minor && (
                          <p className="text-red-400">{errors.minor.message}</p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <Controller
                          control={control}
                          name="participated"
                          rules={{
                            validate: (value) => {
                              if (value == null) {
                                return "Please select an option";
                              }

                              return true;
                            },
                          }}
                          render={({ field: { onChange, value } }) => (
                            <>
                              <label
                                className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2"
                                htmlFor="grid-text-1"
                              >
                                First Time at a Hackathon?
                              </label>
                              <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value=""
                                  id="grid-text-1"
                                  className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                    let span =
                                      document.getElementById(
                                        "grid-text-1-span"
                                      );
                                    if (span === null) return;
                                    let text = span.innerText;
                                    span.innerText = text.includes("No")
                                      ? "Yes"
                                      : "No";
                                  }}
                                  checked={value}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                <span
                                  className="ml-3 text-sm"
                                  id="grid-text-1-span"
                                >
                                  No
                                </span>
                              </label>
                            </>
                          )}
                        />
                        {errors.participated && (
                          <p className="text-red-400">
                            {errors.participated.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          What do you expect out of UGA Hacks?
                        </label>
                        <textarea
                          className="bg-gray-100 rounded-md border leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                          {...register("hopeToSee", {
                            required: "Please enter a response",
                          })}
                          maxLength={250}
                          onChange={(e) => setTextCount(e.target.value.length)}
                        ></textarea>
                        <p>{textCount}/250</p>
                        {errors.hopeToSee && (
                          <p className="text-red-400">
                            {errors.hopeToSee.message}
                          </p>
                        )}
                      </div>

                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          Dietary Restrictions?
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("dietaryRestrictions", {
                              required:
                                "Please select your dietary restrictions",
                            })}
                          >
                            <option value="">
                              Select your dietary restrictions
                            </option>
                            {Object.keys(DietaryRestrictions).map((key) => (
                              <option key={key} value={key}>
                                {
                                  DietaryRestrictions[
                                    key as keyof typeof DietaryRestrictions
                                  ]
                                }
                              </option>
                            ))}
                          </select>
                          {otherDietaryRestrictions ? (
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                              {...register("inputDietaryRestrictions", {
                                required:
                                  "Please select your dietary restrictions",
                                pattern: {
                                  value: /^[a-z ,.'-]+$/i,
                                  message: "Contains invalid characters",
                                },
                              })}
                              type="text"
                              maxLength={100}
                              placeholder="Type your dietary restrictions here"
                            />
                          ) : null}
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.dietaryRestrictions && (
                            <p className="text-red-400">
                              {errors.dietaryRestrictions.message}
                            </p>
                          )}
                          {errors.inputDietaryRestrictions ? (
                            <>
                              {errors.inputDietaryRestrictions.type ===
                                "required" && (
                                <p className="text-red-500">
                                  {errors.inputDietaryRestrictions.message}
                                </p>
                              )}
                              {errors.inputDietaryRestrictions.type ===
                                "pattern" && (
                                <p className="text-red-500">
                                  {errors.inputDietaryRestrictions.message}
                                </p>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          T-Shirt Size
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("shirtSize", {
                              required: "Please select a shirt size",
                            })}
                          >
                            <option value="">Select your shirt size</option>
                            {Object.keys(ShirtSizes).map((key) => (
                              <option key={key} value={key}>
                                {ShirtSizes[key as keyof typeof ShirtSizes]}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute top-0 mt-3  right-0 flex items-center px-2 text-gray-600">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                          {errors.shirtSize && (
                            <p className="text-red-400">
                              {errors.shirtSize.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <Controller
                          control={control}
                          name="codeOfConduct"
                          rules={{
                            required:
                              "Please indicate you have read and agreed to the MLH code of conduct",
                          }}
                          render={({ field: { onChange, value } }) => (
                            <>
                              <label
                                className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-text-1"
                              >
                                <em>MLH Code of Conduct: </em>&quot;I have read
                                and agree to the{" "}
                                <Link
                                  href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
                                  target="_blank"
                                  className="text-blue-600"
                                >
                                  MLH Code of Conduct
                                </Link>
                                .&quot;
                              </label>
                              <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value=""
                                  id="grid-text-1"
                                  className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                  }}
                                  checked={value}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                              </label>
                            </>
                          )}
                        />
                        {errors.codeOfConduct && (
                          <p className="text-red-400">
                            {errors.codeOfConduct.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <Controller
                          control={control}
                          name="eventLogisticsInfo"
                          rules={{
                            required:
                              "Please indicate you have read and agree to the MLH Privacy policy",
                          }}
                          render={({ field: { onChange, value } }) => (
                            <>
                              <label
                                className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-text-1"
                              >
                                <em>Event Logistics Information: </em>“I
                                authorize you to share my
                                application/registration information with Major
                                League Hacking for event administration,
                                ranking, and MLH administration in-line with the{" "}
                                <Link
                                  href="https://mlh.io/privacy"
                                  target="_blank"
                                  className="text-blue-600"
                                >
                                  MLH Privacy Policy
                                </Link>
                                . I further agree to the terms of both the{" "}
                                <Link
                                  href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                                  target="_blank"
                                  className="text-blue-600"
                                >
                                  MLH Contest Terms and Conditions
                                </Link>{" "}
                                and the{" "}
                                <Link
                                  href="https://mlh.io/privacy"
                                  target="_blank"
                                  className="text-blue-600"
                                >
                                  MLH Privacy Policy
                                </Link>
                                .”
                              </label>
                              <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value=""
                                  id="grid-text-1"
                                  className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                  }}
                                  checked={value}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                              </label>
                            </>
                          )}
                        />
                        {errors.eventLogisticsInfo && (
                          <p className="text-red-400">
                            {errors.eventLogisticsInfo.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <Controller
                          control={control}
                          name="mlhCommunication"
                          rules={{
                            required: "You must select Yes before proceeding",
                          }}
                          render={({ field: { onChange, value } }) => (
                            <>
                              <label
                                className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-text-1"
                              >
                                <em>Communication from MLH: </em>“I authorize
                                MLH to send me an email where I can further opt
                                into the MLH Hacker, Events, or Organizer
                                Newsletters and other communications from
                                MLH.&quot;
                              </label>
                              <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value=""
                                  id="grid-text-1"
                                  className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                  }}
                                  checked={value}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                              </label>
                            </>
                          )}
                        />
                        {errors.mlhCommunication && (
                          <p className="text-red-400">
                            {errors.mlhCommunication.message}
                          </p>
                        )}
                      </div>
                      <div className="">
                        <button
                          className="border rounded w-full border-gray-100 bg-gray-100 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors p-2"
                          type="submit"
                        >
                          Register!
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="min-w-0 w-1/4 shrink grow-0 collapse md:visible">
                <div className="flex flex-col flex-wrap h-full justify-between">
                  <div className="relative min-w-0 w-full h-[600px] shrink grow-0 ml-auto">
                    <Image
                      src="/three_circles.png"
                      alt="three circles"
                      fill
                      className="object-contain"
                    ></Image>
                  </div>
                  <div className="relative min-w-0 w-full h-[600px] shrink grow-0 ml-auto">
                    <Image
                      src="/two_circles_right.png"
                      alt="two circles"
                      fill
                      className="object-contain"
                    ></Image>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </ProtectedRoute>
    </div>
  );
}
