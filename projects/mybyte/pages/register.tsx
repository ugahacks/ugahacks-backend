import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Controller,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import countryList from "react-select-country-list";
import Typewriter from "typewriter-effect";
import { useAuth } from "../context/AuthContext";

import { RegisterForm } from "../interfaces/registerForm";

import {
  DietaryRestrictions,
  ELInterest,
  Genders,
  LevelsOfStudy,
  Majors,
  Races,
  ShirtSizes,
  StudentYears,
} from "../enums/registerEnums";

import { Card } from "@material-tailwind/react";
import "react-phone-number-input/style.css";
import Circle from "../components/Circle";
import ProtectedRoute from "../components/ProtectedRoute";

type EventType = "cadathon" | "ugahacks12";

export default function Register() {
  const router = useRouter();
  const eventType = (router.query.event as EventType) || "cadathon";
  const isUGAHacks12 = eventType === "ugahacks12";
  const isCadathon = eventType === "cadathon";
  const eventLabel = isUGAHacks12 ? "UGAHacks 12" : "the UGA Cadathon";

  const {
    storeUserRegistrationInformation,
    userInfo,
    triggerRegistrationEmail,
  } = useAuth();

  const {
    control,
    resetField,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      phoneNumber: "",
      preferredName: "",
      inputMajor: "",
      inputDietaryRestrictions: "",
      participated: undefined,
      mlhCommunication: false,
      codeOfConduct: false,
      eventLogisticsInfo: false,
      hopeToSee: "",
      firstName: "",
      lastName: "",
      email: "",
      gender: undefined as any,
      year: undefined as any,
      major: undefined as any,
      minor: "",
      shirtSize: undefined as any,
      eventType,
      age: 18 as any,
      inputSchool: "",
      school: null as any,
      race: undefined as any,
      levelsOfStudy: undefined as any,
      countryResidence: null as any,
      elCreditInterest: undefined as any,
      resume: undefined as any,
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherMajor, setOtherMajor] = useState(false);
  const [otherSchool, setOtherSchool] = useState(false);
  const [otherDietaryRestrictions, setOtherDietaryRestrictions] =
    useState(false);
  const [textCount, setTextCount] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [schoolOptions, setSchoolOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const countryOptions = React.useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const opts: { value: string; label: string }[] = [];

    fetch("/schools.csv")
      .then((resp) => resp.text())
      .then((text) => {
        const rows = text.split(/\r?\n/);
        rows.slice(1).forEach((row) => {
          const school = row.trim();
          if (school) opts.push({ value: school, label: school });
        });
        opts.push({ value: "other", label: "Other" });
        setSchoolOptions(opts);
      })
      .catch(() => {
        setSchoolOptions([{ value: "other", label: "Other" }]);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 825;
      setShouldRender(!isSmallScreen);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    setSubmitError(null);
    try {
      await storeUserRegistrationInformation({
        ...data,
        eventType: eventType as any,
      } as any);

      await triggerRegistrationEmail({
        ...data,
        eventType: eventType as any,
      } as any);

      router.push("/registrationSuccess");
    } catch (error) {
      console.error("Registration failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    }
  };

  const onInvalid: SubmitErrorHandler<RegisterForm> = (formErrors) => {
    const invalidFields = Object.keys(formErrors);
    setSubmitError(
      invalidFields.length
        ? `Please complete these fields: ${invalidFields.join(", ")}.`
        : "Please complete all required fields before registering.",
    );
  };

  const errorStyles = "text-red-500 font-mono text-xs m-1";

  register("major", {
    onChange: (e) => {
      const value = e.target.value;
      if (value === "other") {
        setOtherMajor(true);
      } else {
        setOtherMajor(false);
        resetField("inputMajor");
      }
    },
  });

  register("school", {
    onChange: (e) => {
      const value = e.target?.value?.value ?? e.target?.value;
      if (value === "other") {
        setOtherSchool(true);
      } else {
        setOtherSchool(false);
        resetField("inputSchool");
      }
    },
  });

  register("dietaryRestrictions", {
    onChange: (e) => {
      const value = e.target.value;
      if (value === "other") {
        setOtherDietaryRestrictions(true);
      } else {
        setOtherDietaryRestrictions(false);
        resetField("inputDietaryRestrictions");
      }
    },
  });

  return (
    <ProtectedRoute className="w-screen">
      <div className="flex overflow-hidden">
        {shouldRender ? (
          <div className="moving-gradient-register w-[50vw] flex-1 pl-8 pt-12 font-mono overflow-hidden text-white">
            <div className="pl-12 pt-10">
              <h1 className="text-6xl mb-8 w-4/5 leading-[80px]">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter.typeString("Register for ").typeString(eventLabel).start();
                  }}
                />
              </h1>
              <div className="pl-1 text-md w-4/5">
                <p className="pb-3">
                  {isUGAHacks12
                    ? "We're excited that you are participating in UGAHacks 12! We would love to see you at the event!"
                    : "We're excited that you are participating in the UGA Cadathon! We would love to see you at the event! **This is ONLY for UGA Students**"}
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
                      onSubmit={handleSubmit(onSubmit, onInvalid)}
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
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
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
                              {errors.firstName && (
                                <p className={errorStyles}>
                                  {errors.firstName.message}
                                </p>
                              )}
                            </div>

                            <div className="w-full md:w-1/2 px-3 mb-6">
                              <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Last Name
                                <span className="text-red-600">*</span>
                              </label>
                              <input
                                className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
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
                              {errors.lastName && (
                                <p className={errorStyles}>
                                  {errors.lastName.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-1/2 px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Preferred Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
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
                              <p className={errorStyles}>
                                {errors.preferredName.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Email
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                              {...register("email", {
                                required: "Please enter your email",
                                pattern: {
                                  value:
                                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.edu|\.ca|\.ac\.uk|\.ac\.kr|\.usthb\.dz)$/,
                                  message: "Needs to be a valid school email",
                                },
                              })}
                              type="text"
                              placeholder="byte@uga.edu"
                              maxLength={100}
                            />
                            {errors.email && (
                              <p className={errorStyles}>{errors.email.message}</p>
                            )}
                          </div>

                          {isUGAHacks12 && (
                            <>
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
                                  {errors.gender && (
                                    <p className={errorStyles}>
                                      {errors.gender.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Race/Ethnicity
                                  <span className="text-red-600">*</span>
                                </label>
                                <div className="flex-shrink w-full inline-block relative">
                                  <select
                                    className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                    {...register("race" as any, {
                                      required: "Select your race/ethnicity",
                                    })}
                                  >
                                    <option value="">
                                      Select your race/ethnicity
                                    </option>
                                    {Object.keys(Races).map((key) => (
                                      <option key={key} value={key}>
                                        {Races[key as keyof typeof Races]}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Age<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name="age" as any
                                  rules={{
                                    required: "Please provide an age",
                                    min: { value: 13, message: "Age cannot be below 13." },
                                    max: { value: 100, message: "Age cannot exceed 100." },
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <input
                                      type="number"
                                      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                      value={value}
                                      onChange={(e) => onChange(Number(e.target.value))}
                                      min={13}
                                      max={100}
                                    />
                                  )}
                                  control={control}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Country of Residence
                                </label>
                                <Controller
                                  name="countryResidence" as any
                                  rules={{
                                    required: "Please select a country of residence",
                                  }}
                                  render={({ field: { name, onChange, value } }) => (
                                    <Select
                                      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                      options={countryOptions}
                                      value={value}
                                      onChange={(newValue) => newValue && onChange(newValue)}
                                      name={name}
                                    />
                                  )}
                                  control={control}
                                />
                              </div>

                              <div className="w-full md:w-1/2 px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Phone Number
                                  <span className="text-red-600">*</span>
                                </label>
                                <div className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500">
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
                                        onChange={(val) => onChange(val ?? "")}
                                        defaultCountry="US"
                                        id="phoneNumber"
                                      />
                                    )}
                                  />
                                </div>
                                {errors.phoneNumber && (
                                  <p className={errorStyles}>
                                    {errors.phoneNumber.message}
                                  </p>
                                )}
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
                                        {StudentYears[key as keyof typeof StudentYears]}
                                      </option>
                                    ))}
                                  </select>
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
                                  {otherMajor && (
                                    <input
                                      className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
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
                                  )}
                                </div>
                              </div>

                              
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  School<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name="school" as any
                                  rules={{ required: "Please select your school" }}
                                  render={({ field: { name, onChange, value } }) => (
                                    <Select
                                      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                      options={schoolOptions}
                                      value={value}
                                      onChange={(newValue) => newValue && onChange(newValue)}
                                      name={name}
                                    />
                                  )}
                                  control={control}
                                />
                                {otherSchool && (
                                  <input
                                    className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500 mt-2"
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
                                )}
                              </div>

                              <div className="w-full md:w-1/2 px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Minor/Concentrations/Certificates
                                </label>
                                <input
                                  className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                                  {...register("minor")}
                                  type="text"
                                  maxLength={100}
                                />
                              </div>

                              <div className="w-full md:w-1/2 px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                  Resume (for employers)<span className="text-red-600">*</span>
                                </label>
                                <input
  type="file"
  accept=".pdf,.doc,.docx"
  className="block w-full text-sm text-gray-700
             file:mr-4 file:py-2 file:px-4
             file:rounded-md file:border-0
             file:text-sm file:font-semibold
             file:bg-gray-100 file:text-gray-700
             hover:file:bg-gray-200"
/>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <Controller
                                  control={control}
                                  name="participated"
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        Is this your first time participating in UGAHacks?
                                      </label>
                                      <div className="flex gap-6 text-gray-700">
                                        <label className="inline-flex items-center gap-2">
                                          <input
                                            type="radio"
                                            checked={value === true}
                                            onChange={() => onChange(true)}
                                          />
                                          Yes
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                          <input
                                            type="radio"
                                            checked={value === false}
                                            onChange={() => onChange(false)}
                                          />
                                          No
                                        </label>
                                      </div>
                                    </>
                                  )}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  What do you expect out of UGAHacks?
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                                  {...register("hopeToSee", {
                                    required: "Please enter a response",
                                  })}
                                  maxLength={250}
                                  onChange={(e) => setTextCount(e.target.value.length)}
                                />
                                <p>{textCount}/250</p>
                                {errors.hopeToSee && (
                                  <p className={errorStyles}>
                                    {errors.hopeToSee.message}
                                  </p>
                                )}
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Interested in EL Credit (For UGA students ONLY)?
                                </label>
                                <div className="flex-shrink w-full inline-block relative">
                                  <select
                                    className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                    {...register("elCreditInterest" as any, {
                                      required: "Please select whether you're interested",
                                    })}
                                  >
                                    <option value="">Select EL interest</option>
                                    {Object.keys(ELInterest).map((key) => (
                                      <option key={key} value={key}>
                                        {ELInterest[key as keyof typeof ELInterest]}
                                      </option>
                                    ))}
                                  </select>
                                </div>
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
                                      required: "Please select your dietary restrictions",
                                    })}
                                  >
                                    <option value="">Select your dietary restrictions</option>
                                    {Object.keys(DietaryRestrictions).map((key) => (
                                      <option key={key} value={key}>
                                        {DietaryRestrictions[key as keyof typeof DietaryRestrictions]}
                                      </option>
                                    ))}
                                  </select>
                                  {otherDietaryRestrictions && (
                                    <input
                                      className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                                      {...register("inputDietaryRestrictions", {
                                        required: "Please select your dietary restrictions",
                                        pattern: {
                                          value: /^[a-z ,.'-]+$/i,
                                          message: "Contains invalid characters",
                                        },
                                      })}
                                      type="text"
                                      maxLength={100}
                                      placeholder="Type your dietary restrictions here"
                                    />
                                  )}
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
                                                                    <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  We are currently in the process of partnering with MLH. The following 3 checkboxes are for this partnership. If we do not end up partnering with MLH, your information will not be shared.
                                </label>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        <em>MLH Code of Conduct: </em>
                                        I have read and agree to the MLH Code of Conduct.
                                      </label>
                                      <label className="relative inline-flex items-center mb-4 cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    onChange={() => onChange(!value)}
    checked={!!value}
  />
  <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-primary-600 transition-colors duration-300"></div>
  <div className="absolute left-1 w-5 h-5 bg-white rounded-full peer-checked:left-7 transition-all duration-300"></div>
</label>
                                    </>
                                  )}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <Controller
                                  control={control}
                                  name="eventLogisticsInfo"
                                  rules={{
                                    required:
                                      "Please indicate you have read and agree to the MLH privacy policy",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        
                                        I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and administration (including the creation of linked accounts on MLH and DEV (dev.to)) in line with the MLH Privacy Policy. I further agree to the terms of both the MLH Contest Terms and Conditions (https://github.com/MLH/mlh-policies/blob/main/contest-terms.md) and the MLH Privacy Policy
                                      </label>
<label className="relative inline-flex items-center mb-4 cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    onChange={() => onChange(!value)}
    checked={!!value}
  />
  <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-primary-600 transition-colors duration-300"></div>
  <div className="absolute left-1 w-5 h-5 bg-white rounded-full peer-checked:left-7 transition-all duration-300"></div>
</label>
                                    </>
                                  )}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <Controller
                                  control={control}
                                  name="mlhCommunication"
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        <em>Communication from MLH: </em>
                                        I authorize MLH + DEV to send me occasional emails about relevant events, career opportunities, and community announcements.
                                      </label>
                                      <label className="relative inline-flex items-center mb-4 cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    onChange={() => onChange(!value)}
    checked={!!value}
  />
  <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-primary-600 transition-colors duration-300"></div>
  <div className="absolute left-1 w-5 h-5 bg-white rounded-full peer-checked:left-7 transition-all duration-300"></div>
</label>
                                    </>
                                  )}
                                />
                              </div>
                            </>
                          )}

                          {isCadathon && (
                            <>
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
                                </div>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Phone Number
                                  <span className="text-red-600">*</span>
                                </label>
                                <div className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500">
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
                                        {StudentYears[key as keyof typeof StudentYears]}
                                      </option>
                                    ))}
                                  </select>
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
                                  {otherMajor && (
                                    <input
                                      className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500 mt-2"
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
                                  )}
                                </div>
                              </div>

                              <div className="w-full md:w-1/2 px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Minor
                                </label>
                                <input
                                  className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                                  {...register("minor")}
                                  type="text"
                                  maxLength={100}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <Controller
                                  control={control}
                                  name="participated"
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        Is this your first time participating in a Cadathon?
                                      </label>
                                      <div className="flex gap-6 text-gray-700">
                                        <label className="inline-flex items-center gap-2">
                                          <input
                                            type="radio"
                                            checked={value === true}
                                            onChange={() => onChange(true)}
                                          />
                                          Yes
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                          <input
                                            type="radio"
                                            checked={value === false}
                                            onChange={() => onChange(false)}
                                          />
                                          No
                                        </label>
                                      </div>
                                    </>
                                  )}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  What do you expect out of this Cadathon?
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                                  {...register("hopeToSee", {
                                    required: "Please enter a response",
                                  })}
                                  maxLength={250}
                                  onChange={(e) => setTextCount(e.target.value.length)}
                                />
                                <p>{textCount}/250</p>
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
                                      required: "Please select your dietary restrictions",
                                    })}
                                  >
                                    <option value="">
                                      Select your dietary restrictions
                                    </option>
                                    {Object.keys(DietaryRestrictions).map((key) => (
                                      <option key={key} value={key}>
                                        {DietaryRestrictions[key as keyof typeof DietaryRestrictions]}
                                      </option>
                                    ))}
                                  </select>
                                  {otherDietaryRestrictions && (
                                    <input
                                      className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500 mt-2"
                                      {...register("inputDietaryRestrictions", {
                                        required: "Please select your dietary restrictions",
                                        pattern: {
                                          value: /^[a-z ,.'-]+$/i,
                                          message: "Contains invalid characters",
                                        },
                                      })}
                                      type="text"
                                      maxLength={100}
                                      placeholder="Type your dietary restrictions here"
                                    />
                                  )}
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
                                </div>
                              </div>
                            </>
                          )}

                          <div className={!shouldRender ? "pb-56" : "pb-20"}>
                            {submitError && (
                              <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {submitError}
                              </p>
                            )}
                            <button
                              className={`border rounded w-full transition-colors p-2 ${
                                isSubmitting
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
    </ProtectedRoute>
  );
}