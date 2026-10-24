import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Users } from "../enums/userType";

const OrganizerRoute = ({ children, className = "h-screen min-h-full overflow-auto" }: { children: React.ReactNode, className?: string }) => {
    const router = useRouter();
    const { user, user_type } = useAuth();
    const canScan = user_type === Users.organizer || user_type === Users.admin;

    useEffect(() => {
        if (user.uid == null) {
            router.replace("/login");
        } else if (!canScan) {
            router.replace("/dashboard");
        }
    }, [router, user.uid, canScan]);

    return (
        <div className={className}>
            {user.uid != null && canScan ? children : null}
        </div>
    );
};

export default OrganizerRoute;
