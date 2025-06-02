


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

interface Venue {
  _id: string;
  name: string;
  address: string;
  seatType: string;
 }



interface ModalformProps {
  venue?: Venue | null; // Make this consistent
  onSubmitSuccess?: (data: Venue) => void; // Specify the expected type for data
  onCancel?: () => void; // Include the onCancel prop for the cancel action
}

const CreateVenueNameForm: React.FC<ModalformProps> = ({
  venue,
  onSubmitSuccess,
  onCancel,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [seatType, setseatType] = useState('');
 // const [nonSittingTicketsType, setNonSittingTicketsType] = useState<NonSittingTicketsType[]>([]);


  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

 // const handleAddNonSitting = () => setNonSittingTicketsType([...nonSittingTicketsType, { name: '', price: 0, ticketCount: 0, availableTicketCount: 0 }]);


  const clearFormState = () => {
    reset();
    //setNonSittingTicketsType([]);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleOpen = () => {
    if (open) {
      clearFormState();
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name,
        seatType: venue.seatType
        //nonSittingTicketsType:nonSittingTicketsType,
        
      });
      //setSelectedImage(null);
    }
  }, [venue, reset]);

  const onSubmit = async (data: any) => {
   

     setLoading(true);
     setError(null);
     setSuccess(false);


    try {
      let formData = {
        name:data.name,
         address:data.address,
        seatType:data.seatType,
       // nonSittingTicketsType: nonSittingTicketsType,
       // VenueId: ""
      }
    
      const requestUrl = venue ? urls.createVenueName : urls.createVenueName;
     // if (venue) formData.VenueId = venue._id;

      const response = await axios.post(requestUrl, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess(true);
      clearFormState();
      setOpen(false);

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
        toast.success(
          'Venue added successfully! Your new venue is now available.',
        );
      }
    } catch (error: any) {
     console.error('Error:', error);

  const errorMessage =
    error?.response?.data?.message ||
    'Oops! Something went wrong while adding the venue name. Please try again later.';

  toast.error(errorMessage);
      setError(
        venue
          ? 'Failed to update venue. Please try again.'
          : 'Failed to create venue. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

 

  const handleCancel = () => {
    clearFormState(); // Reset the form state
    if (onCancel) {
      onCancel(); // Call the onCancel function to notify parent component
    }
    setOpen(false); // Close the form modal
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 rounded hover:bg-opacity-90 mb-4"
      >
        {venue ? 'Edit' : 'Add'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 w-full max-w-3xl space-y-4 max-h-[85vh] overflow-y-scroll transform translate-x-30 translate-y-10"
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {venue ? 'Edit' : 'Add'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 gap-x-6">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Venue Name
                  </label>
                  <input
                    type="text"
                    placeholder="Venue Name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('name', { required: true })}
                  />
                  {errors.name && (
                    <span className="text-red-500">Venue Name is required</span>
                  )}
                </div>

                 <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                 Address
                  </label>
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('address', { required: true })}
                  />
                  {errors.name && (
                    <span className="text-red-500">Address is required</span>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Seat Type
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('seatType', { required: true })}
                  >
                    <option value="" disabled>
                      Select Seat Type
                    </option>
                  <option value="nonSitting">Non Sitting</option>
                  <option value="sitting">Sitting</option>
                  
                  </select>
                  {errors.seatType && (
                    <span className="text-red-500">
                      Seat Type is required
                    </span>
                  )}
                </div>
              
              
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90"
                    disabled={loading}
                  >
                    {loading
                      ? venue
                        ? 'Updating...'
                        : 'Creating...'
                      : venue
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">
                    Venue {venue ? 'updated' : 'created'} successfully!
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateVenueNameForm;
