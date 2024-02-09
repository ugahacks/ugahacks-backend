import React, { useState } from "react";
import Html5QrcodePlugin from "../components/Html5QrcodePlugin";
import OrganizerRoute from "../components/OrganizerRoute";
import { useAuth } from "../context/AuthContext";

export default function QrRead(props: any) {
  const {
    isUserCheckedIn,
    checkoutUser,
    checkinUser,
    removePoints,
    givePoints,
  } = useAuth();
  const [data, setData] = useState("No result");
  const [status, setStatus] = useState("Waiting for scan");
  const ref = React.useRef<Html5QrcodePlugin | null>(null);

  const selectWhich: JSX.Element = (
    <select id="what-for">
      <option value="checkin-first-day">Check in (Day 1)</option>
      <option value="checkin-other">Check in (Other)</option>
      <option value="checkout">Check out</option>
      <option value="side-event">Side Event (250)</option>
      <option value="company-event">Company Event (1000)</option>
      <option value="workshop">Workshop (500)</option>
      <option value="ctf-checkin">CTF Check in (100)</option>
      <option value="ctf-cp1">CTF Checkpoint 1 (250)</option>
      <option value="ctf-cp2">CTF Checkpoint 2 (500)</option>
      <option value="escape-room">Escape Room Winner (1000)</option>
      <option value="e-sports-winner">E-Sports Winner (500)</option>
      <option value="remove-250">Remove 250 Points</option>
      <option value="remove-500">Remove 500 Points</option>
      <option value="remove-1000">Remove 1,000 Points</option>
      <option value="remove-2000">Remove 2,000 Points</option>
      <option value="remove-4000">Remove 4,000 Points</option>
      <option value="remove-10000">Remove 10,000 Points</option>
    </select>
  );

  const determineAction = async (uid: string) => {
    // action state kept resetting to its default state for some reason
    const val = document
      .getElementsByTagName("select")
      .namedItem("what-for")?.value;
    const callback = () => {
      if (ref != null && ref != undefined) {
        setTimeout(() => {
          ref.current?.html5QrcodeScanner?.pause();
        }, 5000);

        window.alert("Success! Click to unpause.");
        ref.current?.html5QrcodeScanner?.resume();
      }
    };
    try {
      switch (val) {
        case "checkin-first-day":
          // if (await isUserCheckedIn(uid)) {
          //   setStatus("User is already checked in!");
          //   return;
          // }

          await checkinUser(uid);
          givePoints(uid, 100).then(callback);
          break;
        case "checkin-other":
          if (await isUserCheckedIn(uid)) {
            setStatus("User is already checked in!");
            return;
          }
          checkinUser(uid);
          break;
        case "checkout":
          checkoutUser(uid);
          break;
        case "side-event":
          givePoints(uid, 250);
          break;
        case "company-event":
          givePoints(uid, 1000);
          break;
        case "workshop":
          givePoints(uid, 500);
          break;
        case "ctf-checkin":
          givePoints(uid, 100);
          break;
        case "ctf-cp1":
          givePoints(uid, 250);
          break;
        case "ctf-cp2":
          givePoints(uid, 500);
          break;
        case "escape-room":
          givePoints(uid, 1000);
          break;
        case "e-sports-winner":
          givePoints(uid, 500);
          break;
        case "remove-250":
          givePoints(uid, -250);
          break;
        case "remove-500":
          givePoints(uid, -500);
          break;
        case "remove-1000":
          givePoints(uid, -1000);
          break;
        case "remove-2000":
          givePoints(uid, -2000);
          break;
        case "remove-4000":
          givePoints(uid, -4000);
          break;
        case "remove-10000":
          givePoints(uid, -10000);
          break;
        default:
          givePoints(uid, 0);
          break;
      }
      setStatus("Successfully completed " + val);
    } catch (error) {
      if (error instanceof Error) {
        setStatus(error.message);
      }
    }
    callback();
  };
  return (
    <OrganizerRoute>
      <Html5QrcodePlugin
        ref={ref}
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={(decodedText: string, decodedResult: any) => {
          if (data === decodedText) return;
          if (decodedText.includes("/")) {
            setStatus("Not valid User QR-Code");
            return;
          } // https://stackoverflow.com/questions/52850099/what-is-the-reg-expression-for-firestore-constraints-on-document-ids
          setData(decodedText);
          try {
            determineAction(decodedText);
          } catch (error) {
            console.log(`Something happened: ${error}`);
          }
        }}
      />
      <span>{status} </span>
      <span>| Which:</span>
      {selectWhich}
    </OrganizerRoute>
  );
}
