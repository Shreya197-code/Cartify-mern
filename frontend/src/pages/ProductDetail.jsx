import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import { addToCart } from "../redux/cartSlice";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // if logged in, check purchase status
        if (user && user.token) {
          try {
            const pr = await fetch(`/api/products/${id}/purchased`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            const pj = await pr.json();
            setPurchased(pj.purchased);
          } catch (e) {
            console.error('purchase check failed', e);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

 const handleAddToCart = () => {
  dispatch(
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty: 1,
    })
  );

  toast.success("Product added to cart!");
};

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl text-red-500">Product Not Found</h2>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10 bg-white shadow-lg rounded-xl p-8">
          {/* Product Image */}
          <div className="flex justify-center items-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full max-w-md h-[450px] object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            <h1 className="text-4xl font-bold text-gray-800">
              {product.name}
            </h1>

            <p className="text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>

            <p className="text-3xl font-bold text-green-600">
              ₹ {product.price}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 text-xl">⭐</span>
              <span className="font-medium">
                {product.rating || 0} ({product.numReviews || 0} Reviews)
              </span>
            </div>

            <hr />

            <p className="text-gray-700 leading-7">
              {product.description}
            </p>

            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

          {product.reviews && product.reviews.length === 0 && (
            <p className="text-gray-600">No reviews yet.</p>
          )}

          {product.reviews && product.reviews.length > 0 && (
            <div className="space-y-4">
              {product.reviews.map((r) => (
                <div key={r._id || r.user} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-yellow-500">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  <p className="mt-2 text-gray-700">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review form */}
          <div className="mt-6">
            {!user && (
              <p className="text-gray-600">Please login to write a review.</p>
            )}

            {user && !purchased && (
              <p className="text-gray-600">You must purchase this product to leave a review.</p>
            )}

            {user && purchased && (
              // check if user already reviewed
              (() => {
                const already = product.reviews && product.reviews.find(r => r.user === user.id || r.user === user._id);
                if (already) {
                  return <p className="text-gray-600">You have already reviewed this product.</p>;
                }

                return (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitError('');
                    setSubmitSuccess('');
                    setSubmitting(true);
                    try {
                      const res = await fetch(`/api/products/${id}/reviews`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${user.token}`
                        },
                        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setSubmitSuccess(data.message || 'Review added');
                        // refresh product reviews
                        const refreshed = await fetch(`/api/products/${id}`);
                        const pd = await refreshed.json();
                        setProduct(pd);
                      } else {
                        setSubmitError(data.message || 'Unable to submit review');
                      }
                    } catch (err) {
                      setSubmitError('Network error. Please try again.');
                    } finally {
                      setSubmitting(false);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <select value={ratingInput} onChange={(e) => setRatingInput(Number(e.target.value))} className="w-32 px-3 py-2 border rounded-lg">
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Average</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Terrible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                      <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} className="w-full px-4 py-3 border rounded-lg" rows={4} />
                    </div>

                    {submitError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</div>}
                    {submitSuccess && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">{submitSuccess}</div>}

                    <button type="submit" disabled={submitting} className="bg-black text-white px-6 py-2 rounded-lg">{submitting ? 'Submitting...' : 'Submit Review'}</button>
                  </form>
                );
              })()
            )}

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;