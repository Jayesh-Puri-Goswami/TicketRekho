import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilm,
  faCalendarAlt,
  faUsers,
  faUserTie,
  faHeadset,
  faQuestionCircle,
  faTreeCity,
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
import ReactApexChart from 'react-apexcharts';
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


interface Advertisement {
  id: number;
  name: string;
  image: string;
  type: 'Movie' | 'Event';
}

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

const advertisements: Advertisement[] = [
  {
    id: 1,
    name: 'Summer Blockbuster',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Movie',
  },
  {
    id: 2,
    name: 'Music Festival',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Event',
  },
  {
    id: 3,
    name: 'New Release Promo',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Movie',
  },
  {
    id: 4,
    name: 'Comedy Night',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Event',
  },
  {
    id: 5,
    name: 'Holiday Special',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Movie',
  },
  {
    id: 6,
    name: 'Weekend Marathon',
    image: '/placeholder.svg?height=100&width=200',
    type: 'Movie',
  },
];

const managerChartData = {
  active: 0,
  inactive: 12,
};

const AdvertisementSkeleton = () => (
  <div className="flex items-center p-3 mb-3 bg-[#ffffff] rounded-lg animate-pulse">
    <div className="w-16 h-16 bg-[#f4eefa] rounded-md mr-3"></div>
    <div className="flex-1">
      <div className="h-5 bg-[#f4eefa] rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[#f4eefa] rounded w-1/4"></div>
    </div>
  </div>
);

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
  'orange',
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
          className={`w-14 h-14 text-xl flex items-center justify-center rounded-full bg-${color}-100 text-${color}-600`}
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


  const [latestEvents, setLatestEvents] = useState<Event[]>([
    {
      _id: 0,
      name: '',
      movieImage: '',
      releaseDate: '',
      description: '',
    },
  ]);
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
      title: 'Total Events',
      total: data.totalEvent,
      icon: faCalendarAlt,
      path: '/events',
    },
    {
      title: 'Total Movies',
      total: data.totalMovie,
      icon: faFilm,
      path: '/movies',
    },
    {
      title: 'Total Users',
      total: data.totalUser,
      icon: faUsers,
      path: '/users',
    },
    {
      title: 'Total Managers',
      total: data.totalManager,
      icon: faUserTie,
      path: '/managers',
    },
  ];

  const chartOptions = {
    chart: {
      type: 'donut' as const,
    },
    // Set solid base colors for both slices
    colors: ['#6366F1', '#e0e0e0'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal', // left to right
        shadeIntensity: 0.5,
        gradientToColors: ['#8B5CF6', '#e0e0e0'], // second entry is same as base to disable gradient on second slice
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    labels: ['Active Managers', 'Inactive Managers'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Managers',
              formatter: () =>
                managerData.active + managerData.inactive,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom' as const,
      offsetY: 0,
      height: 40,
    },
  };

  const chartSeries = [managerData.active, managerData.inactive];

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
    setShowModal(true)
  };

  const handleCouponsRefreshClick = () => {
    try {
      setLoadingCoupons(true);
      setCouponsRefreshClicked(true);
      fetchData();
      setShowModal(false)
    } catch (error) {
      console.error('Error refreshing coupons:', error);
    }
  };


   if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading Dashboard...</h2>
      </div>
    )
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

      <motion.div  className="p-4 md:p-6 lg:p-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Latest Movies Carousel - Spans 2 columns */}
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
                  1024: {
                    slidesPerView: 2,
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
                      <img
                        src={`${Urls.Image_url}${movie.movieImage}`}
                        alt={movie.name}
                        className="w-full h-48 lg:object-cover md:object-cover object-center"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src =
                            '/Image/Fallback Image/default-fallback-image.png';
                        }}
                      />
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

          {/* Managers Chart */}
          {/* <div className="bg-white rounded-xl shadow-md p-5 flex flex-col">
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
          </div> */}
          {/* Active Coupons Component */}
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

                {/* <button
                  onClick={handleCouponsRefreshClick}
                  className={`p-2 bg-slate-200 text-gray-700 rounded-md hover:bg-gray-300  `}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    className={` transition-transform ${
                      couponRefreshClicked ? 'animate-spin' : 'rotate-360'
                    }`}
                  >
                    <path
                      d="M12.0789 2.25C7.2854 2.25 3.34478 5.913 2.96055 10.5833H2.00002C1.69614 10.5833 1.42229 10.7667 1.30655 11.0477C1.19081 11.3287 1.25606 11.6517 1.47178 11.8657L3.15159 13.5324C3.444 13.8225 3.91567 13.8225 4.20808 13.5324L5.88789 11.8657C6.10361 11.6517 6.16886 11.3287 6.05312 11.0477C5.93738 10.7667 5.66353 10.5833 5.35965 10.5833H4.4668C4.84652 6.75167 8.10479 3.75 12.0789 3.75C14.8484 3.75 17.2727 5.20845 18.6156 7.39279C18.8325 7.74565 19.2944 7.85585 19.6473 7.63892C20.0002 7.42199 20.1104 6.96007 19.8934 6.60721C18.2871 3.99427 15.3873 2.25 12.0789 2.25Z"
                      fill="#1C274C"
                    />
                    <path
                      opacity="0.5"
                      d="M20.8412 10.4666C20.5491 10.1778 20.0789 10.1778 19.7868 10.4666L18.1005 12.1333C17.8842 12.3471 17.8185 12.6703 17.934 12.9517C18.0496 13.233 18.3236 13.4167 18.6278 13.4167H19.5269C19.1456 17.2462 15.876 20.25 11.8828 20.25C9.10034 20.25 6.66595 18.7903 5.31804 16.6061C5.10051 16.2536 4.63841 16.1442 4.28591 16.3618C3.93342 16.5793 3.82401 17.0414 4.04154 17.3939C5.65416 20.007 8.56414 21.75 11.8828 21.75C16.6907 21.75 20.6476 18.0892 21.0332 13.4167H22.0002C22.3044 13.4167 22.5784 13.233 22.694 12.9517C22.8096 12.6703 22.7438 12.3471 22.5275 12.1333L20.8412 10.4666Z"
                      fill="#1C274C"
                    />
                  </svg>
                </button> */}
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
                        <span className="text-[#9264c9] font-semibold">
                          {coupon.discountValue}
                          {coupon.discountType === 'percentage'
                            ? '%'
                            : 'Flat'}{' '}
                          OFF
                        </span>
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

          {/* Events  */}
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
                  1024: {
                    slidesPerView: 2,
                  },
                }}
                className="movie-swiper"
              >
                {latestEvents.map((event) => (
                  <SwiperSlide key={event._id}>
                    <div
                      className="bg-gray-100 cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => Navigate(`/event-realtime-sitting-seat-status/${event._id}`)}
                    >
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
        </div>


        <CouponForm
          onSubmitSuccess={handleCouponsRefreshClick}
          onCancel={() => {
            setShowModal(false);
          }}
          show={showModal}
        />
      </motion.div>
    </>
  );
};

export default ECommerce;
