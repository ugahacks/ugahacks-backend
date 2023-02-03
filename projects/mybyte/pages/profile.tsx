import React, { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody } from "@material-tailwind/react";
import Image from "next/image";
var QRCode = require("qrcode");

const ProfilePage = () => {
    const {user, userInfo, /*getTeam*/} = useAuth();
    let [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
    const opts = {
        errorCorrectionLevel: "H",
        width: 200,
    }
    if (canvas === null) {
        QRCode.toCanvas(user.uid, function (error: unknown, canvas: any) {
            if (error) console.error(error)
            else console.log('success!');
            setCanvas(canvas);
        });
    }

    return (
        <ProtectedRoute className="h-[82vh] min-h-full overflow-auto">
            <div className="text-gray-600 px-12 pt-12 mx-auto h-4/5" id="parent-div">
                <div className="mb-5 text-center" id="intro-div">
                    <h2 className="text-5xl font-semibold my-2">Hey {`${userInfo.first_name} ${userInfo.last_name}`},</h2>
                    <span className="text-xl italic my-2">Ready to Hack?</span>
                    <Card>
                        <CardBody>
                            <h3>Info:</h3>
                            <p>
                                Email: {user.email},<br/>
                            </p>
                            <p>Quick Links: {}</p>
                        </CardBody>
                    </Card>
                </div>
                <div className="text-2xl text-center" id="points-div">
                    <span>
                        Points: 
                        <span className="text-[#DC4141]">
                            &nbsp;{userInfo.points}&nbsp;
                        </span>
                    </span>
                </div>
                <div className="flex justify-center my-3 h-3/5" id="qr-code-div">
                    {(canvas == null) ? '' : <Image src={canvas.toDataURL()} width={opts.width} height={opts.width} alt={`QRCode for ${userInfo.first_name} ${userInfo.last_name}`}/>}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default ProfilePage;