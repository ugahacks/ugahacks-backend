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

export default function EventRect(props: {
  event: EventDetail;
  disabled: boolean | null;
}) {
  const router = useRouter();

  function handleClick() {
    router.push(props.event.page);
  }
  let statusName: string = "open";
  let statusClass: string = "border-green-800 text-green-700";
  let dup = new Date(props.event.endDate);
  dup.setDate(props.event.endDate.getDate() + 1);
  if (new Date() > dup) {
    statusName = "closed";
    statusClass = "border-primary-500 text-primary-500";
  }
  const dateOpt: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const gray = props.disabled ? "grayscale-[20%]" : "";
  return (
    <div
      onClick={!props.disabled ? handleClick : () => {}}
      className={props.disabled ? "cursor-default opacity-70" : ""}
    >
      <Card className="w-96">
        <CardHeader color="blue" className="h-28 w-96 mx-0">
          <Image
            src={props.event.image}
            alt="img-blur-shadow"
            className={"h-full w-60 object-contain" + gray}
            fill
          />
        </CardHeader>
        <CardBody className="p-0">
          <Typography
            variant="h2"
            className="mb-2 text-bold text-left pl-3 text-sm"
          >
            Deadline to apply:{" "}
            {props.event.deadline.toLocaleDateString("default", dateOpt)}
          </Typography>
          <div className="flex justify-between mx-3 pb-2 text-xs">
            <Typography className="text-xs ">
              {props.event.startDate.toLocaleDateString("default", dateOpt)} -{" "}
              {props.event.endDate.toLocaleDateString("default", dateOpt)}
            </Typography>
            <Typography
              className={`text-xs border-2 rounded px-2 font-mono ${statusClass}`}
            >
              {statusName}
            </Typography>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
