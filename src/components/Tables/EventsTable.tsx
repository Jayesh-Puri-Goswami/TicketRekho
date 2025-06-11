import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faHamburger,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import EventModalForm from '../Modals/CreateEventModal';
import UpdateEvent from '../Modals/UpdateEvent';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader } from 'lucide-react';

import { motion } from 'framer-motion';

interface Events {
  _id: string;
  name: string;
  artist: string;
  eventImage: string;
  genre: [];
  language: [];
  eventType: string;
  eventCategory: string;
  eventDate: Date;
  state: string;
  city: string;
  id: string;
  totalEarnings: Number;
  isActive: boolean;
  isBanner?: boolean;
  isAds?: boolean;
  bannerImage?: string;
  advertisementImage?: string;
}
type TabType = 'events' | 'banners' | 'advertisements';

const EventsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [sellers, setSellers] = useState<Events[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Events | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{
    title: string;
    url: string;
  } | null>(null);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const roleName = currentUser.role;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const formatUTCDate = (date: string | Date) => {
    try {
      const utcDate = new Date(date);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000,
      );
      return format(localDate, 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const handleEditClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleImagePreview = (title: string, imageUrl: string) => {
    setPreviewImage({ title, url: imageUrl });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const formatName = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchEvents = async (page: number, limit: number, search: string) => {
    try {
      setTableLoading(true);
      let searchQuery = search;
      if (search.toLowerCase() === 'released') {
        searchQuery = 'true';
      } else if (search.toLowerCase() === 'unreleased') {
        searchQuery = 'false';
      }

      const response = await axios.get(
        `${
          Urls.getAllEventsByManagerId
        }?page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        },
      );

      const { status, data } = response.data;

      if (status && data && Array.isArray(data.eventData)) {
        const eventData = data.eventData.map((event: any) => ({
          id: event._id,
          name: event.name,
          artist: event.artist,
          eventType: formatName(event.eventType),
          state: event.state.name,
          city: event.city.name,
          eventCategory: event.eventCategory,
          genre: event.genre?.join(', ') || 'N/A',
          language: event.language?.join(', ') || 'N/A',
          eventDate: formatUTCDate(event.eventDate),
          eventImage: `${Urls.Image_url}${event.eventImage}`,
          totalEarnings: event.totalEarnings,
          isActive: event.isActive,
          isBanner: event.isBanner || false,
          isAds: event.isAds || false,
          bannerImage: event.bannerImage
            ? `${Urls.Image_url}${event.bannerImage}`
            : '',
          advertisementImage: event.advImage
            ? `${Urls.Image_url}${event.advImage}`
            : '',
        }));

        setSellers(eventData);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        console.warn('Unexpected API response structure or missing data');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    fetchEvents(currentPage, itemsPerPage, searchTerm);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents(currentPage, itemsPerPage, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, itemsPerPage, searchTerm, activeTab]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof Events) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSellers = [...sellers].sort((a: any, b: any) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSellers(sortedSellers);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
  };

  const handleGrabaBiteClick = (id: string) => {
    navigate(`/eventGrabABites/${id}`);
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    axios
      .post(
        `${Urls.changeEventStatus}`,
        { id, isActive: updatedStatus ? true : false },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setSellers((prevEvents) =>
            prevEvents.map((event) =>
              event.id === id ? { ...event, isActive: updatedStatus } : event,
            ),
          );
          toast.success('Event status changed successfully!');
        } else {
          toast.error('Failed to change the event status.');
        }
      })
      .catch((error) => {
        console.error('Error changing the event status:', error);
        toast.error('Error changing the event status. Please try again.');
      });
  };

  const MySwal = withReactContent(Swal);
  const handleDelete = (eventId: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this event? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      position: 'center',
      customClass: {
        confirmButton:
          'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition',
        cancelButton:
          'bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slategray-300 transition',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEvent(eventId);
      }
    });
  };

  const handleAddDelete = (id: string) => {
    axios
      .post(
        `${Urls.deleteAdvertisementUrl}`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          toast.success('Advertisement deleted successfully.');
        }
      })
      .catch((error) => {
        console.error('Error deleting advertisement:', error);
        toast.error('Error deleting advertisement.');
      });
  };

  const deleteEvent = (id: string) => {
    axios
      .post(
        `${Urls.deleteEvent}`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setSellers((prevEvents) =>
            prevEvents.filter((event) => event.id !== id),
          );
          toast.success('Event deleted successfully!');
        } else {
          toast.error('Failed to delete the event.');
        }
      })
      .catch((error: any) => {
        console.error('Error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          'Oops! Something went wrong while deleting the event. Please try again later.';
        toast.error(errorMessage);
      });
  };

  const filteredEvents = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isActiveString = seller.isActive ? 'released' : 'unreleased';
    return (
      seller.name?.toLowerCase().includes(search) ||
      seller.city?.toLowerCase().includes(search) ||
      seller.eventType?.toLowerCase().includes(search) ||
      seller.eventDate?.toString().includes(search) ||
      seller.totalEarnings?.toString().toLowerCase().includes(search) ||
      isActiveString.includes(search)
    );
  });

  const filteredBanners = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isBanner = seller.isBanner ? 'active' : 'inactive';
    if (seller.isBanner) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        (seller.bannerImage &&
          seller.bannerImage.toLowerCase().includes(search)) ||
        isBanner.includes(search)
      );
    }
    return false;
  });

  const filteredAdvertisements = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isAds = seller.isAds ? 'active' : 'inactive';
    if (seller.isAds) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        (seller.advertisementImage &&
          seller.advertisementImage.toLowerCase().includes(search)) ||
        isAds.includes(search)
      );
    }
    return false;
  });

  const renderSortIcon = (key: keyof Events) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-2 text-gray-500" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2 text-gray-500" />
      );
    }
    return null;
  };

  const handleModalFormSubmit = () => {
    fetchEvents(currentPage, itemsPerPage, searchTerm);
  };

  const handleEventTicketClick = (id: string) => {
    navigate(`/eventtickets/${id}`);
  };

  const handleSittingClick = (id: string) => {
    navigate(`/event-realtime-sitting-seat-status/${id}`);
  };

  const handleNonSittingClick = (id: string) => {
    navigate(`/event-realtime-nonsitting-seat-status/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading Events...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      {/* Tabs */}
      {/* <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        {['events', 'banners', 'advertisements'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleTabChange(tab as TabType)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div> */}

      {/* Search and Add Event */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, city, type, date, or status..."
            className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
            onChange={handleSearch}
            value={searchTerm}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {activeTab === 'events' && roleName !== 'admin' && (
          <EventModalForm onSubmitSuccess={handleModalFormSubmit} />
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {previewImage.title}
              </h3>
              <button
                onClick={closeImagePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={previewImage.url || '/placeholder.svg'}
              alt={previewImage.title}
              className="w-full max-h-[70vh] object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.src =
                  '/Image/Fallback Image/default-fallback-image.png';
              }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {activeTab === 'events' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="px-6 py-4 rounded-tl-lg cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Event {renderSortIcon('name')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('city')}
                >
                  City {renderSortIcon('city')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('eventType')}
                >
                  Type {renderSortIcon('eventType')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('eventDate')}
                >
                  Date {renderSortIcon('eventDate')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('totalEarnings')}
                >
                  Earnings {renderSortIcon('totalEarnings')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('isActive')}
                >
                  Status {renderSortIcon('isActive')}
                </th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                          <div className="h-5 bg-gray-200 rounded w-40"></div>
                        </div>
                      </td>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-5 bg-gray-200 rounded w-24"></div>
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredEvents.map((event, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                     
                    >
                      <td className="px-6 py-4 cursor-pointer" onClick={()=> navigate(`/events/detail/${event?.id}`)}>
                        <div className="flex items-center gap-3">
                          <img
                            src={event.eventImage}
                            alt={event.name}
                            className="w-12 h-16 object-cover rounded-md"
                            onError={(e) =>
                              (e.currentTarget.src =
                                '/Image/Fallback Image/default-fallback-image.png')
                            }
                          />
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-100 max-w-[200px]">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td  onClick={() => {
                        if (event.eventType === 'Sitting') {
                          handleSittingClick(event.id);
                        } else if (event.eventType === 'Non Sitting') {
                          handleNonSittingClick(event.id);
                        }
                      }} className="px-6  text-base py-4 text-gray-600 dark:text-gray-300">
                        {event.city}
                      </td>
                      <td  onClick={() => {
                        if (event.eventType === 'Sitting') {
                          handleSittingClick(event.id);
                        } else if (event.eventType === 'Non Sitting') {
                          handleNonSittingClick(event.id);
                        }
                      }} className="px-6 text-base py-4 text-gray-600 dark:text-gray-300">
                        {event.eventType}
                      </td>
                      <td  onClick={() => {
                        if (event.eventType === 'Sitting') {
                          handleSittingClick(event.id);
                        } else if (event.eventType === 'Non Sitting') {
                          handleNonSittingClick(event.id);
                        }
                      }} className="px-6 text-base py-4 text-gray-600 dark:text-gray-300">
                        {new Date(event.eventDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </td>
                      <td  onClick={() => {
                        if (event.eventType === 'Sitting') {
                          handleSittingClick(event.id);
                        } else if (event.eventType === 'Non Sitting') {
                          handleNonSittingClick(event.id);
                        }
                      }} className="px-6 text-base py-4 text-gray-600 dark:text-gray-300">
                        ₹{Number(event.totalEarnings).toLocaleString()}
                      </td>
                      <td  className="px-6 text-base py-4">
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(event.id, event.isActive);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            event.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {event.isActive ? 'Released' : 'Unreleased'}
                        </button> */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(event.id, event.isActive);
                          }}
                          className="flex items-center cursor-pointer focus:outline-none"
                        >
                          <div className="relative w-11 h-6">
                            <div
                              className={`w-full h-full rounded-full transition-colors duration-300 ${
                                event.isActive
                                  ? 'bg-indigo-500'
                                  : 'bg-slate-500'
                              }`}
                            ></div>
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
                                event.isActive ? 'translate-x-5' : ''
                              }`}
                            ></div>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(event.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGrabaBiteClick(event.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                            title="Grab a Bite"
                          >
                            <FontAwesomeIcon icon={faHamburger} />
                          </button>
                          {!event.isActive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(event.id);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}

        {activeTab === 'banners' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Banner</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredBanners.length > 0 ? (
                filteredBanners.map((banner, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={banner.bannerImage}
                          alt={banner.name}
                          className="w-12 h-16 object-cover rounded-md"
                          onError={(e) =>
                            (e.currentTarget.src =
                              '/Image/Fallback Image/default-fallback-image.png')
                          }
                        />
                        <button
                          onClick={() =>
                            handleImagePreview(
                              banner.name || '',
                              banner.bannerImage || '',
                            )
                          }
                          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                        >
                          View Banner
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                        {banner.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(banner.id);
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No banner data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'advertisements' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Advertisement</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredAdvertisements.length > 0 ? (
                filteredAdvertisements.map((ad, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.advertisementImage}
                          alt={ad.name}
                          className="w-12 h-16 object-cover rounded-md"
                          onError={(e) =>
                            (e.currentTarget.src =
                              '/Image/Fallback Image/default-fallback-image.png')
                          }
                        />
                        <button
                          onClick={() =>
                            handleImagePreview(ad.name, ad.advertisementImage)
                          }
                          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                        >
                          View Advertisement
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                        {ad.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddDelete(ad.id);
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No advertisement data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {isModalOpen && selectedEventId && (
          <UpdateEvent
            eventId={selectedEventId}
            onClose={handleCloseModal}
            onSubmitSuccess={handleUpdateSuccess}
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <label
              htmlFor="itemsPerPage"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTable;
