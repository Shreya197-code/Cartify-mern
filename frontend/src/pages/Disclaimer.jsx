import React from "react";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 py-16">

        <h1 className="text-5xl font-bold text-center mb-10">
          Disclaimer
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-10 space-y-8">

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              General Information
            </h2>

            <p className="text-gray-600 leading-8">
              The information provided on Cartify is for general informational
              purposes only. While we strive to keep product information
              accurate and up to date, we do not guarantee the completeness,
              reliability, or accuracy of all content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              Product Availability
            </h2>

            <p className="text-gray-600 leading-8">
              Product prices, availability, specifications, and promotional
              offers may change without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              External Links
            </h2>

            <p className="text-gray-600 leading-8">
              Cartify may contain links to third-party websites. We are not
              responsible for the content, privacy practices, or policies of
              those external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              Limitation of Liability
            </h2>

            <p className="text-gray-600 leading-8">
              Cartify shall not be held liable for any direct, indirect,
              incidental, or consequential damages arising from the use of our
              website, products, or services.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
};

export default Disclaimer;