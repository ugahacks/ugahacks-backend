import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import googleLogo from "../public/googleLogo.svg";
import LoginError from "../components/loginError";

let show = false;
let text = "";

const setError = (showLocal: boolean, textLocal: string) => {
  show = showLocal;
  text = textLocal;
};

interface LoginType {
  email: string;
  password: string;
}
const LoginPage = () => {
  const { logIn, logInWithGoogle, user } = useAuth();
  const router = useRouter();

  const methods = useForm<LoginType>({ mode: "onBlur" });

  // useEffect(() => {
  //   document.querySelector("body")?.classList.add("bg-[#e3e3e3]");
  // });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (user.uid != null) {
      router.push("/dashboard");
    }
  }, [router, user]);

  const onSubmit = async (data: LoginType) => {
    try {
      const logInSuccessful = await logIn(data.email, data.password);
      if (logInSuccessful) {
        router.push("/dashboard");
      } else {
        setError(true, "Log in unsuccessful, make sure your email is verified");
      }
    } catch (error: any) {
      setError(true, "Email/Password does not exist");
      console.log(error.message);
    }
  };

  const onSubmitGoogle = async () => {
    try {
      await logInWithGoogle();
      router.push("/dashboard");
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div className="sign-up-form container mx-auto w-96 mt-6 border-2 border-gray-400 overflow-auto bg-white">
      <h2 className="px-12 mt-8 text-center text-2xl font-semibold text-[#DC4141]">
        Log In
      </h2>

      <div className="mt-8">
        <div className="mt-4 grid space-y-4 px-4">
          <button
            className="group h-12 px-6 border-2 border-gray-300 rounded-full transition duration-300 
 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100"
            onClick={onSubmitGoogle}
          >
            <div className="relative flex items-center space-x-4 justify-center">
              <Image
                src={googleLogo}
                className="absolute left-0 w-5"
                alt="google logo"
              />
              <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">
                Continue with Google
              </span>
            </div>
          </button>
        </div>
        <div className="relative flex py-5 items-center px-4">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <LoginError show={show} text={text}></LoginError>
        <FormProvider {...methods}>
          <form
            action=""
            className="w-80 mx-auto pb-12 px-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="" className="block mb-3 font-sans text-[#DC4141]">
                Email
              </label>
            </div>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
            />
            {errors.email && (
              <p className="text-red-400">{errors.email.message}</p>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label
                  htmlFor=""
                  className="block mb-3 font-sans text-[#DC4141]"
                >
                  Password
                </label>
              </div>

              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.password && (
                <p className="text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className={`h-12 text-center w-2/3 bg-[#DC4141] border-2 rounded-md hover:shadow-lg hover:bg-gray-800 text-lg transition`}
              >
                <p className="capitalize text-white font-normal">submit</p>
              </button>
            </div>
            <div className="flex justify-center">
              <p>
                <Link href="/resetPassword">Forgot Password</Link>
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LoginPage;
