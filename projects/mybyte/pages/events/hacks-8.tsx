import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import Event, { EventDetail } from "../../components/Event";
import RegisterCard, { ApplicationPaths } from "../../components/RegisterCard";
import { Events } from "../../enums/events";
import { EventStatus } from "../../enums/eventStatus";

const Hacks8 = () => {
  const { user, userInfo, getFirstName, getRegisteredEvents, setCurrEvent } =
    useAuth();

  const application_path: ApplicationPaths = {
    application_type: "Participant",
    deadline: "December 31st, 2022",
    page: "/register",
    disabled: Events.hacks8 in userInfo.registered,
  };

  const e_sports_path: ApplicationPaths = {
    application_type: "E-Sports",
    deadline: "December 31st, 2022",
    page: "/register",
    disabled: Events.hacks8 in userInfo.registered,
  };

  useEffect(() => {
    setCurrEvent(Events.hacks8);
  }, [setCurrEvent]);

  // useEffect(() => {
  //   async function get_first_name() {
  //     const first_name = await getFirstName();
  //     setFirstName(first_name)
  //   }
  //   async function get_registered_events() {
  //     const registered_events = await getRegisteredEvents();
  //     setRegisteredEvents(registered_events)
  //   }
  //   get_first_name();
  //   get_registered_events();
  // }, []);

  return (
    <ProtectedRoute>
      <div className="py-2 container mx-auto">
        <Card className="w-full bg-opacity-75 rounded-full">
          <div className="text-gray-600 px-6 py-12 mt-2 mx-auto text-center">
            <h2 className="text-3xl font-bold text-center">
              Hey {userInfo.first_name}, this is UGA Hacks 8 Registration Page
            </h2>
            <div className="mt-6 text-xl text-black-600 font-bold">
              STATUS:{" "}
              <span className="bg-yellow-200">
                {Events.hacks8 in userInfo.registered
                  ? EventStatus.Registered
                  : EventStatus.NotRegistered}
              </span>
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
  );
};

export default Hacks8;
