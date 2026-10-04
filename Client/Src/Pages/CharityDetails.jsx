import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import PageTitle from "../Components/PageTitle";

const API_URL = import.meta.env.VITE_API_URL;

const CharityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // =====================================================
  // FETCH CHARITY DETAILS
  // =====================================================

  useEffect(() => {
    const fetchCharityDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/charities/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load charity details.");
        }

        setCharity(data.charity);
      } catch (err) {
        console.error("CHARITY DETAILS ERROR:", err);

        setError(err.message || "Unable to load charity details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCharityDetails();
    }
  }, [id]);

  // =====================================================
  // WEBSITE URL
  // =====================================================

  const getWebsiteUrl = (website) => {
    if (!website) return "";

    const value = website.trim();

    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    return `https://${value}`;
  };

  // =====================================================
  // UPCOMING EVENTS
  // =====================================================

  const upcomingEvents = (charity?.events || [])
    .filter((event) => {
      if (!event.date) return false;

      const eventDate = new Date(event.date);

      return !Number.isNaN(eventDate.getTime()) && eventDate >= new Date();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#6C50F5]" />

          <p className="mt-4 text-sm text-gray-400">
            Loading charity details...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !charity) {
    return (
      <div className="min-h-screen bg-[#09111B] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="text-lg font-semibold text-red-300">
              Unable to load charity
            </h2>

            <p className="mt-2 text-sm text-red-200/70">
              {error || "Charity not found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <PageTitle title="Charity Details" />
      <div className="min-h-screen bg-[#09111B] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* BACK */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* HERO */}
          <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#0D1520]">
            {charity.image ? (
              <div className="relative h-56 overflow-hidden sm:h-72 lg:h-80">
                <img
                  src={getImageUrl(charity.image)}
                  alt={charity.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#0D1520] via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center bg-[#111B28] sm:h-72">
                <Heart size={64} className="text-[#6C50F5]/40" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* NAME + DONATE */}
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {charity.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                        <Star size={13} />
                        Featured Charity
                      </span>
                    )}

                    {charity.category && (
                      <span className="rounded-full border border-[#482ECE]/30 bg-[#482ECE]/10 px-3 py-1 text-xs font-semibold text-[#A99FFF]">
                        {charity.category}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {charity.name}
                  </h1>

                  {charity.location && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={17} />
                      {charity.location}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/charities/${charity._id}/donate`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C50F5] px-6 py-3 font-semibold text-white transition hover:bg-[#5A3FE0]"
                >
                  <Heart size={18} />
                  Donate Now
                </button>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold">About this Charity</h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-gray-400">
                  {charity.description}
                </p>
              </div>

              {/* CHARITY GALLERY */}
              {charity.images?.length > 0 && (
                <section className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">Gallery</h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Photos from {charity.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {charity.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-2xl border border-gray-800 bg-[#09111B]"
                      >
                        <div className="aspect-video w-full">
                          <img
                            src={getImageUrl(image)}
                            alt={`${charity.name} gallery ${index + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* WEBSITE */}
              {charity.website && (
                <div className="mt-6">
                  <a
                    href={getWebsiteUrl(charity.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#482ECE]/30 bg-[#482ECE]/10 px-4 py-2.5 text-sm font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/20"
                  >
                    Visit Website
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* EVENTS */}
          <div className="mt-6 rounded-3xl border border-gray-800 bg-[#0D1520] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#482ECE]/20 p-3 text-[#A99FFF]">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">Upcoming Events</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Events and activities organised by this charity.
                </p>
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={event._id || `${event.title}-${index}`}
                    className="rounded-2xl border border-gray-800 bg-[#09111B] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#482ECE]/15 text-[#A99FFF]">
                        <span className="text-[10px] font-semibold uppercase">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>

                        <span className="text-lg font-bold leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-xs text-[#A99FFF]">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>

                        {event.description && (
                          <p className="mt-3 text-sm leading-6 text-gray-400">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-800 bg-[#09111B] p-8 text-center">
                <CalendarDays size={32} className="mx-auto text-gray-600" />

                <p className="mt-3 text-sm text-gray-500">
                  No upcoming events available.
                </p>
              </div>
            )}
          </div>

          {/* SUPPORT CTA */}
          <div className="mt-6 rounded-3xl border border-[#482ECE]/20 bg-linear-to-r from-[#482ECE]/10 to-[#0D1520] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Support {charity.name}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  Make an independent donation directly through GolfImpact. Your
                  donation is separate from your subscription and draw
                  participation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/charities/${charity._id}/donate`)}
                className="shrink-0 rounded-xl bg-[#6C50F5] px-6 py-3 font-semibold text-white transition hover:bg-[#5A3FE0]"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharityDetails;
