import React from 'react';
import { motion } from 'framer-motion';
import { User, Eye, MessageSquareMore, Trash2 } from 'lucide-react';
import { EnquiryTicket } from '../Utils/EnquiryGrid';

interface EnquiryCardProps {
  ticket: EnquiryTicket;
  onView: () => void;
  onReply: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({ 
  ticket, 
  onView, 
  onReply, 
  onDelete,
  onToggleStatus 
}) => {
  const isActive = ticket.status === 'open';
  
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut" 
      }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.2,
        ease: "easeOut" 
      }
    }
  };

  return (
    <motion.div
      className="relative bg-white dark:bg-boxdark rounded-xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div 
        className={`absolute top-0 right-0 w-3 h-3 m-3 rounded-full ${
          isActive ? 'bg-success' : 'bg-danger'
        }`}
      />
      
      <div className="p-5">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-purple flex items-center justify-center text-white font-bold">
            {ticket.name ? ticket.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {ticket.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ticket.email || 'No email provided'}
            </p>
          </div>
        </div>
        
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <User size={16} className="mr-2 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              Description
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {truncateText(ticket.description, 120)}
          </p>
        </div>
        
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleStatus}
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

export default EnquiryCard;