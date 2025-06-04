import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';
import url from '../../networking/app_urls';
import { useSelector } from 'react-redux';

const ManagerReceipt: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticket, setTicket] = useState<number | null>(null); // State for tickets
  const [amount, setAmount] = useState<number | null>(null); // State for amount
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [loading, setLoading] = useState(false);

  // Fetch ticket and amount data from the API
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await axios.post(
          url.ManDepositCountUrl, // Replace with your API URL
          {},
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          },
        );

        const data = response.data.data;
        setTicket(data.totalTicketCount); // Assuming the API response contains a "ticketsSold" field
        setAmount(data.amount); // Assuming the API response contains a "totalAmount" field
      } catch (error) {
        console.error('Error fetching ticket and amount:', error);
      }
    };

    fetchTicketData();
  }, [currentUser.token]);

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('Please upload a receipt before submitting.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (amount) {
      formData.append('amount', amount.toString()); // Append total amount from API response
    }
    if (file) {
      formData.append('slip', file); // Append the selected file
    }

    try {
      const response = await axios.post(url.SubmitDepositUrl, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Money Deposit" />

      <div className="grid grid-cols-2 gap-8">
        {/* Tickets Sold */}
        <div className="col-span-5 lg:col-span-1">
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mt-4">
              <h4 className="text-title-xl md:text-title-xxl font-bold text-black dark:text-white">
                {ticket !== null ? ticket : '...'}
              </h4>
              <span className="text-base font-medium">
                Number of tickets sold
              </span>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="col-span-5 lg:col-span-1">
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mt-4">
              <h4 className="text-title-xl md:text-title-xxl font-bold text-black dark:text-white">
                Rs {amount !== null ? amount : '...'}
              </h4>
              <span className="text-base font-medium">Total Amount</span>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="col-span-5 xl:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Upload your receipt here
              </h3>
            </div>

            <div className="p-7">
              <form onSubmit={handleSubmit}>
                <div
                  id="FileUpload"
                  className="relative mb-5.5 block w-full cursor-pointer rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 z-[999] h-full w-full cursor-pointer opacity-0 outline-none"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="text-primary"
                      />
                    </span>
                    <p>
                      <span className="text-primary">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="mt-1.5">SVG, PNG or JPG</p>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-red-500 mb-4">{errorMessage}</p>
                )}

                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className={`flex justify-center rounded ${
                      loading ? 'bg-gray' : 'bg-primary'
                    } py-2 px-6 font-medium text-white hover:bg-opacity-90 bg-primary`}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-2"
                        />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReceipt;
