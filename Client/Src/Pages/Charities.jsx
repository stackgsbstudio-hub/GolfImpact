import { useEffect, useMemo, useState } from "react";

import {
  Search,
  MapPin,
  Heart,
  Star,
  X,
  ExternalLink,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import CharityBanner from "../../assests/image/charity-banner.png";
import PageTitle from "../Components/PageTitle";

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (image) => {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_URL}${image}`;
};

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [allCharities, setAllCharities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [selectedDetails, setSelectedDetails] = useState(null);

  const [selectionModal, setSelectionModal] = useState(false);
  const [charityToSelect, setCharityToSelect] = useState(null);

  const [myCharity, setMyCharity] = useState(null);

  const [contributionPercentage, setContributionPercentage] = useState(10);

  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH ALL CHARITIES
  // Used for categories + initial directory
  // =====================================================

  const fetchAllCharities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/charities`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load charities.");
      }

      setAllCharities(data.charities || []);
    } catch (err) {
      console.error("Fetch All Charities Error:", err);
    }
  };

  // =====================================================
  // FETCH FILTERED CHARITIES
  // =====================================================

  const fetchCharities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category) {
        params.append("category", category);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/api/charities${query ? `?${query}` : ""}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load charities.");
      }

      setCharities(data.charities || []);
    } catch (err) {
      console.error("Fetch Charities Error:", err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET MY SELECTED CHARITY
  // =====================================================

  const fetchMyCharity = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/charities/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 403) {
        setMyCharity(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load selected charity.");
      }

      setMyCharity(data.charity || null);
    } catch (err) {
      console.error("Fetch My Charity Error:", err);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAllCharities();
    fetchMyCharity();
  }, []);

  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCharities();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, category]);

  // =====================================================
  // CATEGORY LIST
  // =====================================================

  const categories = useMemo(() => {
    const values = allCharities
      .map((charity) => charity.category)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [allCharities]);

  // =====================================================
  // FEATURED CHARITY
  // =====================================================

  const featuredCharity = useMemo(() => {
    return allCharities.find((charity) => charity.featured === true);
  }, [allCharities]);

  // =====================================================
  // OPEN SELECT MODAL
  // =====================================================

  const openSelectionModal = (charity) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setCharityToSelect(charity);

    const isCurrent = myCharity?.charity?._id === charity._id;

    setContributionPercentage(
      isCurrent ? myCharity.contributionPercentage : 10,
    );

    setSelectionModal(true);
  };

  // =====================================================
  // SELECT / CHANGE CHARITY
  // =====================================================

  const handleSelectCharity = async () => {
    if (!charityToSelect) return;

    const percentage = Number(contributionPercentage);

    if (!Number.isFinite(percentage) || percentage < 10 || percentage > 100) {
      alert("Contribution percentage must be between 10 and 100.");

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/charities/select`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          charityId: charityToSelect._id,
          contributionPercentage: percentage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to select charity.");
      }

      setMyCharity(data.charity);

      setSelectionModal(false);
      setCharityToSelect(null);

      alert("Charity selection updated successfully.");
    } catch (err) {
      console.error("Select Charity Error:", err);

      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title="Charities" />
      <Navbar />

      <main className="min-h-screen bg-[#09111B] text-white">
        {/* =================================================
    HERO
================================================= */}

        <section className="relative overflow-hidden border-b border-gray-800 bg-[#09111B]">
          <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid grid-cols-1 items-center gap-10 py-10 md:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              {/* LEFT CONTENT */}
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400">
                  <Heart size={16} />
                  Golf with purpose
                </div>

                <h1 className="text-[42px] font-semibold leading-[1.08] text-white md:text-5xl lg:text-[58px]">
                  Choose a cause.
                  <span className="block text-[#6C50F5]">Make an impact.</span>
                </h1>

                <p className="mt-5 max-w-[650px] text-[15px] leading-6 text-gray-300 lg:text-base">
                  Explore meaningful charities and choose where part of your
                  GolfImpact subscription creates real social impact.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-green-400"
                    />
                    Minimum 10% contribution
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
                    <Heart size={17} className="shrink-0 text-purple-400" />
                    Support a cause you care about
                  </div>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="flex w-full items-center justify-center lg:justify-end">
                <div className="relative w-full overflow-hidden rounded-2xl border border-purple-500/20 bg-gray-900">
                  <img
                    src={CharityBanner}
                    alt="GolfImpact supporting charities through golf"
                    className="w-full h-75 md:h-95 lg:h-100 object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#09111B]/10 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FEATURED CHARITY
        ================================================= */}

        {featuredCharity && (
          <section className="container mx-auto px-4 pt-6">
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#09111B] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="grid md:grid-cols-2">
                {/* IMAGE */}

                <div className="relative flex min-h-77.5 items-center justify-center overflow-hidden bg-gray-900">
                  {featuredCharity.image || featuredCharity.images?.[0] ? (
                    <img
                      src={getImageUrl(
                        featuredCharity.images?.[0] || featuredCharity.image,
                      )}
                      alt={featuredCharity.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#24175e_0%,#111827_65%)]">
                      <Heart size={90} className="text-purple-400/60" />
                    </div>
                  )}

                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-yellow-500/30 bg-gray-950/80 px-4 py-2 text-sm font-medium text-yellow-400 backdrop-blur">
                    <Star size={15} fill="currentColor" />
                    Featured Charity
                  </div>
                </div>

                {/* CONTENT */}

                <div className="flex flex-col justify-center bg-gray-900 p-7 md:p-10 lg:p-12">
                  <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                    Featured Partner
                  </span>

                  <h2 className="mt-3 text-3xl font-medium text-white lg:text-4xl">
                    {featuredCharity.name}
                  </h2>

                  <p className="mt-5 leading-7 text-gray-400">
                    {featuredCharity.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {featuredCharity.category && (
                      <span className="rounded-full bg-purple-500/10 px-4 py-2 text-sm text-purple-400">
                        {featuredCharity.category}
                      </span>
                    )}

                    {featuredCharity.location && (
                      <span className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                        <MapPin size={15} />

                        {featuredCharity.location}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedDetails(featuredCharity)}
                    className="mt-8 w-fit rounded-xl bg-linear-to-r from-purple-500 to-blue-800 px-6 py-3 font-medium text-white transition hover:opacity-90"
                  >
                    View Charity
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            CHARITY DIRECTORY
        ================================================= */}

        <section className="container mx-auto px-4">
          <div className="mt-6 rounded-2xl border border-gray-800 bg-[#09111B] px-4 py-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] lg:px-8">
            {/* TITLE */}

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                  Our Partners
                </span>

                <h2 className="mt-2 text-xl font-medium text-white lg:text-3xl">
                  Find a charity you care about
                </h2>

                <p className="mt-3 text-gray-400">
                  Search and explore organisations making a difference.
                </p>
              </div>

              {!loading && !error && (
                <div className="rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-400">
                  <span className="font-medium text-purple-400">
                    {charities.length}
                  </span>{" "}
                  {charities.length === 1 ? "charity" : "charities"}
                </div>
              )}
            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div className="mt-10 grid gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 md:grid-cols-[1fr_260px]">
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search charities..."
                  className="w-full rounded-xl border border-gray-700 bg-[#09111B] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              {/* CATEGORY */}

              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3.5 pr-10 text-gray-300 outline-none transition focus:border-purple-500"
                >
                  <option value="">All Categories</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="py-20 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-purple-500" />

                <p className="mt-4 text-sm text-gray-400">
                  Loading charities...
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
                {error}
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading && !error && charities.length === 0 && (
              <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Heart size={30} className="text-purple-400" />
                </div>

                <h3 className="mt-5 text-xl font-medium text-white">
                  No charities found
                </h3>

                <p className="mt-2 text-gray-400">
                  Try changing your search or category.
                </p>
              </div>
            )}

            {/* =================================================
                CHARITY CARDS
            ================================================= */}

            {!loading && !error && charities.length > 0 && (
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {charities.map((charity) => {
                  const currentlySelected =
                    myCharity?.charity?._id === charity._id;

                  return (
                    <article
                      key={charity._id}
                      className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40"
                    >
                      {/* IMAGE */}

                      <div className="relative h-52 overflow-hidden bg-[#09111B]">
                        {charity.image || charity.images?.[0] ? (
                          <img
                            src={getImageUrl(
                              charity.images?.[0] || charity.image,
                            )}
                            alt={charity.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#24175e_0%,#111827_70%)]">
                            <Heart size={58} className="text-purple-400/50" />
                          </div>
                        )}

                        {/* FEATURED */}

                        {charity.featured && (
                          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-gray-950/85 px-3 py-1.5 text-xs font-medium text-yellow-400">
                            <Star size={13} fill="currentColor" />
                            Featured
                          </span>
                        )}

                        {/* SELECTED */}

                        {currentlySelected && (
                          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-400 backdrop-blur">
                            <CheckCircle2 size={14} />
                            Your Charity
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-3">
                          {charity.category && (
                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                              {charity.category}
                            </span>
                          )}

                          {charity.location && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={13} />

                              {charity.location}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-xl font-medium text-white">
                          {charity.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 min-h-18 text-sm leading-6 text-gray-400">
                          {charity.description}
                        </p>

                        {/* CURRENT CONTRIBUTION */}

                        {currentlySelected && (
                          <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            <span className="font-bold">
                              {myCharity.contributionPercentage}%
                            </span>{" "}
                            membership contribution
                          </div>
                        )}

                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => setSelectedDetails(charity)}
                            className="flex-1 rounded-xl border border-gray-700 bg-[#09111B] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-purple-500/50 hover:text-white"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => openSelectionModal(charity)}
                            className="flex-1 rounded-xl bg-linear-to-r from-purple-500 to-blue-800 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                          >
                            {currentlySelected ? "Update" : "Select"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            IMPACT STRIP
        ================================================= */}

        <section className="container mx-auto px-4">
          <div className="mt-6 rounded-2xl border border-purple-500/20 bg-[#1F1555] px-5 py-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="mx-auto max-w-3xl text-center">
              <Heart size={42} className="mx-auto text-purple-300" />

              <h2 className="mt-5 text-xl font-medium text-white lg:text-3xl">
                Your membership can mean more
              </h2>

              <p className="mt-4 leading-7 text-blue-300">
                At least 10% of your subscription supports the charity you
                choose. You can increase your contribution whenever you want.
              </p>
            </div>
          </div>
        </section>

        <div className="h-16" />

        {/* =================================================
            DETAILS MODAL
        ================================================= */}

        {selectedDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-800 bg-[#09111B] shadow-[0_0_70px_rgba(0,0,0,0.8)]">
              {/* MODAL HEADER */}

              <div className="flex items-start justify-between border-b border-gray-800 p-6">
                <div>
                  <h2 className="text-2xl font-medium text-white">
                    {selectedDetails.name}
                  </h2>

                  {selectedDetails.category && (
                    <p className="mt-1 text-sm text-purple-400">
                      {selectedDetails.category}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDetails(null)}
                  className="rounded-xl bg-gray-900 p-2 text-gray-400 transition hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* IMAGE */}

              {(selectedDetails.image || selectedDetails.images?.[0]) && (
                <img
                  src={getImageUrl(
                    selectedDetails.images?.[0] || selectedDetails.image,
                  )}
                  alt={selectedDetails.name}
                  className="h-64 w-full object-cover"
                />
              )}

              {/* CONTENT */}

              <div className="p-6">
                <p className="leading-7 text-gray-400">
                  {selectedDetails.description}
                </p>

                {selectedDetails.location && (
                  <div className="mt-6 flex items-center gap-2 text-gray-400">
                    <MapPin size={18} className="text-purple-400" />

                    {selectedDetails.location}
                  </div>
                )}

                {/* EVENTS */}

                {selectedDetails.events?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-white">
                      <CalendarDays size={19} className="text-blue-400" />
                      Events
                    </h3>

                    <div className="space-y-3">
                      {selectedDetails.events.map((event, index) => (
                        <div
                          key={event._id || index}
                          className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                        >
                          <h4 className="font-medium text-white">
                            {event.title}
                          </h4>

                          {event.description && (
                            <p className="mt-2 text-sm text-gray-400">
                              {event.description}
                            </p>
                          )}

                          {event.date && (
                            <p className="mt-3 text-xs text-blue-400">
                              {new Date(event.date).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  {selectedDetails.website && (
                    <a
                      href={selectedDetails.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 font-medium text-gray-300 transition hover:border-purple-500/50 hover:text-white"
                    >
                      Visit Website
                      <ExternalLink size={17} />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      const charity = selectedDetails;

                      setSelectedDetails(null);

                      openSelectionModal(charity);
                    }}
                    className="rounded-xl bg-linear-to-r from-purple-500 to-blue-800 px-5 py-3 font-medium text-white transition hover:opacity-90"
                  >
                    Choose this charity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SELECTION MODAL
        ================================================= */}

        {selectionModal && charityToSelect && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#09111B] p-7 shadow-[0_0_70px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-400">
                    Charity Contribution
                  </p>

                  <h2 className="mt-2 text-2xl font-medium text-white">
                    {charityToSelect.name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectionModal(false)}
                  className="rounded-xl bg-gray-900 p-2 text-gray-400 transition hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                <p className="text-sm leading-6 text-gray-300">
                  Choose how much of your membership contribution should support
                  this charity. The minimum contribution is{" "}
                  <strong className="text-green-400">10%</strong>.
                </p>
              </div>

              <label className="mt-6 block text-sm font-medium text-gray-300">
                Contribution Percentage
              </label>

              <div className="relative mt-2">
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="1"
                  value={contributionPercentage}
                  onChange={(e) => setContributionPercentage(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-4 pr-12 text-lg font-bold text-white outline-none transition focus:border-purple-500"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  %
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Allowed range: 10% – 100%
              </p>

              <button
                onClick={handleSelectCharity}
                disabled={saving}
                className="mt-7 w-full rounded-xl bg-linear-to-r from-purple-500 to-blue-800 px-5 py-3.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm Charity"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Charities;
