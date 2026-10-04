import Button from "../Components/Button";
import {
  Pencil,
  Trophy,
  Heart,
  HandHelping,
  UserCheck,
  UserRound,
  CalendarCheck,
  Lock,
  Check,
  ChevronDown,
  Target,
  Medal,
  Crown,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import GiftsImage from "../../assests/image/Gift-Image.png";

import ArjunMehta from "../../assests/image/Arjun-Mehta.jpg";
import KaranPatel from "../../assests/image/Karan-Patel.jpg";
import NehaVerma from "../../assests/image/Neha-Verma.jpg";
import PriyaSharma from "../../assests/image/Priya-Sharma.jpg";
import RahulShah from "../../assests/image/Rahul-Shah.jpg";

import BannerVideo from "../../assests/video/golfImpact.mp4";
import PageTitle from "../Components/PageTitle";

/* =========================
   DATA
========================= */

const instructions = [
  {
    icon: CalendarCheck,
    title: "Subscribe",
    text: "Choose a monthly or yearly plan and subscribe securely.",
  },
  {
    icon: Pencil,
    title: "Enter Your Scores",
    text: "Add your latest 5 Stableford scores and keep your performance up to date.",
  },
  {
    icon: Trophy,
    title: "Join the Monthly Draw",
    text: "Your latest 5 Stableford scores are used to participate in the monthly draw.",
  },
  {
    icon: Heart,
    title: "Win & Give Back",
    text: "Compete for monthly rewards while supporting a charity you care about.",
  },
];

const testimonials = [
  {
    image: ArjunMehta,
    name: "Arjun Mehta",
    text: "I originally joined because the idea of combining golf with monthly rewards sounded interesting, but what truly kept me engaged was the impact this platform creates. Every time I enter my scores, I know a portion of my subscription is helping charities and communities.",
  },
  {
    image: KaranPatel,
    name: "Karan Patel",
    text: "The combination of performance tracking, prize draws, and charitable giving is incredibly well executed. I can compete, potentially win monthly prizes, and still contribute toward causes that genuinely matter.",
  },
  {
    image: RahulShah,
    name: "Rahul Shah",
    text: "What impressed me most was how easy and engaging the platform feels. From entering scores to tracking upcoming draws, everything feels simple and modern. The charity integration is what makes the experience unique.",
  },
  {
    image: NehaVerma,
    name: "Neha Verma",
    text: "The design is modern, the experience is interactive, and the charitable aspect gives every score a purpose. I especially appreciate how clearly the platform communicates community impact.",
  },
  {
    image: PriyaSharma,
    name: "Priya Sharma",
    text: "As someone who values both sports and social impact, this platform instantly connected with me. It feels like more than just a golf platform by bringing competition, community, and contribution together.",
  },
];

const faqs = [
  {
    question: "How does GolfImpact work?",
    answer:
      "Subscribe to a monthly or yearly plan, enter your latest Stableford scores, participate in monthly prize draws, and support a charity through your subscription.",
  },
  {
    question: "Do I need to be a professional golfer to join?",
    answer:
      "No. GolfImpact is designed for golfers of different skill levels. You only need valid Stableford scores to participate.",
  },
  {
    question: "How many golf scores can I store?",
    answer:
      "You can keep your latest 5 golf scores. When a sixth score is added, the oldest score is automatically removed.",
  },
  {
    question: "What score format is supported?",
    answer:
      "GolfImpact currently supports Stableford scores ranging from 1 to 45.",
  },
  {
    question: "How do the monthly prize draws work?",
    answer:
      "Your latest 5 Stableford scores are used for the monthly draw. Prize categories are based on matching 5, 4, or 3 numbers.",
  },
  {
    question: "What happens if nobody wins the jackpot?",
    answer:
      "If there is no 5-number match winner, the 5-match jackpot rolls over to the next monthly draw.",
  },
  {
    question: "How does my subscription support charity?",
    answer:
      "At least 10% of your subscription contribution supports your selected charity. You can choose to contribute more.",
  },
];

/* =========================
   HOME PAGE
========================= */

const HomePage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialTransition, setTestimonialTransition] = useState(true);

  const testimonialSlides = [...testimonials, testimonials[0]];

  const navigate = useNavigate();

  /* =========================
   FEATURED CHARITY
========================= */

  useEffect(() => {
    const fetchFeaturedCharity = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/charities/featured`,
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setFeaturedCharities(data.charities || []);
        } else {
          setFeaturedCharities([]);
        }
      } catch (error) {
        console.error("FEATURED CHARITY ERROR:", error);
        setFeaturedCharities([]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedCharity();
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Hero video autoplay blocked:", error);
      }
    };

    playVideo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialTransition(true);
      setTestimonialIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleTestimonialTransitionEnd = () => {
    if (testimonialIndex === testimonials.length) {
      setTestimonialTransition(false);
      setTestimonialIndex(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTestimonialTransition(true);
        });
      });
    }
  };

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  /* =========================
     PAYMENT
  ========================= */

  const handlePayment = async (plan) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: {
            from: "/",
            plan,
          },
        });
        return;
      }

      if (!window.Razorpay) {
        alert("Payment service is currently unavailable.");
        return;
      }

      setPaymentLoading(plan);

      // 1. CREATE ORDER
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to create payment order.");
        return;
      }

      // Important
      if (!data.subscriptionId) {
        console.error("Subscription ID missing:", data);

        alert("Subscription ID was not received from server.");
        return;
      }

      // 2. RAZORPAY OPTIONS
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,

        name: "GolfImpact",
        description: `${plan} Subscription`,

        // 3. PAYMENT SUCCESS
        handler: async function (paymentResponse) {
          try {
            console.log("RAZORPAY PAYMENT RESPONSE:", paymentResponse);

            console.log("SUBSCRIPTION ID:", data.subscriptionId);

            // 4. VERIFY PAYMENT
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
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

            console.log("VERIFY PAYMENT RESPONSE:", verifyData);

            if (!verifyResponse.ok || !verifyData.success) {
              alert(verifyData.message || "Payment verification failed.");

              return;
            }

            // 5. PAYMENT VERIFIED
            alert("Subscription activated successfully!");

            navigate("/dashboard");
          } catch (error) {
            console.error("PAYMENT VERIFICATION ERROR:", error);

            alert("Payment verification failed.");
          }
        },

        theme: {
          color: "#482ECE",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed by user.");

            setPaymentLoading(null);
          },
        },
      };

      // 6. OPEN RAZORPAY
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      alert("Something went wrong. Please try again.");
    } finally {
      setPaymentLoading(null);
    }
  };

  return (
    <>
      <PageTitle title="Home" />

      <Navbar />

      <main>
        {/* =========================
            HERO
        ========================= */}

        <section className="relative text-white bg-[#09111B]" id="Home">
          <div className="relative flex min-h-162.5 md:min-h-screen items-center justify-center w-full overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={BannerVideo} type="video/mp4" />
              </video>

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
              <h1 className="text-[44px] md:text-6xl lg:text-8xl font-medium leading-[1.05]">
                Turn Your Game
                <br />
                Into <span className="text-[#6C50F5]">Real Impact</span>
              </h1>

              <p className="text-[15px] lg:text-lg text-gray-300 leading-6 lg:leading-7 max-w-2xl">
                The premium subscription for golfers who want their game to mean
                more. Track your scores, support meaningful charities, and
                participate in exclusive monthly prize draws.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4">
                <Link to="/sign-up">
                  <Button variant="primary">Get Started</Button>
                </Link>

                <Link to="/about-us">
                  <Button variant="secondary">About Us</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            HOW IT WORKS - MOBILE
        ========================= */}

        <section id="golfinstruction">
          <div className="container mx-auto px-4">
            <div className="bg-[#09111B] w-full rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 mt-6 md:hidden">
              <h2 className="text-xl font-medium text-center text-white">
                How It Works
              </h2>

              <div className="flex overflow-x-auto snap-x snap-mandatory mt-10 gap-4 rounded-2xl">
                {instructions.map((instruction) => {
                  const Icon = instruction.icon;

                  return (
                    <div
                      key={instruction.title}
                      className="min-w-full snap-center bg-gray-900 p-6 rounded-2xl text-white flex flex-col gap-3 justify-center items-center"
                    >
                      <div className="mb-3 rounded-2xl bg-purple-500/10 p-4">
                        <Icon className="w-8 h-8 text-purple-400" />
                      </div>

                      <h3 className="text-xl font-bold">{instruction.title}</h3>

                      <p className="text-center text-sm text-gray-400 leading-6">
                        {instruction.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            HOW IT WORKS - DESKTOP
        ========================= */}

        <section id="golfinstructionD">
          <div className="container mx-auto px-4">
            <div className="text-white bg-[#09111B] w-full rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-8 hidden md:block mt-6">
              <h2 className="text-3xl font-medium text-center">How It Works</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 w-full mt-16 gap-6">
                {instructions.map((instruction, index) => {
                  const Icon = instruction.icon;

                  const colors = [
                    "bg-red-600/30 text-red-400",
                    "bg-blue-600/30 text-blue-400",
                    "bg-purple-600/30 text-purple-400",
                    "bg-green-600/30 text-green-400",
                  ];

                  return (
                    <div
                      key={instruction.title}
                      className="flex flex-col items-center text-center relative px-4"
                    >
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${colors[index]}`}
                      >
                        <Icon size={30} />
                      </div>

                      <h3 className="mt-6 text-xl font-medium">
                        {index + 1}. {instruction.title}
                      </h3>

                      <p className="text-gray-400 mt-3 leading-6 text-sm max-w-55">
                        {instruction.text}
                      </p>

                      {index !== instructions.length - 1 && (
                        <div className="absolute right-0 top-0 w-px h-full bg-gray-800 hidden lg:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            DRAW MECHANICS
        ========================= */}

        <section id="monthly-draw">
          <div className="container mx-auto px-4">
            <div className="bg-[#09111B] border border-gray-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-6 py-10 px-4 lg:px-8">
              <div className="text-center">
                <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">
                  Monthly Draw
                </span>

                <h2 className="text-xl lg:text-3xl font-medium text-white mt-2">
                  Match More. Win More.
                </h2>

                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                  Your latest five Stableford scores are used in the monthly
                  draw. Match 3, 4, or all 5 numbers to qualify for a prize.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
                {/* 5 Match */}

                <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-7 text-center">
                  <Crown size={42} className="text-yellow-400 mx-auto" />

                  <h3 className="text-white text-xl font-bold mt-5">
                    5 Number Match
                  </h3>

                  <p className="text-4xl text-purple-400 font-bold mt-4">40%</p>

                  <p className="text-gray-400 text-sm mt-2">
                    of the prize pool
                  </p>

                  <span className="inline-block bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-xs mt-5">
                    Jackpot rolls over
                  </span>
                </div>

                {/* 4 Match */}

                <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-7 text-center">
                  <Medal size={42} className="text-blue-400 mx-auto" />

                  <h3 className="text-white text-xl font-bold mt-5">
                    4 Number Match
                  </h3>

                  <p className="text-4xl text-blue-400 font-bold mt-4">35%</p>

                  <p className="text-gray-400 text-sm mt-2">
                    of the prize pool
                  </p>

                  <span className="inline-block bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs mt-5">
                    Shared equally by winners
                  </span>
                </div>

                {/* 3 Match */}

                <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-7 text-center">
                  <Target size={42} className="text-green-400 mx-auto" />

                  <h3 className="text-white text-xl font-bold mt-5">
                    3 Number Match
                  </h3>

                  <p className="text-4xl text-green-400 font-bold mt-4">25%</p>

                  <p className="text-gray-400 text-sm mt-2">
                    of the prize pool
                  </p>

                  <span className="inline-block bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-xs mt-5">
                    Shared equally by winners
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            ACHIEVEMENTS
        ========================= */}

        <section id="achievements">
          <div className="container mx-auto px-4">
            <div className="py-10 lg:px-8 px-4 bg-[#09111B] w-full rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-6">
              <h2 className="lg:text-3xl text-xl font-medium text-center text-white">
                Milestones & Achievements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mt-10 lg:mt-16 gap-4 lg:gap-6">
                <div className="flex items-center text-white gap-4 p-4 relative">
                  <HandHelping
                    size={60}
                    className="text-purple-500 bg-purple-600/20 rounded-lg p-2.5 shrink-0"
                  />

                  <div>
                    <p className="lg:text-2xl font-bold text-lg">₹1,25,000+</p>

                    <p className="text-gray-400 text-xs">
                      Donated to Charities
                    </p>
                  </div>

                  <div className="w-px h-12 bg-gray-800 absolute right-0 hidden lg:block" />
                </div>

                <div className="flex items-center text-white gap-4 p-4 relative">
                  <UserCheck
                    size={60}
                    className="text-green-500 bg-green-600/20 rounded-lg p-2.5 shrink-0"
                  />

                  <div>
                    <p className="lg:text-2xl font-bold text-lg">500K+</p>

                    <p className="text-gray-400 text-xs">Active Players</p>
                  </div>

                  <div className="w-px h-12 bg-gray-800 absolute right-0 hidden lg:block" />
                </div>

                <div className="flex items-center text-white gap-4 p-4 relative">
                  <Trophy
                    size={60}
                    className="text-blue-500 bg-blue-600/20 rounded-lg p-2.5 shrink-0"
                  />

                  <div>
                    <p className="lg:text-2xl font-bold text-lg">₹50,000+</p>

                    <p className="text-gray-400 text-xs">Monthly Rewards</p>
                  </div>

                  <div className="w-px h-12 bg-gray-800 absolute right-0 hidden lg:block" />
                </div>

                <div className="flex items-center text-white gap-4 p-4">
                  <UserRound
                    size={60}
                    className="text-pink-500 bg-pink-600/20 rounded-lg p-2.5 shrink-0"
                  />

                  <div>
                    <p className="lg:text-2xl font-bold text-lg">12+</p>

                    <p className="text-gray-400 text-xs">Monthly Draws Held</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-gray-600 mt-5">
                * Demonstration statistics for the GolfImpact platform.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            CHARITIES
        ========================= */}

        <section id="charities">
          <div className="container mx-auto px-4">
            <div className="w-full bg-[#09111B] rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 lg:px-8 mt-6">
              <div className="text-center">
                <h2 className="lg:text-3xl text-xl font-medium text-white">
                  Featured Charities
                </h2>

                <p className="text-gray-400 max-w-2xl mx-auto mt-4">
                  Choose a cause you care about. At least{" "}
                  <span className="text-green-400 font-medium">
                    10% of your subscription
                  </span>{" "}
                  supports your selected charity, and you can choose to
                  contribute more.
                </p>
              </div>

              <div className="mt-12">
                {featuredLoading ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-400">
                      Loading featured charities...
                    </p>
                  </div>
                ) : featuredCharities.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {featuredCharities.map((charity) => (
                      <div
                        key={charity._id}
                        className="flex flex-col sm:flex-row sm:items-center gap-5 bg-gray-900 p-4 border border-gray-800 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:border-purple-500/40 group"
                      >
                        <figure className="w-full sm:w-48 aspect-4/3 shrink-0 overflow-hidden rounded-2xl">
                          <img
                            src={
                              charity.image
                                ? charity.image.startsWith("http")
                                  ? charity.image
                                  : `${import.meta.env.VITE_API_URL}${charity.image}`
                                : charity.images?.[0]
                                  ? charity.images[0].startsWith("http")
                                    ? charity.images[0]
                                    : `${import.meta.env.VITE_API_URL}${charity.images[0]}`
                                  : ""
                            }
                            alt={charity.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </figure>

                        <div className="flex justify-between items-center w-full gap-3">
                          <div className="text-white flex flex-col gap-2 flex-1 min-w-0">
                            <span className="text-purple-400 text-xs font-medium uppercase tracking-wider">
                              Featured Charity
                            </span>

                            <h3 className="font-bold text-lg">
                              {charity.name}
                            </h3>

                            <p className="text-sm text-gray-300 line-clamp-2">
                              {charity.description}
                            </p>

                            {charity.category && (
                              <span className="text-sm text-green-500">
                                {charity.category}
                              </span>
                            )}

                            {charity.location && (
                              <span className="text-xs text-gray-400">
                                {charity.location}
                              </span>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/charities/${charity._id}`}
                              className="mt-2 w-fit"
                            >
                              <Button>View Charity</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                    <p className="text-gray-400">
                      No featured charities are currently available.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-8 w-full items-center">
                <Link to="/charities">
                  <Button variant="secondary" className="text-white w-42">
                    Explore All Charities
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            WHY CHOOSE US
        ========================= */}

        <section id="why-choose-us">
          <div className="container mx-auto px-4">
            <div className="w-full bg-[#09111B] rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 lg:px-8 mt-6">
              <div className="text-center">
                <h2 className="font-medium lg:text-3xl text-xl text-white">
                  Why Choose GolfImpact?
                </h2>

                <p className="text-blue-400 mt-4">
                  Golf performance, meaningful rewards, and real social impact —
                  together in one platform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12">
                <div className="bg-gray-900 border border-gray-800 hover:border-purple-500/40 transition-colors rounded-2xl p-8 text-center">
                  <div className="mx-auto mb-5 w-fit rounded-2xl bg-purple-500/10 p-4">
                    <Lock size={30} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Secure & Transparent
                  </h3>

                  <p className="mt-3 text-gray-400 text-sm">
                    Secure subscriptions, transparent draw mechanics, and
                    verified winners.
                  </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 hover:border-blue-500/40 transition-colors rounded-2xl p-8 text-center">
                  <div className="mx-auto mb-5 w-fit rounded-2xl bg-blue-500/10 p-4">
                    <Trophy size={30} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Rewarding Experience
                  </h3>

                  <p className="mt-3 text-gray-400 text-sm">
                    Keep playing golf and participate in monthly prize draws.
                  </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 hover:border-green-500/40 transition-colors rounded-2xl p-8 text-center">
                  <div className="mx-auto mb-5 w-fit rounded-2xl bg-green-500/10 p-4">
                    <Heart size={30} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Real Social Impact
                  </h3>

                  <p className="mt-3 text-gray-400 text-sm">
                    At least 10% of your subscription supports your chosen
                    charity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            TESTIMONIALS
        ========================= */}

        <section className="mt-6" id="testimonials">
          <div className="container mx-auto px-4">
            <div className="overflow-hidden w-full bg-[#09111B] rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 lg:px-8">
              <h2 className="font-medium lg:text-3xl text-white text-xl text-center">
                Testimonials
              </h2>

              {/* Mobile / Tablet Infinite Slider */}

              <div className="mt-12 w-full overflow-hidden xl:hidden">
                <div
                  onTransitionEnd={handleTestimonialTransitionEnd}
                  className={`flex ${
                    testimonialTransition
                      ? "transition-transform duration-500 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${testimonialIndex * 100}%)`,
                  }}
                >
                  {testimonialSlides.map((testimonial, index) => (
                    <div
                      key={`${testimonial.name}-${index}`}
                      className="w-full shrink-0"
                    >
                      <div className="flex bg-gray-900 flex-col p-6 rounded-2xl gap-6 justify-center items-center min-h-75">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          loading="lazy"
                          className="w-24 h-24 rounded-full object-cover"
                        />

                        <div>
                          <p className="text-gray-300 text-center leading-7">
                            “{testimonial.text}”
                          </p>

                          <span className="block text-purple-400 text-center mt-5">
                            — {testimonial.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dots */}
                <div className="flex justify-center items-center gap-2 mt-5">
                  {testimonials.map((testimonial, index) => {
                    const activeIndex =
                      testimonialIndex === testimonials.length
                        ? 0
                        : testimonialIndex;

                    return (
                      <button
                        key={testimonial.name}
                        type="button"
                        aria-label={`Show testimonial ${index + 1}`}
                        onClick={() => {
                          setTestimonialTransition(true);
                          setTestimonialIndex(index);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeIndex === index
                            ? "w-7 bg-purple-500"
                            : "w-2 bg-gray-600 hover:bg-gray-500"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Desktop */}

              <div className="mt-12 w-full overflow-hidden group hidden xl:block">
                <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
                  {[...testimonials, ...testimonials].map(
                    (testimonial, index) => (
                      <div
                        key={`${testimonial.name}-${index}`}
                        className="w-150 shrink-0"
                      >
                        <div className="flex bg-gray-900 flex-col p-7 rounded-2xl gap-6 justify-center items-center min-h-82.5">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            loading="lazy"
                            className="w-24 h-24 rounded-full object-cover"
                          />

                          <p className="text-gray-300 text-center leading-7">
                            “{testimonial.text}”
                          </p>

                          <span className="text-purple-400">
                            — {testimonial.name}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PRICING
        ========================= */}

        <section className="mt-6" id="pricing">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center flex-col w-full bg-[#09111B] rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 lg:px-8">
              <div className="text-center">
                <h2 className="font-medium lg:text-3xl text-white text-xl">
                  Choose Your Plan
                </h2>

                <p className="text-blue-400 mt-4">
                  Subscribe and start making an impact today.
                </p>
              </div>

              <div className="grid md:grid-cols-2 mt-14 gap-5 w-full max-w-5xl">
                {/* Monthly */}

                <div className="bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-colors w-full h-full p-8 lg:p-10 rounded-2xl flex flex-col gap-8">
                  <div className="text-white">
                    <h3 className="font-medium text-xl">Monthly Plan</h3>

                    <p className="text-3xl mt-3 font-bold">
                      ₹1,000
                      <span className="text-sm font-light text-gray-400">
                        {" "}
                        / month
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-700 w-full h-px" />

                  <div className="flex flex-col gap-4 flex-1">
                    {[
                      "Maintain your latest 5 golf scores",
                      "Monthly draw participation",
                      "Choose your charity",
                      "Minimum 10% charity contribution",
                      "Track winnings and payment status",
                      "Cancel anytime",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="text-cyan-500 shrink-0" />

                        <span className="text-white">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    disabled={paymentLoading === "monthly"}
                    onClick={() => handlePayment("monthly")}
                    className="w-full bg-linear-to-r from-purple-500 to-blue-800 font-medium"
                  >
                    {paymentLoading === "monthly"
                      ? "Please wait..."
                      : "Get Monthly Plan"}
                  </Button>
                </div>

                {/* Yearly */}

                <div className="relative bg-gray-900 border border-purple-500/40 hover:border-purple-500 transition-colors w-full h-full p-8 lg:p-10 rounded-2xl flex flex-col gap-8">
                  <div className="absolute top-0 right-0 bg-linear-to-r from-purple-600 to-blue-600 text-sm text-white px-4 py-2 rounded-bl-xl rounded-tr-2xl font-bold">
                    Most Popular
                  </div>

                  <div className="text-white">
                    <h3 className="font-medium text-xl">Yearly Plan</h3>

                    <p className="text-3xl mt-3 font-bold">
                      ₹9,600
                      <span className="text-sm font-light text-gray-400">
                        {" "}
                        / year
                      </span>
                    </p>

                    <span className="text-sm text-green-500">
                      Equivalent to ₹800/month
                    </span>
                  </div>

                  <div className="bg-gray-700 w-full h-px" />

                  <div className="flex flex-col gap-4 flex-1">
                    {[
                      "Maintain your latest 5 golf scores",
                      "Monthly draw participation",
                      "Choose your charity",
                      "Minimum 10% charity contribution",
                      "Track winnings and payment status",
                      "Save ₹2,400 annually",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="text-cyan-500 shrink-0" />

                        <span className="text-white">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    disabled={paymentLoading === "yearly"}
                    onClick={() => handlePayment("yearly")}
                    className="w-full bg-linear-to-r from-purple-500 to-blue-800 font-medium"
                  >
                    {paymentLoading === "yearly"
                      ? "Please wait..."
                      : "Get Yearly Plan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}

        <section>
          <div className="container mx-auto px-4">
            <div className="flex justify-around items-center flex-col gap-5 w-full bg-[#1F1555] rounded-2xl border border-purple-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-5 lg:px-8 mt-6">
              <img
                src={GiftsImage}
                alt="GolfImpact rewards"
                loading="lazy"
                className="w-24 h-24 object-contain"
              />

              <div className="flex flex-col gap-3 justify-center items-center max-w-3xl">
                <h2 className="text-white text-xl lg:text-2xl text-center font-medium">
                  Think Your Scores Could Match?
                </h2>

                <p className="text-blue-300 text-sm lg:text-lg text-center leading-7">
                  Experience a sample GolfImpact draw and discover how your
                  Stableford scores could match against the monthly draw
                  numbers.
                </p>
              </div>

              <Link to="/draw-experience">
                <Button className="bg-white text-blue-600! font-bold w-52 h-13">
                  Experience The Draw
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================
            FAQ
        ========================= */}

        <section id="faq">
          <div className="container mx-auto px-4">
            <div className="w-full mt-16 pb-16">
              <div className="flex justify-center p-7">
                <h2 className="font-medium lg:text-3xl text-white text-xl">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="w-full max-w-5xl mx-auto space-y-4 mt-10">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.question}
                    className="bg-gray-900 rounded-lg border border-gray-800"
                  >
                    <button
                      type="button"
                      aria-expanded={activeIndex === index}
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between gap-5 p-6 text-left"
                    >
                      <h3 className="text-white text-[15px]">{faq.question}</h3>

                      <ChevronDown
                        className={`shrink-0 transition-transform duration-300 text-green-500 ${
                          activeIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeIndex === index
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-6 text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
