import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import greenEmailIcon from "../public/emailVerificationGreenIcon.png";
import Image from "next/image";
import Typewriter from "typewriter-effect";

export default function EmailVerification() {
  const router = useRouter();
  const { email } = router.query;

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <div className="container mx-auto md:w-[600px] text-gray-700 p-4">
      <div className="flex items-center justify-center mb-4">
        <Image src={greenEmailIcon} className="w-24" alt="google logo" />
      </div>
      <div className="text-6xl font-inter font-bold text-gray-700 mb-4 text-center">
        <h1>Verify your email</h1>
      </div>

      <div className="font-mono mb-10">
        <p className="text-lg text-center">
          Thanks for registering an account with us. Please verify your email to
          continue. A verification link has been sent to{" "}
          <span className="font-bold">{email}</span>
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleClick}
          type="submit"
          className={`h-10 text-center hover:text-white w-80 bg-[#F8F8F8] rounded-md hover:shadow-lg hover:bg-primary-500 active:bg-primary-950 text-lg transition`}
        >
          <p className="font-normal">Return to login</p>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-center text-sm font-mono">
          Questions? Email us at{" "}
          <Link href="mailto:tech@ugahacks.com" className="underline">
            tech@ugahacks.com
          </Link>
        </p>
      </div>
    </div>
  );
}
