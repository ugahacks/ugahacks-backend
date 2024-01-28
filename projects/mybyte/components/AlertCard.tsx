import React, { use, useEffect } from "react";
import { set } from "react-hook-form";

interface AlertCardProps {
  show: boolean;
  message: string;
  color: string;
  onClose: () => void;
  position: string;
  className?: string;
}

const AlertCard: React.FC<AlertCardProps> = ({
  className,
  show,
  message,
  color,
  onClose,
  position,
}) => {
  switch (position) {
    case "top-middle":
      position = "fixed top-3 left-1/2 transform -translate-x-1/2";
      break;
    case "bottom-right":
      position = "fixed bottom-4 right-4";
      break;
    default:
      position = "fixed top-5 right-5";
      break;
  }

  return !show ? null : (
    <div
      id="alert-card"
      className={
        position +
        " p-4 text-white rounded-md shadow-md w-[350px] md:w-[500px] animate-fade-in-out " +
        color +
        " " +
        className
      }
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-4 fill-current text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 2C5.582 2 2 5.582 2 10s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6zm-1-9h2v4h-2zm0 5h2v2h-2z" />
          </svg>
          <h1 className="text-sm leading-tighter">{message}</h1>
        </div>
        <button onClick={onClose} className="text-white focus:outline-none">
          <svg
            className="w-4 h-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
