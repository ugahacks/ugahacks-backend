import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  FirestoreError,
  query,
  DocumentData,
  where,
  Query,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { FirebaseError } from "firebase/app";
import Router from "next/router";
import { TeamType } from "../../context/AuthContext";
import { NextApiRequest, NextApiResponse } from "next";
import { TeamConfrimResponse } from "../../types/teamConfirmResponse";

/**The collection for `users-stage` */
const userRefStage = collection(db, "users-stage");
/**The collection for `team-stage` */
const teamRef = collection(db, "team-stage");

/**
 * Modifies the `error` received to a more condensed set.
 * @param error The error to handle.
 * @throws `error` the original error as an `Error` object.
 * @throws `Error("Should not happen: ${error.code}"")` for errors that typically will never happen.
 * @thorws `Error("Denied")` for when permissions to query are denied.
 * @throws `Error("No strong network connection")` for auth/network-request-failed.
 */
const handleError = (error: unknown) => {
    if (typeof (error) === "string") throw new Error(error);
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
}

/**
 * Confirms whether they are valid emails in the database.
 * @param emails the emails to validate against.
 * @param strict whether to also check if they signed up to a different team.
 * @returns Promise<boolean[]>, a boolean array in the order of the `emails` array.
 */
const confirmEmails: (emails: string[], strict?: boolean) => Promise<boolean[]>
                    = async (emails: string[], strict: boolean = true) => {
    let returned: boolean[] = [];
    for (let times: number = 0; times < emails.length; times++) returned.push(false);
    const q: Query<DocumentData> = query(userRefStage, where("email", "in", emails));
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    results.forEach((elem) => {
        emails.forEach((email, index) => {
            if (email === elem.data().email && (!strict || elem.data().tid == undefined)) returned[index] = true;
        });
    });
    return returned;
}

/**
 * Checks if `emails` is in the given team.
 * @param emails the emails to validate against.
 * @param tid the team to validate against.
 * @returns Promise<boolean[]>, a boolean array in the order of the `emails` array.
 */
const confirmedOnTeam: (emails: string[], tid: string) => Promise<boolean[]>
                    = async (emails: string[], tid: string) => {
    let returned: boolean[] = [];
    for (let times: number = 0; times < emails.length; times++) returned.push(false);
    const q: Query<DocumentData> = query(userRefStage, where("email", "in", emails));
    const results: QuerySnapshot<DocumentData> = await getDocs(q);
    if (results.empty) return returned;
    results.forEach((elem) => {
        const index = emails.indexOf(elem.data().email)
        if (index <= 0) return;
        returned[index] = (tid === elem.data().tid);
    });

    return returned;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TeamConfrimResponse>
  ) {
    return new Promise<void>(async (resolve, reject) => {
        if (req.method === null || req.method !== "POST" || req.body === null) {
            res.status(400).end(); // Bad Request
            resolve();
        } // if the request is does not have the info this needs
        try {
            await signInWithEmailAndPassword(auth, 
                "ioeafvoiefvfdbcfbdiedewyf1@gmail.com", "dMcjSc8khRwdXsqn7vSqaQYZ");
        } catch (error) {
            handleError(error);
        }
        const authorized = await confirmEmails([req.body.authUserEmail], false);
        if (req.headers.riddle !== "ICNSOIBOEL@#EFUH_FERH*&84491erf01h  dbc"
            ||  authorized.includes(false)) {
            res.status(401).end(); // Unauthorized
            signOut(auth);
            resolve();
        } // if they try to call the api normally (kinda useless if you see this)

        const emails = req.body.emails;
        const tid = req.body.tid;
        const truth = (req.body.which === "confirmEmail") ? 
            await confirmEmails(emails) : await confirmedOnTeam(emails, tid);
        let data: TeamConfrimResponse = {
            member: [],
        };
        if (emails.length !== truth.length) {
            res.status(400).end(); // Internal Service Error
            signOut(auth);
            resolve();
        } // I don't know how this can happen, but it shouldn't
        for (let times: number = 0; times < emails.length; times++) {
            data.member.push({
                email: emails[times],
                confirmed: truth[times],
            });
        } // for every email, push whether it has been confirmed in user
        res.status(200).json(data);
        signOut(auth);
        resolve();
    });
  }