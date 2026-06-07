import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Active!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for subscribing. Your payment was successful and your account has been fully upgraded.
        </p>

        <Link
          href="/dashboard"
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-[#5aace8] text-white font-medium rounded-lg transition-colors duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}