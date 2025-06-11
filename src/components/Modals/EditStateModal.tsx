import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpload, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls'; // Optional if you want to preview old image

interface State {
  _id: string;
  name: string;
  stateImage: string;
}

interface EditStateModalProps {
  state: State | null;
  onClose: () => void;
  onSubmit?: (updatedState: State, stateImageFile: File | null) => void;
}

const EditStateModal: React.FC<EditStateModalProps> = ({
  state,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(state?.name || '');
  const [stateImageFile, setStateImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      setName(state.name);
      setStateImageFile(null);
      setPreviewImage(null);
    }
  }, [state]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setStateImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const handleSubmit = () => {
    if (state) {
      const updatedState = { ...state, name };
      onSubmit(updatedState, stateImageFile);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit State</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* State Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              State Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter State"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>

          {/* Dropzone Uploader */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Upload New Image (104 × 123 px)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 dark:border-form-strokedark'
              }`}
            >
              <input {...getInputProps()} />
              {previewImage ? (
                <div className="relative">
                  <img
                    src={`${previewImage}`}
                    alt="New Preview"
                    className="mx-auto h-48 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStateImageFile(null);
                      setPreviewImage(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ) : state?.stateImage ? (
                <div className="relative">
                  <img
                    src={`${Urls.Image_url}${state.stateImage}`}
                    alt="Existing State"
                    className="mx-auto h-48 object-cover rounded"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <FontAwesomeIcon
                    icon={faUpload}
                    className="text-gray-400 text-3xl mx-auto"
                  />
                  <p className="text-gray-600 dark:text-gray-300">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#1F1F2E] flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 dark:border-strokedark dark:text-white dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStateModal;
