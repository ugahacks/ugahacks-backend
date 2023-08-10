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
    <div className="sign-up-form container mx-auto w-[90%] sm:w-96 flex-initial pt-20 smh:pt-10 md:pt-5">
      <h2 className="px-12 text-center text-2xl font-semibold inter">
        Log in to your account
      </h2>

      <div className="mt-8">
        <div className="mt-4 grid space-y-4 px-4">
          <button
            className="group h-12 px-6 rounded-full bg-[#F8F8F8] transition duration-300 focus:bg-purple-50 active:bg-purple-100"
            onClick={onSubmitGoogle}
          >
            <div className="relative flex items-center space-x-2 justify-center">
              <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-purple-600 sm:text-base">
                Sign in with Google
              </span>
              <Image
                src={googleLogo}
                className="w-5"
                alt="google logo"
              />
            </div>
          </button>
        </div>
        <div className="relative flex py-5 items-center space-x-1">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="flex-shrink text-bold inter text-sm">or</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <LoginError show={show} text={text}></LoginError>
        <FormProvider {...methods}>
          <form
            action=""
            className="mx-auto mb-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="" className="block mb-3 inter">
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
                  className="block mb-3 inter"
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
                className={`h-12 text-center w-full bg-purple-700 rounded-md hover:shadow-lg hover:bg-purple-800 active:bg-purple-950 text-lg transition`}
              >
                <p className="capitalize text-white font-normal">Log in</p>
              </button>
            </div>
            <div className="flex justify-between text-sm text-purple-400 mt-2">
                <Link href="/resetPassword">Forgot your password?</Link>
                <Link href="/signup">Create account</Link>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LoginPage;
