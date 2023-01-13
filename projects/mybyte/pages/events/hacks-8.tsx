import React, { useEffect } from "react";
import { Card } from "@material-tailwind/react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import RegisterCard, { ApplicationPaths } from "../../components/RegisterCard";
import { Events } from "../../enums/events";
import ColorCode from "../../components/colorCode";

const Hacks8 = () => {
  const { userInfo } = useAuth();

  const application_path: ApplicationPaths = {
    application_type: "Participant 🐶💻",
    deadline: "February 1st, 2023",
    page: "/register",
    disabled: Events.hacks8 in userInfo.registered,
    image: "/byte_mini.png",
  };

  const e_sports_path: ApplicationPaths = {
    application_type: "E-Sports 🎮",
    deadline: "February 1st, 2022",
    page: "/events/ESportsRegister",
    disabled: Events.e_sports_8 in userInfo.registered,
    image: "/Transparent_esports.png",
  };

  return (
    <div className="bg-cover bg-[url('/UGAHacks8TanBG.png')]">
      <ProtectedRoute>
        <div className="py-2 container mx-auto">
          <Card className="w-full bg-opacity-75 rounded-full">
            <div className="text-gray-600 px-6 py-12 mt-2 mx-auto text-center">
              <h2 className="text-3xl font-bold text-center">
                Hey {userInfo.first_name}, this is UGA Hacks 8 Registration Page
                🚀
              </h2>
              <h2 className="text-2xl text-center mt-4">
                We&apos;re excited that you are participating in UGA Hacks 8! We
                would love to see you at the event! 🤗
              </h2>
              <h2 className="text-2xl text-center">
                If you have any questions, please send us an email at
                hello@ugahacks.com!
              </h2>
              <div className="mt-6 text-2xl text-black-600 font-bold">
                STATUS: <ColorCode registered={userInfo.registered}></ColorCode>
              </div>
            </div>
          </Card>
          <h1 className="text-2xl mt-12">
            <b>Application Paths:</b>
          </h1>
          <div className="flex pt-5">
            <div className="flex-1 space-x-4">
              <button disabled={Events.hacks8 in userInfo.registered}>
                <RegisterCard {...application_path} />
              </button>
              <button disabled={Events.hacks8 in userInfo.registered}>
                <RegisterCard {...e_sports_path} />
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default Hacks8;
