


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import urls from '../networking/app_urls';
import { useSelector } from 'react-redux';

interface Venue {
  _id: string;
  seatsPerRow: number;
  row: string;
  type: string;
  price: number;
}

interface SittingTicketsType {
  seatNumber: string;
  row: string;
  type: string;
  price: number;
  isBooked: boolean;
}

interface ModalformProps {
  venue?: Venue | null; // Make this consistent
  onSubmitSuccess?: (data: Venue) => void; // Specify the expected type for data
  onCancel?: () => void; // Include the onCancel prop for the cancel action
}

const VenueFormForSitting: React.FC<ModalformProps> = ({
  venue,
  onSubmitSuccess,
  onCancel,
}) => {
   const { id } = useParams(); 
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  // const [seatNumber, setSeatNumber] = useState('');
  // const [row, setRow] = useState('');
  // const [type, setType] = useState('');
  // const [price, setPrice] = useState(0);
  //const [sittingTicketsType, setSittingTicketsType] = useState<SittingTicketsType[]>([]);


  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

 

  const clearFormState = () => {
    reset();
   // setSittingTicketsType([]);
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
      //  name: venue.name,
       // seatType: venue.seatType
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
        venueId: id,
        seatsPerRow:Number(data.seatsPerRow),
        row:data.row, 
        price:Number(data.price),
         type: data.type,
         isBooked:false 
      }
    
      const requestUrl = venue ? urls.addTicketsForSitting : urls.addTicketsForSitting;
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
      }
    } catch (err) {
      setError(
        venue
          ? 'Failed to update seats. Please try again.'
          : 'Failed to add seats. Please try again.',
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
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-xl overflow-y-auto"
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
                  Seat Per Row
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Seat Number"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('seatsPerRow', { required: true })}
                  />
                  {errors.seatsPerRow && (
                    <span className="text-red-500">Seat Per Row is required</span>
                  )}
                </div> 
                
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Row
                  </label>
                  <input
                    type="text"
                    placeholder="Row"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('row', { required: true })}
                  />
                  {errors.row && (
                    <span className="text-red-500">Row is required</span>
                  )}
                </div> 

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Type 
                  </label>
                  <input
                    type="text"
                    placeholder="Type"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('type', { required: true })}
                  />
                  {errors.type && (
                    <span className="text-red-500">Type is required</span>
                  )}
                </div> 

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Price"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('price', { required: true })}
                  />
                  {errors.price && (
                    <span className="text-red-500">Price is required</span>
                  )}
                </div> 
                {/* <div className="mb-4.5">
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
                    <option value="nonSitting">nonSitting</option>
                    <option value="sitting">sitting</option>
                  
                  </select>
                  {errors.seatType && (
                    <span className="text-red-500">
                      Seat Type is required
                    </span>
                  )}
                </div> */}
{/*                 
                <div>
              <label className="block font-semibold mb-1">Non Sitting Ticket</label>
              {nonSittingTicketsType.map((member, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={member.name}
                    placeholder="Ticket Name"
                    onChange={(e) =>
                      setNonSittingTicketsType(
                        nonSittingTicketsType.map((c, i) =>
                          i === index ? { ...c, name: e.target.value } : c,
                        ),
                      )
                    }
                    className="w-full border rounded p-2"
                  />
                  <input
                    type="number"
                    value={member.price === 0 ? "" : member.price}  // Display empty string for 0 value to show placeholder
                    placeholder="price"
                    onChange={(e) =>
                      setNonSittingTicketsType(
                        nonSittingTicketsType.map((c, i) =>
                          i === index ? { ...c, price:parseInt(e.target.value) } : c,
                        ),
                      )
                    }
                    className="w-full border rounded p-2"
                  />
                   <input
                    type="text"
                    value={member.ticketCount === 0 ? "" : member.ticketCount}  // Display empty string for 0 value to show placeholder
                    placeholder="Total Ticket"
                    onChange={(e) =>
                      setNonSittingTicketsType(
                        nonSittingTicketsType.map((c, i) =>
                          i === index ? { ...c, ticketCount:parseInt(e.target.value),availableTicketCount:parseInt(e.target.value) } : c,
                        ),
                      )
                    }
                    className="w-full border rounded p-2"
                  />
                  
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddNonSitting}
                className="text-blue-500"
              >
                + Add Ticket
              </button>
             
               </div> */}
              
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

export default VenueFormForSitting;
