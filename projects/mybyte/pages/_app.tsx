import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import { AuthContextProvider } from "../context/AuthContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname: page } = useRouter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <AuthContextProvider>
      <Navbar>
        <Component {...pageProps} />
      </Navbar>
    </AuthContextProvider>
  );
}

export default MyApp;
