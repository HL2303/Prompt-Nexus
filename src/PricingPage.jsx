import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PricingPage.css';

const API_URL = 'http://localhost:5001/api';

// --- SVG Icons ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);

function PricingPage({ user, onBack, refreshUser }) {
  const [loading, setLoading] = useState(null);

  // This effect loads the Razorpay script when the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Define your credit packs here
  const plans = [
    { id: 1, name: 'Starter Pack', credits: 1000, price: 50, features: ['1000 Credits Daily', 'Standard Access'] },
    { id: 2, name: 'Pro Pack', credits: 2500, price: 100, features: ['2500 Credits Daily', 'Priority Access', 'Early access to new features'], popular: true },
    { id: 3, name: 'Mega Pack', credits: 10000, price: 250, features: ['10000 Credits', 'Everything in Pro'] },
  ];

  const handlePayment = async (plan) => {
    setLoading(plan.id);
    const toastId = toast.loading('Initiating payment...');
    try {
      // 1. Create an order on your backend
      const orderResponse = await axios.post(`${API_URL}/payment/orders`, { amount: plan.price });
      const order = orderResponse.data;

      toast.dismiss(toastId);

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Prompt Generator',
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: order.id,
        handler: async function (response) {
          const verificationToastId = toast.loading('Verifying payment...');
          try {
            // 3. Verify the payment on your backend
            const verificationResponse = await axios.post(`${API_URL}/payment/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              creditsToAdd: plan.credits,
              planName: plan.name,
            });
            await refreshUser();
            toast.success(verificationResponse.data.message, { id: verificationToastId });
            onBack(); // Go back to the dashboard after success
          } catch (verifyError) {
            toast.error('Payment verification failed. Please contact support.', { id: verificationToastId });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#8b5cf6',
        },
      };

      // 4. Open the Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error('Could not initiate payment. Please try again.', { id: toastId });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Purchase credits to continue creating amazing prompts.</p>
        <button onClick={onBack} className="pricing-back-button">Back to Dashboard</button>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <h2>{plan.name}</h2>
            <p className="price">₹{plan.price}</p>
            <p className="credits-info">{plan.credits.toLocaleString()} Credits</p>
            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}><CheckIcon /> {feature}</li>
              ))}
            </ul>
            <button 
              className="buy-button" 
              onClick={() => handlePayment(plan)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPage;
