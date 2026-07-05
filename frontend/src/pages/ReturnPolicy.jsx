import React from "react";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <h1 className="text-5xl font-bold text-center mb-10">
          Return & Refund Policy
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-8">

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              7-Day Easy Returns
            </h2>

            <p className="text-gray-600 leading-8">
              Customers may request a return within 7 days of receiving the
              product, provided it is unused, undamaged, and returned in its
              original packaging with all accessories.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              Refund Process
            </h2>

            <p className="text-gray-600 leading-8">
              Once the returned item passes quality inspection, refunds are
              processed to the original payment method within 5–7 business
              days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              Non-Returnable Items
            </h2>

            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Used or damaged products.</li>
              <li>Personal care products.</li>
              <li>Gift cards.</li>
              <li>Digital products and downloadable content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              Need Help?
            </h2>

            <p className="text-gray-600">
              Contact our support team for assistance regarding returns,
              exchanges, or refunds.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
};

export default ReturnPolicy;