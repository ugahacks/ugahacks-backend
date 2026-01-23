import React from "react";
import { Events } from "../enums/events";
import { EventStatus } from "../enums/eventStatus";

function assignColor(evt: EventStatus): string {
    let str = "";
    switch(evt) {
        case EventStatus.Accepted:
            str = "bg-green-200";
            break;
        case EventStatus.NotRegistered:
            str = "bg-yellow-200";
            break;
        case EventStatus.Registered:
            str = "bg-green-200";
            break;
        case EventStatus.RegistrationClosed:
            str = "bg-grey-200";
            break;
        case EventStatus.Rejected:
            str = "bg-red-200";
            break;
        default:
            str = "bg-grey-200";
    }
    return str;
}

function colorCode(props: any): JSX.Element {
    const which = Events.hacks8 in props.registered ?
        EventStatus.Registered : EventStatus.NotRegistered;
    return (
        <span className={assignColor(which)}>
          {which}
        </span>
    );
}

export default colorCode;