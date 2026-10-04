import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Target,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import PageTitle from "../Components/PageTitle";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Button from "../Components/Button";

const SAMPLE_SCORES = [12, 19, 24, 31, 38];
const SAMPLE_DRAW = [7, 19, 24, 31, 42];

const DrawExperience = () => {
  const [drawStarted, setDrawStarted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const matches = SAMPLE_DRAW.filter((number) =>
    SAMPLE_SCORES.includes(number),
  );

  const startDemoDraw = () => {
    if (isRunning) return;

    setDrawStarted(true);
    setRevealedCount(0);
    setIsRunning(true);

    SAMPLE_DRAW.forEach((_, index) => {
      setTimeout(
        () => {
          setRevealedCount(index + 1);

          if (index === SAMPLE_DRAW.length - 1) {
            setIsRunning(false);
          }
        },
        (index + 1) * 650,
      );
    });
  };

  const resetDraw = () => {
    setDrawStarted(false);
    setRevealedCount(0);
    setIsRunning(false);
  };

  return (
    <>
      <PageTitle title="Draw Experience" />

      <Navbar />

      <main className="min-h-screen bg-[#09111B] text-white">
        {/* =========================
            HERO
        ========================= */}

        <section className="relative overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#24175e_0%,#09111B_55%)]" />

          <div className="relative container mx-auto px-4 py-24 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
                <Sparkles size={16} />
                Interactive Demo
              </span>

              <h1 className="mt-7 text-4xl font-medium leading-tight md:text-6xl lg:text-7xl">
                Experience The{" "}
                <span className="text-[#6C50F5]">GolfImpact Draw</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-300 md:text-lg">
                See how Stableford scores can match against a monthly draw. Try
                this interactive demonstration before joining GolfImpact.
              </p>

              <div className="mt-8">
                <a href="#demo-draw">
                  <Button>Try Demo Draw</Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            DEMO DRAW
        ========================= */}

        <section id="demo-draw" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-3xl border border-gray-800 bg-[#0D1520] p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)] md:p-10">
              <div className="text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                  Demo Experience
                </span>

                <h2 className="mt-2 text-2xl font-medium md:text-4xl">
                  Can Your Scores Match The Draw?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
                  We've prepared five sample Stableford scores. Start the demo
                  and watch the draw numbers reveal one by one.
                </p>
              </div>

              {/* Sample Scores */}

              <div className="mt-12">
                <p className="mb-5 text-center text-sm font-medium uppercase tracking-wider text-gray-400">
                  Your Sample Stableford Scores
                </p>

                <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                  {SAMPLE_SCORES.map((score) => (
                    <div
                      key={score}
                      className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-lg font-bold text-purple-300 md:h-17 md:w-17 md:text-xl"
                    >
                      {score}
                    </div>
                  ))}
                </div>
              </div>

              {/* VS */}

              <div className="my-9 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-800" />

                <span className="rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-400">
                  VS
                </span>

                <div className="h-px flex-1 bg-gray-800" />
              </div>

              {/* Draw Numbers */}

              <div>
                <p className="mb-5 text-center text-sm font-medium uppercase tracking-wider text-gray-400">
                  Sample Draw Numbers
                </p>

                <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                  {SAMPLE_DRAW.map((number, index) => {
                    const isRevealed = index < revealedCount;
                    const isMatch =
                      isRevealed && SAMPLE_SCORES.includes(number);

                    return (
                      <div
                        key={`${number}-${index}`}
                        className={`flex h-14 w-14 items-center justify-center rounded-full border text-lg font-bold transition-all duration-500 md:h-17 md:w-17 md:text-xl ${
                          !isRevealed
                            ? "border-gray-700 bg-gray-900 text-gray-600"
                            : isMatch
                              ? "scale-110 border-green-400 bg-green-500/15 text-green-400 shadow-[0_0_25px_rgba(74,222,128,0.35)]"
                              : "border-blue-500/40 bg-blue-500/10 text-blue-300"
                        }`}
                      >
                        {isRevealed ? number : "?"}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {!drawStarted ? (
                  <Button onClick={startDemoDraw} className="w-42.25">
                    <span className="flex items-center gap-2">
                      <Target size={18} />
                      Start Demo Draw
                    </span>
                  </Button>
                ) : (
                  <>
                    {isRunning && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm text-purple-300">
                        Drawing numbers...
                      </div>
                    )}

                    {!isRunning && revealedCount === SAMPLE_DRAW.length && (
                      <button
                        type="button"
                        onClick={resetDraw}
                        className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-purple-500/50 hover:text-white"
                      >
                        <RotateCcw size={17} />
                        Try Again
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Result */}

              {revealedCount === SAMPLE_DRAW.length && !isRunning && (
                <div className="mt-10 rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center md:p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <Trophy size={32} className="text-green-400" />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold">
                    {matches.length} Matches!
                  </h3>

                  <p className="mt-2 text-gray-400">
                    This sample result demonstrates a{" "}
                    <span className="font-medium text-green-400">
                      {matches.length}-number match
                    </span>
                    .
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {matches.map((number) => (
                      <span
                        key={number}
                        className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}

              <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <p className="text-xs leading-5 text-gray-400 md:text-sm">
                  This is a demonstration only. The scores, draw numbers and
                  result shown here are sample data and are not connected to a
                  real GolfImpact draw. No real prize is awarded from this demo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PRIZE STRUCTURE
        ========================= */}

        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                  Match More. Win More.
                </span>

                <h2 className="mt-2 text-2xl font-medium md:text-4xl">
                  Three Ways To Match
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-gray-400">
                  Monthly prize categories are based on matching 5, 4, or 3
                  numbers.
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {/* 5 Match */}

                <div className="rounded-2xl border border-yellow-500/20 bg-[#0D1520] p-7 text-center transition hover:-translate-y-1 hover:border-yellow-500/40">
                  <Trophy size={36} className="mx-auto text-yellow-400" />

                  <h3 className="mt-5 text-lg font-bold">5 Number Match</h3>

                  <p className="mt-3 text-4xl font-bold text-yellow-400">40%</p>

                  <p className="mt-2 text-sm text-gray-400">
                    of the prize pool
                  </p>

                  <span className="mt-5 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-xs text-yellow-400">
                    Jackpot rolls over
                  </span>
                </div>

                {/* 4 Match */}

                <div className="rounded-2xl border border-blue-500/20 bg-[#0D1520] p-7 text-center transition hover:-translate-y-1 hover:border-blue-500/40">
                  <Trophy size={36} className="mx-auto text-blue-400" />

                  <h3 className="mt-5 text-lg font-bold">4 Number Match</h3>

                  <p className="mt-3 text-4xl font-bold text-blue-400">35%</p>

                  <p className="mt-2 text-sm text-gray-400">
                    of the prize pool
                  </p>

                  <span className="mt-5 inline-block rounded-full bg-blue-500/10 px-4 py-2 text-xs text-blue-400">
                    Shared equally
                  </span>
                </div>

                {/* 3 Match */}

                <div className="rounded-2xl border border-green-500/20 bg-[#0D1520] p-7 text-center transition hover:-translate-y-1 hover:border-green-500/40">
                  <Target size={36} className="mx-auto text-green-400" />

                  <h3 className="mt-5 text-lg font-bold">3 Number Match</h3>

                  <p className="mt-3 text-4xl font-bold text-green-400">25%</p>

                  <p className="mt-2 text-sm text-gray-400">
                    of the prize pool
                  </p>

                  <span className="mt-5 inline-block rounded-full bg-green-500/10 px-4 py-2 text-xs text-green-400">
                    Shared equally
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FINAL CTA
        ========================= */}

        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-purple-500/20 bg-[#1F1555] px-5 py-12 text-center md:px-10 md:py-16">
              <Sparkles size={34} className="mx-auto text-purple-300" />

              <h2 className="mt-5 text-2xl font-medium md:text-4xl">
                Ready For The Real Experience?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-200">
                Join GolfImpact, maintain your latest Stableford scores,
                participate in monthly draws and support a charity you care
                about.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/sign-up">
                  <Button className="min-w-44">
                    <span className="flex items-center justify-center gap-2">
                      Join GolfImpact
                      <ArrowRight size={18} />
                    </span>
                  </Button>
                </Link>

                <Link to="/">
                  <Button variant="secondary" className="min-w-44 text-white">
                    Back To Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DrawExperience;
