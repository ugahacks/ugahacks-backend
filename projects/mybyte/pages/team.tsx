import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TeamType, useAuth } from "../context/AuthContext";
import ProtectedRoute from '../components/ProtectedRoute';
import { FirebaseError } from 'firebase/app';
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";

interface MemberType {
    member1: string,
    member2: string,
    member3: string,
    member4: string,
}

export default function Team() {
    const {getTeam, userCreateTeam, addToTeam} = useAuth();
    let [team, setTeam] = useState({members: [""]});
    useEffect( () => {
        const getInfo = async () => {
            let t = await getTeam();
            if (t === null) setTeam({ members: [""]});
            else setTeam(t);
        };
        getInfo();
    }, [setTeam, getTeam]);

    const router = useRouter();

    const noTeam = (
        <div className="sign-up-form container mx-auto w-96 mt-12 border-2 border-gray-400 overflow-auto bg-white rounded-md">
            <h2 className="px-12 mt-8 text-center text-xl">
                Sorry, you are not in a team yet.
            </h2>

            <div className="mt-8 mb-8">
                <div className="flex justify-center text-xl">
                    <p className="text-cyan-500">
                        <button onClick={(e) => {
                            e.preventDefault();
                            // fetch("api/createTeam", {method: "POST", body: JSON.stringify(user)}).then( () => {
                            //     const getInfo = async () => {
                            //         let t = await getTeam();
                            //         if (t === null) setTeam({ members: [""]});
                            //         else setTeam(t);
                            //     };
                            //     getInfo();
                            // });
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
        </div>);

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
                                {...register("member1")}
                                placeholder={(team.members.length > 0) ? team.members[0] : "Member 1"}
                                disabled={(team.members.length > 0)}/>
                            <input type="email"
                                {...register("member2")}
                                placeholder={(team.members.length > 1) ? team.members[1] : "Member 2"}
                                disabled={(team.members.length > 1)}/>
                            <input type="email"
                                {...register("member3")}
                                placeholder={(team.members.length > 2) ? team.members[2] : "Member 3"}
                                disabled={(team.members.length > 2)}/>
                            <input type="email"
                                {...register("member4")}
                                placeholder={(team.members.length > 3) ? team.members[3] : "Member 4"}
                                disabled={(team.members.length > 3)}/>
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
