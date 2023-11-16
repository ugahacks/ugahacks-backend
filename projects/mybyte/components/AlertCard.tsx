import React from "react";
import styles from "../styles/AlertCard.module.css";

interface AlertCardProps {
  show: boolean;
  alert_title: string;
  message: string;
  color: string;
  onClose: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  show,
  alert_title,
  message,
  color,
  onClose,
}) => {
  const cardColor = { backgroundColor: color };
  return !show ? null : (
    <div
      style={cardColor}
      className={
        "fixed bottom-4 right-4 p-4 text-white rounded-md shadow-md w-[400px] transition-opacity animate-fade-in"
      }
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Info Icon */}
          <svg
            className="w-5 h-5 mr-2 fill-current text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 2C5.582 2 2 5.582 2 10s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6zm-1-9h2v4h-2zm0 5h2v2h-2z" />
          </svg>

          {/* Heading */}
          <h1>{alert_title}</h1>
        </div>

        {/* Close Button */}
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

      <p className="pt-3 text-sm leading-tighter">{message}</p>
    </div>
  );
};

export default AlertCard;
