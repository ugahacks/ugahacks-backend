import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
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

type Option = { value: string; label: string };

const PREFER_NOT_TO_ANSWER = {
  value: "prefer_not_to_answer",
  label: "Prefer not to answer",
};

const NONE_OPTION = { value: "none", label: "None" };

export default function Register() {
  const router = useRouter();
  const eventType = (router.query.event as EventType) || "cadathon";
  const isUGAHacks12 = eventType === "ugahacks12";
  const isCadathon = eventType === "cadathon";
  const eventLabel = isUGAHacks12 ? "UGAHacks 12" : "the UGA Cadathon";

  const {
    storeUserRegistrationInformation,
    triggerRegistrationEmail,
  } = useAuth();

  const {
    control,
    resetField,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      phoneNumber: "",
      preferredName: "",
      inputMajor: "",
      inputDietaryRestrictions: "",
      participated: false,
      mlhCommunication: false,
      codeOfConduct: false,
      eventLogisticsInfo: false,
      hopeToSee: "",
      firstName: "",
      lastName: "",
      email: "",
      gender: undefined as any,
      year: undefined as any,
      graduationYear: "",
      major: undefined as any,
      minor: "",
      shirtSize: undefined as any,
      eventType,
      age: 18 as any,
      inputSchool: "",
      school: null as any,
      race: undefined as any,
      levelsOfStudy: undefined as any,
      highestEducationLevel: "",
      countryResidence: null as any,
      elCreditInterest: undefined as any,
      linkedinUrl: "",
      dietaryRestrictions: [] as any,
      resume: undefined as any,
    } as any,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherMajor, setOtherMajor] = useState(false);
  const [otherSchool, setOtherSchool] = useState(false);
  const [otherDietaryRestrictions, setOtherDietaryRestrictions] = useState(false);
  const [textCount, setTextCount] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [schoolOptions, setSchoolOptions] = useState<Option[]>([]);

  const countryOptions = useMemo(
    () => [...countryList().getData(), PREFER_NOT_TO_ANSWER],
    [],
  );

  const dietaryOptions = useMemo<Option[]>(
    () => [
      NONE_OPTION,
      ...Object.keys(DietaryRestrictions).map((key) => ({
        value: key,
        label: DietaryRestrictions[key as keyof typeof DietaryRestrictions],
      })),
      { value: "other", label: "Other" },
    ],
    [],
  );

  const watchedDietary = watch("dietaryRestrictions" as any);

  useEffect(() => {
    const opts: Option[] = [];

    fetch("/schools.csv")
      .then((resp) => resp.text())
      .then((text) => {
        const rows = text.split(/\r?\n/);
        rows.slice(1).forEach((row) => {
          const school = row.trim();
          if (school) opts.push({ value: school, label: school });
        });
        opts.push(PREFER_NOT_TO_ANSWER);
        opts.push({ value: "other", label: "Other" });
        setSchoolOptions(opts);
      })
      .catch(() => {
        setSchoolOptions([PREFER_NOT_TO_ANSWER, { value: "other", label: "Other" }]);
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

  useEffect(() => {
    const selected = (watchedDietary || []) as Option[];
    const hasOther = selected.some((o) => o?.value === "other");
    const hasNone = selected.some((o) => o?.value === "none");

    setOtherDietaryRestrictions(hasOther);

    if (!hasOther) {
      resetField("inputDietaryRestrictions");
    }

    if (hasNone && selected.length > 1) {
      const cleaned = selected.filter((o) => o.value !== "none");
      setValue("dietaryRestrictions" as any, cleaned as any, { shouldValidate: true });
    }
  }, [watchedDietary, resetField, setValue]);

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
                    : "We're excited that you are participating in the UGA Cadathon! We would love to see you at the event!"}
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
                    <form className="mt-3 pt-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                      <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="personal w-full">
                          {/* ... keep your existing shared fields here (name/email/etc) ... */}

                          {isUGAHacks12 && (
                            <>
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Gender<span className="text-red-600">*</span>
                                </label>
                                <div className="flex-shrink w-full inline-block relative">
                                  <select
                                    className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                    {...register("gender", { required: "Select gender" })}
                                  >
                                    <option value="">Select your gender</option>
                                    {Object.keys(Genders).map((key) => (
                                      <option key={key} value={key}>
                                        {Genders[key as keyof typeof Genders]}
                                      </option>
                                    ))}
                                    <option value={PREFER_NOT_TO_ANSWER.value}>
                                      {PREFER_NOT_TO_ANSWER.label}
                                    </option>
                                  </select>
                                  {errors.gender && <p className={errorStyles}>{errors.gender.message}</p>}
                                </div>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Race/Ethnicity<span className="text-red-600">*</span>
                                </label>
                                <div className="flex-shrink w-full inline-block relative">
                                  <select
                                    className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                    {...register("race" as any, {
                                      required: "Select your race/ethnicity",
                                    })}
                                  >
                                    <option value="">Select your race/ethnicity</option>
                                    {Object.keys(Races).map((key) => (
                                      <option key={key} value={key}>
                                        {Races[key as keyof typeof Races]}
                                      </option>
                                    ))}
                                    <option value={PREFER_NOT_TO_ANSWER.value}>
                                      {PREFER_NOT_TO_ANSWER.label}
                                    </option>
                                  </select>
                                </div>
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Age<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name={"age" as any}
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

                              {/* NEW: School / University */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  School / University<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name={"school" as any}
                                  rules={{ required: "Please select your school/university" }}
                                  render={({ field: { name, onChange, value } }) => (
                                    <Select
                                      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                      options={schoolOptions}
                                      value={value}
                                      onChange={(newValue) => {
                                        if (newValue) {
                                          onChange(newValue);
                                          setOtherSchool((newValue as Option).value === "other");
                                        }
                                      }}
                                      name={name}
                                    />
                                  )}
                                  control={control}
                                />
                                {otherSchool && (
                                  <input
                                    className="mt-2 appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none"
                                    {...register("inputSchool", {
                                      required: "Please enter your school/university",
                                      pattern: {
                                        value: /^[a-z ,.'-]+$/i,
                                        message: "Contains invalid characters",
                                      },
                                    })}
                                    type="text"
                                    maxLength={100}
                                    placeholder="Type your school/university here"
                                  />
                                )}
                                {errors.school && <p className={errorStyles}>{errors.school.message as any}</p>}
                              </div>

                              {/* NEW: Level of Study */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Level of Study<span className="text-red-600">*</span>
                                </label>
                                <select
                                  className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                  {...register("levelsOfStudy" as any, {
                                    required: "Please select your level of study",
                                  })}
                                >
                                  <option value="">Select your level of study</option>
                                  {Object.keys(LevelsOfStudy).map((key) => (
                                    <option key={key} value={key}>
                                      {LevelsOfStudy[key as keyof typeof LevelsOfStudy]}
                                    </option>
                                  ))}
                                  <option value={PREFER_NOT_TO_ANSWER.value}>
                                    {PREFER_NOT_TO_ANSWER.label}
                                  </option>
                                </select>
                              </div>
                              <div className="w-full md:w-full px-3 mb-6">
  <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
    Major / Field of Study
    <span className="text-red-600">*</span>
  </label>
  <div className="flex-shrink w-full inline-block relative">
    <select
      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
      {...register("major", {
        required: "Please select a major / field of study",
      })}
    >
      <option value="">Select your major / field of study</option>
      {Object.keys(Majors).map((key) => (
        <option key={key} value={key}>
          {Majors[key as keyof typeof Majors]}
        </option>
      ))}
    </select>
    {otherMajor && (
      <input
        className="mt-2 appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none"
        {...register("inputMajor", {
          required: "Please enter your major / field of study",
          pattern: {
            value: /^[a-z ,.'-]+$/i,
            message: "Contains invalid characters",
          },
        })}
        type="text"
        maxLength={100}
        placeholder="Type your major / field of study here"
      />
    )}
  </div>
  {errors.major && <p className={errorStyles}>{errors.major.message}</p>}
</div>

{/* Resume */}
<div className="w-full md:w-1/2 px-3 mb-6">
  <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
    Resume<span className="text-red-600">*</span>
  </label>
  <p className="text-xs text-gray-500 mb-2">
    Please upload your resume. This will be shared with employers for recruiting reference.
  </p>
  <input
    className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
    {...register("resume" as any, {
      required: "Resume is required",
      validate: {
        fileType: (files: FileList) =>
          !files?.length ||
          ["application/pdf"].includes(files[0]?.type) ||
          "Resume must be a PDF file",
        fileSize: (files: FileList) =>
          !files?.length ||
          files[0]?.size <= 5 * 1024 * 1024 ||
          "Resume must be 5MB or smaller",
      },
    })}
    type="file"
    accept=".pdf,application/pdf"
  />
  {errors.resume && <p className={errorStyles}>{errors.resume.message as any}</p>}
</div>

{/* T-Shirt Size */}
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
  {errors.shirtSize && <p className={errorStyles}>{errors.shirtSize.message}</p>}
</div>

                              {/* NEW: Graduation Year */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Graduation Year
                                </label>
                                <input
                                  type="number"
                                  min={new Date().getFullYear() - 10}
                                  max={new Date().getFullYear() + 15}
                                  className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                  {...register("graduationYear" as any, {
                                    validate: (v) =>
                                      !v ||
                                      (/^\d{4}$/.test(String(v)) &&
                                        Number(v) >= new Date().getFullYear() - 10 &&
                                        Number(v) <= new Date().getFullYear() + 15) ||
                                      "Please enter a valid 4-digit graduation year",
                                  })}
                                />
                              </div>

                              {/* NEW: LinkedIn URL */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  LinkedIn URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://www.linkedin.com/in/your-profile"
                                  className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                  {...register("linkedinUrl" as any, {
                                    validate: (v) =>
                                      !v ||
                                      /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(v) ||
                                      "Please enter a valid LinkedIn URL",
                                  })}
                                />
                              </div>

                              {/* NEW: Highest Level of Formal Education */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Highest Level of Formal Education
                                </label>
                                <input
                                  type="text"
                                  maxLength={100}
                                  placeholder="e.g. High school diploma, Bachelor's degree"
                                  className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                  {...register("highestEducationLevel" as any)}
                                />
                              </div>

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Country of Residence<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name={"countryResidence" as any}
                                  rules={{ required: "Please select a country of residence" }}
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

                              <div className="w-full md:w-full px-3 mb-6">
                                <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                                  Dietary Restrictions<span className="text-red-600">*</span>
                                </label>
                                <Controller
                                  name={"dietaryRestrictions" as any}
                                  control={control}
                                  rules={{
                                    validate: (value) =>
                                      (Array.isArray(value) && value.length > 0) ||
                                      "Please select at least one dietary option",
                                  }}
                                  render={({ field: { name, onChange, value } }) => (
                                    <Select
                                      isMulti
                                      name={name}
                                      options={dietaryOptions}
                                      value={value || []}
                                      onChange={(newValue) => onChange(newValue)}
                                      className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                    />
                                  )}
                                />
                                {otherDietaryRestrictions && (
                                  <input
                                    className="mt-2 appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none"
                                    {...register("inputDietaryRestrictions", {
                                      required: "Please specify your dietary restrictions",
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
                                {errors.dietaryRestrictions && (
                                  <p className={errorStyles}>
                                    {errors.dietaryRestrictions.message as any}
                                  </p>
                                )}
                              </div>

                              {/* MLH OFFICIAL WORDING (replace with latest exact MLH copy if needed) */}
                              <div className="w-full md:w-full px-3 mb-6">
                                <Controller
                                  control={control}
                                  name="codeOfConduct"
                                  rules={{
                                    required:
                                      "Please indicate you have read and agree to the MLH Code of Conduct",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        I have read and agree to the{" "}
                                        <a
                                          href="https://mlh.io/code-of-conduct"
                                          target="_blank"
                                          rel="noreferrer"
                                          className="underline"
                                        >
                                          MLH Code of Conduct
                                        </a>
                                        .
                                      </label>
                                      <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="sr-only peer"
                                          onChange={() => onChange(!value)}
                                          checked={!!value}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
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
                                      "Please indicate you agree to event logistics and data sharing with MLH",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <>
                                      <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                                        I authorize you to share my registration/application information with Major League Hacking for event administration, ranking, and MLH administration in-line with the{" "}
                                        <a
                                          href="https://mlh.io/privacy"
                                          target="_blank"
                                          rel="noreferrer"
                                          className="underline"
                                        >
                                          MLH Privacy Policy
                                        </a>
                                        . I further agree to the terms of both the MLH Contest Terms and Conditions and the MLH Privacy Policy.
                                      </label>
                                      <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="sr-only peer"
                                          onChange={() => onChange(!value)}
                                          checked={!!value}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
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
                                        I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.
                                      </label>
                                      <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="sr-only peer"
                                          onChange={() => onChange(!value)}
                                          checked={!!value}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
                                      </label>
                                    </>
                                  )}
                                />
                              </div>
                            </>
                          )}

                          {isCadathon && (
                            <>
                              {/* keep your existing Cadathon fields unchanged */}
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