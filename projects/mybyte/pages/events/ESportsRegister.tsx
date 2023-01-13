import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Card } from "@material-tailwind/react";
import { ESportsRegisterForm } from "../../interfaces/eSportsRegisterForm";

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
    <div className="bg-cover bg-[url('/UGAHacks8TanBG.png')]">
      <ProtectedRoute>
        <Card className="bg-opacity-75">
          <div className="min-h-screen pt-2 font-mono my-8">
            <div className="container mx-auto">
              <div className="inputs w-full max-w-2xl p-6 mx-auto">
                <form className="mt-3 pt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="personal w-full pt-2">
                      <h2 className="text-2xl text-gray-900">
                        E-Sports Registration:
                      </h2>
                      <h2 className="text-l text-gray-900 mt-4">
                        This year we will be hosting a Super Smash Bros.
                        Ultimate Tournament! If interested, please register here
                        :)
                      </h2>
                      <h2 className="text-l text-gray-900 mt-4">
                        There will also be freeplay for other fighting games
                        e.g. Guilty Gear on PS4 🕹️
                      </h2>
                      <div className="w-full md:w-full px-3 mb-6 mt-6">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          Skill level description (hours played, any competetive
                          experience, etc). None is fine (type &quot;N/A&quot;):
                          <span className="text-red-600">*</span>
                        </label>
                        <p className="text-s">
                          This is to help us match up players with similar skill
                          levels! We welcome all skill levels 😇
                        </p>
                        <textarea
                          className="bg-gray-100 rounded-md border leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                          {...register("skillLevel", {
                            required: "Please enter a response",
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
                      <div className="w-full md:w-full px-3 mb-6">
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor="grid-text-1"
                        >
                          What should we call you (e.g. real name, username and
                          pronounciation, etc.)? This is so we can call you up
                          if necessary (and if we can&apos;t easily say your
                          full username).<span className="text-red-600">*</span>
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
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
                      <div className="w-full md:w-full px-3 mb-6">
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
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
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
                              <label>
                                Yes{" "}
                                <input
                                  className="mr-10"
                                  id="grid-text-1"
                                  type="radio"
                                  onChange={() => onChange(true)}
                                  checked={value === true}
                                />
                              </label>
                              <label>
                                No{" "}
                                <input
                                  id="grid-text-1"
                                  type="radio"
                                  onChange={() => onChange(false)}
                                  checked={value === false}
                                />
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
                      <div className="w-full md:w-full px-3 mb-6">
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
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-text-1"
                              >
                                I understand that if I am more than 10 min late
                                to my time to play, I will be automatically
                                eliminated. This is to ensure that the
                                tournament runs smoothly.
                                <span className="text-red-600">*</span>
                              </label>
                              <label>
                                Yes{" "}
                                <input
                                  className="mr-10"
                                  id="grid-text-1"
                                  type="radio"
                                  onChange={() => onChange(true)}
                                  checked={value === true}
                                />
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
                      <div className="flex justify-end">
                        <button
                          className="appearance-none bg-gray-200 text-gray-900 px-2 py-1 shadow-sm border border-gray-400 rounded-md mr-3"
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
      </ProtectedRoute>
    </div>
  );
}
