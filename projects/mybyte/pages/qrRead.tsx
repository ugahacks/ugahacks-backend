import React, {useState} from "react";
import OrganizerRoute from "../components/OrganizerRoute";
import {useAuth} from "../context/AuthContext";
import {QrReader} from 'react-qr-reader';


const initialUser = {
  name: "N/A",
  shirtSize: "N/A"
}

export default function QrRead(props: any) {
  const {
    isUserCheckedIn,
    checkoutUser,
    checkinUser,
    removePoints,
    givePoints,
    getNameOfUser,
    getRegisteredEventsForUser,
    getTShirtSizeOfUser,
    user_type
  } = useAuth();
  const [scannedUID, setScannedUID] = useState("");
  const [user, setUser] = useState(initialUser);
  const [status, setStatus] = useState("Waiting for scan");

  const selectWhich: JSX.Element = (
    <select id="what-for" className={"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}>
      <option value="checkin-first-day">Check in (Day 1)</option>
      <option value="checkin-other">Check in (Other)</option>
      <option value="checkout">Check out</option>
      <option value="side-event">Side Event (250)</option>
      <option value="company-event">Company Event (1,000)</option>
      <option value="workshop">Workshop (500)</option>
      <option value="ctf-checkin">CTF Check in (100)</option>
      <option value="ctf-cp1">CTF Checkpoint 1 (250)</option>
      <option value="ctf-cp2">CTF Checkpoint 2 (500)</option>
      <option value="escape-room">Escape Room Winner (1,000)</option>
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
    let outcomeMessage = "";
    console.log(user_type)
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

      const name = await getNameOfUser(uid)
      if (!name) {
        throw "User not found!";
      }
      const tShirtSize = await getTShirtSizeOfUser(uid)
      setUser({name: name, shirtSize: tShirtSize})
      outcomeMessage = `Successfully completed ${selectedOption} for ${name}`;
      switch (selectedOption) {
        case "checkin-first-day":
          if (!("HACKS9" in await getRegisteredEventsForUser(uid))) {
            throw `${name} is not registered for UGAHacks 9!`;
          }
          if (await isUserCheckedIn(uid)) {
            throw `${name} is already checked in!`;
          }
          await checkinUser(uid);
          givePoints(uid, 100);
          outcomeMessage = `Checked in ${name}!`;
          break;
        case "checkin-other":
          if (!("HACKS9" in await getRegisteredEventsForUser(uid))) {
            throw `${name} is not registered for UGAHacks 9!`;
          }
          if (await isUserCheckedIn(uid)) {
            throw `${name} is already checked in!`;
          }
          checkinUser(uid);
          outcomeMessage = `Checked in ${name}!`;
          break;
        case "checkout":
          checkoutUser(uid);
          outcomeMessage = `Checked out ${name}!`;
          break;
        case "side-event":
          givePoints(uid, 250);
          outcomeMessage = `Awarded ${name} 250 points for the side event!`;
          break;
        case "company-event":
          givePoints(uid, 1000);
          outcomeMessage = `Awarded ${name} 1,000 points for the company event!`;
          break;
        case "workshop":
          givePoints(uid, 500);
          outcomeMessage = `Awarded ${name} 500 points for the workshop!`;
          break;
        case "ctf-checkin":
          givePoints(uid, 100);
          outcomeMessage = `Awarded ${name} 100 points for CTF Checkin!`;
          break;
        case "ctf-cp1":
          givePoints(uid, 250);
          outcomeMessage = `Awarded ${name} 250 points for CTF Checkpoint 1!`;
          break;
        case "ctf-cp2":
          givePoints(uid, 500);
          outcomeMessage = `Awarded ${name} 500 points for CTF Checkpoint 2!`;
          break;
        case "escape-room":
          givePoints(uid, 1000);
          outcomeMessage = `Awarded ${name} 1,000 points for winning escape room!`;
          break;
        case "e-sports-winner":
          givePoints(uid, 500);
          outcomeMessage = `Awarded ${name} 500 points for winning E-Sports event!`;
          break;
        case "remove-250":
          await removePoints(uid, 250);
          outcomeMessage = `Removed 250 points from ${name}`;
          break;
        case "remove-500":
          await removePoints(uid, 500);
          outcomeMessage = `Removed 500 points from ${name}`;
          break;
        case "remove-1000":
          await removePoints(uid, 1000);
          outcomeMessage = `Removed 1,000 points from ${name}`;
          break;
        case "remove-2000":
          await removePoints(uid, 2000);
          outcomeMessage = `Removed 2,000 points from ${name}`;
          break;
        case "remove-4000":
          await removePoints(uid, 4000);
          outcomeMessage = `Removed 4,000 points from ${name}`;
          break;
        case "remove-10000":
          await removePoints(uid, 10000);
          outcomeMessage = `Removed 10,000 points from ${name}`;
          break;
        default:
          break;
      }
    } catch (error) {
      if (typeof error === "string") {
        outcomeMessage = error;
      } else {
        throw error;
      }
    } finally {
      setStatus(outcomeMessage);
      setScannedUID("")
    }
  };
  return (
    <OrganizerRoute>
      <div className={"flex flex-col justify-center items-center space-y-2"}>
        <QrReader
          className={"w-1/3 h-full"}
          videoStyle={{"height": "100%", "width" : "100%"}}
          constraints={{facingMode: 'back'}}
          scanDelay={0}
          onResult={async (result, _) => {
            if (!result) return;
            setScannedUID(result.getText())
          }}
        />
        <div className={"flex flex-col space-y-2"}>
          <div>
            Scanned UID: {scannedUID} <br/> <br/>
            <line></line>
            Name: {user.name} <br/>
            Shirt Size: {user.shirtSize} <br/>
          </div>
          <div>Previous Status: {status} </div>
          <label className={"block mb-2 text-sm font-medium text-gray-900 dark:text-white"}>Scanner Options:</label>
          {selectWhich}
          <div>
            <button
              className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium focus:outline-none bg-white rounded-lg border border-gray-200 ${scannedUID === "" ? 'text-gray-600' : 'text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:hover:text-white dark:hover:bg-gray-700'} focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600`}
              onClick={async () => await determineAction(scannedUID)}
              disabled={scannedUID === ""}
            >
              {scannedUID === "" ? 'Please Scan a QR Code' : 'Run Selected Action'}
            </button>
          </div>
        </div>
      </div>
    </OrganizerRoute>
  );
}
