import type React from 'react';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faBuilding,
  faPlus,
  faArrowsRotate,
  faTicket,
  faCalendarDay,
  faFilm,
  faChair,
  faMoneyBill,
  faLocationDot,
  faDisplay,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';

interface Theatre {
  id: string;
  name: string;
  location: string;
  screens: number;
  status: 'Active' | 'Maintenance' | 'Closed';
}

interface Showtime {
  id: string;
  theatreId: string;
  theatreName: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  screenNumber: number;
  startTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
}

interface CardProps {
  title: string;
  total: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  path?: string;
}

const borderColors = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  purple: 'border-purple-500',
  yellow: 'border-yellow-500',
};

const bgColors = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Maintenance: 'bg-yellow-100 text-yellow-700',
  Closed: 'bg-red-100 text-red-700',
};

const CardDataStats: React.FC<CardProps> = ({
  title,
  total,
  icon,
  color,
  path,
}) => {
  return (
    <Link to={path || '#'}>
      <div
        className={`p-5 bg-white shadow rounded-xl transition-all border-t-4 ${borderColors[color]} hover:shadow-lg`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 text-xl flex items-center justify-center rounded-full ${bgColors[color]}`}
          >
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800">{total}</h4>
          </div>
        </div>
      </div>
    </Link>
  );
};

const TheatreManagerDashboard: React.FC = () => {
  const [data, setData] = useState({
    totalShowTime: 0,
    totalTheatre: 0,
    theatreScreens: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [recentShowtimes, setRecentShowtimes] = useState<Showtime[]>([]);
  const [loadingTheatres, setLoadingTheatres] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [activeTheatreFilter, setActiveTheatreFilter] = useState<string | null>(
    null,
  );

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const navigate = useNavigate();

  const getRecentShowtimes = (showtimes: Showtime[]) => {
    return [...showtimes].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const mapShowtime = (showtime: any): Showtime => ({
    id: showtime._id,
    theatreId: showtime.theatre._id,
    theatreName: showtime.theatre.name,
    movieId: showtime.movie._id,
    movieTitle: showtime.movie.name,
    moviePoster: showtime.movie.movieImage,
    screenNumber: showtime.screen.name,
    startTime: new Date(showtime.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTime: new Date(showtime.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: showtime.price[0]?.price || 0,
    availableSeats: showtime.screen.seatingCapacity,
    totalSeats: showtime.screen.seatingCapacity,
    createdAt: showtime.createdAt,
  });

  const fetchTheaterData = async () => {
    try {
      const response = await axios.get(`${Urls.theatreManagerDashboard}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (response.data.status) {
        const backendData = response.data.data;
        const mappedTheatres: Theatre[] = backendData.theaters.map(
          (theatre: any) => ({
            id: theatre._id,
            name: theatre.name,
            location: theatre.location,
            screens: backendData.theatreScreens.filter(
              (screen: any) => screen.theatre === theatre._id,
            ).length,
            status: theatre.isActive ? 'Active' : 'Closed',
          }),
        );
        const mappedShowtimes: Showtime[] =
          backendData.showTimes.map(mapShowtime);
        const sortedRecent = getRecentShowtimes(mappedShowtimes);
        setData(backendData);
        setTheatres(mappedTheatres);
        setShowtimes(mappedShowtimes);
        setRecentShowtimes(sortedRecent);
        setLoadingTheatres(false);
        setLoadingShowtimes(false);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaterData();
  }, []);

  const filteredShowtimes = activeTheatreFilter
    ? recentShowtimes.filter((s) => s.theatreId === activeTheatreFilter)
    : recentShowtimes;

  return (
    <div className="p-6">
      <Breadcrumb pageName="Theatre Owner Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        <CardDataStats
          title="Total ShowTimes"
          total={data.totalShowTime.toString()}
          icon={faClock}
          color="blue"
          path="/showtime"
        />
        <CardDataStats
          title="Total Theatres"
          total={data.totalTheatre.toString()}
          icon={faBuilding}
          color="purple"
          path="/theatres"
        />
        <CardDataStats
          title="Total Theatre Screens"
          total={data.theatreScreens.length.toString()}
          icon={faDisplay}
          color="green"
          path="/theatres"
        />
      </div>

      {/* <div className="my-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeTheatreFilter
            ? `Recent Showtimes for ${theatres.find(
                (t) => t.id === activeTheatreFilter,
              )?.name}`
            : 'Recently Created Showtimes'}
        </h2>

        {filteredShowtimes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <FontAwesomeIcon
              icon={faTicket}
              className="text-4xl text-gray-400 mb-3"
            />
            <h3 className="text-lg font-medium text-gray-700">
              No showtimes found
            </h3>
            <p className="text-gray-500">No recent showtimes to display.</p>
          </div>
        ) : (
          filteredShowtimes.map((showtime) => (
            <div
              key={showtime.id}
              className="flex bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-shadow"
            >
              <div
                className="relative w-24 h-24 group cursor-pointer mr-3"
                onClick={() =>
                  navigate(`/showtime-realtime-seat-status/${showtime.id}`)
                }
              >
                <img
                  src={Urls.Image_url + showtime.moviePoster}
                  alt={showtime.movieTitle}
                  className="w-full h-full object-cover rounded transition-all duration-300"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src =
                      '../../../public/Image/Fallback Image/default-fallback-image.png';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded" />

                <div className="absolute inset-0 flex items-end justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Showtimes
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3
                    onClick={() =>
                      navigate(`/showtime-realtime-seat-status/${showtime.id}`)
                    }
                    className="font-semibold text-lg text-gray-800 transition-colors duration-300 hover:text-indigo-500 cursor-pointer"
                  >
                    {showtime.movieTitle}
                  </h3>
                  {!activeTheatreFilter && (
                    <span className="text-sm text-[#472da9] font-medium">
                      {showtime.theatreName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Screen{' '}
                  <span className="font-semibold">{showtime.screenNumber}</span>{' '}
                  • {showtime.startTime} - {showtime.endTime}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
                    {showtime.price.toFixed(2)}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                    <FontAwesomeIcon icon={faChair} className="mr-1" />
                    {showtime.availableSeats} / {showtime.totalSeats} seats
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                    Created
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div> */}
    </div>
  );
};

export default TheatreManagerDashboard;
