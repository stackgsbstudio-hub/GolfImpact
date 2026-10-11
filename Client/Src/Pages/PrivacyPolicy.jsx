import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import Navbar from "../Components/Navbar.jsx";
import PageTitle from "../Components/PageTitle.jsx";

const PrivacyPolicy = () => {
  return (
    <>
      <PageTitle title="Privacy Policy | GolfImpact" />
      <Navbar />

      <main className="min-h-screen bg-[#09111B] px-4 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mb-10">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#482ECE]/20 text-[#9A8DFF]">
              <ShieldCheck size={28} />
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Learn about the personal information involved in using GolfImpact
              and how it should be handled.
            </p>
          </div>

          <div className="space-y-8 rounded-2xl border border-gray-800 bg-[#0D1520] p-6 sm:p-10">
            <section>
              <h2 className="text-xl font-semibold">
                1. Information We Collect
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Depending on how you use GolfImpact, the platform may process
                your name, email address, phone number, profile details, account
                credentials, golf scores, charity selections, subscription
                records, and winner-verification information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                2. How Information Is Used
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Information may be used to create and secure accounts,
                authenticate users, manage subscriptions, process golf score
                submissions, administer draws, verify winners, coordinate prize
                payouts, support charitable contributions, and respond to
                support requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                3. Authentication and Account Security
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact supports account authentication and may offer
                third-party sign-in options. Password reset requests may use
                time-limited verification codes sent to the registered email
                address.
              </p>
              <p className="mt-3 leading-7 text-gray-400">
                Users should protect their credentials and avoid sharing
                verification codes with anyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                4. Payments and Subscriptions
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Subscription payments may be handled by third-party payment
                processors. GolfImpact may receive and retain relevant
                transaction references, payment status, subscription plan
                details, and billing history.
              </p>
              <p className="mt-3 leading-7 text-gray-400">
                The final policy should identify the actual payment providers
                and describe which payment information they process.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                5. Charities and Winner Information
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Charity selections and contribution preferences may be used to
                administer charitable allocations. Potential winners may be
                asked to provide evidence needed for prize verification and
                payout processing. Any public display of winner information
                should follow the platform's published rules and applicable
                privacy requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Service Providers</h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact may use service providers for hosting, database
                storage, email delivery, authentication, media storage, payment
                processing, and other operational services. The final policy
                should identify relevant provider categories and explain
                applicable data-sharing arrangements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Data Retention</h2>
              <p className="mt-3 leading-7 text-gray-400">
                Personal information should be retained only as long as needed
                for legitimate operational, security, accounting, and legal
                purposes. Actual retention periods and deletion practices must
                be confirmed before this policy is published.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Your Privacy Choices</h2>
              <p className="mt-3 leading-7 text-gray-400">
                Depending on applicable law, users may have rights to request
                access to, correction of, or deletion of personal information.
                The final policy should explain how users can submit requests
                and what exceptions may apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                9. Cookies and Similar Technologies
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                The platform may use browser storage or similar technologies for
                authentication, preferences, and functionality. Any analytics,
                advertising, or non-essential cookies must be described
                accurately if they are used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Policy Updates</h2>
              <p className="mt-3 leading-7 text-gray-400">
                This policy may change when GolfImpact updates its services or
                data-handling practices. Material changes should be communicated
                where required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Privacy Contact</h2>
              <p className="mt-3 leading-7 text-gray-400">
                Privacy-related questions and requests should be directed to
                GolfImpact through its published privacy contact details.
              </p>
              <p className="mt-2 text-sm text-amber-300">
                Before publication: add the data controller's legal name,
                privacy email, contact address, effective date, applicable
                jurisdiction, actual data retention periods, and confirmed
                service providers.
              </p>
            </section>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Read our{" "}
            <Link to="/terms" className="text-[#9A8DFF] hover:text-white">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default PrivacyPolicy;
