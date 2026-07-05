import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
   addToCart: (state, action) => {
  const item = {
    ...action.payload,
    _id: action.payload._id || action.payload.productId,
  };

  const existItem = state.cartItems.find(
    (x) => x._id === item._id
  );

  if (existItem) {
    state.cartItems = state.cartItems.map((x) =>
      x._id === existItem._id ? item : x
    );
  } else {
    state.cartItems.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(state.cartItems));
},


    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;