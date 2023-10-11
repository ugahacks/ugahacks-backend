import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, className= "container"}: { children: React.ReactNode, className?: string}) => {
  const router = useRouter();
  const { user, userInfo } = useAuth();

  useEffect(() => {
    if (user.uid == null) {
      router.push("/login");
    }
  }, [router, user]);
  return (
    <div className={className}>
      {user ? children : null}
    </div>
  );
};

export default ProtectedRoute;
