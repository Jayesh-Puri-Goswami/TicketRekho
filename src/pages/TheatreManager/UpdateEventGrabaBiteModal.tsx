import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

interface TheatreFormData {
  _id: string;
  name: string;
  foodType: string;
  grabImage: string;
  description: string;
  status: boolean;
  price: number;
}

interface ModalFormProps {
  theatreData: TheatreFormData | null; // Pass existing data for updates
  onSubmitSuccess?: (data: any) => void;
  onClose?: () => void; // Optional close handler
}

const UpdateEventGrabaBiteModal: React.FC<ModalFormProps> = ({
  theatreData,
  onSubmitSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedImage(file);
      }
    };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TheatreFormData>();

  // Populate form with existing data
  useEffect(() => {
    if (theatreData) {
      Object.keys(theatreData).forEach((key) => {
        setValue(key as keyof TheatreFormData, (theatreData as any)[key]);
      });
    }
  }, [theatreData, setValue]);

const onSubmit = async (data: TheatreFormData) => {
  setLoading(true);
  setError(null);
  setSuccess(false);

  const formData = new FormData();
  formData.append('id',  data._id);
  formData.append('name', data.name);
  formData.append('foodType', data.foodType);
  formData.append('price', data.price.toString());
  formData.append('description', data.description);
  formData.append('status', data.status.toString());
  
  if (selectedImage) {
    formData.append('grabImage', selectedImage);
  }


  try {
    const response = await axios.post(`${urls.updateEventGrabABite}`, formData, {
      headers: {
        Authorization: `Bearer ${currentUser.token}`,
      },
    });

    setSuccess(true);
    toast.success('Grab a Bite updated successfully!');
    if (onSubmitSuccess) {
      onSubmitSuccess(response.data);
    }
    reset();
  } catch (err: any) {
    toast.error('Oops! Something went wrong.');
    setError(err.response?.data?.message || 'An error occurred.');
  } finally {
    setLoading(false);
  }
};


  return (
    

    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
      <div
        onClick={stopPropagation}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl overflow-y-auto transform translate-x-30"
      >
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Update Grab a Bite
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Name */}
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Name
              </label>
              <input
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                type="text"
                placeholder="Theatre name"
                {...register('name', { required: true })}
              />
              {errors.name && (
                <span className="text-red-500">Name is required</span>
              )}
            </div>

            {/* type */}
            <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Type 
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('foodType', { required: true })}
                  >
                    <option value="" disabled>
                      Select foodType
                    </option>
                    <option value="popcorn">Popcorn</option>
                    <option value="snacks">Snacks</option>
                    <option value="combos">Combos</option>
                  </select>
                  {errors.foodType && (
                    <span className="text-red-500">
                      foodType is required
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                   Status
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    {...register('status', { required: true })}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {errors.status && (
                    <span className="text-red-500">
                      Grab-a-bite status is required
                    </span>
                  )}
                </div>

             {/* Price */}
             <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                   Price
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="number"
                    min={0}
                    placeholder="Price"
                    {...register('price', { required: true })}
                  />
                  {errors.price && (
                    <span className="text-red-500">
                     Price is required.
                    </span>
                  )}
                </div>

                 {/* image */}
                 <div className="mb-4.5 md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Image (104 × 123 px)
                  </label>
                  <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                />
                  {error && (
                    <span className="text-red-500">{error}</span>
                  )}
                </div>

             {/* description */}
                  <div className="mb-4.5 md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                   Description
                  </label>
                  <textarea
                   placeholder="Enter description"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                rows={3}
                {...register('description', { required: true })}
              ></textarea>
                  {errors.description && (
                    <span className="text-red-500">
                     Description is required.
                    </span>
                  )}
                </div>

                {/* <div className="mb-4.5">
                </div> */}
            {/* Cancel Button */}
            <button
              type="button"
              className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90 mb-2"
              onClick={onClose}
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>

            {error && <p className="text-red-500">{error}</p>}
            {success && (
              <p className="text-green-500">Grab a bite updated successfully!</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};


export default UpdateEventGrabaBiteModal;
