"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import {
  MapPin,
  Settings,
  Plus,
  Monitor,
  Users,
  Edit3,
  Trash2,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
} from "lucide-react"
import axios from "axios"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

import Urls  from "../../networking/app_urls"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

// Mock URLs - replace with your actual URLs
// const Urls = {
//   getTheatres: "/api/theatres",
//   getScreens: "/api/screens",
//   getGrabABiteListwithpagination: "/api/grab-a-bite",
//   Image_url: "/api/images/",
//   createScreen: "/api/screens/create",
//   updateScreen: "/api/screens/update",
//   deleteScreen: "/api/screens/delete",
//   changeScreenStatus: "/api/screens/status",
//   createGrabABite: "/api/grab-a-bite/create",
//   updateGrabABite: "/api/grab-a-bite/update",
//   deleteGrabAABite: "/api/grab-a-bite/delete",
//   updateTheatre: "/api/theatres/update",
// }

interface Theatre {
  _id: string
  name: string
  location: string
  isGrabABite: boolean
  isActive: boolean
}

interface Screen {
  _id: string
  name: string
  seatingCapacity: number
  screenType: string
  isActive: boolean
}

interface GrabABiteItem {
  _id: string
  name: string
  foodType: string
  grabImage: string
  description: string
  status: boolean
  price: number
}

