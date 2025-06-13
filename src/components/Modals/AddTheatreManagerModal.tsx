"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import Urls from "../../networking/app_urls"

interface TheatreManagerFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phoneNumber : string
  profileImage: File | null
  address: string
  active: boolean
  role : string
}

const AddTheaterManagerModal = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const currentUser = useSelector((state: any) => state.user.currentUser.data)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TheatreManagerFormData>({
    defaultValues: {
      active: true,
    },
  })

  const password = watch("password")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("profileImage", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: TheatreManagerFormData) => {
    setLoading(true)
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        formData.append(key, value as any)
      }
    })
    formData.append("role", 'theatreManager' as any)

    try {
      await axios.post(`${Urls.createTheatreManager}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success("Theatre Manager created successfully!")
      closeModal()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Oops! Something went wrong. Please try again later.",
        {
          className: "z-[99999]",
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => setOpen(true)

  const closeModal = () => {
    setOpen(false)
    reset()
    setPreviewImage(null)
  }

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-3 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity"
      >
        Add Theatre Manager
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
                  Add New Theatre Manager
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Profile Image Upload */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {previewImage ? (
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="number"
                        {...register("phoneNumber", {
                          required: "Phone Number is required",
                          minLength: {
                            value: 6,
                            message: "Phone Number must be at least 10 characters",
                          },
                        })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        {...register("confirmPassword", {
                          required: "Confirm Password is required",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        {...register("address", { required: "Address is required" })}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                        rows={3}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("active")}
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
                    {loading ? "Creating..." : "Create Theatre Manager"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AddTheaterManagerModal