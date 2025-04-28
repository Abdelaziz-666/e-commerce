import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../../firebase/Config";
import Cart from "./Cart";

const CartPage = () => {
  const [user] = useAuthState(auth);

  return (
    <div className="container mt-5">
      {user ? (
        <Cart userId={user.uid} />
      ) : (
        <p>Please Login First</p>
      )}
    </div>
  );
};

export default CartPage;
