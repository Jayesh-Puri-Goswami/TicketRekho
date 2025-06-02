import type React from 'react';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faLocationDot,
  faMoneyBill,
  faUsers,
  faTicketAlt,
  faCalendarDay,
  faClock,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';

interface Venue {
  _id: string;
  name: string;
  seatType: 'sitting' | 'nonSitting';
  sittingSeatCount: number;
  nonSittingSeatCount: number;
}

interface Event {
  _id: string;
  venueId: string;
  title: string;
  image?: string;
  category: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  ticketsSold: number;
  totalCapacity: number;
  createdAt: string;
}

interface DashboardData {
  totalEvent: number;
  totalActivEvent: number;
  totalVenue: number;
  totalActiveVenue: number;
  venueList: Venue[];
  eventList: Event[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}

const EventManagerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(Urls.eventManagerDashboard, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.status) {
          setDashboardData(result.data);
          console.log(dashboardData?.eventList);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching data',
        );
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getVenueStatus = (
    venue: Venue,
  ): 'Available' | 'Booked' | 'Maintenance' => {
    // You can implement your own logic here based on venue data
    // For now, returning 'Available' as default
    return 'Available';
  };

  const getTotalCapacity = (venue: Venue): number => {
    return venue.sittingSeatCount + venue.nonSittingSeatCount;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumb pageName="Event Manager Dashboard" />
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mr-3"
          />
          <span className="text-lg text-gray-600">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb pageName="Event Manager Dashboard" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Breadcrumb pageName="Event Manager Dashboard" />
        <div className="text-center py-8">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb pageName="Event Manager Dashboard" />

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.totalEvent}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-2xl text-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.totalActivEvent}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="text-2xl text-green-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Venues</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.totalVenue}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-2xl text-purple-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Venues</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.totalActiveVenue}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-2xl text-green-500"
            />
          </div>
        </div>
      </div>

      {/* Venues Section */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4">Venues</h2>
        {dashboardData.venueList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-4xl text-gray-400 mb-3"
            />
            <h3 className="text-lg font-medium text-gray-700">
              No venues found
            </h3>
            <p className="text-gray-500">No venues are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.venueList.map((venue) => (
              <div
                key={venue._id}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {venue.name}
                </h3>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUsers} className="mr-2" />
                    Total Capacity: {getTotalCapacity(venue).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Seat Type:{' '}
                    <span className="capitalize">{venue.seatType}</span>
                  </p>
                  {venue.sittingSeatCount > 0 && (
                    <p className="text-sm text-gray-600">
                      Sitting Seats: {venue.sittingSeatCount.toLocaleString()}
                    </p>
                  )}
                  {venue.nonSittingSeatCount > 0 && (
                    <p className="text-sm text-gray-600">
                      Standing Capacity:{' '}
                      {venue.nonSittingSeatCount.toLocaleString()}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full ${
                    getVenueStatus(venue) === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : getVenueStatus(venue) === 'Booked'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {getVenueStatus(venue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
        {dashboardData?.eventList?.map((event) => {
          const venue = dashboardData.venueList.find(
            (v) => v._id === event?.venue?._id,
          );

          const formattedDate = new Date(event.eventDate).toLocaleDateString(
            'en-IN',
            {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            },
          );

          return (
            <div
              key={event?._id}
              className="flex bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-shadow"
            >
              <img
                src={Urls.Image_url + event?.eventImage}
                alt={event?.name}
                className="w-20 h-20 object-cover rounded mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    '/Image/Fallback Image/default-fallback-image.png';
                }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {event.name}
                  </h3>
                  <span className="text-sm text-[#472da9] font-medium">
                    {venue?.name || 'Unknown Venue'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  {formattedDate}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />₹
                    {event?.ticketPrice?.toFixed(2) || 'N/A'}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                    <FontAwesomeIcon icon={faTicketAlt} className="mr-1" />
                    {event?.ticketsSold || 0} / {event?.totalSeats || '?'}{' '}
                    tickets
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                    {event?.eventCategory}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventManagerDashboard;
