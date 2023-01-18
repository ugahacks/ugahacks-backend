import Link from "next/link";
import React from "react";

export default function PresenterRegistrationSuccess() {
  return (
    <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
      <h2 className="px-12 mt-8 text-center text-xl">
        Congratulations! You have successfully applied to host a presentation or
        workshop for UGA Hacks! :) 🥳
      </h2>
      <h2 className="px-12 mt-8 text-center text-xl">
        <span className="font-bold text-[#DC4141]">NOTE: </span>You must
        register for the &quot;Participant&quot; track to be able to host a
        presentation or workshop. Please register for the
        &quot;Participant&quot; track under Application Paths to host a workshop
        or event.
      </h2>

      <div className="mt-8 mb-8">
        <div className="flex justify-center text-xl">
          <p className="text-cyan-500">
            <Link href="/events/hacks-8">Return to Hacks 8</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
