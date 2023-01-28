import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TeamType, useAuth } from "../context/AuthContext";
import ProtectedRoute from '../components/ProtectedRoute';
import { FirebaseError } from 'firebase/app';
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { TeamConfrimResponse } from '../types/teamConfirmResponse';
import TeamCard from '../components/TeamCard';

interface MemberType {
    member1: string,
    member2: string,
    member3: string,
    member4: string,
}

type TeamTypeWithId = {
    team: TeamType,
    tid: string,
}

export default function Team() {
    const {getTeam, userCreateTeam, addToTeam, user, userInfo, getPotentialTeams} = useAuth();
    let [team, setTeam] = useState({members: [""]});
    let [pTeams, setPTeams] = useState<TeamTypeWithId[]>([]);
    useEffect( () => {
        const getInfo = async () => {
            let t = await getTeam();
            if (t === null) setTeam({ members: [""]});
            else setTeam(t);
            t = await getPotentialTeams();
            if (t === null || t.length === 0) setPTeams([]);
            else setPTeams(t);
        };
        getInfo();
    }, [setTeam, getTeam]);

    const router = useRouter();

    let teamsJSX: JSX.Element[] = [];

    pTeams.forEach((elem, index) => {
        teamsJSX.push((
            <TeamCard team={elem.team} tid={elem.tid} key={index}></TeamCard>
        ));
    })

    const noTeam = (
        <>
            <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
                <h2 className="px-12 mt-8 text-center text-xl">
                    Sorry, you are not in a team yet.
                </h2>

                <div className="mt-8 mb-8">
                    <div className="flex justify-center text-xl">
                        <p className="text-cyan-500">
                            <button onClick={(e) => {
                                e.preventDefault();
                                userCreateTeam().then((message: Error | TeamType) => {
                                    if (message instanceof FirebaseError) {
                                        // need to do something here
                                    } else if (message instanceof Error) {
                                        // need to do something here
                                    } else {
                                        setTeam(message);
                                    }
                                });
                            }}>Create Team</button>
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h2>Invites:</h2>
                <div className="flex">
                    {teamsJSX}
                </div>
            </div>
        </>);

    const methods = useForm<MemberType>({ mode: "onBlur" });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = methods;

    const onSubmit = async (data: MemberType) => {
        const members: string[] = [data.member1, data.member2, data.member3, data.member4];
        let uniqueMembers: string[] = [];
        members.forEach((member: string) => {
            if (member !== null && member !== undefined
                && member !== "" && !team.members.includes(member)) {
                //router.push("/api/");
                uniqueMembers.push(member);
            }
        });
        addToTeam(uniqueMembers);
    }

    async function validateEmail(value: string) {
        if (value === undefined || value === null ||
            value === "") return true; // if no value, true
        const response = await fetch("api/teamConfirm", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'riddle': 'ICNSOIBOEL@#EFUH_FERH*&84491erf01h  dbc',
            },
            body: JSON.stringify({
                authUserEmail: user.email,
                emails: [value],
                tid: userInfo.tid,
                which: "confirmEmail",
            }),
        });
        if (response.status !== 200) return false || "Cannot connect to network";
        const values: TeamConfrimResponse = await response.json();
        if (values.member.length === 0 || 
            values.member[0].confirmed === false) return false || "Not a user";
        return true;
    }

    const hasTeam = (
        <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
            <h2 className="px-12 mt-8 text-center text-xl">
                Your Team
            </h2>

            <div className="mt-8 mb-8">
                <div className="flex justify-center text-xl">
                    <FormProvider {...methods}>
                        <form action="" className="" onSubmit={handleSubmit(onSubmit)}>
                            <input type="email"
                                {...register("member1", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 0),
                                })}
                                placeholder={(team.members.length > 0) ? team.members[0] : "Member 1"}
                                readOnly={(team.members.length > 0)}/>
                            {errors.member1 && (
                              <p className="text-red-400">{errors.member1.message}</p>
                            )}
                            <input type="email"
                                {...register("member2", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 1),
                                })}
                                placeholder={(team.members.length > 1) ? team.members[1] : "Member 2"}
                                readOnly={(team.members.length > 1)}/>
                            {errors.member2 && (
                              <p className="text-red-400">{errors.member2.message}</p>
                            )}
                            <input type="email"
                                {...register("member3", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 2),
                                })}
                                placeholder={(team.members.length > 2) ? team.members[2] : "Member 3"}
                                readOnly={(team.members.length > 2)}/>
                            {errors.member3 && (
                              <p className="text-red-400">{errors.member3.message}</p>
                            )}
                            <input type="email"
                                {...register("member4", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 3),
                                })}
                                placeholder={(team.members.length > 3) ? team.members[3] : "Member 4"}
                                readOnly={(team.members.length > 3)}/>
                            {errors.member4 && (
                              <p className="text-red-400">{errors.member4.message}</p>
                            )}
                            <input type="submit"></input>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>);
  return (
    <ProtectedRoute>
          { (team != null && team.members != null && team.members.length != 0 && team.members[0] === "") ? (
    noTeam
  ) : (
    hasTeam
  ) }
    </ProtectedRoute>
  )
}
