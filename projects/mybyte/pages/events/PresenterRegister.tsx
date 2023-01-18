import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Card } from "@material-tailwind/react";
import { PresenterRegisterForm } from "../../interfaces/presenterRegisterForm";
import Link from "next/link";

export default function PresenterRegister() {
  const router = useRouter();
  const [textCount, setTextCount] = useState(0);
  const { storeWorkshopRegistrationInformation } = useAuth();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PresenterRegisterForm>({
    defaultValues: {},
  });
  const onSubmit: SubmitHandler<PresenterRegisterForm> = (data) => {
    storeWorkshopRegistrationInformation(data);
    // router.push("/eSportsRegistrationSuccess");
    router.push("/presenterRegistrationSuccess");
  };

  function validateFileInput(value: FileList) {
    // No need to validate anything
    if (value.length == 0) {
      return true;
    }

    const fileRegex = /^.*\.(doc|docx|pdf|pptx|jpg|png)$/i;

    return fileRegex.test(value[0]?.name);
  }

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
                        Hacker Workshop / Presentation Register:
                      </h2>
                      <h2 className="text-l text-gray-900 mt-4">
                        This year we will be accepting participants to host a
                        presentation or a workshop at our hackathon! This can be
                        anything technical to having a talk regarding certain
                        technical topics! 💡
                      </h2>
                      <h2 className="text-l text-gray-900 mt-4">
                        This is a great opportunity to speak to students
                        participating at our hackathon about your passions and
                        help other students learn! This is an exciting and
                        rewarding opportunity that we hope you consider
                        presenting at our hackathon! 😁
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
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor="grid-text-1"
                        >
                          What kind of topics are you planning on covering in
                          your workshop/presentation?
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("topic", {
                            required: "Please enter a response",
                          })}
                          id="grid-text-1"
                          type="text"
                          maxLength={100}
                          placeholder="e.g. AI, Firebase, Python, Job Search etc."
                        />
                        {errors.topic && (
                          <p className="text-red-400">{errors.topic.message}</p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor="grid-text-1"
                        >
                          What will be your presentation / workshop name?
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("workshopName", {
                            required: "Please enter a response",
                          })}
                          id="grid-text-1"
                          type="text"
                          maxLength={200}
                          placeholder="e.g. Building a website with firebase"
                        />
                        {errors.workshopName && (
                          <p className="text-red-400">
                            {errors.workshopName.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6 mt-6">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          Enter description of your presentation / workshop.
                          Also state whether this will be more discussion based
                          or a more hands-on follow-along tutorial:
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          className="bg-gray-100 rounded-md border leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                          {...register("workshopDetails", {
                            required: "Please enter a response",
                          })}
                          maxLength={750}
                          onChange={(e) => setTextCount(e.target.value.length)}
                        ></textarea>
                        <p>{textCount}/750</p>
                        {errors.workshopDetails && (
                          <p className="text-red-400">
                            {errors.workshopDetails.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6 mt-6">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          Enter your preferred times to present between 02/03
                          8:00 PM - 02/04 11:59 PM:
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          className="bg-gray-100 rounded-md border leading-normal resize-none w-full h-20 py-2 px-3 shadow-inner border border-gray-400 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                          {...register("preferredTimes", {
                            required: "Please enter a response",
                          })}
                          maxLength={500}
                        ></textarea>
                        {errors.preferredTimes && (
                          <p className="text-red-400">
                            {errors.preferredTimes.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          [Optional] Presentation Slides or Files
                        </label>
                        <input
                          className="appearance-none block w-full bg-white text-gray-700 border border-gray-400 shadow-inner rounded-md py-3 px-4 leading-tight focus:outline-none  focus:border-gray-500"
                          {...register("slides", {
                            validate: (value) =>
                              validateFileInput(value) ||
                              "Please submit your slide/file in .pptx, .jpg, .png, .pdf, or .doc format",
                          })}
                          type="file"
                        />
                        {errors.slides && (
                          <p className="text-red-400">
                            {errors.slides.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full md:w-full px-3 mb-6">
                        <Controller
                          control={control}
                          name="isOnline"
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
                                Please let us know if you can present in-person.
                                We are prioritizing in-person presentation /
                                workshops but we would still want you to apply
                                even if you cannot make it in-person!
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
                        {errors.isOnline && (
                          <p className="text-red-400">
                            {errors.isOnline.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <button className="appearance-none bg-gray-200 text-gray-900 px-2 py-1 shadow-sm border border-gray-400 rounded-md mr-3">
                          <Link href="/events/hacks-8">Go Back</Link>
                        </button>
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
