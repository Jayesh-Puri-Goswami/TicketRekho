"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Phone, MapPin, Building, Home, Check, ImageIcon, Banknote, Map } from "lucide-react"
import type { Manager } from "../../types/manager"
import FormField from "../Utils/FormField"
import PasswordInput from "../Utils/PasswordInput"
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

interface EditManagerFormData {
  name: string
  email: string
  password: string
  phoneNumber: string
  cityId: string
  stateId: string
  address: string
  bankAccountNumber: string
  ifscCode: string
  profileImage?: FileList
  active: boolean
  theatreName?: string
  location?: string
  isActive?: boolean
  isGrabABite?: boolean
  role: string
}

interface EditManagerModalProps {
  isOpen: boolean
  manager: Manager | null
  onClose: () => void
}

const EditManagerModal: React.FC<EditManagerModalProps> = ({ isOpen, manager, onClose }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedState, setSelectedState] = useState<string>("")
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditManagerFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      cityId: "",
      stateId: "",
      address: "",
      bankAccountNumber: "",
      ifscCode: "",
      active: true,
      theatreName: "",
      location: "",
      isActive: true,
      isGrabABite: true,
      role: "",
    },
  })

  const selectedRole = watch("role")

  const fetchStates = async () => {
    try {
      const response = await axios.get(app_urls.getStates, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      if (response.data.status && Array.isArray(response.data.data)) {
        setStates(response.data.data)
      } else {
        console.error("Invalid states response:", response.data)
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
        console.error("Invalid cities response:", response.data)
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
      setCities([])
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStates()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState)
    } else {
      setCities([])
    }
  }, [selectedState])

  // Populate form when manager data is available
  useEffect(() => {
    if (manager && isOpen) {
      setValue("name", manager.name || "")
      setValue("email", manager.email || "")
      setValue("password", manager.password || "")
      setValue("phoneNumber", manager.phoneNumber || "")

      // Handle stateId - extract ID if it's an object
      const stateId = typeof manager.stateId === "object" ? manager.stateId._id : manager.stateId
      setValue("stateId", stateId || "")
      setSelectedState(stateId || "")

      // Handle cityId - extract ID if it's an object
      const cityId = typeof manager.cityId === "object" ? manager.cityId._id : manager.cityId
      setValue("cityId", cityId || "")

      setValue("address", manager.address || "")
      setValue("bankAccountNumber", manager.bankAccountNumber || "")
      setValue("ifscCode", manager.ifscCode || "")
      setValue("active", manager.active || false)
      setValue("role", manager.role || "")

      // Set theatre-specific fields only for theatre managers
      if (manager.role === "Theatre Manager") {
        setValue("theatreName", manager.theatreName || "")
        setValue("location", manager.location || "")
        setValue("isActive", manager.isActive || true)
        setValue("isGrabABite", manager.isGrabABite || true)
      }

      setErrorMessage(null)
    }
  }, [manager, isOpen, setValue])

  const closeModal = () => {
    onClose()
    reset()
    setErrorMessage(null)
    setSelectedState("")
    setCities([])
  }

  const onSubmit = async (data: EditManagerFormData) => {
    if (!manager) return

    setLoading(true)
    setErrorMessage(null)
    dispatch(editManagerStart())

    try {
      const formData = new FormData()

      // Common fields for both manager types
      formData.append("id", manager._id)
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("phoneNumber", data.phoneNumber)
      formData.append("role", data.role)
      formData.append("stateId", data.stateId)
      formData.append("cityId", data.cityId)
      formData.append("address", data.address)
      formData.append("active", String(data.active))
      formData.append("bankAccountNumber", data.bankAccountNumber)
      formData.append("ifscCode", data.ifscCode)

      // Add profile image if provided
      if (data.profileImage && data.profileImage[0]) {
        formData.append("profileImage", data.profileImage[0])
      }

      // Add theatre-specific fields only for theatre managers
      if (manager.role === "Theatre Manager") {
        formData.append("theatreName", data.theatreName || "")
        formData.append("location", data.location || "")
        formData.append("isActive", String(data.isActive))
        formData.append("isGrabABite", String(data.isGrabABite))
      }

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
          name: data.name,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          cityId: data.cityId,
          stateId: data.stateId,
          address: data.address,
          bankAccountNumber: data.bankAccountNumber,
          ifscCode: data.ifscCode,
          active: data.active,
          role: data.role,
          ...(manager.role === "Theatre Manager" && {
            theatreName: data.theatreName,
            location: data.location,
            isActive: data.isActive,
            isGrabABite: data.isGrabABite,
          }),
        }

        dispatch(editManagerSuccess(updatedManager))
        closeModal()
      } else {
        const errorMsg = response.data.message || "Failed to update manager profile"
        setErrorMessage(errorMsg)
        dispatch(editManagerFailure(errorMsg))
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while updating the manager profile"
      setErrorMessage(message)
      dispatch(editManagerFailure(message))
      console.error("Error updating manager:", error)
    } finally {
      setLoading(false)
    }
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                Edit {isTheatreManager ? "Theatre" : "Event"} Manager Profile
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
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.name
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="John Doe"
                          {...register("name", {
                            required: "Name is required",
                            minLength: {
                              value: 2,
                              message: "Name must be at least 2 characters",
                            },
                            maxLength: {
                              value: 50,
                              message: "Name must be less than 50 characters",
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
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.email
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="john.doe@example.com"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                      </div>
                    </FormField>

                    <FormField label="Password" name="password" error={errors.password}>
                      <PasswordInput
                        id="password"
                        placeholder="Enter password"
                        error={errors.password}
                        register={register}
                        validation={{
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        }}
                      />
                    </FormField>

                    <FormField label="Phone Number" name="phoneNumber" error={errors.phoneNumber}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.phoneNumber
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="(123) 456-7890"
                          {...register("phoneNumber", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9+\-\s()]*$/,
                              message: "Invalid phone number format",
                            },
                          })}
                        />
                      </div>
                    </FormField>

                    <FormField label="State" name="stateId" error={errors.stateId}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                          id="stateId"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors appearance-none bg-white dark:bg-slate-700",
                            errors.stateId
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:text-white",
                          )}
                          {...register("stateId", {
                            required: "State is required",
                          })}
                          onChange={(e) => {
                            setValue("stateId", e.target.value)
                            setSelectedState(e.target.value)
                            setValue("cityId", "") // Reset city when state changes
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
                      </div>
                    </FormField>

                    <FormField label="City" name="cityId" error={errors.cityId}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Building className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                          id="cityId"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors appearance-none bg-white dark:bg-slate-700",
                            errors.cityId
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:text-white",
                          )}
                          {...register("cityId", {
                            required: "City is required",
                          })}
                          disabled={!selectedState || cities.length === 0}
                        >
                          <option value="" disabled>
                            {cities.length === 0 && selectedState ? "No cities available" : "Select a city"}
                          </option>
                          {cities.map((city) => (
                            <option key={city._id} value={city._id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
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
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.address
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="123 Main St, Apt 4B"
                          {...register("address", {
                            required: "Address is required",
                          })}
                        />
                      </div>
                    </FormField>

                    <FormField label="Active Status" name="active" error={errors.active}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="active"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          {...register("active")}
                        />
                        <label htmlFor="active" className="ml-2 text-sm text-slate-700 dark:text-slate-200">
                          Active
                        </label>
                      </div>
                    </FormField>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                      Additional Information
                    </h4>

                    <FormField label="Profile Image" name="profileImage" error={errors.profileImage}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.profileImage
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          {...register("profileImage")}
                        />
                      </div>
                    </FormField>

                    <FormField label="Bank Account Number" name="bankAccountNumber" error={errors.bankAccountNumber}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Banknote className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          id="bankAccountNumber"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.bankAccountNumber
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="Bank Account Number"
                          {...register("bankAccountNumber", {
                            required: "Bank account number is required",
                          })}
                        />
                      </div>
                    </FormField>

                    <FormField label="IFSC Code" name="ifscCode" error={errors.ifscCode}>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Banknote className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          id="ifscCode"
                          className={clsx(
                            "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                            errors.ifscCode
                              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                          )}
                          placeholder="IFSC Code"
                          {...register("ifscCode", {
                            required: "IFSC code is required",
                          })}
                        />
                      </div>
                    </FormField>

                    {/* Theatre Manager Specific Fields */}
                    {isTheatreManager && (
                      <>
                        <FormField label="Theatre Name" name="theatreName" error={errors.theatreName}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Building className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              id="theatreName"
                              className={clsx(
                                "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                                errors.theatreName
                                  ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                                  : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                              )}
                              placeholder="Theatre Name"
                              {...register("theatreName", {
                                required: isTheatreManager ? "Theatre name is required" : false,
                              })}
                            />
                          </div>
                        </FormField>

                        <FormField label="Location" name="location" error={errors.location}>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Map className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              id="location"
                              className={clsx(
                                "w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                                errors.location
                                  ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
                                  : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
                              )}
                              placeholder="Location"
                              {...register("location", {
                                required: isTheatreManager ? "Location is required" : false,
                              })}
                            />
                          </div>
                        </FormField>

                        <FormField label="Theatre Active" name="isActive" error={errors.isActive}>
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="isActive"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                              {...register("isActive")}
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm text-slate-700 dark:text-slate-200">
                              Theatre Active
                            </label>
                          </div>
                        </FormField>

                        <FormField label="Grab A Bite" name="isGrabABite" error={errors.isGrabABite}>
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="isGrabABite"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                              {...register("isGrabABite")}
                            />
                            <label htmlFor="isGrabABite" className="ml-2 text-sm text-slate-700 dark:text-slate-200">
                              Grab A Bite
                            </label>
                          </div>
                        </FormField>
                      </>
                    )}

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Manager Info
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
                        {isTheatreManager && (
                          <>
                            <p>
                              <span className="font-medium">Theatre:</span> {manager.theatreName || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {manager.location || "N/A"}
                            </p>
                          </>
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
                      background: "linear-gradient(to right, #6366F1, #8B5CF6)",
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
                        Update Manager
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
  )
}

export default EditManagerModal
