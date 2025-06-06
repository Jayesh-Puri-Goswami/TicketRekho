// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   X,
//   Phone,
//   Mail,
//   MapPin,
//   Building,
//   Calendar,
//   User,
//   Loader2,
//   Save,
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import Urls from '../../networking/app_urls';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import FormField from '../Utils/FormField';
// import { useForm, Controller } from 'react-hook-form';
// import clsx from 'clsx';
// import { da } from 'date-fns/locale';

// interface Manager {
//   _id: string;
//   name: string;
//   phoneNumber: string;
//   email: string;
//   profileImage: string | null;
//   address: string;
//   state: string;
//   city: string;
//   role: string;
//   active: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface FormData {
//   name: string;
//   email: string;
//   phoneNumber: string;
//   role: string;
//   active: boolean;
// }

// interface ViewManagerProfileProps {
//   isOpen: boolean;
//   managerId: string | null;
//   onClose: () => void;
//   onUpdate: (updatedManager: Manager) => void;
// }

// const ViewManagerProfile: React.FC<ViewManagerProfileProps> = ({
//   isOpen,
//   managerId,
//   onClose,
//   onUpdate,
// }) => {
//   const [manager, setManager] = useState<Manager | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const currentUser = useSelector((state: any) => state.user.currentUser.data);

//   const { control, handleSubmit, reset, formState: { isDirty } } = useForm<FormData>({
//     defaultValues: {
//       name: '',
//       email: '',
//       phoneNumber: '',
//       role: '',
//       state: '',
//       active: false,
//     },
//   });

//   useEffect(() => {
//     const fetchManagerDetails = async () => {
//       if (!isOpen || !managerId) return;

//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get(`${Urls.getManagerDetails}/${managerId}`, {
//           headers: {
//             Authorization: `Bearer ${currentUser.token}`,
//           },
//         });
//         const managerData = response.data.data;
//         setManager(managerData);
//         reset({
//           name: managerData.name,
//           email: managerData.email,
//           phoneNumber: managerData.phoneNumber,
//           role: managerData.role,
//           active: managerData.active,
//         });
//       } catch (error) {
//         console.error('Error fetching manager details:', error);
//         setError('Failed to fetch manager details');
//         setManager(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchManagerDetails();
//   }, [isOpen, managerId, reset, currentUser.token]);

//   const onSubmit = async (data: FormData) => {
//     if (!manager) return;

//     try {
//       setIsUpdating(true);
//       const response = await axios.post(Urls.editMangerProfile, {
//         id: manager._id,
//         name: data.name,
//         email: data.email,
//         phoneNumber: data.phoneNumber,
//         role: data.role,
//         state: data.state,
//         active: data.active,
//       }, {
//         headers: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });

//       const updatedManager = {
//         ...manager,
//         ...response.data.data,
//       };
//       setManager(updatedManager);
//       onUpdate(updatedManager);
//       reset(data);
//     } catch (error) {
//       console.error('Error updating manager details:', error);
//       setError('Failed to update manager details');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const modalVariants = {
//     hidden: {
//       opacity: 0,
//       y: 20,
//       scale: 0.95,
//     },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: {
//         type: 'spring',
//         damping: 25,
//         stiffness: 300,
//       },
//     },
//     exit: {
//       opacity: 0,
//       y: 20,
//       scale: 0.95,
//       transition: {
//         duration: 0.2,
//       },
//     },
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
//           onClick={onClose}
//         >
//           <motion.div
//             className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           >
//             {/* Header */}
//             <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-500">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={onClose}
//                 className="absolute top-4 right-4 text-white hover:text-slate-200"
//               >
//                 <X size={24} />
//               </motion.button>
//             </div>

