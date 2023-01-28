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
    const {linkUserToTeam} = useAuth();
    const router = useRouter();
  
    function handleClick() {
        linkUserToTeam(props.tid);
        router.push("/team");
    }

    let membersText: JSX.Element[] = [];
    props.team.members.forEach((elem, index) => {
        membersText.push(
            <Typography variant="h5" key={index}>
                Email: {elem}
            </Typography>
        );
    });
  
    return (
      <>
        <div onClick={handleClick}>
            <Card className="w-100 bg-opacity-75 rounded-lg">
              <CardBody className="text-center">
                <Typography variant="h4" className="mb-4">Members:</Typography>
                <Typography variant="h5" className="mb-2 text-left">
                  {membersText}
                </Typography>
              </CardBody>
            </Card>
        </div>
      </>
    );
  }
  