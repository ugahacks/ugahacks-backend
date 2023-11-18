import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/router";

type FormData = {
  first_name: string;
  last_name: string;
};

const EditProfile: React.FC = () => {
  const { user, updateProfile, storeFirstAndLastName } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await storeFirstAndLastName(data.first_name, data.last_name);
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const errorStyles = "text-red-500 font-mono text-xs m-1";

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="mx-auto mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Complete Your Profile
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
            <div className="mb-4">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-600"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                {...register("first_name", {
                  required: "Please enter your first name",
                  pattern: {
                    value: /^[a-z ,.'-]+$/i,
                    message: "Contains invalid characters",
                  },
                })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {errors.first_name ? (
                <>
                  {errors.first_name.type === "required" && (
                    <p className={errorStyles}>{errors.first_name.message}</p>
                  )}
                  {errors.first_name.type === "pattern" && (
                    <p className={errorStyles}>{errors.first_name.message}</p>
                  )}
                </>
              ) : null}
            </div>

            <div className="mb-4">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-600"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                {...register("last_name", {
                  required: "Please enter your first name",
                  pattern: {
                    value: /^[a-z ,.'-]+$/i,
                    message: "Contains invalid characters",
                  },
                })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {errors.last_name ? (
                <>
                  {errors.last_name.type === "required" && (
                    <p className={errorStyles}>{errors.last_name.message}</p>
                  )}
                  {errors.last_name.type === "pattern" && (
                    <p className={errorStyles}>{errors.last_name.message}</p>
                  )}
                </>
              ) : null}
            </div>

            <button
              type="submit"
              className="bg-red-500 text-white py-2 px-4 rounded-md"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditProfile;
