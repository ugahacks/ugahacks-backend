import ReactDOMServer from "react-dom/server";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import hacks8Byte from "../public/byte_mini.png";
import Circle from "../components/Circle";

const Home: NextPage = () => {
  const mainPage = (
    <>
      <Head>
        <title>MyByte</title>
        <link rel="icon" href="/UGAHacks_General_Byte.png" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center pt-28 smh:pt-0 inter">
        <div className="flex flex-col items-start justify-start space-y-4">
          <h1 className="text-6xl font-bold text-left">MyByte</h1>
          <h1 className="text-6xl font-bold text-left">
            It&apos;s time to create.
          </h1>
          <p className="text-xl pt-4 font-bold text-left text-gray-500">
            Join your fellow hackers. Let&apos;s build the future, together.
          </p>
          <Link
            href="/login"
            className="text-white bg-primary-600 rounded-full px-8 py-2 text-lg"
          >
            Log in
          </Link>
        </div>
        {/* <Circle className="fixed -bottom-72 -right-16 hidden lg:block overflow-hidden wiggle rounded-full h-[500px] w-[500px] bg-red-500 opacity-90" /> */}
        {/* <Circle className="fixed -bottom-48 -right-48 hidden lg:block overflow-hidden wiggle2 rounded-full h-[500px] w-[500px] bg-red-500 opacity-90" /> */}

        {/* <Circle className="fixed -z-10 -top-72 -left-16 hidden lg:block overflow-hidden wiggle rounded-full h-[550px] w-[550px] bg-red-500 opacity-90" /> */}
        {/* <Circle className="fixed -z-10 -top-48 -left-48 hidden lg:block overflow-hidden wiggle2 rounded-full h-[550px] w-[550px] bg-red-500 opacity-90" /> */}
      </main>
    </>
  );
  return mainPage;
};

export default Home;
