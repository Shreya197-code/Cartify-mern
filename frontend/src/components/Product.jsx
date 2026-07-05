import React from "react";
import { Link } from "react-router-dom";


const Product = ({ product }) => {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image */}
      <div className="overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5">

        <span className="text-sm font-medium text-blue-600">
          {product.category}
        </span>

        <h2 className="text-xl font-bold text-gray-900 mt-2">
          {product.name}
        </h2>

        <p className="text-gray-500 mt-2 text-sm line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mt-4">
          ⭐
          <span className="ml-2 text-gray-600">
            {product.rating} ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mt-6">

          <span className="text-3xl font-bold text-blue-600">
            ₹{product.price}
          </span>

          <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition">
            View
          </button>

        </div>

      </div>
    </Link>
  );
};

export default Product;