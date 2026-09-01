import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ConfettiAnimation from "../components/Confetti";

export default function RegistrationSuccess() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const eventParam = Array.isArray(router.query.event)
    ? router.query.event[0]
    : router.query.event;
  const isCadathon = eventParam === "cadathon";
  const eventName = isCadathon ? "UGA Cadathon" : "UGAHacks 12";
  const imageSrc = isCadathon ? "/Racerbyte.png" : "/Detectivebyte.png";
  const imageAlt = isCadathon ? "Racer Byte" : "Detective Byte";

  useEffect(() => {
    setIsMobile(window.innerWidth <= 520);

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
          <div className="container mx-auto mt-6 rounded-md">
            <div className="flex flex-col items-center">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={200}
                height={200}
              />
              <div className="px-4 mt-4 text-center text-lg sm:px-12">
                <h1 className="text-4xl">Congratulations!</h1>
                <p className="pt-2">
                  You have successfully registered for {eventName}! Let&apos;s build something great 📐
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
          <div className="sign-up-form container mx-auto max-w-min mt-6 rounded-md">
            <div className="flex flex-col items-center">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={300}
                height={300}
              />
              <div className="px-8 mt-8 text-center text-xl">
                <h1 className="text-6xl">Congratulations!</h1>
                <h2 className="text-xl pt-4">
                  You have successfully registered for {eventName}! Let&apos;s build something great 📐
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
