import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CityTable from '../components/Tables/CityTable';
import url from '../networking/app_urls';

import statesData from '../common/States&City/States&City.json';
import { Building2, ChevronDown } from 'lucide-react';

const City: React.FC = () => {
  const { id } = useParams();
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await axios.get(`${url.getSingleState}?id=${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setStateName(res.data.data.name);
      } catch (err) {
        console.error('Error fetching state:', err);
      }
    };
    if (id) fetchState();
  }, [id, currentUser.token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cityToSubmit = city === 'custom' ? customCity : city;
    if (!cityToSubmit) return setErrorMessage('City name is required.');

    setErrorMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('name', cityToSubmit);
    formData.append('state', id as string);
    formData.append('cityImage', '');

    try {
      await axios.post(url.CreateCities, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('City added successfully!');
      setCity('');
      setCustomCity('');
      setFile(null);
      setPreviewImage(null);
      setReload((prev) => !prev);
    } catch (error : any) {
      console.error('Error submitting city:', error);
      toast.error(error.response?.data?.message||'Something went wrong while adding the city.');
      setErrorMessage(error.response?.data?.message||'Failed to add city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get all unique cities from statesData
  const allCities: string[] =
    stateName && stateName in statesData
      ? [...statesData[stateName as keyof typeof statesData]].sort((a, b) =>
          a.localeCompare(b),
        )
      : [];

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb
        pageName={`${stateName} / City`}
        parentName="States"
        parentPath="/state"
      />

      <div className="flex flex-col gap-9 mb-9">
        <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6.5 pt-6.5"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Building2 size={28} className="mr-2 text-indigo-600" />
                City Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage the city of your application. You can add, edit, or
                delete city as needed.
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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full appearance-none rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 pr-12 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-primary dark:focus:border-primary"
                  >
                    <option value="" disabled>
                      Choose a City
                    </option>
                    <option value="custom">Add Custom City</option>
                    {[...allCities]
                      .sort((a, b) => a.localeCompare(b))
                      .map((cityName: string) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                  </select>

                  {/* Custom dropdown icon */}
                  <div className="pointer-events-none absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500 dark:text-slate-300">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {city === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Custom City Name
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter custom city name"
                    className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-primary dark:focus:border-primary"
                  />
                </div>
              )}

              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={
                  loading || !city || (city === 'custom' && !customCity)
                }
                className={`w-full py-3 px-4 rounded-xl font-medium transition ${
                  city && (city !== 'custom' || customCity)
                    ? 'bg-indigo-purple hover:bg-indigo-purple-dark text-white'
                    : 'bg-slate-300 cursor-not-allowed text-black'
                }`}
              >
                {loading ? 'Submitting...' : 'Add City'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CityTable stateName={stateName} reload={reload} />
    </div>
  );
};

export default City;
