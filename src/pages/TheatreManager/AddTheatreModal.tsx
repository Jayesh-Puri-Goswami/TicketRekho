import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, MapPin, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface TheatreFormData {
  name: string;
  location: string;
  isOperational: boolean;
  isGrabABite: boolean;
  managerId: string;
  employeeIds: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'theatreManager' | 'theatreEmployee';
}

interface AddTheatreModalProps {
  onSubmitSuccess?: (data: any) => void;
}

const AddTheatreModal: React.FC<AddTheatreModalProps> = ({
  onSubmitSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TheatreFormData>({
    defaultValues: {
      isOperational: true,
      isGrabABite: false,
      managerId: '',
      employeeIds: [],
    },
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(urls.getEmployeeListBymanagerId, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (response.data.status && Array.isArray(response.data.data.userList)) {
        setUsers(response.data.data.userList);
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch managers and employees');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Separate managers and employees based on role
  const managers = users.filter((user) => user.role === 'theatreManager');
  const employees = users.filter((user) => user.role === 'theatreEmployee');

  const onSubmit = async (data: TheatreFormData) => {
    setLoading(true);

    const payload = {
      name: data.name,
      location: data.location,
      isOperational: data.isOperational,
      isGrabABite: data.isGrabABite,
      managerId: data.managerId,
      employeeIds: data.employeeIds,
    };

    try {
      const response = await axios.post(urls.addTheatre, payload, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Theatre created successfully!');
      closeModal();

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create theatre. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setOpen(true);
    fetchUsers();
  };

  const closeModal = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity"
      >
        Add Theatre
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
                  Add New Theatre
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
                  {/* Theatre Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="w-4 h-4 inline mr-1" />
                      Theatre Name
                    </label>
                    <input
                      type="text"
                      {...register('name', {
                        required: 'Theatre name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                        maxLength: {
                          value: 50,
                          message: 'Name must be at most 50 characters',
                        },
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Enter theatre name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location', {
                        required: 'Location is required',
                        minLength: {
                          value: 3,
                          message: 'Location must be at least 3 characters',
                        },
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      placeholder="Enter theatre location"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Manager Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      Manager
                    </label>
                    <select
                      {...register('managerId', {
                        required: 'Manager selection is required',
                      })}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers
                          ? 'Loading managers...'
                          : 'Select Manager'}
                      </option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                    {errors.managerId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.managerId.message}
                      </p>
                    )}
                  </div>

                  {/* Employee Selection (Multi-select custom) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Employees
                    </label>

                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
                      {employees.map((employee) => {
                        const isChecked = watch('employeeIds').includes(
                          employee._id,
                        );
                        return (
                          <label
                            key={employee._id}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={employee._id}
                              checked={isChecked}
                              onChange={(e) => {
                                const value = e.target.value;
                                const checked = e.target.checked;
                                const current = watch('employeeIds') || [];
                                const updated = checked
                                  ? [...current, value]
                                  : current.filter((id) => id !== value);
                                setValue('employeeIds', updated, {
                                  shouldValidate: true,
                                });
                              }}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">
                              {employee.name} ({employee.email})
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {errors.employeeIds && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.employeeIds.message}
                      </p>
                    )}
                  </div>

                  {/* Status Toggles */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register('isOperational')}
                        className="w-5 h-5 rounded text-[#6366F1] focus:ring-[#6366F1]"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Theatre is Operational
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register('isGrabABite')}
                        className="w-5 h-5 rounded text-[#6366F1] focus:ring-[#6366F1]"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Grab A Bite Available
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
                    {loading ? 'Creating...' : 'Create Theatre'}
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

export default AddTheatreModal;
