import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import { AuthContextProvider } from "../context/AuthContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname: page } = useRouter();
  
  const gray_bg_routes = [
    "/login",
    "/signup",
    "/resetPassword",
    "/resetPasswordSuccess",
    "/emailVerification",
    "events/ESportsRegister",
  ];
  const hacks_8_bg_routes = [
    "/registrationSuccess",
    "/eSportsRegistrationSuccess",
    "/presenterRegistrationSuccess",
    "/team",
  ];

  const no_navbar_routes = [
    "/info"
  ];

  return (
    <AuthContextProvider>
      {no_navbar_routes.includes(page) ? (
        <Component {...pageProps} />
      ) : (
      <Navbar>
        <Component {...pageProps} />
      </Navbar>
      )}
    </AuthContextProvider>
  );
}

export default MyApp;
