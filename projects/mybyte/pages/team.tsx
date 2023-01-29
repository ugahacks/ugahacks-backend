import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TeamType, useAuth } from "../context/AuthContext";
import ProtectedRoute from '../components/ProtectedRoute';
import { FirebaseError } from 'firebase/app';
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { TeamConfrimResponse } from '../types/teamConfirmResponse';
import TeamCard from '../components/TeamCard';
import { Typography } from '@material-tailwind/react';

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
    }, [setTeam, getTeam, getPotentialTeams]);

    const router = useRouter();

    let teamsJSX: JSX.Element[] = [];

    pTeams.forEach((elem, index) => {
        teamsJSX.push((
            <TeamCard team={elem.team} tid={elem.tid} key={index}></TeamCard>
        ));
    })

    const noTeam = (
        <>
            <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white bg-opacity-75 rounded-md">
                <Typography variant="h2" className="px-12 mt-8 text-center text-xl">
                    Sorry, you are not in a team yet.
                </Typography>

                <div className="mt-8 mb-8">
                    <div className="flex justify-center text-xl">
                        <p className="text-cyan-500 transition-colors hover:text-cyan-400">
                            <button onClick={(e) => {
                                e.preventDefault();
                                userCreateTeam().then((message: TeamType) => {
                                    setTeam(message);
                                }).catch((error: Error) => {
                                    if (error instanceof FirebaseError) {
                                        console.log(error);
                                    } else {
                                        console.log(error);
                                    }
                                });
                            }}> <Typography variant="h5">Create Team</Typography></button>
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-grow border-t w-[400px] mx-auto border-gray-400 my-6"></div>
            <div>
                <Typography variant="h2" className="display-block text-center text-xl my-6">Invites</Typography>
                <div className="flex flex-wrap justify-around mx-5">
                    {teamsJSX}
                </div>
            </div>
        </>);

    const methods = useForm<MemberType>({ mode: "onSubmit" });

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
        addToTeam(uniqueMembers).then((newTeam: TeamType) => {
            setTeam(newTeam);
        });
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
            values.member[0].confirmed === false) return false || "Not a user or in another team";
        return true;
    }

    const illuminated = ["block mb-3 font-sans text-black", "block mb-3 font-sans text-[#DC4141]"]

    const hasTeam = (
        <div className="sign-up-form container mx-auto w-96 mt-6 border-2 border-gray-400 overflow-auto bg-white rounded-2xl">
            <h2 className="px-12 mt-8 text-center text-2xl font-semibold text-[#DC4141]">
                Your Team
            </h2>

            <div className="mt-8 mb-2">
                <div className="flex justify-center text-xl">
                    <FormProvider {...methods}>
                        <form 
                            action="" 
                            className="w-80 mx-auto pb-6 px-4" 
                            onSubmit={handleSubmit(onSubmit)}>
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="" className={illuminated[ + (team.members.length > 0)]}>
                                Member 1
                              </label>
                            </div>
                            <input type="email"
                                {...register("member1", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 0),
                                })}
                                placeholder={(team.members.length > 0) ? team.members[0] : "Member 1"}
                                readOnly={(team.members.length > 0)}
                                className="border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center"/>
                            {errors.member1 && (
                              <p className="text-red-400">{errors.member1.message}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="" className={illuminated[ + (team.members.length > 1)]}>
                                Member 2
                              </label>
                            </div>
                            <input type="email"
                                {...register("member2", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 1),
                                })}
                                placeholder={(team.members.length > 1) ? team.members[1] : "Member 2"}
                                readOnly={(team.members.length > 1)}
                                className="border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center"/>
                            {errors.member2 && (
                              <p className="text-red-400">{errors.member2.message}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="" className={illuminated[ + (team.members.length > 2)]}>
                                Member 3
                              </label>
                            </div>
                            <input type="email"
                                {...register("member3", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 2),
                                })}
                                placeholder={(team.members.length > 2) ? team.members[2] : "Member 3"}
                                readOnly={(team.members.length > 2)}
                                className="border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center"/>
                            {errors.member3 && (
                              <p className="text-red-400">{errors.member3.message}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="" className={illuminated[ + (team.members.length > 3)]}>
                                Member 4
                              </label>
                            </div>
                            <input type="email"
                                {...register("member4", {
                                    validate: validateEmail,
                                    disabled: (team.members.length > 3),
                                })}
                                placeholder={(team.members.length > 3) ? team.members[3] : "Member 4"}
                                readOnly={(team.members.length > 3)}
                                className="border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center"/>
                            {errors.member4 && (
                              <p className="text-red-400">{errors.member4.message}</p>
                            )}
                            <div className="flex justify-center pt-8">
                                <button className="h-12 text-center w-2/3 bg-[#DC4141] border-2 rounded-md hover:shadow-lg hover:bg-gray-800 text-lg transition" type="submit">
                                    <p className="text-white font-normal">Submit</p>
                                </button>
                            </div>
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
