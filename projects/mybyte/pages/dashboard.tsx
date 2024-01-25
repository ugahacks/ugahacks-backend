import React, { useState, useEffect } from "react";
import Image from "next/image";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth, EventRegistered } from "../context/AuthContext";
import EventRect, { EventDetail } from "../components/EventRect";
import { Events } from "../enums/events";
import { QRCodeCanvas } from "qrcode.react";
import Circle from "../components/Circle";
import MobileDashboard from "../components/MobileDashboard";

const Hacks9: EventDetail = {
  key: Events.hacks9,
  page: "/register",
  image: "/uh9_banner.png",
  startDate: new Date("02/09/2024"),
  endDate: new Date("02/11/2024"),
  deadline: new Date("01/26/2024"),
  // Add in person attribute
};

const ESports: EventDetail = {
  key: Events.e_sports_9,
  page: "/esports",
  image: "/eSports9_banner.png",
  startDate: new Date("02/09/2024"),
  endDate: new Date("02/11/2024"),
  deadline: new Date("02/04/2024"),
  // Add in person attribute
};
const events = [
  {
    event: (re: EventRegistered) => {
      if (!re.HACKS9) {
        return <EventRect disabled={false} event={Hacks9} />;
      } else {
        return <EventRect disabled={true} event={Hacks9} />;
      }
    },
    id: (re: EventRegistered) => {
      return true;
    },
  },
  {
    event: (re: any) => {
      if (!re.HACKS9 || !re || re.ESPORTS9) {
        return <EventRect disabled={true} event={ESports} />;
      } else {
        return <EventRect disabled={false} event={ESports} />;
      }
    },
    id: (re: EventRegistered) => {
      return true;
    },
  },
];

// Valid Open Events (pretty name):
const eventMap = new Map<string, string>();
eventMap.set("HACKS9", "UGAHacks 9");
eventMap.set("ESPORTS9", "eSports 9");

function openEventsRegistered(allRegisteredEvents: string[]) {
  let events = "";
  allRegisteredEvents.forEach((e: string) => {
    if (eventMap.has(e)) events += eventMap.get(e) + ", ";
  });

  events = events.substring(0, events.length - 2);
  return events;
}

const DashboardPage = () => {
  const { user, userInfo } = useAuth();
  const registeredEvents: EventRegistered = userInfo.registered;
  const registeredEventKeys = Object.keys(registeredEvents);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 520);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ProtectedRoute>
      {isMobile ? (
        <MobileDashboard
          user={user}
          userInfo={userInfo}
          registeredEvents={registeredEvents}
          registeredEventKeys={registeredEventKeys}
          events={events}
          eventMap={eventMap}
        />
      ) : (
        <div className="flex py-2 mx-auto flex-initial w-full">
          <div className="text-gray-800 px-16 py-3 mt-4 mx-3 inter">
            <h2 className="text-3xl font-semibold">
              Welcome, {userInfo.first_name + " " + userInfo.last_name}
            </h2>
            <div className="text-xl pt-5 pb-5 text-left font-mono container w-3/4">
              <p>
                This is the UGAHacks registration portal, feel free to register
                for any events below. Happy hacking!
              </p>
            </div>
            <div className="flex mt-5 items-center gap-10 justify-content-between">
              <div>
                <h2 className="font-bold text-lg text-black pt-2 pb-2">
                  Your Stats
                </h2>
                <div className="overflow-hidden pb-10">
                  <QRCodeCanvas
                    id="qrCode"
                    size={200}
                    value={user.uid}
                    level={"H"}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="font-mono">
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
                  Points:{" "}
                  <span className="font-bold">{userInfo.points + "pts"}</span>
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
            </div>
            <div className="mt-5">
              <h3 className="font-semibold text-lg text-black">
                Register for events
              </h3>
              <div className="flex flex-wrap gap-10">
                {events.map((data) => {
                  if (data.id(registeredEvents)) {
                    let ev = data.event(registeredEvents);
                    return (
                      <button
                        className="pt-2 transform hover:scale-95 duration-300"
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
          <Circle className="fixed -bottom-72 -right-10 hidden lg:block overflow-hidden wiggle rounded-full h-[500px] w-[520px] bg-red-500 opacity-90 -z-10" />
          <Circle className="fixed -bottom-32 -right-72 hidden lg:block overflow-hidden wiggle2 rounded-full h-[500px] w-[520px] bg-red-500 opacity-90 -z-10" />
        </div>
      )}
    </ProtectedRoute>
  );
};

export default DashboardPage;
