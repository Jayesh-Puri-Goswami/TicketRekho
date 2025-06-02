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
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import EventModalForm from '../Modals/CreateEventModal';
import UpdateEvent from '../Modals/UpdateEvent';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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

interface Banner {
  id: string;
  title: string;
  image: string;
  isActive: boolean;
}

interface Advertisement {
  id: string;
  title: string;
  image: string;
  isActive: boolean;
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
      setLoading(true);
      let searchQuery = search;
      if (search.toLowerCase() === 'released') {
        searchQuery = 'true';
      } else if (search.toLowerCase() === 'unreleased') {
        searchQuery = 'false';
      }

      const response = await axios.get(
        `${Urls.getAllEventsByManagerId}?page=${page}&limit=${limit}&search=${encodeURIComponent(
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
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEvent(eventId);
      }
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
        <FontAwesomeIcon icon={faArrowUp} className="ml-2" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2" />
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

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Tabs */}
      <div className="flex border-b border-stroke mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'events'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('events')}
        >
          Events
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'banners'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('banners')}
        >
          Banners
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'advertisements'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('advertisements')}
        >
          Advertisements
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="mb-4 w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
          value={searchTerm}
        />
        {activeTab === 'events' && roleName !== 'admin' && (
          <EventModalForm onSubmitSuccess={handleModalFormSubmit} />
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black dark:text-white">
                {previewImage.title}
              </h3>
              <button
                onClick={closeImagePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage.url || '/placeholder.svg'}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    '../../../public/Image/Fallback Image/default-fallback-image.png';
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        {activeTab === 'events' && (
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-center rounded-tl-lg cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Event {renderSortIcon('name')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center cursor-pointer"
                  onClick={() => handleSort('city')}
                >
                  City {renderSortIcon('city')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center cursor-pointer"
                  onClick={() => handleSort('eventType')}
                >
                  Type {renderSortIcon('eventType')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center cursor-pointer"
                  onClick={() => handleSort('eventDate')}
                >
                  Date {renderSortIcon('eventDate')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center cursor-pointer"
                  onClick={() => handleSort('totalEarnings')}
                >
                  Earnings {renderSortIcon('totalEarnings')}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center cursor-pointer"
                  onClick={() => handleSort('isActive')}
                >
                  Launch {renderSortIcon('isActive')}
                </th>
                <th scope="col" className="px-6 py-4 text-center rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-300 rounded-md mb-2"></div>
                          <div className="h-4 bg-slate-300 w-24 rounded"></div>
                        </div>
                      </td>
                      {[...Array(5)].map((_, i) => (
                        <td key={i} className="px-6 py-4 text-center">
                          <div className="h-4 bg-slate-300 rounded w-full"></div>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                          <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                          <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredEvents.map((event, i) => (
                    <tr
                      key={i}
                      className="hover:bg-indigo-700/10 dark:hover:bg-indigo-700/10 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (event.eventType === 'Sitting') {
                          handleSittingClick(event.id);
                        } else if (event.eventType === 'Non Sitting') {
                          handleNonSittingClick(event.id);
                        }
                      }}
                    >
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <img
                            src={event.eventImage}
                            alt={event.name}
                            onError={(e) =>
                              (e.currentTarget.src =
                                '../../../public/Image/Fallback Image/default-fallback-image.png')
                            }
                            className="w-30 h-12 object-cover rounded-md mb-1"
                          />
                          <span className="font-semibold text-sm truncate w-[8rem]">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-bold">{event.city}</td>
                      <td className="px-6 py-5 text-center">{event.eventType}</td>
                      <td className="px-6 py-5 text-center">
                        {new Date(event.eventDate).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </td>
                      <td className="px-6 py-5 text-center">
                        ₹{Number(event.totalEarnings).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(event.id, event.isActive);
                          }}
                          className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 transition ${
                            event.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-white'
                          }`}
                        >
                          {event.isActive ? 'Released' : 'Unreleased'}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(event.id);
                            }}
                            className="text-indigo-500 hover:text-indigo-700 transition"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGrabaBiteClick(event.id);
                            }}
                            className="text-indigo-500 hover:text-indigo-700 transition"
                            title="Grab a Bite"
                          >
                            <FontAwesomeIcon icon={faHamburger} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}

        {activeTab === 'banners' && (
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th className="px-6 py-4 text-center rounded-tl-lg">Banner</th>
                <th className="px-6 py-4 text-center">Title</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-30 h-12 bg-slate-300 rounded-md mb-2"></div>
                        <div className="h-4 bg-slate-300 w-24 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-4 bg-slate-300 rounded w-full"></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredBanners.length > 0 ? (
                filteredBanners.map((banner, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-700/10 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <img
                          src={banner.bannerImage}
                          alt={banner.name}
                          onError={(e) =>
                            (e.currentTarget.src =
                              '../../../public/Image/Fallback Image/default-fallback-image.png')
                          }
                          className="w-30 h-12 object-cover rounded-md mb-1"
                        />
                        <button
                          onClick={() =>
                            handleImagePreview(banner.name, banner?.bannerImage)
                          }
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Image
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-semibold text-sm inline-block">
                        {banner.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(banner.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition"
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
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th className="px-6 py-4 text-center rounded-tl-lg">
                  Advertisement
                </th>
                <th className="px-6 py-4 text-center">Title</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-30 h-12 bg-slate-300 rounded-md mb-2"></div>
                        <div className="h-4 bg-slate-300 w-24 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-4 bg-slate-300 rounded w-full"></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredAdvertisements.length > 0 ? (
                filteredAdvertisements.map((ad, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-700/10 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <img
                          src={ad.advertisementImage}
                          alt={ad.name}
                          onError={(e) =>
                            (e.currentTarget.src =
                              '../../../public/Image/Fallback Image/default-fallback-image.png')
                          }
                          className="w-30 h-12 object-cover rounded-md mb-1"
                        />
                        <button
                          onClick={() =>
                            handleImagePreview(ad.name, ad?.advertisementImage)
                          }
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Image
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-semibold text-sm inline-block">
                        {ad.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ad.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition"
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

        <div className="flex items-center justify-between mt-4">
          <div>
            <label htmlFor="itemsPerPage" className="mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-1 border border-gray-300 rounded dark:bg-boxdark"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2 p-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-2 p-2 bg-gray-200 rounded disabled:opacity-50"
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