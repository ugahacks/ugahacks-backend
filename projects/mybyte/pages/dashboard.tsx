import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import Event, { EventDetail } from "../components/Event";
import { Events } from "../enums/events";
import { QRCodeCanvas } from "qrcode.react";

const Hacks8: EventDetail = {
  key: Events.hacks8,
  eventName: "UGA Hacks 8 🐾",
  date: "02/03/2023 - 02/05/2023",
  description: "Create your own adventure! 🛫",
  page: "/events/hacks-8",
  in_person: false,
  image: "/byte_mini.png",
  // Add in person attribute
};
const events = [{ event: <Event {...Hacks8} /> }];

const DashboardPage = () => {
  const { userInfo, setUserInformation } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex py-2 container mx-auto flex-initial w-full">
        <div className="text-gray-600 px-4 py-24 mt-2 mx-auto">
          <h2 className="text-5xl font-semibold">
            Welcome, {userInfo.first_name}
          </h2>
          <h2 className="text-2xl font-semibold pt-10 text-center">
            This is the UGAHacks registration portal, feel free to register for any events below. Happy hacking!
          </h2>
          <div className="flex mt-5 items-center gap-10 justify-content-between">
              <div>
                <h2>Your stats</h2>
                <button className="pt-3">
                <QRCodeCanvas
                  id="qrCode"
                  size={200}
                  value={userInfo.uid}
                  level={"H"}
                  />
                </button>
              </div>
              <div>
                <h2>Name: {userInfo.first_name}</h2>
              </div>
            </div>
          <div className="flex container justify-center items-center">
            {events.map((data) => (
              <button className="pt-10" key={data.event.key}>
                {data.event}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
