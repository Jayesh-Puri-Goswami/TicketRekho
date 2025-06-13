import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  active: boolean;
}

interface CreateEmployeeModalProps {
  onSubmitSuccess?: (data: any) => void;
  role: string;
  buttonText ? : string;
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({ 
  onSubmitSuccess, 
  role ,
  buttonText
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    defaultValues: {
      active: true,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('password', data.password);
    formData.append('role', role);
    formData.append('active', data.active.toString());

    try {
      const response = await axios.post(urls.createEmployee, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Employee created successfully!');
      closeModal();
      
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to create employee. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setOpen(true);

  const closeModal = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity"
      >
        {buttonText ? buttonText : 'Create Employee'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999]"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  Add New Employee
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        maxLength: { value: 30, message: 'Name must be at most 30 characters' },
                        pattern: { value: /^[A-Za-z\s'-]+$/, message: 'Invalid name format' }
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Full Name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Email Address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        minLength: { value: 6, message: 'Minimum 6 digits required' },
                        maxLength: { value: 12, message: 'Maximum 12 digits allowed' },
                        pattern: { value: /^[0-9]+$/, message: 'Only numbers are allowed' },
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Phone Number"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 7, message: 'Password must be at least 7 characters' },
                        maxLength: { value: 12, message: 'Password must be at most 12 characters' },
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register('active')}
                        className="w-5 h-5 rounded text-[#6366F1] focus:ring-[#6366F1]"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Active Status
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateEmployeeModal;