import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Languages, Image as ImageIcon, MapPin, User, Calendar, LayoutList } from 'lucide-react';
import ImageUploader from '../Utils/ImageUploader';
import FormField from '../Utils/FormField';

interface EventData {
  id: string;
  name: string;
  description: string;
  eventType: string;
  artist: string;
  eventDate: string;
  eventImage: string;
  bannerImage: string;
  advImage: string;
  address: string;
  state: string;
  city: string;
  venue: string;
  genre: string[];
  language: string[];
  eventCategory: string;
  isBanner: boolean;
  isAds: boolean;
}

const UpdateEvent: React.FC<{
  eventId: string;
  onClose: () => void;
  onSubmitSuccess?: (updatedData: any) => void;
}> = ({ eventId, onSubmitSuccess, onClose }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isOpen, setIsOpen] = useState(true); // Modal is open by default

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // const [address, setAddress] = useState('');
  const [eventType, setEventType] = useState('');
  const [artist, setArtist] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [advImage, setAdvImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingEventImage, setExistingEventImage] = useState('');
  const [existingBannerImage, setExistingBannerImage] = useState('');
  const [existingAdvImage, setExistingAdvImage] = useState('');
  // const [states, setStates] = useState<{ _id: string; name: string }[]>([]);
  // const [selectedStateId, setSelectedStateId] = useState<string>('');
  // const [cities, setCities] = useState<{ _id: string; name: string }[]>([]);
  // const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [venues, setVenues] = useState<{ _id: string; name: string }[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [isBanner, setIsBanner] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatUTCDate = (date: string | Date) => {
    try {
      const utcDate = new Date(date);
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
      return format(localDate, 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.post(
          `${Urls.getEventDetail}`,
          { eventId },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          },
        );

        const data = response.data.data;
        setEventData(data);

        setName(data.name);
        setDescription(data.description);
       // setAddress(data.address);
        setEventType(data.eventType);
        setArtist(data.artist);
        setEventDate(formatUTCDate(data.eventDate));
        setEventCategory(data.eventCategory);
        // setSelectedStateId(data.state._id);
        // setSelectedCityId(data.city._id);
        setSelectedVenueId(data.venue._id);
        setGenres(data.genre);
        setLanguages(data.language);
        setExistingEventImage(data.eventImage || '');
        setExistingBannerImage(data.bannerImage || '');
        setExistingAdvImage(data.advImage || '');
        setIsBanner(data.isBanner);
        setIsAds(data.isAds);

         console.log("data.venue",data.venue._id);
        console.log("Selected Venue",selectedVenueId);
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to load event data.');
      }
    };

    // const fetchStates = async () => {
    //   try {
    //     const response = await axios.get(`${Urls.getStatesList}`, {
    //       headers: {
    //         Authorization: `Bearer ${currentUser.token}`,
    //       },
    //     });
    //     setStates(response.data.data);
    //   } catch (error) {
    //     console.error('Error fetching states:', error);
    //   }
    // };

    fetchEventData();
   // fetchStates();
  }, [eventId, currentUser.token]);

  // useEffect(() => {
  //   if (selectedStateId) {
  //     fetchCities(selectedStateId);
  //   }
  // }, [selectedStateId]);

  useEffect(() => {
    if (eventType) {
      fetchVenues(eventType);
    }
  }, [eventType]);

  // const fetchCities = async (stateId: string) => {
  //   try {
  //     const response = await axios.post(
  //       `${Urls.getCitiesListByState}`,
  //       { state: stateId },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${currentUser.token}`,
  //         },
  //       },
  //     );
  //     setCities(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching cities:', error);
  //   }
  // };

  const fetchVenues = async (eventType: string) => {
    try {
      const response = await axios.get(
        `${Urls.displayVenueList}?type=${eventType}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );
      setVenues(response.data.data);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const handleAddGenre = () => setGenres([...genres, '']);
  const handleAddLanguage = () => setLanguages([...languages, '']);

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value;
    setEventType(eventType);
    fetchVenues(eventType);
  };

  // const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const stateId = e.target.value;
  //   setSelectedStateId(stateId);
  //   fetchCities(stateId);
  // };

  // const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedCityId(e.target.value);
  // };

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVenueId(e.target.value);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Please enter the event name.');
      return;
    }
    if (!description) {
      toast.error('Please enter the event description.');
      return;
    }
    if (!eventType) {
      toast.error('Please select the event type.');
      return;
    }
    if (!artist) {
      toast.error('Please enter the artist name.');
      return;
    }
    if (!eventDate) {
      toast.error('Please select the event date.');
      return;
    }
    if (genres.length === 0) {
      toast.error('Please enter at least one genre.');
      return;
    }
    if (languages.length === 0) {
      toast.error('Please enter at least one language.');
      return;
    }
    // if (!address) {
    //   toast.error('Please enter the address.');
    //   return;
    // }
    // if (!selectedStateId) {
    //   toast.error('Please select the state.');
    //   return;
    // }
    // if (!selectedCityId) {
    //   toast.error('Please select the city.');
    //   return;
    // }
    if (!eventCategory) {
      toast.error('Please enter the event category.');
      return;
    }
    if (!selectedVenueId) {
      toast.error('Please select the venue.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('eventType', eventType);
    formData.append('artist', artist);
    formData.append('eventDate', eventDate);
    // formData.append('address', address);
    // formData.append('state', selectedStateId);
    // formData.append('city', selectedCityId);
    formData.append('venue', selectedVenueId);
    genres.forEach((genre) => formData.append('genre[]', genre));
    languages.forEach((language) => formData.append('language[]', language));
    formData.append('eventCategory', eventCategory);
    formData.append('isBanner', String(isBanner));
    formData.append('isAds', String(isAds));
    if (eventImage) formData.append('eventImage', eventImage);
    if (bannerImage) formData.append('bannerImage', bannerImage);
    if (advImage) formData.append('advImage', advImage);

    try {
      const response = await axios.post(`${Urls.updateEvent}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Event data updated successfully!');
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
      setIsOpen(false);
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Oops! Something went wrong while updating the event. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  if (!eventData) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-indigo-500 w-12 h-12 border-b-4 border-slate-200"></div>
          <p className="text-lg text-slate-700 dark:text-slate-200 font-semibold">
            Loading event data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => {
            setIsOpen(false);
            onClose();
          }}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Update Event
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-5 px-10">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField label="Event Name" name="name">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <LayoutList className="h-4 w-4 text-slate-400" />
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

                    <FormField label="Event Type" name="eventType">
                      <select
                        value={eventType}
                        onChange={handleEventTypeChange}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="" disabled>
                          Select Event Type
                        </option>
                        <option value="nonSitting">Non Sitting</option>
                        <option value="sitting">Sitting</option>
                      </select>
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

                    {/* <FormField label="Address" name="address">
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
                    </FormField> */}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* <FormField label="State" name="state">
                      <select
                        value={selectedStateId}
                        onChange={handleStateChange}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="" disabled>
                          Select State
                        </option>
                        {states.map((state) => (
                          <option key={state._id} value={state._id} className="capitalize">
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </FormField> */}

                    {/* <FormField label="City" name="city">
                      <select
                        value={selectedCityId}
                        onChange={handleCityChange}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="" disabled>
                          Select City
                        </option>
                        {cities.map((city) => (
                          <option key={city._id} value={city._id} className="capitalize">
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </FormField> */}

                    <FormField label="Venue" name="venue">
                      <select
                        value={selectedVenueId}
                        onChange={handleVenueChange}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="" disabled>
                          Select Venue
                        </option>
                        {venues.map((venue) => (
                          <option key={venue._id} value={venue._id} className="capitalize">
                            {venue.name}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Event Category" name="eventCategory">
                      <select
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select a category</option>
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
                                onChange={(e) =>
                                  setGenres(
                                    genres.map((g, i) => (i === index ? e.target.value : g)),
                                  )
                                }
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
                          onClick={handleAddGenre}
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
                                onChange={(e) =>
                                  setLanguages(
                                    languages.map((l, i) => (i === index ? e.target.value : l)),
                                  )
                                }
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
                          onClick={handleAddLanguage}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Language
                        </motion.button>
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Event Image (104 × 123 px)" name="eventImage">
                    <ImageUploader
                      onImageChange={(file: any) => setEventImage(file)}
                      selectedImage={eventImage}
                      existingImage={existingEventImage}
                    />
                  </FormField>

                  <FormField label="Banner Image (345 × 153 px)" name="bannerImage">
                    <ImageUploader
                      onImageChange={(file: any) => setBannerImage(file)}
                      selectedImage={bannerImage}
                      existingImage={existingBannerImage}
                    />
                  </FormField>

                  <FormField label="Advertisement Image (306 × 485 px)" name="advImage">
                    <ImageUploader
                      onImageChange={(file: any) => setAdvImage(file)}
                      selectedImage={advImage}
                      existingImage={existingAdvImage}
                    />
                  </FormField>
                </div>

                {/* Checkboxes */}
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

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Event'
                    )}
                  </motion.button>
                </div>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateEvent;