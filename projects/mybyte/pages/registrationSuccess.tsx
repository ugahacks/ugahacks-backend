import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ConfettiAnimation from "../components/Confetti";

export default function RegistrationSuccess() {
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
    <div>
      <ConfettiAnimation />
      {isMobile ? (
        <div className="inset-0 flex overflow-hidden font-mono">
          <div className="container mx-auto mt-12 rounded-md">
            <div className="flex flex-col items-center">
              <Image
                src="/byte drums.png"
                alt="circle"
                width={200}
                height={200}
              />
              <div className="px-4 mt-4 text-center text-lg sm:px-12">
                <h1 className="text-4xl">Congratulations!</h1>
                <p className="pt-2">
                  You have successfully registered for UGAHacks X! Let&apos;s get this party started!
                  😃
                </p>
              </div>
            </div>

            <div className="mt-8 mb-8">
              <div className="flex justify-center text-lg">
                <p className="text-primary-500 hover:underline underline-offset-2 cursor-pointer">
                  <Link href="/dashboard">Return to dashboard</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="inset-0 flex overflow-hidden font-mono">
          <div className="sign-up-form container mx-auto max-w-min mt-12 rounded-md">
            <div className="flex flex-col items-center">
              <Image
                src="/byte drums.png"
                alt="circle"
                width={400}
                height={400}
              />
              <div className="px-12 mt-8 text-center text-xl">
                <h1 className="text-6xl">Congratulations!</h1>
                <h2 className="text-xl pt-4">
                  You have successfully registered for UGAHacks X!
                  Let&apos;s get this party started!
                  😃
                </h2>
              </div>
            </div>

            <div className="mt-8 mb-8">
              <div className="flex justify-center text-xl">
                <p className="text-primary-500 hover:underline underline-offset-2 cursor-pointer">
                  <Link href="/dashboard">Return to dashboard</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
