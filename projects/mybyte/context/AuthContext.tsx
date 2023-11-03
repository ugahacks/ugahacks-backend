import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  updateDoc,
  serverTimestamp,
  getDoc,
  addDoc,
  FirestoreError,
  Query,
  DocumentData,
  QuerySnapshot,
  query,
  where,
  getDocs,
  WhereFilterOp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Events } from "../enums/events";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { RegisterForm } from "../interfaces/registerForm";
import { ESportsRegisterForm } from "../interfaces/eSportsRegisterForm";
import { PresenterRegisterForm } from "../interfaces/presenterRegisterForm";
import { FirebaseError } from "firebase/app";
import Router from "next/router";

export interface UserType {
  email: string | null;
  uid: string | null;
}

interface EventRegistered {
  HACKS8: boolean | null;
  HACKS9: boolean | null;
}

export interface UserInfoType {
  first_name: string | null;
  last_name: string | null;
  points: number;
  tid: string | null;
  school: string | null;
  registered: EventRegistered;
  //user_type: Users | null;
}

export interface TeamType {
  members: string[];
  submitted?: boolean | null;
}

const AuthContext = createContext({});

export const useAuth = () => useContext<any>(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserType>({ email: null, uid: null });
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    first_name: null,
    last_name: null,
    points: 0,
    tid: null,
    school: null,
    registered: {
      HACKS8: null,
      HACKS9: null,
    },

    //user_type: null
  });
  const [user_type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currEvent, setCurrEvent] = useState<Events>();

  // Stage Environment
  const userRefStage = collection(db, "users-stage");
  const eSportsRefStage = collection(db, "user-e-sports-details-stage");
  const registerRefStage = collection(db, "user-registration-details-stage");
  const workshopRefStage = collection(db, "user-workshop-details-stage");
  const teamRefStage = collection(db, "team-stage");

  // Prod Environment
  const userRef = collection(db, "users");
  const eSportsRef = collection(db, "user-e-sports-details");
  const registerRef = collection(db, "user-registration-details");
  const workshopRef = collection(db, "user-workshop-details");
  const teamRef = collection(db, "team");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (curr_user) => {
      if (curr_user) {
        setUser({
          email: curr_user.email,
          uid: curr_user.uid,
        });
        setUserInformation(curr_user.uid);
      } else {
        setUser({ email: null, uid: null });
        setType(null);
      }
    });
    setLoading(false);

    return () => unsubscribe();
  }, []);

  const googleProvider = new GoogleAuthProvider();

  const validUser = () => {
    if (user) {
      return true;
    }

    return false;
  };

  const userCreateTeam: () => Promise<TeamType> = async () => {
    if (userInfo.tid !== null && userInfo.tid !== undefined)
      throw new Error("Already created");
    const uid = user.uid !== null ? user.uid : "0";
    const email = user.email !== null ? user.email : "";
    const team: TeamType = {
      members: [email],
    };
    try {
      await denyTeams("", "!=");
      const docTeamRef = await addDoc(teamRef, team);
      const docUserRef = doc(userRef, uid);

      await updateDoc(docUserRef, { tid: docTeamRef.id });
      // Update userInfo
      await setUserInformation(user.uid);
      return team; // good
    } catch (error: any) {
      let message: string = "Unknown";
      if (typeof error === "string") {
        message = error;
      } else if (error instanceof FirebaseError) {
        handleError(error);
      } else if (error instanceof Error) {
        throw error;
      }
      throw new Error(message);
    }
  };

  const storeUserRegistrationInformation = async (data: RegisterForm) => {
    const storage = getStorage();
    const file = data.resume[0];

    const storageRef = ref(storage, "resume/" + user.uid + "/" + file.name);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("upload in progress");
      },
      (error) => {
        console.log("Error uploading resume");
        alert(error);
      },
      async () => {
        await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setDoc(doc(registerRef, user.uid ? user.uid : ""), {
            uid: user.uid,
            gender: data.gender,
            phoneNumber: data.phoneNumber,
            countryResidence: data.countryResidence.label,
            year: data.year,
            major: data.major,
            inputMajor: data.inputMajor,
            minor: data.minor,
            email: data.email,
            participated: data.participated,
            hopeToSee: data.hopeToSee,
            dietaryRestrictions: data.dietaryRestrictions,
            shirtSize: data.shirtSize,
            codeOfConduct: data.codeOfConduct,
            eventLogisticsInfo: data.eventLogisticsInfo,
            mlhCommunication: data.mlhCommunication,
            resumeLink: downloadURL,
            submitted_time: serverTimestamp(),
          });
        });
      }
    );

    // Set the user status to registered for hacks8
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.HACKS8": false,
      "registered.HACKS9": true,
    });

    // Update userInfo
    setUserInformation(user.uid);
  };

  const storeESportsRegistrationInformation = async (
    data: ESportsRegisterForm
  ) => {
    await setDoc(doc(eSportsRef, user.uid ? user.uid : ""), {
      skill_level: data.skillLevel,
      can_bring_controller: data.canBringController,
      preferred_name: data.preferredName,
      tardy_agreement: data.tardyAgreement,
      submitted_time: serverTimestamp(),
    });

    // Set the user status to registered for hacks8
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.ESPORTS8": false,
      "registered.ESPORTS9": true,
    });

    // Update userInfo
    setUserInformation(user.uid);
  };

  const storeWorkshopRegistrationInformation = async (
    data: PresenterRegisterForm
  ) => {
    if (data.slides.length == 0) {
      await setDoc(doc(workshopRef, user.uid ? user.uid : ""), {
        uid: user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        preferredTimes: data.preferredTimes,
        workshopName: data.workshopName,
        workshopDetails: data.workshopDetails,
        topic: data.topic,
        isOnline: data.isOnline,
      });
    } else {
      const storage = getStorage();
      const file = data.slides[0];

      const storageRef = ref(
        storage,
        "presentation_slides/" + user.uid + "/" + file.name
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log("upload in progress");
        },
        (error) => {
          console.log("Error uploading resume");
          alert(error);
        },
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setDoc(doc(workshopRef, user.uid ? user.uid : ""), {
              uid: user.uid,
              firstName: data.firstName,
              lastName: data.lastName,
              preferredTimes: data.preferredTimes,
              workshopName: data.workshopName,
              workshopDetails: data.workshopDetails,
              topic: data.topic,
              isOnline: data.isOnline,
              slides: downloadURL,
            });
          });
        }
      );
    }

    // Set user status to registered for workshop hosting
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.PRESENT8": true,
    });

    // Update user info
    setUserInformation(user.uid);
  };

  function getFirstAndLastNameFromGoogleName(
    full_name: string | null
  ): [string, string] {
    // if name does not exist
    if (!full_name) {
      return ["", ""];
    }

    let first_name, last_name, rest;
    [first_name, last_name, ...rest] = full_name.split(" ");

    return [first_name, last_name];
  }

  const signUp = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    school: string | undefined
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const user = res.user;
      const name = first_name + " " + last_name;

      await setDoc(doc(userRef, user.uid), {
        uid: user.uid,
        first_name: first_name,
        last_name: last_name,
        name: name,
        authProvider: "local",
        email: email,
        points: 0,
        registered: {},
        school: school,
        added_time: serverTimestamp(),
      });
      sendEmailVerification(user);
      signOut(auth);
    } catch (err: any) {
      throw err;
    }
  };

  const logIn = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    if (!user.emailVerified) {
      setUser({ uid: null, email: null });
      signOut(auth);
      return false;
    }

    return true;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const google_user = res.user;
      // const q = query(collection(db, "users"), where("uid", "==", user.uid));
      // const docs = await getDocs(q);

      const docRef = doc(userRef, google_user.uid);
      const docSnap = await getDoc(docRef);

      const [first_name, last_name] = getFirstAndLastNameFromGoogleName(
        google_user.displayName
      );

      if (!docSnap.exists()) {
        await setDoc(doc(userRef, google_user.uid), {
          uid: google_user.uid,
          first_name: first_name,
          last_name: last_name,
          name: google_user.displayName,
          authProvider: "google",
          email: google_user.email,
          points: 0,
          registered: {},
          added_time: serverTimestamp(),
        });
      }
      setUserInformation(google_user.uid);
    } catch (err: any) {
      console.error(err);
    }
  };

  const storeFirstAndLastName = async (
    first_name: string,
    last_name: string
  ) => {
    try {
      const docRef = doc(userRef, user.uid ? user.uid : "");

      await updateDoc(docRef, {
        first_name: first_name,
        last_name: last_name,
      });
      setUserInformation(user.uid);
    } catch (err: any) {
      console.log(err);
    }
  };

  const hasFirstAndLastName = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "1");
    const docSnap = await getDoc(docRef);

    if (
      docSnap.exists() &&
      (docSnap.data().first_name === "" || docSnap.data().last_name === "")
    ) {
      return false;
    }

    return true;
  };

  const getFirstName = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data().first_name;
  };

  const getRegisteredEvents = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data().registered;
  };

  const getTeam: () => Promise<TeamType | null> = async () => {
    if (userInfo.tid === null || userInfo.tid === undefined) return null;
    const docRef = doc(teamRef, userInfo.tid ? userInfo.tid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const team: TeamType = {
      members: docSnap.data().members,
      submitted: docSnap.data().submitted,
    };

    return team;
  };

  /**
   * Adds new team members to team.
   * @param newMembers The new members to be added to the team.
   * @returns The new Team (updates it on firestore too).
   * @throws "Team does not exist": The team listed on current user does not exist.
   * @throws "Team limit would be exceeded": The team limit of 4 would be exceeded.
   * @throws "Should not happen: ${error.code}": This should not (but can) happen.
   * @throws "No strong network connection": Network timeout.
   * @throws "Denied": lacking permissions to do this with current user.
   */
  const addToTeam: (newMembers: string[]) => Promise<TeamType> = async (
    newMembers: string[]
  ) => {
    if (userInfo.tid === null || userInfo.tid === undefined)
      throw new Error("No Team");
    const docRef = doc(teamRef, userInfo.tid ? userInfo.tid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Team does not exist");
    }

    let team: TeamType = {
      members: docSnap.data().members,
    };

    newMembers.forEach((elem: string) => {
      if (!team.members.includes(elem)) team.members.push(elem);
    });

    if (team.members.length > 4) {
      throw new Error("Team limit would be exceeded");
    }

    try {
      await setDoc(docRef, team);
    } catch (error: any) {
      if (typeof error === "string") throw new Error(error);
      if (error instanceof FirebaseError || error instanceof FirestoreError) {
        handleError(error);
      }
    }
    return team;
  };

  const getPotentialTeams = async () => {
    let teams: { team: TeamType; tid: string }[] = [];
    const q: Query<DocumentData> = query(
      teamRef,
      where("members", "array-contains", user.email)
    );
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    results.forEach((elem) => {
      teams.push({ team: { members: elem.data().members }, tid: elem.id });
    });
    return teams;
  };

  const linkUserToTeam = async (tid: string) => {
    try {
      await denyTeams(tid, "!=");
      const docRef = doc(userRef, user.uid ? user.uid : "");

      await updateDoc(docRef, {
        tid: tid,
      });
      setUserInformation(user.uid);
    } catch (err: any) {
      console.log(err);
    }
  };

  const denyTeams = async (tid: string, operator: WhereFilterOp = "!=") => {
    if (user == undefined || user.uid == undefined) return;
    try {
      const q: Query<DocumentData> =
        tid === ""
          ? query(teamRef, where("members", "array-contains", user.email))
          : query(
              teamRef,
              where("members", "array-contains", user.email),
              where("__name__", operator, tid)
            );
      const results: QuerySnapshot<DocumentData> = await getDocs(q);
      results.forEach((elem) => {
        let team: TeamType = { members: [] };
        elem.data().members.forEach((elem: string) => {
          if (elem !== user.email) team.members.push(elem);
        });
        updateDoc(elem.ref, {
          members: team.members,
        }).catch(handleError);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const givePoints = async (uid: string, number: 1 | 2 | 3) => {
    if (
      user_type == null ||
      user_type == undefined ||
      user_type != "service_writer"
    )
      throw new Error("Unauthorized");
    const docRef = doc(userRef, uid);
    try {
      updateDoc(docRef, {
        points: increment(number),
      });
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) handleError(error);
      if (error instanceof Error) throw error;
      if (typeof error === "string") throw new Error(error);
    }
    return false;
  };

  const checkIn = async (uid: string) => {
    if (
      user_type == null ||
      user_type == undefined ||
      user_type != "service_writer"
    )
      throw new Error("Unauthorized");
    const docRef = doc(userRef, uid);
    try {
      updateDoc(docRef, {
        checkIn: true,
      });
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) handleError(error);
      if (error instanceof Error) throw error;
      if (typeof error === "string") throw new Error(error);
    }
    return false;
  };

  const setUserInformation = async (uid: string | null) => {
    const docRef = doc(userRef, uid ? uid : "");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    setUserInfo({
      first_name: docSnap.data().first_name,
      last_name: docSnap.data().last_name,
      points: docSnap.data().points,
      tid: docSnap.data().tid,
      school: docSnap.data().school,
      registered: docSnap.data().registered,
    });
    setType(docSnap.data().user_type);
  };

  /**
   * Confirms whether they are valid emails in the database.
   * @param emails the emails to validate against.
   * @param strict whether to also check if they signed up to a different team.
   * @returns Promise<boolean[]>, a boolean array in the order of the `emails` array.
   */
  const confirmEmails: (
    emails: string[],
    strict?: boolean
  ) => Promise<boolean[]> = async (
    emails: string[],
    strict: boolean = true
  ) => {
    let returned: boolean[] = [];
    for (let times: number = 0; times < emails.length; times++)
      returned.push(false);
    const q: Query<DocumentData> = query(userRef, where("email", "in", emails));
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    results.forEach((elem) => {
      emails.forEach((email, index) => {
        if (
          email === elem.data().email &&
          (!strict || elem.data().tid == undefined)
        )
          returned[index] = true;
      });
    });
    return returned;
  };

  /**
   * Checks if `emails` is in the given team.
   * @param emails the emails to validate against.
   * @param tid the team to validate against.
   * @returns Promise<boolean[]>, a boolean array in the order of the `emails` array.
   */
  const confirmedOnTeam: (
    emails: string[],
    tid: string
  ) => Promise<boolean[]> = async (emails: string[], tid: string) => {
    let returned: boolean[] = [];
    for (let times: number = 0; times < emails.length; times++)
      returned.push(false);
    const q: Query<DocumentData> = query(userRef, where("email", "in", emails));
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    if (results.empty) return returned;
    results.forEach((elem) => {
      const index = emails.indexOf(elem.data().email);
      if (index <= 0) return;
      returned[index] = tid === elem.data().tid;
    });

    return returned;
  };

  const validateEmails = async (emails: string[]) => {
    const truth = await confirmEmails(emails);
    let data: { member: { email: string; confirmed: boolean }[] } = {
      member: [],
    };
    if (emails.length !== truth.length) {
      throw new Error("Should not happen");
    } // I don't know how this can happen, but it shouldn't
    for (let times: number = 0; times < emails.length; times++) {
      data.member.push({
        email: emails[times],
        confirmed: truth[times],
      });
    } // for every email, push whether it has been confirmed in user
    return data;
  };

  const giveTeamPoints = async () => {
    if (userInfo == undefined || userInfo.tid == undefined) return;
    const team: TeamType | null = await getTeam();
    if (team?.submitted == true) return;
    const q: Query<DocumentData> = query(
      userRef,
      where("tid", "==", userInfo.tid)
    );
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    results.forEach(async (elem) => {
      await updateDoc(elem.ref, {
        points: increment(2500),
      });
    });
    const docRef = doc(teamRef, userInfo.tid ? userInfo.tid : "0");
    await updateDoc(docRef, { submitted: true });
  };

  const logOut = async () => {
    setUser({ email: null, uid: null });
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userInfo,
        signUp,
        logIn,
        resetPassword,
        logInWithGoogle,
        logOut,
        storeFirstAndLastName,
        hasFirstAndLastName,
        validUser,
        getFirstName,
        getRegisteredEvents,
        storeUserRegistrationInformation,
        setUserInformation,
        currEvent,
        setCurrEvent,
        storeESportsRegistrationInformation,
        storeWorkshopRegistrationInformation,
        getTeam,
        userCreateTeam,
        addToTeam,
        linkUserToTeam,
        getPotentialTeams,
        denyTeams,
        user_type,
        givePoints,
        checkIn,
        confirmEmails,
        confirmedOnTeam,
        validateEmails,
        giveTeamPoints,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

const handleError = (error: unknown) => {
  if (typeof error === "string") throw new Error(error);
  if (error instanceof FirebaseError || error instanceof FirestoreError) {
    switch (error.code) {
      case "auth/argument-error": // invalid argument
      case "unknown": // They don't know, we don't know, nobody knows
      case "invalid-argument": // the arguments themselves are invalid
      case "resource-exhausted": // per-user quota exceeded or out of space
      case "unimplemented": // operation is not supported or implemented
      case "internal": // Something is very broken
      case "unavailable": // transient, firestore currently unavailable
      case "data-loss": // very screwed
      case "failed-precondition": // firestore not in a state to do this
        throw new Error(`Should not happen: ${error.code}`);
      case "auth/requires-recent-login":
      case "unauthenticated":
      case "auth/invalid-user-token": // needs to be signed in again
        Router.push("/login");
        break;
      case "auth/network-request-failed":
        throw new Error("No strong network connection");
      case "permission-denied":
      case "auth/operation-not-allowed":
        throw new Error("Denied");
    }
  }
};
