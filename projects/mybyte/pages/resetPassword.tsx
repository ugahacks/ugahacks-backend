import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import AlertCard from "../components/AlertCard";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  interface resetPasswordForm {
    email: string;
  }

  const router = useRouter();
  const { resetPassword, isEmailInUse } = useAuth();

  const [alert, setAlert] = useState({ show: false, message: "", color: "" });
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const methods = useForm<resetPasswordForm>({ mode: "onBlur" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<resetPasswordForm> = async (data) => {
    try {
      setIsButtonDisabled(true);
      await resetPassword(data.email);
      setAlert({
        show: true,
        message: `An email was sent to ${data.email} to allow you to reset your password.`,
        color: "bg-[#50C878]",
      });
    } catch (error: any) {
      let errorMessage = "";
      if (error.code === "auth/user-not-found")
        errorMessage = `There is no account associated with ${data.email}.`;
      else
        errorMessage = `An error has occured, please contact tech@ugahacks.com if the issue persists. Error code: ${error.code}`;

      setAlert({
        show: true,
        message: errorMessage,
        color: "bg-[#FF3131]",
      });
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  const originalText = "password?";
  const dictionary = "0123456789qwertyuiopasdfghjklzxcvbnm!?></\\a`~+*=@#$%";
  const resetStep = useMemo(

    () => ["p##s#o3d?", "p#ss#o3d?", "p#ss#ord?", "p##swo3d?"], []);
  const [randomizedString, setRandomizedString] = useState("p##s#o3d?");
  let id: any = undefined;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animateText = useCallback(() => {
    // start the scrambling interval
    intervalRef.current = setInterval(() => {
      const newString = originalText
        .split("")
        .map(
          () => dictionary[Math.floor(Math.random() * dictionary.length)]
        )
        .join("");

      setRandomizedString(newString);
    }, 100);

    setTimeout(() => {
      // stop scrambling after 5s
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // then step through resetStep and end on originalText
      setTimeout(() => {
        setRandomizedString(resetStep[0]);
        setTimeout(() => {
          setRandomizedString(resetStep[1]);
          setTimeout(() => {
            setRandomizedString(resetStep[2]);
            setTimeout(() => {
              setRandomizedString(resetStep[3]);
              setRandomizedString(originalText);
            }, 100);
          }, 100);
        }, 100);
      }, 100);

      // loop the animation
      setTimeout(() => {
        animateText();
      }, 10000);
    }, 5000);
  }, [dictionary, originalText, resetStep]);

  useEffect(() => {
    animateText();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [animateText]);

  return (
    <div className="flex font-inter items-center justify-center mb-[80px] flex-col md:flex-row">
      <div className="w-[350px] md:w-[450px]">
        <div className="mb-5">
          <h1 className="text-6xl md:text-7xl font-bold leading-[70px] text-center md:text-left">
            Forgot your <span>{randomizedString}</span>
          </h1>
        </div>
        <div className="w-fit">
          <p className="font-mono text-md md:text-md text-gray-500 text-center md:text-left">
            Enter the email address that you used to register. We&apos;ll send
            you an email with a link to reset your password.
          </p>
        </div>
      </div>
      <div className="w-fit ml-0 md:ml-10">
        <FormProvider {...methods}>
          <form
            action=""
            className="w-72 md:w-96"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor="" className="block mb-3 font-mono">
                  Email
                </label>
              </div>
              <input
                type="email"
                placeholder="byte@ugahacks.com"
                {...register("email", {
                  required:
                    "Please enter your email address to reset your password",
                })}
                className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
              />
              {errors.email && (
                <p className="text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-center pt-8 mb-4">
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`h-10 text-gray-600 text-center w-full bg-[#F8F8F8] rounded-md hover:shadow-lg hover:bg-red-500 text-lg transition hover:text-white`}
              >
                Submit
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
      <AlertCard
        className="text-left"
        show={alert.show}
        message={alert.message}
        color={alert.color}
        onClose={() => setAlert({ show: false, message: "", color: "" })}
        position="bottom-right"
      />
    </div>
  );
}
