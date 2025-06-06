"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import urls from "../../networking/app_urls"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Save,
  Eye,
  Settings,
  Armchair,
  Crown,
  Gem,
  Star,
  Theater,
  Grid3X3,
  RotateCcw,
  EyeOff,
  LayoutGrid,
  Edit3,
  Check,
  X,
} from "lucide-react"

// Define seat types
const SEAT_TYPES = [
  { id: "Recliner", label: "Recliner", icon: Armchair },
  { id: "Silver", label: "Silver", icon: Star },
  { id: "Gold", label: "Gold", icon: Crown },
  { id: "Diamond", label: "Diamond", icon: Gem },
]

type SeatRow = {
  label: string // Row label (e.g., A, B, C)
  seats: (number | null)[] // Seats in the row, null represents a space
  type: string // Row type ('Recliner', 'Silver', 'Gold', 'Diamond')
}

const Seatx: React.FC = () => {
  const { id } = useParams()
  const [rows, setRows] = useState<SeatRow[]>([])
  const [numRows, setNumRows] = useState<number>(5)
  const [numColumns, setNumColumns] = useState<number>(10)
  const [isConfiguring, setIsConfiguring] = useState<boolean>(true)
  const [isConfiguringTypes, setIsConfiguringTypes] = useState<boolean>(false)
  const [rowTypes, setRowTypes] = useState<string[]>([])
  const [editingRowType, setEditingRowType] = useState<number | null>(null)
  const [submittedLayout, setSubmittedLayout] = useState<SeatRow[] | null>(null)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)

  useEffect(() => {
    const fetchSeatList = async () => {
      try {
        const response = await axios.get(`${urls.movieSeatLayoutForAdmin}?screenId=${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        })

        if (response.data.data && response.data.data.length > 0) {
          const sortedRows = response.data.data.sort((a: SeatRow, b: SeatRow) => a.label.localeCompare(b.label))
          setRows(sortedRows)
          setIsConfiguring(false)
          setIsConfiguringTypes(false)

          // Determine the number of rows and columns from the fetched data
          setNumRows(sortedRows.length)
          const maxColumns = Math.max(...sortedRows.map((row) => row.seats.length))
          setNumColumns(maxColumns)

          // Set row types from fetched data
          setRowTypes(sortedRows.map((row) => row.type))
        }
      } catch (error) {
        console.error("Error fetching seat:", error)
      }
    }

    fetchSeatList()
  }, [])

  const getSeatTypeIcon = (type: string) => {
    const seatType = SEAT_TYPES.find((t) => t.id === type)
    const IconComponent = seatType?.icon || Armchair
    return <IconComponent className="w-4 h-4" />
  }

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case "Recliner":
        return { bg: "bg-purple-500", hover: "hover:bg-purple-600", border: "border-purple-200", light: "bg-purple-50" }
      case "Silver":
        return { bg: "bg-slate-500", hover: "hover:bg-slate-600", border: "border-slate-200", light: "bg-slate-50" }
      case "Gold":
        return { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", border: "border-yellow-200", light: "bg-yellow-50" }
      case "Diamond":
        return { bg: "bg-cyan-500", hover: "hover:bg-cyan-600", border: "border-cyan-200", light: "bg-cyan-50" }
      default:
        return { bg: "bg-purple-500", hover: "hover:bg-purple-600", border: "border-purple-200", light: "bg-purple-50" }
    }
  }

  const proceedToTypeConfiguration = () => {
    if (numRows <= 0 || numColumns <= 0) {
      toast.error("Please enter valid numbers for rows and columns.")
      return
    }

    if (numRows > 26) {
      toast.error("Maximum 26 rows (A-Z) are allowed.")
      return
    }

    if (numColumns > 30) {
      toast.error("Maximum 30 columns are allowed.")
      return
    }

    // Initialize row types with default "Recliner"
    const defaultTypes = Array(numRows).fill("Recliner")
    setRowTypes(defaultTypes)
    setIsConfiguringTypes(true)
  }

  const generateLayout = () => {
    const newRows: SeatRow[] = []

    for (let i = 0; i < numRows; i++) {
      const rowLabel = String.fromCharCode(65 + i) // A, B, C, etc.
      const seats = Array(numColumns)
        .fill(0)
        .map((_, index) => index + 1)

      newRows.push({
        label: rowLabel,
        seats: seats,
        type: rowTypes[i] || "Recliner",
      })
    }

    setRows(newRows)
    setIsConfiguring(false)
    setIsConfiguringTypes(false)
  }

  const updateRowType = (rowIndex: number, newType: string) => {
    const updatedTypes = [...rowTypes]
    updatedTypes[rowIndex] = newType
    setRowTypes(updatedTypes)
  }

  const updateExistingRowType = (rowIndex: number, newType: string) => {
    const updatedRows = [...rows]
    updatedRows[rowIndex].type = newType
    setRows(updatedRows)
    setEditingRowType(null)
  }

  const toggleSeat = (rowIndex: number, seatIndex: number) => {
    const updatedRows = [...rows]
    const row = updatedRows[rowIndex]

    // Toggle between seat number and null (space)
    if (row.seats[seatIndex] === null) {
      // Convert space back to seat number
      row.seats[seatIndex] = seatIndex + 1
    } else {
      // Convert seat to space
      row.seats[seatIndex] = null
    }

    setRows(updatedRows)
  }

  const resetLayout = () => {
    setRows([])
    setSubmittedLayout(null)
    setShowPreview(false)
    setIsConfiguring(true)
    setIsConfiguringTypes(false)
    setRowTypes([])
    setEditingRowType(null)
  }

  const submitLayout = async () => {
    if (rows.length <= 0) {
      toast.error("Please generate a seat layout.")
      return
    }

    // Convert the data format to match the API expectations
    const formattedRows = rows.map((row) => {
      // Convert null values to empty strings for API compatibility
      const formattedSeats = row.seats.map((seat) => (seat === null ? "" : seat))

      return {
        label: row.label,
        seats: formattedSeats,
        type: row.type,
      }
    })

    try {
      const formData = {
        data: formattedRows,
        screen: id,
      }

      const response = await axios.post(`${urls.addSeatLayout}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data.status && response.data.data) {
        toast.success("Seat layout added successfully!")
        setSubmittedLayout(rows)
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Oops! Something went wrong. Please try again later.",
        {
          className: "z-[99999]",
        },
      )
    }
  }

  const adminLayout = async () => {
    if (rows.length <= 0) {
      return
    }

    // Convert the data format to match the API expectations
    const formattedRows = rows.map((row) => {
      // Convert null values to empty strings for API compatibility
      const formattedSeats = row.seats.map((seat) => (seat === null ? "" : seat))

      return {
        label: row.label,
        seats: formattedSeats,
        type: row.type,
      }
    })

    try {
      const formData = {
        data: formattedRows,
        screen: id,
      }

      const response = await axios.post(`${urls.addSeatLayout}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data.status && response.data.data) {
        setSubmittedLayout(rows)
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message)
    }
  }

  const renderSeats = (isPreview = false) => {
    return (
      <div className="space-y-6">
        <AnimatePresence>
          {rows.map((row, rowIndex) => {
            const colors = getSeatTypeColor(row.type)
            return (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colors.bg} text-white`}>{getSeatTypeIcon(row.type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Row {row.label}</h3>
                      <p className="text-sm text-gray-500">{row.type}</p>
                    </div>
                  </div>
                  {!isPreview && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingRowType(rowIndex)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Change seat type"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Row Type Editor */}
                {editingRowType === rowIndex && !isPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50 border-b border-blue-100"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">Change seat type:</span>
                      {SEAT_TYPES.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateExistingRowType(rowIndex, type.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                            row.type === type.id
                              ? `${getSeatTypeColor(type.id).bg} text-white border-transparent`
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span className="text-sm">{type.label}</span>
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingRowType(null)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className="p-4">
                  <div className="flex justify-center items-center gap-1 flex-wrap">
                    {row.seats.map((seat, seatIndex) =>
                      seat === null || seat === ''  ? (
                        <motion.div
                          key={seatIndex}
                          whileHover={!isPreview ? { scale: 1.05 } : {}}
                          whileTap={!isPreview ? { scale: 0.95 } : {}}
                          className={`w-8 h-8 sm:w-8 sm:h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${
                            !isPreview ? "cursor-pointer hover:border-green-400 hover:bg-green-50" : ""
                          }`}
                          onClick={() => !isPreview && toggleSeat(rowIndex, seatIndex)}
                          title={!isPreview ? "Click to restore seat" : "Empty space"}
                        >
                          {!isPreview && <Plus className="w-3 h-3 text-gray-400" />}
                        </motion.div>
                      ) : (
                        <motion.button
                          key={seatIndex}
                          whileHover={!isPreview ? { scale: 1.05 } : {}}
                          whileTap={!isPreview ? { scale: 0.95 } : {}}
                          className={`w-8 h-8 sm:w-8 sm:h-8 ${colors.bg} ${
                            !isPreview ? colors.hover : ""
                          } text-white rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center font-medium text-xs sm:text-sm ${
                            !isPreview ? "cursor-pointer" : "cursor-default"
                          }`}
                          onClick={() => !isPreview && toggleSeat(rowIndex, seatIndex)}
                          title={!isPreview ? "Click to remove seat" : `Seat ${seat}`}
                          disabled={isPreview}
                        >
                          {seat}
                        </motion.button>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    )
  }

  const renderDimensionConfiguration = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
      >
        <div className="bg-indigo-purple px-6 py-4 rounded-t-xl">
          <div className="flex items-center space-x-3 text-white">
            <LayoutGrid className="w-6 h-6" />
            <h1 className="text-xl font-bold">Step 1: Configure Theater Dimensions</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rows</label>
              <input
                type="number"
                value={numRows}
                min={1}
                max={26}
                onChange={(e) => setNumRows(Math.min(26, Math.max(1, Number.parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">Max 26 rows (A-Z)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seats Per Row</label>
              <input
                type="number"
                value={numColumns}
                min={1}
                max={30}
                onChange={(e) => setNumColumns(Math.min(30, Math.max(1, Number.parseInt(e.target.value, 10) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">Max 30 seats per row</p>
            </div>

            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={proceedToTypeConfiguration}
                className="w-full bg-indigo-purple text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Next: Configure Seat Types</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderTypeConfiguration = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center space-x-3 text-white">
            <Settings className="w-6 h-6" />
            <h1 className="text-xl font-bold">Step 2: Configure Seat Types for Each Row</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            {Array.from({ length: numRows }, (_, index) => {
              const rowLabel = String.fromCharCode(65 + index)
              const currentType = rowTypes[index] || "Recliner"
              const colors = getSeatTypeColor(currentType)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${colors.border} ${colors.light}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${colors.bg} text-white`}>{getSeatTypeIcon(currentType)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Row {rowLabel}</h3>
                        <p className="text-sm text-gray-500">{currentType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {SEAT_TYPES.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateRowType(index, type.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                          currentType === type.id
                            ? `${getSeatTypeColor(type.id).bg} text-white border-transparent`
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsConfiguringTypes(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <X className="w-4 h-4" />
              <span>Back</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateLayout}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <Check className="w-5 h-5" />
              <span>Generate Layout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  useEffect(() => {
    if (currentUser.role === "admin" && rows.length > 0) {
      adminLayout()
    }
  }, [rows])

  if (currentUser.role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
          >
            <div className="bg-indigo-purple px-6 py-4 rounded-t-xl">
              <div className="flex items-center space-x-3 text-white">
                <Theater className="w-6 h-6" />
                <h1 className="text-xl font-bold">Theater Seat Layout Preview</h1>
              </div>
            </div>
            <div className="p-6">
              {submittedLayout && submittedLayout.length > 0 ? (
                <>
                  <div className="mb-6">
                    <div className="bg-gray-800 h-2 rounded-full shadow-sm mb-2" />
                    <p className="text-center text-gray-600 text-sm font-medium">SCREEN</p>
                  </div>
                  {renderSeats(true)}
                </>
              ) : (
                <div className="text-center py-12">
                  <Theater className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No layout available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          <div className="bg-indigo-purple px-6 py-4 rounded-t-xl">
            <div className="flex items-center space-x-3 text-white">
              <Settings className="w-6 h-6" />
              <h1 className="text-xl font-bold">Theater Seat Layout Designer</h1>
            </div>
          </div>
        </motion.div>

        {/* Configuration Panels */}
        {isConfiguring && !isConfiguringTypes && renderDimensionConfiguration()}
        {isConfiguring && isConfiguringTypes && renderTypeConfiguration()}

        {/* Main Layout Area */}
        {!isConfiguring && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
            >
              <div className="p-6">
                {/* Screen */}
                <div className="mb-8">
                  <div className="bg-gray-800 h-2 rounded-full shadow-sm mb-2" />
                  <p className="text-center text-gray-600 text-sm font-medium">SCREEN</p>
                </div>

                {/* Seats */}
                <div className="min-h-[200px]">
                  {rows.length > 0 ? (
                    renderSeats()
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                      <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No seats added yet</p>
                      <p className="text-gray-400 text-sm">Configure your layout to get started</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitLayout}
                disabled={rows.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>Save Layout</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPreview(!showPreview)}
                disabled={rows.length === 0}
                className="px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetLayout}
                disabled={rows.length === 0}
                className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </motion.button>
            </div>

            {/* Preview Section */}
            <AnimatePresence>
              {(showPreview || submittedLayout) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                    <div className="flex items-center space-x-3 text-white">
                      <Eye className="w-5 h-5" />
                      <h3 className="text-lg font-bold">Layout Preview</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="bg-gray-800 h-2 rounded-full shadow-sm mb-2" />
                      <p className="text-center text-gray-600 text-sm font-medium">SCREEN</p>
                    </div>
                    {submittedLayout ? renderSeats(true) : renderSeats(true)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}

export default Seatx
