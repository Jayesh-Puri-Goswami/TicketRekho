"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import urls from "../../networking/app_urls"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit3, Trash2, Save, Eye, Settings, Armchair, Crown, Gem, Star, X, Check } from "lucide-react"

type SeatRow = {
  label: string // Row label (e.g., A, B, C)
  seats: (number | "")[] // Seats in the row, including spaces
  type: string // Row type ('Recliner', 'Silver', 'Gold', 'Diamond')
  price: number
}

const EventSeatx: React.FC = () => {
  const { id } = useParams()
  const [rows, setRows] = useState<SeatRow[]>([])
  const [newRowSeats, setNewRowSeats] = useState<number>(10)
  const [newRowType, setNewRowType] = useState<string>("Recliner")
  const [price, setPrice] = useState<number>(0)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [submittedLayout, setSubmittedLayout] = useState<SeatRow[] | null>(null)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  useEffect(() => {
    const fetchSeatList = async () => {
      try {
        const response = await axios.get(`${urls.eventSeatLayoutForAdmin}?venueId=${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        })
        setRows(response.data.data)
      } catch (error) {
        console.error("Error fetching movies:", error)
      }
    }

    fetchSeatList()
  }, [])

  const getSeatTypeIcon = (type: string) => {
    switch (type) {
      case "Recliner":
        return <Armchair className="w-4 h-4" />
      case "Silver":
        return <Star className="w-4 h-4" />
      case "Gold":
        return <Crown className="w-4 h-4" />
      case "Diamond":
        return <Gem className="w-4 h-4" />
      default:
        return <Armchair className="w-4 h-4" />
    }
  }

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case "Recliner":
        return "from-purple-500 to-indigo-600"
      case "Silver":
        return "from-slate-400 to-slate-600"
      case "Gold":
        return "from-yellow-400 to-yellow-600"
      case "Diamond":
        return "from-blue-400 to-cyan-600"
      default:
        return "from-purple-500 to-indigo-600"
    }
  }

  const addRow = () => {
    if (newRowSeats <= 0 || isNaN(newRowSeats)) {
      toast.error("Please enter a valid number of seats greater than 0.")
      return
    }
    if (price <= 0 || isNaN(price)) {
      toast.error("Please enter a valid price of seats greater than 0.")
      return
    }
    if (newRowSeats >= 30) {
      toast.error("Limit Exceeded: You cannot add more than 30 seats in a single row.")
      return
    }

    const newRow: SeatRow = {
      label: String.fromCharCode(65 + rows.length),
      seats: Array.from({ length: newRowSeats }, (_, i) => i + 1),
      type: newRowType,
      price: price,
    }
    const updatedRows = [...rows, newRow].map((row, index) => ({
      ...row,
      label: String.fromCharCode(65 + index),
    }))
    setRows(updatedRows)

    setNewRowSeats(10)
    setNewRowType("Recliner")
    setPrice(0)
  }

  const updateRow = () => {
    if (editingRowIndex === null) return
    if (newRowSeats <= 0 || isNaN(newRowSeats)) {
      toast.error("Please enter a valid number of seats greater than 0.")
      return
    }
    if (price <= 0 || isNaN(price)) {
      toast.error("Please enter a valid price of seats greater than 0.")
      return
    }
    if (newRowSeats >= 30) {
      toast.error("Limit Exceeded: You cannot add more than 30 seats in a single row.")
      return
    }

    const updatedRows = [...rows]
    const row = updatedRows[editingRowIndex]
    row.seats = Array.from({ length: newRowSeats }, (_, i) => i + 1)
    row.type = newRowType
    row.price = price

    setRows(updatedRows)
    setEditingRowIndex(null)
    setNewRowSeats(10)
    setNewRowType("Recliner")
    setPrice(0)
  }

  const removeRow = (rowIndex: number) => {
    const updatedRows = rows
      .filter((_, index) => index !== rowIndex)
      .map((row, index) => ({
        ...row,
        label: String.fromCharCode(65 + index),
      }))
    setRows(updatedRows)
  }

  const addSpaceAtSeat = (rowIndex: number, seatIndex: number) => {
    const updatedRows = [...rows]
    const row = updatedRows[rowIndex]
    row.seats.splice(seatIndex, 0, "")
    setRows(updatedRows)
  }

  const removeSpaceAtSeat = (rowIndex: number, seatIndex: number) => {
    const updatedRows = [...rows]
    const row = updatedRows[rowIndex]
    row.seats.splice(seatIndex, 1)
    setRows(updatedRows)
  }

  const startEditingRow = (rowIndex: number) => {
    const row = rows[rowIndex]
    setEditingRowIndex(rowIndex)
    setNewRowSeats(row.seats.length)
    setNewRowType(row.type)
    setPrice(row.price)
  }

  const cancelEditing = () => {
    setEditingRowIndex(null)
    setNewRowSeats(10)
    setNewRowType("Recliner")
    setPrice(0)
  }

  const submitLayout = async () => {
    if (rows.length <= 0) {
      toast.error("Please add seat layout.")
      return
    }

    setSubmittedLayout(rows)

    try {
      const formData = {
        data: rows,
        venueId: id,
      }

      await axios
        .post(`${urls.addEventSeatLayout}`, formData, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.status && response.data.data) {
            toast.success("Seat layout added successfully!")
          }
        })
        .catch((error) => {
          console.error("API Error:", error.response?.data || error.message)
          toast.error(error.response?.data?.message || "Failed to add seat layout.")
        })
    } finally {
      // Handle finally block if needed
    }
  }

  const renderSeats = () => {
    return (
      <div className="space-y-8">
        <AnimatePresence>
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
            >
              {/* Row Header */}
              <div className={`bg-gradient-to-r ${getSeatTypeColor(row.type)} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-white">
                    {getSeatTypeIcon(row.type)}
                    <div>
                      <h3 className="text-lg font-bold">Row {row.label}</h3>
                      <p className="text-sm opacity-90">
                        {row.type} • ₹{row.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEditingRow(rowIndex)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeRow(rowIndex)}
                      className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Seats Display */}
              <div className="p-6">
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {row.seats.map((seat, seatIndex) =>
                    seat === "" ? (
                      <motion.button
                        key={seatIndex}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                        onClick={() => removeSpaceAtSeat(rowIndex, seatIndex)}
                        title="Click to remove space"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key={seatIndex}
                        whileHover={{ scale: 1.1, rotateY: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 bg-gradient-to-br ${getSeatTypeColor(row.type)} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center font-semibold text-sm`}
                        onClick={() => addSpaceAtSeat(rowIndex, seatIndex)}
                        title="Click to add space"
                      >
                        {seat}
                      </motion.button>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  const renderSubmittedLayout = () => {
    return (
      <div className="space-y-6">
        <AnimatePresence>
          {submittedLayout?.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${getSeatTypeColor(row.type)} px-4 py-3`}>
                <div className="flex items-center space-x-2 text-white">
                  {getSeatTypeIcon(row.type)}
                  <span className="font-semibold">
                    Row {row.label} ({row.type})
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-center gap-2 flex-wrap">
                  {row.seats.map((seat, seatIndex) =>
                    seat === "" ? (
                      <div
                        key={seatIndex}
                        className="w-10 h-10 bg-slate-200 border border-slate-300 rounded-lg"
                        title="Space"
                      />
                    ) : (
                      <div
                        key={seatIndex}
                        className={`w-10 h-10 bg-gradient-to-br ${getSeatTypeColor(row.type)} text-white rounded-lg flex items-center justify-center text-sm font-medium shadow-sm`}
                      >
                        {seat}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-100 mb-8 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3 text-white">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-bold">Theater Seat Layout Designer</h2>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Seats Per Row</label>
              <input
                type="number"
                value={newRowSeats}
                min={1}
                max={29}
                onChange={(e) => setNewRowSeats(Number.parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
              <input
                type="number"
                value={price}
                min={1}
                onChange={(e) => setPrice(Number.parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Seat Type</label>
              <select
                value={newRowType}
                onChange={(e) => setNewRowType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="Recliner">Recliner</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>

            <div className="lg:col-span-2 flex gap-3">
              {editingRowIndex === null ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addRow}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Row</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={updateRow}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <Check className="w-4 h-4" />
                    <span>Update</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theater Layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 mb-8"
      >
        {/* Screen */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full shadow-lg mb-2" />
          <p className="text-center text-slate-300 text-sm font-medium">SCREEN</p>
        </div>

        {/* Seats */}
        <div className="min-h-[200px]">
          {rows.length > 0 ? (
            renderSeats()
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Armchair className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No seats added yet</p>
              <p className="text-slate-500 text-sm">Add your first row to get started</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={submitLayout}
          disabled={rows.length === 0}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>Save Layout</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPreview(!showPreview)}
          disabled={rows.length === 0}
          className="px-8 py-3 border-2 border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-5 h-5" />
          <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
        </motion.button>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {(showPreview || submittedLayout) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
              <div className="flex items-center space-x-3 text-white">
                <Eye className="w-5 h-5" />
                <h3 className="text-lg font-bold">Layout Preview</h3>
              </div>
            </div>
            <div className="p-6">{submittedLayout ? renderSubmittedLayout() : renderSeats()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventSeatx
