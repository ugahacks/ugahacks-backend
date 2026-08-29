import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  FirestoreError,
  getDoc,
  getDocs,
  increment,
  Query,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { Events } from "../enums/events";

import { FirebaseError } from "firebase/app";
import Router from "next/router";
import { Users } from "../enums/userType";
import { eSportsForm } from "../interfaces/eSportsForm";
import { getPoints } from "../interfaces/event";
import { PresenterRegisterForm } from "../interfaces/presenterRegisterForm";
import { RegisterForm } from "../interfaces/registerForm";

export interface UserType {
  email: string | null;
  uid: string | null;
}

export interface EventRegistered {
  CADATHON: boolean | null;
  HACKS9: boolean | null;
  HACKSX: boolean | null;
  ESPORTSX: boolean | null;
  HACKS11: boolean | null;
  ESPORTS11: boolean | null;
  HACKS12?: boolean;
}

export interface EventCheckIn extends EventRegistered { }
export interface EventCheckOut extends EventRegistered { }

export interface UserInfoType {
  first_name: string | null;
  last_name: string | null;
  points: number;
  tid: string | null;
  school: string | null;
  registered: EventRegistered;
  user_type: Users | null;
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
      CADATHON: null,
      HACKS9: null,
      HACKSX: null,
      ESPORTSX: null,
      HACKS11: null,
      ESPORTS11: null,
      HACKS12: null,
    },
    user_type: null,
  });
  const [user_type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currEvent, setCurrEvent] = useState<Events>();

  /****** Stage Environment ******/
  const userRefStage = collection(db, "users-stage");
  const eSportsRefStage = collection(db, "user-e-sports-details-stage");
  const registerRefStage = collection(db, "user-registration-details-stage");
  const workshopRefStage = collection(db, "user-workshop-details-stage");
  const teamRefStage = collection(db, "team-stage");

  /****** Prod Environment ******/
  const userRef = collection(db, "users");
  const teamRef = collection(db, "team");
  const emailTemplates = collection(db, "email-templates");

  // Current Event (UGA Cadathon):
  const registerRef = collection(db, "CADathon1-user-registration-details");
  const registerMail = collection(db, "CADATHON-registrationMail");
  const eSportsRef = collection(db, "eSports-cadathon-user-registration-details");

  const registerRef_UH11 = collection(db, "UH11-user-registration-details");
  const registerMail_UH11 = collection(db, "UH11-registrationMail");

  const registerRef_UHX = collection(db, "UHX-user-registration-details");
  const registerMail_UHX = collection(db, "UHX-registrationMail");

  const registerRef_UH9 = collection(db, "UH9-user-registration-details");
  const registerMail_UH9 = collection(db, "UH9-registrationMail");

  const eSportsRef_UH8 = collection(db, "user-e-sports-details");
  const registerRef_UH8 = collection(db, "user-registration-details");
  const workshopRef = collection(db, "user-workshop-details");

  /****** Auth Providers ******/
  const googleProvider = new GoogleAuthProvider();

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

  const validUser = () => {
    if (user) {
      return true;
    }
    return false;
  };

  /**
   * Creates a team for the user in the team collection
   * @throws FirebaseError -
   */
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

  /**
   * Stores registration details in firestore.
   * @param data data from form fields on /register page
   */
  const storeUserRegistrationInformation = async (data: RegisterForm) => {
    if (!user?.uid) {
      throw new Error("User not authenticated");
    }

    // Write registration doc for Cadathon
    await setDoc(doc(registerRef, user.uid), {
      uid: user.uid,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      year: data.year,
      major: data.major,
      inputMajor: data.inputMajor,
      minor: data.minor,
      email: data.email,
      participated: data.participated,
      hopeToSee: data.hopeToSee,
      dietaryRestrictions: data.dietaryRestrictions,
      inputDietaryRestrictions: data.inputDietaryRestrictions,
      shirtSize: data.shirtSize,
      firstName: data.firstName,
      lastName: data.lastName,
      preferredName: data.preferredName,
      codeOfConduct: data.codeOfConduct,
      eventLogisticsInfo: data.eventLogisticsInfo,
      mlhCommunication: data.mlhCommunication,
      accepted: null,
      checkedIn: false,
      checkedOut: false,
      submitted_time: serverTimestamp(),
    });

    try {
      await updateDoc(doc(userRef, user.uid), {
        "registered.CADATHON": true,
      });
    } catch (error) {
      console.warn("Unable to update user registration status", error);
    }

    await setUserInformation(user.uid).catch((error) => {
      console.warn("Unable to refresh user information", error);
    });
  };

  /**
   * Stores a mail document, which triggers an email to the user.
   */
  const triggerRegistrationEmail = async (data: RegisterForm) => {
    const cadathonRegistrationDoc = await getDoc(doc(emailTemplates, "cadathon"));

    if (cadathonRegistrationDoc.exists()) {
      const emailHTML = cadathonRegistrationDoc.data().html;

      await setDoc(doc(registerMail, user.uid ? user.uid : ""), {
        to: user.email,
        message: {
          subject: "Thank you for registering for UGA Cadathon",
          text: "",
          html: emailHTML,
        },
      });
    } else {
      console.error(
        'Document "cadathon" not found in the "email-templates" collection.',
      );
    }
  };

  /**
   * Stores a mail document, which triggers an email to the user (ESPORTS).
   */


  const triggerESportsRegistrationEmail = async (data: eSportsForm) => {
    if (!user?.uid || !user?.email) throw new Error("User not authenticated");

    const templateDoc = await getDoc(doc(emailTemplates, "esportsCadathonRegistration"));
    if (!templateDoc.exists()) {
      throw new Error('Missing email template: email-templates/esportsCadathonRegistration');
    }

    const emailHTML = templateDoc.data().html;

    await addDoc(registerMail, {
      to: user.email,
      message: {
        subject: "Thank you for registering for eSports at UGA Cadathon",
        text: "",
        html: emailHTML,
      },
      // optional debug metadata
      createdAt: serverTimestamp(),
      uid: user.uid,
      type: "esportsCadathon",
    });
  };


  /**
   * Stores registration details for ESports in firestore.
   * @param data data from form fields on esports form
   */
  const storeESportsRegistrationInformation = async (data: eSportsForm) => {
    if (!user?.uid) {
      throw new Error("User not authenticated");
    }
    await setDoc(doc(eSportsRef, user.uid), {
      firstName: data.firstName,
      lastName: data.lastName,
      gamerTag: data.gamerTag,
      phoneNumber: data.phoneNumber,
      selectedGameOne: data.selectedGameOne,
      selectedGameTwo: data.selectedGameTwo,
      skillLevelDescription: data.skillLevelDescription,
      setUpDescription: data.setUpDescription,
      keyBindingsDescription: data.keyBindingsDescription,
      tardy_agreement: data.tardyAgreement,
      submitted_time: serverTimestamp(),
    });

    await updateDoc(doc(userRef, user.uid), {
      "registered.ESPORTS_CADATHON": true,
    });

    setUserInformation(user.uid);
  };

  /**
   * Stores workshop (speaker) registration details in firestore. [NO LONGER IN USE]
   * @param data data from form fields on speaker form
   */
  const storeWorkshopRegistrationInformation = async (
    data: PresenterRegisterForm,
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
        "presentation_slides/" + user.uid + "/" + file.name,
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
        },
      );
    }

    // Set user status to registered for workshop hosting
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.PRESENT8": true,
    });

    // Update user info
    setUserInformation(user.uid);
  };

  /**
   * Parses their full name and splits it into first and last name strings.
   * @param full_name full name of google user
   */
  function getFirstAndLastNameFromGoogleName(
    full_name: string | null,
  ): [string, string] {
    // if name does not exist
    if (!full_name) {
      return ["", ""];
    }

    const [first_name = "", last_name = ""] = full_name.trim().split(/\s+/);

    return [first_name, last_name];
  }

  function getFirstAndLastNameFromUserData(
    data: DocumentData,
  ): [string | null, string | null] {
    const firstName = data.firstName ?? data.first_name ?? null;
    const lastName = data.lastName ?? data.last_name ?? null;

    if (firstName || lastName) {
      return [firstName, lastName];
    }

    const [parsedFirstName, parsedLastName] =
      getFirstAndLastNameFromGoogleName(data.name ?? null);

    return [parsedFirstName || null, parsedLastName || null];
  }

  function getFullNameFromUserData(data: DocumentData): string | null {
    const [firstName, lastName] = getFirstAndLastNameFromUserData(data);
    return [firstName, lastName].filter(Boolean).join(" ") || null;
  }

  /**
   * Creates a user in the /users collection
   * @param first_name user's first name specified in sign up form
   * @param last_name user's last name specified in sign up form
   * @param email user's email specified in sign up form
   * @param password user's password specified in sign up form
   * @param school user's school specified in sign up form
   */
  const signUp = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const user = res.user;
      const name = first_name + " " + last_name;

      await setDoc(doc(userRef, user.uid), {
        uid: user.uid,
        firstName: first_name,
        lastName: last_name,
        name: name,
        authProvider: "local",
        email: email,
        points: 0,
        registered: {},
        school: null,
        user_type: null,
        added_time: serverTimestamp(),
      });
      sendEmailVerification(user);
      signOut(auth);
    } catch (err: any) {
      throw err;
    }
  };

  /**
   * Logs in users who don't rely on any SSO
   * @param data data from form fields on /register page
   */
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

  /**
   * Sends a password reset email to a user if they exist
   * @param email email of a user
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Uses Google SSO to log-in user
   */
  const logInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const google_user = res.user;
      // const q = query(collection(db, "users"), where("uid", "==", user.uid));
      // const docs = await getDocs(q);

      const docRef = doc(userRef, google_user.uid);
      const docSnap = await getDoc(docRef);

      const [first_name, last_name] = getFirstAndLastNameFromGoogleName(
        google_user.displayName,
      );

      if (!docSnap.exists()) {
        await setDoc(doc(userRef, google_user.uid), {
          uid: google_user.uid,
          firstName: first_name,
          lastName: last_name,
          name: google_user.displayName,
          authProvider: "google",
          email: google_user.email,
          points: 0,
          school: null,
          registered: {},
          user_type: null,
          added_time: serverTimestamp(),
        });
      }
      setUserInformation(google_user.uid);
    } catch (err: any) {
      console.error(err);
    }
  };

  /**
   * checks in a user by userid
   * @param userid uuid of the user
   */
  const checkinUser = async (userid: string) => {
    try {
      await updateDoc(doc(registerRef, userid ? userid : ""), {
        checkedIn: true,
      });
      setUserInformation(userid);
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * checks out a user by userid
   * @param userid uuid of the user
   */
  const checkoutUser = async (userid: string) => {
    try {
      const docRef = doc(registerRef, userid);
      await updateDoc(docRef, {
        checkedOut: true,
      });
      setUserInformation(userid);
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * checks if a user is checked in
   * @param userid uuid of the user
   * @return boolean true if the user is checked in
   */
  const isUserCheckedIn = async (userid: string) => {
    try {
      const docRef = doc(registerRef, userid);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() && docSnap.data().checkedIn;
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * gets a user's tshirt size by userid
   * @param userid uuid of the user
   * @return string size of the tshirt
   */
  const getTShirtSizeOfUser = async (userid: string) => {
    try {
      const docRef = doc(registerRef, userid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return null;
      }
      return docSnap.data().shirtSize;
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * Accepts a user by userid.
   * @param userid uuid of a user
   */
  const acceptUser = async (userid: string) => {
    try {
      const docRef = doc(registerRef, userid);
      await updateDoc(docRef, {
        accepted: true,
      });
      // setUserInformation(userid);
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * Denies a user by userid.
   * @param userid uuid of a user
   */
  const denyUser = async (userid: string) => {
    try {
      const docRef = doc(registerRef, userid);
      await updateDoc(docRef, {
        accepted: false,
      });
      // setUserInformation(userid);
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * Updates/stores a user's first and last name
   * @param first_name user's first name
   * @param last_name user's last name
   */
  const storeFirstAndLastName = async (
    first_name: string,
    last_name: string,
  ) => {
    try {
      const docRef = doc(userRef, user.uid ? user.uid : "");

      await updateDoc(docRef, {
        firstName: first_name,
        lastName: last_name,
      });
      setUserInformation(user.uid);
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * Looks up if current user has first and last name fields in /users.
   */
  const hasFirstAndLastName = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "1");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const [firstName, lastName] = getFirstAndLastNameFromUserData(docSnap.data());

    if (!firstName || !lastName) {
      return false;
    }

    return true;
  };

  /**
   * Gets user's first name from /users.
   * @returns a string of their first name
   */
  const getFirstName = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const [firstName] = getFirstAndLastNameFromUserData(docSnap.data());
    return firstName;
  };

  /**
   * Get's user's full name from userid
   * @param userid user's uuid
   * @returns string of their full name
   */
  const getNameOfUser = async (userid: string) => {
    const docRef = doc(userRef, userid ? userid : "");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return getFullNameFromUserData(docSnap.data());
  };

  /**
   * Get's a user's registered events
   * @param userid user's id
   * @returns an array of registered events
   */
  const getRegisteredEventsForUser = async (userid: string) => {
    const docRef = doc(userRef, userid ? userid : "");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return await verifyRegistrationStatus(userid, docSnap.data().registered);
  };

  /**
   * Get's a user's registered events
   * @param first_name user's first_name
   * @returns an array of registered events
   */
  const getRegisteredEvents = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return await verifyRegistrationStatus(user.uid || "", docSnap.data().registered);
  };

  /**
   * Get's a user's registered events
   * @param first_name user's first_name
   * @returns a team
   */
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
    newMembers: string[],
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
      where("members", "array-contains", user.email),
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
            where("__name__", operator, tid),
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
      user_type != Users.organizer
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

  const removePoints = async (uid: string, number: number) => {
    if (
      user_type == null ||
      user_type == undefined ||
      user_type != Users.organizer
    )
      throw new Error("Unauthorized");
    const docRef = doc(userRef, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw "User does not exist";
    const points = docSnap.data().points;
    if (!points || points < number) {
      throw `${docSnap.data().name} does not have enough points!`;
    }

    try {
      updateDoc(docRef, {
        points: increment(-1 * number),
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
      user_type != Users.organizer
    )
      throw new Error("Unauthorized");
    const docRef = doc(userRef, uid);
    try {
      updateDoc(docRef, {
        checkedIn: true,
      });
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) handleError(error);
      if (error instanceof Error) throw error;
      if (typeof error === "string") throw new Error(error);
    }
    return false;
  };

  const verifyRegistrationStatus = async (uid: string, registeredData: any) => {
    if (!registeredData || !uid) return registeredData || {};
    
    let mismatch = false;
    const syncedRegistered = { ...registeredData };

    if (syncedRegistered.CADATHON) {
      try {
        const cadathonDoc = await getDoc(doc(registerRef, uid));
        if (!cadathonDoc.exists()) {
          syncedRegistered.CADATHON = false;
          mismatch = true;
        }
      } catch (e) {
        console.warn("Error checking CADATHON", e);
      }
    }

    if (syncedRegistered.ESPORTS_CADATHON) {
      try {
        const esportsDoc = await getDoc(doc(eSportsRef, uid));
        if (!esportsDoc.exists()) {
          syncedRegistered.ESPORTS_CADATHON = false;
          mismatch = true;
        }
      } catch (e) {
        console.warn("Error checking ESPORTS_CADATHON", e);
      }
    }

    if (mismatch) {
      try {
        await updateDoc(doc(userRef, uid), { registered: syncedRegistered });
      } catch (e) {
        console.warn("Error syncing registration", e);
      }
    }

    return syncedRegistered;
  };

  const setUserInformation = async (uid: string | null) => {
    const docRef = doc(userRef, uid ? uid : "");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const userData = docSnap.data();
    let points = 0;
    try {
      points = await getPoints(userData.uid);
    } catch (error) {
      console.warn("Unable to load points for user", error);
    }
    const [firstName, lastName] = getFirstAndLastNameFromUserData(userData);

    const syncedRegistered = await verifyRegistrationStatus(uid || "", userData.registered);

    setUserInfo({
      first_name: firstName,
      last_name: lastName,
      points,
      tid: userData.tid,
      school: userData.school,
      registered: syncedRegistered,
      user_type: userData.user_type,
    });
    setType(userData.user_type);
  };

  /**
   * Confirms whether they are valid emails in the database.
   * @param emails the emails to validate against.
   * @param strict whether to also check if they signed up to a different team.
   * @returns Promise<boolean[]>, a boolean array in the order of the `emails` array.
   */
  const confirmEmails: (
    emails: string[],
    strict?: boolean,
  ) => Promise<boolean[]> = async (
    emails: string[],
    strict: boolean = true,
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
    tid: string,
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
      where("tid", "==", userInfo.tid),
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
        getNameOfUser,
        getRegisteredEvents,
        getRegisteredEventsForUser,
        isUserCheckedIn,
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
        removePoints,
        checkIn,
        confirmEmails,
        confirmedOnTeam,
        validateEmails,
        giveTeamPoints,
        checkinUser,
        checkoutUser,
        getTShirtSizeOfUser,
        triggerRegistrationEmail,
        triggerESportsRegistrationEmail,
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
