

// export default UpdateMovie;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SeatsTicektTypes {
  seatType: string;
  price: number;
}


interface MovieData {
  id: string;
  movie: string;
  screen: string;
  theatre: string;
  state: string;
  city: string;
  startTime: Date;
  endTime: Date;
  isActive:boolean;
  price: [];
  
}

interface ModalformProps {
   MovieData: MovieData | null; // Pass existing data for updates
  onSubmitSuccess?: (data: any) => void;
}

const UpdateShowTimeModel: React.FC<{ showtimeId: string; onClose: () => void; onSubmitSuccess?: (updatedData: any) => void; }> = ({
  showtimeId,
  onSubmitSuccess,
  onClose,
}) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [movieData, setMovieData] = useState<MovieData | null>(null);

   
     const [startTime, setstartTime] = useState('');
     const [endTime, setendTime] = useState('');
  
    const [movies, setMovies] = useState<{ _id: string; name: string }[]>([]); // To store Movie from API
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
  
  const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date:any) => { 
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
  
      return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


    const formatUTCDate = (date: string | Date) => {
      try {
        const utcDate = new Date(date);  // Parse the UTC date string
    
        // Adjust the date to your desired local timezone (in this case Asia/Kolkata)
        const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    
        // Format the local date to "yyyy-MM-dd HH:mm"
        return format(localDate, 'yyyy-MM-dd HH:mm');
      } catch (error) {
        console.error('Error formatting time:', error);
        return ''; // Return an empty string in case of an error
      }
    };


  useEffect(() => {


    const fetchMovieData = async () => {
      try {
        const response = await axios.get(
          `${Urls.getMovieShowtimesbyId}?showtimeId=${showtimeId}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          },
        );

        const data = response.data.data;
        setMovieData(data);
        setSelectedMovieId(data.movie);
        setSelectedTheatreId(data.theatre);
        setSelectedScreenId(data.screen);
        setSelectedStateId(data.state);
        setSelectedCityId(data.city);
        setstartTime(formatUTCDate(data.startTime));
        setendTime(formatUTCDate(data.endTime));

        fetchScreens(data.theatre);
        fetchCities(data.state);
        setSeatTypes(data.price);

      
      } catch (error) {
        console.error('Error fetching showtime data:', error);
      }
    };

   
  
  
    fetchMovieData();

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
  }, [currentUser.token]);
  


  const fetchScreens = async (selectedTheatreId: string) => {
    try {
      const response = await axios.post(`${Urls.getActiveScreensByThreatreId}`,{theatre:selectedTheatreId }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      }); // Replace with your API endpoint
     // console.log(response.data.data)
      setScreens(response.data.data); 
    } catch (error) {
      console.error('Error fetching screens:', error);
    }
  };
  
  const fetchSeatsName = async (screenId: string) => {
    try {
      const response = await axios.get(`${Urls.getSeatNames}?screenId=${screenId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      }); // Replace with your API endpoint
     // console.log(response.data.data)
   //  console.log("response.data.data",response.data.data);
    const seatsTypeList = response.data.data;
    console.log("seatsTypeList",seatsTypeList);
     setSeatTypes(response.data.data); 
  
    } catch (error) {
      console.error('Error fetching seat types:', error);
    }
  };
  
  const fetchCities = async (selectedStateId: string) => {
    try {
      const response = await axios.post(`${Urls.getCitiesListByState}`,{state:selectedStateId}, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      }); // Replace with your API endpoint
     // console.log("City",response.data.data)
      setCities(response.data.data); 
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };
  
    const handleMovieChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedMovieId = event.target.value;
     // console.log("selectedMovieId",selectedMovieId);
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
  
  useEffect(() => {
    if (selectedStateId) {
     // fetchCities(selectedStateId); // Fetch cities for the selected state
    }
  }, [selectedStateId]); // Runs when selectedStateId updates

  
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

 

    const invalidSeats = seatTypes.filter(seat => seat.price <= 0);

    if (invalidSeats.length > 0) {
     // console.log("Validation failed. The following seat types have invalid prices:");
      invalidSeats.forEach(seat => {
        toast.error(
         `- ${seat.seatType} should have a price greater than 0`,
        );
      });
      setError('Price should be greater than 0.');
      return;
    }
    
    setIsLoading(true);

    const formData ={
      id:showtimeId,
      movie:selectedMovieId,
      theatre:selectedTheatreId,
      screen:selectedScreenId,
      // state:selectedStateId,
      // city:selectedCityId,
      startTime:startTime,
      endTime:endTime,
      isDeleted:false,
      price:seatTypes
    };

    
  

    try {
      const response = await axios.post(`${Urls.updateMovieShowTime}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
         'Content-Type': 'application/json',
        },
      });
      toast.success('ShowTime data updated successfully!');
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error updating showtime data:', error);
      toast.error('Error updating showtime data.');
    } finally {
      setIsLoading(false); // Set loading to false after the request is completed
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

  if (!movieData) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-999"
      >
        <div className="w-64 h-64 bg-white p-6 rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
          {/* Loader */}
          <div className="animate-spin rounded-full border-t-4 border-blue-500 w-24 h-24 border-b-4 border-gray-200"></div>
          <p className="text-xl text-gray-700 font-semibold">
            Loading ShowTime data...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-gray-800 flex items-center justify-center bg-black bg-opacity-50 z-999"
    >
      <form
        onSubmit={handleFormSubmit}
        onClick={(e) => e.stopPropagation()}
        className="rounded border bg-white shadow p-6 w-full max-w-3xl max-h-[85vh] overflow-y-scroll space-y-4 transform translate-x-30"
      >
        <h2 className="text-xl font-bold">Update ShowTime</h2>


       
    {/* Movie Selection */}
    <div className="mb-4.5 md:col-span-2">
      <label className="mb-2.5 block text-black dark:text-white">Select Movie</label>
      <select
        id="movie"
        value={selectedMovieId}
        onChange={handleMovieChange}
        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>Select Movie</option>
        {movies.map((movie) => (
          <option key={movie._id} value={movie._id} className="capitalize">{movie.name}</option>
        ))}
      </select>
    </div>
  


    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    {/* Theatre Selection */}
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">Select Theatre</label>
      <select
        id="theatre"
        value={selectedTheatreId}
        onChange={handleTheatreChange}
        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>Select Theatre</option>
        {theatres.map((theatre) => (
          <option key={theatre._id} value={theatre._id} className="capitalize">{theatre.name}</option>
        ))}
      </select>
    </div>

    {/* Screen Selection */}
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">Select Screen</label>
      <select
        id="screen"
        value={selectedScreenId}
        onChange={handleScreenChange}
        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>Select Screen</option>
        {screens.map((screen) => (
          <option key={screen._id} value={screen._id} className="capitalize">{screen.name}</option>
        ))}
      </select>
    </div>
    </div>
  {/* State Selection */}

    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
  
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">Select State</label>
      <select
        id="state"
        value={selectedStateId}
        onChange={handleStateChange}
        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>Select State</option>
        {states.map((state) => (
          <option key={state._id} value={state._id} className="capitalize">{state.name}</option>
        ))}
      </select>
    </div> */}

    {/* City Selection */}
    {/* <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">Select City</label>
      <select
        id="city"
        value={selectedCityId}
        onChange={handleCityChange}
        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>Select City</option>
        {cities.map((city) => (
          <option key={city._id} value={city._id} className="capitalize">{city.name}</option>
        ))}
      </select>
    </div>
  </div> */}



  {/* Start & End Date Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    {/* Start Time */}
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">Start Time</label>
      <input
        type="datetime-local"
        min={minDateTime}
        max={maxDateTime}
        value={startTime}
        onChange={(e) => setstartTime(e.target.value)}
        className="w-full border rounded p-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
        required
      />
    </div>

    {/* End Time */}
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">End Time</label>
      <input
        type="datetime-local"
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
      <label className="mb-2.5 block text-black dark:text-white">Ticket Name</label>
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
      <label className="mb-2.5 block text-black dark:text-white">Price</label>
      {seatTypes.map((member, index) => (
        <input
          key={index}
          type="text"
          placeholder="Price"
          value={member.price}
          onChange={(e) =>
            setSeatTypes(
              seatTypes.map((c, i) =>
                i === index ? { ...c, price: Number(e.target.value) } : c
              )
            )
          }
          className="w-full border rounded p-2 mb-2 border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
        />
      ))}
    </div>
  </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full justify-center rounded bg-slate-300 p-3 font-medium text-black hover:bg-opacity-90"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray hover:bg-opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default UpdateShowTimeModel;
