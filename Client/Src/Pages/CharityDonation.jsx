import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import PageTitle from "../Components/PageTitle";

const API_URL = import.meta.env.VITE_API_URL;

const CharityDonation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [charity, setCharity] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD RAZORPAY SCRIPT
  // =====================================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // FETCH CHARITY
  // =====================================================

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/charities/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load charity.");
        }

        setCharity(data.charity);
      } catch (error) {
        setError(error.message || "Unable to load charity.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharity();
  }, [id]);

  // =====================================================
  // DONATE
  // =====================================================

  const handleDonate = async () => {
    const donationAmount = Number(amount);

    if (!Number.isFinite(donationAmount) || donationAmount < 1) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPaymentLoading(true);

      // Load Razorpay checkout
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection.",
        );
      }

      // Create order
      const orderResponse = await fetch(
        `${API_URL}/api/donations/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            charityId: charity._id,
            amount: donationAmount,
          }),
        },
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || "Unable to create donation order.",
        );
      }

      const options = {
        key: orderData.key,

        amount: orderData.order.amount,

        currency: orderData.order.currency,

        name: "GolfImpact",

        description: `Donation to ${charity.name}`,

        order_id: orderData.order.id,

        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/donations/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,

                  razorpay_payment_id: response.razorpay_payment_id,

                  razorpay_signature: response.razorpay_signature,

                  donationId: orderData.donationId,
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Donation verification failed.",
              );
            }

            alert(
              `Thank you! Your ₹${donationAmount} donation was successful.`,
            );

            navigate(`/charities/${charity._id}`);
          } catch (error) {
            alert(error.message || "Unable to verify donation.");
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        theme: {
          color: "#482ECE",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setPaymentLoading(false);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Donation Error:", error);

      alert(error.message || "Unable to process donation.");

      setPaymentLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B] text-white">
        Loading charity...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !charity) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09111B] px-6 text-center">
        <p className="text-red-400">{error || "Charity not found."}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded-xl bg-[#482ECE] px-5 py-3 font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Charity Donation" />
      <div className="min-h-screen bg-[#09111B] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate(`/charities/${charity._id}`)}
            className="mb-7 flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Charity
          </button>

          <div className="grid gap-7 lg:grid-cols-[1fr_420px]">
            {/* CHARITY */}

            <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#482ECE]/10">
                  {charity.image ? (
                    <img
                      src={charity.image}
                      alt={charity.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Heart size={38} className="text-[#9A8DFF]" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#9A8DFF]">
                    {charity.category}
                  </p>

                  <h1 className="mt-2 text-3xl font-bold">{charity.name}</h1>

                  {charity.location && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={16} />
                      {charity.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-7">
                <h2 className="text-lg font-bold">About this charity</h2>

                <p className="mt-3 leading-7 text-gray-400">
                  {charity.description}
                </p>
              </div>
            </div>

            {/* DONATION */}

            <div className="h-fit rounded-2xl border border-gray-800 bg-[#0D1520] p-6 shadow-xl shadow-black/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#482ECE]/15 text-[#9A8DFF]">
                <Heart size={24} />
              </div>

              <h2 className="mt-5 text-2xl font-bold">Make a Donation</h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Support {charity.name} with an independent donation.
              </p>

              {/* QUICK AMOUNTS */}

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(String(quickAmount))}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      Number(amount) === quickAmount
                        ? "border-[#482ECE] bg-[#482ECE]/20 text-white"
                        : "border-gray-700 text-gray-300 hover:border-[#482ECE]"
                    }`}
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>

              {/* AMOUNT */}

              <label className="mt-6 block text-sm font-semibold text-gray-300">
                Donation Amount
              </label>

              <div className="relative mt-2">
                <IndianRupee
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#482ECE]"
                />
              </div>

              {/* PAY */}

              <button
                type="button"
                onClick={handleDonate}
                disabled={paymentLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#482ECE] px-5 py-3.5 font-semibold text-white transition hover:bg-[#5A42E5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Heart size={18} />

                {paymentLoading
                  ? "Processing..."
                  : amount
                    ? `Donate ₹${amount}`
                    : "Donate Now"}
              </button>

              {/* SECURITY */}

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-500/10 bg-green-500/5 p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div>
                  <p className="text-sm font-semibold text-green-400">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Payment is securely processed through Razorpay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharityDonation;
