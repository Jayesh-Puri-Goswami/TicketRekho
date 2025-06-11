import React, { useState, useCallback, FormEvent } from 'react';
// import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';

// import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import StateTable from '../components/Tables/StateTable';
import url from '../networking/app_urls';
import statesData from '../common/States&City/States&City.json';
import { Building2, ChevronDown, Shield } from 'lucide-react';

const State: React.FC = () => {
  const [state, setState] = useState<string>('');
  // const [file, setFile] = useState<File | null>(null);
  // const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState<boolean>(false);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  const stateNames = Object.keys(statesData);

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   const selectedFile = acceptedFiles[0];
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     setPreviewImage(URL.createObjectURL(selectedFile));
  //   }
  // }, []);

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   accept: {
  //     'image/*': ['.jpeg', '.jpg', '.png'],
  //   },
  //   maxFiles: 1,
  // });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!state) {
      setErrorMessage('State name is required.');
      return;
    }

    // if (!file) {
    //   setErrorMessage('Please upload an image.');
    //   return;
    // }

    setErrorMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('name', state);
    formData.append('stateImage', '');

    try {
      const response = await axios.post(url.CreateStates, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('State added successfully!');
      setState('');

      // setFile(null);
      // setPreviewImage(null);
      setReload((prev) => !prev);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          'Something went wrong while adding the state.',
      );
      setErrorMessage(
        err.response?.data?.message || 'Failed to add state. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Location" />

      <div className="flex flex-col gap-9 mb-9">
        <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* <div className="p-6.5 space-y-6 pb-0">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">
                State Management
              </h1>
            </div>
            <p>
              
            </p>
          </div> */}

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6.5 pt-6.5"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Building2 size={28} className="mr-2 text-indigo-600" />
                States Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage the states of your application. You can add or delete
                states as needed.
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="p-6.5 space-y-6">
              <div className="mb-8 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Select State
                </label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 pr-12 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-primary dark:focus:border-primary"
                  >
                    <option value="" disabled>
                      Choose a State
                    </option>
                    {[...stateNames]
                      .sort((a, b) => a.localeCompare(b))
                      .map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                  </select>

                  {/* Custom dropdown icon */}
                  <div className="pointer-events-none absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500 dark:text-slate-300">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Upload Image
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
                        src={previewImage}
                        alt="Preview"
                        className="mx-auto h-48 object-cover rounded"
                        onError={(e: any) => {
                          e.target.onerror = null; // Prevents looping in case fallback also fails
                          e.target.src =
                            '../../../public/Image/Fallback Image/default-fallback-image.png'; // Your fallback image path
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreviewImage(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
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
                          : 'Drag & drop an image or click to upload'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div> */}

              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={loading || !state}
                className={`w-full py-3 px-4 rounded-xl  font-medium transition-colors duration-500 ${
                  state
                    ? 'bg-indigo-purple hover:bg-indigo-purple-dark text-white'
                    : 'bg-slate-300 cursor-not-allowed text-black'
                }`}
              >
                {loading ? 'Submitting...' : 'Add State'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <StateTable reload={reload} />
    </div>
  );
};

export default State;
