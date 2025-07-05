import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/User.Context";
import { useNavigate } from "react-router-dom";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
