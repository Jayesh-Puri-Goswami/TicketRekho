import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import urls from '../../networking/app_urls';

interface ScreenFormData {
  theatre: string;
  name: string;
  seatingCapacity: number;
  screenType: string;
  isActive: boolean;
  _id: string;
}

interface ModalFormProps {
  screenData: ScreenFormData | null; // Pass existing data for updates
  onSubmitSuccess?: (data: any) => void;
  onClose?: () => void; // Optional close handler
}

const UpdateScreenModal: React.FC<ModalFormProps> = ({
  screenData,
  onSubmitSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>(); // Theatre ID from URL
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScreenFormData>();

  // Populate form with existing data
  useEffect(() => {
    if (screenData) {
      Object.keys(screenData).forEach((key) => {
        setValue(key as keyof ScreenFormData, (screenData as any)[key]);
      });
    }
  }, [screenData, setValue]);

  const onSubmit = async (data: ScreenFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Add theatre ID and map form data
    const payload = {
      screenId: data._id,
      theatre: id, 
      name: data.name,
      seatingCapacity: data.seatingCapacity,
      screenType: data.screenType,
      isActive: data.isActive,
    };

    try {
      const response = await axios.post(`${urls.updateScreen}`, payload, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      setSuccess(true);
      toast.success('Screen updated successfully!');
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

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
      <div
        onClick={stopPropagation}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl overflow-y-auto transform translate-x-30 translate-y-10"
      >
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Update Screen
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Screen Name */}
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Screen Name
              </label>
              <input
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                type="text"
                placeholder="Screen name"
                {...register('name', { required: true })}
              />
              {errors.name && (
                <span className="text-red-500">Name is required</span>
              )}
            </div>

            {/* Seating Capacity */}
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Seating Capacity
              </label>
              <input
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                type="number"
                min={0}
                placeholder="Seating capacity"
                {...register('seatingCapacity', {
                  required: true,
                  valueAsNumber: true,
                })}
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
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                {...register('screenType', { required: true })}
              >
                <option value="" disabled>
                  Select screen type
                </option>
                <option value="Standard">Standard</option>
                <option value="IMAX">IMAX</option>
                <option value="3D">3D</option>
                <option value="4DX">4DX</option>
              </select>
              {errors.screenType && (
                <span className="text-red-500">Screen type is required</span>
              )}
            </div>

            {/* Is Operational */}
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
               Status
              </label>
              <select
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                   Status is required
                </span>
              )}
            </div>

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
              <p className="text-green-500">Screen updated successfully!</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateScreenModal;
