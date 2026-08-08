import React, { useEffect, useMemo, useRef, useState } from "react";
import OrganizerRoute from "../components/OrganizerRoute";
import { useAuth } from "../context/AuthContext";
import { QrReader } from "react-qr-reader";
import {
  addAttendance,
  Event,
  getEvents,
  getPoints,
} from "../interfaces/event";

type UserPreview = {
  name: string;
  shirtSize: string;
  points: number;
};

type ScanVisualStatus = "idle" | "success" | "warning" | "error" | "processing";

type ScanLogItem = {
  uid: string;
  name: string;
  eventTitle: string;
  status: ScanVisualStatus;
  message: string;
  timestamp: number;
};

const initialUser: UserPreview = {
  name: "N/A",
  shirtSize: "N/A",
  points: 0,
};

const DEBOUNCE_MS = 3000;

const QrRead: React.FC = () => {
  const { getNameOfUser, getTShirtSizeOfUser } = useAuth();

  const [scannedUID, setScannedUID] = useState<string>("");
  const [user, setUser] = useState<UserPreview>(initialUser);
  const [statusMessage, setStatusMessage] =
    useState<string>("Waiting for scan");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanVisualStatus>("idle");
  const [scanLog, setScanLog] = useState<ScanLogItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selectedEventIdRef = useRef<string>("");
  selectedEventIdRef.current = selectedEventId;

  const flashTimeoutRef = useRef<number | null>(null);

  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const warningSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  const lastScanRef = useRef<{ uid: string; time: number } | null>(null);

  useEffect(() => {
    getEvents().then((eventsResponse) => {
      setEvents(eventsResponse);
      setIsLoading(false);
    });
  }, []);

  const unlockAudioAutomatically = () => {
    if (audioUnlockedRef.current) return;

    const audios = [
      successSoundRef.current,
      warningSoundRef.current,
      errorSoundRef.current,
    ];

    audios.forEach((audio) => {
      if (!audio) return;
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          audioUnlockedRef.current = true;
        })
        .catch(() => {});
    });
  };

  useEffect(() => {
    if (scanStatus === "idle" || scanStatus === "processing") return;

    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }

    flashTimeoutRef.current = window.setTimeout(() => {
      setScanStatus("idle");
      setStatusMessage("Waiting for scan");
    }, 400);

    return () => {
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, [scanStatus]);

  const statusLabel = useMemo(() => {
    return scanStatus === "success"
      ? "Success"
      : scanStatus === "processing"
        ? "Processing..."
        : scanStatus === "warning"
          ? "Already attended"
          : scanStatus === "error"
            ? "Error"
            : "Idle";
  }, [scanStatus]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const playSoundForStatus = (status: ScanVisualStatus) => {
    const play = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.play().catch(() => {});
    };

    if (status === "success") play(successSoundRef.current);
    if (status === "warning") play(warningSoundRef.current);
    if (status === "error") play(errorSoundRef.current);
  };

  const determineAction = async (uid: string) => {
    if (!uid) return;

    let outcomeMessage = "";
    let outcomeStatus: ScanVisualStatus = "error";
    let eventId = "";
    let eventTitle = "";
    let eventPoints = 0;
    let scannedNameForLog = "";

    try {
      setIsProcessing(true);
      unlockAudioAutomatically();

      if (!uid) throw "No QR Code has been scanned!";
      if (uid.includes("/")) throw "Not valid User QR-Code";

      eventId = selectedEventIdRef.current;
      if (!eventId || eventId === "invalid") {
        throw "Please select an event.";
      }

      const event = events.find((e) => e.id === eventId);
      if (!event) throw "Event not found";

      eventTitle = event?.title ?? `Event ${eventId}`;
      eventPoints = event?.points ?? 0;

      const name = await getNameOfUser(uid);
      if (!name) throw "User not found!";

      scannedNameForLog = name;

      const shirtSize = await getTShirtSizeOfUser(uid);
      let points = await getPoints(uid);

      setUser({ name, shirtSize, points });

      if (points + eventPoints < 0) throw "Not enough points";

      await addAttendance(eventId, uid);

      setUser({ name, shirtSize, points: points + eventPoints });

      outcomeMessage = `Successfully completed ${eventTitle} for ${name}`;
      outcomeStatus = "success";
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Already attended") {
          outcomeMessage = "Already attended";
          outcomeStatus = "warning";
        } else {
          outcomeMessage = error.message;
          outcomeStatus = "error";
        }
      } else if (typeof error === "string") {
        outcomeMessage = error;
        outcomeStatus = "error";
      } else {
        outcomeMessage = "Unexpected error";
        outcomeStatus = "error";
      }
    } finally {
      setStatusMessage(outcomeMessage);
      setScanStatus(outcomeStatus);

      const timestamp = Date.now();
      const nameForLog =
        scannedNameForLog || user.name || "Unknown participant";
      const effectiveEventTitle = eventTitle || "Unknown event";

      setScanLog((prev) => {
        const next: ScanLogItem[] = [
          {
            uid,
            name: nameForLog,
            eventTitle: effectiveEventTitle,
            status: outcomeStatus,
            message: outcomeMessage,
            timestamp,
          },
          ...prev,
        ];
        return next.slice(0, 50);
      });

      playSoundForStatus(outcomeStatus);
      setIsProcessing(false);
    }
  };

  return (
    <OrganizerRoute>
      <div className="relative min-h-screen bg-slate-950 text-slate-50 flex flex-col p-4">
        {scanStatus === "success" && (
          <div className="fixed inset-0 z-30 pointer-events-none bg-emerald-500/40" />
        )}
        {scanStatus === "warning" && (
          <div className="fixed inset-0 z-30 pointer-events-none bg-amber-400/40" />
        )}
        {scanStatus === "error" && (
          <div className="fixed inset-0 z-30 pointer-events-none bg-red-500/40" />
        )}

        <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />
        <audio ref={warningSoundRef} src="/sounds/warning.mp3" preload="auto" />
        <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto" />

        <header className="mb-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Event Check-In
          </h1>
          <p className="text-xs text-slate-400">
            Hold a participant&rsquo;s QR code in view to confirm attendance.
          </p>
        </header>

        <main className="flex-1 flex flex-col gap-4">
          <div
            className="relative rounded-2xl overflow-hidden bg-black shadow-xl"
            style={{
              height: "40vh",
              maxHeight: 600,
            }}
          >
            <QrReader
              containerStyle={{ width: "100%", height: "100%" }}
              videoContainerStyle={{ width: "100%", height: "100%" }}
              videoStyle={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              constraints={{ facingMode: "environment" }}
              scanDelay={0}
              onResult={async (result) => {
                if (isProcessing) return;
                if (!result) return;

                const uid = result.getText();
                const now = Date.now();

                if (lastScanRef.current) {
                  const { uid: lastUid, time } = lastScanRef.current;
                  if (uid === lastUid && now - time < DEBOUNCE_MS) {
                    return;
                  }
                }

                lastScanRef.current = { uid, time: now };

                unlockAudioAutomatically();
                setScannedUID(uid);

                setIsProcessing(true);
                setScanStatus("processing");

                determineAction(uid).then(() => {
                  const timeTaken = Date.now() - now;
                  console.log(`Processing Took: ${timeTaken}ms`);
                });
              }}
            />

            {/* Scan frame overlay */}
            <div className="pointer-events-none absolute inset-6 rounded-2xl border border-white/30" />
          </div>

          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
              <div className="text-xs font-semibold text-slate-400 mb-1">
                Current Scan
              </div>
              <div className="text-xs text-slate-400 mb-2">
                UID:{" "}
                <span className="font-mono text-[0.7rem] text-slate-300 break-all">
                  {scannedUID || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-y-1 text-xs">
                <span className="text-slate-400">Name</span>
                <span className="col-span-2">{user.name}</span>

                <span className="text-slate-400">Shirt Size</span>
                <span className="col-span-2">{user.shirtSize}</span>

                <span className="text-slate-400">Points</span>
                <span className="col-span-2">{user.points}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="what-for"
                className="block mb-1 text-xs font-medium text-slate-300"
              >
                Scanner Options
              </label>
              <select
                id="what-for"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-50 text-sm rounded-lg block w-full p-2.5"
              >
                <option value="">
                  SELECT AN EVENT
                </option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-1 flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    scanStatus === "success"
                      ? "bg-emerald-400"
                      : scanStatus === "warning"
                        ? "bg-amber-400"
                        : scanStatus === "error"
                          ? "bg-red-400"
                          : "bg-slate-500"
                  }`}
                />
                <span className="font-semibold uppercase tracking-wide">
                  {statusLabel}
                </span>
                <span className="text-slate-300 truncate max-w-[12rem]">
                  {statusMessage}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-2">
            <h2 className="text-xs font-semibold text-slate-400 mb-1">
              Recent scans
            </h2>
            {scanLog.length === 0 ? (
              <p className="text-[0.7rem] text-slate-500">
                No scans yet. Hold a QR code up to the camera.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {scanLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-[0.7rem]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold truncate">
                          {entry.name}
                        </span>
                        <span className="px-1.5 py-[1px] rounded-full bg-slate-800 text-slate-200 truncate max-w-[8rem]">
                          {entry.eventTitle}
                        </span>
                      </div>
                      <div className="text-slate-400 truncate">
                        {entry.message}
                      </div>
                      <div className="text-slate-500 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span
                      className={`ml-2 mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                        entry.status === "success"
                          ? "bg-emerald-400"
                          : entry.status === "warning"
                            ? "bg-amber-400"
                            : entry.status === "error"
                              ? "bg-red-400"
                              : "bg-slate-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </OrganizerRoute>
  );
};

export default QrRead;