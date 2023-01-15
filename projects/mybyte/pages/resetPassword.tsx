import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import LoginError from "../components/loginError";
import { FirebaseError } from "firebase/app";



export default function ResetPassword() {
  interface resetPasswordForm {
    email: string;
  }

  let [show, setShow] = useState(false);
  let [text, setText] = useState("");

  const router = useRouter();
  const { resetPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<resetPasswordForm>();
  const onSubmit: SubmitHandler<resetPasswordForm> = (data) => {
    resetPassword(data.email, (error: FirebaseError) => {
      if (error.code === "auth/user-not-found") {
        setShow(true);
        setText("Sorry, we don't recognize this email. Please sign up.");
      }
    }, () => {
      router.push("/resetPasswordSuccess"); // TODO: Add whether the password reset was sent successfully (OPTIONAL)
    });
  };

  return (
    <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 bg-white">
      <h2 className="px-12 mt-8 text-center text-2xl font-semibold text-[#DC4141]">
        Password Reset
      </h2>
      <LoginError show={show} text={text}></LoginError>
      <form className="mx-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <label htmlFor="" className="block mb-3 font-sans text-[#DC4141]">
              Email
            </label>
          </div>

          <input
            {...register("email", {
              required:
                "Please enter your email address to reset your password",
            })}
            type="text"
            className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
          />
          {errors.email && (
            <p className="text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-center pt-8 mb-4">
          <button
            type="submit"
            className={`h-12 text-center w-2/3 bg-[#DC4141] border-2 rounded-md hover:shadow-lg hover:bg-gray-800 text-lg transition`}
          >
            <p className="capitalize text-white font-normal">Submit</p>
          </button>
        </div>
      </form>
    </div>
  );
}
