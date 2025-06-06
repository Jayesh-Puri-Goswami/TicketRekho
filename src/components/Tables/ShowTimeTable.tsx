import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faTicketAlt,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ShowTimeModalForm from '../../components/Modals/CreateShowTimeModal';
import UpdateShowTimeModel from '../Modals/UpdateShowTimeModel';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface ShowTime {
  _id: string;
  startTime: string;
  endTime: string;
  movie: { name: string; movieImage: string };
  theatre: { name: string };
  screen: { name: string };
  state: { name: string };
  city: { name: string };
  totalEarnings: number;
  isActive: boolean;
}

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const ShowTimeTable: React.FC = () => {
  const [showtime, setShowtimes] = useState<ShowTime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<ShowTime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ShowTime | string;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const roleName = currentUser.role;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const fetchShowtimes = (page: number, limit: number, search: string) => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    axios
      .get(`${Urls.getMovieShowtimesbyManager}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
      .then((response) => {
        if (
          response.data.status &&
          Array.isArray(response.data.data.showtimes)
        ) {
          const mapped = response.data.data.showtimes.map((s: any) => ({
            ...s,
            startTime: formatUTCDate(s.startTime),
            endTime: formatUTCDate(s.endTime),
          }));
          setShowtimes(mapped);
          setFilteredShowtimes(mapped); // Initialize filteredShowtimes with fetched data
          setTotalPages(response.data.data.pagination?.totalPages || 1);
        } else {
          setShowtimes([]);
          setFilteredShowtimes([]);
          setTotalPages(1);
        }
      })
      .catch((error) => {
        console.error('Error fetching showtimes:', error);
        toast.error('Failed to fetch showtimes.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchShowtimes(1, itemsPerPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, itemsPerPage]);

  useEffect(() => {
    fetchShowtimes(currentPage, itemsPerPage, debouncedSearchTerm);
  }, [currentPage]);

  useEffect(() => {
    const filtered = showtime.filter((s) => {
      const term = debouncedSearchTerm.toLowerCase();
      const isActiveString = s.isActive ? 'released' : 'unreleased';
      return (
        s.movie.name.toLowerCase().includes(term) ||
        s.theatre.name.toLowerCase().includes(term) ||
        s.screen.name.toLowerCase().includes(term) ||
        s.city.name.toLowerCase().includes(term) ||
        s.state.name.toLowerCase().includes(term) ||
        s.startTime.toLowerCase().includes(term) ||
        s.endTime.toLowerCase().includes(term) ||
        isActiveString.includes(term)
      );
    });
    setFilteredShowtimes(filtered);
  }, [showtime, debouncedSearchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof ShowTime | string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sorted = [...filteredShowtimes].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle nested object properties
      switch (key) {
        case 'movie':
          aValue = a.movie.name;
          bValue = b.movie.name;
          break;
        case 'theatre':
          aValue = a.theatre.name;
          bValue = b.theatre.name;
          break;
        case 'screen':
          aValue = a.screen.name;
          bValue = b.screen.name;
          break;
        case 'state':
          aValue = a.state.name;
          bValue = b.state.name;
          break;
        case 'city':
          aValue = a.city.name;
          bValue = b.city.name;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a[key as keyof ShowTime];
          bValue = b[key as keyof ShowTime];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredShowtimes(sorted);
    setSortConfig({ key, direction });
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    axios
      .post(
        `${Urls.changeMovieShowTimeStatus}`,
        { id, isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${currentUser.token}` } },
      )
      .then((res) => {
        if (res.data.status) {
          toast.success('Showtime status updated!');
          setShowtimes((prev) =>
            prev.map((s) =>
              s._id === id ? { ...s, isActive: !currentStatus } : s,
            ),
          );
          setFilteredShowtimes((prev) =>
            prev.map((s) =>
              s._id === id ? { ...s, isActive: !currentStatus } : s,
            ),
          );
        }
      })
      .catch(() => toast.error('Failed to update status.'));
  };

  const handleDelete = (id: string) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: 'Delete this showtime?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${Urls.deleteMovieShowTime}`,
            { id },
            { headers: { Authorization: `Bearer ${currentUser.token}` } },
          )
          .then((res) => {
            if (res.data.status) {
              setShowtimes((prev) => prev.filter((s) => s._id !== id));
              setFilteredShowtimes((prev) => prev.filter((s) => s._id !== id));
              toast.success('Showtime deleted successfully!');
              fetchShowtimes(currentPage, itemsPerPage, debouncedSearchTerm);
            }
          })
          .catch(() => toast.error('Failed to delete showtime.'));
      }
    });
  };

  const handleEditClick = (id: string) => {
    setSelectedShowTime(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShowTime(null);
  };

  const handleMovieTicketClick = (id: string) => {
    navigate(`/showtime-realtime-seat-status/${id}`);
  };

  const renderSortIcon = (key: keyof ShowTime | string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-1" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-1" />
      );
    }
    return null;
  };

  const paginated = filteredShowtimes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by movie, theatre, screen, state, or city..."
          className="w-full p-2 border border-gray-300 rounded dark:bg-boxdark focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={handleSearch}
        />
        {roleName !== 'admin' ? (
          <ShowTimeModalForm
            onSubmitSuccess={() =>
              fetchShowtimes(currentPage, itemsPerPage, debouncedSearchTerm)
            }
          />
        ) : <></>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500">
            <tr>
              <th
                className="px-6 py-4 text-base text-center rounded-tl-lg cursor-pointer"
                onClick={() => handleSort('movie')}
              >
                Movie {renderSortIcon('movie')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('theatre')}
              >
                Theatre {renderSortIcon('theatre')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('screen')}
              >
                Screen {renderSortIcon('screen')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('startTime')}
              >
                Start {renderSortIcon('startTime')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('endTime')}
              >
                End {renderSortIcon('endTime')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('totalEarnings')}
              >
                Earnings {renderSortIcon('totalEarnings')}
              </th>
              <th
                className="px-6 py-4 text-base text-center cursor-pointer"
                onClick={() => handleSort('isActive')}
              >
                Launch {renderSortIcon('isActive')}
              </th>
              <th className="px-6 py-4 text-base text-center rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 text-center" colSpan={8}>
                    <div className="h-4 bg-slate-300 w-full rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredShowtimes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No showtimes found matching your search.
                </td>
              </tr>
            ) : (
              paginated.map((s, i) => (
                <tr
                  key={i}
                  onClick={() => handleMovieTicketClick(s._id)}
                  className="hover:bg-indigo-700/10 transition cursor-pointer"
                >
                  <td className="px-6 py-5 text-base text-center font-semibold">
                    {s.movie.name}
                  </td>
                  <td className="px-6 py-5 text-base text-center">
                    {s.theatre.name}
                  </td>
                  <td className="px-6 py-5 text-base text-center">
                    {s.screen.name}
                  </td>
                  <td className="px-6 py-5 text-base text-center">
                    {s.startTime}
                  </td>
                  <td className="px-6 py-5 text-base text-center">
                    {s.endTime}
                  </td>
                  <td className="px-6 py-5 text-base text-center">
                    ₹{Number(s.totalEarnings).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-base text-center flex justify-center items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(s._id, s.isActive);
                      }}
                      className="flex items-center cursor-pointer focus:outline-none"
                    >
                      <div className="relative w-11 h-6">
                        <div
                          className={`w-full h-full rounded-full transition-colors duration-300 ${
                            s.isActive ? 'bg-indigo-500' : 'bg-slate-500'
                          }`}
                        ></div>
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
                            s.isActive ? 'translate-x-5' : ''
                          }`}
                        ></div>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(s._id);
                        }}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {!s.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedShowTime && (
        <UpdateShowTimeModel
          showtimeId={selectedShowTime}
          onClose={handleCloseModal}
          onSubmitSuccess={() => {
            setShowModal(false);
            setSelectedShowTime(null);
            fetchShowtimes(currentPage, itemsPerPage, debouncedSearchTerm);
          }}
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
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="p-1 border border-gray-300 rounded dark:bg-boxdark focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="mr-2 p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
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
            disabled={currentPage === totalPages || loading}
            className="ml-2 p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowTimeTable;