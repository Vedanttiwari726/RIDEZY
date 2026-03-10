import React, { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";

const UserProtectWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(UserDataContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      /* NO TOKEN */
      if (!token) {
        if (mounted) {
          setLoading(false);
          navigate("/login", { replace: true });
        }
        return;
      }

      /* USER ALREADY IN CONTEXT */
      if (user) {
        if (mounted) setLoading(false);
        return;
      }

      /* VERIFY TOKEN FROM SERVER */
      try {
        const res = await api.get("/users/profile");
        if (mounted) {
          setUser(res.data);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem("token");
        if (mounted) {
          setLoading(false);
          navigate("/login", { replace: true });
        }
      }
    };

    verifyUser();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  /* PREVENT FLICKER REDIRECT BUG */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  return <Outlet />;
};

export default UserProtectWrapper;