//             {loading ? (
//               <div className="h-64 flex items-center justify-center">
//                 <Loader2 className="animate-spin text-purple-500" size={40} />
//               </div>
//             ) : error ? (
//               <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
//                 <div className="text-red-500 mb-4">⚠️ Error</div>
//                 <div className="text-slate-600">{error}</div>
//               </div>
//             ) : manager ? (
//               <>
//                 {/* Profile Image */}
//                 <div className="relative px-6">
//                   <div className="absolute -top-16 left-6">
//                     <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
//                       {manager.profileImage ? (
//                         <img
//                           src={manager.profileImage}
//                           alt={manager.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             e.currentTarget.src =
//                               '../../../public/Image/Fallback Image/default-fallback-image.png';
//                           }}
//                         />
//                       ) : (
//                         <div className="w-full h-full bg-slate-100 flex items-center justify-center">
//                           <User size={40} className="text-slate-400" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <form onSubmit={handleSubmit(onSubmit)} className="px-6 pt-20 pb-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <Controller
//                         name="name"
//                         control={control}
//                         rules={{ required: 'Name is required' }}
//                         render={({ field, fieldState: { error } }) => (
//                           <FormField label="Name" name="name" error={error}>
//                             <input
//                               {...field}
//                               type="text"
//                               className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                             />
//                           </FormField>
//                         )}
//                       />
//                     </div>
//                     <Controller
//                       name="active"
//                       control={control}
//                       render={({ field }) => (
//                         <label className="flex items-center gap-2">
//                           <input
//                             type="checkbox"
//                             checked={field.value}
//                             onChange={(e) => field.onChange(e.target.checked)}
//                             className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
//                           />
//                           <span className={clsx(
//                             'px-3 py-1 rounded-full text-sm font-medium',
//                             field.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                           )}>
//                             {field.value ? 'Active' : 'Inactive'}
//                           </span>
//                         </label>
//                       )}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       <Controller
//                         name="phoneNumber"
//                         control={control}
//                         rules={{ required: 'Phone number is required' }}
//                         render={({ field, fieldState: { error } }) => (
//                           <FormField label="Phone Number" name="phoneNumber" error={error}>
//                             <div className="flex items-center gap-2">
//                               <Phone size={18} className="text-slate-400" />
//                               <input
//                                 {...field}
//                                 type="text"
//                                 className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                               />
//                               </div>
//                             </FormField>
//                           )}
//                         />
                      
//                       <Controller
//                         name="email"
//                         control={control}
//                         rules={{
//                           required: 'Email is required',
//                           pattern: {
//                             value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//                             message: 'Invalid email address',
//                           },
//                         }}
//                         render={({ field, fieldState: { error } }) => (
//                           <FormField label="Email" name="email" error={error}>
//                             <div className="flex items-center gap-2">
//                               <Mail size={18} className="text-slate-400" />
//                               <input
//                                 {...field}
//                                 type="email"
//                                 className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                               />
//                               </div>
//                             </FormField>
//                           )}
                        
//                       />
//                       <div className="flex items-start gap-2 text-slate-600">
//                         <MapPin size={18} className="text-slate-400 mt-1 flex-shrink-0" />
//                         <span>{manager.address || 'N/A'}</span>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div className="flex items-center gap-2 text-slate-600">
//                         <Building size={18} className="text-slate-400" />
//                         <span>{manager.city || 'N/A'}, {manager.state || 'N/A'}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-slate-600">
//                         <Calendar size={18} className="text-slate-400" />
//                         <span>
//                           Joined{' '}
//                           {formatDistanceToNow(new Date(manager.createdAt), {
//                             addSuffix: true,
//                           })}
//                         </span>
//                       </div>
//                       <Controller
//                         name="role"
//                         control={control}
//                         rules={{ required: 'Role is required' }}
//                         render={({ field, fieldState: { error } }) => (
//                           <FormField label="Role" name="role" error={error}>
//                             <select
//                               {...field}
//                               className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//                             >
//                               <option value="theatreManager">Theatre Manager</option>
//                               <option value="theatreEmployee">Theatre Employee</option>
//                               <option value="eventManager">Event Manager</option>
//                               <option value="eventEmployee">Event Employee</option>
//                             </select>
//                           </FormField>
//                         )}
//                       />
//                     </div>
//                   </div>

//                   <motion.button
//                     type="submit"
//                     disabled={!isDirty || isUpdating}   
//                     whileHover={{ scale: isDirty && !isUpdating ? 1.05 : 1 }}
//                     whileTap={{ scale: isDirty && !isUpdating ? 0.95 : 1 }}
//                     className={clsx(
//                       'mt-6 w-full py-2 rounded-lg font-medium flex items-center justify-center',
//                       isDirty && !isUpdating
//                         ? 'bg-indigo-600 text-white'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     )}
//                   >
//                     {isUpdating ? (
//                       <Loader2 className="animate-spin mr-2" size={16} />
//                     ) : (
//                       <Save size={16} className="mr-2" />
//                     )}
//                     {isUpdating ? 'Updating...' : 'Update Profile'}
//                   </motion.button>
//                 </form>
//               </>
//             ) : (
//               <div className="h-64 flex items-center justify-center text-slate-600">
//                 No manager data available
//               </div>
//             )}
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ViewManagerProfile;
















"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Phone, MapPin, Building, Home, Banknote, Map, CheckCircle, XCircle, Eye } from "lucide-react"
import type { Manager } from "../../types/manager"
import clsx from "clsx"
import axios from "axios"
import app_urls from "../../networking/app_urls"
import { useSelector, useDispatch } from "react-redux"
import { editManagerStart, editManagerSuccess, editManagerFailure } from "../../redux/manager/managerSlice"

interface State {
  _id: string
  name: string
}

interface City {
  _id: string
  name: string
}

interface ViewManagerModalProps {
  isOpen: boolean
  manager: Manager | null
  onClose: () => void
}

