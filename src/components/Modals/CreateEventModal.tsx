import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import DatePickerOne from '../Forms/DatePicker/DatePickerOne';

interface CastMember {
  name: string;
  role: string;
}

interface EventModalFormProps {
  onSubmitSuccess?: () => void;
}

const EventModalForm: React.FC<EventModalFormProps> = ({ onSubmitSuccess }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [isOpen, setIsOpen] = useState(false);
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
  const [error, setError] = useState<string | null>(null);

  const [states, setStates] = useState<{ _id: string; name: string }[]>([]); // To store States from API
  const [selectedStateId, setSelectedStateId] = useState<string>(''); // Store selected state's ID

  const [cities, setCities] = useState<{ _id: string; name: string }[]>([]); // To store City from API
  const [selectedCityId, setSelectedCityId] = useState<string>(''); // Store selected city's ID

  const [venues, setVenues] = useState<{ _id: string; name: string }[]>([]); // To store City from API
  const [selectedVenueId, setSelectedVenueId] = useState<string>(''); // Store selected city's ID

  const handleAddGenre = () => setGenres([...genres, '']);
  const handleAddLanguage = () => setLanguages([...languages, '']);

  const handleBannerChange = () => {
    setIsBanner(!isBanner);
  };
  const handleAdsChange = () => {
    setIsAds(!isAds);
  };

  const handleEventTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const eventType = event.target.value;
    setEventType(eventType);
    fetchVenues(eventType);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateId = event.target.value;
    fetchCities(selectedStateId);
    setSelectedStateId(selectedStateId);
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = event.target.value;
    setSelectedCityId(selectedCityId);
  };

  const handleVenueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVenueId = event.target.value;
    setSelectedVenueId(selectedVenueId);
  };

  // Fetch events from API on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${Urls.getStatesList}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }); // Replace with your API endpoint

        setStates(response.data.data); // Assuming the response returns an array of roles
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  const fetchVenues = async (type: string) => {
    try {
      const response = await axios.get(
        `${Urls.displayVenueList}?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      ); // Replace with your API endpoint

      setVenues(response.data.data); // Assuming the response returns an array of roles
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (selectedStateId: string) => {
    try {
      const response = await axios.post(
        `${Urls.getCitiesListByState}`,
        { state: selectedStateId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      ); // Replace with your API endpoint
      setCities(response.data.data); // Assuming the response returns an array of roles
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  // Format to "YYYY-MM-DDTHH:mm"
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
    // reset();
    setError(null);
    setName('');
    setDescription('');
    setAddress('');
    setEventType('');
    setArtist('');
    setEventDate('');
    setEventCategory('');
    setGenres([]);
    setLanguages([]);
    setIsBanner(false);
    setIsAds(false);
    setEventImage(null);
    setBannerImage(null);
    setAdvImage(null);
    setSelectedVenueId('');
    setSelectedStateId('');
    setSelectedCityId('');
  };

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

    if (!eventImage) {
      toast.error('Please upload the event image.');
      return;
    }

    if (!bannerImage) {
      toast.error('Please upload the banner image.');
      return;
    }

    if (!advImage) {
      toast.error('Please upload the advertisement image.');
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

    // Construct form-data for submission
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('eventType', eventType);
    formData.append('artist', artist);
    formData.append('eventDate', eventDate);
    formData.append('eventImage', eventImage as Blob);
    formData.append('bannerImage', bannerImage as Blob);
    formData.append('advImage', advImage as Blob);
    // formData.append('address', address);
    // formData.append('state', selectedStateId);
    // formData.append('city', selectedCityId);
    formData.append('venue', selectedVenueId);
    genres.forEach((genre) => formData.append('genre[]', genre));
    languages.forEach((language) => formData.append('language[]', language));
    formData.append('eventCategory', eventCategory);
    formData.append('isBanner', isBanner ? 'true' : 'false');
    formData.append('isAds', isAds ? 'true' : 'false');

    try {
      const response = await axios.post(`${Urls.createEvent}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      //  console.log('Success:', response.data);

      toast.success(
        'Event added successfully! Your new event is now available.',
      );

      clearFormState();
      setIsOpen(false);
      // Call the callback to notify the parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        'Oops! Something went wrong while adding the event. Please try again later.';

      toast.error(errorMessage);
    }
  };

  // const categoryOptions = [
  //   {
  //     label: 'Music',
  //     options: [{ value: 'music', label: 'Music' }],
  //   },
  //   {
  //     label: 'Sports',
  //     options: [
  //       { value: 'football', label: 'Football' },
  //       { value: 'cricket', label: 'Cricket' },
  //       { value: 'sports', label: 'Other Sports' },
  //     ],
  //   },
  //   {
  //     label: 'Theatre',
  //     options: [{ value: 'theatre', label: 'Theatre' }],
  //   },
  //   {
  //     label: 'Comedy',
  //     options: [{ value: 'comedy', label: 'Comedy' }],
  //   },
  //   {
  //     label: 'Workshops',
  //     options: [{ value: 'workshops', label: 'Workshops' }],
  //   },
  //   {
  //     label: 'Exhibitions',
  //     options: [{ value: 'exhibitions', label: 'Exhibitions' }],
  //   },
  //   {
  //     label: 'Festivals',
  //     options: [{ value: 'festivals', label: 'Festivals' }],
  //   },
  //   {
  //     label: 'Conferences',
  //     options: [{ value: 'conferences', label: 'Conferences' }],
  //   },
  //   {
  //     label: 'Shadi',
  //     options: [
  //       { value: 'haldi', label: 'Haldi' },
  //       { value: 'mehndi', label: 'Mehndi' },
  //       { value: 'sagai', label: 'Sagai' },
  //     ],
  //   },
  //   {
  //     label: 'Others',
  //     options: [{ value: 'others', label: 'Others' }],
  //   },
  // ];

  return (
    <div>
      <button
        className="bg-[#865BFF] hover:bg-[#6a48c9] text-white px-7 py-2 rounded "
        onClick={() => setIsOpen(true)}
      >
        Add
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999"
        >
          {/* <div className=" inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 "> */}
          <form
            onSubmit={handleFormSubmit}
            onClick={(e) => e.stopPropagation()}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 w-full max-w-3xl space-y-4 max-h-[85vh] overflow-y-scroll transform translate-x-30"
          >
            <h2 className="text-xl font-bold">Add Event</h2>

            {/* Movie Details */}
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                type="text"
                placeholder="Enter event name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                value={description}
                placeholder="Enter description"
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                rows={3}
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold mb-1">Event Type</label>
              <select
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={eventType}
                onChange={handleEventTypeChange}
                // onChange={(e) => setEventType(e.target.value)}
              >
                <option value="" disabled>
                  Select Event Type
                </option>
                <option value="nonSitting">Non Sitting</option>
                <option value="sitting">Sitting</option>
              </select>
              {/* {error && (
                    <span className="text-red-500">{error}</span>
                  )} */}
            </div>

            <div>
              <label className="block font-semibold mb-1">Artist</label>
              <input
                type="text"
                placeholder="Enter artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Event Date</label>
              <input
                type="datetime-local"
                min={minDateTime}
                max={maxDateTime}
                value={eventDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setEventDate(value);
                  // Parse the input value to a Date object
                  const date = new Date(value);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');

                  const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
                  setEventDate(formattedEndTime);
                }}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
              />
            </div>

            {/* Dynamic Inputs */}
            <div>
              <label className="block font-semibold mb-1">Genres</label>
              {genres.map((genre, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    key={index}
                    type="text"
                    value={genre}
                    onChange={(e) =>
                      setGenres(
                        genres.map((g, i) =>
                          i === index ? e.target.value : g,
                        ),
                      )
                    }
                    className="w-full border rounded p-2 mb-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGenres(genres.filter((_, i) => i !== index))
                    }
                    className="h-10 px-3 bg-red-500 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddGenre}
                className="text-blue-500"
              >
                + Add Genre
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Languages</label>
              {languages.map((language, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    key={index}
                    type="text"
                    value={language}
                    onChange={(e) =>
                      setLanguages(
                        languages.map((l, i) =>
                          i === index ? e.target.value : l,
                        ),
                      )
                    }
                    className="w-full border rounded p-2 mb-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLanguages(genres.filter((_, i) => i !== index))
                    }
                    className="h-10 px-3 bg-red-500 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLanguage}
                className="text-blue-500"
              >
                + Add Language
              </button>
            </div>

            {/* File Uploads */}
            <div>
              <label className="block font-semibold mb-1">
                Event Image (104 × 123 px)
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setEventImage(e.target.files ? e.target.files[0] : null)
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* Banner Uploads */}
            <div>
              <label className="block font-semibold mb-1">
                Banner Image (345 × 153 px)
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setBannerImage(e.target.files ? e.target.files[0] : null)
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* Adv Uploads */}
            <div>
              <label className="block font-semibold mb-1">
                Adv Image (306 × 485 px)
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setAdvImage(e.target.files ? e.target.files[0] : null)
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* <div>
              <label className="block font-semibold mb-1">Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
              />

            
              <div className="mb-4.5">
                <label className="block font-semibold mb-1">Select State</label>
                <select
                  id="state"
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input `}
                >
                  <option
                    value=""
                    disabled
                    className="text-body dark:text-bodydark"
                  >
                    Select State
                  </option>
                  {states.map((state) => (
                    <option
                      key={state._id}
                      value={state._id}
                      className="text-body dark:text-bodydark capitalize"
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
             
              </div>

          
              <div className="mb-4.5">
                <label className="block font-semibold mb-1">Select City</label>
                <select
                  id="city"
                  value={selectedCityId}
                  onChange={handleCityChange}
                  className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input `}
                >
                  <option
                    value=""
                    disabled
                    className="text-body dark:text-bodydark"
                  >
                    Select City
                  </option>
                  {cities.map((city) => (
                    <option
                      key={city._id}
                      value={city._id}
                      className="text-body dark:text-bodydark capitalize"
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
              
              </div>
            </div> */}

            <div>
              <label className="block font-semibold mb-1">Event Category</label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
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
            </div>

            <div className="mb-4.5">
              <label className="block font-semibold mb-1">Select Venue</label>
              <select
                id="venue"
                value={selectedVenueId}
                onChange={handleVenueChange}
                className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input `}
              >
                <option
                  value=""
                  disabled
                  className="text-body dark:text-bodydark"
                >
                  Select Venue
                </option>
                {venues.map((venue) => (
                  <option
                    key={venue._id}
                    value={venue._id}
                    className="text-body dark:text-bodydark capitalize"
                  >
                    {venue.name}
                  </option>
                ))}
              </select>
              {/* {error && (
                    <span className="text-red-500">{error}</span>
                  )} */}
            </div>

            <div className="flex items-center space-x-4">
              {/* Banner Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="checkbox1"
                  checked={isBanner}
                  onChange={handleBannerChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="checkbox1"
                  className="text-sm font-medium text-gray-700"
                >
                  Banner
                </label>
              </div>

              {/* Banner Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="checkbox2"
                  checked={isAds}
                  onChange={handleAdsChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="checkbox2"
                  className="text-sm font-medium text-gray-700"
                >
                  Ads
                </label>
              </div>
            </div>

            {/* Submit Button */}

            <div className="flex gap-5">
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="w-full bg-slate-500 text-white rounded py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white rounded py-2"
              >
                Submit
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
          {/* </div> */}
        </div>
      )}
    </div>
  );
};

export default EventModalForm;
