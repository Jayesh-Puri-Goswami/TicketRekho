import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Check,
  CreditCard,
  Landmark,
  AlertCircleIcon,
} from 'lucide-react';
import type { ManagerFormData } from '../../types/manager';
import FormField from '../Utils/FormField';
import PasswordInput from '../Utils/PasswordInput';
import ImageUploader from '../Utils/ImageUploader';
import clsx from 'clsx';
import axios from 'axios';
import app_urls from '../../networking/app_urls';
import { useSelector, useDispatch } from 'react-redux';
import {
  addManagerStart,
  addManagerSuccess,
  addManagerFailure,
} from '../../redux/manager/managerSlice';
import toast from 'react-hot-toast';

interface State {
  _id: string;
  name: string;
}

interface City {
  _id: string;
  name: string;
}

interface EventOrganizerFormData extends ManagerFormData {
  bankAccountNumber: string;
  ifscCode: string;
  stateId: string;
  cityId: string;
  confirmPassword: string;
}

interface AddEventOrganizerModalProps {
  onSubmitSuccess: (value: boolean) => void;
}

const AddEventOrganizerModal: React.FC<AddEventOrganizerModalProps> = ({ onSubmitSuccess }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<EventOrganizerFormData>({
    defaultValues: {
      role: 'eventOrganizer',
      active: true,
      stateId: '',
      cityId: '',
      bankAccountNumber: '',
      ifscCode: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const parseDuplicateKeyError = (error: string): string => {
    const fieldMatch =
      error.match(/index: (\w+)_1/) ||
      error.match(/Record already exists with this email and role/);
    const field = fieldMatch ? fieldMatch[1] || 'email' : '';
    const fieldMessages: { [key: string]: string } = {
      phoneNumber: 'Phone number already exists.',
      email: 'Email already exists for this role.',
      name: 'Name already exists.',
    };
    const message = fieldMessages[field] || error;
    setError(message);
    return message;
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    reset();
    setSelectedImage(null);
    setSelectedState('');
    setCities([]);
    setError(null);
  };

  const onSubmit = async (data: EventOrganizerFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    dispatch(addManagerStart());

    const formData = new FormData();
    const fields = [
      'email',
      'password',
      'name',
      'phoneNumber',
      'role',
      'stateId',
      'cityId',
      'address',
      'active',
    //   'bankAccountNumber',
    //   'ifscCode',
    ];

    fields.forEach((key) => {
      if (data[key as keyof EventOrganizerFormData] !== undefined) {
        formData.append(key, String(data[key as keyof EventOrganizerFormData]));
      }
    });

    // if (selectedImage) {
    //   formData.append('profileImage', selectedImage);
    // }

    try {
      const response = await axios.post(app_urls.createClient, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        dispatch(addManagerSuccess());
        closeModal();
        toast.success('Event Organizer created successfully!', {
          className: 'z-[99999]',
        });
        onSubmitSuccess(true); // Trigger re-fetch
      } else {
        const errorMsg = response.data.message || 'Failed to create event organizer';
        dispatch(addManagerFailure(errorMsg));
        setError(errorMsg);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error creating event organizer';
      dispatch(addManagerFailure(message));
      parseDuplicateKeyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const fetchStates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(app_urls.getStates, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (response.data.status && Array.isArray(response.data.data)) {
        setStates(response.data.data);
      } else {
        console.error('Invalid states response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (stateId: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        app_urls.getCitiesByState,
        { state: stateId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );
      if (response.data.status && Array.isArray(response.data.data)) {
        setCities(response.data.data);
      } else {
        setCities([]);
        console.error('Invalid cities response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={openModal}
        className="relative overflow-hidden rounded-md py-3 px-6 font-medium text-white bg-indigo-purple"
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
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={stopPropagation}
              variants={modalVariants}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                  Add New Event Organizer
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        Personal Information
                      </h4>

                      <FormField label="Name" name="name" error={errors.name}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.name
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="John Doe"
                            {...register('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                              },
                              maxLength: {
                                value: 50,
                                message: 'Name must be less than 50 characters',
                              },
                            })}
                          />
                        </div>
                      </FormField>

                      <FormField label="Email" name="email" error={errors.email}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.email
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="john.doe@example.com"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                              },
                            })}
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Phone Number"
                        name="phoneNumber"
                        error={errors.phoneNumber}
                      >
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            id="phoneNumber"
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.phoneNumber
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="Enter Phone Number"
                            {...register('phoneNumber', {
                              required: 'Phone number is required',
                              pattern: {
                                value: /^[0-9+\-\s()]*$/,
                                message: 'Invalid phone number format',
                              },
                            })}
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Password"
                        name="password"
                        error={errors.password}
                      >
                        <PasswordInput
                          id="password"
                          placeholder="••••••••"
                          error={errors.password}
                          register={register}
                          validation={{
                            required: 'Password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters',
                            },
                          }}
                        />
                      </FormField>

                      <FormField
                        label="Confirm Password"
                        name="confirmPassword"
                        error={errors.confirmPassword}
                      >
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="••••••••"
                          error={errors.confirmPassword}
                          register={register}
                          validation={{
                            required: 'Confirm password is required',
                            validate: (value) => value === password || 'Passwords do not match',
                          }}
                        />
                      </FormField>

                      <FormField label="Status" name="active" error={errors.active}>
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
                      </FormField>

                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        Location 
                      </h4>

                      <FormField label="State" name="stateId" error={errors.stateId}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPin className="h-4 w-4 text-slate-400" />
                          </div>
                          <Controller
                            name="stateId"
                            control={control}
                            rules={{ required: 'State is required' }}
                            render={({ field }) => (
                              <select
                                className={clsx(
                                  'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors appearance-none bg-white dark:bg-slate-700',
                                  errors.stateId
                                    ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:text-white',
                                )}
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedState(e.target.value);
                                }}
                              >
                                <option value="" disabled>
                                  Select a state
                                </option>
                                {states.map((state) => (
                                  <option key={state._id} value={state._id}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                      </FormField>

                      <FormField label="City" name="cityId" error={errors.cityId}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPin className="h-4 w-4 text-slate-400" />
                          </div>
                          <Controller
                            name="cityId"
                            control={control}
                            rules={{ required: 'City is required' }}
                            render={({ field }) => (
                              <select
                                className={clsx(
                                  'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors appearance-none bg-white dark:bg-slate-700',
                                  errors.cityId
                                    ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:text-white',
                                )}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={!selectedState || cities.length === 0}
                              >
                                <option value="" disabled>
                                  {cities.length === 0 && selectedState ? 'No cities available' : 'Select a city'}
                                </option>
                                {cities.map((city) => (
                                  <option key={city._id} value={city._id}>
                                    {city.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                      </FormField>

                      <FormField label="Address" name="address" error={errors.address}>
                        <div className="relative">
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <Home className="h-4 w-4 text-slate-400" />
                          </div>
                          <textarea
                            id="address"
                            rows={3}
                            className={clsx(
                              'w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
                              errors.address
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20'
                                : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
                            )}
                            placeholder="123 Main St, Apt 4B"
                            {...register('address', {
                              required: 'Address is required',
                            })}
                          />
                        </div>
                      </FormField>

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
                      className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70 bg-indigo-purple"
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
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-1.5 h-4 w-4" />
                          Add Event Organizer
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

      <AnimatePresence>
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
      </AnimatePresence>
    </>
  );
};

export default AddEventOrganizerModal;