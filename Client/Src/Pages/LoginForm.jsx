import Button from "../Components/Button.jsx";
import Navbar from "../Components/Navbar.jsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import GoogleLogo from "../../assests/image/Google-logo.png";
import FacebookLogo from "../../assests/image/Facebook-logo.webp";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import PageTitle from "../Components/PageTitle.jsx";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oauthError = searchParams.get("error");

  const oauthErrorMessages = {
    session_invalid: "Your session is no longer valid. Please login again.",

    account_deactivated:
      "Your account has been deactivated. Please contact admin support.",

    account_not_found: "No account was found. Please create an account first.",

    google: "Google login failed. Please try again.",

    facebook: "Facebook login failed. Please try again.",
  };

  const oauthErrorMessage = oauthErrorMessages[oauthError];

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8180/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // token save
      localStorage.setItem("token", data.token);

      // user info save
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user?.role);

      // Check if account was just created manually
      const justRegistered =
        sessionStorage.getItem("justRegistered") === "true";

      if (data.user?.role === "admin") {
        sessionStorage.removeItem("justRegistered");

        navigate("/admin", {
          replace: true,
        });
      } else {
        // Same flag UserDashboard already reads
        sessionStorage.setItem(
          "oauthAction",
          justRegistered ? "signup" : "login",
        );

        sessionStorage.removeItem("justRegistered");

        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Login GolfImapct" />

      <Navbar />

      <section className="flex lg:mt-28 mt-20 flex-col gap-30">
        <div className="flex justify-center gap-7 w-full px-4">
          <div className="bg-gray-950/90 w-full max-w-md lg:max-w-lg flex p-9 rounded-2xl border-2 border-gray-700 flex-col gap-8">
            {/* Heading */}
            <div className="flex flex-col gap-2 items-center text-white">
              <h1 className="text-2xl font-medium">Welcome Back!</h1>

              <p>Login to continue</p>
            </div>

            {oauthErrorMessage && (
              <div className="border border-red-500/40 bg-red-500/10 text-red-400 rounded-lg p-3 text-[13px] text-center">
                {oauthErrorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="text-white w-full">
              <div className="flex flex-col gap-6 w-full">
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[14px]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="password" className="text-[14px]">
                    Enter Password
                  </label>

                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    autoComplete="current-password"
                    className="border-3 border-gray-700 lg:p-2.5 p-1.5 pr-10 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                    required
                  />

                  {passwordVisible ? (
                    <EyeOff
                      className="absolute right-3 top-11 cursor-pointer text-gray-500"
                      size={18}
                      onClick={() => setPasswordVisible(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 top-11 cursor-pointer text-gray-500"
                      size={18}
                      onClick={() => setPasswordVisible(true)}
                    />
                  )}
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex w-full justify-end mt-8">
                <a href="#" className="text-[#482ece] text-[14px]">
                  Forgot Password?
                </a>
              </div>

              <div className="flex justify-center flex-col gap-8 mt-8 items-center">
                {/* Login Button */}
                <div className="flex w-full justify-center">
                  <Button
                    className="w-full font-medium lg:text-xl text-[14px]"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>

                {/* Social Login */}
                <div className="flex items-center justify-center gap-4 flex-col">
                  <div>
                    <h4>Login with</h4>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          "http://localhost:8180/api/auth/google?intent=login";
                      }}
                    >
                      <img
                        src={GoogleLogo}
                        alt="Continue with Google"
                        className="w-6 h-6"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          "http://localhost:8180/api/auth/facebook?intent=login";
                      }}
                    >
                      <img
                        src={FacebookLogo}
                        alt="Continue with Facebook"
                        className="w-6 h-6"
                      />
                    </button>
                  </div>
                </div>

                {/* Signup */}
                <div className="block h-full mb-0">
                  <p className="text-[14px]">
                    Don't have an account?
                    <Link to="/sign-up" className="text-[#482ece]">
                      &nbsp; Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </form>

            {/* Terms */}
            <div>
              <p className="text-white text-[12px] text-center">
                By logging in, you agree to our &nbsp;
                <a href="#" className="text-[#482ECE]">
                  Terms & Conditions &nbsp;
                </a>
                and &nbsp;
                <a href="#" className="text-[#482ECE]">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
