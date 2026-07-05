import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import Footer from "../components/Footer";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  alert("Product added to cart!");
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
                {product.rating?.rate} ({product.rating?.count} Reviews)
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
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;