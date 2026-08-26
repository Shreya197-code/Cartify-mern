import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warn("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        qty: 1,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-100"
    >
      {/* Category Badge & Stock Alert */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-xs backdrop-blur-md">
          {product.category}
        </span>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-50 flex items-center justify-center p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108 rounded-2xl"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            🛍️
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500">
          <span>{"★".repeat(Math.round(product.rating || 5))}</span>
          <span className="font-bold text-gray-700 ml-1">{product.rating || 5.0}</span>
          <span className="text-gray-400">({product.numReviews || 0})</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-base font-bold text-gray-900 transition group-hover:text-blue-600 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Price</span>
            <span className="text-xl font-black text-blue-600">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            title="Add to cart"
          >
            <span>+</span>
            <span>Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default Product;