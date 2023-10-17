import React, { useState, useMemo } from "react";
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
    },
  });

  const onSubmit: SubmitHandler<RegisterForm> = (data) => {
    storeUserRegistrationInformation(data);
    router.push("/registrationSuccess");
  };
  //const onSubmit: SubmitHandler<RegisterForm> = data => console.log(data);

  const watchers = watch(["major"]); // Watching major  input fields in case user selects "other" option

  const countryOptions = useMemo(() => countryList().getData(), []);

  const [otherMajor, setOtherMajor] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState();
  const [textCount, setTextCount] = useState(0);

  register("major", {
    onChange: (e) => otherMajorInput(e.target.value),
  });

  function otherMajorInput(value: string) {
    if (value == "other") {
      setOtherMajor(true);
    } else {
      setOtherMajor(false);
      resetField("inputMajor");
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
            <div className="container mx-auto flex flex-column justify-between">
              <div className="min-w-0 w-1/4 shrink grow-0"></div>
              <div className="inputs w-1/2 min-w-[24rem] max-w-2xl p-6 mx-auto shrink-0 grow">
                <form className="mt-3 pt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="personal w-full pt-2">
                      <h2 className="text-2xl text-gray-900 text-center mb-5">Registration Info:</h2>
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
                                <input type="checkbox" value="" id="grid-text-1" className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                    let span = document.getElementById("grid-text-1-span");
                                    if (span === null) return;
                                    let text = span.innerText;
                                    span.innerText = (text.includes("No")) ? "Yes" : "No";
                                  }}
                                  checked={value}/>
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                <span className="ml-3 text-sm" id="grid-text-1-span">No</span>
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
                        <label
                          className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2"
                          htmlFor="grid-text-1"
                        >
                          Dietary Restrictions
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("dietaryRestrictions")}
                          id="grid-text-1"
                          type="text"
                          maxLength={100}
                          placeholder="Enter dietary restrictions"
                        />
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                          T-Shirt Size
                        </label>
                        <div className="flex-shrink w-full inline-block relative">
                          <select
                            className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                            {...register("shirtSize", {
                              required: "PLease select a shirt size",
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
                                <input type="checkbox" value="" id="grid-text-1" className="sr-only peer"
                                  onChange={() => {onChange(!value)}}
                                  checked={value}/>
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
                                <input type="checkbox" value="" id="grid-text-1" className="sr-only peer"
                                  onChange={() => {onChange(!value)}}
                                  checked={value}/>
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
                                <input type="checkbox" value="" id="grid-text-1" className="sr-only peer"
                                  onChange={() => {onChange(!value)}}
                                  checked={value}/>
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
                          className="border rounded w-full border-gray-100 bg-gray-100 hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-colors"
                          type="submit"
                        >
                          Register!
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="min-w-0 w-1/4 shrink grow-0">
                {/*<Circle height="h-[285px]" width="w-[295px]"></Circle>*/}
              </div>
            </div>
          </div>
        </Card>
      </ProtectedRoute>
    </div>
  );
}
