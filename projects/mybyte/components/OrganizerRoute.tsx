import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, className = "h-screen min-h-full overflow-auto"  }: { children: React.ReactNode, className?: string }) => {
  const router = useRouter();
  const { user, userInfo, user_type } = useAuth();
  useEffect(() => {
    if (user.uid == null) {
      router.push("/login");
    }
    if (user_type === undefined || user_type === null || user_type !== "service_writer") {
      router.push("/dashboard");
    }
  }, [router, user, user_type]);
  return (
    <div className={className}>
      {user ? children : null}
    </div>
  );
};

export default ProtectedRoute;
