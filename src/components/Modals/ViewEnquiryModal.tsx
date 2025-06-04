import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, MessageCircle, Calendar, Reply } from 'lucide-react';
import { EnquiryTicket } from './EnquiryGrid';

interface ViewEnquiryModalProps {
  ticket: EnquiryTicket;
  onClose: () => void;
  onReply: () => void;
}

const ViewEnquiryModal: React.FC<ViewEnquiryModalProps> = ({ ticket, onClose, onReply }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { 
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black bg-opacity-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          ref={modalRef}
          className="w-full max-w-2xl bg-white dark:bg-boxdark rounded-xl shadow-xl overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="px-6 py-4 bg-indigo-purple text-white flex justify-between items-center">
            <h3 className="text-xl font-semibold">Enquiry Details</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-purple flex items-center justify-center text-white font-bold text-xl">
                  {ticket.name ? ticket.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {ticket.name || 'Unknown User'}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="mr-2 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {ticket.email || 'No email provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <MessageCircle size={18} className="mr-2 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Description
                  </h4>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {ticket.description || 'No description provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Submitted on {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open'
                    ? 'bg-success bg-opacity-10 text-success'
                    : 'bg-danger bg-opacity-10 text-danger'
                }`}>
                  {ticket.status === 'open' ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg mr-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={onClose}
            >
              Close
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-indigo-purple text-white rounded-lg flex items-center hover:opacity-90 transition-opacity"
              onClick={onReply}
            >
              <Reply size={16} className="mr-2" />
              Reply
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewEnquiryModal;