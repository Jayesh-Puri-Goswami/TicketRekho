import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { useSelector } from 'react-redux'; 
import Urls from '../../networking/app_urls';

interface Transaction {
  type: string;
  amount: number;
  description: string;
  status: string;
  _id: string;
  date: string;
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  transactions: Transaction[];
}

const EarningsCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to toggle modal
  const [withdrawAmount, setWithdrawAmount] = useState(0); // State for withdrawal input
  const [loading, setLoading] = useState(false); // State to manage loading
  const [error, setError] = useState<string | null>(null); // State for error handling
  const [walletData, setWalletData] = useState<WalletData | null>(null); // State to store wallet data
  const currentUser = useSelector((state: any) => state.user.currentUser?.data); // Assuming user data is stored in Redux

  useEffect(() => {
    // Fetch wallet data when the component mounts
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${Urls.SellerWallerUrl}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // Add the user token if required
          },
        });
        setWalletData(response.data.data); // Save wallet data
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [currentUser]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleWithdraw = async () => {
    if (walletData && withdrawAmount > walletData.balance) {
      setError('Withdrawal amount exceeds balance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Make an API request to withdraw the amount
      const response = await axios.post(
        `${Urls.SellerWithdrawalReq}`, // Replace with your actual API endpoint
        { amount: withdrawAmount },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // Add the user token if required
          },
        },
      );
      console.log('API Response:', response.data);

      // Reset modal and withdraw state after success
      setIsModalOpen(false);
      setWithdrawAmount(0);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to withdraw. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Earnings Card */}
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex justify-between items-center transition-transform duration-300 ">
        <div className="">
          <h3 className="text-title-lg md:text-title-xl font-bold text-gray-800 dark:text-white">
            My Earnings
          </h3>
          {/* {loading ? (
            <p>Loading balance...</p>
          ) : walletData ? (
            <>
              <h4 className="text-title-xl md:text-title-xxl font-bold text-black dark:text-white mt-2">
                ₹ {walletData.balance}
              </h4>
              <button
                onClick={openModal}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                Withdraw
              </button>
            </>
          ) : (
            <p className="text-red-500">{error}</p>
          )} */}
          {loading ? (
            <p>Loading balance...</p>
          ) : walletData ? (
            <>
              <h4 className="text-title-lg md:text-title-xxl font-bold text-black dark:text-white mt-2">
                ₹ {walletData.balance}
              </h4>
              <button
                onClick={openModal}
                disabled={walletData.balance === 0} 
                className={`mt-4 px-6 py-2 font-medium rounded-md shadow-md transition-all duration-300 ${
                  walletData.balance === 0
                    ? 'bg-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Withdraw
              </button>
            </>
          ) : (
            <p className="text-red-500">{error}</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-999 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-11/12 md:w-1/3 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
              Withdraw Funds
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
              Current Balance: ₹ {walletData?.balance}
            </p>

            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                className="border border-gray-300 dark:border-strokedark rounded-md p-2 w-full text-center mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex justify-between w-full">
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all duration-300"
                >
                  {loading ? 'Withdrawing...' : 'Confirm Withdraw'}
                </button>
                <button
                  onClick={closeModal}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EarningsCard;
