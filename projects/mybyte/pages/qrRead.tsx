import React, { useState } from 'react';
import Html5QrcodePlugin from '../components/Html5QrcodePlugin';
import OrganizerRoute from '../components/OrganizerRoute';
import { useAuth } from '../context/AuthContext';

export default function QrRead(props: any) {
  const {givePoints, checkIn} = useAuth();
  const [data, setData] = useState('No result');

  const selectWhich: JSX.Element = (
    <select id="what-for">
      <option value="check-in">Check in</option>
      <option value="give-1">Give 1 point</option>
      <option value="give-2">Give 2 points</option>
      <option value="give-3">Give 3 points</option>
    </select>
  );

  const determineAction = (uid: string) => {
    // action state kept resetting to its default state for some reason
    const val = document.getElementsByTagName("select").namedItem("what-for")?.value;
    switch(val) {
        case "give-1":
            givePoints(uid, 1);
            break;
        case "give-2":
            givePoints(uid, 2);
            break;
        case "give-3":
            givePoints(uid, 3);
            break;
        case "check-in":
        default:
            checkIn(uid);
    }
  }
  return (
    <OrganizerRoute>
      <Html5QrcodePlugin
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
            } catch(error) {
                console.log(`Something happened: ${error}`);
            }
        }}
      />
      <span>{data} </span>
      <span>| Which:</span>
      {selectWhich}
    </OrganizerRoute>
  );
};