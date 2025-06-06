"use client"

import type React from "react"
import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Upload, RotateCcw, CheckCircle, AlertCircle, Scan, X } from "lucide-react"
import QrScanner from "qr-scanner"
import axios from "axios"

// Mock URLs - replace with your actual URLs
const Urls = {
  getUserMovieBookingTicketDetail: "/api/movie/booking/details",
  scanMovieQRCode: "/api/movie/scan",
  Image_url: "https://your-image-base-url.com/",
}

interface QrData {
  userId: string
  bookingId: string
  appUserId: string
  email: string
  showtimeId: string
}

interface MovieTicket {
  movieName: string
  theaterName: string
  showtime: string
  seatNumbers: string[]
  totalAmount: number
  bookingDate: string
}

interface GrabABiteItem {
  grabABiteId: {
    _id: string
    userId: string
    movieId: string
    name: string
    foodType: string
    grabImage: string
    description: string
    price: number
    status: boolean
    createdAt: string
    updatedAt: string
  }
  qty: number
  _id: string
}

const MovieQRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment")
  const [movieTicket, setMovieTicket] = useState<MovieTicket | null>(null)
  const [grabABiteList, setGrabABiteList] = useState<GrabABiteItem[]>([])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Mock current user - replace with your actual user selector
  const currentUser = { token: "your-auth-token" }

  const startCameraScanner = async () => {
    setIsCameraActive(true)
    setErrorMessage(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        const scanner = new QrScanner(
          videoRef.current,
          async (result) => {
            try {
              const parsedData: QrData = JSON.parse(result.data)
              setQrData(parsedData)
              setIsCameraActive(false)
              scannerRef.current?.stop()

              await fetchMovieTicketDetails(parsedData.bookingId)
              await fetchGrabABiteList(parsedData.bookingId)
            } catch (error) {
              console.error("Failed to parse QR data:", error)
              setErrorMessage("Invalid QR Code. Please try again.")
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          },
        )

        await scanner.start()
        scannerRef.current = scanner
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      setErrorMessage("Camera access denied. Please allow permissions in your browser settings.")
    }
  }

  const stopCameraScanner = () => {
    scannerRef.current?.stop()
    scannerRef.current?.destroy()
    scannerRef.current = null
    setIsCameraActive(false)
  }

  const switchCamera = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"))
    stopCameraScanner()
    setTimeout(() => startCameraScanner(), 100)
  }

  const scanImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await QrScanner.scanImage(file)
      const parsedData: QrData = JSON.parse(result)

      console.log("Parsed QR Data:", parsedData)
      setQrData(parsedData)

      await fetchMovieTicketDetails(parsedData.bookingId)
      await fetchGrabABiteList(parsedData.bookingId)
    } catch (error) {
      console.error("Error scanning image:", error)
      setErrorMessage("Invalid QR Code in image. Please try again.")
    }
  }

  const fetchMovieTicketDetails = async (bookingId: string) => {
    try {
      const response = await axios.post(
        Urls.getUserMovieBookingTicketDetail,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )

      if (response.data.data?.movieTicket) {
        setMovieTicket(response.data.data.movieTicket)
      }
    } catch (error) {
      console.error("Failed to fetch movie ticket details:", error)
      setErrorMessage("Failed to fetch movie ticket details. Please try again.")
    }
  }

  const fetchGrabABiteList = async (bookingId: string) => {
    try {
      const response = await axios.post(
        Urls.getUserMovieBookingTicketDetail,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )

      if (response.data.data?.bookingTickets?.grabABiteList) {
        setGrabABiteList(response.data.data.bookingTickets.grabABiteList)
      }
    } catch (error) {
      console.error("Failed to fetch grabABiteList:", error)
      setErrorMessage("Failed to fetch Grab a Bite list. Please try again.")
    }
  }

  const verifyMovieTicket = async () => {
    if (!qrData) return

    setIsSending(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await axios.post(
        Urls.scanMovieQRCode,
        {
          bookingId: qrData.bookingId,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )

      setSuccessMessage(response.data.message)
    } catch (error: any) {
      console.error("Failed to verify movie ticket:", error)
      setErrorMessage(error.response?.data?.message || "Failed to verify movie ticket. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const resetScanner = () => {
    setQrData(null)
    setMovieTicket(null)
    setGrabABiteList([])
    setSuccessMessage(null)
    setErrorMessage(null)
    stopCameraScanner()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Movie Ticket Scanner</h1>
          <p className="text-slate-600">Scan QR codes to verify movie tickets</p>
        </motion.div>

        {/* Main Scanner Card */}
        <motion.div layout className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <AnimatePresence mode="wait">
            {!isCameraActive ? (
              <motion.div
                key="scanner-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCameraScanner}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Camera className="w-5 h-5" />
                  Scan QR Code with Camera
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Upload className="w-5 h-5" />
                  Upload QR Code Image
                </motion.button>

                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={scanImageFile} />
              </motion.div>
            ) : (
              <motion.div
                key="camera-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative w-full h-80 bg-slate-900 rounded-xl overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" />

                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="w-48 h-48 border-4 border-white rounded-2xl relative"
                    >
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>

                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        className="absolute top-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={switchCamera}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Switch Camera
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopCameraScanner}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Stop Scanning
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* QR Data Display */}
        <AnimatePresence>
          {qrData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scan className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">QR Code Scanned</h3>
              </div>
              <p className="text-blue-700">
                Booking ID: <span className="font-mono font-bold">{qrData.bookingId}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Ticket Details */}
        <AnimatePresence>
          {movieTicket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4">Movie Ticket Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Movie</p>
                  <p className="font-semibold text-slate-800">{movieTicket.movieName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Theater</p>
                  <p className="font-semibold text-slate-800">{movieTicket.theaterName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Showtime</p>
                  <p className="font-semibold text-slate-800">{movieTicket.showtime}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Seats</p>
                  <p className="font-semibold text-slate-800">{movieTicket.seatNumbers.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="font-semibold text-green-600">${movieTicket.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Booking Date</p>
                  <p className="font-semibold text-slate-800">{movieTicket.bookingDate}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grab a Bite List */}
        <AnimatePresence>
          {grabABiteList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4">Food & Beverages</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grabABiteList.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.grabABiteId.grabImage && (
                              <img
                                src={`${Urls.Image_url}${item.grabABiteId.grabImage}`}
                                alt={item.grabABiteId.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-slate-800">{item.grabABiteId.name}</p>
                              <p className="text-sm text-slate-600">{item.grabABiteId.foodType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.grabABiteId.description}</td>
                        <td className="py-3 px-4 text-center font-semibold">{item.qty}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">${item.grabABiteId.price}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {qrData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={verifyMovieTicket}
                disabled={isSending}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                  isSending
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl"
                }`}
              >
                {isSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify Ticket
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetScanner}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Scan className="w-5 h-5" />
                Scan Another
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default MovieQRScanner
