import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { EnquiryTicket } from '../Utils/EnquiryGrid';

interface ReplyEnquiryModalProps {
  ticket: EnquiryTicket;
  onClose: () => void;
  onSubmit: (ticketId: string, replyMessage: string) => void;
  isReply?: boolean;
}

const ReplyEnquiryModal: React.FC<ReplyEnquiryModalProps> = ({ ticket, onClose, onSubmit, isReply }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit(ticket._id, replyMessage);
      setIsSubmitting(false);
    }, 800);
  };

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
            <h3 className="text-xl font-semibold">Reply to Enquiry</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Message:
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    From: {ticket.name}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {ticket.description || 'No description provided'}
                  </p>
                </div>
              </div>
              
              <div>
                <label 
                  htmlFor="reply-message" 
                  className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Reply:
                </label>
                <textarea
                  ref={textareaRef}
                  id="reply-message"
                  rows={6}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black focus:border-primary focus:ring-0 dark:border-strokedark dark:bg-boxdark dark:text-white dark:focus:border-primary"
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg mr-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-4 py-2 bg-indigo-purple text-white rounded-lg flex items-center hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting || !replyMessage.trim() || isReply }
              >
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReplyEnquiryModal;