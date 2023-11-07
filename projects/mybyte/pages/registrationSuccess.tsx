import Link from "next/link";
import React from "react";
import Image from "next/image";
import ConfettiAnimation from "../components/Confetti";

// TODO: Go back and make this section responsive for smaller widths
export default function RegistrationSuccess() {
  return (
    <div>
      <div className="relative">
        <ConfettiAnimation />
      </div>

      <div className="absolute inset-0 flex pt-16 overflow-hidden font-mono">
        <div className="sign-up-form container mx-auto max-w-min mt-12 rounded-md">
          <div className="flex flex-col items-center">
            <Image
              src="/byte soaring.png"
              alt="circle"
              width={400}
              height={400}
            />
            <div className="px-12 mt-8 text-center text-xl">
              {" "}
              <h1 className="text-6xl">Congratulations!</h1>
              <h2 className="text-xl pt-4">
                You have successfully registered for UGAHacks 9!
              </h2>
              <h2 className="text-xl">See you soon! 😃</h2>
            </div>
          </div>

          <div className="mt-8 mb-8">
            <div className="flex justify-center text-xl">
              <p className="text-primary-500 hover:underline underline-offset-2 cursor-pointer">
                <Link href="/dashboard">return to dashboard</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
