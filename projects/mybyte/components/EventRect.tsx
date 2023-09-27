import React from "react";
import Image from "next/image";
import vercelPic from "../public/vercel.svg";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { EventStatus } from "../enums/eventStatus";
import { Events } from "../enums/events";
import hacks8Byte from "../public/byte_mini.png";

export interface EventDetail {
  key: Events;
  startDate: Date;
  endDate: Date;
  deadline: Date;
  page: string;
  image: string;
}

export default function EventRect(props: EventDetail) {
  const router = useRouter();

  function handleClick() {
    router.push(props.page);
  }
  let statusName: string = "open";
  let statusClass: string = "border-green text-green";
  let dup = new Date(props.endDate);
  dup.setDate(props.endDate.getDate() + 1);
  if ((new Date()) > dup) {
    statusName = "closed";
    statusClass = "border-primary text-primary-500";
  }

  return (
    <div onClick={handleClick}>
      <Card className="w-60 shadow-[#DC4141]">
        <CardHeader color="blue" className="">
          <Image
            src={props.image}
            alt="img-blur-shadow"
            fill
            className="h-full w-full object-contain"
          />
        </CardHeader>
        <CardBody className="text-center">
          <Typography variant="h5" className="mb-2 text-bold">
            Deadline to apply: {props.deadline.toLocaleDateString("default", {"year": "numeric", "month": "long", "day": "numeric"})}
          </Typography>
          <div className="flex justify-between">
            <Typography>{props.startDate.toLocaleDateString("default", {"year": "numeric", "month": "long", "day": "numeric"})} - {props.endDate.toLocaleDateString("default", {"year": "numeric", "month": "long", "day": "numeric"})}</Typography>
            <Typography className={`border ${statusClass}`}>{statusName}</Typography>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
