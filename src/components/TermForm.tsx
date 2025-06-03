


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

interface Terms {
  _id: string;
  type: string;
  content: string;
}

interface ModalformProps {
  term?: Terms | null; // Make this consistent
  onSubmitSuccess?: (data: Terms) => void; // Specify the expected type for data
  onCancel?: () => void; // Include the onCancel prop for the cancel action
}

const TermForm: React.FC<ModalformProps> = ({
  term,
  onSubmitSuccess,
  onCancel,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const clearFormState = () => {
    reset();
   // setSelectedImage(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleOpen = () => {
    if (open) {
      clearFormState();
      setOpen(true);
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
    if (term) {
      reset({
        type: term.type,
        content: term.content,
       
      });
     // setSelectedImage(null);
     setOpen(true); // Open modal when a term is passed (edit mode)
    }
  }, [term, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {

      let formData = {
        type:data.type,
        content:data.content,
      }
     
      const requestUrl = term ? urls.createOrUpdateTermPolicy : urls.createOrUpdateTermPolicy;
     // if (term) formData.append('id', term._id);

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
         'Updated terms & conditions.',{
        className : 'z-[99999]'
      }
        );
      }
    } catch (err) {
      setError(
        term
          ? 'Failed to update terms & conditions. Please try again.'
          : 'Failed to create terms & conditions. Please try again.',
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
      {/* <button
        onClick={() => setOpen(true)}
        className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 rounded hover:bg-opacity-90 mb-4"
      >
        Add
      </button> */}

      {/* {open && ( */}
        <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 w-full max-w-3xl space-y-4 max-h-[85vh] overflow-y-scroll transform translate-x-30 translate-y-10"
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {term ? 'Edit' : 'Add'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 gap-x-6">
               
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                     Type
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('type', { required: true })}
                  >
                    <option value="" disabled>
                      Select  Type
                    </option>
                  
                    <option value="event">Event</option>
                    <option value="movie">Movie</option>
                  </select>
                  {errors.type && (
                    <span className="text-red-500">
                       Type is required
                    </span>
                  )}
                </div>



                <div>
              <label className="block font-semibold mb-1">Content</label>
              <textarea
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                rows={3}
              
                {...register('content', { required: true })}
              ></textarea>
               {errors.content && (
                    <span className="text-red-500">Content is required</span>
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
                      ? term
                        ? 'Updating...'
                        : 'Creating...'
                      : term
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">
                    Terms {term ? 'updated' : 'created'} successfully!
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      {/* )} */}
    </>
  );
};

export default TermForm;
