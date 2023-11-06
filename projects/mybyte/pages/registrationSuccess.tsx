import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function RegistrationSuccess() {
  return (
    <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
      <div className="flex flex-col items-center">
        <Image src="/byte soaring.png" alt="circle" width={300} height={300} />
        <div className="px-12 mt-8 text-center text-xl font-inter">
          {" "}
          <h2>
            <span className="text-3xl">Congratulations!</span>
          </h2>
          <h2 className="font-mono text-lg pt-2">
            You have successfully registered for UGAHacks 9!
          </h2>
        </div>
      </div>

      <div className="mt-8 mb-8">
        <div className="flex justify-center text-xl">
          <p className="text-cyan-500">
            <Link href="/dashboard">Return to dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
