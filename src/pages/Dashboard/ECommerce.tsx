import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // faFilm,
  // faCalendarAlt,
  // faUsers,
  // faUserTie,
  faUserCheck,
  faUserGroup,
  faTheaterMasks,
  faClock,
  faMapMarkedAlt,
  faCalendarCheck,
  faTicketAlt,
  faTicket,
  faFilm,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
// import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// import { motion } from 'framer-motion';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import CouponForm from '../../components/CouponForm';
import { Loader } from 'lucide-react';

// Types
interface Movie {
  _id: number;
  name: string;
  movieImage: string;
  releaseDate: string;
  description: string;
}
interface Event {
  _id: number;
  name: string;
  movieImage: string;
  releaseDate: string;
  description: string;
  eventImage: string;
  eventDate: string;
}

// interface Advertisement {
//   id: number;
//   name: string;
//   image: string;
//   type: 'Movie' | 'Event';
// }

interface Coupon {
  _id: string;
  applicableTo: 'movie' | 'event';
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  code: string;
  expirationDate: string;
  isActive: boolean;
}

// Sample data

// const advertisements: Advertisement[] = [
//   {
//     id: 1,
//     name: 'Summer Blockbuster',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Movie',
//   },
//   {
//     id: 2,
//     name: 'Music Festival',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Event',
//   },
//   {
//     id: 3,
//     name: 'New Release Promo',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Movie',
//   },
//   {
//     id: 4,
//     name: 'Comedy Night',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Event',
//   },
//   {
//     id: 5,
//     name: 'Holiday Special',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Movie',
//   },
//   {
//     id: 6,
//     name: 'Weekend Marathon',
//     image: '/placeholder.svg?height=100&width=200',
//     type: 'Movie',
//   },
// ];

// const managerChartData = {
//   active: 0,
//   inactive: 12,
// };

// const AdvertisementSkeleton = () => (
//   <div className="flex items-center p-3 mb-3 bg-[#ffffff] rounded-lg animate-pulse">
//     <div className="w-16 h-16 bg-[#f4eefa] rounded-md mr-3"></div>
//     <div className="flex-1">
//       <div className="h-5 bg-[#f4eefa] rounded w-3/4 mb-2"></div>
//       <div className="h-4 bg-[#f4eefa] rounded w-1/4"></div>
//     </div>
//   </div>
// );

const CouponSkeleton = () => (
  <div className="p-3 mb-3 bg-[#ffffff] rounded-lg animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-5 bg-[#f4eefa] rounded w-1/3"></div>
      <div className="h-4 bg-[#f4eefa] rounded w-1/4"></div>
    </div>
    <div className="mt-2 flex justify-between">
      <div className="h-4 bg-[#f4eefa] rounded w-1/4"></div>
      <div className="h-4 bg-[#f4eefa] rounded w-2/5"></div>
    </div>
  </div>
);

// Tailwind dynamic color utility
const colorConfig = [
  'blue',
  'green',
  'purple',
  'yellow',
  'red',
  'indigo',
  'teal',
  'cyan',
  'pink',
  'emerald',
  'rose',
];

// Card component
const CardDataStats: React.FC<{
  title: string;
  total: string;
  icon: any;
  color: string;
}> = ({ title, total, icon, color }) => {
  return (
    <div
      className={`p-5 bg-white shadow rounded-xl transition-all border-t-4 border-${color}-500 hover:shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 text-xl flex items-center justify-center rounded-full bg-${color}-100 text-${color || 'rose'}-600`}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h4 className="text-2xl font-bold text-gray-800">{total}</h4>
        </div>
      </div>
    </div>
  );
};