const ViewManagerModal: React.FC<ViewManagerModalProps> = ({ isOpen, manager, onClose }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  const fetchStates = async () => {
    try {
      const response = await axios.get(app_urls.getStates, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      if (response.data.status && Array.isArray(response.data.data)) {
        setStates(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchCities = async (stateId: string) => {
    try {
      const response = await axios.post(
        app_urls.getCitiesByState,
        { state: stateId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      if (response.data.status && Array.isArray(response.data.data)) {
        setCities(response.data.data)
      } else {
        setCities([])
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
      setCities([])
    }
  }

  useEffect(() => {
    if (isOpen && manager) {
      fetchStates()

      // Fetch cities if state is available
      const stateId = typeof manager.stateId === "object" ? manager.stateId._id : manager.stateId
      if (stateId) {
        fetchCities(stateId)
      }

      setErrorMessage(null)
    }
  }, [isOpen, manager])

  const getLocationText = () => {
    if (!manager) return "N/A"

    let location = ""
    if (typeof manager.cityId === "object" && manager.cityId?.name) {
      location = manager.cityId.name
    }
    if (typeof manager.stateId === "object" && manager.stateId?.name) {
      location += location ? `, ${manager.stateId.name}` : manager.stateId.name
    }
    if (!location && manager.address) {
      location = manager.address
    }
    return location || "N/A"
  }

  const handleStatusToggle = async (newStatus: boolean) => {
    if (!manager) return

    setLoading(true)
    setErrorMessage(null)
    dispatch(editManagerStart())

    try {
      const formData = new FormData()
      formData.append("id", manager._id)
      formData.append("active", String(newStatus))

      // Determine API endpoint based on manager role
      const url =
        manager.role === "Theatre Manager" ? app_urls.editTheatreMangerProfile : app_urls.editEventMangerProfile

      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.status) {
        const updatedManager: Manager = {
          ...manager,
          active: newStatus,
        }

        dispatch(editManagerSuccess(updatedManager))
      } else {
        const errorMsg = response.data.message || "Failed to update manager status"
        setErrorMessage(errorMsg)
        dispatch(editManagerFailure(errorMsg))
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while updating the manager status"
      setErrorMessage(message)
      dispatch(editManagerFailure(message))
      console.error("Error updating manager status:", error)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    onClose()
    setErrorMessage(null)
    setCities([])
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

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
        type: "spring",
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
  }

  if (!manager) return null

  const isTheatreManager = manager.role === "Theatre Manager"

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
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={stopPropagation}
            variants={modalVariants}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center">
                <Eye className="mr-2" size={20} />
                View {isTheatreManager ? "Theatre" : "Event"} Manager
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
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 rounded-md text-sm"
                >
                  {errorMessage}
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Personal Information
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {manager.name || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {manager.email || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {manager.phoneNumber || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {getLocationText()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <Home className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white min-h-[80px]">
                          {manager.address || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Current Status
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            manager.active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                          )}
                        >
                          {manager.active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Additional Information
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Bank Account Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Banknote className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {manager.bankAccountNumber || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        IFSC Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Banknote className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {manager.ifscCode || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Theatre Manager Specific Fields */}
                    {isTheatreManager && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Theatre Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Building className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                              {manager.theatreName || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Theatre Location
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Map className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                              {manager.location || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Theatre Status
                          </label>
                          <div
                            className={clsx(
                              "px-3 py-1 rounded-full text-sm font-medium inline-block",
                              manager.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                            )}
                          >
                            {manager.isActive ? "Theatre Active" : "Theatre Inactive"}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Grab A Bite
                          </label>
                          <div
                            className={clsx(
                              "px-3 py-1 rounded-full text-sm font-medium inline-block",
                              manager.isGrabABite
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                            )}
                          >
                            {manager.isGrabABite ? "Enabled" : "Disabled"}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Manager Information
                      </h5>
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <p>
                          <span className="font-medium">Role:</span> {manager.role}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {manager.active ? "Active" : "Inactive"}
                        </p>
                        <p>
                          <span className="font-medium">Joined:</span>{" "}
                          {new Date(manager.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Toggle Buttons - Only show for non-Theatre Managers */}
              {!isTheatreManager && (
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-5">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Manager Status Control
                  </h5>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusToggle(true)}
                      disabled={loading || manager.active}
                      className={clsx(
                        "flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                        manager.active
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
                      )}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      {manager.active ? "Currently Active" : "Activate Manager"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusToggle(false)}
                      disabled={loading || !manager.active}
                      className={clsx(
                        "flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                        !manager.active
                          ? "bg-red-100 text-red-800 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
                      )}
                    >
                      <XCircle size={16} className="mr-2" />
                      {!manager.active ? "Currently Inactive" : "Deactivate Manager"}
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end border-t border-slate-200 dark:border-slate-700 pt-5">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ViewManagerModal
