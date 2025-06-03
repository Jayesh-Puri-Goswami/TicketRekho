import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface ScannerOverlayProps {
  isActive: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isActive }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl backdrop-blur-sm pointer-events-none z-10 flex flex-col items-center justify-between p-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center justify-center px-4 py-2 bg-indigo-purple backdrop-blur-sm rounded-full mb-2">
          <Camera className="w-5 h-5 text-white mr-2" />
          <span className="text-white font-medium">Scanning QR Code</span>
        </div>
      </div>

      {/* Scanner Frame */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        {/* Scanner corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400" />

        {/* Scanning animation */}
        {isActive && (
          <motion.div
            className="absolute left-0 w-full h-1 bg-indigo-400/70"
            initial={{ top: 0 }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 border-2 border-indigo-400/30 rounded-lg"
          animate={{
            boxShadow: isActive
              ? [
                  '0 0 0 0 rgba(250, 204, 21, 0)',
                  '0 0 0 10px rgba(250, 204, 21, 0.1)',
                  '0 0 0 20px rgba(250, 204, 21, 0)',
                ]
              : 'none',
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </div>

      <div className="text-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mt-5">
        <p className="text-black text-sm">
          Position the QR code within the frame
        </p>
      </div>
    </div>
  );
};

export default ScannerOverlay;