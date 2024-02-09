import React, { useState } from "react";
import Html5QrcodePlugin from "../components/Html5QrcodePlugin";
import OrganizerRoute from "../components/OrganizerRoute";
import { useAuth } from "../context/AuthContext";
import { Html5QrcodeScannerState } from "html5-qrcode";

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

    function pauseScanner() {
        if (ref.current == null || ref.current?.html5QrcodeScanner == null)
            return;
        if (
            ref.current.html5QrcodeScanner.getState() ==
            Html5QrcodeScannerState.SCANNING
        ) {
            ref.current.html5QrcodeScanner.pause();
        }
    }

    function resumeScanner() {
        if (ref.current == null || ref.current?.html5QrcodeScanner == null)
            return;
        if (
            ref.current.html5QrcodeScanner.getState() ==
            Html5QrcodeScannerState.PAUSED
        ) {
            ref.current.html5QrcodeScanner.resume();
        }
    }

    const determineAction = async (uid: string) => {
        // action state kept resetting to its default state for some reason
        const val = document
            .getElementsByTagName("select")
            .namedItem("what-for")?.value;

        let outcomeMessage = "";
        try {
            const name = await getNameOfUser(uid);
            if (!name) {
                throw new Error("User not found!");
            }
            outcomeMessage = `Successfully completed ${val} for ${name}`;
            switch (val) {
                case "checkin-first-day":
                    if (
                        !("HACKS9" in (await getRegisteredEventsForUser(uid)))
                    ) {
                        throw new Error(
                            `${name} is not registered for UGAHacks 9!`
                        );
                    }
                    if (await isUserCheckedIn(uid)) {
                        throw new Error(`${name} is already checked in!`);
                    }
                    await checkinUser(uid);
                    givePoints(uid, 100);
                    outcomeMessage = `Checked in ${name}!\nT-Shirt size: ${await getTShirtSizeOfUser(uid)}`;
                    break;
                case "checkin-other":
                    if (
                        !("HACKS9" in (await getRegisteredEventsForUser(uid)))
                    ) {
                        throw new Error(
                            `${name} is not registered for UGAHacks 9!`
                        );
                    }
                    if (await isUserCheckedIn(uid)) {
                        throw new Error(`${name} is already checked in!`);
                    }
                    checkinUser(uid);
                    outcomeMessage = `Checked in ${name}!\nT-Shirt size: ${await getTShirtSizeOfUser(uid)}`;
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
            if (error instanceof Error) {
                outcomeMessage = error.message;
            }
        } finally {
            setStatus(outcomeMessage);
            window.alert(outcomeMessage);
        }
    };
    let lock = false;
    return (
        <OrganizerRoute>
            <Html5QrcodePlugin
                ref={ref}
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={async (
                    decodedText: string,
                    decodedResult: any
                ) => {
                    if (
                        ref.current == null ||
                        ref.current?.html5QrcodeScanner == null
                    )
                        return;
                    if (data === decodedText) return;
                    if (decodedText.includes("/")) {
                        window.alert("Not valid User QR-Code");
                        return;
                    }
                    setData(decodedText);
                    ref.current.html5QrcodeScanner?.pause(); // Pause the scanner immediately after a successful scan
                    await determineAction(decodedText);
                    ref.current.html5QrcodeScanner?.resume(); // Resume the scanner after 2 seconds
                }}
            />
            <span>Status: {status} </span>
            <div>Scanner Options:</div>
            {selectWhich}
        </OrganizerRoute>
    );
}
