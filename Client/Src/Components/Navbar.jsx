import Logo from "../../assests/image/Logo.png";
import Button from "./Button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { motion } from "motion/react";

const Navbar = () => {
  const [ismenuOpen, issetmenuOpen] = useState(false);

  // =====================================================
  // AUTH / ROLE CHECK
  // =====================================================

  // =====================================================
  // AUTH / ROLE CHECK
  // =====================================================

  const token = localStorage.getItem("token");

  let userRole = null;
  let isLoggedIn = false;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const currentTime = Math.floor(Date.now() / 1000);

      // Token valid only when expiry exists and hasn't passed
      if (payload.exp && payload.exp > currentTime) {
        isLoggedIn = true;
        userRole = payload.role;
      } else {
        // Expired token
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid token:", error);

      // Invalid / corrupted token
      localStorage.removeItem("token");
    }
  }

  // User -> /dashboard
  // Admin -> /admin
  const dashboardPath = userRole === "admin" ? "/admin" : "/dashboard";

  return (
    <motion.header className="lg:sticky top-0 z-50 w-full backdrop-blur-md [90%] container m-auto px-4 bg-transparent relative rounded-full">
      <nav className="h-20 flex items-center justify-between p-0 lg:p-3 2xl:p-4">
        {/* Logo Section */}
        <HashLink to="/#Home" smooth>
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-12 h-12" />

            <h1 className="text-white font-bold text-2xl md:text-[18px] lg:text-[18px] tracking-tight">
              Golfimpact
            </h1>
          </div>
        </HashLink>

        {/* =====================================================
            MOBILE
        ===================================================== */}

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to={isLoggedIn ? dashboardPath : "/login"}
            className="font-medium text-white hover:text-gray-300 transition text-[18px] bg-[#482ece] w-28 text-center p-1.5 rounded-lg"
          >
            {isLoggedIn ? "Dashboard" : "Login"}
          </Link>

          <Menu
            className="text-white"
            size={35}
            onClick={() => issetmenuOpen(!ismenuOpen)}
          />
        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {ismenuOpen && (
          <>
            <ul
              className={`lg:hidden gap-4 text-sm font-medium text-gray-300 bg-gray-900 absolute top-18 w-[91%] p-3 rounded-lg flex flex-col menu ${
                ismenuOpen ? "animate-menuOpen" : "animate-menuClose"
              }`}
            >
              <li className="flex flex-col group cursor-pointer w-full">
                <HashLink
                  smooth
                  to="/#golfinstruction"
                  className="group-hover:text-white transition text-[15px] text-gray-200"
                >
                  How it Works
                </HashLink>

                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>

              <li className="flex flex-col group cursor-pointer w-full">
                <HashLink
                  smooth
                  to="/#pricing"
                  className="group-hover:text-white transition text-[15px] text-gray-200"
                >
                  Pricing
                </HashLink>

                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>

              <li className="flex flex-col group cursor-pointer w-full">
                <HashLink
                  smooth
                  to="/#charities"
                  className="group-hover:text-white transition text-[15px] text-gray-200"
                >
                  Charities
                </HashLink>

                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>

              <li className="flex flex-col group cursor-pointer w-full">
                <HashLink
                  smooth
                  to="/#faq"
                  className="group-hover:text-white transition text-[15px] text-gray-200"
                >
                  FAQs
                </HashLink>

                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>

              <li className="flex flex-col group cursor-pointer w-full">
                <HashLink
                  smooth
                  to="/about-us"
                  className="group-hover:text-white transition text-[15px] text-gray-200"
                >
                  About-Us
                </HashLink>

                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            </ul>
          </>
        )}

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <ul className="hidden md:hidden lg:flex items-center gap-10 text-sm font-medium text-gray-300 relative">
          <li className="flex flex-col group cursor-pointer w-fit">
            <HashLink
              smooth
              to="/#golfinstructionD"
              className="group-hover:text-white transition text-[15px] text-gray-400"
            >
              How it Works
            </HashLink>

            <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className="flex flex-col group cursor-pointer w-fit">
            <HashLink
              smooth
              to="/#pricing"
              className="group-hover:text-white transition text-[15px] text-gray-400"
            >
              Pricing
            </HashLink>

            <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className="flex flex-col group cursor-pointer w-fit">
            <HashLink
              smooth
              to="/#charities"
              className="group-hover:text-white transition text-[15px] text-gray-400"
            >
              Charities
            </HashLink>

            <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className="flex flex-col group cursor-pointer w-fit">
            <HashLink
              smooth
              to="/#faq"
              className="group-hover:text-white transition text-[15px] text-gray-400"
            >
              FAQs
            </HashLink>

            <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className="flex flex-col group cursor-pointer w-fit">
            <HashLink
              smooth
              to="/about-us"
              className="group-hover:text-white transition text-[15px] text-gray-400"
            >
              About
            </HashLink>

            <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </li>
        </ul>

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        {/* Action Buttons */}
        <div className="lg:flex items-center gap-6 hidden">
          {isLoggedIn && userRole === "admin" ? (
            <Link
              to="/admin"
              className="group flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition-all duration-300 hover:border-purple-400/60 hover:bg-purple-500/20 hover:text-white"
            >
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
              Admin Dashboard
            </Link>
          ) : (
            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="text-sm font-medium text-white hover:text-gray-300 transition text-[15px]"
            >
              {isLoggedIn ? "Dashboard" : "Login"}
            </Link>
          )}

          {/* Admin ke liye subscription button hide */}
          {userRole !== "admin" && (
            <>
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button className="hover:scale-95">My Subscription</Button>
                </Link>
              ) : (
                <HashLink smooth to="/#pricing">
                  <Button className="hover:scale-95">Subscribe Now</Button>
                </HashLink>
              )}
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