const ECommerce: React.FC = () => {
  const [data, setData] = useState({
    totalMovie: 0,
    totalEvent: 0,
    totalUser: 0,
    totalManager: 0,
  });
  const [latestMovies, setLatestMovies] = useState<Movie[]>([
    {
      _id: 0,
      name: '',
      movieImage: '',
      releaseDate: '',
      description: '',
    },
  ]);

  const [managerData, setManagerData] = useState({
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponsClicked, setCouponClicked] = useState(false);
  const [couponRefreshClicked, setCouponsRefreshClicked] = useState(false);
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const [showModal, setShowModal] = useState(false);

  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      _id: 'NAN',
      applicableTo: 'movie',
      description: 'NAN',
      discountType: 'percentage',
      discountValue: 0,
      code: 'NAN',
      expirationDate: 'NAN',
      isActive: false,
    },
  ]);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const response = await axios.get(`${Urls.adminDashboard}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (response.data.status) {
        setLoading(true);
        setData(response.data.data);
        setLatestMovies(response.data.data?.movieList);
        setLatestEvents(response.data.data?.eventList);

        const activeManagers = response.data.data?.totalActiveManager || 0;
        const inactiveManagers =
          response.data.data?.totalManager -
            response.data.data?.totalActiveManager || 0;
        setManagerData({
          active: activeManagers,
          inactive: inactiveManagers,
        });
        setCoupons(response.data.data?.coupons || []);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
      // setLoadingAds(false);
      // setLoadingCoupons(false);
      setTimeout(() => {
        setCouponsRefreshClicked(false);
        setLoadingCoupons(false);
      }, 1000);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const adminCards = [
    
    {
      title: 'Onboarded Clients',
      total: '50', //data.totalMovie
      icon: faUserCheck,
      path: '/movies',
    },
    {
      title: 'Onboarded Users',
      total: '100000', //data.totalMovie
      icon: faUserGroup,
      path: '/movies',
    },
    {
      title: 'Onboarded Theaters',
      total: '250', //data.totalEvent
      icon: faTheaterMasks,
      path: '/events',
    },
    {
      title: 'Onboarded Venus',
      total: '250', //data.totalEvent
      icon: faMapMarkedAlt,
      path: '/events',
    },
    {
      title: 'Running Showtimes',
      total: '1000', //data.totalUser
      icon: faClock,
      path: '/users',
    },
    {
      title: 'Running Events',
      total: '1000', //data.totalUser
      icon: faCalendarCheck,
      path: '/users',
    },
    {
      title: 'Daily Movie Ticket Sold ',
      total: '50000' , //data.totalManager
      icon: faFilm ,
      path: '/managers',
    },
    {
      title: 'Daily Event Ticket Sold ',
      total: '50000' , // data.totalManager
      icon: faTicket,
      path: '/managers',
    },
  ];

  // const chartOptions = {
  //   chart: {
  //     type: 'donut' as const,
  //   },
  //   // Set solid base colors for both slices
  //   colors: ['#6366F1', '#e0e0e0'],
  //   fill: {
  //     type: 'gradient',
  //     gradient: {
  //       shade: 'light',
  //       type: 'horizontal', // left to right
  //       shadeIntensity: 0.5,
  //       gradientToColors: ['#8B5CF6', '#e0e0e0'], // second entry is same as base to disable gradient on second slice
  //       inverseColors: false,
  //       opacityFrom: 1,
  //       opacityTo: 1,
  //       stops: [0, 100],
  //     },
  //   },
  //   labels: ['Active Managers', 'Inactive Managers'],
  //   plotOptions: {
  //     pie: {
  //       donut: {
  //         size: '70%',
  //         labels: {
  //           show: true,
  //           total: {
  //             show: true,
  //             label: 'Total Managers',
  //             formatter: () => managerData.active + managerData.inactive,
  //           },
  //         },
  //       },
  //     },
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   legend: {
  //     position: 'bottom' as const,
  //     offsetY: 0,
  //     height: 40,
  //   },
  // };

  // const chartSeries = [managerData.active, managerData.inactive];

  const Navigate = useNavigate();

  // const handleAddClick = () => {
  //   setAdvClicked(true);
  //   setTimeout(() => setAdvClicked(false), 300);
  //   Navigate('/advertisement');
  // };

  // const handleRefreshClick = () => {
  //   setAdvRefreshClicked(true);
  //   setLoadingAds(true);
  //   fetchData();
  //   setTimeout(() => setAdvRefreshClicked(false), 1000);
  //   setTimeout(() => setLoadingAds(false), 1000);
  // };

  const handleAddCouponsClick = () => {
    setCouponClicked(true);
    setTimeout(() => setCouponClicked(false), 300);
    // Navigate('/coupon');
    setShowModal(true);
  };

  const handleCouponsRefreshClick = () => {
    try {
      setLoadingCoupons(true);
      setCouponsRefreshClicked(true);
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error('Error refreshing coupons:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">
          Loading Dashboard...
        </h2>
      </div>
    );
  }
  if (error)
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;

  return (
    <>
      {/* <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Welcome 
        </h2>
      </div> */}
      {/* <Breadcrumb pageName="Dashboard" /> */}

      <motion.div className="p-4 md:p-6 lg:p-8">
        {/* <h2 className="text-2xl font-semibold mb-6 text-gray-700">Dashboard</h2> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {adminCards.map((item, index) => (
            <Link to={item.path} key={index}>
              <CardDataStats
                title={item.title}
                total={item.total.toString()}
                icon={item.icon}
                color={colorConfig[index % colorConfig.length]} // rotate color classes
              />
            </Link>
          ))}
        </div>

        {/* Bento Grid Layout */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl shadow-md p-5 md:col-span-2 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-indigo-purple">
                Latest Movies Released
              </h2>
            </div>
            <div className="relative">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 3000 }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  900: {
                    slidesPerView: 3,
                  },
                  1100: {
                    slidesPerView: 4,
                  },
                }}
                className="movie-swiper"
              >
                {latestMovies.map((movie) => (
                  <SwiperSlide key={movie._id}>
                    <div
                      className="bg-gray-100 cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => Navigate(`/movies/detail/${movie._id}`)}
                    >
                      <div className="relative w-full h-48 group">
                        <img
                          src={`${Urls.Image_url}${movie.movieImage}`}
                          alt={movie.name}
                          className="w-full h-full aspect-square"
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src =
                              '/Image/Fallback Image/default-fallback-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded"></div>

                        <div className="absolute inset-0 flex items-end justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-3">
                          Movie Detail
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800">
                          {movie.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Released:{' '}
                          {new Date(movie.releaseDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-indigo-purple">
                All Managers Status
              </h2>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={300}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-indigo-purple">
                Active Coupons
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddCouponsClick}
                  className={`p-2 bg-indigo-purple text-white rounded-md hover:bg-[#3a2587] transition-transform ${
                    couponsClicked ? 'scale-90' : 'scale-100'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

              </div>
            </div>
            <div className="h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {loadingCoupons
                ? Array(5)
                    .fill(0)
                    .map((_, index) => <CouponSkeleton key={index} />)
                : coupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="p-3 mb-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">
                          {coupon.code}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        
                        {coupon.discountType === 'percentage' ? (
                          <span className="text-[#9264c9] font-semibold">
                            {coupon.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-[#9264c9] font-semibold">
                            ₹{coupon.discountValue} OFF
                          </span>
                        )}
                        <span className="text-gray-500">
                          Valid until:{' '}
                          {new Date(coupon.expirationDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

         
          <div className="bg-white rounded-xl shadow-md p-5 md:col-span-2 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-indigo-purple">
                Latest Events Released
              </h2>
            </div>
            <div className="relative">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 3500 }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  900: {
                    slidesPerView: 3,
                  },
                  1100: {
                    slidesPerView: 4,
                  },
                }}
                className="movie-swiper"
              >
                {latestEvents.map((event) => (
                  <SwiperSlide key={event._id}>
                    <div
                      className="bg-gray-100 cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => Navigate(`/events/detail/${event._id}`)}
                    >
                      <div className="relative w-full h-48 group">
                        <img
                          src={`${Urls.Image_url}${event?.eventImage}`}
                          alt={event.name}
                          className="w-full h-48 lg:object-cover md:object-cover object-center"
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src =
                              '/Image/Fallback Image/default-fallback-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black  to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded"></div>

                        <div className="absolute inset-0 flex items-end justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-3">
                          Event Detail
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Released:{' '}
                          {new Date(event.eventDate).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div> */}

        {/* <CouponForm
          onSubmitSuccess={handleCouponsRefreshClick}
          onCancel={() => {
            setShowModal(false);
          }}
          show={showModal}
        /> */}
      </motion.div>
    </>
  );
};

export default ECommerce;
