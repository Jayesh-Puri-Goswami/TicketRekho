

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // To get the URL params
import toast from 'react-hot-toast';
import urls from '../../networking/app_urls';

interface ScreenFormData {
  theatre: string;
  name: string;
  seatingCapacity: number;
  screenType: string;
  isActive: boolean;
}

interface ModalformProps {
  onSubmitSuccess?: (data: any) => void;
}

const AddScreenModal: React.FC<ModalformProps> = ({ onSubmitSuccess }) => {
  const { id } = useParams<{ id: string }>(); // Get the theatre from the URL
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const handleOpen = () => {
    setOpen((cur) => !cur);

    if (open) {
      reset();
      setError(null); // Clear error message
      setSuccess(false); // Clear success message
      setLoading(false); // Reset loading state
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScreenFormData>();

  // Pre-fill the theatre field if it's available in the URL
  useEffect(() => {
    if (id) {
      setValue('theatre', id);
    }
  }, [id, setValue]);


  const onSubmit = async (data: ScreenFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`${urls.addScreen}`, data, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      setSuccess(true);
      setOpen(false); // Close modal after successful submission
      reset();
      toast.success(
        'Screen added successfully! Your new screen is now available.',
      );
      setTimeout(() => setSuccess(false), 5000);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      toast.error(
        err.response?.data?.message
      );
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-indigo-purple hover:bg-indigo-purple-dark text-white px-7 h-[2.7rem] rounded"
      >
        Add
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
          <div
            onClick={stopPropagation}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl overflow-y-auto transform translate-x-30 translate-y-10"
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Add Screen
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {/* Theatre */}
                {/* <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Theatre
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="text"
                    placeholder="Theatre ID"
                    {...register('theatre', { required: true })}
                    disabled
                  />
                  {errors.theatre && (
                    <span className="text-red-500">Theatre is required</span>
                  )}
                </div> */}
                 <div className="mb-4.5 hidden">
                   <input
                    type="hidden"
                    value={id || ''}
                    {...register('theatre', { required: true })}
                  />
                </div>

                {/* Screen Name */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Screen Name
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="text"
                    placeholder="Screen name"
                    {...register('name', { required: true })}
                  />
                  {errors.name && (
                    <span className="text-red-500">
                      Screen name is required
                    </span>
                  )}
                </div>

                {/* Seating Capacity */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Seating Capacity
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="number"
                    min={0}
                    placeholder="Seating capacity"
                    {...register('seatingCapacity', { required: true })}
                  />
                  {errors.seatingCapacity && (
                    <span className="text-red-500">
                      Seating capacity is required
                    </span>
                  )}
                </div>

                {/* Screen Type */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Screen Type
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('screenType', { required: true })}
                  >
                    <option value="" disabled>
                      Select screen type
                    </option>
                    <option value="Standard">Standard</option>
                    <option value="IMAX">IMAX</option>
                    <option value="3D">3D</option>
                    <option value="4D">4D</option>
                  </select>
                  {errors.screenType && (
                    <span className="text-red-500">
                      Screen type is required
                    </span>
                  )}
                </div>

                {/* Is Operational */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Status
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('isActive', { required: true })}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {errors.isActive && (
                    <span className="text-red-500">
                       status is required
                    </span>
                  )}
                </div>

                {/* Cancel Button */}
                <button
                  type="button"
                  className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90 mb-2"
                  onClick={handleOpen}
                >
                  Cancel
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">Screen added successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddScreenModal;


// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom'; // To get the URL params
// import toast from 'react-hot-toast';
// import urls from '../../networking/app_urls';

// interface ScreenFormData {
//   theatre: string;
//   name: string;
//   seatingCapacity: number;
//   screenType: string;
//   isOperational: boolean;
// }

// interface ModalformProps {
//   onSubmitSuccess?: (data: any) => void;
// }

// const AddScreenModal: React.FC<ModalformProps> = ({ onSubmitSuccess }) => {
//   const { theatre } = useParams<{ theatre: string }>(); // Get the theatre from the URL
//   const [open, setOpen] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<boolean>(false);

//   const currentUser = useSelector((state: any) => state.user.currentUser?.data);

//   const handleOpen = () => {
//     setOpen((cur) => !cur);

//     if (open) {
//       reset();
//       setError(null); // Clear error message
//       setSuccess(false); // Clear success message
//       setLoading(false); // Reset loading state
//     }
//   };

//   const stopPropagation = (e: React.MouseEvent) => {
//     e.stopPropagation();
//   };

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm<ScreenFormData>();

//   // Pre-fill the theatre field if it's available in the URL
//   useEffect(() => {
//     if (theatre) {
//       setValue('theatre', theatre);
//     }
//   }, [theatre, setValue]);

//   const onSubmit = async (data: ScreenFormData) => {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     // Remove the theatre field from the form submission
//     // const formData = { ...data };
//     // delete formData.theatre; // Remove theatre from the posted data

//     const { theatre, ...formData } = data;

//     try {
//       const response = await axios.post(`${urls.addScreen}`, formData, {
//         headers: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });
//       setSuccess(true);
//       setOpen(false); // Close modal after successful submission
//       reset();
//       toast.success(
//         'Screen added successfully! Your new screen is now available.',
//       );
//       setTimeout(() => setSuccess(false), 5000);
//       if (onSubmitSuccess) {
//         onSubmitSuccess(response.data);
//       }
//     } catch (err: any) {
//       console.error('API Error:', err.response?.data || err.message);
//       toast.error(
//         'Oops! Something went wrong while adding the screen. Please try again later.',
//       );
//       setError(err.response?.data?.message || 'An error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={handleOpen}
//         className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 rounded mb-4"
//       >
//         Add
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
//           <div
//             onClick={stopPropagation}
//             className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl overflow-y-auto"
//           >
//             <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
//               <h3 className="font-medium text-black dark:text-white">
//                 Add Screen
//               </h3>
//             </div>
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                 {/* Theatre (Hidden or Disabled) */}
//                 <div className="mb-4.5">
//                   <input
//                     type="hidden"
//                     value={theatre || ''}
//                     {...register('theatre', { required: true })}
//                   />
//                 </div>

//                 {/* Screen Name */}
//                 <div className="mb-4.5">
//                   <label className="mb-2.5 block text-black dark:text-white">
//                     Screen Name
//                   </label>
//                   <input
//                     className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     type="text"
//                     placeholder="Screen name"
//                     {...register('name', { required: true })}
//                   />
//                   {errors.name && (
//                     <span className="text-red-500">
//                       Screen name is required
//                     </span>
//                   )}
//                 </div>

//                 {/* Seating Capacity */}
//                 <div className="mb-4.5">
//                   <label className="mb-2.5 block text-black dark:text-white">
//                     Seating Capacity
//                   </label>
//                   <input
//                     className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     type="number"
//                     placeholder="Seating capacity"
//                     {...register('seatingCapacity', { required: true })}
//                   />
//                   {errors.seatingCapacity && (
//                     <span className="text-red-500">
//                       Seating capacity is required
//                     </span>
//                   )}
//                 </div>

//                 {/* Screen Type */}
//                 <div className="mb-4.5">
//                   <label className="mb-2.5 block text-black dark:text-white">
//                     Screen Type
//                   </label>
//                   <select
//                     className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     {...register('screenType', { required: true })}
//                   >
//                     <option value="" disabled>
//                       Select screen type
//                     </option>
//                     <option value="Standard">Standard</option>
//                     <option value="IMAX">IMAX</option>
//                     <option value="3D">3D</option>
//                     <option value="4D">4D</option>
//                   </select>
//                   {errors.screenType && (
//                     <span className="text-red-500">
//                       Screen type is required
//                     </span>
//                   )}
//                 </div>

//                 {/* Is Operational */}
//                 <div className="mb-4.5">
//                   <label className="mb-2.5 block text-black dark:text-white">
//                     Is Operational
//                   </label>
//                   <select
//                     className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     {...register('isOperational', { required: true })}
//                   >
//                     <option value="" disabled>
//                       Select status
//                     </option>
//                     <option value="true">Yes</option>
//                     <option value="false">No</option>
//                   </select>
//                   {errors.isOperational && (
//                     <span className="text-red-500">
//                       Operational status is required
//                     </span>
//                   )}
//                 </div>

//                 {/* Cancel Button */}
//                 <button
//                   type="button"
//                   className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90 mb-2"
//                   onClick={handleOpen}
//                 >
//                   Cancel
//                 </button>

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
//                   disabled={loading} // Disable button while loading
//                 >
//                   {loading ? 'Creating...' : 'Create'}
//                 </button>

//                 {error && <p className="text-red-500">{error}</p>}
//                 {success && (
//                   <p className="text-green-500">Screen added successfully!</p>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AddScreenModal;
