import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

interface ManagerFormData {
 _id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  role: string;
  password: string;
  status: boolean;
  createdAt: Date;
}

interface ModalFormProps {
  managerData: ManagerFormData | null;
  onSubmitSuccess?: (updatedData: any) => void;
  onClose: () => void;
}

const EditEmployeeModal: React.FC<ModalFormProps> = ({
  managerData,
  onSubmitSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  console.log("managerData",managerData);

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ManagerFormData>();

  // Populate form with existing data
  useEffect(() => {
    if (managerData) {
      Object.keys(managerData).forEach((key) => {
        setValue(key as keyof ManagerFormData, (managerData as any)[key]);
      });
    }
  }, [managerData, setValue]);

const onSubmit = async (data: ManagerFormData) => {

  console.log("its working");
  
  setLoading(true);
  setError(null);
  setSuccess(false);

  // Normalize role value
  let normalizedRole = '';
  if (data.role.toLowerCase().includes("Event Employee")) {
    normalizedRole = 'eventEmployee';
  } else if (data.role.toLowerCase().includes("Theatre Employee")) {
    normalizedRole = 'theatrEmployee';
  }

  // Map form data to match the desired structure
  const payload = {
    name: data.name, 
    email: data.email,
    phoneNumber: data.phoneNumber, 
    role:normalizedRole,
      password: data.password,
      active: data.status, 
      employeeId: data._id, // Include the _id for updating
  };
  if (data.password && data.password.trim() !== '') {
  payload.password = data.password;
}

  console.log("payload",payload);
  try {
    const response = await axios.post(`${urls.updateEmployee}`, payload, {
      headers: {
        Authorization: `Bearer ${currentUser.token}`,
      },
    });

    setSuccess(true);
    toast.success('Employee updated successfully!');
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
    

    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999">
      <div
        onClick={stopPropagation}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md lg:max-w-3xl overflow-y-auto transform translate-x-30 translate-y-10"
      >
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Update Employee
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
                     // required: true,
                      minLength: 6,
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
                     defaultValue={managerData?.role || ''} // ✅ ensure default selected
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                   <option value="Theatre Employee">Theatre Employee</option>
                  <option value="Event Employee">Event Employee</option>

                    
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
                    {...register('status', { required: true })}
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

                  {errors.status && (
                    <span className="text-red-500">Status is required</span>
                  )}
                </div>


                <button
                  type="button"
                  className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90 mb-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90 mb-2"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">
                    Employee updated successfully!
                  </p>
                )}
              </div>
            </form>

      </div>
    </div>
  );
};


export default EditEmployeeModal;
