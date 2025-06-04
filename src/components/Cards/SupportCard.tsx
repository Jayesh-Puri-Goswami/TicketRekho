import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Eye, MessageSquareMore } from 'lucide-react';
import { SupportTicket } from '../Utils/SupportGrid';

interface SupportCardProps {
  ticket: SupportTicket;
  onView: () => void;
  onReply: () => void;
  onToggleStatus: () => void;
}

const SupportCard: React.FC<SupportCardProps> = ({
  ticket,
  onView,
  onReply,
  onToggleStatus,
}) => {
  const isActive = ticket.status === 'open';

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -5,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="relative bg-white dark:bg-boxdark rounded-xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Status indicator */}
      <div
        className={`absolute top-0 right-0 w-3 h-3 m-3 rounded-full ${
          isActive ? 'bg-success  animate-pulse' : 'bg-danger  animate-pulse'
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-purple flex items-center justify-center text-white font-bold">
            {ticket.appUserId.name
              ? ticket.appUserId.name.charAt(0).toUpperCase()
              : '?'}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {ticket.appUserId.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ticket.appUserId.email || 'No email provided'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <MessageCircle
              size={16}
              className="mr-2 text-indigo-600 dark:text-indigo-400"
            />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              {truncateText(ticket.title, 40)}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {truncateText(ticket.message, 120)}
          </p>
        </div>

        {/* {ticket.adminReply && (
          <div className="mb-5">
            <div className="flex items-center mb-2">
              <MessageSquareMore
                size={16}
                className="mr-2 text-indigo-600 dark:text-indigo-400"
              />
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Admin Reply
              </h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm bg-indigo-50 dark:bg-gray-700 p-3 rounded-lg">
              {truncateText(ticket.adminReply, 40)}
            </p>
          </div>
        )} */}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
              onClick={onView}
            >
              <Eye size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
              onClick={onReply}
            >
              <MessageSquareMore size={18} />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 1 }}
            // onClick={onToggleStatus}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-success bg-opacity-10 text-success'
                : 'bg-danger bg-opacity-10 text-danger'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportCard;
