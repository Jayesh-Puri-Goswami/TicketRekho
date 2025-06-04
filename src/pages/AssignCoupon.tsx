"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Building2, Ticket, ChevronDown, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import url from "../networking/app_urls"
import app_urls from "../networking/app_urls"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

interface State {
  _id: string
  name: string
}

interface City {
  _id: string
  name: string
  state: string
}

const AssignCoupon: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  // State management
  const [couponCode, setCouponCode] = useState<string>("")
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedStateId, setSelectedStateId] = useState<string>("")
  const [selectedCityId, setSelectedCityId] = useState<string>("")
  const [loadingPage, setLoadingPage] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch coupon details
  const fetchCouponDetail = async () => {
    const couponData = { couponId: id }

    try {
      const response = await axios.post(url.getCouponDetail, couponData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      })
      setCouponCode(response.data.data.code)
    } catch (err) {
      console.error("Error fetching coupon details:", err)
      toast.error("Failed to fetch coupon details")
    }
  }

  // Fetch states
  const fetchStates = async () => {
    setLoadingPage(true)
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
      toast.error("Failed to fetch states")
    } finally {
      setLoadingPage(false)
    }
  }

  // Fetch cities by state
  const fetchCities = async (stateId: string) => {
    setLoadingPage(true)
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
      toast.error("Failed to fetch cities")
    } finally {
      setLoadingPage(false)
    }
  }

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId)
    setSelectedCityId("") // Reset city selection
    setCities([]) // Clear cities
    if (stateId) {
      fetchCities(stateId)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedStateId) {
      setErrorMessage("Please select a state.")
      return
    }

    if (!selectedCityId) {
      setErrorMessage("Please select a city.")
      return
    }

    setSubmitting(true)

    const formData = {
      couponId: id,
      stateId: selectedStateId,
      cityId: selectedCityId,
    }

    try {
      const response = await axios.post(url.assignCouponCodeAccordingToStatesAndCity, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      })

      toast.success(response.data.message || "Coupon assigned successfully!")

      // Reset form
      setSelectedStateId("")
      setSelectedCityId("")
      setCities([])
    } catch (error) {
      console.error("Error assigning coupon:", error)
      toast.error("Failed to assign coupon. Please try again.")
      setErrorMessage("Failed to assign coupon. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Initialize data on component mount
  useEffect(() => {
    if (id && currentUser?.token) {
      fetchCouponDetail()
      fetchStates()
    }
  }, [id, currentUser?.token])

  const selectedState = states.find((state) => state._id === selectedStateId)
  const selectedCity = cities.find((city) => city._id === selectedCityId)

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumb
        pageName={`${couponCode || "Loading..."} → Assign Coupon`}
        parentName="Coupon Codes"
        parentPath="/coupon"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-purple rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assign Coupon Code</h1>
              <p className="text-white/80">
                Assign <span className="font-semibold">{couponCode}</span> to a specific city
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* State Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Select State
                </label>
                <div className="relative">
                  <select
                    value={selectedStateId}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={loadingPage}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-4 pr-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose a state...</option>
                    {states.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {loadingPage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
                {selectedState && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selected: {selectedState.name}
                  </motion.div>
                )}
              </motion.div>

              {/* City Selection */}
              <AnimatePresence>
                {selectedStateId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Select City
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        disabled={loadingPage || cities.length === 0}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-4 pr-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{cities.length === 0 ? "No cities available" : "Choose a city..."}</option>
                        {cities.map((city) => (
                          <option key={city._id} value={city._id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {loadingPage ? (
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {selectedCity && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Selected: {selectedCity.name}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 pt-4"
              >
                <button
                  type="button"
                  onClick={() => navigate("/coupon")}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <motion.button
                  type="submit"
                  disabled={submitting || !selectedStateId || !selectedCityId}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Assigning Coupon...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" />
                      Assign Coupon to City
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Summary Card */}
        <AnimatePresence>
          {selectedState && selectedCity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Assignment Summary</h3>
              <div className="space-y-2 text-green-700 dark:text-green-300">
                <p>
                  <span className="font-medium">Coupon:</span> {couponCode}
                </p>
                <p>
                  <span className="font-medium">State:</span> {selectedState.name}
                </p>
                <p>
                  <span className="font-medium">City:</span> {selectedCity.name}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default AssignCoupon
