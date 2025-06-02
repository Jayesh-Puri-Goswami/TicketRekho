import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

interface ManagerFormData {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}

interface ModalformProps {
  onSubmitSuccess?: (data: any) => void;
}

const CreateEmployeeModal: React.FC<ModalformProps> = ({ onSubmitSuccess }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  // const [managers, setManagers] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const handleOpen = () => {
    setOpen((cur) => !cur);

    if (open) {
      reset();
      setSelectedImage(null);
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
    formState: { errors },
  } = useForm<ManagerFormData>(); // Use the SellerFormData type

  // const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setSelectedImage(e.target.files[0]); // Set the uploaded image
  //   }
  // };

  const onSubmit = async (data: ManagerFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email); // Ensure this is being appended
    formData.append('password', data.password);
    formData.append('role', data.role);
    formData.append('active', data.active.toString());

    if (selectedImage) {
      formData.append('profileImage', selectedImage);
    }

    try {
      const response = await axios.post(urls.createEmployee, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('API Response:', response.data);
      setSuccess(true);
      setOpen(false); // Close modal after successful submission
      reset();
      toast.success(
        'Employee created successfully! The new Employee is now part of your team.',
      );
      setTimeout(() => setSuccess(false), 5000);
      setSelectedImage(null);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      toast.error(
        'Oops! There was an error creating the Employee. Please try again later.',
      );
      setError(
        err.response?.data?.message ||
          'Failed to create Employee. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // // Handle image selection
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setSelectedImage(file);
  //   }
  // };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 rounded mb-4"
      >
        Add
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
          <div
            onClick={stopPropagation}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 w-full max-w-3xl space-y-4 max-h-[85vh] overflow-y-scroll transform translate-x-30 translate-y-10"
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Create Employee
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Name
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="text"
                    placeholder="Full Name"
                    {...register('name', 
                      { required: true,
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                        maxLength: { value: 30, message: "Name must be at most 30 characters" },
                        pattern: {
                          value: /^[A-Za-z\s'-]+$/,
                          message: "Invalid name format",
                        }
                     })}
                  />
                  {errors.name && (
                    <span className="text-red-500">Name is required</span>
                  )}
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Phone Number"
                    {...register('phoneNumber', {
                      required: true,
                      minLength: { value: 6, message: "Minimum 6 digits required" },
                      maxLength: { value: 12, message: "Maximum 12 digits allowed" },
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      }
                    })}
                  />
                  {errors.phoneNumber && (
                    <span className="text-red-500">
                      Phone number is required
                    </span>
                  )}
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Email"
                    {...register('email', {
                      required: true,
                      pattern: /^\S+@\S+$/i,
                    })}
                  />
                  {errors.email && (
                    <span className="text-red-500">
                      Valid email is required
                    </span>
                  )}
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Password"
                    {...register('password', {
                      required: true,
                      minLength: 7,
                      maxLength: 12,
                    })}
                  />
                  {errors.password && (
                    <span className="text-red-500">Password is required</span>
                  )}
                </div>
         
                {/* Manager Dropdown */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Roles
                  </label>
                  <select
                    className=" w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary "
                    {...register('role', { required: true })}
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    <option value="theatreEmployee">Theatre Employee</option>
                    <option value="eventEmployee">Event Employee</option>
                    
                  </select>

                  {errors.role && (
                    <span className="text-red-500">Manager is required</span>
                  )}
                </div>

                 {/* Status Dropdown */}
                 <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Account Status
                  </label>
                  <select
                    className=" w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary "
                    {...register('active', { required: true })}
                  >
                    <option value="" disabled>
                      Select a status
                    </option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                    {/* {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name}
                      </option>
                    ))} */}
                  </select>

                  {errors.active && (
                    <span className="text-red-500">Status is required</span>
                  )}
                </div>


                <button
                  type="button"
                  className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90 mb-2"
                  onClick={handleOpen}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">
                    Employee created successfully!
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

export default CreateEmployeeModal;
