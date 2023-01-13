import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import hacks8Byte from "../public/byte_mini.png";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>MyByte</title>
        <link rel="icon" href="/UGAHacks_General_Byte.png" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <Image
          src={hacks8Byte}
          alt="img-blur-shadow"
          className="aspect-[694/620]"
        />
        <h1 className="text-6xl font-bold">Welcome to MyByte!</h1>
        <p className="text-xl pt-4 font-bold">
          UGA Hacks Registration Platform
        </p>

        <p className="mt-3 text-2xl">
          Get started by{" "}
          <Link href="/login" className="text-sky-500">
            logging in!
          </Link>
        </p>
        <button></button>
      </main>

      {/* <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </a>
      </footer> */}
    </div>
  );
};

export default Home;
