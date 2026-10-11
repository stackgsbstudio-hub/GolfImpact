import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

import Navbar from "../Components/Navbar.jsx";
import PageTitle from "../Components/PageTitle.jsx";

const TermsAndConditions = () => {
  return (
    <>
      <PageTitle title="Terms & Conditions | GolfImpact" />
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
              <FileText size={28} />
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Terms & Conditions
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Please read these terms before registering for or using
              GolfImpact.
            </p>
          </div>

          <div className="space-y-8 rounded-2xl border border-gray-800 bg-[#0D1520] p-6 sm:p-10">
            <section>
              <h2 className="text-xl font-semibold">1. About GolfImpact</h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact is a subscription-based platform designed around golf
                score submissions, prize draws, and charitable contributions.
                The platform may also provide charity information, events,
                account dashboards, and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Account Registration</h2>
              <p className="mt-3 leading-7 text-gray-400">
                Users must provide accurate registration information, maintain
                the confidentiality of their account credentials, and notify the
                platform if they suspect unauthorized account access. Users are
                responsible for activity carried out through their accounts,
                subject to applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                3. Subscriptions and Payments
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact may offer monthly and annual subscription plans. The
                applicable price, billing frequency, renewal terms, cancellation
                process, and any refund conditions must be disclosed at checkout
                and in the applicable subscription information.
              </p>
              <p className="mt-3 leading-7 text-gray-400">
                Payments may be processed by third-party payment providers.
                Their applicable terms and privacy practices may also apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                4. Golf Scores and Draw Participation
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Eligible participants may submit golf scores according to the
                rules displayed on the platform. Draw eligibility, selection
                methods, schedules, prize categories, and other conditions
                should be read alongside the official draw rules published by
                GolfImpact.
              </p>
              <p className="mt-3 leading-7 text-gray-400">
                Users must not submit fraudulent scores, impersonate others, or
                attempt to manipulate any draw or verification process.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                5. Prizes and Winner Verification
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                Potential winners may be required to provide supporting
                information or evidence before a prize is approved for payment.
                Prize eligibility, verification deadlines, payout methods, and
                any applicable restrictions must be specified in the official
                draw rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                6. Charitable Contributions
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact supports charitable contributions through
                participating charities. The applicable contribution amount,
                allocation method, timing, and any restrictions should be
                disclosed through the platform.
              </p>
              <p className="mt-3 leading-7 text-gray-400">
                A charitable contribution is not necessarily tax-deductible. Any
                tax treatment depends on applicable law and the circumstances of
                the contribution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Acceptable Use</h2>
              <p className="mt-3 leading-7 text-gray-400">
                Users must not interfere with platform security, access other
                users' accounts without authorization, upload unlawful content,
                misuse payment systems, or exploit technical vulnerabilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                8. Account Suspension or Termination
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                GolfImpact may restrict accounts where necessary to investigate
                suspected fraud, security incidents, or violations of applicable
                terms, subject to applicable law and any published account
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Service Availability</h2>
              <p className="mt-3 leading-7 text-gray-400">
                The platform may require maintenance or experience
                interruptions. GolfImpact aims to maintain a reliable service
                but cannot guarantee uninterrupted access. Any legal limitations
                of liability must be set out in the final approved terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                10. Changes to These Terms
              </h2>
              <p className="mt-3 leading-7 text-gray-400">
                These terms may be updated to reflect changes in services,
                operational practices, or legal requirements. Material changes
                should be communicated as required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Contact Information</h2>
              <p className="mt-3 leading-7 text-gray-400">
                For questions about these terms, contact GolfImpact through its
                published support contact details.
              </p>
              <p className="mt-2 text-sm text-amber-300">
                Before publication: add the legal business name, contact email,
                registered address, governing law, official draw rules, and
                approved refund policy.
              </p>
            </section>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Read our{" "}
            <Link
              to="/privacy-policy"
              className="text-[#9A8DFF] hover:text-white"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default TermsAndConditions;
