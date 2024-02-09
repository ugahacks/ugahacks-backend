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
import { eSportsForm } from "../interfaces/eSportsForm";
import { PresenterRegisterForm } from "../interfaces/presenterRegisterForm";
import { FirebaseError } from "firebase/app";
import Router from "next/router";
import { Users } from "../enums/userType";

export interface UserType {
  email: string | null;
  uid: string | null;
}

export interface EventRegistered {
  HACKS8: boolean | null;
  HACKS9: boolean | null;
}

export interface EventCheckIn extends EventRegistered {}
export interface EventCheckOut extends EventRegistered {}

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
      HACKS8: null,
      HACKS9: null,
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

  // Current Event (Hacks 9):
  const eSportsRef = collection(db, "eSports9-user-registration-details");
  const registerRef = collection(db, "UH9-user-registration-details");
  const registerMail = collection(db, "UH9-registrationMail");

  // Hacks 8:
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
            inputDietaryRestrictions: data.inputDietaryRestrictions,
            shirtSize: data.shirtSize,
            codeOfConduct: data.codeOfConduct,
            eventLogisticsInfo: data.eventLogisticsInfo,
            mlhCommunication: data.mlhCommunication,
            age: data.age,
            firstName: data.firstName,
            lastName: data.lastName,
            levelOfStudy: data.levelsOfStudy,
            school: data.school.value,
            inputSchool: data.inputSchool,
            elCreditInterest: data.elCreditInterest,
            accepted: null,
            checkedIn: false,
            checkedOut: false,
            resumeLink: downloadURL,
            submitted_time: serverTimestamp(),
          });
        });
      }
    );

    // Set the user status to registered for hacks9 & updates school
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.HACKS9": true,
      school: data.school.value,
      user_type: Users.hacker,
      points: 0, // resets user's points to 0 on registration for UH9
    });

    // Update userInfo
    setUserInformation(user.uid);
  };

  /**
   * Stores a mail document, which triggers an email to the user.
   */
  const triggerRegistrationEmail = async (data: RegisterForm) => {
    const uh9RegistrationDoc = await getDoc(
      doc(emailTemplates, "uh9-registration")
    );

    if (uh9RegistrationDoc.exists()) {
      const emailHTML = uh9RegistrationDoc.data().html;

      await setDoc(doc(registerMail, user.uid ? user.uid : ""), {
        to: user.email,
        message: {
          subject: "Thank you for registering for UGAHacks 9",
          text: "",
          html: emailHTML,
        },
      });
    } else {
      console.error(
        'Document "uh9-registration" not found in the "email-templates" collection.'
      );
    }
  };

  /**
   * Stores a mail document, which triggers an email to the user (ESPORTS).
   */
  const triggerESportsRegistrationEmail = async (data: eSportsForm) => {
    const uh9RegistrationDoc = await getDoc(
      doc(emailTemplates, "eSports9Registration")
    );

    if (uh9RegistrationDoc.exists()) {
      const emailHTML = uh9RegistrationDoc.data().html;

      await setDoc(doc(registerMail, user.uid ? user.uid : ""), {
        to: user.email,
        message: {
          subject: "Thank you for registering for eSports 9",
          text: "",
          html: emailHTML,
        },
      });
    } else {
      console.error(
        'Document "eSports9Registration" not found in the "email-templates" collection.'
      );
    }
  };

  /**
   * Stores registration details for ESports in firestore.
   * @param data data from form fields on esports form
   */
  const storeESportsRegistrationInformation = async (data: eSportsForm) => {
    await setDoc(doc(eSportsRef, user.uid ? user.uid : ""), {
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

    // Set the user status to registered for hacks8
    await updateDoc(doc(userRef, user.uid ? user.uid : ""), {
      "registered.ESPORTS9": true,
    });

    // Update userInfo
    setUserInformation(user.uid);
  };

  /**
   * Stores workshop (speaker) registration details in firestore. [NO LONGER IN USE]
   * @param data data from form fields on speaker form
   */
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

  /**
   * Parses their full name and splits it into two seperate strings, first_name and last_name
   * @param full_name full name of google user
   */
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
    password: string
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
      const docRef = doc(registerRef, userid);
      await updateDoc(docRef, {
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
   * @param first_name user's first_name
   * @param last_name user's first_name
   */
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

  /**
   * Looks up if current user has a field for first_name and last_name in /users collection
   * @param first_name user's first_name
   * @param last_name user's first_name
   */
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

  /**
   * Get's user's first_name from /user collection
   * @param first_name user's first_name
   * @returns a string of their first_name
   */
  const getFirstName = async () => {
    const docRef = doc(userRef, user.uid ? user.uid : "0");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data().first_name;
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

    return docSnap.data().registered;
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

  const removePoints = async (uid: string, number: number) => {
    if (
      user_type == null ||
      user_type == undefined ||
      user_type != "service_writer"
    )
      throw new Error("Unauthorized");
    const docRef = doc(userRef, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("User does not exist");
    const points = docSnap.data().points;
    if (!points || points < number) {
      throw new Error("User does not have enough points!");
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
      user_type: docSnap.data().user_type,
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
