import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">

        <h1 className="text-5xl font-bold text-center text-gray-900 mb-8">
          About Cartify
        </h1>

        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto leading-8">
          Welcome to <span className="font-semibold text-blue-600">Cartify</span>,
          your trusted online shopping destination. Our mission is to provide
          customers with premium products, affordable prices, and a seamless
          shopping experience.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-600">
              Deliver quality products with excellent customer service and
              create an enjoyable online shopping experience.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-gray-600">
              To become one of India's most trusted e-commerce platforms by
              focusing on innovation and customer satisfaction.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold mb-3">Customer First</h2>
            <p className="text-gray-600">
              Every decision we make is centered around delivering the best
              value and experience to our customers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default About;