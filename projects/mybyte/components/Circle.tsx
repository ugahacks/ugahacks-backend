import React from "react";

interface CircleProps {
  className?: string;
}

const Circle: React.FC<CircleProps> = ({ className }) => {
  return (
    <div className="relative">
      <div className={className}></div>
    </div>
  );
};

export default Circle;
