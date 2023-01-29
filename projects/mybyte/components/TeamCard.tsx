import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
  } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { TeamType } from "../context/AuthContext";

  
  export default function TeamCard(props: {team: TeamType, tid: string}) {
    const {linkUserToTeam, denyTeams} = useAuth();
    const router = useRouter();
  
    function handleClickConfirm() {
        linkUserToTeam(props.tid);
        router.push("/team");
    }

    function handleClickDeny() {
        denyTeams(props.tid, "==");
        router.push("/team");
    }

    let membersText: JSX.Element[] = [];
    props.team.members.forEach((elem, index) => {
        membersText.push(
            <Typography variant="h5" key={index} className="mb-2 text-left">
                Email: {elem}
            </Typography>
        );
    });
  
    return (
      <>
        <Card className="w-100 bg-opacity-75 bg-white rounded-lg mb-4 mx-3">
          <CardBody className="text-center">
            <Typography variant="h4" className="mb-4">Members</Typography>
              {membersText}
          </CardBody>
          <CardFooter className="flex justify-around">
            <button onClick={handleClickConfirm} className="rounded-full px-2 border-2 transition-colors border-green-600 text-green-600 hover:text-white hover:bg-green-600">
                <Typography variant="h5">
                    Confirm
                </Typography>
            </button>
            <button onClick={handleClickDeny} className="rounded-full px-2 border-2 transition-colors border-red-600 text-red-600 hover:text-white hover:bg-red-600">
                <Typography variant="h5">
                    Deny
                </Typography>
            </button>
          </CardFooter>
        </Card>
      </>
    );
  }
  