import React, { useEffect, useState } from 'react';
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
import toast from 'react-hot-toast';

interface TheaterUserFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  active: boolean;
}

interface ModalProps {
  id: string;
  role: 'theatreManager' | 'theatreEmployee';
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmitSuccess?: (data: any) => void;
  data?: any;
}

const EditTheaterUserModal: React.FC<ModalProps> = ({
  id,
  role,
  isOpen,
  setIsOpen,
  onSubmitSuccess,
  data,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TheaterUserFormData>({
    defaultValues: {
      active: true,
    },
  });

  const setUserData = () => {
    if (data) {
      setValue('name', data.name);
      setValue('email', data.email);
      setValue('phoneNumber', data.phoneNumber);
      setValue('address', data.address || '');
      setValue('active', data.active);
    }
  };

  useEffect(() => {
    if (isOpen && id && data) {
      setUserData();
    }
  }, [isOpen, id, data]);

  const closeModal = () => {
    setIsOpen(false);
    reset();
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onSubmit = async (formData: TheaterUserFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      employeeId: id,
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role,
      active: formData.active,
      ...(formData.password && { password: formData.password }),
      ...(role === 'theatreManager' && { address: formData.address || '' }),
    };

    try {
      const response = await axios.post(
        urls.updateEmployee,
        payload,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      setSuccess(true);
      setIsOpen(false);
      reset();
      toast.success(
        `${
          role === 'theatreManager' ? 'Theatre Manager' : 'Theatre Employee'
        } updated successfully!`,
        {
          className: 'z-[99999]',
        },
      );
      setTimeout(() => setSuccess(false), 5000);
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
                Edit{' '}
                {data?.role === 'theatreManager'
                  ? 'Theatre Manager'
                  : 'Theatre Employee'}
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
                      {data?.role === 'theatreManager'
                        ? 'Theatre Manager'
                        : 'Theatre Employee'}{' '}
                      Information
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
                          placeholder="New Password (leave blank to keep unchanged)"
                          {...register('password', {
                            minLength: {
                              value: 7,
                              message: 'Password must be at least 7 characters',
                            },
                            maxLength: {
                              value: 12,
                              message: 'Password must be at most 12 characters',
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

                    {role === 'theatreManager' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Address
                        </label>
                        <textarea
                          className={clsx(
                            'w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors',
                            errors.address
                              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                              : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                          )}
                          placeholder="Address"
                          rows={3}
                          {...register('address', {
                            required: 'Address is required',
                          })}
                        />
                        {errors.address && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.address.message}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Account Status
                      </label>
                      <label
                        htmlFor="active"
                        className="flex items-center cursor-pointer"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="active"
                            className="sr-only peer"
                            {...register('active')}
                          />
                          <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                          Active
                        </span>
                      </label>
                      {errors.active && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.active.message}
                        </span>
                      )}
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
                      background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
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
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Check className="mr-1.5 h-4 w-4" />
                        Update{' '}
                        {role === 'theatreManager'
                          ? 'Theatre Manager'
                          : 'Theatre Employee'}
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
  );
};

export default EditTheaterUserModal;