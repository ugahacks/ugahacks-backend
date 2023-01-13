import Link from "next/link";
import React from "react";

export default function EmailVerification() {
  return (
    <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
      <h2 className="px-12 mt-8 text-center text-xl">
        Thank you for registering with us! Please verify your email to continue.
        A verification link has been sent to your email.
      </h2>

      <div className="mt-8 mb-8">
        <div className="flex justify-center text-xl">
          <p className="text-cyan-500">
            <Link href="/login">Go to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
