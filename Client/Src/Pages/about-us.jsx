import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import AboutBannerimg from "../../assests/image/about-us banner.png";
import { Link } from "react-router-dom";
import AboutsectionIMG from "../../assests/image/Golf_player about.webp";
import { Target, Eye, Users, ShieldCheck, VectorSquare } from "lucide-react";
import Button from "../Components/Button";
import LoveHearts from "../../assests/image/Love Hearts.png";
import CharityChild from "../../assests/image/Charity Child.jpg";
import LoveYtree from "../../assests/image/Love-Tree.jpg";
import PageTitle from "../Components/PageTitle";

<PageTitle title="about-us" />;

const AboutUs = () => {
  return (
    <>
      <PageTitle title="About-us" />
      <Navbar />
      <section>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center md:gap-10 gap-10 md:flex-row flex-col">
            <div className="flex flex-col gap-4 w-full">
              <div>
                <h1 className="text-blue-600 uppercase font-bold">About us</h1>
              </div>
              <div>
                <h2 className="text-white md:text-8xl text-6xl font-bold">
                  About Us
                </h2>
              </div>
              <div>
                <p className="text-white text-justify text-[14px]">
                  We're on a mission to combine the love of golf with the power
                  of giving. Our platform helps players track their performance,
                  win exciting rewards, and support causes that create a real
                  impact.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="group relative overflow-hidden rounded-full p-0.5 flex w-fit">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow bg-[conic-gradient(from_0deg,#a855f7,#3b82f6,#ec4899,#a855f7)] rounded-full"></div>

                  <div className="relative bg-black rounded-full md:px-6 py-2 border-2 border-gray-800 w-38.75 md:w-fit flex justify-center items-center">
                    <Link
                      to="/sign-up"
                      className="text-white md:text-lg font-semibold text-[14px]"
                    >
                      <button>Join Our Community</button>
                    </Link>
                  </div>
                </div>
                <div className="border-2 border-gray-800 bg-black rounded-full md:px-6 py-2 w-38.75 md:w-fit flex justify-center items-center">
                  <Link
                    to="/charities"
                    className="text-white md:text-lg font-semibold text-[14px]"
                  >
                    <button>Explore Charities</button>
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <img
                src={AboutBannerimg}
                alt="About Banner"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <div className="container mx-auto px-4">
          <div className="text-white grid md:grid-cols-2 grid-cols-1 items-center gap-10 md:gap-10">
            <div>
              <img
                src={AboutsectionIMG}
                alt="Team pic"
                className="rounded-3xl shadow-lg/50 shadow-blue-800 w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-blue-600 font-bold">OUR STORY</h2>
              <h2 className="text-5xl font-bold text-green-800">
                More Than Just a Game
              </h2>
              <p className="text-[14px]">
                We created this platform with a simple belief: golf can be more
                than a game. By combining performance tracking, rewarding
                experience, and charitable giving. we've built a community where
                every score contributes to something greater.
              </p>
              <p className="text-[14px]">
                Whether you're here to improve your game, win exciting prizes,
                or support causes close to your heart. you're part of a movement
                that makes every swing count.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <div className="container mx-auto px-4">
          <div className="bg-[#09111B] w-full rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-4 md:px-8 mt-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-6 hover:bg-gray-800">
                <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
                  <Target size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="uppercase text-blue-600 font-bold">
                    our mission
                  </h2>
                  <p className="text-white text-[14px]">
                    To Create an engaging platform that helps players improve
                    their game, win rewards, and support Charities that make a
                    difference
                  </p>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-6">
                <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
                  <Eye size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="uppercase text-blue-600 font-bold">
                    our Vision
                  </h2>
                  <p className="text-white text-[14px]">
                    To become the world's leading community-driven golf platform
                    where competition creates positive social impact.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-10">
              <h2 className="lg:text-3xl text-xl font-medium text-center text-white">
                Our Core Value
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 w-full items-center">
              <div className="flex items-center justify-center gap-4">
                <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
                  <Users size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="uppercase text-white font-bold">Community</h2>
                  <p className="text-white w-full text-[14px]">
                    We believe in the power of community, Together, we achieve
                    more and create lasting impact.
                  </p>
                </div>
                <div className="lg:-right-1 md:-right-3 -right-21 w-px h-40 bg-gray-800 lg:h-20 md:hidden lg:block"></div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
                  <ShieldCheck size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="uppercase text-white font-bold">
                    Transparency
                  </h2>
                  <p className="text-white w-full text-[14px]">
                    We're committed to clarity in everything we do, from rewards
                    to charity contributions.
                  </p>
                </div>
                <div className="lg:-right-1 md:-right-3 -right-21 w-px h-40 bg-gray-800 lg:h-20 md:hidden lg:block"></div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
                  <VectorSquare size={40} className="text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="uppercase text-white font-bold">Impact</h2>
                  <p className="text-white w-full text-[14px]">
                    Every subscription, every score, and every action
                    contributes to meaningful change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <div className="container mx-auto px-4">
          <div className="bg-[#09111B] w-full rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] py-10 px-8 2xl:visible 3xl:flex mt-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3.5">
                <div>
                  <h2 className="text-white font-bold uppercase tracking-wider">
                    making an impact
                  </h2>
                </div>
                <div>
                  <h2 className="text-white text-3xl font-bold">
                    Your Game. Their Tomorrow
                  </h2>
                </div>
                <div>
                  <p className="text-white w-87.5">
                    A portion of every membership goes directly to charitable
                    organizations chosen by Our members. Together, We're
                    building a better Tomorrow
                  </p>
                </div>
                <div>
                  <Link to="/charities">
                    <Button>View Charities</Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-3 grid-rows-2 gap-3 h-60">
                <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <img
                    src={LoveHearts}
                    alt="Love Heart"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <img
                    src={CharityChild}
                    alt="Charity Child"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <img
                    src={LoveYtree}
                    alt="Love Tree"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AboutUs;
