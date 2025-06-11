import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, DollarSign, Percent, Calendar, Film } from 'lucide-react';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import url from '../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

interface ValidationErrors {
  eventCharges?: string;
  movieCharges?: string;
}

const Commission: React.FC = () => {
  const { id } = useParams();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [eventCharges, setEventCharges] = useState("");
  const [movieCharges, setMovieCharges] = useState("");
  const [commissionType, setCommissionType] = useState("percentage");
  const [touched, setTouched] = useState({ eventCharges: false, movieCharges: false });

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await axios.get(`${url.getCommissionCharges}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (response.data.data.length > 0) {
          const firstRecord = response.data.data[0];
          setEventCharges(firstRecord.eventCharges);
          setMovieCharges(firstRecord.movieCharges);
          setCommissionType(firstRecord.commissionType || "percentage");
        }
      } catch (error) {
        console.error('Error fetching commission:', error);
        toast.error('Failed to load commission data');
      }
    };
    fetchCommission();
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    if (!value.trim()) {
      return `${name === 'eventCharges' ? 'Event' : 'Theatre'} commission is required`;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return 'Please enter a valid positive number';
    }
    
    if (commissionType === 'percentage' && numValue > 100) {
      return 'Percentage cannot exceed 100%';
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const eventError = validateField('eventCharges', eventCharges);
    const movieError = validateField('movieCharges', movieCharges);
    
    if (eventError) newErrors.eventCharges = eventError;
    if (movieError) newErrors.movieCharges = movieError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: 'eventCharges' | 'movieCharges', value: string) => {
    if (field === 'eventCharges') {
      setEventCharges(value);
    } else {
      setMovieCharges(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: 'eventCharges' | 'movieCharges') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'eventCharges' ? eventCharges : movieCharges;
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // if (!validateForm()) {
    //   setTouched({ eventCharges: true, movieCharges: true });
    //   return;
    // }

    const formData = {
      commissionType,
      movieCharges: parseFloat(movieCharges).toString(),
      eventCharges: parseFloat(eventCharges).toString()
    };

    setLoading(true);
    setIsSuccess(false);

    try {
      const response = await axios.post(url.createorUpdateCommissionCharges, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      setIsSuccess(true);
      toast.success(response.data.message || 'Commission updated successfully!');
      
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update commission. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Commission" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Commission Settings
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Configure event and theatre commission rates
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Commission Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Commission Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'percentage', label: 'Percentage', icon: Percent },
                    { value: 'flat', label: 'Flat Rate', icon: DollarSign }
                  ].map(({ value, label, icon: Icon }) => (
                    <motion.label
                      key={value}
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative  md:flex md:flex-row  items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        commissionType === value
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={commissionType === value}
                        onChange={() => setCommissionType(value)}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                        commissionType === value
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-medium ${
                          commissionType === value ? 'text-indigo-700' : 'text-gray-700'
                        }`}>
                          {label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {value === 'percentage' ? 'Commission as %' : 'Fixed amount'}
                        </div>
                      </div>
                      {commissionType === value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        </motion.div>
                      )}
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Commission Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Commission */}
                <motion.div variants={inputVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>Event Commission</span>
                    </div>
                  </label>
                  <div className="relative">
                    <motion.input
                      whileFocus="focus"
                      // whileBlur="blur"
                      type="number"
                      step="0.01"
                      min="0"
                      max={commissionType === 'percentage' ? '100' : undefined}
                      placeholder={`Enter amount ${commissionType === 'percentage' ? '(%)' : '($)'}`}
                      value={eventCharges}
                      onChange={(e) => handleFieldChange('eventCharges', e.target.value)}
                      onBlur={() => handleFieldBlur('eventCharges')}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                        errors.eventCharges && touched.eventCharges
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-indigo-500'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {commissionType === 'percentage' ? (
                        <Percent className="w-4 h-4 text-gray-400" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {errors.eventCharges && touched.eventCharges && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center mt-2 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.eventCharges}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Theatre Commission */}
                <motion.div variants={inputVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Film className="w-4 h-4 text-purple-500" />
                      <span>Theatre Commission</span>
                    </div>
                  </label>
                  <div className="relative">
                    <motion.input
                      whileFocus="focus"
                      // whileBlur="blur"
                      type="number"
                      step="0.01"
                      min="0"
                      max={commissionType === 'percentage' ? '100' : undefined}
                      placeholder={`Enter amount ${commissionType === 'percentage' ? '(%)' : '($)'}`}
                      value={movieCharges}
                      onChange={(e) => handleFieldChange('movieCharges', e.target.value)}
                      onBlur={() => handleFieldBlur('movieCharges')}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                        errors.movieCharges && touched.movieCharges
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-purple-500'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {commissionType === 'percentage' ? (
                        <Percent className="w-4 h-4 text-gray-400" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {errors.movieCharges && touched.movieCharges && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center mt-2 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.movieCharges}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isSuccess
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating Commission...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Commission Updated!</span>
                      </>
                    ) : (
                      <span>Update Commission Settings</span>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Commission;