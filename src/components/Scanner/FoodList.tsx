import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { GrabABiteItem } from '../../types/scanner';
import Urls from '../../networking/app_urls';

interface FoodListProps {
  items: GrabABiteItem[];
}

const FoodList: React.FC<FoodListProps> = ({ items }) => {
  const totalPrice = items.reduce(
    (total, item) => total + item.grabABiteId.price * item.qty,
    0
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  if (items.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
        <div className="flex items-center">
          <Utensils className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-semibold">
            Food & Beverages
          </h3>
        </div>
        <p className="text-white/80 mt-1">
          Items ordered with your ticket
        </p>
      </div>
      
      {/* Zigzag border between sections */}
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
      
      <div className="p-6">
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 transition-colors"
            >
              {item.grabABiteId.grabImage && (
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-amber-100 dark:bg-amber-900/20">
                  <img
                    src={`${Urls.Image_url}${item.grabABiteId.grabImage}`}
                    alt={item.grabABiteId.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.grabABiteId.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {item.grabABiteId.description}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium text-amber-600 dark:text-amber-400">
                  ${item.grabABiteId.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {item.qty}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-amber-100 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 flex justify-between items-center">
        <div className="text-sm text-amber-700 dark:text-amber-300">
          Total Food Items: {items.length}
        </div>
        <div className="font-bold text-lg text-amber-700 dark:text-amber-300">
          ${totalPrice.toFixed(2)}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodList;