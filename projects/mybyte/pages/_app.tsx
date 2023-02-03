import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/navbar";
import { AuthContextProvider, useAuth } from "../context/AuthContext";
import Login from "./login";
import { useEffect } from "react";
import { useRouter } from "next/router";
import hasGrayClasses from "../util/hasGrayClasses";
import hasHacks8Class from "../util/hasHacks8Class";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname: page } = useRouter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gray_bg_routes = [
    "/login",
    "/signup",
    "/resetPassword",
    "/resetPasswordSuccess",
    "/emailVerification",
  ];
  const hacks_8_bg_routes = [
    "/registrationSuccess",
    "/eSportsRegistrationSuccess",
    "/presenterRegistrationSuccess",
    "/team",
  ];

  useEffect(() => {
    if (!hasHacks8Class() && hacks_8_bg_routes.includes(page)) {
      document.body.className += "bg-[url('/UGAHacks8TanBG.png')]";
    } else {
      document.body.classList.remove("bg-[url('/UGAHacks8TanBG.png')]");
    }
    if (!hasGrayClasses() && gray_bg_routes.includes(page)) {
      document.body.className += "bg-[#e3e3e3]";
    } else if (hasGrayClasses() && !gray_bg_routes.includes(page)) {
      document.body.classList.remove("bg-[#e3e3e3]");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <AuthContextProvider>
      <Navbar>
        <Component {...pageProps} />
      </Navbar>
    </AuthContextProvider>
  );
}

export default MyApp;
