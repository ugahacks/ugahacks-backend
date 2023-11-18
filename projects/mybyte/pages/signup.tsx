import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import Image from "next/image";
import { ReactSelectObject } from "../interfaces/react-select";

import googleLogo from "../public/googleLogo.svg";
import githubLogo from "../public/githubLogo.svg";
import AlertCard from "../components/AlertCard";

interface SignupType {
  email: string;
  first_name: string;
  last_name: string;
  school: string;
  password: string;
  password_confirm: string;
}

const SignupPage = () => {
  const { signUp, logInWithGoogle, logInWithGithub } = useAuth();
  const router = useRouter();

  const methods = useForm<SignupType>({ mode: "onBlur" });
  const [alert, setAlert] = useState({ show: false, message: "", color: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const schoolOptions = [
    { value: "uga", label: "University of Georgia" },
    { value: "gt", label: "Georgia Tech" },
    { value: "georgia-state", label: "Georgia State" },
    { value: "georgia-college", label: "Georgia College" },
    { value: "ucf", label: "University of Central Florida" },
    { value: "stanford", label: "Stanford University" },
    { value: "other", label: "Other" },
  ];

  const onSubmit = async (data: SignupType) => {
    try {
      let schOpt = schoolOptions.find((item) => {
        return item.label === data.school;
      });
      let school =
        schOpt === undefined || schOpt === null ? data.school : schOpt.value;
      await signUp(
        data.first_name,
        data.last_name,
        data.email,
        data.password,
        school
      );
      router.push("/emailVerification");
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        console.log(err.code);
        console.log(err.name);
        if (err.code == "auth/email-already-in-use") {
          setAlert({
            show: true,
            message:
              "This email is already registered with us, please login using that email",
            color: "#FF3131",
          });
          router.push("/login");
        } else if (err.code == "auth/weak-password") {
          // at least 6 characters long
        }
      }
      console.log(err.message);
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

  const onSubmitGithub = async () => {
    try {
      await logInWithGithub();
    } catch (error: any) {
      let errorMessage = error.code;
      if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "Account exists with different credentials. Please sign in using the correct method or contact tech@ugahacks.com for assistance.";
      }
      setAlert({
        show: true,
        message: errorMessage,
        color: "#FF3131",
      });
      console.log(error.message);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 520);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="sign-up-form container mx-auto w-[90%] sm:w-96">
      <h2 className="px-12 mt-8 text-center text-2xl font-semibold inter">
        Sign up for an account
      </h2>
      <div className="mt-8">
        <div className="mt-4 grid space-y-4 px-4">
          <button
            className="group h-12 px-6 rounded-full bg-[#F8F8F8] transition duration-300 focus:bg-primary-50 active:bg-primary-100"
            onClick={onSubmitGoogle}
          >
            <div className="relative flex items-center space-x-2 justify-center">
              <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-primary-600 sm:text-base">
                Sign in with Google
              </span>
              <Image src={googleLogo} className="w-5" alt="google logo" />
            </div>
          </button>

          <button
            className="group h-12 px-6 rounded-full bg-[#F8F8F8] transition duration-300 focus:bg-primary-50 active:bg-primary-100"
            onClick={onSubmitGithub}
          >
            <div className="relative flex items-center space-x-2 justify-center">
              <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-primary-600 sm:text-base">
                Sign in with GitHub
              </span>
              <Image src={githubLogo} className="w-5" alt="google logo" />
            </div>
          </button>
        </div>
        <div className="relative flex py-5 items-center space-x-1">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="flex-shrink text-bold inter text-sm">or</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <FormProvider {...methods}>
          <form
            action=""
            className="mx-auto mb-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  Email
                </label>
              </div>

              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  First Name
                </label>
              </div>

              <input
                type="text"
                {...register("first_name", {
                  required: "First name is required",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.first_name && (
                <p className="text-red-500">{errors.first_name.message}</p>
              )}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  Last Name
                </label>
              </div>

              <input
                type="text"
                {...register("last_name", {
                  required: "Last name is required",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.last_name && (
                <p className="text-red-500">{errors.last_name.message}</p>
              )}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  School
                </label>
              </div>

              <input
                type="text"
                list="data"
                {...register("school", {
                  required: "School is required",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              <datalist id="data">
                {schoolOptions.map((item, key) => (
                  <option key={key} data-value={item.value} label={item.label}>
                    {item.label}
                  </option>
                ))}
              </datalist>
              {errors.last_name && (
                <p className="text-red-500">{errors.last_name.message}</p>
              )}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  Password
                </label>
              </div>

              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 inter font-bold">
                  Confirm Password
                </label>
              </div>

              <input
                type="password"
                {...register("password_confirm", {
                  required: "Verify your password",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.password_confirm && (
                <p className="text-red-500">
                  {errors.password_confirm.message}
                </p>
              )}
            </div>
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className={`h-12 text-center hover:text-white w-full bg-[#F8F8F8] rounded-md hover:shadow-lg hover:bg-primary-500 active:bg-primary-950 text-lg transition`}
              >
                <p className="capitalize font-normal">Sign up</p>
              </button>
            </div>
            <div className="flex justify-between text-sm text-primary-500 mt-2 pb-4">
              <Link href="/login">Already have an account?</Link>
            </div>
          </form>
        </FormProvider>
      </div>
      <AlertCard
        show={alert.show}
        alert_title="Login Error:"
        message={alert.message}
        color={alert.color}
        isMobile={isMobile}
        onClose={() => setAlert({ show: false, message: "", color: "" })}
      />
    </div>
  );
};

export default SignupPage;
