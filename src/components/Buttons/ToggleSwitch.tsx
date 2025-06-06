import React from 'react';
import { motion } from 'framer-motion';

type StatusToggleProps = {
  id: string | number;
  isActive: boolean;
  onToggle: (id: string | number, currentStatus: boolean) => void;
};

const StatusToggle: React.FC<StatusToggleProps> = ({ id, isActive, onToggle }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id, isActive);
      }}
      className="flex items-center focus:outline-none cursor-pointer"
    >
      <div className="relative">
        {/* Animated Track */}
        <motion.div
          animate={{
            backgroundColor: isActive ? '#6366f1' : '#64748b', // Tailwind: indigo-500 or slate-500
          }}
          transition={{ duration: 0.3 }}
          className="w-11 h-6 rounded-full"
        />

        {/* Animated Thumb */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          style={{
            x: isActive ? 20 : 0,
          }}
        />
      </div>

      {/* Optional Label */}
      <span
        className={`ml-3 text-xs font-semibold transition-colors ${
          isActive
            ? 'text-green-700 dark:text-green-200'
            : 'text-slate-700 dark:text-red-200'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </button>
  );
};

export default StatusToggle;
