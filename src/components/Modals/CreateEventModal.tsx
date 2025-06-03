import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import toast from 'react-hot-toast';
import { X, Calendar, Film, Languages, Tag, User, MapPin, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../Utils/ImageUploader';
import FormField from '../Utils/FormField';

interface EventModalFormProps {
  onSubmitSuccess?: () => void;
}

const EventModalForm: React.FC<EventModalFormProps> = ({ onSubmitSuccess }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [eventType, setEventType] = useState('');
  const [artist, setArtist] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [advImage, setAdvImage] = useState<File | null>(null);
  const [isBanner, setIsBanner] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const [states, setStates] = useState<{ _id: string; name: string }[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [cities, setCities] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [venues, setVenues] = useState<{ _id: string; name: string }[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${Urls.getStatesList}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        });
        setStates(response.data.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states.',{
        className : 'z-[99999]'
      });
      }
    };

    if (currentUser?.token) {
      fetchStates();
    }
  }, [currentUser?.token]);

  const fetchCities = async (stateId: string) => {
    if (!stateId) {
      setCities([]);
      setSelectedCityId('');
      setVenues([]);
      setSelectedVenueId('');
      return;
    }
    try {
      const response = await axios.post(
        `${Urls.getCitiesListByState}`,
        { state: stateId },
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        }
      );
      setCities(response.data.data || []);
      setSelectedCityId('');
      setVenues([]);
      setSelectedVenueId('');
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities.',{
        className : 'z-[99999]'
      });
    }
  };

  const fetchVenues = async (type: string) => {
    if (!type) {
      setVenues([]);
      setSelectedVenueId('');
      return;
    }
    try {
      const response = await axios.get(
        `${Urls.displayVenueList}?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        }
      );
      setVenues(response.data.data || []);
      setSelectedVenueId('');
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues.',{
        className : 'z-[99999]'
      });
    }
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = event.target.value;
    setSelectedStateId(stateId);
    fetchCities(stateId);
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
  };

  const handleVenueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVenueId(event.target.value);
  };

  const handleEventTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = event.target.value;
    setEventType(eventType);
    fetchVenues(eventType);
  };

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = formatDateTimeLocal(now);
  const maxDateTime = formatDateTimeLocal(nextYear);

  const clearFormState = () => {
    setName('');
    setDescription('');
    setAddress('');
    setEventType('');
    setArtist('');
    setEventDate('');
    setEventCategory('');
    setGenres([]);
    setLanguages([]);
    setEventImage(null);
    setBannerImage(null);
    setAdvImage(null);
    setIsBanner(false);
    setIsAds(false);
    setSelectedStateId('');
    setSelectedCityId('');
    setSelectedVenueId('');
    setCities([]);
    setVenues([]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Please enter the event name.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter the event description.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!eventType) {
      toast.error('Please select the event type.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!artist.trim()) {
      toast.error('Please enter the artist name.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!eventDate) {
      toast.error('Please select the event date.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (genres.length === 0 || genres.some(g => !g.trim())) {
      toast.error('Please add at least one valid genre.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (languages.length === 0 || languages.some(l => !l.trim())) {
      toast.error('Please add at least one valid language.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!eventImage) {
      toast.error('Please upload the event image.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!bannerImage) {
      toast.error('Please upload the banner image.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!advImage) {
      toast.error('Please upload the advertisement image.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!eventCategory) {
      toast.error('Please select the event category.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!selectedVenueId) {
      toast.error('Please select the venue.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter the address.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!selectedStateId) {
      toast.error('Please select the state.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }
    if (!selectedCityId) {
      toast.error('Please select the city.',{
        className : 'z-[99999]'
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('eventType', eventType);
    formData.append('artist', artist);
    formData.append('eventDate', eventDate);
    formData.append('eventImage', eventImage);
    formData.append('bannerImage', bannerImage);
    formData.append('advImage', advImage);
    formData.append('address', address);
    formData.append('state', selectedStateId);
    formData.append('city', selectedCityId);
    formData.append('venue', selectedVenueId);
    genres.forEach((genre) => formData.append('genre[]', genre));
    languages.forEach((language) => formData.append('language[]', language));
    formData.append('eventCategory', eventCategory);
    formData.append('isBanner', String(isBanner));
    formData.append('isAds', String(isAds));

    try {
      await axios.post(`${Urls.createEvent}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser?.token || ''}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Event added successfully! Your new event is now available.',{
        className : 'z-[99999]'
      });
      clearFormState();
      setIsOpen(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Oops! Something went wrong while adding the event. Please try again later.';
      toast.error(errorMessage,{
        className : 'z-[99999]'
      });
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="bg-indigo-purple hover:bg-indigo-purple-dark text-white px-7 rounded h-[2.9rem]"
      >
        <span>Add</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold">Add New Event</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-5 px-10">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField label="Event Name" name="name">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Film className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter event name"
                          />
                        </div>
                      </FormField>

                      <FormField label="Description" name="description">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter event description"
                        />
                      </FormField>

                      <FormField label="Artist" name="artist">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter artist name"
                          />
                        </div>
                      </FormField>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Event Type" name="eventType">
                          <select
                            value={eventType}
                            onChange={handleEventTypeChange}
                            className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="" disabled>Select Event Type</option>
                            <option value="nonSitting">Non Sitting</option>
                            <option value="sitting">Sitting</option>
                          </select>
                        </FormField>

                        <FormField label="Event Category" name="eventCategory">
                          <select
                            value={eventCategory}
                            onChange={(e) => setEventCategory(e.target.value)}
                            className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select event category</option>
                            <optgroup label="Music">
                              <option value="music">Music</option>
                            </optgroup>
                            <optgroup label="Sports">
                              <option value="football">Football</option>
                              <option value="cricket">Cricket</option>
                              <option value="sports">Other Sports</option>
                            </optgroup>
                            <optgroup label="Theatre">
                              <option value="theatre">Theatre</option>
                            </optgroup>
                            <optgroup label="Comedy">
                              <option value="comedy">Comedy</option>
                            </optgroup>
                            <optgroup label="Workshops">
                              <option value="workshops">Workshops</option>
                            </optgroup>
                            <optgroup label="Exhibitions">
                              <option value="exhibitions">Exhibitions</option>
                            </optgroup>
                            <optgroup label="Festivals">
                              <option value="festivals">Festivals</option>
                            </optgroup>
                            <optgroup label="Conferences">
                              <option value="conferences">Conferences</option>
                            </optgroup>
                            <optgroup label="Shadi">
                              <option value="haldi">Haldi</option>
                              <option value="mehndi">Mehndi</option>
                              <option value="sagai">Sagai</option>
                            </optgroup>
                            <optgroup label="Others">
                              <option value="others">Others</option>
                            </optgroup>
                          </select>
                        </FormField>
                      </div>

                      <FormField label="Event Date" name="eventDate">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Calendar className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="datetime-local"
                            min={minDateTime}
                            max={maxDateTime}
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </FormField>
                    </div>

                    <div className="space-y-6">
                      <FormField label="Genres" name="genres">
                        <div className="space-y-2">
                          {genres.map((genre, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Tag className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                  type="text"
                                  value={genre}
                                  onChange={(e) => setGenres(genres.map((g, i) => i === index ? e.target.value : g))}
                                  className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter genre"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setGenres(genres.filter((_, i) => i !== index))}
                                className="px-3 py-2 bg-red-500 text-white rounded-md"
                              >
                                <X size={16} />
                              </motion.button>
                            </div>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setGenres([...genres, ''])}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            + Add Genre
                          </motion.button>
                        </div>
                      </FormField>

                      <FormField label="Languages" name="languages">
                        <div className="space-y-2">
                          {languages.map((language, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Languages className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                  type="text"
                                  value={language}
                                  onChange={(e) => setLanguages(languages.map((l, i) => i === index ? e.target.value : l))}
                                  className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter language"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
                                className="px-3 py-2 bg-red-500 text-white rounded-md"
                              >
                                <X size={16} />
                              </motion.button>
                            </div>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setLanguages([...languages, ''])}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            + Add Language
                          </motion.button>
                        </div>
                      </FormField>

                      <FormField label="Address" name="address">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPin className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter address"
                          />
                        </div>
                      </FormField>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="State" name="state">
                          <select
                            value={selectedStateId}
                            onChange={handleStateChange}
                            className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="" disabled>Select State</option>
                            {states.map((state) => (
                              <option key={state._id} value={state._id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField label="City" name="city">
                          <select
                            value={selectedCityId}
                            onChange={handleCityChange}
                            className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="" disabled>Select City</option>
                            {cities.map((city) => (
                              <option key={city._id} value={city._id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </div>

                      <FormField label="Venue" name="venue">
                        <select
                          value={selectedVenueId}
                          onChange={handleVenueChange}
                          className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="" disabled>Select Venue</option>
                          {venues.map((venue) => (
                            <option key={venue._id} value={venue._id}>
                              {venue.name}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Event Image (104 × 123 px)" name="eventImage">
                        <ImageUploader
                          onImageChange={(file: any) => setEventImage(file)}
                          selectedImage={eventImage}
                        />
                      </FormField>

                      <FormField label="Banner Image (345 × 153 px)" name="bannerImage">
                        <ImageUploader
                          onImageChange={(file: any) => setBannerImage(file)}
                          selectedImage={bannerImage}
                        />
                      </FormField>

                      <FormField label="Advertisement Image (306 × 485 px)" name="advImage">
                        <ImageUploader
                          onImageChange={(file: any) => setAdvImage(file)}
                          selectedImage={advImage}
                        />
                      </FormField>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isBanner}
                          onChange={(e) => setIsBanner(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Banner</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isAds}
                          onChange={(e) => setIsAds(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Ads</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70"
                      style={{
                        background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Add Event'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventModalForm;