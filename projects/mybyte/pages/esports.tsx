import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import countryList from "react-select-country-list";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";
import { useRouter } from "next/router";
import Typewriter from "typewriter-effect";

import { RegisterForm } from "../interfaces/registerForm";

import {
  Games,
  Genders,
  StudentYears,
  Majors,
  ShirtSizes,
  LevelsOfStudy,
  DietaryRestrictions,
  ELInterest,
} from "../enums/registerEnums";

import "react-phone-number-input/style.css";
import ProtectedRoute from "../components/ProtectedRoute";
import { Card } from "@material-tailwind/react";
import Circle from "../components/Circle";
import { eSportsForm } from "../interfaces/eSportsForm";

export default function ESportsRegister() {
  const router = useRouter();
  const {
    triggerESportsRegistrationEmail,
    storeESportsRegistrationInformation,
  } = useAuth();
  const {
    control,
    resetField,
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<eSportsForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      gamerTag: "",
      phoneNumber: "",
      selectedGame: "",
      skillLevelDescription: "",
      setUpDescription: "",
      keyBindingsDescription: "",
    },
  });

  const onSubmit: SubmitHandler<eSportsForm> = (data) => {
    storeESportsRegistrationInformation(data);
    triggerESportsRegistrationEmail();
    router.push("/eSportsRegistrationSuccess");
  };

  const [textCount1, setTextCount1] = useState(0);
  const [textCount2, setTextCount2] = useState(0);
  const [textCount3, setTextCount3] = useState(0);

  const errorStyles = "text-red-500 font-mono text-xs m-1";

  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 825; // Adjust the width as needed
      setShouldRender(!isSmallScreen);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ProtectedRoute className="w-screen">
      <div className="flex overflow-hidden">
        {shouldRender ? (
          <div className="moving-gradient-esports w-[50vw] flex-1 pl-8 pt-12 font-mono overflow-hidden text-white">
            <div className="pl-12 pt-10">
              <h1 className="text-6xl mb-8 w-4/5 leading-[80px]">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Register for ")
                      .typeString("eSports 9")
                      .start();
                  }}
                />
              </h1>
              <div className="pl-1 text-md w-4/5">
                <p className="pb-3">
                  We&apos;re excited that you are participating in the eSports
                  tournament at UGAHacks 9 (pog!).
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

              <Circle className="fixed bottom-[-375px] left-12 hidden lg:block overflow-hidden rounded-full h-[500px] w-[500px] bg-[#C2EAB2] opacity-90" />
              <Circle className="fixed -bottom-[300px] -left-24 hidden lg:block overflow-hidden rounded-full h-[500px] w-[500px] bg-[#C2EAB2] opacity-90" />
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

                          <div className="w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Gamer Tag
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                              {...register("gamerTag", {
                                required: "Please enter your gamer tag",
                                pattern: {
                                  value: /^[a-z0-9 ,.'_ -]+$/i,
                                  message: "Contains invalid characters",
                                },
                              })}
                              type="text"
                              placeholder="username"
                              maxLength={50}
                            />
                            {errors.gamerTag ? (
                              <>
                                {errors.gamerTag.type === "required" && (
                                  <p className={errorStyles}>
                                    {errors.gamerTag.message}
                                  </p>
                                )}
                                {errors.gamerTag.type === "pattern" && (
                                  <p className={errorStyles}>
                                    {errors.gamerTag.message}
                                  </p>
                                )}
                              </>
                            ) : null}
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
                                    onChange={onChange}
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
                              Select which games you’d like to compete in a
                              tournament for (you can only play in one):
                              <span className="text-red-600">*</span>
                            </label>
                            <div className="flex-shrink w-full inline-block relative">
                              <select
                                className="block appearance-none text-gray-600 w-full bg-white border border-gray-400 shadow-inner px-4 py-2 pr-8 rounded"
                                {...register("selectedGame", {
                                  required: "Select a game",
                                })}
                              >
                                <option value="">Select a game</option>
                                {Object.keys(Games).map((key) => (
                                  <option key={key} value={key}>
                                    {Games[key as keyof typeof Games]}
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
                              {errors.selectedGame && (
                                <p className={errorStyles}>
                                  {errors.selectedGame.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Give a general description of skill level if you’d
                              like (hours played, any competitive experience,
                              etc.). None is fine (type &quot;N/A&quot;):
                              <span className="text-red-600">*</span>
                            </label>
                            <textarea
                              className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                              {...register("skillLevelDescription", {
                                required: "Please enter a response",
                              })}
                              maxLength={250}
                              onChange={(e) =>
                                setTextCount1(e.target.value.length)
                              }
                            ></textarea>
                            <p>{textCount1}/250</p>
                            {errors.skillLevelDescription && (
                              <p className={errorStyles}>
                                {errors.skillLevelDescription.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Can you provide your own setup or peripherals
                              (please describe below what you&apos;re able to
                              bring and for what game or console)?
                              <span className="text-red-600">*</span>
                            </label>
                            <textarea
                              className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                              {...register("setUpDescription", {
                                required: "Please enter a response",
                              })}
                              maxLength={250}
                              onChange={(e) =>
                                setTextCount2(e.target.value.length)
                              }
                            ></textarea>
                            <p>{textCount2}/250</p>
                            {errors.setUpDescription && (
                              <p className={errorStyles}>
                                {errors.setUpDescription.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <label className="block tracking-wide text-gray-700 text-xs font-extrabold mb-2">
                              Provide your controller presets/bindings (i.e. any
                              special settings you run that are different from
                              the default controls) (**Note: Be prepared the day
                              of the tournament with your bindings)
                              <span className="text-red-600">*</span>
                            </label>
                            <textarea
                              className="bg-gray-100 rounded-md leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                              {...register("keyBindingsDescription", {
                                required: "Please enter a response",
                              })}
                              maxLength={250}
                              onChange={(e) =>
                                setTextCount3(e.target.value.length)
                              }
                            ></textarea>
                            <p>{textCount3}/250</p>
                            {errors.keyBindingsDescription && (
                              <p className={errorStyles}>
                                {errors.keyBindingsDescription.message}
                              </p>
                            )}
                          </div>

                          <div className="w-full md:w-full px-3 mb-6">
                            <Controller
                              control={control}
                              name="tardyAgreement"
                              rules={{
                                required:
                                  "Please indicate you have read and agree to the tardy policy",
                              }}
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label
                                    className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                    htmlFor="grid-text-1"
                                  >
                                    <em>Tardy Agreement: </em>“I understand that
                                    if I am more than 5 minutes late to my time
                                    to play, I will be automatically
                                    eliminated.” (**Note: When it is your turn
                                    to play, you will be notified via Slack.)
                                    <span className="text-red-600">*</span>
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
                            {errors.tardyAgreement && (
                              <p className={errorStyles}>
                                {errors.tardyAgreement.message}
                              </p>
                            )}
                          </div>

                          <div className={!shouldRender ? "pb-56" : "pb-20"}>
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
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
