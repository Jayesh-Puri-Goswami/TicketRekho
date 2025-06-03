import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../networking/app_urls';
import { useSelector } from 'react-redux';

interface SellerFormData {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  city: string;
  pinCode: string;
  address: string;
  managerId: string;
}

interface ModalformProps {
  onSubmitSuccess?: (data: any) => void; 
}

const Sellerform: React.FC<ModalformProps> = ({ onSubmitSuccess })   => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [managers, setManagers] = useState<any[]>([]);
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
  } = useForm<SellerFormData>(); // Use the SellerFormData type

  // Fetch manager list from API
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axios.get(urls.managersUrl, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setManagers(response.data.data.managers);
      } catch (err) {
        console.error('Failed to fetch managers:', err);
      }
    };

    fetchManagers();
  }, [currentUser]);


  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]); // Set the uploaded image
    }
  };

  const onSubmit = async (data: SellerFormData) => {
    // Use the SellerFormData type here
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('city', data.city);
    formData.append('pinCode', data.pinCode);
    formData.append('address', data.address);
    formData.append('managerId', data.managerId);

    if (selectedImage) {
      formData.append('profileImage', selectedImage); // Append image file to form data
    }

    try {
      const response = await axios.post(urls.createSellerUrl, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API Response:', response.data);
      setSuccess(true);
      setOpen(false); // Close modal after successful submission

      reset(); // Reset form fields
      setSelectedImage(null); // Clear selected image
      setError(null); // Clear error message
      setSuccess(false);
      // Call the external onSubmitSuccess callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to create seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // const options = managers.map((manager) => ({
  //   value: manager._id,
  //   label: manager.name,
  // }));

  // const customStyles = {
  //   control: (base: any) => ({
  //     ...base,
  //     backgroundColor: 'transparent',
  //     border: '1.5px solid #E5E7EB', // Matches your border-stroke color
  //     padding: '0.5rem', // Adjust padding if needed
  //     borderRadius: '0.375rem', // 6px (matches Tailwind's rounded class)
  //     boxShadow: 'none',
  //     '&:hover': {
  //       borderColor: '#3B82F6', // Tailwind's primary color on hover
  //     },
  //   }),
  //   menu: (base: any) => ({
  //     ...base,
  //     backgroundColor: 'white',
  //     zIndex: 9999, // Ensure the menu appears above other elements
  //   }),
  //   option: (base: any, state: any) => ({
  //     ...base,
  //     backgroundColor: state.isSelected ? '#3B82F6' : 'white', // Primary color for selected option
  //     color: state.isSelected ? 'white' : 'black',
  //     '&:hover': {
  //       backgroundColor: '#E5E7EB', // Light gray on hover
  //     },
  //   }),
  // };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-blue-500 text-white px-7 rounded hover:bg-blue-600 mb-4"
      >
        Add
      </button>

      {open && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
          <div
            onClick={stopPropagation}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl h-[85vh] overflow-y-auto"
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Create Seller
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {/* Manager Dropdown */}
                <div className="mb-4.5 md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Manager
                  </label>
                  <select
                    className=" w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary "
                    {...register('managerId', { required: true })}
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                 
                 
                  
                  {errors.managerId && (
                    <span className="text-red-500">Manager is required</span>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Name
                  </label>
                  <input
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    type="text"
                    placeholder="Full name"
                    {...register('name', { required: true })}
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
                      minLength: 6,
                      maxLength: 12,
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
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="City"
                    {...register('city', { required: true })}
                  />
                  {errors.city && (
                    <span className="text-red-500">City is required</span>
                  )}
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Pin Code
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Pin code"
                    {...register('pinCode', { required: true })}
                  />
                  {errors.pinCode && (
                    <span className="text-red-500">Pin code is required</span>
                  )}
                </div>
                <div className="mb-4.5 ">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Address"
                    {...register('address', { required: true })}
                  />
                  {errors.address && (
                    <span className="text-red-500">Address is required</span>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Upload Profile Image
                  </label>
                  <input
                    type="file"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
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
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">Seller created successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sellerform;
