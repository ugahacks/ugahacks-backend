import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

const InsertDevPost = () => {
  const { giveTeamPoints } = useAuth();
  const methods = useForm<{ devPostLink: string }>({ mode: "onBlur" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: { devPostLink: string }) => {
    await giveTeamPoints();
  };

  return (
    <ProtectedRoute>
      <div className="sign-up-form container mx-auto w-96 mt-6 border-2 border-gray-400 overflow-auto bg-white">
        <h2 className="px-12 mt-8 text-center text-2xl font-semibold text-[#DC4141]">
          Submit your Devpost Link
        </h2>
        <FormProvider {...methods}>
          <form
            action=""
            className="w-80 mx-auto pb-12 px-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="" className="block mb-3 font-sans text-[#DC4141]">
                Devpost Link:
              </label>
            </div>
            <input
              type="email"
              {...register("devPostLink", { required: "Email is required" })}
              className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
            />
            {errors.devPostLink && (
              <p className="text-red-400">{errors.devPostLink.message}</p>
            )}

            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className={`h-12 text-center w-2/3 bg-[#DC4141] border-2 rounded-md hover:shadow-lg hover:bg-gray-800 text-lg transition`}
              >
                <p className="capitalize text-white font-normal">submit</p>
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ProtectedRoute>
  );
};

export default InsertDevPost;