// Add Screen Modal Component
const AddScreenModal = ({
  isOpen,
  onClose,
  onSuccess,
  theatreId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  theatreId: string
}) => {
  const [formData, setFormData] = useState({
    name: "",
    seatingCapacity: "",
    screenType: "Standard",
  })
  const [loading, setLoading] = useState(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(
        Urls.createScreen,
        {
          ...formData,
          theatre: theatreId,
          seatingCapacity: Number.parseInt(formData.seatingCapacity),
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        },
      )

      toast.success("Screen added successfully!")
      onSuccess()
      onClose()
      setFormData({ name: "", seatingCapacity: "", screenType: "Standard" })
    } catch (error) {
      toast.error("Failed to add screen")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Add New Screen</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Screen Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Screen 1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Seating Capacity</label>
            <input
              type="number"
              value={formData.seatingCapacity}
              onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Screen Type</label>
            <select
              value={formData.screenType}
              onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Standard">Standard</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
              <option value="Dolby Atmos">Dolby Atmos</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Screen"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Add Grab A Bite Modal Component
const AddGrabABiteModal = ({
  isOpen,
  onClose,
  onSuccess,
  theatreId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  theatreId: string
}) => {
  const [formData, setFormData] = useState({
    name: "",
    foodType: "snacks",
    price: "",
    description: "",
    status: true,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) {
      toast.error("Please select an image")
      return
    }

    setLoading(true)
    const formDataToSend = new FormData()
    formDataToSend.append("theatre", theatreId)
    formDataToSend.append("name", formData.name)
    formDataToSend.append("foodType", formData.foodType)
    formDataToSend.append("price", formData.price)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("status", formData.status.toString())
    formDataToSend.append("grabImage", selectedImage)

    try {
      await axios.post(Urls.createGrabABite, formDataToSend, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })

      toast.success("Food item added successfully!")
      onSuccess()
      onClose()
      setFormData({ name: "", foodType: "snacks", price: "", description: "", status: true })
      setSelectedImage(null)
    } catch (error) {
      toast.error("Failed to add food item")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold mb-4">Add Food Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Popcorn Combo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Food Type</label>
            <select
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="popcorn">Popcorn</option>
              <option value="snacks">Snacks</option>
              <option value="combos">Combos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 150"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the food item..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Main Theater Page Component
const TheaterPage = () => {
  const [theatre, setTheatre] = useState<Theatre | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [grabABiteItems, setGrabABiteItems] = useState<GrabABiteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddScreenModal, setShowAddScreenModal] = useState(false)
  const [showAddFoodModal, setShowAddFoodModal] = useState(false)

  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  // Fetch theater data
  const fetchTheatreData = async () => {
    try {
      const response = await axios.get(Urls.getTheatres, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
      if (response.data.status && response.data.data.length > 0) {
        setTheatre(response.data.data[0]) // Assuming single theater
      }
    } catch (error) {
      console.error("Error fetching theatre:", error)
    }
  }

  // Fetch screens data
  const fetchScreens = async () => {
    if (!theatre) return
    try {
      const response = await axios.get(`${Urls.getScreens}?theatre=${theatre._id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
      if (response.data.status) {
        setScreens(response.data.data || [])
      }
    } catch (error) {
      console.error("Error fetching screens:", error)
    }
  }

  // Fetch grab a bite items
  const fetchGrabABiteItems = async () => {
    if (!theatre) return
    try {
      const response = await axios.get(`${Urls.getGrabABiteListwithpagination}?theatre=${theatre._id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
      if (response.data.status) {
        setGrabABiteItems(response.data.data.grabList || [])
      }
    } catch (error) {
      console.error("Error fetching grab a bite items:", error)
    }
  }

  useEffect(() => {
    if (currentUser?.token) {
      fetchTheatreData()
    }
  }, [currentUser])

  useEffect(() => {
    if (theatre) {
      fetchScreens()
      fetchGrabABiteItems()
      setLoading(false)
    }
  }, [theatre])

  // Toggle screen status
  const toggleScreenStatus = async (screenId: string, currentStatus: boolean) => {
    try {
      await axios.post(
        Urls.changeScreenStatus,
        {
          id: screenId,
          isActive: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        },
      )

      setScreens((prev) =>
        prev.map((screen) => (screen._id === screenId ? { ...screen, isActive: !currentStatus } : screen)),
      )
      toast.success("Screen status updated!")
    } catch (error) {
      toast.error("Failed to update screen status")
    }
  }

  // Toggle food item status
  const toggleFoodStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      await axios.post(
        Urls.deleteGrabAABite,
        {
          id: itemId,
          status: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        },
      )

      setGrabABiteItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, status: !currentStatus } : item)),
      )
      toast.success("Food item status updated!")
    } catch (error) {
      toast.error("Failed to update food item status")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (!theatre) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No Theater Found</h2>
          <p>Please add a theater to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white rounded-2xl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Theater Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-purple backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{theatre.name}</h1>
                <div className="flex items-center text-white mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{theatre.location}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {theatre.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mr-2" />
                    )}
                    <span className="text-white/80">{theatre.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex items-center">
                    <UtensilsCrossed className="w-5 h-5 text-orange-400 mr-2" />
                    <span className="text-white/80">
                      Grab A Bite: {theatre.isGrabABite ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>
        </motion.div>

        {/* Screens Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Theater Screens</h2>
            <button
              onClick={() => setShowAddScreenModal(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Screen</span>
            </button>
          </div>

          {screens.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
              <Monitor className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Screens Added</h3>
              <p className="text-white/70 mb-6">Add your first screen to get started with movie screenings.</p>
              <button
                onClick={() => setShowAddScreenModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl transition-colors"
              >
                Add First Screen
              </button>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 2 },
              }}
              className="screens-swiper"
            >
              {screens.map((screen) => (
                <SwiperSlide key={screen._id} className="">
                  <motion.div
                    whileHover={{ scale: 1 }}
                    className="bg-gradient-to-tr from-indigo-300 to-blue-300 backdrop-blur-lg rounded-2xl p-6 py-10 border border-white/20 cursor-pointer mx-10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{screen.name}</h3>
                          <p className="text-white/70">{screen.screenType}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleScreenStatus(screen._id, screen.isActive)
                        }}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          screen.isActive ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            screen.isActive ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-white/80">
                        <Users className="w-5 h-5 mr-2" />
                        <span>{screen.seatingCapacity} seats</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        {!screen.isActive && (
                          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.div>

        {/* Grab A Bite Section */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Grab A Bite</h2>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Food Item</span>
            </button>
          </div>

          {grabABiteItems.length === 0 ? (
            <div className="bg-gradient-to-tr from-indigo-300 to-blue-300 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
              <UtensilsCrossed className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Food Items Added</h3>
              <p className="text-white/70 mb-6">Add delicious snacks and combos for your customers.</p>
              <button
                onClick={() => setShowAddFoodModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl transition-colors"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {grabABiteItems.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1 }}
                  className="bg-gradient-to-tr from-indigo-300 to-blue-300 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20"
                >
                  <div className="relative">
                    <img
                      src={`${Urls.Image_url}${item.grabImage}`}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleFoodStatus(item._id, item.status)}
                        className={`w-8 h-4 rounded-full transition-colors ${
                          item.status ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            item.status ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <span className="text-orange-400 font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-3 capitalize">{item.foodType}</p>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex space-x-2">
                      <button className="flex-1 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4 text-white mx-auto" />
                      </button>
                      {!item.status && (
                        <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddScreenModal && (
          <AddScreenModal
            isOpen={showAddScreenModal}
            onClose={() => setShowAddScreenModal(false)}
            onSuccess={fetchScreens}
            theatreId={theatre._id}
          />
        )}
        {showAddFoodModal && (
          <AddGrabABiteModal
            isOpen={showAddFoodModal}
            onClose={() => setShowAddFoodModal(false)}
            onSuccess={fetchGrabABiteItems}
            theatreId={theatre._id}
          />
        )}
      </AnimatePresence>

      {/* Custom Swiper Styles */}
      {/* <style jsx global>{`
        
      `}</style> */}
    </div>
  )
}

export default TheaterPage
