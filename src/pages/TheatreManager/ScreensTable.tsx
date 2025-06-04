import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faTv,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AddScreenModal from './AddScreenModal';
import UpdateScreenModal from './UpdateScreenModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface TManager {
  _id: string;
  name: string;
  seatingCapacity: number;
  screenType: string;
  isActive: boolean;
  status: string;
  theatre: string;
}

const ScreensTable: React.FC = () => {
  const { id } = useParams();
  const [sellers, setSellers] = useState<TManager[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TManager | null;
    direction: string;
  }>({ key: null, direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [selectedTheatre, setSelectedTheatre] = useState<TManager | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const roleName = currentUser.role;

  //   useEffect(() => {
  //   const unlisten = window.addEventListener('popstate', () => {
  //     Swal.close(); // Closes the currently open modal, if any
  //   });

  //   return () => {
  //     window.removeEventListener('popstate', () => {
  //       Swal.close();
  //     });
  //   };
  // }, []);

  const fetchSellers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getScreens}?theatre=${id}&page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && Array.isArray(response.data.data)) {
          setSellers(response.data.data);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
        }
      })
      .catch((error) => console.error('Error fetching screens:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof TManager) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sorted = [...sellers].sort((a, b) => {
      if (a[key]! < b[key]!) return direction === 'ascending' ? -1 : 1;
      if (a[key]! > b[key]!) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setSellers(sorted);
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof TManager) =>
    sortConfig.key === key ? (
      <FontAwesomeIcon
        icon={sortConfig.direction === 'ascending' ? faArrowUp : faArrowDown}
        className="ml-1"
      />
    ) : null;

  const handleEdit = (screen: TManager) => {
    setSelectedTheatre(screen);
    setModalOpen(true);
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    axios
      .post(
        Urls.changeScreenStatus,
        { id, isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${currentUser.token}` } },
      )
      .then((res) => {
        if (res.data.status) {
          setSellers((prev) =>
            prev.map((s) =>
              s._id === id ? { ...s, isActive: !currentStatus } : s,
            ),
          );
          toast.success('Screen status updated!');
        }
      })
      .catch(() => toast.error('Failed to update screen status.'));
  };

  const handleDelete = (id: string) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: 'Delete this screen?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton:
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        cancelButton:
          'bg-slate-300 text-slate-700 hover:bg-slate-400 focus:ring-slate-500',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            Urls.deleteScreen,
            { id },
            { headers: { Authorization: `Bearer ${currentUser.token}` } },
          )
          .then((res) => {
            if (res.data.status) {
              setSellers((prev) => prev.filter((s) => s._id !== id));
              toast.success('Screen deleted successfully!');
            }
          })
          .catch(() => toast.error('Failed to delete screen.'));
      }
    });
  };

  const handleManagerClick = (id: string) => {
    navigate(`/seat-layout/${id}`);
  };

  const filteredScreens = sellers.filter((screen) =>
    screen.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
        />
        {roleName !== 'admin' && (
          <AddScreenModal
            onSubmitSuccess={() => fetchSellers(currentPage, itemsPerPage)}
          />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500">
            <tr>
              <th className="px-6 py-4 text-center rounded-tl-lg">
                Screen {renderSortIcon('name')}
              </th>
              <th className="px-6 py-4 text-center">
                Capacity {renderSortIcon('seatingCapacity')}
              </th>
              <th className="px-6 py-4 text-center">
                Type {renderSortIcon('screenType')}
              </th>
              <th className="px-6 py-4 text-center">
                Status {renderSortIcon('isActive')}
              </th>
              <th className="px-6 py-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 text-center">
                      <div className="w-12 h-12 bg-slate-300 rounded-full mx-auto mb-2" />
                      <div className="h-4 bg-slate-300 w-20 mx-auto rounded" />
                    </td>
                    {[...Array(3)].map((_, j) => (
                      <td key={j} className="px-6 py-4 text-center">
                        <div className="h-4 bg-slate-300 rounded w-full mx-auto" />
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div className="w-6 h-6 bg-slate-300 rounded-full" />
                        <div className="w-6 h-6 bg-slate-300 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))
              : filteredScreens.map((screen, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-700/10 transition cursor-pointer"
                    onClick={() => handleManagerClick(screen._id)}
                  >
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <FontAwesomeIcon
                          icon={faTv}
                          className="text-xl text-indigo-500 mb-1"
                        />
                        <span className="font-semibold text-sm">
                          {screen.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {screen.seatingCapacity}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {screen.screenType}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(screen._id, screen.isActive);
                        }}
                        className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 transition ${
                          screen.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-white'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-white'
                        }`}
                      >
                        {screen.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(screen);
                          }}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {!screen.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(screen._id);
                            }}
                            className="text-red-500 hover:text-red-700"
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
      </div>

      {isModalOpen && selectedTheatre && (
        <UpdateScreenModal
          screenData={selectedTheatre}
          onSubmitSuccess={() => {
            setModalOpen(false);
            setSelectedTheatre(null);
            fetchSellers(currentPage, itemsPerPage);
          }}
          onClose={() => {
            setModalOpen(false);
            setSelectedTheatre(null);
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
  );
};

export default ScreensTable;
