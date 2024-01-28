import React, { useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { EventRegistered, useAuth } from "../context/AuthContext";
import AlertCard from "./AlertCard";
import EventRect, { EventDetail } from "../components/EventRect";
import { Events } from "../enums/events";

interface MobileDashboardProps {
  user: any; // Define the type for 'user' based on your application
  userInfo: any; // Define the type for 'userInfo' based on your application
  registeredEvents: any; // Define the type for 'registeredEvents' based on your application
  registeredEventKeys: string[]; // Define the type for 'registeredEventKeys' based on your application
  events: any[]; // Define the type for 'events'
  eventMap: Map<string, string>;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  user,
  userInfo,
  registeredEvents,
  registeredEventKeys,
  events,
  eventMap,
}) => {
  function openEventsRegistered(allRegisteredEvents: string[]) {
    let events = "";
    allRegisteredEvents.forEach((e: string) => {
      if (eventMap.has(e)) events += eventMap.get(e) + " ";
    });

    return events;
  }

  const [alert, setAlert] = useState({ show: false, message: "", color: "" });
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const registrationCheck = (ev: EventDetail) => {
    if (ev.key === Events.e_sports_9 && !registeredEvents.HACKS9) {
      setAlert({
        show: true,
        message:
          "Please register for UGAHacks 9 before registering for eSports 9",
        color: "bg-[#212121]",
      });
    } else if (ev.key in registeredEvents) {
      setAlert({
        show: true,
        message: "You are already registered for this event",
        color: "bg-[#50C878]",
      });
    } else if (ev.deadline < new Date()) {
      setAlert({
        show: true,
        message: "Registration for this event has closed.",
        color: "bg-[#FF3131]",
      });
    }

    let element = document.getElementById("alert-card");
    element?.classList.remove("animate-fade-in-out");
    void element?.offsetWidth;
    element?.classList.add("animate-fade-in-out");
  };

  return (
    <div className="flex py-2 flex-initial w-full text-center pb-48">
      <div className="text-gray-800 mt-4 inter">
        <h2 className="text-2xl font-semibold">
          Welcome, {userInfo.first_name + " " + userInfo.last_name}
        </h2>
        <div className="text-sm pt-3 pb-5 font-mono container">
          <p>
            This is the UGAHacks registration portal, feel free to register for
            any events below. Happy hacking!
          </p>
        </div>
        <div>
          <h2 className="font-bold text-lg text-black pt-2 pb-2">Your Stats</h2>
          <div className="overflow-hidden pb-4 flex items-center justify-center h-full">
            <QRCodeCanvas
              id="qrCode"
              size={200}
              value={user.uid}
              level={"H"}
              className="rounded-md"
            />
          </div>
        </div>
        <div className="font-mono text-sm">
          <h2>
            Name:{" "}
            <span className="font-bold">
              {userInfo.first_name} {userInfo.last_name}
            </span>
          </h2>
          <h2>
            School:{" "}
            <span className="font-bold">
              {userInfo.school != null ? userInfo.school : "N/A"}
            </span>
          </h2>
          <h2>
            Points: <span className="font-bold">{userInfo.points + "pts"}</span>
          </h2>
          <h2>
            Next Registered Event(s):{" "}
            <span className="font-bold">
              {openEventsRegistered(registeredEventKeys).length != 0 ? (
                <span className="">
                  {openEventsRegistered(registeredEventKeys)}
                </span>
              ) : (
                "N/A"
              )}
            </span>
          </h2>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-black">
            Register for events
          </h3>
          <div className="items-center justify-center h-full flex flex-wrap gap-10">
            {events.map((data) => {
              if (data.id(registeredEvents)) {
                let ev = data.event(registeredEvents);
                return (
                  <button
                    onClick={() => registrationCheck(ev.props.event)}
                    className="py-2 transform hover:scale-95 duration-300"
                    key={ev.key}
                  >
                    {ev}
                  </button>
                );
              }
              return <></>;
            })}
          </div>
        </div>
      </div>
      {alert.show ? (
        <AlertCard
          show={alert.show}
          message={alert.message}
          color={alert.color}
          onClose={() => setAlert({ show: false, message: "", color: "" })}
          position="top-middle"
        />
      ) : null}
    </div>
  );
};

export default MobileDashboard;
