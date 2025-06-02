import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import DatePickerOne from '../Forms/DatePicker/DatePickerOne';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SeatsTicektTypes {
  seatType: string;
  price: number;
}

interface ModalformProps {
  onSubmitSuccess?: (data: any) => void;
}

const ShowTimeModalForm: React.FC<ModalformProps> = ({ onSubmitSuccess }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [isOpen, setIsOpen] = useState(false);
  const [reclinerPrice, setReclinerPrice] = useState(0);
  const [diamondPrice, setDiamondPrice] = useState(0);
  const [goldPrice, setGoldPrice] = useState(0);
  const [silverPrice, setSilverPrice] = useState(0);
  const [startTime, setstartTime] = useState('');
  const [endTime, setendTime] = useState('');

  const [movies, setMovies] = useState<
    { _id: string; name: string; runtime: string }[]
  >([]); // To store Movie from API
  const [selectedMovieId, setSelectedMovieId] = useState<string>(''); // Store selected movie's ID

  const [theatres, setTheatres] = useState<{ _id: string; name: string }[]>([]); // To store Theatre from API
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>(''); // Store selected theatre's ID

  const [screens, setScreens] = useState<{ _id: string; name: string }[]>([]); // To store Screen from API
  const [selectedScreenId, setSelectedScreenId] = useState<string>(''); // Store selected screen's ID

  const [states, setStates] = useState<{ _id: string; name: string }[]>([]); // To store States from API
  const [selectedStateId, setSelectedStateId] = useState<string>(''); // Store selected state's ID

  const [cities, setCities] = useState<{ _id: string; name: string }[]>([]); // To store City from API
  const [selectedCityId, setSelectedCityId] = useState<string>(''); // Store selected city's ID

  const [seatTypes, setSeatTypes] = useState<SeatsTicektTypes[]>([]);

  const [runtime, setRunTime] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Fetch movies from API on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${Urls.getdActiveMoviesList}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        setMovies(response.data.data.movieList);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    const fetchTheatres = async () => {
      try {
        const response = await axios.get(`${Urls.getActiveTheatres}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        // console.log(response.data.data)
        setTheatres(response.data.data);
      } catch (error) {
        console.error('Error fetching theatres:', error);
      }
    };

    const fetchStates = async () => {
      try {
        const response = await axios.get(`${Urls.getStatesList}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }); // Replace with your API endpoint
        // console.log("State",response.data.data)
        setStates(response.data.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchMovies();
    fetchTheatres();
    fetchStates();
  }, []);

  const fetchScreens = async (selectedTheatreId: string) => {
    try {
      const response = await axios.post(
        `${Urls.getActiveScreensByThreatreId}`,
        { theatre: selectedTheatreId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      ); // Replace with your API endpoint
      // console.log(response.data.data)
      setScreens(response.data.data);
    } catch (error) {
      console.error('Error fetching screens:', error);
    }
  };

  const fetchSeatsName = async (screenId: string) => {
    try {
      const response = await axios.get(
        `${Urls.getSeatNames}?screenId=${screenId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      ); // Replace with your API endpoint
      // console.log(response.data.data)
      //  console.log("response.data.data",response.data.data);
      const seatsTypeList = response.data.data;
      //console.log("seatsTypeList",seatsTypeList);
      setSeatTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching seat types:', error);
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
      // console.log("City",response.data.data)
      setCities(response.data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  function convertToMinutes(timeStr: string): number {
    const match = timeStr.match(/(\d+)\D+(\d+)/); // Matches "02hrs : 55min"
    if (!match) return 0;

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  }

  const handleMovieChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMovieId = event.target.value;
    //  console.log("selectedMovieId",selectedMovieId);

    // Find the movie from the movieList
    const selectedMovie = movies.find((movie) => movie._id === selectedMovieId);

    if (selectedMovie) {
      const runtimeMovie = Number(convertToMinutes(selectedMovie.runtime));
      console.log('runtimeMovie', runtimeMovie);
      // You can also set it to a state if you want to display somewhere
      setRunTime(runtimeMovie);
    }
    setSelectedMovieId(selectedMovieId);
  };

  const handleTheatreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheatreId = event.target.value;
    // console.log("selectedTheatreId",selectedTheatreId);
    fetchScreens(selectedTheatreId);
    setSelectedTheatreId(selectedTheatreId);
  };

  const handleScreenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedScreenId = event.target.value;
    //  console.log("selectedScreenId",selectedScreenId);
    setSelectedScreenId(selectedScreenId);

    fetchSeatsName(selectedScreenId);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateId = event.target.value;
    // console.log("selectedStateId",selectedStateId);
    fetchCities(selectedStateId);
    setSelectedStateId(selectedStateId);
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = event.target.value;
    // console.log("selectedCityId",selectedCityId);
    setSelectedCityId(selectedCityId);
  };

  const clearFormState = () => {
    // reset();
    setError(null);
    // setSuccess(false);
    setSelectedMovieId('');
    setSelectedTheatreId('');
    setSelectedScreenId('');
    setSelectedStateId('');
    setSelectedCityId('');

    setstartTime('');
    setendTime('');
    setReclinerPrice(0);
    setDiamondPrice(0);
    setGoldPrice(0);
    setSilverPrice(0);
    setSeatTypes([]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovieId) {
      setError('Please select movie name.');
      return;
    }

    if (!selectedTheatreId) {
      setError('Please select theatre name.');
      return;
    }

    if (!selectedScreenId) {
      setError('Please select screen name.');
      return;
    }

    // if (!selectedStateId) {
    //   setError('Please select state.');
    //   return;
    // }
    // if (!selectedCityId) {
    //   setError('Please select city.');
    //   return;
    // }

    const invalidSeats = seatTypes.filter((seat) => seat.price <= 0);

    if (invalidSeats.length > 0) {
      // console.log("Validation failed. The following seat types have invalid prices:");
      invalidSeats.forEach((seat) => {
        toast.error(`- ${seat.seatType} should have a price greater than 0`);
      });
      setError('Price should be greater than 0.');
      return;
    }

    const formData = {
      movie: selectedMovieId,
      theatre: selectedTheatreId,
      screen: selectedScreenId,
      // state: selectedStateId,
      // city: selectedCityId,
      startTime: startTime,
      endTime: endTime,
      price: seatTypes,
    };

    try {
      const response = await axios.post(`${Urls.addMovieShowTime}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      //  console.log('Success:', response.data);
      toast.success(
        'Showtime added successfully! Your new showtime is now available.',
      );
      // setTimeout(() => setSuccess(false), 5000);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      setIsOpen(false);
      clearFormState();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        'Oops! Something went wrong while adding the showtime. Please try again later.',
      );
    }
  };

  //set min and max date range

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
            <h2 className="text-xl font-bold">Add ShowTime</h2>

            {/* Movie Selection */}
            <div className="mb-4.5 md:col-span-2">
              <label className="mb-2.5 block text-black dark:text-white">
                Select Movie
              </label>
              <select
                id="movie"
                value={selectedMovieId}
                onChange={handleMovieChange}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="" disabled>
                  Select Movie
                </option>
                {movies.map((movie) => (
                  <option
                    key={movie._id}
                    value={movie._id}
                    className="capitalize"
                  >
                    {movie.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {/* Theatre Selection */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select Theatre
                </label>
                <select
                  id="theatre"
                  value={selectedTheatreId}
                  onChange={handleTheatreChange}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="" disabled>
                    Select Theatre
                  </option>
                  {theatres.map((theatre) => (
                    <option
                      key={theatre._id}
                      value={theatre._id}
                      className="capitalize"
                    >
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Screen Selection */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select Screen
                </label>
                <select
                  id="screen"
                  value={selectedScreenId}
                  onChange={handleScreenChange}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="" disabled>
                    Select Screen
                  </option>
                  {screens.map((screen) => (
                    <option
                      key={screen._id}
                      value={screen._id}
                      className="capitalize"
                    >
                      {screen.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>



            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select State
                </label>
                <select
                  id="state"
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="" disabled>
                    Select State
                  </option>
                  {states.map((state) => (
                    <option
                      key={state._id}
                      value={state._id}
                      className="capitalize"
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* City Selection */}
              {/* <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select City
                </label>
                <select
                  id="city"
                  value={selectedCityId}
                  onChange={handleCityChange}
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="" disabled>
                    Select City
                  </option>
                  {cities.map((city) => (
                    <option
                      key={city._id}
                      value={city._id}
                      className="capitalize"
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}

            {/* Start & End Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {/* Start Time */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  min={minDateTime}
                  max={maxDateTime}
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setstartTime(value);
                    // Parse the input value to a Date object
                    const date = new Date(value);

                    // Add 30 minutes
                    date.setMinutes(date.getMinutes() + (runtime ?? 0));
                    // format the value as yyyy-MM-dd HH:mm
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    const formattedEndTime = `${year}-${month}-${day} ${hours}:${minutes}`;
                    setendTime(formattedEndTime);
                  }}
                  className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                  required
                />
              </div>

              {/* End Time */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  disabled= {true}
                  min={minDateTime}
                  max={maxDateTime}
                  value={endTime}
                  onChange={(e) => setendTime(e.target.value)}
                  className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                  required
                />
              </div>
            </div>

            {/* Ticket Name & Price Column Layout */}
            <div className="grid grid-cols-2 gap-x-6">
              {/* Ticket Name Column */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  { seatTypes.length !== 0 ? "Ticket Name"  : null }
                </label>
                {seatTypes.map((member, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder="Ticket Name"
                    value={member.seatType}
                    readOnly
                    className="w-full border rounded p-2 mb-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                  />
                ))}
              </div>

              {/* Price Column */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  { seatTypes.length !== 0 ? "Price"  : null }
                </label>
                {seatTypes.map((member, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder="Price"
                    value={member.price}
                    required
                    onChange={(e) =>
                      setSeatTypes(
                        seatTypes.map((c, i) =>
                          i === index
                            ? { ...c, price: Number(e.target.value) }
                            : c,
                        ),
                      )
                    }
                    className="w-full border rounded p-2 mb-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                  />
                ))}
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-4 mt-4">
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

export default ShowTimeModalForm;
