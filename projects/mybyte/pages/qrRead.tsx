import React, { Fragment, useRef, useState } from "react";
import { PassThrough } from "stream";
import Html5QrcodePlugin from "../components/Html5QrcodePlugin";
import OrganizerRoute from "../components/OrganizerRoute";
import { useAuth } from "../context/AuthContext";

export default function QrRead(props: any) {
  const { givePoints, checkIn } = useAuth();
  const [data, setData] = useState("No result");
  const ref = React.useRef<Html5QrcodePlugin | null>(null);

  const selectWhich: JSX.Element = (
    <select id="what-for">
      <option value="side-event">Side Event (500)</option>
      <option value="company-event">Company Event (1000)</option>
      <option value="workshop">Workshop (500)</option>
      <option value="escape-room">Escape Room Winner (1000)</option>
      <option value="lunch">Check Lunch</option>
      <option value="dinner">Check Dinner</option>
    </select>
  );

  const determineAction = (uid: string) => {
    // action state kept resetting to its default state for some reason
    const val = document
      .getElementsByTagName("select")
      .namedItem("what-for")?.value;
    const callback = () => {
      if (ref != null && ref != undefined) {
        ref.current?.html5QrcodeScanner?.pause();
        window.alert("Success! Click to unpause.");
        ref.current?.html5QrcodeScanner?.resume();
      }
    };
    switch (val) {
      case "side-event":
        givePoints(uid, 500).then(callback);
        break;
      case "company-event":
        givePoints(uid, 1000).then(callback);
        break;
      case "workshop":
        givePoints(uid, 500).then(callback);
        break;
      case "escape-room":
        givePoints(uid, 1000).then(callback);
        break;
      case "lunch":
        givePoints(uid, 1).then(callback);
        break;
      case "dinner":
        givePoints(uid, 1).then(callback);
      default:
        givePoints(uid, 0).then(callback);
    }
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
            setData("Not valid User QR-Code");
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
      <span>{data} </span>
      <span>| Which:</span>
      {selectWhich}
    </OrganizerRoute>
  );
}
