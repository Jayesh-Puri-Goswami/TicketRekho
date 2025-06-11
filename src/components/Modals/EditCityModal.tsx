import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import statesData from '../../common/States&City/States&City.json';
import Urls from '../../networking/app_urls';

interface City {
  _id: string;
  name: string;
  cityImage: string;
}

interface EditCityModalProps {
  city: City | null;
  onClose: () => void;
  onSubmit: (updatedCity: City, cityImageFile: File | null) => void;
  stateName: string;
}

const EditCityModal: React.FC<EditCityModalProps> = ({
  city,
  onClose,
  onSubmit,
  stateName,
}) => {
  const citiesInState = statesData[stateName] || [];

  const [name, setName] = useState(city?.name || '');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(
    city?.name ? !citiesInState.includes(city.name) : false
  );
  const [cityImageFile, setCityImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      setName(city.name);
      setCustomCity('');
      setCityImageFile(null);
      setPreviewImage(null);
      setIsCustomCity(!citiesInState.includes(city.name));
    }
  }, [city, citiesInState]);

  const handleSubmit = () => {
    if (city) {
      const cityNameToSubmit = isCustomCity ? customCity : name;
      const updatedCity = { ...city, name: cityNameToSubmit };
      onSubmit(updatedCity, cityImageFile);
    } else {
      console.warn("❌ EditCityModal received 'null' city object");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit City</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Select City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Select City
            </label>
            <select
              value={isCustomCity ? 'custom' : name}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'custom') {
                  setIsCustomCity(true);
                  setCustomCity('');
                  setName('');
                } else {
                  setIsCustomCity(false);
                  setName(selectedValue);
                }
              }}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-indigo-500 dark:focus:border-indigo-400"
            >
              <option value="" disabled>
                Choose a City
              </option>
              <option value="custom">Add Custom City</option>
              {citiesInState
                .sort((a, b) => a.localeCompare(b))
                .map((cityName: string) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
            </select>
          </div>

          {/* Custom City Input */}
          {isCustomCity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Custom City Name
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Enter custom city name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          )}
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

export default EditCityModal;
