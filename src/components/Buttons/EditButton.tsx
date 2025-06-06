import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import React from 'react';

type EditButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  label?: string;
  icon?: any;
  className ?: string;
};

const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  title = 'Edit',
  label = 'Edit',
  icon,
  className,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`group flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800/30 transition-all duration-200 text-xs font-medium ${className}`}
      title={title}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="text-indigo-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition"
        />
      )}
      <span className="group-hover:underline">{label}</span>
    </motion.button>
  );
};

export default EditButton;
