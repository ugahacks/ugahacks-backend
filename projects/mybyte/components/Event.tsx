import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import { useRouter } from "next/router";
export interface EventDetail {
  key: string;
  eventName: string;
  date: string;
  description: string;
  page: string;
  in_person: boolean;
  image: string;
}

export default function Event(props: EventDetail) {
  const router = useRouter();

  function handleClick() {
    router.push(props.page);
  }

  return (
    <div onClick={handleClick}>
      <Card className="w-96 shadow-[#DC4141]">
        <CardHeader color="blue" className="relative h-56">
          <Image
            src={props.image}
            alt="img-blur-shadow"
            fill
            className="h-full w-full object-contain"
          />
        </CardHeader>
        <CardBody className="text-center">
          <Typography variant="h5" className="mb-2">
            {props.eventName}
          </Typography>
          <Typography>{props.date}</Typography>
          <Typography>{props.description}</Typography>
          <Typography className="text-[#DC4141]">
            {props.in_person ? "In-Person" : "Hybrid (In-Person & Virtual)"}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}
