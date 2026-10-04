import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CreditCard,
  Heart,
  Trophy,
  BarChart3,
  LogOut,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Search,
  MapPin,
} from "lucide-react";
import PageTitle from "./PageTitle";

const API_URL = import.meta.env.VITE_API_URL;

const UserDashboard = () => {
  const navigate = useNavigate();
  // =====================================================
  // DASHBOARD STATES
  // =====================================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [proofUploadingId, setProofUploadingId] = useState(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);

  const [profileModal, setProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(null);
  const [subscriptionCancelling, setSubscriptionCancelling] = useState(false);
  const [oauthAction, setOauthAction] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  // =====================================================
  // SCORE STATES
  // =====================================================

  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);

  const [scoreModal, setScoreModal] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const [scoreForm, setScoreForm] = useState({
    score: "",
    date: "",
  });

  // =====================================================
  // CHARITY STATES
  // =====================================================

  const [charities, setCharities] = useState([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);

  const [charitySearch, setCharitySearch] = useState("");

  const [selectedCharityId, setSelectedCharityId] = useState("");

  const [contributionPercentage, setContributionPercentage] = useState(10);

  const [charitySaving, setCharitySaving] = useState(false);

  const [charityCategory, setCharityCategory] = useState("");
  const [charityLocation, setCharityLocation] = useState("");

  // =====================================================
  // PARTICIPATION STATES
  // =====================================================

  const [participation, setParticipation] = useState(null);
  const [participationLoading, setParticipationLoading] = useState(true);

  const [accountDeleting, setAccountDeleting] = useState(false);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/dashboard/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }

      setDashboard(data.dashboard);
      setError("");
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);

      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH SCORES
  // =====================================================

  const fetchScores = async () => {
    try {
      setScoresLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/scores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      // Subscription required
      if (response.status === 403) {
        setScores([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load scores");
      }

      setScores(data.scores || []);
    } catch (err) {
      console.error("Fetch Scores Error:", err);
      setScores([]);
    } finally {
      setScoresLoading(false);
    }
  };

  // =====================================================
  // FETCH CHARITIES
  // =====================================================

  const fetchCharities = async () => {
    try {
      setCharitiesLoading(true);

      const response = await fetch(`${API_URL}/api/charities`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load charities");
      }

      const charityList =
        data.charities || data.data || (Array.isArray(data) ? data : []);

      setCharities(
        charityList.filter((charityItem) => charityItem.active !== false),
      );
    } catch (err) {
      console.error("Fetch Charities Error:", err);

      setCharities([]);
    } finally {
      setCharitiesLoading(false);
    }
  };

  // =====================================================
  // FETCH PARTICIPATION SUMMARY
  // =====================================================

  const fetchParticipation = async () => {
    try {
      setParticipationLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/draws/my-participation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load participation summary");
      }

      setParticipation(data);
    } catch (err) {
      console.error("PARTICIPATION ERROR:", err);
      setParticipation(null);
    } finally {
      setParticipationLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
    fetchScores();
    fetchParticipation();
  }, []);

  useEffect(() => {
    const action = sessionStorage.getItem("oauthAction");

    if (action) {
      setOauthAction(action);
    }
  }, []);

  // =====================================================
  // LOAD CHARITIES WHEN CHARITY SECTION OPENS
  // =====================================================

  useEffect(() => {
    if (activeSection === "charity") {
      fetchCharities();
    }
  }, [activeSection]);

  // =====================================================
  // SYNC CURRENT SELECTED CHARITY
  // =====================================================

  useEffect(() => {
    const currentCharity = dashboard?.charity?.charity;

    if (currentCharity?._id) {
      setSelectedCharityId(currentCharity._id);

      setContributionPercentage(
        dashboard?.charity?.contributionPercentage || 10,
      );
    }
  }, [dashboard]);

  // =====================================================
  // CHANGE SECTION
  // =====================================================

  const changeSection = (section) => {
    setActiveSection(section);

    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // =====================================================
  // FORMAT DRAW MONTH
  // =====================================================

  const formatDrawMonth = (month) => {
    if (!month) return "-";

    const [year, monthNumber] = month.split("-");

    const date = new Date(Date.UTC(Number(year), Number(monthNumber) - 1, 1));

    return date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  // =====================================================
  // INVALID SESSION
  // =====================================================

  const handleInvalidSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login?error=session_invalid", {
      replace: true,
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Clear welcome-flow flags
    sessionStorage.removeItem("oauthAction");
    sessionStorage.removeItem("justRegistered");

    window.location.href = "/login";
  };

  // =====================================================
  // OPEN ADD SCORE
  // =====================================================

  const openAddScore = () => {
    setEditingScore(null);

    setScoreForm({
      score: "",
      date: "",
    });

    setScoreModal(true);
  };

  // =====================================================
  // OPEN EDIT SCORE
  // =====================================================

  const openEditScore = (item) => {
    setEditingScore(item);

    setScoreForm({
      score: item.score,
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
    });

    setScoreModal(true);
  };

  // =====================================================
  // CLOSE SCORE MODAL
  // =====================================================

  const closeScoreModal = () => {
    if (scoreLoading) return;

    setScoreModal(false);
    setEditingScore(null);

    setScoreForm({
      score: "",
      date: "",
    });
  };

  // =====================================================
  // ADD / UPDATE SCORE
  // =====================================================

  const handleScoreSubmit = async (e) => {
    e.preventDefault();

    const numericScore = Number(scoreForm.score);

    if (
      !scoreForm.score ||
      !Number.isInteger(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      alert("Score must be a whole number between 1 and 45.");
      return;
    }

    if (!scoreForm.date) {
      alert("Please select a score date.");
      return;
    }

    try {
      setScoreLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const url = editingScore
        ? `${API_URL}/api/scores/${editingScore._id}`
        : `${API_URL}/api/scores`;

      const response = await fetch(url, {
        method: editingScore ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          score: numericScore,
          date: scoreForm.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to save score");
        return;
      }

      setScoreModal(false);
      setEditingScore(null);

      setScoreForm({
        score: "",
        date: "",
      });

      await Promise.all([
        fetchScores(),
        fetchDashboard(),
        fetchParticipation(),
      ]);
    } catch (err) {
      console.error("Score Error:", err);

      alert("Something went wrong while saving score.");
    } finally {
      setScoreLoading(false);
    }
  };

  // =====================================================
  // DELETE SCORE
  // =====================================================

  const handleDeleteScore = async (scoreId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this score?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/scores/${scoreId}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        alert(data.message || "Unable to delete score");
        return;
      }

      await Promise.all([
        fetchScores(),
        fetchDashboard(),
        fetchParticipation(),
      ]);
    } catch (err) {
      console.error("Delete Score Error:", err);

      alert("Something went wrong while deleting score.");
    }
  };

  // =====================================================
  // OPEN PROFILE EDIT
  // =====================================================

  const openProfileEdit = () => {
    let formattedDOB = "";

    if (profile?.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);

      if (!Number.isNaN(dob.getTime())) {
        const year = dob.getUTCFullYear();
        const month = String(dob.getUTCMonth() + 1).padStart(2, "0");
        const day = String(dob.getUTCDate()).padStart(2, "0");

        formattedDOB = `${year}-${month}-${day}`;
      }
    }

    setProfileForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      gender: profile?.gender || "",
      dateOfBirth: formattedDOB,
    });

    setProfileModal(true);
  };

  // =====================================================
  // CLOSE PROFILE MODAL
  // =====================================================

  const closeProfileModal = () => {
    if (profileSaving) return;

    setProfileModal(false);
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10 digit phone number.");
      return;
    }

    if (!profile?._id) {
      alert("User ID not found.");
      return;
    }

    try {
      setProfileSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/users/updateuser/${profile._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name,
            phone,
            gender: profileForm.gender,
            dateOfBirth: profileForm.dateOfBirth,
          }),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setProfileModal(false);

      await fetchDashboard();

      alert("Profile updated successfully.");
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);

      alert(err.message || "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // =====================================================
  // PROFILE IMAGE UPLOAD
  // =====================================================

  const handleProfileImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    try {
      setProfileImageUploading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const formData = new FormData();

      formData.append("profileImage", file);

      const response = await fetch(`${API_URL}/api/users/profile-image`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload profile image.");
      }

      await fetchDashboard();

      alert("Profile picture updated successfully.");
    } catch (err) {
      console.error("PROFILE IMAGE ERROR:", err);

      alert(err.message || "Unable to upload profile image.");
    } finally {
      setProfileImageUploading(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!profile?.profileImage) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?",
    );

    if (!confirmed) return;

    try {
      setProfileImageUploading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/users/profile-image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove profile picture.");
      }

      await fetchDashboard();

      alert("Profile picture removed successfully.");
    } catch (err) {
      console.error("DELETE PROFILE IMAGE ERROR:", err);

      alert(err.message || "Unable to remove profile picture.");
    } finally {
      setProfileImageUploading(false);
    }
  };

  // =====================================================
  // DELETE / DEACTIVATE ACCOUNT
  // =====================================================

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? You will be signed out and will not be able to log in unless your account is restored by support.",
    );

    if (!confirmed) return;

    try {
      setAccountDeleting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/users/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete account.");
      }

      // Remove authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      alert(
        "Your account has been deactivated successfully. Contact support if you want to restore your account.",
      );

      window.location.href = "/login";
    } catch (error) {
      console.error("DELETE ACCOUNT ERROR:", error);

      alert(error.message || "Unable to delete account.");
    } finally {
      setAccountDeleting(false);
    }
  };

  // =====================================================
  // SUBSCRIPTION PAYMENT
  // =====================================================

  const handlePayment = async (plan) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      if (!window.Razorpay) {
        alert("Payment service is currently unavailable.");
        return;
      }

      setPaymentLoading(plan);

      const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          plan,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create payment order.");
      }

      if (!data.subscriptionId) {
        throw new Error("Subscription ID was not received from server.");
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,

        name: "GolfImpact",
        description: `${plan} Subscription`,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/payment/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,

                  subscriptionId: data.subscriptionId,
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (verifyResponse.status === 401) {
              handleInvalidSession();
              return;
            }

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            alert("Subscription activated successfully!");

            await Promise.all([
              fetchDashboard(),
              fetchScores(),
              fetchParticipation(),
            ]);

            changeSection("subscription");
          } catch (error) {
            console.error("PAYMENT VERIFICATION ERROR:", error);

            alert(error.message || "Payment verification failed.");
          } finally {
            setPaymentLoading(null);
          }
        },

        theme: {
          color: "#482ECE",
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      alert(error.message || "Something went wrong. Please try again.");

      setPaymentLoading(null);
    }
  };

  // =====================================================
  // CANCEL SUBSCRIPTION
  // =====================================================

  const handleCancelSubscription = async () => {
    if (!hasActiveSubscription) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? Your membership access will stop immediately.",
    );

    if (!confirmed) return;

    try {
      setSubscriptionCancelling(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/payment/cancel`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel subscription.");
      }

      alert("Subscription cancelled successfully.");

      await Promise.all([
        fetchDashboard(),
        fetchScores(),
        fetchParticipation(),
      ]);
    } catch (error) {
      console.error("CANCEL SUBSCRIPTION ERROR:", error);

      alert(error.message || "Unable to cancel subscription.");
    } finally {
      setSubscriptionCancelling(false);
    }
  };

  // =====================================================
  // UPLOAD WINNER PROOF
  // =====================================================

  const handleWinnerProofUpload = async (winnerId, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    try {
      setProofUploadingId(winnerId);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const formData = new FormData();

      formData.append("proof", file);

      const response = await fetch(`${API_URL}/api/winners/${winnerId}/proof`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload proof.");
      }

      alert("Proof uploaded successfully.");

      await fetchDashboard();
    } catch (err) {
      console.error("Winner Proof Upload Error:", err);

      alert(err.message || "Unable to upload winner proof.");
    } finally {
      setProofUploadingId(null);
    }
  };

  // =====================================================
  // SAVE CHARITY
  // =====================================================

  const handleSaveCharity = async () => {
    const subscriptionActive =
      dashboard?.subscription?.hasActiveSubscription === true;

    if (!subscriptionActive) {
      alert("An active subscription is required to select a charity.");
      return;
    }

    if (!selectedCharityId) {
      alert("Please select a charity.");
      return;
    }

    const percentage = Number(contributionPercentage);

    if (!Number.isFinite(percentage) || percentage < 10 || percentage > 100) {
      alert("Contribution percentage must be between 10% and 100%.");
      return;
    }

    try {
      setCharitySaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        handleInvalidSession();
        return;
      }

      const response = await fetch(`${API_URL}/api/charities/select`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          charityId: selectedCharityId,
          contributionPercentage: percentage,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleInvalidSession();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save charity selection.");
      }

      alert("Charity selection updated successfully.");

      await fetchDashboard();
    } catch (err) {
      console.error("Save Charity Error:", err);

      alert(err.message || "Unable to save charity selection.");
    } finally {
      setCharitySaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B]">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#482ECE] border-t-transparent" />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B] p-5">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
          <AlertCircle size={34} className="mx-auto mb-3" />

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 rounded-xl bg-[#482ECE] px-6 py-2.5 font-semibold text-white transition hover:bg-[#5B42E8]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const profile = dashboard?.profile;
  const subscription = dashboard?.subscription;
  const charity = dashboard?.charity;
  const winnings = dashboard?.winnings;

  const allDraws = participation?.allDraws || [];

  // Latest published draw available in DB/API.
  // allDraws backend se drawMonth DESC order me aa raha hai.
  const draw =
    allDraws.length > 0 ? allDraws[0] : dashboard?.draw?.latestDraw || null;

  const eligibility = dashboard?.draw?.eligibility || null;

  const hasActiveSubscription = subscription?.hasActiveSubscription === true;

  // =====================================================
  // PROFILE CARD
  // =====================================================

  const renderProfileCard = () => (
    <Card>
      <CardTitle icon={<User size={20} />} title="Profile" />

      <div className="mt-6">
        {profile?.profileImage ? (
          <img
            src={getImageUrl(profile.profileImage)}
            alt={profile?.name || "Profile"}
            className="h-10 w-10 rounded-full border border-[#482ECE]/30 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#482ECE] text-sm font-bold text-white shadow-lg shadow-[#482ECE]/20">
            {getInitials(profile?.name)}
          </div>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold text-white">
        {profile?.name || "Member"}
      </h3>

      <div className="mt-4 space-y-2 text-sm text-gray-400">
        <p>{profile?.email || "-"}</p>

        <p>{profile?.phone || "Phone not available"}</p>
      </div>

      <button
        type="button"
        onClick={() => changeSection("profile")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 py-3 text-sm font-semibold text-gray-300 transition hover:border-[#482ECE] hover:bg-[#482ECE]/10 hover:text-white"
      >
        View Profile
        <ArrowRight size={16} />
      </button>
    </Card>
  );

  // =====================================================
  // SUBSCRIPTION CARD
  // =====================================================

  const renderSubscriptionCard = (full = false) => (
    <Card>
      <CardTitle
        icon={<CreditCard size={20} />}
        title={full ? "My Subscription" : "Subscription"}
      />

      {subscription ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold capitalize text-white">
              {subscription.plan || "Subscription"} Plan
            </h3>

            <StatusBadge
              active={hasActiveSubscription}
              text={subscription.status || "inactive"}
            />
          </div>

          <p className="mt-3 text-3xl font-bold text-[#9A8DFF]">
            ₹{Number(subscription.amount || 0).toLocaleString("en-IN")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoBox
              label="Start Date"
              value={formatDate(subscription.startDate)}
            />

            <InfoBox
              label="Expiry Date"
              value={formatDate(subscription.expiryDate)}
            />
          </div>

          {hasActiveSubscription ? (
            <div className="mt-5 flex gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-green-400"
              />

              <div>
                <p className="font-semibold text-green-300">
                  Subscription Active
                </p>

                <p className="mt-1 text-sm leading-6 text-green-200/60">
                  Your GolfImpact membership is currently active.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <div>
                <p className="font-semibold text-amber-300">
                  Subscription not active
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-200/60">
                  Choose a plan below to activate your membership.
                </p>
              </div>
            </div>
          )}

          {full && (
            <>
              <div className="mt-6 rounded-xl border border-gray-800 bg-[#09111B]/70 p-5">
                <p className="font-semibold text-white">Membership Access</p>

                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <CheckRow
                    text="Submit and manage your latest Stableford scores"
                    active={hasActiveSubscription}
                  />

                  <CheckRow
                    text="Participate in monthly draws"
                    active={hasActiveSubscription}
                  />

                  <CheckRow
                    text="Choose your supported charity"
                    active={hasActiveSubscription}
                  />

                  <CheckRow
                    text="Track winnings and payout status"
                    active={hasActiveSubscription}
                  />
                </div>
              </div>

              {hasActiveSubscription ? (
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={subscriptionCancelling}
                    onClick={handleCancelSubscription}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {subscriptionCancelling
                      ? "Cancelling..."
                      : "Cancel Subscription"}
                  </button>

                  <p className="mt-3 text-xs text-gray-500">
                    Cancelling will immediately deactivate your current
                    membership.
                  </p>
                </div>
              ) : (
                <SubscriptionPlans
                  paymentLoading={paymentLoading}
                  onSubscribe={handlePayment}
                />
              )}
            </>
          )}

          {!full && (
            <button
              type="button"
              onClick={() => changeSection("subscription")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#482ECE] py-3 text-sm font-semibold text-white transition hover:bg-[#5B42E8]"
            >
              {hasActiveSubscription
                ? "Manage Subscription"
                : "Renew Subscription"}

              <ArrowRight size={16} />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">
              No active subscription
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-200/60">
              Choose a plan to unlock scores, charity selection and monthly draw
              participation.
            </p>
          </div>

          {full ? (
            <SubscriptionPlans
              paymentLoading={paymentLoading}
              onSubscribe={handlePayment}
            />
          ) : (
            <button
              type="button"
              onClick={() => changeSection("subscription")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#482ECE] py-3 text-sm font-semibold text-white transition hover:bg-[#5B42E8]"
            >
              Choose a Plan
              <ArrowRight size={16} />
            </button>
          )}
        </>
      )}
    </Card>
  );

  // =====================================================
  // CHARITY OVERVIEW CARD
  // =====================================================

  const renderCharityCard = () => (
    <Card>
      <CardTitle icon={<Heart size={20} />} title="Selected Charity" />

      {charity?.charity ? (
        <>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row">
            {charity.charity.image ? (
              <img
                src={getImageUrl(charity.charity.image)}
                alt={charity.charity.name}
                className="h-28 w-full rounded-xl object-cover sm:w-36"
              />
            ) : (
              <div className="flex h-28 w-full items-center justify-center rounded-xl border border-gray-800 bg-[#09111B] sm:w-36">
                <Heart size={34} className="text-gray-700" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {charity.charity.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                {charity.charity.description}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoBox label="Category" value={charity.charity.category || "-"} />

            <InfoBox label="Location" value={charity.charity.location || "-"} />
          </div>

          <div className="mt-5 rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 p-4">
            <p className="text-xs text-gray-400">Your Charity Contribution</p>

            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-bold text-[#9A8DFF]">
                {charity.contributionPercentage || 10}%
              </p>

              <Heart size={20} className="mb-1 text-[#7867E8]" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => changeSection("charity")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#482ECE] py-3 text-sm font-semibold text-[#9A8DFF] transition hover:bg-[#482ECE]/10"
          >
            Manage Charity
            <ArrowRight size={16} />
          </button>
        </>
      ) : (
        <div className="mt-6">
          <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-6 text-center">
            <Heart size={36} className="mx-auto text-gray-600" />

            <p className="mt-3 font-medium text-white">No charity selected</p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Choose a charity you want to support with your GolfImpact
              membership.
            </p>
          </div>

          <button
            type="button"
            onClick={() => changeSection("charity")}
            disabled={!hasActiveSubscription}
            className="mt-5 w-full rounded-xl border border-[#482ECE] py-3 text-sm font-semibold text-[#9A8DFF] transition hover:bg-[#482ECE]/10 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            Select Charity
          </button>
        </div>
      )}
    </Card>
  );

  // =====================================================
  // CHARITY SECTION
  // =====================================================

  const renderCharitySection = () => {
    const searchValue = charitySearch.trim().toLowerCase();

    const categories = [
      ...new Set(
        charities.map((charityItem) => charityItem.category).filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    const locations = [
      ...new Set(
        charities.map((charityItem) => charityItem.location).filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    const filteredCharities = charities.filter((charityItem) => {
      const searchableText = [
        charityItem.name,
        charityItem.description,
        charityItem.category,
        charityItem.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchValue);

      const matchesCategory =
        !charityCategory ||
        charityItem.category?.toLowerCase() === charityCategory.toLowerCase();

      const matchesLocation =
        !charityLocation ||
        charityItem.location?.toLowerCase() === charityLocation.toLowerCase();

      return matchesSearch && matchesCategory && matchesLocation;
    });

    const selectedCharity =
      charities.find((charityItem) => charityItem._id === selectedCharityId) ||
      charity?.charity;

    return (
      <>
        <SectionHeader
          title="My Charity"
          description="Browse charities, view their profiles and upcoming events, then choose the charity you want to support."
        />

        {!hasActiveSubscription && (
          <div className="mb-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
            <AlertCircle size={20} className="shrink-0" />

            <div>
              <p className="font-semibold">Active subscription required</p>

              <p className="mt-1 leading-6 text-amber-200/70">
                You can browse charities and view their details, but an active
                subscription is required before saving your selection.
              </p>
            </div>
          </div>
        )}

        {charity?.charity && (
          <div className="mb-5">
            <Card>
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  {charity.charity.image ? (
                    <img
                      src={getImageUrl(charity.charity.image)}
                      alt={charity.charity.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#482ECE]/15">
                      <Heart className="text-[#9A8DFF]" />
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Currently Supporting
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white">
                      {charity.charity.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Contribution:{" "}
                      <span className="font-semibold text-[#A99FFF]">
                        {charity.contributionPercentage || 10}%
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/charities/${charity.charity._id}`)
                    }
                    className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-[#482ECE] hover:bg-[#482ECE]/10 hover:text-white"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                    <CheckCircle2 size={18} />
                    Selected
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle icon={<Heart size={20} />} title="Choose a Charity" />

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Browse the available charities, view their profiles and upcoming
                events, then select one to support.
              </p>
            </div>

            <div className="w-full lg:max-w-2xl">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    value={charitySearch}
                    onChange={(e) => setCharitySearch(e.target.value)}
                    placeholder="Search charities..."
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20"
                  />
                </div>

                {/* CATEGORY */}
                <select
                  value={charityCategory}
                  onChange={(e) => setCharityCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20"
                >
                  <option value="">All Categories</option>

                  {categories.map((categoryItem) => (
                    <option key={categoryItem} value={categoryItem}>
                      {categoryItem}
                    </option>
                  ))}
                </select>

                {/* LOCATION */}
                <select
                  value={charityLocation}
                  onChange={(e) => setCharityLocation(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20"
                >
                  <option value="">All Locations</option>

                  {locations.map((locationItem) => (
                    <option key={locationItem} value={locationItem}>
                      {locationItem}
                    </option>
                  ))}
                </select>
              </div>

              {(charitySearch || charityCategory || charityLocation) && (
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500">
                    {filteredCharities.length}{" "}
                    {filteredCharities.length === 1 ? "charity" : "charities"}{" "}
                    found
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCharitySearch("");
                      setCharityCategory("");
                      setCharityLocation("");
                    }}
                    className="text-xs font-semibold text-[#A99FFF] transition hover:text-white"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-7">
            {charitiesLoading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7867E8] border-t-transparent" />
                  Loading charities...
                </div>
              </div>
            ) : filteredCharities.length > 0 ? (
              <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCharities.map((charityItem) => {
                  const selected = selectedCharityId === charityItem._id;

                  return (
                    <div
                      key={charityItem._id}
                      className={`group overflow-hidden rounded-2xl border text-left transition duration-200 ${
                        selected
                          ? "border-[#7867E8] bg-[#482ECE]/15 shadow-lg shadow-[#482ECE]/10"
                          : "border-gray-800 bg-[#09111B]/70 hover:border-[#482ECE]/50"
                      }`}
                    >
                      {charityItem.image ? (
                        <img
                          src={getImageUrl(charityItem.image)}
                          alt={charityItem.name}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-[#101925]">
                          <Heart
                            size={44}
                            className={
                              selected ? "text-[#9A8DFF]" : "text-gray-700"
                            }
                          />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white">
                            {charityItem.name}
                          </h3>

                          {selected && (
                            <CheckCircle2
                              size={21}
                              className="shrink-0 text-[#9A8DFF]"
                            />
                          )}
                        </div>

                        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-gray-400">
                          {charityItem.description ||
                            "No description available."}
                        </p>

                        {charityItem.location && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} />

                            {charityItem.location}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {charityItem.category && (
                            <span className="rounded-full border border-[#482ECE]/25 bg-[#482ECE]/10 px-3 py-1 text-xs font-medium text-[#A99FFF]">
                              {charityItem.category}
                            </span>
                          )}

                          {charityItem.featured && (
                            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/charities/${charityItem._id}`)
                            }
                            className="rounded-xl border border-gray-700 px-3 py-2.5 text-center text-sm font-semibold text-gray-300 transition hover:border-[#482ECE] hover:bg-[#482ECE]/10 hover:text-white"
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            disabled={!hasActiveSubscription}
                            onClick={() =>
                              setSelectedCharityId(charityItem._id)
                            }
                            className={`rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition ${
                              selected
                                ? "border-[#7867E8]/50 bg-[#482ECE]/20 text-[#B3AAFF]"
                                : "border-[#482ECE]/40 text-[#A99FFF] hover:bg-[#482ECE]/10"
                            } disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:opacity-60`}
                          >
                            {selected ? "Selected" : "Select Charity"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-10 text-center">
                <Heart size={42} className="mx-auto text-gray-700" />

                <p className="mt-4 font-semibold text-white">
                  No charities found
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {charitySearch || charityCategory || charityLocation
                    ? "Try changing or clearing your search filters."
                    : "There are currently no active charities available."}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-5">
          <Card>
            <CardTitle icon={<Heart size={20} />} title="Contribution" />

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Choose how much of your eligible subscription contribution should
              support your selected charity. The minimum is 10%.
            </p>

            {selectedCharity && (
              <div className="mt-5 rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Selected Charity
                </p>

                <p className="mt-2 font-semibold text-white">
                  {selectedCharity.name}
                </p>
              </div>
            )}

            <div className="mt-6 max-w-md">
              <label
                htmlFor="charity-percentage"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Contribution Percentage
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="charity-percentage"
                  type="number"
                  min="10"
                  max="100"
                  step="1"
                  disabled={!hasActiveSubscription}
                  value={contributionPercentage}
                  onChange={(e) => setContributionPercentage(e.target.value)}
                  className="w-32 rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none transition focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <span className="text-lg font-bold text-gray-400">%</span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Allowed range: 10% - 100%
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveCharity}
              disabled={
                charitySaving || !hasActiveSubscription || !selectedCharityId
              }
              className="mt-6 flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#482ECE] px-4 py-3 font-semibold text-white shadow-lg shadow-[#482ECE]/20 transition hover:bg-[#5B42E8] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-57.5 sm:px-6"
            >
              {charitySaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Heart size={18} />
                  Save Charity Selection
                </>
              )}
            </button>
          </Card>
        </div>
      </>
    );
  };

  // =====================================================
  // SCORES CARD
  // =====================================================

  const renderScoresCard = (full = false) => (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <CardTitle
          icon={<BarChart3 size={20} />}
          title={full ? "My Stableford Scores" : "Latest 5 Scores"}
        />

        <span className="rounded-full border border-gray-700 bg-[#111A26] px-3 py-1 text-xs font-semibold text-gray-400">
          {scores.length}/5
        </span>
      </div>

      {full && (
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Only your latest five Stableford scores are retained for draw
          participation.
        </p>
      )}

      {!hasActiveSubscription ? (
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex gap-3">
            <AlertCircle size={20} className="shrink-0 text-amber-400" />

            <div>
              <p className="font-semibold text-amber-300">
                Active subscription required
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-200/70">
                Activate your subscription to add and manage Stableford scores.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-y border-gray-800 bg-[#0B121C] text-gray-500">
                <th className="px-4 py-3 font-medium">#</th>

                <th className="px-4 py-3 font-medium">Score</th>

                <th className="px-4 py-3 font-medium">Date</th>

                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {scoresLoading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7867E8] border-t-transparent" />
                      Loading scores...
                    </div>
                  </td>
                </tr>
              ) : scores.length > 0 ? (
                scores.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-800/80 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-4">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[#482ECE]/30 bg-[#482ECE]/15 px-2 font-bold text-[#A99FFF]">
                        {item.score}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-300">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditScore(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#482ECE]/20 bg-[#482ECE]/10 text-[#9A8DFF] transition hover:bg-[#482ECE]/20"
                          title="Edit Score"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteScore(item._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                          title="Delete Score"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500">
                    No scores added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={openAddScore}
        disabled={!hasActiveSubscription}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#482ECE] py-3 text-sm font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/10 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 disabled:opacity-60"
      >
        <Plus size={18} />
        Add New Score
      </button>
    </Card>
  );

  // =====================================================
  // DRAW MATCH RESULT
  // =====================================================

  const getDrawMatchResult = () => {
    if (!draw) {
      return {
        participated: false,
        matchCount: 0,
        matchedNumbers: [],
      };
    }

    // New allDraws API result
    if (typeof draw.participated === "boolean") {
      return {
        participated: draw.participated,
        matchCount: draw.matchCount || 0,
        matchedNumbers: draw.matchedNumbers || [],
      };
    }

    // Old dashboard API fallback
    const currentDrawId = draw?.drawId || draw?._id;

    if (!currentDrawId || !Array.isArray(draw?.drawNumbers)) {
      return {
        participated: false,
        matchCount: 0,
        matchedNumbers: [],
      };
    }

    const participationRecord = participation?.recentParticipation?.find(
      (item) => item.drawId?.toString() === currentDrawId.toString(),
    );

    if (!participationRecord) {
      return {
        participated: false,
        matchCount: 0,
        matchedNumbers: [],
      };
    }

    const userScores = participationRecord.userScores || [];
    const drawNumbers =
      participationRecord.drawNumbers || draw.drawNumbers || [];

    const matchedNumbers = [
      ...new Set(userScores.filter((score) => drawNumbers.includes(score))),
    ];

    return {
      participated: true,
      matchCount: matchedNumbers.length,
      matchedNumbers,
    };
  };

  // =====================================================
  // DRAW CARD
  // =====================================================

  const renderDrawCard = (full = false) => {
    const drawResult = getDrawMatchResult();
    const isPublished = draw?.status === "published";

    return (
      <Card>
        <CardTitle
          icon={<CalendarDays size={20} />}
          title={full ? "Monthly Draw" : "Latest Draw"}
        />

        {draw?.drawId || draw?._id ? (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Draw Month
                </p>

                <h3 className="mt-1 text-xl font-bold text-white">
                  {formatDrawMonth(draw.drawMonth)}
                </h3>

                <span className="mt-2 inline-block rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold capitalize text-green-400">
                  {draw.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 px-5 py-3 text-right">
                <p className="text-xs text-gray-400">Jackpot Rollover</p>

                <p className="mt-1 text-xl font-bold text-[#A99FFF]">
                  ₹{draw.jackpotRollover || 0}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                Winning Numbers
              </p>

              <div className="flex flex-wrap gap-3">
                {draw.drawNumbers?.map((number, index) => (
                  <div
                    key={`${number}-${index}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#482ECE]/40 bg-[#482ECE]/15 font-bold text-[#B2A9FF]"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <PrizeBox
                label="5 Match"
                amount={draw.prizeBreakdown?.fiveMatch}
              />

              <PrizeBox
                label="4 Match"
                amount={draw.prizeBreakdown?.fourMatch}
              />

              <PrizeBox
                label="3 Match"
                amount={draw.prizeBreakdown?.threeMatch}
              />
            </div>

            {isPublished ? (
              drawResult.participated ? (
                <div
                  className={`mt-5 flex gap-3 rounded-xl border p-4 ${
                    drawResult.matchCount >= 3
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : "border-[#482ECE]/20 bg-[#482ECE]/10 text-[#A99FFF]"
                  }`}
                >
                  <CheckCircle2 size={21} className="shrink-0" />

                  <div>
                    <p className="font-semibold">Participated in this Draw</p>

                    <p className="mt-1 text-sm opacity-80">
                      Your 5 scores were included in the{" "}
                      {formatDrawMonth(draw.drawMonth)} draw.
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      Matches: {drawResult.matchCount} / 5
                    </p>

                    {drawResult.matchedNumbers.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs opacity-70">Matched:</span>

                        {drawResult.matchedNumbers.map((number) => (
                          <span
                            key={number}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-current/30 bg-black/10 text-xs font-bold"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    )}

                    {drawResult.matchCount >= 3 ? (
                      <p className="mt-2 text-sm font-semibold">
                        {drawResult.matchCount} Match result
                      </p>
                    ) : (
                      <p className="mt-2 text-sm opacity-70">
                        No prize match this time.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex gap-3 rounded-xl border border-gray-700 bg-gray-800/30 p-4 text-gray-400">
                  <AlertCircle size={21} className="shrink-0" />

                  <div>
                    <p className="font-semibold">Not Participated</p>

                    <p className="mt-1 text-sm opacity-80">
                      You were not eligible for this draw.
                    </p>
                  </div>
                </div>
              )
            ) : eligibility ? (
              <div
                className={`mt-5 flex gap-3 rounded-xl border p-4 ${
                  eligibility.eligible
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {eligibility.eligible ? (
                  <CheckCircle2 size={21} className="shrink-0" />
                ) : (
                  <AlertCircle size={21} className="shrink-0" />
                )}

                <div>
                  <p className="font-semibold">
                    {eligibility.eligible
                      ? "Eligible for Participation"
                      : "Not Eligible for Participation"}
                  </p>

                  {eligibility.reason && (
                    <p className="mt-1 text-sm opacity-80">
                      {eligibility.reason}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {full && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <DrawRule
                  title="5 Number Match"
                  value="40%"
                  text="Jackpot rolls over if there is no winner."
                />

                <DrawRule
                  title="4 Number Match"
                  value="35%"
                  text="Prize pool is shared equally among winners."
                />

                <DrawRule
                  title="3 Number Match"
                  value="25%"
                  text="Prize pool is shared equally among winners."
                />
              </div>
            )}

            {!full && (
              <button
                type="button"
                onClick={() => changeSection("draws")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 py-3 text-sm font-semibold text-gray-300 transition hover:border-[#482ECE] hover:bg-[#482ECE]/10 hover:text-white"
              >
                View Draw Details
                <ArrowRight size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-800 bg-[#0B121C] p-8 text-center">
            <CalendarDays size={36} className="mx-auto text-gray-600" />

            <p className="mt-3 text-gray-500">No draw available.</p>
          </div>
        )}
      </Card>
    );
  };

  const renderAllDraws = () => {
    if (participationLoading) {
      return (
        <Card>
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7867E8] border-t-transparent" />
              Loading draws...
            </div>
          </div>
        </Card>
      );
    }

    if (allDraws.length === 0) {
      return (
        <Card>
          <div className="py-10 text-center">
            <CalendarDays size={38} className="mx-auto text-gray-600" />

            <p className="mt-4 font-semibold text-white">
              No published draws yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Published draw results will appear here.
            </p>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-5">
        {allDraws.map((item) => (
          <Card key={item.drawId}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Draw Month
                </p>

                <h3 className="mt-1 text-xl font-bold text-white">
                  {formatDrawMonth(item.drawMonth)}
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    Published
                  </span>

                  <span className="rounded-full border border-gray-700 bg-[#09111B] px-3 py-1 text-xs font-semibold capitalize text-gray-400">
                    {item.drawType || "Draw"}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-xl border px-4 py-3 ${
                  item.participated
                    ? "border-[#482ECE]/30 bg-[#482ECE]/10"
                    : "border-gray-800 bg-[#09111B]"
                }`}
              >
                <p className="text-xs text-gray-500">Participation</p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    item.participated ? "text-[#A99FFF]" : "text-gray-500"
                  }`}
                >
                  {item.participated ? "Participated" : "Not Participated"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                Winning Numbers
              </p>

              <div className="flex flex-wrap gap-3">
                {item.drawNumbers?.map((number, index) => (
                  <div
                    key={`${item.drawId}-${number}-${index}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#482ECE]/40 bg-[#482ECE]/15 font-bold text-[#B2A9FF]"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>

            {item.participated ? (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
                    <p className="text-xs text-gray-500">Your Scores</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.userScores?.map((score, index) => (
                        <span
                          key={`${item.drawId}-score-${index}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-[#111A26] text-xs font-bold text-gray-300"
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
                    <p className="text-xs text-gray-500">Match Result</p>

                    <p
                      className={`mt-2 text-xl font-bold ${
                        item.matchCount >= 3
                          ? "text-green-400"
                          : "text-[#A99FFF]"
                      }`}
                    >
                      {item.matchCount || 0} / 5 Matches
                    </p>
                  </div>
                </div>

                {item.matchedNumbers?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 p-4">
                    <p className="text-xs text-gray-400">Matched Numbers</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.matchedNumbers.map((number) => (
                        <span
                          key={`${item.drawId}-matched-${number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-xs font-bold text-green-400"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-4 flex gap-3 rounded-xl border p-4 ${
                    item.matchCount >= 3
                      ? "border-green-500/20 bg-green-500/10"
                      : "border-[#482ECE]/20 bg-[#482ECE]/10"
                  }`}
                >
                  <CheckCircle2
                    size={20}
                    className={
                      item.matchCount >= 3
                        ? "shrink-0 text-green-400"
                        : "shrink-0 text-[#A99FFF]"
                    }
                  />

                  <div>
                    <p
                      className={`font-semibold ${
                        item.matchCount >= 3
                          ? "text-green-300"
                          : "text-[#A99FFF]"
                      }`}
                    >
                      {item.matchCount >= 3
                        ? `${item.matchCount} Match Winner`
                        : "Participated in this Draw"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.matchCount >= 3
                        ? `You matched ${item.matchCount} winning numbers.`
                        : "No prize match this time."}
                    </p>

                    {item.isWinner && Number(item.prizeAmount || 0) > 0 && (
                      <p className="mt-2 font-semibold text-green-400">
                        Prize: ₹
                        {Number(item.prizeAmount).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 flex gap-3 rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
                <AlertCircle size={20} className="shrink-0 text-gray-500" />

                <div>
                  <p className="font-semibold text-gray-300">
                    Not Participated
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    You were not eligible for this draw.
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // =====================================================
  // PARTICIPATION SUMMARY
  // =====================================================

  const renderParticipationSummary = () => {
    const summary = participation?.summary;
    const upcoming = participation?.upcomingParticipation;
    const recent = participation?.recentParticipation || [];

    return (
      <Card>
        <div className="flex items-center justify-between gap-4">
          <CardTitle
            icon={<CalendarDays size={20} />}
            title="Participation Summary"
          />

          {!participationLoading && (
            <span className="rounded-full border border-[#482ECE]/30 bg-[#482ECE]/10 px-3 py-1 text-xs font-semibold text-[#A99FFF]">
              {summary?.totalDrawsEntered || 0} Draws
            </span>
          )}
        </div>

        {participationLoading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7867E8] border-t-transparent" />
              Loading participation...
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatBox
                label="Draws Entered"
                value={summary?.totalDrawsEntered || 0}
              />

              <StatBox
                label="Last Draw"
                value={
                  summary?.lastDraw ? formatDrawMonth(summary.lastDraw) : "-"
                }
              />

              <StatBox
                label="Upcoming Draw"
                value={
                  summary?.upcomingDraw
                    ? formatDrawMonth(summary.upcomingDraw)
                    : "-"
                }
              />
            </div>

            {upcoming && (
              <div
                className={`mt-6 rounded-xl border p-5 ${
                  upcoming.eligible
                    ? "border-green-500/20 bg-green-500/10"
                    : "border-amber-500/20 bg-amber-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {upcoming.eligible ? (
                    <CheckCircle2
                      size={21}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                  ) : (
                    <AlertCircle
                      size={21}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p
                          className={`font-semibold ${
                            upcoming.eligible
                              ? "text-green-300"
                              : "text-amber-300"
                          }`}
                        >
                          {upcoming.eligible
                            ? "Ready for Upcoming Draw"
                            : "Not Yet Eligible"}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {formatDrawMonth(upcoming.drawMonth)}
                        </p>
                      </div>

                      <span className="rounded-full border border-gray-700 bg-[#09111B]/60 px-3 py-1 text-xs font-semibold capitalize text-gray-300">
                        {upcoming.drawType || "Draw"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-800/70 bg-[#09111B]/50 p-3">
                        <p className="text-xs text-gray-500">Subscription</p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            upcoming.subscriptionActive
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {upcoming.subscriptionActive
                            ? "Active"
                            : "Not Active"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-gray-800/70 bg-[#09111B]/50 p-3">
                        <p className="text-xs text-gray-500">
                          Scores Available
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {upcoming.scoreCount || 0}/
                          {upcoming.scoresRequired || 5}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Recent Participation
              </p>

              {recent.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-800">
                  {recent.map((item, index) => (
                    <div
                      key={item.drawId}
                      className={`flex flex-col justify-between gap-4 bg-[#09111B]/60 p-4 sm:flex-row sm:items-center ${
                        index !== recent.length - 1
                          ? "border-b border-gray-800"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {formatDrawMonth(item.drawMonth)}
                        </p>

                        <p className="mt-1 text-xs capitalize text-gray-500">
                          {item.drawType || "Draw"} Draw
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {item.drawNumbers?.map((number, numberIndex) => (
                          <span
                            key={`${item.drawId}-${number}-${numberIndex}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#482ECE]/30 bg-[#482ECE]/15 text-xs font-bold text-[#A99FFF]"
                          >
                            {number}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                        <CheckCircle2 size={17} />
                        Participated
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-800 bg-[#09111B]/60 p-7 text-center">
                  <CalendarDays size={30} className="mx-auto text-gray-600" />

                  <p className="mt-3 text-sm text-gray-500">
                    No draw participation history yet.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    );
  };

  // =====================================================
  // WINNINGS
  // =====================================================

  const renderWinnings = (full = false) => (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <CardTitle
          icon={<Trophy size={20} />}
          title={full ? "My Winnings" : "Your Winnings"}
        />

        {!full && (
          <button
            type="button"
            onClick={() => changeSection("winnings")}
            className="text-sm font-semibold text-[#9A8DFF] transition hover:text-white"
          >
            View All
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox label="Total Wins" value={winnings?.totalWins || 0} />

        <StatBox
          label="Total Amount"
          value={`₹${winnings?.totalAmount || 0}`}
        />

        <StatBox
          label="Paid Amount"
          value={`₹${winnings?.paidAmount || 0}`}
          success
        />

        <StatBox
          label="Pending Amount"
          value={`₹${winnings?.pendingAmount || 0}`}
          warning
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-y border-gray-800 bg-[#0B121C] text-gray-500">
              <th className="px-4 py-3 font-medium">Draw Month</th>

              <th className="px-4 py-3 font-medium">Matched Numbers</th>

              <th className="px-4 py-3 font-medium">Match</th>

              <th className="px-4 py-3 font-medium">Prize</th>

              <th className="px-4 py-3 font-medium">Verification</th>

              <th className="px-4 py-3 font-medium">Payout</th>

              <th className="px-4 py-3 font-medium">Reference</th>

              <th className="px-4 py-3 font-medium">Proof</th>
            </tr>
          </thead>

          <tbody>
            {winnings?.history?.length > 0 ? (
              winnings.history.map((winner) => (
                <tr
                  key={winner._id}
                  className="border-b border-gray-800/80 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4 text-gray-300">
                    {formatDrawMonth(winner.draw?.drawMonth)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {winner.matchedNumbers?.map((number, index) => (
                        <span
                          key={`${number}-${index}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#482ECE]/15 text-xs font-bold text-[#A99FFF]"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-lg border border-[#482ECE]/30 bg-[#482ECE]/10 px-3 py-1.5 font-semibold text-[#A99FFF]">
                      {winner.matchCount} Match
                    </span>
                  </td>

                  <td className="px-4 py-4 font-semibold text-white">
                    ₹{winner.prizeAmount || 0}
                  </td>

                  <td className="px-4 py-4">
                    <VerificationBadge status={winner.verificationStatus} />
                  </td>

                  <td className="px-4 py-4">
                    <PayoutBadge status={winner.payoutStatus} />
                  </td>

                  <td className="px-4 py-4 text-gray-400">
                    {winner.payoutReference || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <WinnerProofCell
                      winner={winner}
                      uploading={proofUploadingId === winner._id}
                      onUpload={(file) =>
                        handleWinnerProofUpload(winner._id, file)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center text-gray-500">
                  No winnings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // =====================================================
  // DASHBOARD SECTION
  // =====================================================

  const renderDashboardSection = () => (
    <>
      <SectionHeader
        title={
          oauthAction === "signup"
            ? `Welcome to GolfImpact, ${profile?.name || "Member"}!`
            : `Welcome Back, ${profile?.name || "Member"}!`
        }
        description="Here's your latest GolfImpact activity and progress."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {renderProfileCard()}
        {renderSubscriptionCard()}
        {renderCharityCard()}
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        {renderScoresCard()}
        {renderDrawCard()}
      </div>

      <div className="mt-5">{renderParticipationSummary()}</div>

      <div className="mt-5">{renderWinnings()}</div>
    </>
  );

  // =====================================================
  // PROFILE SECTION
  // =====================================================

  const renderProfileSection = () => (
    <>
      <SectionHeader
        title="My Profile"
        description="Manage your GolfImpact account information and profile picture."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile?.profileImage ? (
                <img
                  src={getImageUrl(profile.profileImage)}
                  alt={profile?.name || "Profile"}
                  className="h-28 w-28 rounded-full border-2 border-[#482ECE]/40 object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#482ECE]/40 bg-[#482ECE]/15 text-3xl font-bold text-white">
                  {getInitials(profile?.name)}
                </div>
              )}

              <label
                className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#482ECE] text-white shadow-lg transition ${
                  profileImageUploading
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-[#5B42E8]"
                }`}
              >
                {profileImageUploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Pencil size={16} />
                )}

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  disabled={profileImageUploading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleProfileImageUpload(file);
                    }

                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              {profile?.name || "Member"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">GolfImpact Member</p>

            <p className="mt-3 text-xs text-gray-600">
              JPG, PNG or WEBP • Max 5 MB
            </p>

            {profile?.profileImage && (
              <button
                type="button"
                onClick={handleDeleteProfileImage}
                disabled={profileImageUploading}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Remove Profile Picture
              </button>
            )}

            <button
              type="button"
              onClick={openProfileEdit}
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#482ECE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5B42E8]"
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          </div>
        </Card>

        <Card>
          <CardTitle icon={<User size={20} />} title="Account Details" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProfileInfo label="Full Name" value={profile?.name} />

            <ProfileInfo label="Email" value={profile?.email} />

            <ProfileInfo
              label="Phone"
              value={profile?.phone || "Not provided"}
            />

            <ProfileInfo
              label="Gender"
              value={
                profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1)
                  : "Not provided"
              }
            />

            <ProfileInfo
              label="Date of Birth"
              value={
                profile?.dateOfBirth
                  ? formatDate(profile.dateOfBirth)
                  : "Not provided"
              }
            />

            <ProfileInfo
              label="Account Status"
              value={profile?.isActive === false ? "Inactive" : "Active"}
            />
          </div>

          <div className="mt-6 rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
            <p className="text-sm text-gray-500">
              Your email address cannot be changed from this page.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">Delete Account</p>

                <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                  Deactivating your account will sign you out and prevent future
                  login. Contact support if you want your account restored.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={accountDeleting}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accountDeleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  // =====================================================
  // SECTION RENDERER
  // =====================================================

  const renderActiveSection = () => {
    switch (activeSection) {
      case "scores":
        return (
          <>
            <SectionHeader
              title="My Scores"
              description="Manage your latest five Stableford scores."
            />

            {renderScoresCard(true)}
          </>
        );

      case "subscription":
        return (
          <>
            <SectionHeader
              title="My Subscription"
              description="View your membership status and renewal details."
            />

            <div className="max-w-4xl">{renderSubscriptionCard(true)}</div>
          </>
        );

      case "charity":
        return renderCharitySection();

      case "draws":
        return (
          <>
            <SectionHeader
              title="Monthly Draws"
              description="View all published GolfImpact draws and your participation results."
            />

            {renderAllDraws()}

            <div className="mt-5">{renderParticipationSummary()}</div>
          </>
        );

      case "winnings":
        return (
          <>
            <SectionHeader
              title="My Winnings"
              description="Track prizes, proof verification and payout status."
            />

            {renderWinnings(true)}
          </>
        );

      case "profile":
        return renderProfileSection();

      default:
        return renderDashboardSection();
    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <>
      <PageTitle
        title={
          {
            dashboard: "Dashboard",
            profile: "Profile",
            subscription: "Subscription",
            scores: "Scores",
            charity: "My Charity",
            draws: "Draws",
            winnings: "Winnings",
          }[activeSection] || "Dashboard"
        }
      />
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09111B] text-white">
        {/* MOBILE HEADER */}

        <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-800 bg-[#080D14] px-5 lg:hidden">
          <h1 className="text-xl font-bold text-white">
            Golf
            <span className="text-[#7867E8]">Impact</span>
          </h1>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-300 transition hover:bg-white/5"
          >
            <Menu size={25} />
          </button>
        </div>

        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* SIDEBAR */}

        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-[255px] border-r border-gray-800 bg-[#080D14] transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-gray-800 px-6 py-7">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Golf
                  <span className="text-[#7867E8]">Impact</span>
                </h1>

                <p className="mt-1 text-xs text-gray-500">
                  Play. Win. Make a Difference.
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg p-1 text-gray-400 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
              <SidebarItem
                icon={<LayoutDashboard size={19} />}
                text="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => changeSection("dashboard")}
              />

              <SidebarItem
                icon={<BarChart3 size={19} />}
                text="My Scores"
                active={activeSection === "scores"}
                onClick={() => changeSection("scores")}
              />

              <SidebarItem
                icon={<CreditCard size={19} />}
                text="My Subscription"
                active={activeSection === "subscription"}
                onClick={() => changeSection("subscription")}
              />

              <SidebarItem
                icon={<Heart size={19} />}
                text="My Charity"
                active={activeSection === "charity"}
                onClick={() => changeSection("charity")}
              />

              <SidebarItem
                icon={<CalendarDays size={19} />}
                text="Draws"
                active={activeSection === "draws"}
                onClick={() => changeSection("draws")}
              />

              <SidebarItem
                icon={<Trophy size={19} />}
                text="Winnings"
                active={activeSection === "winnings"}
                onClick={() => changeSection("winnings")}
              />

              <SidebarItem
                icon={<User size={19} />}
                text="Profile"
                active={activeSection === "profile"}
                onClick={() => changeSection("profile")}
              />
            </nav>

            <div className="border-t border-gray-800 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}

        <main className="min-w-0 w-full pt-20 lg:ml-63.75 lg:w-[calc(100%-255px)] lg:pt-0">
          <header className="hidden h-17 items-center justify-between border-b border-gray-800 bg-[#0B121C] px-8 lg:flex">
            <p className="text-sm text-gray-500">Member Dashboard</p>

            <button
              type="button"
              onClick={() => changeSection("profile")}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/3"
            >
              {profile?.profileImage ? (
                <img
                  src={getImageUrl(profile.profileImage)}
                  alt={profile?.name || "Profile"}
                  className="h-10 w-10 rounded-full border-2 border-[#482ECE]/40 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#482ECE] text-sm font-bold text-white shadow-lg shadow-[#482ECE]/20">
                  {getInitials(profile?.name)}
                </div>
              )}

              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {profile?.name}
                </p>

                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </button>
          </header>

          <div className="mx-auto w-full min-w-0 max-w-[1500px] px-3 pb-6 sm:px-6 lg:p-8">
            {renderActiveSection()}
          </div>
        </main>

        {/* =====================================================
          CHARITY DETAILS MODAL
      ===================================================== */}

        {/* =====================================================
          ADD / EDIT SCORE MODAL
      ===================================================== */}

        {scoreModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeScoreModal();
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-[#0D1520] p-6 shadow-2xl shadow-black/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingScore ? "Edit Score" : "Add New Score"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Stableford score must be between 1 and 45.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={scoreLoading}
                  onClick={closeScoreModal}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleScoreSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="stableford-score"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Stableford Score
                  </label>

                  <input
                    id="stableford-score"
                    type="number"
                    min="1"
                    max="45"
                    step="1"
                    required
                    value={scoreForm.score}
                    onChange={(e) =>
                      setScoreForm((previous) => ({
                        ...previous,
                        score: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none transition focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="score-date"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Score Date
                  </label>

                  <input
                    id="score-date"
                    type="date"
                    required
                    value={scoreForm.date}
                    onChange={(e) =>
                      setScoreForm((previous) => ({
                        ...previous,
                        date: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none transition focus:border-[#482ECE] focus:ring-2 focus:ring-[#482ECE]/20"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Only one score can be entered for each date.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={scoreLoading}
                    onClick={closeScoreModal}
                    className="flex-1 rounded-xl border border-gray-700 py-3 font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={scoreLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#482ECE] py-3 font-semibold text-white shadow-lg shadow-[#482ECE]/20 transition hover:bg-[#5B42E8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {scoreLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : editingScore ? (
                      <>
                        <Pencil size={17} />
                        Update Score
                      </>
                    ) : (
                      <>
                        <Plus size={17} />
                        Add Score
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
          PROFILE EDIT MODAL
      ===================================================== */}

        {profileModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeProfileModal();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#0D1520] p-6 shadow-2xl shadow-black/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Profile</h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Update your personal information.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={closeProfileModal}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Full Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none focus:border-[#482ECE]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Phone
                  </label>

                  <input
                    id="profile-phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none focus:border-[#482ECE]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-gender"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Gender
                  </label>

                  <select
                    id="profile-gender"
                    value={profileForm.gender}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none focus:border-[#482ECE]"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="profile-dob"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Date of Birth
                  </label>

                  <input
                    id="profile-dob"
                    type="date"
                    value={profileForm.dateOfBirth || ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-white outline-none focus:border-[#482ECE]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={closeProfileModal}
                    className="flex-1 rounded-xl border border-gray-700 py-3 font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#482ECE] py-3 font-semibold text-white transition hover:bg-[#5B42E8] disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// =====================================================
// SUBSCRIPTION PLANS
// =====================================================

const SubscriptionPlans = ({ paymentLoading, onSubscribe }) => {
  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₹1,000",
      period: "/ month",
      description: "Flexible monthly membership.",
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      price: "₹9,600",
      period: "/ year",
      description: "Save ₹2,400 compared with monthly billing.",
      popular: true,
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white">Choose Your Plan</h3>

      <p className="mt-1 text-sm text-gray-500">
        Select a membership plan to continue.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-5 ${
              plan.popular
                ? "border-[#482ECE]/60 bg-[#482ECE]/10"
                : "border-gray-800 bg-[#09111B]/70"
            }`}
          >
            {plan.popular && (
              <span className="absolute right-4 top-4 rounded-full bg-[#482ECE]/20 px-3 py-1 text-xs font-semibold text-[#A99FFF]">
                Most Popular
              </span>
            )}

            <p className="font-semibold text-white">{plan.name}</p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-bold text-white">
                {plan.price}
              </span>

              <span className="mb-1 text-sm text-gray-500">{plan.period}</span>
            </div>

            <p className="mt-3 text-sm text-gray-500">{plan.description}</p>

            <button
              type="button"
              disabled={Boolean(paymentLoading)}
              onClick={() => onSubscribe(plan.id)}
              className="mt-5 w-full rounded-xl bg-[#482ECE] py-3 text-sm font-semibold text-white transition hover:bg-[#5B42E8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paymentLoading === plan.id
                ? "Opening Payment..."
                : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// SIDEBAR ITEM
// =====================================================

const SidebarItem = ({ icon, text, active = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-[#482ECE] font-semibold text-white shadow-lg shadow-[#482ECE]/15"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </button>
  );
};

// =====================================================
// SECTION HEADER
// =====================================================

const SectionHeader = ({ title, description }) => {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>

      <p className="mt-2 text-sm text-gray-400 sm:text-base">{description}</p>
    </div>
  );
};

// =====================================================
// CARD
// =====================================================

const Card = ({ children }) => {
  return (
    <div className="w-full min-w-0 max-w-full rounded-2xl border border-gray-800 bg-[#0D1520] p-4 shadow-xl shadow-black/10 sm:p-6">
      {children}
    </div>
  );
};

// =====================================================
// CARD TITLE
// =====================================================

const CardTitle = ({ icon, title }) => {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#482ECE]/15 text-[#9A8DFF]">
        {icon}
      </div>

      <h3 className="min-w-0 text-base font-bold text-white sm:text-lg">
        {title}
      </h3>
    </div>
  );
};

// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({ active, text }) => {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        active
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : "border-amber-500/20 bg-amber-500/10 text-amber-400"
      }`}
    >
      {text || "Unknown"}
    </span>
  );
};

// =====================================================
// INFO BOX
// =====================================================

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-3">
      <p className="text-xs text-gray-500">{label}</p>

      <p className="mt-1 text-sm font-medium text-gray-300">{value}</p>
    </div>
  );
};

// =====================================================
// PROFILE INFO
// =====================================================

const ProfileInfo = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>

      <p className="mt-2 font-medium text-gray-200">{value || "-"}</p>
    </div>
  );
};

// =====================================================
// CHECK ROW
// =====================================================

const CheckRow = ({ text, active }) => {
  return (
    <div className="flex items-center gap-3">
      {active ? (
        <CheckCircle2 size={18} className="shrink-0 text-green-400" />
      ) : (
        <AlertCircle size={18} className="shrink-0 text-amber-400" />
      )}

      <span>{text}</span>
    </div>
  );
};

// =====================================================
// DRAW RULE
// =====================================================

const DrawRule = ({ title, value, text }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">{title}</p>

        <span className="text-xl font-bold text-[#A99FFF]">{value}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  );
};

// =====================================================
// PRIZE BOX
// =====================================================

const PrizeBox = ({ label, amount = 0 }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>

      <p className="mt-1 font-bold text-[#A99FFF]">₹{amount || 0}</p>
    </div>
  );
};

// =====================================================
// STAT BOX
// =====================================================

const StatBox = ({ label, value, success = false, warning = false }) => {
  let valueColor = "text-[#A99FFF]";

  if (success) {
    valueColor = "text-green-400";
  }

  if (warning) {
    valueColor = "text-amber-400";
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#09111B]/70 p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
};

// =====================================================
// VERIFICATION BADGE
// =====================================================

const VerificationBadge = ({ status }) => {
  const styles = {
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",

    approved: "border-green-500/20 bg-green-500/10 text-green-400",

    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status || "pending"}
    </span>
  );
};

// =====================================================
// PAYOUT BADGE
// =====================================================

const PayoutBadge = ({ status }) => {
  const paid = status === "paid";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        paid
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : "border-amber-500/20 bg-amber-500/10 text-amber-400"
      }`}
    >
      {status || "pending"}
    </span>
  );
};

// =====================================================
// WINNER PROOF
// =====================================================

const WinnerProofCell = ({ winner, uploading, onUpload }) => {
  const alreadyPaid = winner.payoutStatus === "paid";
  const approved = winner.verificationStatus === "approved";
  const rejected = winner.verificationStatus === "rejected";
  const hasProof = Boolean(winner.proofImage);

  const proofUrl = hasProof
    ? winner.proofImage.startsWith("http")
      ? winner.proofImage
      : `${API_URL}${winner.proofImage}`
    : "";

  // Paid → only view proof
  if (alreadyPaid) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {hasProof && (
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#482ECE] hover:text-white"
          >
            View Proof
          </a>
        )}

        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 size={16} />
          Completed
        </div>
      </div>
    );
  }

  // Approved → cannot replace
  if (approved) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {hasProof && (
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#482ECE] hover:text-white"
          >
            View Proof
          </a>
        )}

        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 size={16} />
          Approved
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasProof && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#482ECE] hover:text-white"
        >
          View
        </a>
      )}

      <label
        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
          uploading
            ? "cursor-not-allowed border-gray-700 text-gray-600"
            : rejected
              ? "cursor-pointer border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              : "cursor-pointer border-[#482ECE]/40 bg-[#482ECE]/10 text-[#A99FFF] hover:bg-[#482ECE]/20"
        }`}
      >
        {uploading
          ? "Uploading..."
          : rejected
            ? "Upload New Proof"
            : hasProof
              ? "Replace Proof"
              : "Upload Proof"}

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          disabled={uploading}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              onUpload(file);
            }

            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
};

export default UserDashboard;
