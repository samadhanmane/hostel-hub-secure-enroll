import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Dialog } from '@/components/ui/dialog';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state || {};
  const [splitEligible, setSplitEligible] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [remainingFee, setRemainingFee] = useState<{ total: number; paid: number; remaining: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [installmentStatus, setInstallmentStatus] = useState<{ first: boolean; second: boolean }>({ first: false, second: false });
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  useEffect(() => {
    // Always fetch split eligibility fresh when user or formData changes
    if (user?.email || user?.studentId || formData.email || formData.studentId) {
      axios.post(`${BACKEND_URL}/api/fee/split-eligibility`, {
        email: formData.email || user?.email,
        studentId: formData.studentId || user?.studentId,
      }).then(res => {
        console.log('Split eligibility response:', res.data);
        setSplitEligible(!!res.data.eligible);
      }).catch(() => setSplitEligible(false));
    } else {
      setSplitEligible(false);
    }
    // Fetch remaining fee for the selected structure
    if (user?.studentId || user?.email) {
      axios.get(`${BACKEND_URL}/api/fee/remaining-fee`, {
        params: {
          studentId: user?.studentId,
          email: user?.email,
          hostelYear: formData.hostelYear,
          roomType: formData.roomType,
          category: formData.category,
          hostelName: formData.hostelName,
          studentType: formData.studentType,
        },
      }).then(res => setRemainingFee(res.data));
    }
    // Fetch payment history to determine installment status
    if (user?.studentId || user?.email) {
      axios.get(`${BACKEND_URL}/api/fee/payment-history`, {
        params: { studentId: user?.studentId, email: user?.email },
      }).then(res => {
        // Only consider payments for the current structure
        const relevantPayments = res.data.filter((p: any) =>
          p.hostelYear === formData.hostelYear &&
          p.roomType === formData.roomType &&
          p.category === formData.category &&
          p.hostelName === formData.hostelName &&
          p.studentType === formData.studentType
        );
        const firstPaid = relevantPayments.some((p: any) => p.installment === 1 && p.status === 'success');
        const secondPaid = relevantPayments.some((p: any) => p.installment === 2 && p.status === 'success');
        setInstallmentStatus({ first: firstPaid, second: secondPaid });
      });
    }
  }, [formData.email, formData.studentId, user?.studentId, user?.email]);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    setPaymentCancelled(false);
    // Debug: log formData and user
    console.log('formData:', formData);
    console.log('user:', user);
    // Defensive: check required fields
    const requiredFields = [
      'name', 'department', 'contact', 'hostelName', 'roomType', 'admissionYear', 'studentType', 'category'
    ];
    const missing = requiredFields.filter(f => !formData[f] && !user?.[f]);
    if (missing.length > 0) {
      setError('Missing required fields: ' + missing.join(', '));
      setPaying(false);
      return;
    }
    try {
      // Calculate amount to pay (include deposit if present)
      const totalToPay = installments === 2
        ? (formData.fee.amount + (formData.fee.deposit || 0)) / 2
        : formData.fee.amount + (formData.fee.deposit || 0);
      // Debug: log payload
      const payload = {
        email: user.email,
        hostelYear: formData.hostelYear,
        academicYear: formData.year,
        college: formData.college,
        roomCapacity: formData.roomType === '2-sharing' ? 2 : 3,
        hostelType: formData.hostelType,
        amount: totalToPay,
        installment: installments,
        razorpayPaymentId: undefined, // will be set after payment
        name: user.name || formData.name || '',
        department: user.department || formData.department || '',
        contactNo: user.contactNo || formData.contactNo || formData.contact || '',
        hostelName: formData.hostelName || '',
        roomType: formData.roomType || '',
        admissionYear: formData.admissionYear || formData.yearOfAdmission || '',
        studentType: formData.studentType || '',
        category: formData.category || formData.caste || '',
        deposit: formData.fee.deposit || 0,
      };
      console.log('Sending to /api/fee/pay:', payload);
      // 1. Create Razorpay order
      const orderRes = await axios.post(`${BACKEND_URL}/api/fee/create-order`, {
        amount: totalToPay,
        receipt: `rcpt_${user.email}_${Date.now()}`
      });
      const order = orderRes.data;

      // 2. Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Hostel Hub',
        description: 'Hostel Fee Payment',
        order_id: order.id,
        handler: async function (response) {
          // 3. On payment success, call backend to record payment
          try {
            payload.razorpayPaymentId = response.razorpay_payment_id;
            const res = await axios.post(`${BACKEND_URL}/api/fee/pay`, payload);
            if (res.data.studentId) {
              localStorage.setItem('studentId', res.data.studentId);
            }
            navigate('/receipt', {
              state: {
                ...formData,
                paid: totalToPay,
                installment: installments,
                paymentId: res.data.paymentId,
                studentId: res.data.studentId,
                razorpayPaymentId: response.razorpay_payment_id,
                college: formData.college,
                year: formData.year,
                hostel: formData.hostelName,
              }
            });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment failed');
          }
          setPaying(false);
        },
        prefill: {
          email: user.email
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            setPaymentCancelled(true);
            setPaying(false);
          }
        }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setPaying(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/fee/payment-history`, {
        params: { studentId: user?.studentId, email: user?.email },
      });
      setHistory(res.data);
    } catch (err) {
      setHistory([]);
    }
    setLoadingHistory(false);
  };

  // Function to download receipt for a payment
  const handleDownloadReceipt = (payment: any) => {
    navigate('/receipt', {
      state: {
        ...formData,
        paid: payment.amount,
        installment: payment.installment,
        paymentId: payment._id,
        studentId: user?.studentId,
        razorpayPaymentId: payment.razorpayPaymentId,
        paymentDate: payment.paymentDate,
        status: payment.status,
        college: payment.college || formData.college || user?.college || '-',
        year: payment.academicYear || payment.year || formData.year || user?.year || '-',
        department: payment.department || formData.department || user?.department || '-',
        hostel: payment.hostelName || formData.hostelName || '-',
        roomType: payment.roomType || formData.roomType || '-',
        category: payment.category || formData.category || '-',
        hostelYear: payment.hostelYear || formData.hostelYear || '-',
      }
    });
  };

  // Add go back button handler
  const handleGoBack = () => navigate(-1);

  if (!formData.fee) return <div className="text-center text-red-600 font-semibold mt-10">No fee data. Please fill the form first.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 font-medium shadow-sm"
          onClick={handleGoBack}
          type="button"
        >
          &larr; Go Back
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
        <h2 className="text-2xl font-bold mb-2 text-center text-primary">Hostel Fee Payment</h2>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="mb-2 text-lg font-semibold">Fee Summary</div>
            <div className="mb-1 flex justify-between"><span>Total Fee:</span> <b>₹{formData.fee.amount}</b></div>
            <div className="mb-1 flex justify-between"><span>Deposit:</span> <b>₹{formData.fee.deposit}</b></div>
            {remainingFee && (
              <>
                <div className="mb-1 flex justify-between"><span>Paid:</span> <b>₹{remainingFee.paid}</b></div>
                <div className="mb-1 flex justify-between"><span>Remaining:</span> <b>₹{remainingFee.remaining}</b></div>
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full">
              <div className="mb-2 text-lg font-semibold">Student</div>
              <div className="mb-1"><span className="font-medium">Name:</span> {formData.name || user?.name}</div>
              <div className="mb-1"><span className="font-medium">Email:</span> {user?.email || formData.email}</div>
              {(formData.studentId || user?.studentId) && (
                <div className="mb-1"><span className="font-medium">Student ID:</span> {formData.studentId || user?.studentId}</div>
              )}
            </div>
          </div>
        </div>
        {remainingFee && remainingFee.remaining <= 0 ? (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded text-center font-semibold">
            Fees are already paid for this fee structure.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Installment Options:</span>
                {splitEligible ? (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Split Fee Eligible</span>
                ) : (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Full Payment Only</span>
                )}
              </div>
              {splitEligible ? (
                <div className="flex flex-col md:flex-row gap-2">
                  <label className={`flex-1 flex items-center gap-2 p-2 rounded border cursor-pointer transition ${installments === 1 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}> 
                    <input
                      type="radio"
                      name="installment"
                      value={1}
                      checked={installments === 1}
                      onChange={() => setInstallments(1)}
                      disabled={installmentStatus.first}
                    />
                    <span>First Installment (₹{formData.fee.amount / 2})</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${installmentStatus.first ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{installmentStatus.first ? 'Paid' : 'Not Paid'}</span>
                  </label>
                  <label className={`flex-1 flex items-center gap-2 p-2 rounded border cursor-pointer transition ${installments === 2 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}> 
                    <input
                      type="radio"
                      name="installment"
                      value={2}
                      checked={installments === 2}
                      onChange={() => setInstallments(2)}
                      disabled={!installmentStatus.first || installmentStatus.second}
                    />
                    <span>Second Installment (₹{formData.fee.amount / 2})</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${installmentStatus.second ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{installmentStatus.second ? 'Paid' : 'Not Paid'}</span>
                  </label>
                </div>
              ) : (
                <div className="p-2 rounded border border-gray-200 bg-gray-50">Full payment required for this fee structure.</div>
              )}
            </div>
            {paymentCancelled && (
              <div className="mb-4 p-4 bg-red-100 text-red-800 rounded text-center font-semibold">
                Payment cancelled. Please try again.
              </div>
            )}
            {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center font-semibold">{error}</div>}
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-4 py-3 rounded shadow mt-2 transition disabled:opacity-60"
              onClick={handlePay}
              disabled={paying || (splitEligible && ((installments === 1 && installmentStatus.first) || (installments === 2 && (!installmentStatus.first || installmentStatus.second))))}
            >
              {paying ? <span className="animate-pulse">Processing Payment...</span> : 'Pay Now'}
            </button>
            <button
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded shadow"
              onClick={handleShowHistory}
              type="button"
            >
              View Payment History
            </button>
          </>
        )}
      </div>
      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowHistory(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-2">Payment History</h3>
              {loadingHistory ? (
                <div className="text-center py-8">Loading...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">No payment history found.</div>
              ) : (
                <table className="w-full text-sm border">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Installment</th>
                      <th className="border px-2 py-1">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((p, i) => (
                      <tr key={p._id || i}>
                        <td className="border px-2 py-1">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="border px-2 py-1">₹{p.amount}</td>
                        <td className="border px-2 py-1">{p.status}</td>
                        <td className="border px-2 py-1">{p.installment}</td>
                        <td className="border px-2 py-1">
                          <button
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleDownloadReceipt(p)}
                          >
                            Download Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Payment; 