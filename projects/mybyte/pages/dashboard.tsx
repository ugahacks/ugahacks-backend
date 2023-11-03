import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth, EventRegistered } from "../context/AuthContext";
import EventRect, { EventDetail } from "../components/EventRect";
import { Events } from "../enums/events";
import { QRCodeCanvas } from "qrcode.react";

const Hacks9: EventDetail = {
  key: Events.hacks9,
  page: "/register",
  image: "/uh9_banner.png",
  startDate: new Date("02/03/2024"),
  endDate: new Date("02/05/2024"),
  deadline: new Date("02/04/2024"),
  // Add in person attribute
};

const ESports: EventDetail = {
  key: Events.e_sports_9,
  page: "/events/ESportsRegister",
  image: "/ESportsByte.jpeg",
  startDate: new Date("02/03/2024"),
  endDate: new Date("02/05/2024"),
  deadline: new Date("02/04/2024"),
  // Add in person attribute
};
const events = [
  { event: <EventRect {...Hacks9} />, id: (re: EventRegistered) => {return !re.HACKS9;} },
  { event: <EventRect {...ESports} />, id: (re: EventRegistered) => {return false} },
];

const eventMap = new Map<string, string>();
eventMap.set("HACKS9", "UGAHacks 9");
eventMap.set("ESPORTS9", "eSports 9");

const DashboardPage = () => {
  const { userInfo, setUserInformation } = useAuth();
  const registeredEvents: EventRegistered = userInfo.registered;
  const registeredEventKeys = Object.keys(registeredEvents);

  return (
    <ProtectedRoute>
      <div className="flex py-2 container mx-auto flex-initial w-full">
        <div className="text-gray-600 px-4 py-3 mt-2 mx-auto inter">
          <h2 className="text-5xl font-semibold">
            Welcome, {userInfo.first_name}
          </h2>
          <h2 className="text-2xl font-semibold pt-10 text-center">
            This is the UGAHacks registration portal, feel free to register for
            any events below. Happy hacking!
          </h2>
          <div className="flex mt-5 items-center gap-10 justify-content-between">
            <div>
              <h2 className="text-bold text-lg text-black">Your stats</h2>
              <div className="rounded-lg overflow-hidden">
                {/* <button className="pt-3"> */}
                <QRCodeCanvas
                  id="qrCode"
                  size={200}
                  value={userInfo.uid}
                  level={"H"}
                />
                {/* </button> */}
              </div>
            </div>
            <div>
              <h2>
                Name: {userInfo.first_name} {userInfo.last_name}
              </h2>
              <h2>
                School: {userInfo.school != null ? userInfo.school : "n/a"}
              </h2>
              <h2>Points: {userInfo.points}</h2>
              <ul>
                {registeredEventKeys.length > 0 ? (
                  <ul>
                    <h2>Registered Events:</h2>
                    {registeredEventKeys.map((eventName) => (
                      <span
                        className="text-red-500 font-semibold"
                        key={eventName}
                      >
                        {eventMap.has(eventName)
                          ? eventMap.get(eventName) + " "
                          : null}
                      </span>
                    ))}
                  </ul>
                ) : (
                  // Render nothing when there are no events to display.
                  <div>
                    <h2>Registration Status:</h2>
                    <h2>You are not registered for any events.</h2>
                  </div>
                )}
              </ul>
            </div>
          </div>
          <div className=" mt-5">
            <h3 className="text-bold text-lg text-black">
              Register for events
            </h3>
            <div className="flex container gap-10">
              {events.map((data) => {
                if (data.id(registeredEvents)) {
                  return (
                    <button className="pt-4" key={data.event.key}>
                      {data.event}
                    </button>
                  );
                }
                return <></>;
              })}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
