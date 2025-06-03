import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { MovieTicket } from '../../types/scanner';

interface TicketDetailsProps {
  ticket: MovieTicket;
  bookingId: string;
  successMessage: string | null;
  isVerifying: boolean;
  onVerify: () => Promise<void>;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  bookingId,
  successMessage,
  isVerifying,
  onVerify,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Ticket header with gradient background */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white p-6">
        <motion.div 
          className="absolute inset-0 bg-black opacity-10"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}
        />
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">
                {ticket.movieName}
              </h3>
              <p className="text-white/80 mt-1">
                Booking ID: {bookingId}
              </p>
            </div>
            <motion.span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                successMessage?.includes('successfully')
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {successMessage?.includes('successfully')
                ? 'Verified'
                : ticket.bookingStatus}
            </motion.span>
          </div>
        </div>
      </div>
      
      {/* Zigzag border between ticket sections */}
      <div className="relative h-4">
        <div className="absolute left-0 w-full h-4 flex items-center justify-between">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full bg-gray-100 dark:bg-gray-900" 
            />
          ))}
        </div>
      </div>

      {/* Ticket details */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Theater
                </p>
                <p className="font-medium">
                  {ticket.theaterName}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date
                </p>
                <p className="font-medium">{ticket.date}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showtime
                </p>
                <p className="font-medium">
                  {ticket.showtime}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Seats
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.seatNumbers.map((seat, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05 
                      }}
                      className="px-2 py-1 text-xs rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {seat}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ticket Price
            </p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              ${ticket.ticketPrice.toFixed(2)}
            </p>
          </div>

          {!successMessage && (
            <motion.button
              onClick={onVerify}
              disabled={isVerifying}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white ${
                isVerifying
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Verify Ticket
                </>
              )}
            </motion.button>
          )}
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-md ${
              successMessage.includes('successfully')
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            <div className="flex items-center">
              {successMessage.includes('successfully') ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <X className="w-5 h-5 mr-2" />
              )}
              <p>{successMessage}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TicketDetails;