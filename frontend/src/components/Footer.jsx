import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#F8FAFF] border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold text-blue-600">
              Cartify
            </h2>

            <p className="text-gray-600 mt-4 leading-7">
              Elevating your shopping experience with premium products,
              seamless delivery, and trusted customer service.
            </p>

            <div className="flex gap-4 mt-6">
              <button className="w-10 h-10 rounded-full bg-white shadow hover:bg-blue-600 hover:text-white transition">
                🌐
              </button>

              <button className="w-10 h-10 rounded-full bg-white shadow hover:bg-blue-600 hover:text-white transition">
                📷
              </button>

              <button className="w-10 h-10 rounded-full bg-white shadow hover:bg-blue-600 hover:text-white transition">
                ✉️
              </button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Shop
            </h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <a href="/" className="hover:text-blue-600 transition">
                  Home
                </a>
              </li>

              <li>
                <a href="/products" className="hover:text-blue-600 transition">
                  Products
                </a>
              </li>

              <li>
                <a href="/categories" className="hover:text-blue-600 transition">
                  Categories
                </a>
              </li>

              <li>
                <a href="/offers" className="hover:text-blue-600 transition">
                  Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Support
            </h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <a href="/about" className="hover:text-blue-600 transition">
                  About Us
                </a>
              </li>

              <li>
                <a href="/contact" className="hover:text-blue-600 transition">
                  Contact
                </a>
              </li>

              <li>
                <a href="/shipping" className="hover:text-blue-600 transition">
                  Shipping Policy
                </a>
              </li>

              <li>
                <a href="/returns" className="hover:text-blue-600 transition">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Contact
            </h3>

            <div className="space-y-3 text-gray-600">
              <p>📧 support@cartify.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Bhopal, Madhya Pradesh</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-300 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">

          <p>
            © {new Date().getFullYear()} Cartify. All Rights Reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </a>

            <a href="/terms" className="hover:text-blue-600">
              Terms
            </a>

            <a href="/cookies" className="hover:text-blue-600">
              Cookies
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;