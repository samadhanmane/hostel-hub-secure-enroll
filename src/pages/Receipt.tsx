import React from 'react';
import { useLocation } from 'react-router-dom';

const Receipt = () => {
  const location = useLocation();
  const data = location.state || {};

  if (!data.paymentId) return <div>No payment found.</div>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white border rounded">
      <h2 className="text-xl font-bold mb-4">Payment Receipt</h2>
      <div className="mb-2">Payment ID: <b>{data.paymentId}</b></div>
      <div className="mb-2">Razorpay Transaction ID: <b>{data.razorpayPaymentId}</b></div>
      <div className="mb-2">Student ID: <b>{data.studentId}</b></div>
      <div className="mb-2">Paid Amount: <b>INR {data.paid}</b></div>
      <div className="mb-2">Installment: <b>{data.installment === 2 ? '1st of 2' : 'Full'}</b></div>
      <div className="mb-2">College: {data.college}</div>
      <div className="mb-2">Year: {data.year}</div>
      <div className="mb-2">Department: {data.department}</div>
      <div className="mb-2">Hostel: {data.hostel}</div>
      <div className="mb-2">Room Type: {data.roomType}</div>
      <div className="mb-2">Category: {data.category}</div>
      <div className="mb-2">Hostel Year: {data.hostelYear}</div>
      <div className="mb-2">Date: {new Date().toLocaleDateString()}</div>
      <a
        className="bg-green-600 text-white px-4 py-2 rounded mt-4 inline-block"
        href={`/api/fee/receipt/${data.paymentId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Download Official Receipt PDF
      </a>
    </div>
  );
};

export default Receipt; 