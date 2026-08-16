import React, { useEffect, useState } from "react";
import Event, { EventDetail } from "../components/Event";
import ProtectedRoute from "../components/ProtectedRoute";
import RegisterCard, { ApplicationPaths } from "../components/RegisterCard";
import { useAuth } from "../context/AuthContext";
import { Events } from "../enums/events";
import { EventStatus } from "../enums/eventStatus";

const EventPage = () => {
  const { userInfo, getFirstName, getRegisteredEvents } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState({});

  const application_path: ApplicationPaths = {
    application_type: "Participant",
    deadline: "October 24th, 2024",
    page: "/register",
    disabled: userInfo.registered?.[Events.cadathon] === true,
    image: "/byte_mini.png",
  };

  useEffect(() => {
    async function get_first_name() {
      const first_name = await getFirstName();
      setFirstName(first_name ?? "");
    }
    async function get_registered_events() {
      const registered_events = await getRegisteredEvents();
      setRegisteredEvents(registered_events);
    }
    get_first_name();
    get_registered_events();
  }, [getFirstName, getRegisteredEvents]);

  return (
    <ProtectedRoute>
      <div className="py-2 container mx-auto">
        <div className="text-gray-600 px-12 py-24 mt-24 mx-auto">
          <h2 className="text-2xl font-semibold">Hey {firstName}, this is </h2>
          STATUS:{" "}
          {(registeredEvents as Record<string, boolean | null>)?.[Events.cadathon] === true
            ? EventStatus.Registered
            : EventStatus.NotRegistered}
        </div>
        <h1 className="text-2xl">
          <b>Application Paths:</b>
        </h1>
        <div className="flex">
          <div className="flex-1">
            <RegisterCard {...application_path} />
          </div>
          <div className="flex-1">
            <RegisterCard {...application_path} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EventPage;
