import Button from "../Components/Button";
import GolfMenImage from "../../assests/image/men-golf-image.png";
import { Link, useNavigate } from "react-router-dom";

import {
  Crown,
  Spotlight,
  HandHelping,
  Merge,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import GoogleLogo from "../../assests/image/Google-logo.png";
import FacebookLogo from "../../assests/image/Facebook-logo.webp";
import { useState } from "react";
import PageTitle from "../Components/PageTitle";

const API_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    phone: "",
    password: "",
    gender: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      setSuccess(data.message || "Account created successfully.");

      setFormData({
        name: "",
        email: "",
        dateOfBirth: "",
        phone: "",
        password: "",
        gender: "",
      });

      setTermsAccepted(false);

      // Redirect to login after successful signup
      // Remember that this user has just created an account
      sessionStorage.setItem("justRegistered", "true");

      // Redirect to login after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      setError(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Sign-up" />

      <Navbar />

      <section className="flex lg:mt-28 mt-20 flex-col gap-30">
        <div className="flex justify-center gap-7 w-full px-4">
          <div className="bg-gray-950/90 w-full max-w-md lg:max-w-204 flex p-3 md:p-9 lg:p-9 rounded-2xl border-2 border-gray-700 flex-col gap-8">
            <div className="flex flex-col gap-2 items-center text-white">
              <h1 className="text-2xl font-medium">Create Your Account</h1>

              <p className="text-[15px]">Join GolfImpact today</p>
            </div>

            <form onSubmit={handleSubmit} className="text-white w-full">
              <div className="flex flex-col lg:gap-4 gap-2 w-full">
                {/* NAME + EMAIL */}

                <div className="flex justify-between w-full gap-3.5 flex-col md:flex-row lg:flex-row">
                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="name" className="text-[14px]">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="email" className="text-[14px]">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your Email"
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                      required
                    />
                  </div>
                </div>

                {/* DOB + PHONE */}

                <div className="flex justify-between w-full gap-3.5 flex-col md:flex-row lg:flex-row">
                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="dateOfBirth" className="text-[14px]">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="phone" className="text-[14px]">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD + GENDER */}

                <div className="flex justify-between w-full gap-3.5 flex-col md:flex-row lg:flex-row">
                  <div className="flex flex-col gap-2 relative w-full">
                    <label htmlFor="password" className="text-[14px]">
                      Password
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a Password"
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 pr-10 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25"
                      required
                    />

                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-11 cursor-pointer text-gray-500"
                        size={18}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-11 cursor-pointer text-gray-500"
                        size={18}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="gender" className="text-[14px]">
                      Gender
                    </label>

                    <select
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="border-3 border-gray-700 lg:p-2.5 p-1.5 outline-0 rounded-[10px] focus:border-[#482ECE] transition-all text-[12px] h-12.25 bg-gray-950"
                      required
                    >
                      <option value="">Select</option>

                      <option value="male">Male</option>

                      <option value="female">Female</option>

                      <option value="not-specify">Not Specify</option>
                    </select>
                  </div>
                </div>

                {/* TERMS */}

                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="checkbox"
                    id="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4"
                  />

                  <label htmlFor="checkbox" className="text-[14px]">
                    I agree to the{" "}
                    <Link to="/terms" className="text-[#482ECE]">
                      Terms & Conditions
                    </Link>
                  </label>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="border border-red-500/40 bg-red-500/10 text-red-400 rounded-lg p-3 text-[13px]">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div className="border border-green-500/40 bg-green-500/10 text-green-400 rounded-lg p-3 text-[13px]">
                    {success}
                  </div>
                )}

                {/* BUTTON */}

                <div className="flex w-full justify-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-medium lg:text-xl text-[14px]"
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </div>

                {/* LOGIN */}

                <div className="flex justify-center items-center flex-col gap-4">
                  <p>
                    Already have an account ? &nbsp;
                    <Link to="/login" className="text-[#482ECE]">
                      Login
                    </Link>
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `${API_URL}/api/auth/google?intent=signup`;
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
                        window.location.href = `${API_URL}/api/auth/facebook?intent=signup`;
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
              </div>
            </form>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex-col gap-10 md:hidden lg:block hidden">
            <div>
              <img
                src={GolfMenImage}
                alt="Golfer holding a golf club"
                className="w-50 h-90"
              />
            </div>

            <div className="flex justify-center flex-col gap-3">
              <div className="text-blue-500 flex items-center gap-4 hover:text-[#AB4AFD] transition-all delay-75">
                <Crown />
                <p>Win Rewards</p>
              </div>

              <div className="text-blue-500 flex items-center gap-4 hover:text-[#AB4AFD] transition-all delay-75">
                <Spotlight />
                <p>Track Performance</p>
              </div>

              <div className="text-blue-500 flex items-center gap-4 hover:text-[#AB4AFD] transition-all delay-75">
                <HandHelping />
                <p>Support Charities</p>
              </div>

              <div className="text-blue-500 flex items-center gap-4 hover:text-[#AB4AFD] transition-all delay-75">
                <Merge />
                <p>Join a Community</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
