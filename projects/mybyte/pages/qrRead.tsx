import React, { useEffect, useState } from "react";
import OrganizerRoute from "../components/OrganizerRoute";
import { useAuth } from "../context/AuthContext";
import { QrReader } from "react-qr-reader";
import {
  addAttendance,
  Event,
  getEvents,
  getPoints,
} from "../interfaces/event";

const initialUser = {
  name: "N/A",
  shirtSize: "N/A",
  points: 0,
};

export default function QrRead() {
  const { getNameOfUser, getTShirtSizeOfUser, user_type } = useAuth();
  const [scannedUID, setScannedUID] = useState("");
  const [user, setUser] = useState(initialUser);
  const [status, setStatus] = useState("Waiting for scan");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then((events) => {
      setEvents(events);
    });
  }, []);

  const selectWhich: JSX.Element = (
    <select
      id="what-for"
      className={
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      }
    >
      {events.map((event) => {
        return (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        );
      })}
    </select>
  );

  const determineAction = async (uid: string) => {
    let outcomeMessage = "";
    console.log(user_type);
    try {
      if (!uid) throw "No QR Code has been scanned!";
      // action state kept resetting to its default state for some reason
      if (uid.includes("/")) {
        window.alert("Not valid User QR-Code");
        return;
      } // https://stackoverflow.com/questions/52850099/what-is-the-reg-expression-for-firestore-constraints-on-document-ids

      const selectedOption = document
        .getElementsByTagName("select")
        .namedItem("what-for")?.value;

      console.log(selectedOption);

      const name = await getNameOfUser(uid);
      if (!name) {
        throw "User not found!";
      }
      const tShirtSize = await getTShirtSizeOfUser(uid);
      let points = await getPoints(uid);
      setUser({ name: name, shirtSize: tShirtSize, points });
      outcomeMessage = `Successfully completed ${selectedOption} for ${name}`;
      points = await getPoints(uid);
      setUser({ name: name, shirtSize: tShirtSize, points });
      await addAttendance(selectedOption!, uid);
    } catch (error) {
      if (typeof error === "string") {
        outcomeMessage = error;
      } else {
        throw error;
      }
    } finally {
      setStatus(outcomeMessage);
      setScannedUID("");
    }
  };
  return (
    <OrganizerRoute>
      <div className={"flex flex-col justify-center items-center space-x-10"}>
        <QrReader
          className={"w-full h-full"}
          videoStyle={{ height: "100%", width: "100%" }}
          constraints={{ facingMode: "back" }}
          scanDelay={0}
          onResult={async (result, _) => {
            if (!result) return;
            const name = await getNameOfUser(result.getText());
            const shirtSize = await getTShirtSizeOfUser(result.getText());
            const points = await getPoints(result.getText());
            setUser({ name: name, shirtSize: shirtSize, points });

            setScannedUID(result.getText());
          }}
        />
        <div className={"flex flex-col space-y-2"}>
          <div>
            Scanned UID: {scannedUID} <br /> <br />
            <line></line>
            Name: {user.name} <br />
            Shirt Size: {user.shirtSize} <br />
            Points: {user.points} <br />
          </div>
          <div>Previous Status: {status} </div>
          <label
            className={
              "block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            }
          >
            Scanner Options:
          </label>
          {selectWhich}
          <div>
            <button
              className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium focus:outline-none bg-white rounded-lg border border-gray-200 ${
                scannedUID === ""
                  ? "text-gray-600"
                  : "text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:hover:text-white dark:hover:bg-gray-700"
              } focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600`}
              onClick={async () => await determineAction(scannedUID)}
              disabled={scannedUID === ""}
            >
              {scannedUID === ""
                ? "Please Scan a QR Code"
                : "Run Selected Action"}
            </button>
          </div>
        </div>
      </div>
    </OrganizerRoute>
  );
}
