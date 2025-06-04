import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

interface Venue {
  _id: string;
  nonSittingTicketsType: string[];
}

interface NonSittingTicketsType {
  name: string;
  price: number;
  ticketCount: number;
  availableTicketCount: number;
}

interface ModalformProps {
  venue?: Venue | null;
  onSubmitSuccess?: (data: Venue) => void;
  onCancel?: () => void;
}

const VenueForm: React.FC<ModalformProps> = ({
  venue,
  onSubmitSuccess,
  onCancel,
}) => {
  const { id } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [nonSittingTicketsType, setNonSittingTicketsType] = useState<NonSittingTicketsType[]>([]);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleAddNonSitting = () => {
    setNonSittingTicketsType([
      ...nonSittingTicketsType,
      { name: '', price: 0, ticketCount: 0, availableTicketCount: 0 },
    ]);
  };

  const clearFormState = () => {
    reset();
    setNonSittingTicketsType([]);
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

  const onSubmit = async (data: any) => {
    if (nonSittingTicketsType.length === 0) {
      setError('Please add ticket.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = {
        venueId: id,
        nonSittingTicketsType,
      };

      const requestUrl = urls.addTicketsForNonSitting;

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
        toast.success('Tickets added successfully!',{
        className : 'z-[99999]'
      });
      }
    } catch (err) {
      toast.error('Oops! Something went wrong while adding the tickets.',{
        className : 'z-[99999]'
      });
      setError('Failed to process the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearFormState();
    if (onCancel) onCancel();
    setOpen(false);
  };

  useEffect(() => {
    if (venue) {
      reset({});
    }
  }, [venue, reset]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 rounded mb-4"
      >
        {venue ? 'Edit' : 'Add'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm border border-stroke bg-white shadow-default w-full max-w-md lg:max-w-xl overflow-y-auto transform translate-x-30"
          >
            <div className="border-b py-4 px-6.5">
              <h3 className="font-medium text-black"> {venue ? 'Edit' : 'Add'} </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 gap-x-6">
                <div>
                  <label className="block font-semibold mb-1">Non Sitting Ticket</label>

                  {nonSittingTicketsType.map((ticket, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={ticket.name}
                        placeholder="Ticket Name"
                        onChange={(e) =>
                          setNonSittingTicketsType(
                            nonSittingTicketsType.map((t, i) =>
                              i === index ? { ...t, name: e.target.value } : t
                            )
                          )
                        }
                        className="w-full border rounded p-2"
                        required
                      />
                      <input
                        type="number"
                        value={ticket.price === 0 ? '' : ticket.price}
                        placeholder="Price"
                        min={0}
                        onChange={(e) =>
                          setNonSittingTicketsType(
                            nonSittingTicketsType.map((t, i) =>
                              i === index ? { ...t, price: parseInt(e.target.value) } : t
                            )
                          )
                        }
                        className="w-full border rounded p-2"
                        required
                      />
                      <input
                        type="number"
                        value={ticket.ticketCount === 0 ? '' : ticket.ticketCount}
                        placeholder="Total Ticket"
                        min={0}
                        onChange={(e) =>
                          setNonSittingTicketsType(
                            nonSittingTicketsType.map((t, i) =>
                              i === index
                                ? {
                                    ...t,
                                    ticketCount: parseInt(e.target.value),
                                    availableTicketCount: parseInt(e.target.value),
                                  }
                                : t
                            )
                          )
                        }
                        className="w-full border rounded p-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNonSittingTicketsType(
                            nonSittingTicketsType.filter((_, i) => i !== index)
                          )
                        }
                        className="px-4 py-2 bg-red-500 text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddNonSitting}
                    className="text-blue-500"
                  >
                    + Add Ticket
                  </button>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-white"
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

export default VenueForm;
