import React, { useEffect, useState } from "react";
import { UserProfileApi } from "../../api/users/users.api";
import CheckoutForm from "../StripePayment/CheckoutForm";

const ParentComponent = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Reusable profile fetch function
  const fetchUserProfile = async () => {
    try {
      const res = await UserProfileApi();
      setUser(res?.data?.data || null);
    } catch (error) {
    }
  };

  // ✅ Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ Called after successful payment
  const handlePaymentSuccess = async () => {
    await fetchUserProfile(); // refresh profile after credit added
  };

  return (
    <>
      <div>
        <h3>Available Credits: {user?.credit || 0}</h3>
      </div>

      {showModal && (
        <CheckoutForm
          amount={100}
          credit={10}
          onCloseModal={() => setShowModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default ParentComponent;