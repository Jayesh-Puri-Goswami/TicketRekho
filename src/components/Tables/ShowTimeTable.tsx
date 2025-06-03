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
  movie: {
    name: string;
    movieImage: string;
  };
  theatre: {
    name: string;
  };
  screen: {
    name: string;
  };
  state: {
    name: string;
  };
  city: {
    name: string;
  };
  totalEarnings: number;
  isActive: boolean;
}

const ShowTimeTable: React.FC = () => {
  const [showtime, setShowtimes] = useState<ShowTime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ShowTime | null;
    direction: string;
  }>({ key: null, direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const roleName = currentUser.role;

  const formatUTCDate = (date: string | Date) => {
    try {
      const utcDate = new Date(date);
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
      return format(localDate, 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const fetchManagers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getMovieShowtimesbyManager}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && Array.isArray(response.data.data.showtimes)) {
          const managerData = response.data.data.showtimes.map((manager: any) => ({
            ...manager,
            startTime: formatUTCDate(manager.startTime),
            endTime: formatUTCDate(manager.endTime),
          }));
          setShowtimes(managerData);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchManagers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof ShowTime) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sorted = [...showtime].sort((a, b) => {
      if (a[key]! < b[key]!) return direction === 'ascending' ? -1 : 1;
      if (a[key]! > b[key]!) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setShowtimes(sorted);
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
            prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s)),
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
              toast.success('Showtime deleted successfully!');
            }
          })
          .catch(() => toast.error('Failed to delete showtime.'));
      }
    });
  };

  const filtered = showtime.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.movie.name.toLowerCase().includes(search) ||
      s.theatre.name.toLowerCase().includes(search) ||
      s.screen.name.toLowerCase().includes(search) ||
      s.state.name.toLowerCase().includes(search) ||
      s.city.name.toLowerCase().includes(search)
    );
  });

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

  const renderSortIcon = (key: keyof ShowTime) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-1" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-1" />
      );
    }
    return null;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
        />
        {roleName !== 'admin' && <ShowTimeModalForm onSubmitSuccess={() => fetchManagers(currentPage, itemsPerPage)} />}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500">
            <tr>
              <th className="px-6 py-4 text-base text-center rounded-tl-lg">Movie {renderSortIcon('movie')}</th>
              <th className="px-6 py-4 text-base text-center">Theatre {renderSortIcon('theatre')}</th>
              <th className="px-6 py-4 text-base text-center">Screen {renderSortIcon('screen')}</th>
              <th className="px-6 py-4 text-base text-center">Start {renderSortIcon('startTime')}</th>
              <th className="px-6 py-4 text-base text-center">End {renderSortIcon('endTime')}</th>
              <th className="px-6 py-4 text-base text-center">Earnings {renderSortIcon('totalEarnings')}</th>
              <th className="px-6 py-4 text-base text-center">Launch {renderSortIcon('isActive')}</th>
              <th className="px-6 py-4 text-base text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 text-center" colSpan={8}>
                      <div className="h-4 bg-slate-300 w-full rounded"></div>
                    </td>
                  </tr>
                ))
              : filtered.map((s, i) => (
                  <tr key={i} onClick={() => handleMovieTicketClick(s._id)} className="hover:bg-indigo-700/10 transition cursor-pointer">
                    <td className="px-6 py-5 text-base text-center font-semibold">{s.movie.name}</td>
                    <td className="px-6 py-5 text-base text-center">{s.theatre.name}</td>
                    <td className="px-6 py-5 text-base text-center">{s.screen.name}</td>
                    <td className="px-6 py-5 text-base text-center">{s.startTime}</td>
                    <td className="px-6 py-5 text-base text-center">{s.endTime}</td>
                    <td className="px-6 py-5 text-base text-center">₹{Number(s.totalEarnings).toLocaleString()}</td>
                    <td className="px-6 py-5 text-base text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(s._id, s.isActive);
                        }}
                        className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 transition ${
                          s.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-white'
                        }`}
                      >
                        {s.isActive ? 'Released' : 'Unreleased'}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            fetchManagers(currentPage, itemsPerPage);
          }}
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <div>
          <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="p-1 border border-gray-300 rounded dark:bg-boxdark"
          >
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-2 p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowTimeTable;
