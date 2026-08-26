import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      const itemId = payload._id || payload.productId;
      const qtyToAdd = Number(payload.qty || payload.quantity || 1);

      const existItem = state.cartItems.find((x) => x._id === itemId);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === itemId
            ? { ...x, ...payload, _id: itemId, qty: payload.qty ? Number(payload.qty) : (x.qty || 1) + qtyToAdd }
            : x
        );
      } else {
        state.cartItems.push({
          ...payload,
          _id: itemId,
          qty: qtyToAdd,
        });
      }

      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    updateCartQuantity: (state, action) => {
      const { id, qty } = action.payload;
      if (qty < 1) return;
      state.cartItems = state.cartItems.map((item) =>
        item._id === id ? { ...item, qty: Number(qty) } : item
      );
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

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;