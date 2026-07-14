import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import Typewriter from "typewriter-effect";
import { useAuth } from "../context/AuthContext";

import { RegisterForm } from "../interfaces/registerForm";

import {
  DietaryRestrictions,
  Genders,
  Majors,
  ShirtSizes,
  StudentYears,
} from "../enums/registerEnums";

import { Card } from "@material-tailwind/react";
import "react-phone-number-input/style.css";
import Circle from "../components/Circle";

export default function CadathonRegister() {
  const router = useRouter();
  const {
    storeUserRegistrationInformation,
    triggerRegistrationEmail,
  } = useAuth();

  const {
    control,
    resetField,
    watch,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      phoneNumber: "",
      inputMajor: "",
      inputDietaryRestrictions: "",
      participated: false,
    },
  });

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    try {
      await storeUserRegistrationInformation(data);
      await triggerRegistrationEmail();
      router.push("/registrationSuccess");
    } catch (error) {
      console.error("Registration failed:", error);
      // The button will automatically re-enable when isSubmitting becomes false
    }
  };
  //const onSubmit: SubmitHandler<RegisterForm> = data => console.log(data);

  // ref: http://stackoverflow.com/a/1293163/2343
  // This will parse a delimited string into an array of
  // arrays. The default delimiter is the comma, but this
  // can be overriden in the second argument.
  const [otherMajor, setOtherMajor] = useState(false);
  const [otherDietaryRestrictions, setOtherDietaryRestrictions] =
    useState(false);
  const [textCount, setTextCount] = useState(0);

  register("major", {
    onChange: (e) => otherMajorInput(e.target.value),
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

  function otherDietaryRestrictionsInput(value: string) {
    if (value == "other") {
      setOtherDietaryRestrictions(true);
    } else {
      setOtherDietaryRestrictions(false);
      resetField("inputDietaryRestrictions");
    }
  }

  const errorStyles = "text-red-500 font-mono text-xs m-1";

  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      // Adjust the threshold as needed
      const isSmallScreen = window.innerWidth <= 825; // Adjust the width as needed

      // Update the state based on the window width
      setShouldRender(!isSmallScreen);
    };

    // Attach the event listener
    window.addEventListener("resize", handleResize);

    // Initial check on mount
    handleResize();

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-screen overflow-x-hidden">
      <div className="flex overflow-hidden">
        {shouldRender ? (
          <div className="moving-gradient-register w-[50vw] flex-1 pl-8 pt-12 font-mono overflow-hidden text-white">
            <div className="pl-12 pt-10">
              <h1 className="text-6xl mb-8 w-4/5 leading-[80px]">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Register for ")
                      .typeString("Cadathon")
                      .start();
                  }}
                />
              </h1>
              <div className="pl-1 text-md w-4/5">
                <p className="pb-3">
                  We&apos;re excited that you are participating in the Cadathon!
                  We would love to see you at the event!
                </p>
                <p className="text-md">
                  If you have any questions, please send us an email at{" "}
                  <Link
                    className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity duration-200"
                    href="mailto:hello@ugahacks.com"
                  >
                    hello@ugahacks.com
                  </Link>
                  !
                </p>
              </div>

              <Circle className="fixed bottom-[-375px] left-12 hidden lg:block overflow-hidden rounded-full h-[500px] w-[500px] bg-[#F6D8AE] opacity-90" />
              <Circle className="fixed -bottom-[300px] -left-24 hidden lg:block overflow-hidden rounded-full h-[500px] w-[500px] bg-[#F6D8AE] opacity-90" />
            </div>
          </div>
        ) : null}
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="h-screen">
            <Card className="bg-opacity-0 shadow-none">
              <div className="min-h-screen font-inter my-4">
                <div className="mx-auto flex flex-column justify-between">
                  <div className="inputs max-w-[90%] px-6 mx-auto shrink-0 grow">
                    <form
                      className="mt-3 pt-4"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="personal w-full">
                          <div className="flex items-center justify-between mt-4">
                            <div className="w-full md:w-1/2 px-3 mb-6">
                              <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                First Name
                                <span className="text-red-600">*</span>
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
                                placeholder="first name"
                                maxLength={50}
                              />
                              {errors.firstName ? (
                                <>
                                  {errors.firstName.type === "required" && (
                                    <p className={errorStyles}>
                                      {errors.firstName.message}
                                    </p>
                                  )}
                                  {errors.firstName.type === "pattern" && (
                                    <p className={errorStyles}>
                                      {errors.firstName.message}
                                    </p>
                                  )}
                                </>
                              ) : null}
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-6">
                              <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Last Name
                                <span className="text-red-600">*</span>
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
                                placeholder="last name"
                                maxLength={50}
                              />
                              {errors.lastName ? (
                                <>
                                  {errors.lastName.type === "required" && (
                                    <p className={errorStyles}>
                                      {errors.lastName.message}
                                    </p>
                                  )}
                                  {errors.lastName.type === "pattern" && (
                                    <p className={errorStyles}>
                                      {errors.lastName.message}
                                    </p>
                                  )}
                                </>
                              ) : null}
                            </div>
                          </div>

                         {/* Preferred Name */}
                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Preferred Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                              {...register("preferredName", {
                                pattern: {
                                  value: /^[a-z ,.'-]+$/i,
                                  message: "Contains invalid characters",
                                },
                              })}
                              type="text"
                              placeholder="preferred name"
                              maxLength={50}
                            />
                            {errors.preferredName && (
                              <p className={errorStyles}>{errors.preferredName.message}</p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="w-full md:w-full px-3 mb-6">
                            <label
                              className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                              htmlFor="grid-text-1"
                            >
                              Email (.edu)
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                              {...register("email", {
                                required:
                                  "Please enter your school email (.edu, .ca, .ac.uk, .ac.kr, or .usthb.dz)",
                                pattern: {
                                  value:
                                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.edu|\.ca|\.ac\.uk|\.ac\.kr|\.usthb\.dz)$/,
                                  message:
                                    "Needs to be a valid school email (.edu, .ca, .ac.uk, or .usthb.dz)",
                                },
                              })}
                              id="grid-text-1"
                              type="text"
                              placeholder="byte@uga.edu"
                              maxLength={100}
                            />
                            {errors.email ? (
                              <>
                                {errors.email.type === "required" && (
                                  <p className={errorStyles}>
                                    {errors.email.message}
                                  </p>
                                )}
                                {errors.email.type === "pattern" && (
                                  <p className={errorStyles}>
                                    {errors.email.message}
                                  </p>
                                )}
                              </>
                            ) : null}
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Gender<span className="text-red-600">*</span>
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
                                <p className={errorStyles}>
                                  {errors.gender.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Phone Number
                              <span className="text-red-600">*</span>
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
                                    onChange={(val: string | undefined) =>
                                      onChange(val ?? "")
                                    }
                                    defaultCountry="US"
                                    id="phoneNumber"
                                  />
                                )}
                              />
                              {errors.phoneNumber ? (
                                <>
                                  {errors.phoneNumber.type === "required" && (
                                    <p className={errorStyles}>
                                      {errors.phoneNumber.message}
                                    </p>
                                  )}
                                  {errors.phoneNumber.type === "validate" && (
                                    <p className={errorStyles}>
                                      {errors.phoneNumber.message}
                                    </p>
                                  )}
                                </>
                              ) : null}
                            </div>
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Year<span className="text-red-600">*</span>
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
                                    {
                                      StudentYears[
                                        key as keyof typeof StudentYears
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
                              {errors.year && (
                                <p className={errorStyles}>
                                  {errors.year.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Current Major
                              <span className="text-red-600">*</span>
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
                                <p className={errorStyles}>
                                  {errors.major.message}
                                </p>
                              )}
                              {errors.inputMajor ? (
                                <>
                                  {errors.inputMajor.type === "required" && (
                                    <p className={errorStyles}>
                                      {errors.inputMajor.message}
                                    </p>
                                  )}
                                  {errors.inputMajor.type === "pattern" && (
                                    <p className={errorStyles}>
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
                              <p className={errorStyles}>
                                {errors.minor.message}
                              </p>
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
                                    First Time at a Cackathon?
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
                                            "grid-text-1-span",
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
                              <p className={errorStyles}>
                                {errors.participated.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              What do you expect out of the Cadathon?
                              <span className="text-red-600">*</span>
                            </label>
                            <textarea
                              className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                              {...register("hopeToSee", {
                                required: "Please enter a response",
                              })}
                              maxLength={250}
                              onChange={(e) =>
                                setTextCount(e.target.value.length)
                              }
                            ></textarea>
                            <p>{textCount}/250</p>
                            {errors.hopeToSee && (
                              <p className={errorStyles}>
                                {errors.hopeToSee.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Dietary Restrictions?
                              <span className="text-red-600">*</span>
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
                                <p className={errorStyles}>
                                  {errors.dietaryRestrictions.message}
                                </p>
                              )}
                              {errors.inputDietaryRestrictions ? (
                                <>
                                  {errors.inputDietaryRestrictions.type ===
                                    "required" && (
                                    <p className={errorStyles}>
                                      {errors.inputDietaryRestrictions.message}
                                    </p>
                                  )}
                                  {errors.inputDietaryRestrictions.type ===
                                    "pattern" && (
                                    <p className={errorStyles}>
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
                              <span className="text-red-600">*</span>
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
                                <p className={errorStyles}>
                                  {errors.shirtSize.message}
                                </p>
                              )}
                            </div>
                          </div>
        
                          <div className={!shouldRender ? "pb-56" : "pb-20"}>
                            <button
                              className={`border rounded w-full transition-colors p-2 ${isSubmitting
                                  ? "border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "border-gray-100 bg-gray-100 hover:bg-primary-500 hover:border-primary-500 hover:text-white"
                                }`}
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Registering..." : "Register!"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
