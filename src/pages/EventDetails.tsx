"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Globe, Star, Tag, User, Music, Loader, Navigation } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import axios from "axios"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import Urls from "../networking/app_urls"
import { useParams } from "react-router-dom"

interface EventData {
  _id: string
  name: string
  description: string
  artist: string
  genre: string[]
  language: string[]
  eventType: string
  eventCategory: string
  eventDate: string
  address: string
  eventImage: string
  bannerImage: string
  advImage: string
  isBanner: boolean
  isAds: boolean
  isActive: boolean
  state: {
    _id: string
    name: string
  }
  city: {
    _id: string
    name: string
  }
  venue: {
    _id: string
    name: string
    address: string
  }
  rating: number
  totalRatings: number
  reviews: any[]
  createdAt: string
  updatedAt: string
}

const EventDetail: React.FC = () => {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 1.1])
  const titleY = useTransform(scrollY, [0, 300], [0, 100])

  const currentUser = useSelector((state: any) => state.user.currentUser?.data)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { eventId } = useParams<{ eventId: string }>()

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true)
        console.log(eventId)

        const response = await axios.post(
          `${Urls.getEventDetail}`,
          { eventId },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          },
        )

        const data = response.data.data
        setEventData({
          ...data,
          isBanner: data.isBanner === true || data.isBanner === "true",
          isAds: data.isAds === true || data.isAds === "true",
          isActive: data.isActive === true || data.isActive === "true",
        })
        document.title = `${data.name} | Event Details`
      } catch (error) {
        console.error("Error fetching event data:", error)
        toast.error("Failed to load event data.")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId && currentUser?.token) {
      fetchEventData()
    }
  }, [eventId, currentUser?.token])

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading event details...</h2>
      </div>
    )
  }

  // Format event date
  const eventDate = new Date(eventData.eventDate)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Check if event is upcoming
  const isUpcoming = new Date() < eventDate

  // Calculate days until event
  const daysUntilEvent = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden">
      {/* Hero Section with Banner */}
      <div className="relative h-[70vh] overflow-hidden rounded-xl">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 w-full h-full">
          <img
            src={Urls.Image_url + eventData.bannerImage || "/placeholder.svg"}
            alt={eventData.name}
            className="w-full h-full object-cover object-center"
            onError={(e: any) => {
              e.target.onerror = null
              e.target.src = "../../../public/Image/Fallback Image/fallback-1.jpg"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 mix-blend-overlay" />
        </motion.div>

        <motion.div style={{ y: titleY }} className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              {eventData.genre.map((genre, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full">
                  {genre}
                </span>
              ))}
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                {eventData.eventCategory}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{eventData.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{eventData.artist}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{eventData.venue.name}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Event Info Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Event Image and Quick Info */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl overflow-hidden shadow-xl shadow-indigo-200 relative aspect-square"
            >
              <img
                src={Urls.Image_url + eventData.eventImage || "/placeholder.svg"}
                alt={`${eventData.name} poster`}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.target.onerror = null
                  e.target.src = "../../../public/Image/Fallback Image/fallback-1.jpg"
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                {isUpcoming ? (
                  <div className="text-white font-medium">
                    {daysUntilEvent > 0 ? `In ${daysUntilEvent} days` : "Today"}
                  </div>
                ) : (
                  <div className="text-white font-medium">Event Completed</div>
                )}
              </div>
            </motion.div>

            <div className="mt-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  EVENT TYPE
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md capitalize">
                    {eventData.eventType}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md capitalize">
                    {eventData.eventCategory}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  LANGUAGES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {eventData.language.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Navigation size={16} />
                  LOCATION
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{eventData.venue.name}</div>
                  <div className="text-slate-600">{eventData.venue.address}</div>
                  <div className="text-slate-600">
                    {eventData.city.name}, {eventData.state.name}
                  </div>
                </div>
              </motion.div>

              {eventData.rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-xl p-4 shadow-md"
                >
                  <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                    <Star size={16} />
                    RATING
                  </h3>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.div
                          key={star}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 + star * 0.1 }}
                        >
                          <Star
                            size={20}
                            className={
                              star <= Math.round(eventData.rating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-slate-300"
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                    <span className="ml-2 text-lg font-semibold">{eventData.rating.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-slate-500">({eventData.totalRatings} reviews)</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Music className="text-indigo-500" />
                About This Event
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">{eventData.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Artist</h4>
                  <p className="text-slate-600">{eventData.artist}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Event Date</h4>
                  <p className="text-slate-600">
                    {formattedDate} at {formattedTime}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="text-indigo-500" />
                Venue Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{eventData.venue.name}</h3>
                  <p className="text-slate-600">{eventData.venue.address}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Full Address</h4>
                  <p className="text-slate-600">
                    {eventData.address}
                    <br />
                    {eventData.city.name}, {eventData.state.name}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* {isUpcoming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white"
              >
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar />
                  Book Your Tickets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-all duration-200"
                    href="https://ticketrekho.com/TicketRekhoProd.apk"
                  >
                    Book Tickets Now
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-all duration-200"
                  >
                    Get Notified
                  </motion.button>
                </div>
              </motion.div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
