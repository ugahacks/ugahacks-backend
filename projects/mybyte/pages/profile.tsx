import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { Avatar, Card, CardBody, CardHeader } from "@material-tailwind/react";

const ProfilePage = () => {
  const { user, userInfo } = useAuth();
console.log(user.uid);
  return (
    <ProtectedRoute>
      <Card className="h-full">
        <CardHeader className="bg-[url('/UGAHacks8TanBG.png')] bg-fixed mt-2">
          <div className="flex justify-center items-center">
            <Avatar className="h-24 w-24 mt-20 mb-2 rounded-full ring-2 ring-white bg-white" src="/byte_mini.png" alt="MyByte"/>
          </div>
          <h2 className="text-5xl font-semibold text-center text-teal-900 mt-2 mb-2">
            {userInfo.first_name} {userInfo.last_name}
          </h2>
        </CardHeader>
        <CardBody>
          <h2 className="text-2xl text-gray-600 font-semibold pt-10 text-center">
              Points: {userInfo.points}
            </h2>
            <div className="flex justify-center items-center">
              <button className="pt-10">
              <QRCodeCanvas
                id="qrCode"
                size={300}
                value={user.uid}
                level={"H"}
                />
              </button>
            </div>
        </CardBody>
      </Card>
    </ProtectedRoute>
  );
};

export default ProfilePage;
