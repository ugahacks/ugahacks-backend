import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import hacks8Byte from "../public/byte_mini.png";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 font-inter">
      
    
      <Head>
        <title>MyByte</title>
        <link rel="icon" href="/UGAHacks_General_Byte.png" />
      </Head>
     
        <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
          <div className="flex flex-col items-start justify-start space-y-4" >
            <h1 className="text-6xl font-bold text-left">MyByte</h1>
            <h1 className="text-6xl font-bold text-left">It&apos;s time to create.</h1>
            <p className="text-xl pt-4 font-bold text-left text-gray-500">
              Join your fellow hackers. Let&apos;s build the future, together.
            </p>
            <Link href="/login" className="text-white bg-purple-600 rounded-full px-6 py-2 text-lg">
              Log in
            </Link>
          </div>


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
