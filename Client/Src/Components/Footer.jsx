import { createPortal } from "react-dom";
import Logo from "../../assests/image/Logo.png";
import { Link } from "react-router-dom";

const footerRoot = document.getElementById("footer-root");

const Footer = () => {
  if (!footerRoot) return null;
  return createPortal(
    <footer className="bg-gray-900 w-full h-auto mt-30">
      <div className="max-w-350 m-auto px-4">
        <div className="grid lg:grid-cols-4 sm:grid-cols-3 md:grid-cols-2  grid-cols-1 w-full pt-15 lg:gap-24 gap-5 pb-15">
          <div className="flex gap-7 flex-col">
            <Link to="/">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Logo" className="w-12 h-12" />
                <h1 className="text-white font-bold text-2xl tracking-tight">
                  Golfimpact
                </h1>
              </div>
            </Link>
            <div>
              <p className="text-white text-sm font-medium">
                Play Golf Win Prizes, Changes Lives.
              </p>
            </div>
            <div className="flex items-center gap-4 w-full m-auto">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600/30 backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-blue-600 transition-all delay-80"
              >
                <i className="fa-brands fa-facebook-f text-lg text-white"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600/30 backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-blue-600 transition-all delay-80"
              >
                <i className="fa-brands fa-instagram text-lg text-white"></i>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600/30 backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-blue-600 transition-all delay-80"
              >
                <i className="fa-brands fa-x-twitter text-lg text-white"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600/30 backdrop-blur-md p-2 rounded-lg shadow-lg hover:shadow-blue-600 transition-all delay-80"
              >
                <i className="fa-brands fa-linkedin-in text-lg text-white"></i>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-white font-bold text-[18px]">Quick Links</h3>
            <ul className="flex flex-col text-white gap-3">
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="/how-it-works" className="text-[14px]">
                  How it Works
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="/charities" className="text-[14px]">
                  Charities
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="pricing" className="text-[14px]">
                  Pricing
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="faqs" className="text-[14px]">
                  FaQs
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-bold text-[18px]">Company</h3>
            <ul className="flex flex-col text-white gap-3">
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="/aboutUS" className="text-[14px]">
                  About Us
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="contact" className="text-[14px]">
                  Contact
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="terms" className="text-[14px]">
                  Terms & Conditions
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="privacy" className="text-[14px]">
                  Privacy Policy
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-bold text-[18px]">Support</h3>
            <ul className="flex flex-col text-white gap-3">
              <li className="flex flex-col group cursor-pointer w-fit">
                <Link to="/help-center" className="text-[14px]">
                  Help Center
                </Link>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <a href="mailto:support@golfimpact.com" className="text-[14px]">
                  Email US
                </a>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
              <li className="flex flex-col group cursor-pointer w-fit">
                <a href="tel:+1234567890" className="text-[14px]">
                  Call US
                </a>
                <span className="w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            </ul>
          </div>
        </div>
        <div className="p-2 flex justify-center items-center">
          <p className="text-gray-600 text-sm">
            Copyrights@ 2026 Reserved @GolfImpact{" "}
          </p>
        </div>
      </div>
    </footer>,
    footerRoot,
  );
};

export default Footer;
