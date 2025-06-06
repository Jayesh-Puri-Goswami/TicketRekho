import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  AlertCircleIcon,
} from 'lucide-react';
import clsx from 'clsx';
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormData>();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    reset();
    setSelectedImage(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onSubmit = async (data: ManagerFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
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
      setSuccess(true);
      setIsOpen(false);
      reset();
      toast.success(
        'Employee created successfully! The new Employee is now part of your team.',
        {
          className: 'z-[99999]',
        },
      );
      setTimeout(() => setSuccess(false), 5000);
      setSelectedImage(null);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      let errorMessage = err.response?.data?.message || err.message;
      const rawMessage = err.response?.data?.message || err.message || '';
      let isPhoneDuplicate = false;
      let isEmailDuplicate = false;
      const phoneMatch = rawMessage.match(/phoneNumber"\s*:\s*"([^"]+)"/);
      const emailMatch = rawMessage.match(/email"\s*:\s*"([^"]+)"/);
      if (rawMessage.includes('E11000 duplicate key error')) {
        if (err.keyValue) {
          if (err.keyValue.phoneNumber) {
            isPhoneDuplicate = true;
          }
          if (err.keyValue.email) {
            isEmailDuplicate = true;
          }
        } else {
          if (phoneMatch) {
            isPhoneDuplicate = true;
          }
          if (emailMatch) {
            isEmailDuplicate = true;
          }
        }

        if (isPhoneDuplicate && isEmailDuplicate) {
          errorMessage = 'The phone number and email address already exist.';
        } else if (isPhoneDuplicate) {
          errorMessage =
            'The phone number already exists. Please use a different number.';
        } else if (isEmailDuplicate) {
          errorMessage =
            'The email address already exists. Please use a different email.';
        } else {
          errorMessage = 'A record with a duplicate value already exists.';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      // Set error in UI and show toast
      setError(errorMessage);
      toast.error(errorMessage, {
        className: 'z-[99999]',
      });
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      {/* <Toaster /> */}
      <motion.button
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={openModal}
        className="relative overflow-hidden rounded-md font-medium text-white px-3 h-[2.7rem] "
        style={{
          background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
        }}
      >
        Add
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={stopPropagation}
              variants={modalVariants}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                  Create New Employee
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-x-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        Employee Information
                      </h4>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.name
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="Full Name"
                            {...register('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                              },
                              maxLength: {
                                value: 30,
                                message: 'Name must be at most 30 characters',
                              },
                              pattern: {
                                value: /^[A-Za-z\s'-]+$/,
                                message: 'Invalid name format',
                              },
                            })}
                          />
                        </div>
                        {errors.name && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.name.message}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.email
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="Email"
                            {...register('email', {
                              required: 'Valid email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email format',
                              },
                            })}
                          />
                        </div>
                        {errors.email && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.phoneNumber
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="Phone Number"
                            {...register('phoneNumber', {
                              required: 'Phone number is required',
                              minLength: {
                                value: 6,
                                message: 'Minimum 6 digits required',
                              },
                              maxLength: {
                                value: 12,
                                message: 'Maximum 12 digits allowed',
                              },
                              pattern: {
                                value: /^[0-9]+$/,
                                message: 'Only numbers are allowed',
                              },
                            })}
                          />
                        </div>
                        {errors.phoneNumber && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber.message}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="password"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.password
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="Password"
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 7,
                                message:
                                  'Password must be at least 7 characters',
                              },
                              maxLength: {
                                value: 12,
                                message:
                                  'Password must be at most 12 characters',
                              },
                            })}
                          />
                        </div>
                        {errors.password && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Role
                          </label>
                          <select
                            className={clsx(
                              'w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors appearance-none bg-white dark:bg-slate-700',
                              errors.role
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:text-white',
                            )}
                            {...register('role', {
                              required: 'Role is required',
                            })}
                          >
                            <option value="" disabled>
                              Select a role
                            </option>
                            {/* <option value="theatreEmployee">
                              Theatre Employee
                            </option>
                            <option value="eventEmployee">
                              Event Employee
                            </option> */}
                            {/* here */}

                            {currentUser?.role?.toLowerCase() ===
                            'theatremanager' ? (
                              <option value="theatreEmployee">
                                Theatre Employee 
                              </option>
                            ) : (
                              <option value="eventEmployee">
                                Event Employee 
                              </option>
                            )}
                          </select>
                          {errors.role && (
                            <span className="text-red-500 text-sm mt-1">
                              {errors.role.message}
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Account Status
                          </label>
                          <div className="flex gap-4 mt-2">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                value="true"
                                {...register('active', {
                                  required: 'Status is required',
                                })}
                              />
                              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                Active
                              </span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                value="false"
                                {...register('active', {
                                  required: 'Status is required',
                                })}
                              />
                              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                Inactive
                              </span>
                            </label>
                          </div>
                          {errors.active && (
                            <span className="text-red-500 text-sm mt-1">
                              {errors.active.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={closeModal}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70"
                      style={{
                        background:
                          'linear-gradient(to right, #6366F1, #8B5CF6)',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-1.5 h-4 w-4" />
                          Create Employee
                        </span>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <AnimatePresence>
        {error && (
          <motion.div
            className="fixed top-10 right-10 bg-red-600/90 text-white px-4 py-3 rounded-md shadow-lg z-[10000]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
};

export default CreateEmployeeModal;
