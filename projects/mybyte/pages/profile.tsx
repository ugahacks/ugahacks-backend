import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
    const {user, userInfo} = useAuth();

    return (
        <ProtectedRoute className="h-[82vh] min-h-full overflow-auto">
            <div className="text-gray-600 px-12 pt-12 mx-auto h-4/5" id="parent-div">
                <div className="mb-5 text-center" id="intro-div">
                    <h2 className="text-5xl font-semibold my-2">Hey {userInfo.first_name},</h2>
                    <span className="text-xl italic my-2">Ready to Hack?</span>
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
                    <img className="object-cover" alt="QR code for user authentification" src="data:image/png;base64,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"></img>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default ProfilePage;