import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cartSlice";
import { useReducer } from "react";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  
  },
});

export default store