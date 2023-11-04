import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Card } from "@material-tailwind/react";
import { ESportsRegisterForm } from "../../interfaces/eSportsRegisterForm";
import Link from "next/link";

export default function ESportsRegister() {
  const router = useRouter();
  const [textCount, setTextCount] = useState(0);
  const { storeESportsRegistrationInformation } = useAuth();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ESportsRegisterForm>({
    defaultValues: {},
  });
  const onSubmit: SubmitHandler<ESportsRegisterForm> = (data) => {
    storeESportsRegistrationInformation(data);
    router.push("/eSportsRegistrationSuccess");
  };

  return (
    <div>
      <ProtectedRoute>
        <Card >
          <div className="min-h-screen pt-2 font-mono mb-8">
            <div className="container mx-auto">
              <div className="inputs w-full max-w-sm mx-auto">
                <form className="font-inter" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="personal w-full pt-2">
                      <h1 className="text-center font-inter font-weight-700 font-bold text-2xl ">
                        E-Sports Registration
                      </h1>
                      <h2 className="font-weight-300 text-[11px] text-gray-900 mt-4">
                        This year we will be hosting a Super Smash Bros.
                        Ultimate Tournament! If interested, please register here
                        :)
                      </h2>
                      <h2 className="font-weight-300 text-[11px] text-gray-900 mt-0">
                        There will also be freeplay for other fighting games
                        e.g. Guilty Gear on PS4 🕹️
                      </h2>
                      <div className="w-full md:w-full mb-6 mt-6">
                        <label className="block uppercase tracking-wide text-black-700 text-[11px] font-bold mb-2">
                          Skill level description (hours played, any competetive
                          experience, etc). None is fine (type &quot;N/A&quot;):
                          <span className="text-red-600">*</span>
                        </label>
                        <p className="text-s text-[11px] pb-2">
                          This is to help us match up players with similar skill
                          levels! We welcome all skill levels 😇
                        </p>
                        <textarea
                          className="bg-gray-100 rounded-md border leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                          {...register("skillLevel", {
                            required: "Type here...",
                          })}
                          maxLength={250}
                          onChange={(e) => setTextCount(e.target.value.length)}
                        ></textarea>
                        <p>{textCount}/250</p>
                        {errors.skillLevel && (
                          <p className="text-red-400">
                            {errors.skillLevel.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full mb-6">
                        <label
                          className="block uppercase tracking-wide text-black-700 text-[11px] font-bold mb-2"
                          htmlFor="grid-text-1"
                        >
                          What should we call you (e.g. real name, username and
                          pronounciation, etc.)? This is so we can call you up
                          if necessary (and if we can&apos;t easily say your
                          full username).<span className="text-red-600">*</span>
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-2 px-2 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("preferredName", {
                            required: "Please enter a response",
                          })}
                          id="grid-text-1"
                          type="text"
                          maxLength={100}
                          placeholder="Enter your name, username, pronounciation, etc."
                        />
                        {errors.preferredName && (
                          <p className="text-red-400">
                            {errors.preferredName.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full mb-6">
                        <Controller
                          control={control}
                          name="canBringController"
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
                                className="block uppercase tracking-wide text-black-700 text-[11px] font-bold mb-2"
                                htmlFor="grid-text-1"
                              >
                                This event is Bring Your Own Controller (BYOC).
                                We will have extra controllers in case but you
                                will need to bring your own adapters for
                                gamecube controllers and others. Are you willing
                                to provide any other peripherals/systems for the
                                tourney?
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
                        {errors.canBringController && (
                          <p className="text-red-400">
                            {errors.canBringController.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full mb-6">
                        <Controller
                          control={control}
                          name="tardyAgreement"
                          rules={{
                            required:
                              "You must select Yes to sign up for e-sports tournament",
                          }}
                          render={({ field: { onChange, value } }) => (
                            <>
                              <label
                                className="block uppercase tracking-wide text-black-700 text-[11px] font-bold mb-2"
                                htmlFor="grid-text-2"
                              >
                                I understand that if I am more than 10 min late
                                to my time to play, I will be automatically
                                eliminated. This is to ensure that the
                                tournament runs smoothly.
                                <span className="text-red-600">*</span>
                              </label>
                              <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value=""
                                  id="grid-text-2"
                                  className="sr-only peer"
                                  onChange={() => {
                                    onChange(!value);
                                    let span =
                                      document.getElementById(
                                        "grid-text-2-span"
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
                                  id="grid-text-2-span"
                                >
                                  No
                                </span>
                              </label>
                            </>
                          )}
                        />
                        {errors.tardyAgreement && (
                          <p className="text-red-400">
                            {errors.tardyAgreement.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-around">
                        <button
                          className="appearance-none w-full h-[30px] font-bold font-inter bg-gray-100 text-black-900 "
                          type="submit"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </ProtectedRoute>
    </div>
  );
}
