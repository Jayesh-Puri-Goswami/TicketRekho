import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Image, Upload, X } from 'lucide-react';
import clsx from 'clsx';

import Urls from '../../networking/app_urls'

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  selectedImage: File | null;
  existingImage: String | null; 
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, selectedImage, existingImage }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (existingImage) {
      setPreviewUrl(existingImage);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageChange(file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  }, [onImageChange]);

  const removeImage = () => {
    onImageChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
  });


  return (
    <div className="w-full">
      {!previewUrl ? (
        <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={clsx(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
              : "border-slate-300 hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-500"
          )}
        >
          <input {...getInputProps()} />
          <Upload 
            className={clsx(
              "w-10 h-10 mb-2",
              isDragActive ? "text-indigo-600" : "text-slate-400"
            )} 
          />
          <p className="text-sm text-center text-slate-600 dark:text-slate-300">
            {isDragActive ? (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Drop the image here</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-center text-slate-500 dark:text-slate-400">
            PNG, JPG, JPEG (max 5MB)
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-lg"
        >
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-40 object-cover rounded-lg"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={removeImage}
            type="button"
            className="absolute top-2 right-2 bg-slate-800/70 hover:bg-slate-900/90 text-white p-1 rounded-full"
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploader;