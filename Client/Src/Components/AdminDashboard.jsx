import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Heart,
  Trophy,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  IndianRupee,
  Clock3,
  AlertCircle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Play,
  Send,
  Calculator,
  Wallet,
  User,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../Components/PageTitle";

const API_URL = "http://localhost:8180";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // GLOBAL STATES
  // =====================================================

  const [activeSection, setActiveSection] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // DATA STATES
  // =====================================================

  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);

  // =====================================================
  // FILTER STATES
  // =====================================================

  const [search, setSearch] = useState("");

  const [winnerFilter, setWinnerFilter] = useState("pending");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] =
    useState("all");

  const [charitySearch, setCharitySearch] = useState("");

  // =====================================================
  // MODAL STATES
  // =====================================================

  const [modal, setModal] = useState({
    type: null,
    data: null,
  });

  // =====================================================
  // DRAW FORM
  // =====================================================

  const [drawForm, setDrawForm] = useState({
    drawMonth: "",
    drawType: "random",
  });

  // =====================================================
  // PAYOUT FORM
  // =====================================================

  const [payoutForm, setPayoutForm] = useState({
    payoutReference: "",
    payoutNote: "",
  });

  // =====================================================
  // ADMIN USER MANAGEMENT
  // =====================================================

  const [userEditForm, setUserEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [userScores, setUserScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  const [scoreEditForm, setScoreEditForm] = useState({
    score: "",
    date: "",
  });

  // =====================================================
  // HELPERS
  // =====================================================

  const getToken = () => localStorage.getItem("token");

  const authHeaders = (json = false) => ({
    ...(json
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    Authorization: `Bearer ${getToken()}`,
  });

  const request = async (url, options = {}) => {
    const response = await fetch(url, options);

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      handleLogout();
      throw new Error("Session expired.");
    }

    if (response.status === 403) {
      throw new Error(data.message || "Admin permission required.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  };

  // =====================================================
  // LOAD ADMIN DATA
  // =====================================================

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!getToken()) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const results = await Promise.allSettled([
        request(`${API_URL}/api/users/all`, {
          headers: authHeaders(),
        }),

        request(`${API_URL}/api/payment/subscriptions`, {
          headers: authHeaders(),
        }),

        request(`${API_URL}/api/charities/admin/all`, {
          headers: authHeaders(),
        }),

        request(`${API_URL}/api/draws`, {
          headers: authHeaders(),
        }),

        request(`${API_URL}/api/winners`, {
          headers: authHeaders(),
        }),
      ]);

      const [
        usersResult,
        subscriptionsResult,
        charitiesResult,
        drawsResult,
        winnersResult,
      ] = results;

      if (usersResult.status === "fulfilled") {
        const data = usersResult.value;

        setUsers(data.users || data.data || []);
      }

      if (subscriptionsResult.status === "fulfilled") {
        const data = subscriptionsResult.value;

        setSubscriptions(data.subscriptions || data.data || []);
      }

      if (charitiesResult.status === "fulfilled") {
        const data = charitiesResult.value;

        setCharities(data.charities || data.data || []);
      }

      if (drawsResult.status === "fulfilled") {
        const data = drawsResult.value;

        setDraws(data.draws || data.data || []);
      }

      if (winnersResult.status === "fulfilled") {
        const data = winnersResult.value;

        setWinners(data.winners || data.data || []);
      }

      const failures = results.filter((item) => item.status === "rejected");

      if (failures.length > 0) {
        console.warn("Some admin endpoints failed:", failures);
      }
    } catch (err) {
      console.error("Admin Dashboard Error:", err);

      setError(err.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setModal({
      type: null,
      data: null,
    });

    setPayoutForm({
      payoutReference: "",
      payoutNote: "",
    });

    setDrawForm({
      drawMonth: "",
      drawType: "random",
    });
  };

  // =====================================================
  // CHARITY
  // =====================================================
  const openAddCharity = () => {
    setCharityForm({
      name: "",
      description: "",
      category: "",
      location: "",
      image: "",
      website: "",
      featured: false,
      active: true,
      events: [],
    });

    setModal({
      type: "charity",
      data: null,
    });
  };

  const openEditCharity = (charity) => {
    setCharityForm({
      name: charity.name || "",
      description: charity.description || "",
      category: charity.category || "",
      location: charity.location || "",
      image: charity.image || "",
      website: charity.website || "",
      featured: charity.featured || false,
      active: charity.active !== false,

      events: (charity.events || []).map((event) => ({
        title: event.title || "",
        description: event.description || "",
        date: event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "",
      })),
    });

    setModal({
      type: "charity",
      data: charity,
    });
  };

  const addCharityEvent = () => {
    setCharityForm((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          title: "",
          description: "",
          date: "",
        },
      ],
    }));
  };

  const updateCharityEvent = (index, field, value) => {
    setCharityForm((prev) => ({
      ...prev,
      events: prev.events.map((event, eventIndex) =>
        eventIndex === index
          ? {
              ...event,
              [field]: value,
            }
          : event,
      ),
    }));
  };

  const removeCharityEvent = (index) => {
    setCharityForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, eventIndex) => eventIndex !== index),
    }));
  };

  const saveCharity = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      const editing = Boolean(modal.data?._id);

      const url = editing
        ? `${API_URL}/api/charities/${modal.data._id}`
        : `${API_URL}/api/charities`;

      await request(url, {
        method: editing ? "PUT" : "POST",
        headers: authHeaders(true),
        body: JSON.stringify(charityForm),
      });

      setModal({
        type: null,
        data: null,
      });

      await fetchAdminData();
    } catch (err) {
      console.error("Charity Error:", err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCharity = async (id) => {
    const confirmed = window.confirm("Deactivate this charity?");

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await request(`${API_URL}/api/charities/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CREATE DRAW
  // =====================================================

  const createDraw = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      const data = await request(`${API_URL}/api/draws`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          drawMonth: drawForm.drawMonth,
          drawType: drawForm.drawType,
        }),
      });

      console.log("DRAW CREATED:", data);

      setModal({
        type: null,
        data: null,
      });

      setDrawForm({
        drawMonth: "",
        drawType: "random",
      });

      await fetchAdminData();
    } catch (err) {
      console.error("Create Draw Error:", err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DRAW ACTION
  // =====================================================

  const runDrawAction = async (drawId, action) => {
    const labels = {
      "calculate-prize-pool": "Calculate prize pool for this draw?",
      simulate: "Simulate this draw?",
      publish:
        "Publish this draw? Once published, prize pool and simulation cannot be changed.",
      "calculate-winners": "Calculate official winners?",
      "distribute-prizes":
        "Distribute prizes? This action can only be completed once.",
    };

    const confirmed = window.confirm(labels[action]);

    if (!confirmed) return;

    const loadingKey = `${drawId}-${action}`;

    try {
      setActionLoading(loadingKey);

      const data = await request(`${API_URL}/api/draws/${drawId}/${action}`, {
        method: "POST",
        headers: authHeaders(true),
      });

      alert(data.message || "Action completed successfully.");

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // VERIFY WINNER
  // =====================================================

  const verifyWinner = async (winnerId, status) => {
    try {
      setActionLoading(true);

      await request(`${API_URL}/api/winners/${winnerId}/verify`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({
          status,
        }),
      });

      setModal({
        type: null,
        data: null,
      });

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // PAY WINNER
  // =====================================================

  const markWinnerPaid = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      await request(`${API_URL}/api/winners/${modal.data._id}/paid`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(payoutForm),
      });

      setModal({
        type: null,
        data: null,
      });

      setPayoutForm({
        payoutReference: "",
        payoutNote: "",
      });

      await fetchAdminData();
    } catch (err) {
      console.error("Payout Error:", err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // COMPUTED DATA
  // =====================================================

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active",
  );

  const pendingVerification = winners.filter(
    (item) => item.verificationStatus === "pending",
  );

  const approvedWinners = winners.filter(
    (item) => item.verificationStatus === "approved",
  );

  const rejectedWinners = winners.filter(
    (item) => item.verificationStatus === "rejected",
  );

  const pendingPayouts = winners.filter(
    (item) =>
      item.verificationStatus === "approved" && item.payoutStatus === "pending",
  );

  const paidWinners = winners.filter((item) => item.payoutStatus === "paid");

  const totalPaid = paidWinners.reduce(
    (total, winner) => total + Number(winner.prizeAmount || 0),
    0,
  );

  const filteredWinners = useMemo(() => {
    if (winnerFilter === "all") {
      return winners;
    }

    return winners.filter(
      (winner) => winner.verificationStatus === winnerFilter,
    );
  }, [winners, winnerFilter]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);

      const matchesRole =
        userRoleFilter === "all" || (user.role || "user") === userRoleFilter;

      const isActive = user.isActive !== false;

      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "active" && isActive) ||
        (userStatusFilter === "inactive" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, userRoleFilter, userStatusFilter]);

  const filteredCharities = useMemo(() => {
    const term = charitySearch.trim().toLowerCase();

    if (!term) return charities;

    return charities.filter((charity) => {
      const name = charity.name?.toLowerCase() || "";
      const category = charity.category?.toLowerCase() || "";
      const location = charity.location?.toLowerCase() || "";

      return (
        name.includes(term) ||
        category.includes(term) ||
        location.includes(term)
      );
    });
  }, [charities, charitySearch]);

  const filteredSubscriptions = useMemo(() => {
    const term = subscriptionSearch.trim().toLowerCase();

    return subscriptions.filter((sub) => {
      const name = sub.userId?.name?.toLowerCase() || "";
      const email = sub.userId?.email?.toLowerCase() || "";
      const plan = sub.plan?.toLowerCase() || "";
      const status = sub.status?.toLowerCase() || "";

      const matchesSearch =
        !term || name.includes(term) || email.includes(term);

      const matchesPlan =
        subscriptionPlanFilter === "all" || plan === subscriptionPlanFilter;

      const matchesStatus =
        subscriptionStatusFilter === "all" ||
        status === subscriptionStatusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [
    subscriptions,
    subscriptionSearch,
    subscriptionPlanFilter,
    subscriptionStatusFilter,
  ]);

  const activeSubscriptionCount = subscriptions.filter(
    (sub) => sub.status === "active",
  ).length;

  const monthlySubscriptionCount = subscriptions.filter(
    (sub) => sub.plan === "monthly",
  ).length;

  const yearlySubscriptionCount = subscriptions.filter(
    (sub) => sub.plan === "yearly",
  ).length;

  const totalUsers = users.length;

  const activeUsersCount = users.filter(
    (user) => user.isActive !== false,
  ).length;

  const inactiveUsersCount = users.filter(
    (user) => user.isActive === false,
  ).length;

  const totalSubscriptions = subscriptions.length;

  const activeSubscriptionsCount = subscriptions.filter(
    (sub) => sub.status === "active",
  ).length;

  const cancelledSubscriptionsCount = subscriptions.filter(
    (sub) => sub.status === "cancelled",
  ).length;

  const expiredSubscriptionsCount = subscriptions.filter(
    (sub) => sub.status === "expired",
  ).length;

  const totalWinners = winners.length;

  const totalPrizeValue = winners.reduce(
    (total, winner) => total + Number(winner.prizeAmount || 0),
    0,
  );

  const publishedDrawsCount = draws.filter(
    (draw) => draw.status === "published",
  ).length;

  const completedDrawsCount = draws.filter((draw) =>
    Boolean(draw.prizesDistributedAt),
  ).length;

  const activeCharitiesCount = charities.filter(
    (charity) => charity.active !== false,
  ).length;

  const monthlySubscriptionsCount = subscriptions.filter(
    (sub) => sub.plan === "monthly",
  ).length;

  const yearlySubscriptionsCount = subscriptions.filter(
    (sub) => sub.plan === "yearly",
  ).length;

  const subscriptionRevenue = subscriptions
    .filter((sub) => ["active", "expired", "cancelled"].includes(sub.status))
    .reduce((total, sub) => total + Number(sub.amount || 0), 0);

  const totalPrizePool = draws
    .filter((draw) => draw.status === "published")
    .reduce((total, draw) => total + Number(draw.prizePool || 0), 0);

  const totalRollover = draws.reduce(
    (total, draw) => total + Number(draw.jackpotRollover || 0),
    0,
  );

  const totalCharityContribution = draws
    .filter((draw) => draw.status === "published")
    .reduce(
      (total, draw) =>
        total + Number(draw.prizeCalculation?.charityContribution || 0),
      0,
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B]">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#482ECE] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const openEditUser = (user) => {
    setUserEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
    });

    setModal({
      type: "edit-user",
      data: user,
    });
  };

  const saveAdminUser = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(`edit-user-${modal.data._id}`);

      const data = await request(
        `${API_URL}/api/users/${modal.data._id}/admin-profile`,
        {
          method: "PUT",
          headers: authHeaders(true),
          body: JSON.stringify(userEditForm),
        },
      );

      alert(data.message || "User updated successfully.");

      closeModal();

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const openUserScores = async (user) => {
    try {
      setScoresLoading(true);

      setModal({
        type: "user-scores",
        data: user,
      });

      const data = await request(
        `${API_URL}/api/scores/admin/user/${user._id}`,
        {
          headers: authHeaders(),
        },
      );

      setUserScores(data.scores || []);
    } catch (err) {
      alert(err.message);
      closeModal();
    } finally {
      setScoresLoading(false);
    }
  };

  const openEditScore = (score) => {
    setScoreEditForm({
      score: score.score,
      date: score.date ? new Date(score.date).toISOString().split("T")[0] : "",
    });

    setModal((prev) => ({
      type: "edit-score",
      data: {
        score,
        user: prev.data,
      },
    }));
  };

  const saveAdminScore = async (e) => {
    e.preventDefault();

    try {
      const scoreId = modal.data?.score?._id;
      const user = modal.data?.user;

      if (!scoreId) {
        alert("Score ID missing.");
        return;
      }

      setActionLoading(`score-${scoreId}`);

      const data = await request(`${API_URL}/api/scores/admin/${scoreId}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({
          score: Number(scoreEditForm.score),
          date: scoreEditForm.date,
        }),
      });

      alert(data.message || "Score updated successfully.");

      await openUserScores(user);
    } catch (err) {
      console.error("ADMIN SCORE UPDATE ERROR:", err);
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const deleteAdminScore = async (score) => {
    const confirmed = window.confirm(
      `Delete score ${score.score} from ${formatDate(score.date)}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(`score-${score._id}`);

      const data = await request(`${API_URL}/api/scores/admin/${score._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      alert(data.message || "Score deleted successfully.");

      setUserScores((prev) => prev.filter((item) => item._id !== score._id));
    } catch (err) {
      console.error("ADMIN SCORE DELETE ERROR:", err);
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = user.isActive === false;

    const confirmed = window.confirm(
      nextStatus ? `Activate ${user.name}?` : `Deactivate ${user.name}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(`user-${user._id}`);

      const data = await request(`${API_URL}/api/users/${user._id}/status`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      alert(data.message);

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const cancelAdminSubscription = async (subscription) => {
    const confirmed = window.confirm(
      `Cancel ${subscription.userId?.name || "this member"}'s subscription?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(`subscription-${subscription._id}`);

      const data = await request(
        `${API_URL}/api/payment/subscriptions/${subscription._id}/cancel`,
        {
          method: "PATCH",
          headers: authHeaders(true),
        },
      );

      alert(data.message);

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <PageTitle
        title={
          activeSection === "dashboard"
            ? "Dashboard"
            : `${activeSection.charAt(0).toUpperCase()}${activeSection.slice(1)}`
        }
      />
      ;
      <div className="min-h-screen bg-[#09111B] text-white">
        {/* MOBILE HEADER */}

        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-800 bg-[#080D14] px-5 lg:hidden">
          <div>
            <h1 className="text-xl font-bold">
              Golf
              <span className="text-[#7867E8]">Impact</span>
            </h1>

            <p className="text-[10px] text-gray-500">Admin Panel</p>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-300"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}

        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-[265px] border-r border-gray-800 bg-[#080D14] transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-800 px-6 py-6">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    Golf
                    <span className="text-[#7867E8]">Impact</span>
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[#A99FFF]">
                    <ShieldCheck size={14} />
                    Administrator
                  </div>
                </div>

                <button
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
              <SidebarItem
                icon={<LayoutDashboard size={19} />}
                text="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => setActiveSection("dashboard")}
              />

              <SidebarItem
                icon={<Users size={19} />}
                text="Users"
                active={activeSection === "users"}
                onClick={() => setActiveSection("users")}
              />

              <SidebarItem
                icon={<CreditCard size={19} />}
                text="Subscriptions"
                active={activeSection === "subscriptions"}
                onClick={() => setActiveSection("subscriptions")}
              />

              <SidebarItem
                icon={<Heart size={19} />}
                text="Charities"
                active={activeSection === "charities"}
                onClick={() => setActiveSection("charities")}
              />

              <SidebarItem
                icon={<CalendarDays size={19} />}
                text="Draws"
                active={activeSection === "draws"}
                onClick={() => setActiveSection("draws")}
              />

              <SidebarItem
                icon={<Trophy size={19} />}
                text="Winner Verification"
                active={activeSection === "winners"}
                badge={pendingVerification.length}
                onClick={() => setActiveSection("winners")}
              />

              <SidebarItem
                icon={<IndianRupee size={19} />}
                text="Payouts"
                active={activeSection === "payouts"}
                badge={pendingPayouts.length}
                onClick={() => setActiveSection("payouts")}
              />
              <SidebarItem
                icon={<BarChart3 size={19} />}
                text="Reports"
                active={activeSection === "reports"}
                onClick={() => setActiveSection("reports")}
              />
            </nav>

            <div className="border-t border-gray-800 p-4">
              <button
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

        <main className="pt-20 lg:ml-66.25 lg:pt-0">
          <header className="hidden h-17 items-center justify-between border-b border-gray-800 bg-[#0B121C] px-8 lg:flex">
            <div>
              <p className="font-semibold">GolfImpact Administration</p>

              <p className="text-xs text-gray-500">Management Console</p>
            </div>

            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-[#482ECE]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </header>

          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {activeSection === "dashboard" && (
              <DashboardOverview
                totalUsers={totalUsers}
                activeUsersCount={activeUsersCount}
                inactiveUsersCount={inactiveUsersCount}
                totalSubscriptions={totalSubscriptions}
                activeSubscriptionsCount={activeSubscriptionsCount}
                cancelledSubscriptionsCount={cancelledSubscriptionsCount}
                expiredSubscriptionsCount={expiredSubscriptionsCount}
                totalWinners={totalWinners}
                totalPrizeValue={totalPrizeValue}
                pendingVerification={pendingVerification}
                pendingPayouts={pendingPayouts}
                totalPaid={totalPaid}
                publishedDrawsCount={publishedDrawsCount}
                completedDrawsCount={completedDrawsCount}
                charitiesCount={charities.length}
                activeCharitiesCount={activeCharitiesCount}
                setActiveSection={setActiveSection}
              />
            )}

            {activeSection === "users" && (
              <UsersSection
                users={filteredUsers}
                totalUsers={users.length}
                search={search}
                setSearch={setSearch}
                roleFilter={userRoleFilter}
                setRoleFilter={setUserRoleFilter}
                statusFilter={userStatusFilter}
                setStatusFilter={setUserStatusFilter}
                actionLoading={actionLoading}
                onToggleStatus={toggleUserStatus}
                onEdit={openEditUser}
                onScores={openUserScores}
                onView={(user) =>
                  setModal({
                    type: "user",
                    data: user,
                  })
                }
              />
            )}

            {activeSection === "subscriptions" && (
              <SubscriptionsSection
                subscriptions={filteredSubscriptions}
                totalSubscriptions={subscriptions.length}
                activeCount={activeSubscriptionCount}
                monthlyCount={monthlySubscriptionCount}
                yearlyCount={yearlySubscriptionCount}
                search={subscriptionSearch}
                setSearch={setSubscriptionSearch}
                planFilter={subscriptionPlanFilter}
                setPlanFilter={setSubscriptionPlanFilter}
                statusFilter={subscriptionStatusFilter}
                setStatusFilter={setSubscriptionStatusFilter}
                actionLoading={actionLoading}
                onCancel={cancelAdminSubscription}
                onView={(subscription) =>
                  setModal({
                    type: "subscription",
                    data: subscription,
                  })
                }
              />
            )}

            {activeSection === "charities" && (
              <CharitiesSection
                charities={filteredCharities}
                totalCharities={charities.length}
                search={charitySearch}
                setSearch={setCharitySearch}
                onAdd={() => navigate("/admin/charities/new")}
                onEdit={(charity) =>
                  navigate(`/admin/charities/${charity._id}/edit`)
                }
                onDelete={deleteCharity}
              />
            )}

            {activeSection === "draws" && (
              <DrawsSection
                draws={draws}
                onCreate={() =>
                  setModal({
                    type: "draw",
                    data: null,
                  })
                }
                onAction={runDrawAction}
                actionLoading={actionLoading}
              />
            )}

            {activeSection === "winners" && (
              <WinnersSection
                winners={filteredWinners}
                winnerFilter={winnerFilter}
                setWinnerFilter={setWinnerFilter}
                pendingCount={pendingVerification.length}
                approvedCount={approvedWinners.length}
                rejectedCount={rejectedWinners.length}
                onView={(winner) =>
                  setModal({
                    type: "winner",
                    data: winner,
                  })
                }
              />
            )}

            {activeSection === "payouts" && (
              <PayoutSection
                winners={winners}
                onPay={(winner) => {
                  setPayoutForm({
                    payoutReference: "",
                    payoutNote: "",
                  });

                  setModal({
                    type: "payout",
                    data: winner,
                  });
                }}
              />
            )}

            {activeSection === "reports" && (
              <ReportsSection
                totalUsers={totalUsers}
                activeUsers={activeUsersCount}
                inactiveUsers={inactiveUsersCount}
                totalSubscriptions={totalSubscriptions}
                activeSubscriptions={activeSubscriptionsCount}
                monthlySubscriptions={monthlySubscriptionsCount}
                yearlySubscriptions={yearlySubscriptionsCount}
                subscriptionRevenue={subscriptionRevenue}
                totalDraws={draws.length}
                publishedDraws={publishedDrawsCount}
                completedDraws={completedDrawsCount}
                totalPrizePool={totalPrizePool}
                totalPrizeValue={totalPrizeValue}
                totalPaid={totalPaid}
                totalRollover={totalRollover}
                totalWinners={totalWinners}
                totalCharities={charities.length}
                activeCharities={activeCharitiesCount}
                totalCharityContribution={totalCharityContribution}
              />
            )}
          </div>
        </main>

        {/* =================================================
          USER MODAL
      ================================================= */}

        {modal.type === "user" && (
          <Modal title="User Details" onClose={closeModal}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalInfo label="Name" value={modal.data?.name} />

              <ModalInfo label="Email" value={modal.data?.email} />

              <ModalInfo label="Phone" value={modal.data?.phone || "-"} />

              <ModalInfo label="Role" value={modal.data?.role || "user"} />

              <ModalInfo
                label="Status"
                value={modal.data?.isActive === false ? "Inactive" : "Active"}
              />

              <ModalInfo
                label="Joined"
                value={formatDate(modal.data?.createdAt)}
              />

              <ModalInfo label="Gender" value={modal.data?.gender || "-"} />

              <ModalInfo
                label="Date of Birth"
                value={formatDate(modal.data?.dateOfBirth)}
              />
            </div>

            {modal.data?.charityContributionPercentage && (
              <div className="mt-4">
                <ModalInfo
                  label="Charity Contribution"
                  value={`${modal.data.charityContributionPercentage}%`}
                />
              </div>
            )}
          </Modal>
        )}

        {modal.type === "edit-user" && (
          <Modal title="Edit User Profile" onClose={closeModal}>
            <form onSubmit={saveAdminUser} className="space-y-4">
              <Input
                label="Name"
                value={userEditForm.name}
                onChange={(value) =>
                  setUserEditForm((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
              />

              <Input
                label="Email"
                value={userEditForm.email}
                onChange={(value) =>
                  setUserEditForm((prev) => ({
                    ...prev,
                    email: value,
                  }))
                }
              />

              <Input
                label="Phone"
                required={false}
                value={userEditForm.phone}
                onChange={(value) =>
                  setUserEditForm((prev) => ({
                    ...prev,
                    phone: value,
                  }))
                }
              />

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Gender
                </label>

                <select
                  value={userEditForm.gender}
                  onChange={(e) =>
                    setUserEditForm((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={userEditForm.dateOfBirth}
                  onChange={(e) =>
                    setUserEditForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                />
              </div>

              <ModalButtons
                loading={actionLoading === `edit-user-${modal.data._id}`}
                onCancel={closeModal}
                submitText="Update User"
              />
            </form>
          </Modal>
        )}

        {modal.type === "user-scores" && (
          <Modal
            title={`${modal.data?.name || "User"} - Golf Scores`}
            onClose={closeModal}
            large
          >
            {scoresLoading ? (
              <p className="py-8 text-center text-gray-500">
                Loading scores...
              </p>
            ) : userScores.length === 0 ? (
              <EmptyState text="No golf scores available for this user." />
            ) : (
              <div className="space-y-3">
                {userScores.map((score) => (
                  <div
                    key={score._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-[#09111B] p-4"
                  >
                    <div>
                      <p className="text-2xl font-bold text-[#A99FFF]">
                        {score.score}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(score.date)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <IconButton onClick={() => openEditScore(score)}>
                        <Pencil size={16} />
                      </IconButton>

                      <IconButton
                        danger
                        onClick={() => deleteAdminScore(score)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}

        {modal.type === "edit-score" && (
          <Modal title="Edit Golf Score" onClose={closeModal}>
            <form onSubmit={saveAdminScore} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Stableford Score
                </label>

                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={scoreEditForm.score}
                  onChange={(e) =>
                    setScoreEditForm((prev) => ({
                      ...prev,
                      score: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Score must be between 1 and 45.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Score Date
                </label>

                <input
                  type="date"
                  required
                  value={scoreEditForm.date}
                  onChange={(e) =>
                    setScoreEditForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                />
              </div>

              <ModalButtons
                loading={actionLoading === `score-${modal.data?.score?._id}`}
                onCancel={closeModal}
                submitText="Update Score"
              />
            </form>
          </Modal>
        )}

        {/* =================================================
    SUBSCRIPTION MODAL
================================================= */}

        {modal.type === "subscription" && (
          <Modal title="Subscription Details" onClose={closeModal}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalInfo
                label="Member"
                value={modal.data?.userId?.name || "Member"}
              />

              <ModalInfo
                label="Email"
                value={modal.data?.userId?.email || "-"}
              />

              <ModalInfo
                label="Plan"
                value={
                  modal.data?.plan
                    ? modal.data.plan.charAt(0).toUpperCase() +
                      modal.data.plan.slice(1)
                    : "-"
                }
              />

              <ModalInfo
                label="Amount"
                value={`₹${Number(modal.data?.amount || 0).toLocaleString(
                  "en-IN",
                )}`}
              />

              <ModalInfo label="Status" value={modal.data?.status || "-"} />

              <ModalInfo
                label="Start Date"
                value={formatDate(modal.data?.startDate)}
              />

              <ModalInfo
                label="Expiry Date"
                value={formatDate(modal.data?.expiryDate)}
              />

              <ModalInfo
                label="Created"
                value={formatDate(modal.data?.createdAt)}
              />
            </div>
          </Modal>
        )}

        {/* =================================================
    CHARITY MODAL
================================================= */}

        {modal.type === "charity" && (
          <Modal
            title={modal.data ? "Edit Charity" : "Add Charity"}
            onClose={closeModal}
            large
          >
            <form onSubmit={saveCharity}>
              {/* TWO COLUMN FORM */}
              <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                {/* NAME */}
                <Input
                  label="Name"
                  value={charityForm.name}
                  onChange={(value) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      name: value,
                    }))
                  }
                />

                {/* CATEGORY */}
                <Input
                  label="Category"
                  value={charityForm.category}
                  onChange={(value) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                />

                {/* LOCATION */}
                <Input
                  label="Location"
                  required={false}
                  value={charityForm.location}
                  onChange={(value) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                />

                {/* WEBSITE */}
                <Input
                  label="Website"
                  value={charityForm.website}
                  onChange={(value) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      website: value,
                    }))
                  }
                />

                {/* IMAGE URL - FULL WIDTH */}
                <div className="md:col-span-2">
                  <Input
                    label="Image URL"
                    value={charityForm.image}
                    onChange={(value) =>
                      setCharityForm((prev) => ({
                        ...prev,
                        image: value,
                      }))
                    }
                  />
                </div>

                {/* DESCRIPTION - FULL WIDTH */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    required
                    value={charityForm.description}
                    onChange={(e) =>
                      setCharityForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Write a short description about this charity..."
                    className="w-full resize-none rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#482ECE] focus:ring-1 focus:ring-[#482ECE]/30"
                  />
                </div>
              </div>

              {/* UPCOMING EVENTS */}
              <div className="mt-6 rounded-2xl border border-gray-800 bg-[#09111B]/60 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Upcoming Events
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Add events that will appear on the charity profile.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addCharityEvent}
                    className="flex items-center gap-2 rounded-xl border border-[#482ECE]/30 bg-[#482ECE]/10 px-4 py-2 text-sm font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/20"
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>

                {charityForm.events.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-700 p-5 text-center">
                    <CalendarDays className="mx-auto text-gray-600" size={24} />

                    <p className="mt-2 text-sm text-gray-500">
                      No upcoming events added.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {charityForm.events.map((event, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-800 bg-[#0D1520] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#A99FFF]">
                            Event {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeCharityEvent(index)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                            title="Remove event"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm text-gray-300">
                              Event Title
                            </label>

                            <input
                              type="text"
                              required
                              value={event.title}
                              onChange={(e) =>
                                updateCharityEvent(
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Charity Golf Day"
                              className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none focus:border-[#482ECE]"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm text-gray-300">
                              Event Date
                            </label>

                            <input
                              type="date"
                              required
                              value={event.date}
                              onChange={(e) =>
                                updateCharityEvent(
                                  index,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none focus:border-[#482ECE]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm text-gray-300">
                              Event Description
                            </label>

                            <textarea
                              rows="3"
                              value={event.description}
                              onChange={(e) =>
                                updateCharityEvent(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Short description about this event..."
                              className="w-full resize-none rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#482ECE]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OPTIONS */}
              <div className="mt-5 flex flex-wrap items-center gap-6 rounded-xl border border-gray-800 bg-[#09111B]/60 px-4 py-3">
                <Checkbox
                  label="Featured Charity"
                  checked={charityForm.featured}
                  onChange={(checked) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      featured: checked,
                    }))
                  }
                />

                <Checkbox
                  label="Active"
                  checked={charityForm.active}
                  onChange={(checked) =>
                    setCharityForm((prev) => ({
                      ...prev,
                      active: checked,
                    }))
                  }
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6">
                <ModalButtons
                  loading={actionLoading}
                  onCancel={closeModal}
                  submitText={modal.data ? "Update Charity" : "Add Charity"}
                />
              </div>
            </form>
          </Modal>
        )}

        {/* =================================================
          DRAW MODAL
      ================================================= */}

        {modal.type === "draw" && (
          <Modal title="Create Monthly Draw" onClose={closeModal}>
            <form onSubmit={createDraw} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Draw Month
                </label>

                <input
                  type="month"
                  required
                  value={drawForm.drawMonth}
                  onChange={(e) =>
                    setDrawForm((prev) => ({
                      ...prev,
                      drawMonth: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Draw Type
                </label>

                <select
                  value={drawForm.drawType}
                  onChange={(e) =>
                    setDrawForm((prev) => ({
                      ...prev,
                      drawType: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none"
                >
                  <option value="random">Random</option>

                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>

              <ModalButtons
                loading={actionLoading}
                onCancel={closeModal}
                submitText="Create Draw"
              />
            </form>
          </Modal>
        )}

        {/* =================================================
          WINNER MODAL
      ================================================= */}

        {modal.type === "winner" && (
          <Modal title="Winner Verification" onClose={closeModal} large>
            <WinnerVerificationModal
              winner={modal.data}
              loading={actionLoading}
              onApprove={() => verifyWinner(modal.data._id, "approved")}
              onReject={() => verifyWinner(modal.data._id, "rejected")}
            />
          </Modal>
        )}

        {/* =================================================
          PAYOUT MODAL
      ================================================= */}

        {modal.type === "payout" && (
          <Modal title="Mark Winner Paid" onClose={closeModal}>
            <form onSubmit={markWinnerPaid} className="space-y-5">
              <div className="rounded-xl border border-gray-800 bg-[#09111B] p-4">
                <p className="text-sm text-gray-500">Winner</p>

                <p className="mt-1 font-semibold">{modal.data?.user?.name}</p>

                <p className="mt-4 text-sm text-gray-500">Prize Amount</p>

                <p className="mt-1 text-2xl font-bold text-green-400">
                  ₹{modal.data?.prizeAmount || 0}
                </p>
              </div>

              <Input
                label="Payout Reference"
                value={payoutForm.payoutReference}
                onChange={(value) =>
                  setPayoutForm((prev) => ({
                    ...prev,
                    payoutReference: value,
                  }))
                }
              />

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Payout Note
                </label>

                <textarea
                  value={payoutForm.payoutNote}
                  onChange={(e) =>
                    setPayoutForm((prev) => ({
                      ...prev,
                      payoutNote: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] p-3 outline-none focus:border-[#482ECE]"
                />
              </div>

              <ModalButtons
                loading={actionLoading}
                onCancel={closeModal}
                submitText="Mark Paid"
              />
            </form>
          </Modal>
        )}
      </div>
    </>
  );
};

// =====================================================
// DASHBOARD OVERVIEW
// =====================================================

const DashboardOverview = ({
  totalUsers,
  activeUsersCount,
  inactiveUsersCount,
  totalSubscriptions,
  activeSubscriptionsCount,
  cancelledSubscriptionsCount,
  expiredSubscriptionsCount,
  totalWinners,
  totalPrizeValue,
  pendingVerification,
  pendingPayouts,
  totalPaid,
  publishedDrawsCount,
  completedDrawsCount,
  charitiesCount,
  activeCharitiesCount,
  setActiveSection,
}) => (
  <>
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">Dashboard Overview</h2>

      <p className="mt-2 text-gray-400">
        Monitor GolfImpact activity from one place.
      </p>
    </div>

    {/* MAIN STATS */}

    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={<Users size={22} />}
      />

      <StatCard
        title="Active Subscriptions"
        value={activeSubscriptionsCount}
        icon={<CreditCard size={22} />}
        success
      />

      <StatCard
        title="Pending Verification"
        value={pendingVerification.length}
        icon={<Clock3 size={22} />}
        warning
      />

      <StatCard
        title="Total Paid"
        value={`₹${Number(totalPaid).toLocaleString("en-IN")}`}
        icon={<IndianRupee size={22} />}
        success
      />
    </div>

    {/* SECONDARY STATS */}

    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MiniStat
        label="Active Users"
        value={activeUsersCount}
        color="text-green-400"
      />

      <MiniStat
        label="Inactive Users"
        value={inactiveUsersCount}
        color="text-red-400"
      />

      <MiniStat
        label="Cancelled Subs"
        value={cancelledSubscriptionsCount}
        color="text-red-400"
      />

      <MiniStat
        label="Expired Subs"
        value={expiredSubscriptionsCount}
        color="text-amber-400"
      />

      <MiniStat
        label="Published Draws"
        value={publishedDrawsCount}
        color="text-[#A99FFF]"
      />

      <MiniStat
        label="Completed Draws"
        value={completedDrawsCount}
        color="text-green-400"
      />
    </div>

    {/* MANAGEMENT */}

    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ManagementCard
        title="Users"
        text={`${activeUsersCount} active of ${totalUsers} users.`}
        icon={<Users />}
        onClick={() => setActiveSection("users")}
      />

      <ManagementCard
        title="Subscriptions"
        text={`${activeSubscriptionsCount} active of ${totalSubscriptions}.`}
        icon={<CreditCard />}
        onClick={() => setActiveSection("subscriptions")}
      />

      <ManagementCard
        title="Charities"
        text={`${activeCharitiesCount} active of ${charitiesCount}.`}
        icon={<Heart />}
        onClick={() => setActiveSection("charities")}
      />

      <ManagementCard
        title="Draws"
        text={`${completedDrawsCount} completed draw(s).`}
        icon={<CalendarDays />}
        onClick={() => setActiveSection("draws")}
      />

      <ManagementCard
        title="Winner Verification"
        text={`${pendingVerification.length} pending request(s).`}
        icon={<Trophy />}
        onClick={() => setActiveSection("winners")}
      />

      <ManagementCard
        title="Payouts"
        text={`${pendingPayouts.length} payout(s) waiting.`}
        icon={<IndianRupee />}
        onClick={() => setActiveSection("payouts")}
      />
    </div>

    {/* PRIZE SUMMARY */}

    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5">
        <p className="text-sm text-gray-500">Total Winner Prize Value</p>

        <p className="mt-2 text-3xl font-bold text-[#A99FFF]">
          ₹{Number(totalPrizeValue).toLocaleString("en-IN")}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Across {totalWinners} winner record(s).
        </p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5">
        <p className="text-sm text-gray-500">Paid Prize Amount</p>

        <p className="mt-2 text-3xl font-bold text-green-400">
          ₹{Number(totalPaid).toLocaleString("en-IN")}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          {pendingPayouts.length} approved payout(s) still pending.
        </p>
      </div>
    </div>

    {(pendingVerification.length > 0 || pendingPayouts.length > 0) && (
      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <div className="flex gap-3">
          <AlertCircle className="text-amber-400" />

          <div>
            <h3 className="font-bold">Action Required</h3>

            <p className="mt-1 text-sm text-gray-400">
              {pendingVerification.length} verification request(s) and{" "}
              {pendingPayouts.length} payout(s) are waiting for admin action.
            </p>
          </div>
        </div>
      </div>
    )}
  </>
);

// =====================================================
// USERS SECTION
// =====================================================

const UsersSection = ({
  users,
  totalUsers,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onView,
  onEdit,
  onScores,
  onToggleStatus,
  actionLoading,
}) => (
  <SectionCard>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionHeading
        title="Users"
        subtitle="Manage registered GolfImpact members."
      />

      <div className="rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 px-4 py-2">
        <p className="text-xs text-gray-500">Total Users</p>

        <p className="text-xl font-bold text-[#A99FFF]">{totalUsers}</p>
      </div>
    </div>

    <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex-1">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex">
        <div>
          <label className="mb-2 block text-xs text-gray-500">Role</label>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="min-w-35 rounded-xl border border-gray-700 bg-[#09111B] px-3 py-3 text-sm text-gray-300 outline-none focus:border-[#482ECE]"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-gray-500">Status</label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-35 rounded-xl border border-gray-700 bg-[#09111B] px-3 py-3 text-sm text-gray-300 outline-none focus:border-[#482ECE]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    {users.length > 0 ? (
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
            <Th>Action</Th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="border-b border-gray-800 transition hover:bg-white/2"
            >
              {/* NAME */}
              <Td>
                <div>
                  <p className="font-medium text-white">
                    {user.name || "Member"}
                  </p>

                  {user.phone && (
                    <p className="mt-1 text-xs text-gray-500">{user.phone}</p>
                  )}
                </div>
              </Td>

              {/* EMAIL */}
              <Td>{user.email || "-"}</Td>

              {/* ROLE */}
              <Td>
                <Badge text={user.role || "user"} />
              </Td>

              {/* STATUS */}
              <Td>
                <Badge text={user.isActive === false ? "inactive" : "active"} />
              </Td>

              {/* JOINED */}
              <Td>{formatDate(user.createdAt)}</Td>

              {/* ACTION */}
              <Td>
                <div className="flex items-center gap-2">
                  {/* VIEW USER */}
                  <IconButton onClick={() => onView(user)}>
                    <Eye size={16} />
                  </IconButton>

                  {/* EDIT USER */}
                  <IconButton onClick={() => onEdit(user)}>
                    <Pencil size={16} />
                  </IconButton>

                  {/* MANAGE SCORES */}
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => onScores(user)}
                      className="rounded-lg border border-[#482ECE]/30 bg-[#482ECE]/10 px-3 py-2 text-xs font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/20"
                    >
                      Scores
                    </button>
                  )}

                  {/* ACTIVATE / DEACTIVATE */}
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      disabled={actionLoading === `user-${user._id}`}
                      onClick={() => onToggleStatus(user)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.isActive === false
                          ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {actionLoading === `user-${user._id}`
                        ? "Updating..."
                        : user.isActive === false
                          ? "Activate"
                          : "Deactivate"}
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <div className="mt-6">
        <EmptyState text="No users match the selected filters." />
      </div>
    )}
  </SectionCard>
);

// =====================================================
// SUBSCRIPTIONS SECTION
// =====================================================

const SubscriptionsSection = ({
  subscriptions,
  totalSubscriptions,
  activeCount,
  monthlyCount,
  yearlyCount,
  search,
  setSearch,
  planFilter,
  setPlanFilter,
  statusFilter,
  setStatusFilter,
  onView,
  onCancel,
  actionLoading,
}) => {
  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          title="Subscriptions"
          subtitle="Monitor membership plans and subscription lifecycle."
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SubscriptionStat label="Total" value={totalSubscriptions} />

          <SubscriptionStat
            label="Active"
            value={activeCount}
            color="text-green-400"
          />

          <SubscriptionStat
            label="Monthly"
            value={monthlyCount}
            color="text-[#A99FFF]"
          />

          <SubscriptionStat
            label="Yearly"
            value={yearlyCount}
            color="text-[#A99FFF]"
          />
        </div>
      </div>

      {/* FILTERS */}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search member name or email..."
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-gray-300 outline-none focus:border-[#482ECE]"
        >
          <option value="all">All Plans</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-gray-300 outline-none focus:border-[#482ECE]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* TABLE */}

      {subscriptions.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Plan</Th>
              <Th>Amount</Th>
              <Th>Started</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((sub) => (
              <tr
                key={sub._id}
                className="border-b border-gray-800 transition hover:bg-white/[0.02]"
              >
                <Td>
                  <div>
                    <p className="font-medium text-white">
                      {sub.userId?.name || "Member"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {sub.userId?.email || "-"}
                    </p>
                  </div>
                </Td>

                <Td>
                  <span className="capitalize">{sub.plan || "-"}</span>
                </Td>

                <Td>{money(sub.amount)}</Td>

                <Td>{formatDate(sub.startDate)}</Td>

                <Td>{formatDate(sub.expiryDate)}</Td>

                <Td>
                  <Badge text={sub.status || "unknown"} />
                </Td>

                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton onClick={() => onView(sub)}>
                      <Eye size={16} />
                    </IconButton>

                    {sub.status === "active" && (
                      <button
                        type="button"
                        disabled={actionLoading === `subscription-${sub._id}`}
                        onClick={() => onCancel(sub)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading === `subscription-${sub._id}`
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="mt-6">
          <EmptyState text="No subscriptions match the selected filters." />
        </div>
      )}
    </SectionCard>
  );
};

// =====================================================
// Subscription Modal
// =====================================================

// =====================================================
// CHARITIES
// =====================================================

const CharitiesSection = ({
  charities,
  totalCharities,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <SectionCard>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionHeading
        title="Charities"
        subtitle="Manage available charity organisations."
      />

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-[#482ECE]/20 bg-[#482ECE]/10 px-4 py-2">
          <p className="text-xs text-gray-500">Total Charities</p>
          <p className="text-xl font-bold text-[#A99FFF]">{totalCharities}</p>
        </div>

        <PrimaryButton onClick={onAdd}>
          <Plus size={17} />
          Add Charity
        </PrimaryButton>
      </div>
    </div>

    {/* SEARCH */}
    <div className="mt-5">
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search by name, category or location..."
      />
    </div>

    {charities.length > 0 ? (
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Location</Th>
            <Th>Featured</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {charities.map((charity) => (
            <tr
              key={charity._id}
              className="border-b border-gray-800 transition hover:bg-white/[0.02]"
            >
              <Td>{charity.name}</Td>

              <Td>{charity.category}</Td>

              <Td>{charity.location || "-"}</Td>

              <Td>{charity.featured ? "Yes" : "No"}</Td>

              <Td>
                <Badge
                  text={charity.active !== false ? "active" : "inactive"}
                />
              </Td>

              <Td>
                <div className="flex gap-2">
                  <IconButton onClick={() => onEdit(charity)}>
                    <Pencil size={15} />
                  </IconButton>

                  <IconButton danger onClick={() => onDelete(charity._id)}>
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <div className="mt-6">
        <EmptyState text="No charities match your search." />
      </div>
    )}
  </SectionCard>
);
// =====================================================
// DRAWS
// =====================================================

const DrawsSection = ({ draws, onCreate, onAction, actionLoading }) => {
  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <SectionCard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="Draw Management"
          subtitle="Configure, simulate, publish and manage monthly draws."
        />

        <PrimaryButton onClick={onCreate}>
          <Plus size={17} />
          Create Draw
        </PrimaryButton>
      </div>

      <div className="mt-6 space-y-5">
        {draws.length > 0 ? (
          draws.map((draw) => {
            const isDraft = draw.status === "draft";
            const isSimulated = draw.status === "simulated";
            const isPublished = draw.status === "published";

            const prizeCalculated = Boolean(
              draw.prizeCalculation?.calculatedAt,
            );

            const winnersCalculated = Boolean(draw.winnersCalculatedAt);

            const prizesDistributed = Boolean(draw.prizesDistributedAt);

            const isActionLoading = (action) =>
              actionLoading === `${draw._id}-${action}`;

            return (
              <div
                key={draw._id}
                className="rounded-2xl border border-gray-800 bg-[#09111B]/60 p-5"
              >
                {/* DRAW HEADER */}

                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Draw Month
                    </p>

                    <h3 className="mt-1 text-xl font-bold">{draw.drawMonth}</h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge text={draw.status} />

                      <Badge text={draw.drawType || "random"} />
                    </div>
                  </div>

                  {/* NUMBERS */}

                  <div>
                    <p className="mb-2 text-xs text-gray-500">Draw Numbers</p>

                    <div className="flex flex-wrap gap-2">
                      {draw.drawNumbers?.map((number) => (
                        <span
                          key={number}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#482ECE]/30 bg-[#482ECE]/15 font-bold text-[#A99FFF]"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PRIZE DETAILS */}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <DrawInfo
                    label="Prize Pool"
                    value={
                      prizeCalculated
                        ? formatMoney(draw.prizePool)
                        : "Not calculated"
                    }
                  />

                  <DrawInfo
                    label="5 Match"
                    value={
                      prizeCalculated
                        ? formatMoney(draw.prizeBreakdown?.fiveMatch)
                        : "-"
                    }
                  />

                  <DrawInfo
                    label="4 Match"
                    value={
                      prizeCalculated
                        ? formatMoney(draw.prizeBreakdown?.fourMatch)
                        : "-"
                    }
                  />

                  <DrawInfo
                    label="3 Match"
                    value={
                      prizeCalculated
                        ? formatMoney(draw.prizeBreakdown?.threeMatch)
                        : "-"
                    }
                  />

                  <DrawInfo
                    label="Rollover In"
                    value={formatMoney(draw.rolloverIn)}
                  />
                </div>

                {/* PROGRESS */}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <DrawStatus label="Prize Pool" complete={prizeCalculated} />

                  <DrawStatus
                    label="Winners Calculated"
                    complete={winnersCalculated}
                  />

                  <DrawStatus
                    label="Prize Distribution"
                    complete={prizesDistributed}
                  />
                </div>

                {/* ROLLOVER RESULT */}

                {prizesDistributed && (
                  <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 size={18} />

                        <span className="font-semibold">Draw completed</span>
                      </div>

                      <p className="text-sm">
                        <span className="text-gray-500">Jackpot Rollover:</span>{" "}
                        <span className="font-semibold text-white">
                          {formatMoney(draw.jackpotRollover)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-6 border-t border-gray-800 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Draw Workflow
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {/* PRIZE POOL */}

                    <ActionButton
                      disabled={
                        isPublished || isActionLoading("calculate-prize-pool")
                      }
                      onClick={() => onAction(draw._id, "calculate-prize-pool")}
                    >
                      <Calculator size={15} />

                      {isActionLoading("calculate-prize-pool")
                        ? "Calculating..."
                        : prizeCalculated
                          ? "Recalculate Pool"
                          : "Calculate Prize Pool"}
                    </ActionButton>

                    {/* SIMULATE */}

                    <ActionButton
                      disabled={
                        isPublished ||
                        !prizeCalculated ||
                        isActionLoading("simulate")
                      }
                      onClick={() => onAction(draw._id, "simulate")}
                    >
                      <Play size={15} />

                      {isActionLoading("simulate")
                        ? "Simulating..."
                        : isSimulated
                          ? "Simulate Again"
                          : "Simulate"}
                    </ActionButton>

                    {/* PUBLISH */}

                    <ActionButton
                      disabled={
                        !isSimulated ||
                        !prizeCalculated ||
                        isPublished ||
                        isActionLoading("publish")
                      }
                      onClick={() => onAction(draw._id, "publish")}
                    >
                      <Send size={15} />

                      {isActionLoading("publish")
                        ? "Publishing..."
                        : isPublished
                          ? "Published"
                          : "Publish"}
                    </ActionButton>

                    {/* WINNERS */}

                    <ActionButton
                      disabled={
                        !isPublished ||
                        prizesDistributed ||
                        isActionLoading("calculate-winners")
                      }
                      onClick={() => onAction(draw._id, "calculate-winners")}
                    >
                      <Trophy size={15} />

                      {isActionLoading("calculate-winners")
                        ? "Calculating..."
                        : winnersCalculated
                          ? "Recalculate Winners"
                          : "Calculate Winners"}
                    </ActionButton>

                    {/* DISTRIBUTION */}

                    <ActionButton
                      disabled={
                        !isPublished ||
                        !winnersCalculated ||
                        prizesDistributed ||
                        isActionLoading("distribute-prizes")
                      }
                      onClick={() => onAction(draw._id, "distribute-prizes")}
                    >
                      <Wallet size={15} />

                      {isActionLoading("distribute-prizes")
                        ? "Distributing..."
                        : prizesDistributed
                          ? "Distributed"
                          : "Distribute Prizes"}
                    </ActionButton>
                  </div>

                  {/* NEXT STEP MESSAGE */}

                  {isDraft && !prizeCalculated && (
                    <p className="mt-3 text-xs text-amber-400">
                      Next: calculate the prize pool.
                    </p>
                  )}

                  {isDraft && prizeCalculated && (
                    <p className="mt-3 text-xs text-[#A99FFF]">
                      Prize pool ready. Simulate the draw next.
                    </p>
                  )}

                  {isSimulated && !isPublished && (
                    <p className="mt-3 text-xs text-green-400">
                      Simulation complete. Draw is ready to publish.
                    </p>
                  )}

                  {isPublished && !winnersCalculated && (
                    <p className="mt-3 text-xs text-[#A99FFF]">
                      Draw published. Calculate official winners.
                    </p>
                  )}

                  {isPublished && winnersCalculated && !prizesDistributed && (
                    <p className="mt-3 text-xs text-[#A99FFF]">
                      Winners calculated. You can now distribute prizes.
                    </p>
                  )}

                  {prizesDistributed && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle2 size={14} />
                      Draw workflow completed.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState text="No draws available." />
        )}
      </div>
    </SectionCard>
  );
};

// =====================================================
// WINNERS
// =====================================================

const WinnersSection = ({
  winners,
  winnerFilter,
  setWinnerFilter,
  pendingCount,
  approvedCount,
  rejectedCount,
  onView,
}) => (
  <SectionCard>
    <SectionHeading
      title="Winner Verification"
      subtitle="Review uploaded winner proof."
    />

    <div className="mt-5 flex flex-wrap gap-2">
      <FilterButton
        active={winnerFilter === "pending"}
        onClick={() => setWinnerFilter("pending")}
      >
        Pending ({pendingCount})
      </FilterButton>

      <FilterButton
        active={winnerFilter === "approved"}
        onClick={() => setWinnerFilter("approved")}
      >
        Approved ({approvedCount})
      </FilterButton>

      <FilterButton
        active={winnerFilter === "rejected"}
        onClick={() => setWinnerFilter("rejected")}
      >
        Rejected ({rejectedCount})
      </FilterButton>

      <FilterButton
        active={winnerFilter === "all"}
        onClick={() => setWinnerFilter("all")}
      >
        All
      </FilterButton>
    </div>

    <Table>
      <thead>
        <tr>
          <Th>User</Th>
          <Th>Draw</Th>
          <Th>Match</Th>
          <Th>Prize</Th>
          <Th>Verification</Th>
          <Th>Proof</Th>
        </tr>
      </thead>

      <tbody>
        {winners.map((winner) => (
          <tr key={winner._id} className="border-b border-gray-800">
            <Td>{winner.user?.name || "Member"}</Td>

            <Td>{winner.draw?.drawMonth || "-"}</Td>

            <Td>{winner.matchCount} Match</Td>

            <Td>₹{winner.prizeAmount || 0}</Td>

            <Td>
              <Badge text={winner.verificationStatus} />
            </Td>

            <Td>
              <button
                onClick={() => onView(winner)}
                className="rounded-lg border border-[#482ECE]/30 bg-[#482ECE]/10 px-3 py-2 text-xs font-semibold text-[#A99FFF]"
              >
                Review
              </button>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  </SectionCard>
);

// =====================================================
// PAYOUT
// =====================================================

const PayoutSection = ({ winners, onPay }) => {
  const payoutWinners = winners.filter(
    (winner) => winner.verificationStatus === "approved",
  );

  return (
    <SectionCard>
      <SectionHeading
        title="Winner Payouts"
        subtitle="Process approved winner payments."
      />

      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Prize</Th>
            <Th>Draw</Th>
            <Th>Status</Th>
            <Th>Reference</Th>
            <Th>Action</Th>
          </tr>
        </thead>

        <tbody>
          {payoutWinners.map((winner) => (
            <tr key={winner._id} className="border-b border-gray-800">
              <Td>{winner.user?.name}</Td>

              <Td>₹{winner.prizeAmount}</Td>

              <Td>{winner.draw?.drawMonth || "-"}</Td>

              <Td>
                <Badge text={winner.payoutStatus} />
              </Td>

              <Td>{winner.payoutReference || "-"}</Td>

              <Td>
                {winner.payoutStatus === "paid" ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={16} />
                    Paid
                  </span>
                ) : (
                  <button
                    onClick={() => onPay(winner)}
                    className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400"
                  >
                    Mark Paid
                  </button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </SectionCard>
  );
};

const getProofImageUrl = (proofImage) => {
  if (!proofImage) return "";

  if (proofImage.startsWith("http://") || proofImage.startsWith("https://")) {
    return proofImage;
  }

  return `${API_URL}${proofImage}`;
};

// =====================================================
// WINNER MODAL CONTENT
// =====================================================

const WinnerVerificationModal = ({ winner, loading, onApprove, onReject }) => (
  <div>
    <div className="grid gap-3 sm:grid-cols-2">
      <ModalInfo label="Winner" value={winner.user?.name} />

      <ModalInfo label="Draw" value={winner.draw?.drawMonth} />

      <ModalInfo label="Match" value={`${winner.matchCount} Match`} />

      <ModalInfo label="Prize" value={`₹${winner.prizeAmount}`} />
    </div>

    <div className="mt-5">
      <p className="mb-3 text-sm text-gray-400">Uploaded Proof</p>

      {winner.proofImage ? (
        <a
          href={getProofImageUrl(winner.proofImage)}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={getProofImageUrl(winner.proofImage)}
            alt="Winner proof"
            className="max-h-105 w-full rounded-xl border border-gray-800 object-contain"
          />
        </a>
      ) : (
        <EmptyState text="Winner has not uploaded proof yet." />
      )}
    </div>

    {winner.verificationStatus === "pending" && winner.proofImage && (
      <div className="mt-6 flex gap-3">
        <button
          disabled={loading}
          onClick={onReject}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 font-semibold text-red-400"
        >
          <XCircle size={18} />
          Reject
        </button>

        <button
          disabled={loading}
          onClick={onApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white"
        >
          <CheckCircle2 size={18} />
          Approve
        </button>
      </div>
    )}
  </div>
);

// =====================================================
// REPORTS / ANALYTICS
// =====================================================

const ReportsSection = ({
  totalUsers,
  activeUsers,
  inactiveUsers,
  totalSubscriptions,
  activeSubscriptions,
  monthlySubscriptions,
  yearlySubscriptions,
  subscriptionRevenue,
  totalDraws,
  publishedDraws,
  completedDraws,
  totalPrizePool,
  totalPrizeValue,
  totalPaid,
  totalRollover,
  totalWinners,
  totalCharities,
  activeCharities,
  totalCharityContribution,
}) => {
  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div>
      <SectionHeading
        title="Reports & Analytics"
        subtitle="GolfImpact platform performance summary."
      />

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Users"
          main={totalUsers}
          rows={[
            ["Active", activeUsers],
            ["Inactive", inactiveUsers],
          ]}
        />

        <ReportCard
          title="Subscriptions"
          main={activeSubscriptions}
          mainLabel="Active"
          rows={[
            ["Total", totalSubscriptions],
            ["Monthly", monthlySubscriptions],
            ["Yearly", yearlySubscriptions],
          ]}
        />

        <ReportCard
          title="Subscription Revenue"
          main={money(subscriptionRevenue)}
          rows={[["Subscriptions", totalSubscriptions]]}
        />

        <ReportCard
          title="Charities"
          main={activeCharities}
          mainLabel="Active"
          rows={[["Total", totalCharities]]}
        />
        <ReportCard
          title="Charity Contributions"
          main={money(totalCharityContribution)}
          mainLabel="Total Contribution"
          rows={[
            ["Active Charities", activeCharities],
            ["Total Charities", totalCharities],
          ]}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          title="Draw Performance"
          main={totalDraws}
          mainLabel="Total Draws"
          rows={[
            ["Published", publishedDraws],
            ["Completed", completedDraws],
          ]}
        />

        <ReportCard
          title="Prize Summary"
          main={money(totalPrizePool)}
          mainLabel="Total Prize Pool"
          rows={[
            ["Winner Value", money(totalPrizeValue)],
            ["Paid", money(totalPaid)],
            ["Rollover", money(totalRollover)],
          ]}
        />

        <ReportCard
          title="Winners"
          main={totalWinners}
          mainLabel="Winner Records"
          rows={[["Paid Amount", money(totalPaid)]]}
        />
      </div>
    </div>
  );
};

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

const ReportCard = ({ title, main, mainLabel = "Total", rows = [] }) => (
  <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5">
    <p className="text-sm font-semibold text-gray-300">{title}</p>

    <p className="mt-4 text-3xl font-bold text-[#A99FFF]">{main}</p>

    <p className="mt-1 text-xs text-gray-500">{mainLabel}</p>

    <div className="mt-5 space-y-3 border-t border-gray-800 pt-4">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">{label}</span>

          <span className="text-sm font-semibold text-white">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SidebarItem = ({ icon, text, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
      active ? "bg-[#482ECE] font-semibold" : "text-gray-400 hover:bg-white/5"
    }`}
  >
    {icon}

    <span className="flex-1 text-left">{text}</span>

    {badge > 0 && (
      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
        {badge}
      </span>
    )}
  </button>
);

const SectionCard = ({ children }) => (
  <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
    {children}
  </div>
);

const SectionHeading = ({ title, subtitle }) => (
  <div>
    <h2 className="text-2xl font-bold">{title}</h2>

    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
  </div>
);

const StatCard = ({ title, value, icon, warning, success }) => (
  <div className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5">
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
        warning
          ? "bg-amber-500/10 text-amber-400"
          : success
            ? "bg-green-500/10 text-green-400"
            : "bg-[#482ECE]/15 text-[#A99FFF]"
      }`}
    >
      {icon}
    </div>

    <p className="mt-4 text-sm text-gray-500">{title}</p>

    <p className="mt-1 text-3xl font-bold">{value}</p>
  </div>
);

const MiniStat = ({ label, value, color = "text-white" }) => (
  <div className="rounded-xl border border-gray-800 bg-[#0D1520] p-4">
    <p className="text-xs text-gray-500">{label}</p>

    <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
  </div>
);

const ManagementCard = ({ title, text, icon, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 text-left transition hover:border-[#482ECE]/50"
  >
    <div className="text-[#A99FFF]">{icon}</div>

    <p className="mt-2 text-sm text-gray-500">{text}</p>
  </button>
);

const Table = ({ children }) => (
  <div
    className="
    overflow-x-auto
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-[#09111B]
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-[#6C50F5]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-[#7867E8]
  "
  >
    <table className="w-full min-w-187.5 text-left text-sm">{children}</table>
  </div>
);

const Th = ({ children }) => (
  <th className="border-y border-gray-800 bg-[#09111B] px-4 py-3 font-medium text-gray-500">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-4 py-4 text-gray-300">{children}</td>
);

const Badge = ({ text }) => {
  const success = ["active", "approved", "paid", "published"].includes(text);

  const danger = ["rejected", "cancelled", "inactive"].includes(text);

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        success
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : danger
            ? "border-red-500/20 bg-red-500/10 text-red-400"
            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
      }`}
    >
      {text || "unknown"}
    </span>
  );
};

const SubscriptionStat = ({ label, value, color = "text-white" }) => (
  <div className="min-w-25 rounded-xl border border-gray-800 bg-[#0D1520] px-4 py-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
  </div>
);

const SearchBox = ({ value, onChange, placeholder }) => (
  <div className="relative max-w-md">
    <Search size={17} className="absolute left-3 top-3.5 text-gray-600" />

    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-700 bg-[#09111B] py-3 pl-10 pr-4 outline-none focus:border-[#482ECE]"
    />
  </div>
);

const PrimaryButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-xl bg-[#482ECE] px-4 py-2.5 text-sm font-semibold"
  >
    {children}
  </button>
);

const ActionButton = ({ children, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#0D1520] px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#482ECE] hover:text-white disabled:cursor-not-allowed disabled:border-gray-800 disabled:text-gray-600 disabled:opacity-50"
  >
    {children}
  </button>
);

const DrawInfo = ({ label, value }) => (
  <div className="rounded-xl border border-gray-800 bg-[#0D1520] p-4">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="mt-1 font-semibold text-gray-200">{value}</p>
  </div>
);

const DrawStatus = ({ label, complete }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-[#0D1520] p-3">
    {complete ? (
      <CheckCircle2 size={18} className="shrink-0 text-green-400" />
    ) : (
      <Clock3 size={18} className="shrink-0 text-gray-600" />
    )}

    <div>
      <p className="text-xs text-gray-500">{label}</p>

      <p
        className={`text-sm font-semibold ${
          complete ? "text-green-400" : "text-gray-400"
        }`}
      >
        {complete ? "Complete" : "Pending"}
      </p>
    </div>
  </div>
);

const IconButton = ({ children, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`rounded-lg border p-2 ${
      danger
        ? "border-red-500/20 bg-red-500/10 text-red-400"
        : "border-[#482ECE]/20 bg-[#482ECE]/10 text-[#A99FFF]"
    }`}
  >
    {children}
  </button>
);

const FilterButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm ${
      active
        ? "bg-[#482ECE] text-white"
        : "border border-gray-700 text-gray-400"
    }`}
  >
    {children}
  </button>
);

const Modal = ({ title, children, onClose, large = false }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    onMouseDown={onClose}
  >
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className={`w-full overflow-hidden rounded-2xl border border-gray-700 bg-[#0D1520] shadow-2xl ${
        large ? "max-w-3xl" : "max-w-lg"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
        <h2 className="text-xl font-bold text-white">{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  placeholder = "",
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-300">
      {label}
    </label>

    <input
      type={type}
      required={required}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#482ECE] focus:ring-1 focus:ring-[#482ECE]/30"
    />
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />

    {label}
  </label>
);

const ModalInfo = ({ label, value }) => (
  <div className="rounded-xl border border-gray-800 bg-[#09111B] p-4">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="mt-1 font-medium text-gray-200">{value || "-"}</p>
  </div>
);
const ModalButtons = ({ loading, onCancel, submitText }) => (
  <div className="flex gap-3 pt-3">
    <button
      type="button"
      onClick={onCancel}
      className="flex-1 rounded-xl border border-gray-700 py-3 text-gray-300 transition hover:bg-white/5"
    >
      Cancel
    </button>

    <button
      disabled={loading}
      type="submit"
      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#482ECE] py-3 font-semibold transition hover:bg-[#5940df] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}

      {loading ? "Processing..." : submitText}
    </button>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-gray-800 bg-[#09111B] p-8 text-center text-gray-500">
    {text}
  </div>
);

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default AdminDashboard;
