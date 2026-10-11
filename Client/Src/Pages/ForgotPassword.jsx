import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../Components/Navbar.jsx";
import PageTitle from "../Components/PageTitle.jsx";
import Button from "../Components/Button.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetGrant, setResetGrant] = useState("");

  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const otpInputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const digits = otp.padEnd(6, " ").split("");
    digits[index] = digit || " ";

    const updatedOtp = digits.join("").replace(/ /g, "");
    setOtp(updatedOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      const digits = otp.padEnd(6, " ").split("");

      if (digits[index]?.trim()) {
        digits[index] = " ";
        setOtp(digits.join("").replace(/ /g, ""));
      } else if (index > 0) {
        digits[index - 1] = " ";
        setOtp(digits.join("").replace(/ /g, ""));
        otpInputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(pastedOtp);

    const focusIndex = Math.min(pastedOtp.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  useEffect(() => {
    if (step !== 2) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const secondsRemaining = otpExpiresAt
    ? Math.max(0, Math.ceil((otpExpiresAt - now) / 1000))
    : 0;

  const resendSeconds = resendAvailableAt
    ? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))
    : 0;

  const formattedTime = `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`;

  const requestOtp = async (isResend = false) => {
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      const currentTime = Date.now();

      setOtp("");
      setOtpExpiresAt(currentTime + 5 * 60 * 1000);
      setResendAvailableAt(currentTime + 60 * 1000);
      setNow(currentTime);

      setSuccess(
        "If an account exists with this email, you'll receive a 6-digit verification code. Please check your inbox and spam folder.",
      );

      setStep(2);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (secondsRemaining <= 0) {
      setError("OTP expired. Please request a new code.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setResetGrant(data.resetGrant);
      setOtp("");
      setStep(3);
      setSuccess("Email verified. Create your new password.");
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          resetGrant,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setPassword("");
      setConfirmPassword("");
      setResetGrant("");
      setStep(4);

      setSuccess("Password reset successfully. You can now login.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 rounded-[10px] border-2 border-gray-700 bg-transparent px-3 text-sm text-white outline-none transition-all focus:border-[#482ECE]";

  return (
    <>
      <PageTitle title="Forgot Password | GolfImpact" />
      <Navbar />

      <section className="min-h-screen bg-[#09111B] px-4 pt-28 pb-16 flex justify-center items-start">
        <div className="w-full max-w-lg bg-gray-950/90 border-2 border-gray-700 rounded-2xl p-6 sm:p-9 text-white">
          {/* HEADER */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#482ECE]/20 flex items-center justify-center text-[#9A8DFF]">
              {step === 1 ? (
                <Mail size={27} />
              ) : step === 2 ? (
                <ShieldCheck size={27} />
              ) : (
                <LockKeyhole size={27} />
              )}
            </div>

            <h1 className="text-2xl font-semibold">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verify Your Email"}
              {step === 3 && "Create New Password"}
              {step === 4 && "Password Reset!"}
            </h1>

            <p className="text-gray-400 text-sm leading-6">
              {step === 1 &&
                "Enter your registered email address to receive a 6-digit verification code."}

              {step === 2 &&
                `Enter the 6-digit verification code sent to ${email}.`}

              {step === 3 &&
                "Your email is verified. Choose a secure new password."}

              {step === 4 && "Your password has been updated successfully."}
            </p>
          </div>

          {/* STEP INDICATOR */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    item <= step ? "bg-[#6C50F5]" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
          )}

          {/* MESSAGES */}
          {error && (
            <div className="mt-6 border border-red-500/40 bg-red-500/10 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 border border-green-500/40 bg-green-500/10 text-green-400 rounded-lg p-3 text-sm">
              {success}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reset-email" className="text-sm">
                  Email Address
                </label>

                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reset-otp" className="text-sm">
                  Verification Code
                </label>

                <div
                  className="grid grid-cols-6 gap-2 sm:gap-3"
                  onPaste={handleOtpPaste}
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      aria-label={`OTP digit ${index + 1}`}
                      className="
        w-full min-w-0 h-12 sm:h-14
        rounded-xl
        border-2 border-gray-700
        bg-[#0D1520]
        text-center text-xl sm:text-2xl
        font-semibold text-white
        outline-none
        transition-all
        focus:border-[#6C50F5]
        focus:ring-2 focus:ring-[#6C50F5]/20
      "
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">OTP expires in</span>

                <span
                  className={`font-semibold ${
                    secondsRemaining <= 60 ? "text-red-400" : "text-[#9A8DFF]"
                  }`}
                >
                  {formattedTime}
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading || secondsRemaining <= 0 || otp.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-400">Didn't receive the code? </span>

                <button
                  type="button"
                  disabled={loading || resendSeconds > 0}
                  onClick={() => requestOtp(true)}
                  className="text-[#9A8DFF] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendSeconds > 0
                    ? `Resend in ${resendSeconds}s`
                    : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="text-gray-400 hover:text-white text-sm mx-auto block"
              >
                Change Email
              </button>
              <div className="mt-6 border-t border-gray-800 pt-5 text-center">
                <p className="text-sm text-gray-400 leading-6">
                  Didn't receive the OTP? Check your
                  <span className="text-white"> Inbox or Spam folder</span>, or
                  make sure you entered the correct email address.
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  Don't have a GolfImpact account?{" "}
                  <Link
                    to="/sign-up"
                    className="font-medium text-[#9A8DFF] hover:text-white transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="new-password" className="text-sm">
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`${inputClass} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirm-password" className="text-sm">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className={`${inputClass} pr-12`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="mt-8">
              <Link
                to="/login"
                className="flex items-center justify-center bg-[#482ECE] hover:bg-[#6C50F5] transition-colors text-white rounded-xl h-12 font-medium"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {/* BACK TO LOGIN */}
          {step !== 4 && (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 mt-8 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          )}
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
