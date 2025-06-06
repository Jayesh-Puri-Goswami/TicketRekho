"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Tag,
  Percent,
  Calendar,
  FileText,
  DollarSign,
  Target,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import urls from "../networking/app_urls"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

interface Coupon {
  _id: string
  couponId: string
  code: string
  discountType: string
  discountValue: number
  applicableTo: string
  expirationDate: string
  description: string
}

interface ModalformProps {
  coupon?: Coupon | null
  onSubmitSuccess?: (data: Coupon) => void
  onCancel?: () => void
  show?: boolean
}

const CouponForm: React.FC<ModalformProps> = ({ coupon, onSubmitSuccess, onCancel, show }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  const clearFormState = () => {
    reset()
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  const handleOpen = () => {
    if (open) {
      clearFormState()
      setOpen(true)
    } else {
      if (!coupon) {
        reset({
          code: "",
          discountType: "",
        })
      }
      setOpen(true)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()  

  useEffect(() => {
    if (coupon) {
      const formattedDate = new Date(coupon.expirationDate).toISOString().split("T")[0];
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        applicableTo: coupon.applicableTo,
        expirationDate: formattedDate,
        description: coupon.description,
      })
      setOpen(true)
    }
  }, [coupon, reset])

  

  useEffect(() => {
    if (show) {
      handleOpen()
    } else {
      clearFormState()
      setOpen(false)
    }
  }, [show])

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        applicableTo: data.applicableTo,
        expirationDate: data.expirationDate,
        description: data.description,
        couponId: "",
      }

      const requestUrl = coupon ? urls.updateCouponUrl : urls.createCouponUrl
      if (coupon) formData.couponId = coupon._id

      const response = await axios.post(requestUrl, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      })

      setSuccess(true)
      clearFormState()
      setOpen(false)

      if (onSubmitSuccess) {
        toast.success(response.data.message,{
        className : 'z-[99999]'
      })
        onSubmitSuccess(response.data)
      }
    } catch (err) {
      setError(coupon ? "Failed to update coupon. Please try again." : "Failed to create coupon. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    clearFormState()
    if (onCancel) {
      onCancel()
    }
    setOpen(false)
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  }



  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="relative px-8 py-6 bg-indigo-purple text-white rounded-t-xl">
                <motion.button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{coupon ? "Edit Coupon" : "Create New Coupon"}</h2>
                    <p className="text-white/80 text-sm">
                      {coupon ? "Update coupon details" : "Add a new discount coupon"}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Form */}
              <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coupon Code */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Tag size={16} className="text-indigo-500" />
                        Coupon Code
                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                          {...register("code", { required: "Coupon code is required" })}
                        />
                      </motion.div>
                      {errors.code && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.code.message as string}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Discount Type */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Percent size={16} className="text-indigo-500" />
                        Discount Type
                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <select
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          {...register("discountType", { required: "Discount type is required" })}
                        >
                          <option value="" disabled>
                            Select discount type
                          </option>
                          <option value="flat">💰 Flat Amount</option>
                          <option value="percentage">📊 Percentage</option>
                        </select>
                      </motion.div>
                      {errors.discountType && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.discountType.message as string}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Discount Value */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-indigo-500" />
                        Discount Value

                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <input
                          type="number"
                          min={0}
                          placeholder="Enter discount value"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                          {...register("discountValue", {
                            required: "Discount value is required",
                            min: { value: 0, message: "Value must be positive" },
                          })}
                        />
                      </motion.div>
                      {errors.discountValue && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.discountValue.message as string}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Applicable To */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Target size={16} className="text-indigo-500" />
                        Applicable To
                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <select
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          {...register("applicableTo", { required: "Applicable type is required" })}
                        >
                          <option value="" disabled>
                            Select applicable type
                          </option>
                          <option value="event">🎪 Events</option>
                          <option value="movie">🎬 Movies</option>
                          <option value="both">🎯 Both</option>
                        </select>
                      </motion.div>
                      {errors.applicableTo && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.applicableTo.message as string}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Expiration Date */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-indigo-500" />
                        Expiration Date
                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          max={
                            new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0]
                          }
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          {...register("expirationDate", { required: "Expiration date is required" })}
                        />
                      </motion.div>
                      {errors.expirationDate && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.expirationDate.message as string}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-2 lg:col-span-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <FileText size={16} className="text-indigo-500" />
                        Description
                      </label>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <textarea
                          placeholder="Enter coupon description"
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                          {...register("description", { required: "Description is required" })}
                        />
                      </motion.div>
                      {errors.description && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.description.message as string}
                        </motion.p>
                      )}
                    </motion.div>
                  </div>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400"
                      >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400"
                      >
                        <CheckCircle size={20} />
                        <span>Coupon {coupon ? "updated" : "created"} successfully!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 pt-6"
                  >
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          {coupon ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          {coupon ? "Update Coupon" : "Create Coupon"}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CouponForm
