import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      const token = searchParams.get("token");
      const action = searchParams.get("action");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const decoded = jwtDecode(token);

      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role);

      // Useful if you want to show a toast later
      sessionStorage.setItem("oauthAction", action || "login");

      if (decoded.role === "admin") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("OAuth Login Error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#09111B] flex items-center justify-center text-white">
      Signing you in...
    </div>
  );
};

export default OAuthSuccess;
