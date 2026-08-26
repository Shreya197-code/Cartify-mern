import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "../redux/cartSlice";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [quantity, setQuantity] = useState(1);

  // AI Review Summary State
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/v1/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // Fetch AI Review Summary if reviews exist
        if (data.reviews && data.reviews.length > 0) {
          setLoadingSummary(true);
          try {
            const sumRes = await fetch(`/api/v1/ai/review-summary/${id}`);
            const sumData = await sumRes.json();
            if (sumRes.ok && sumData.success) {
              setReviewSummary(sumData);
            }
          } catch (e) {
            console.warn("Review summary fetch failed:", e.message);
          } finally {
            setLoadingSummary(false);
          }
        }

        // Check purchase status if logged in
        if (user && user.token) {
          try {
            const pr = await fetch(`/api/v1/products/${id}/purchased`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            const pj = await pr.json();
            setPurchased(pj.purchased);
          } catch (e) {
            console.error("Purchase check failed:", e);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product) return;

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
        qty: quantity,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-red-600">Product Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The product you are looking for may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:grid-cols-2 lg:p-12">
            {/* Product Image */}
            <div className="flex items-center justify-center rounded-2xl bg-slate-50/80 p-6">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[480px] w-full rounded-2xl object-contain drop-shadow-md transition duration-300 hover:scale-105"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                  {product.category}
                </span>
                <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Reviews Count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {"★".repeat(Math.round(product.rating || 0))}
                  {"☆".repeat(5 - Math.round(product.rating || 0))}
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {product.rating || 0} / 5
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-medium text-gray-500">
                  {product.numReviews || 0} verified customer review{product.numReviews === 1 ? "" : "s"}
                </span>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-4 border-y border-gray-100 py-4">
                <span className="text-4xl font-extrabold text-blue-600">
                  ₹{product.price}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  product.stock > 0 ? "text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full" : "text-red-600 bg-red-50 px-2.5 py-1 rounded-full"
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>

              {/* Quantity Selector & Action */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-base font-bold text-gray-600 hover:text-blue-600 transition"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="px-3.5 py-2.5 text-base font-bold text-gray-600 hover:text-blue-600 transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? "Sold Out" : "Add to Cart 🛍️"}
                </button>
              </div>
            </div>
          </div>

          {/* AI Review Summary (Superpower 3) */}
          {loadingSummary ? (
            <div className="mt-10 animate-pulse rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="mt-3 h-3 w-3/4 rounded bg-gray-200"></div>
            </div>
          ) : reviewSummary ? (
            <div className="mt-10 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white">
                  ✨
                </span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">AI Customer Sentiment Summary</h3>
                  <p className="text-xs text-gray-500">Condensed pros & cons from buyer feedback</p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-700">
                "{reviewSummary.summary}"
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Pros */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <span>👍</span> Top Highlights
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-950">
                    {reviewSummary.pros?.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <span>⚠️</span> Considerations
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-amber-950">
                    {reviewSummary.cons?.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Reviews Section */}
          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

            {product.reviews && product.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No reviews yet. Be the first to review after purchasing!</p>
            ) : (
              <div className="mt-6 space-y-4">
                {product.reviews.map((r) => (
                  <div key={r._id || r.user} className="rounded-2xl border border-gray-100 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{r.name}</span>
                      <div className="text-amber-500 text-sm">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Review Form */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              {!user ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-gray-600">
                  Please log in to write a review.
                </div>
              ) : !purchased ? (
                <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4 text-center text-xs font-semibold text-amber-800">
                  🔒 Verified Purchase Required: Only verified buyers of this product can submit a review.
                </div>
              ) : (
                (() => {
                  const already = product.reviews?.find(
                    (r) => r.user === user.id || r.user === user._id
                  );
                  if (already) {
                    return (
                      <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs font-semibold text-gray-600">
                        ✅ You have already submitted a review for this product.
                      </div>
                    );
                  }

                  return (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitError("");
                        setSubmitSuccess("");
                        setSubmitting(true);
                        try {
                          const res = await fetch(`/api/v1/products/${id}/reviews`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${user.token}`,
                            },
                            body: JSON.stringify({
                              rating: ratingInput,
                              comment: commentInput,
                            }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setSubmitSuccess("Review submitted successfully!");
                            const refreshed = await fetch(`/api/v1/products/${id}`);
                            const pd = await refreshed.json();
                            setProduct(pd);
                          } else {
                            setSubmitError(data.message || "Unable to submit review");
                          }
                        } catch (err) {
                          setSubmitError("Network error. Please try again.");
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-gray-900">Leave a Review</h3>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">Rating</label>
                        <select
                          value={ratingInput}
                          onChange={(e) => setRatingInput(Number(e.target.value))}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none"
                        >
                          <option value={5}>5 ★ - Excellent</option>
                          <option value={4}>4 ★ - Good</option>
                          <option value={3}>3 ★ - Average</option>
                          <option value={2}>2 ★ - Poor</option>
                          <option value={1}>1 ★ - Terrible</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">Comment</label>
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          rows={3}
                          placeholder="What did you like or dislike about this product?"
                          required
                          className="w-full rounded-2xl border border-gray-200 p-3.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {submitError && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                          {submitError}
                        </div>
                      )}
                      {submitSuccess && (
                        <div className="rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-600">
                          {submitSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;