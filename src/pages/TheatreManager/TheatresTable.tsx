import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faTheaterMasks,
  faHamburger,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import AddTheatreModal from './AddTheatreModal';
import toast from 'react-hot-toast';
import UpdateTheatreModal from './UpdateTheatreModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Pizza, Soup, Utensils, UtensilsCrossed } from 'lucide-react';

interface TManager {
  _id: string;
  name: string;
  profileImage: string;
  status: string;
  location: string;
  isGrabABite: boolean;
  isActive: boolean;
}

const TheatresTable: React.FC = () => {
  const [sellers, setSellers] = useState<TManager[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const fetchSellers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getTheatres}?page=${page}&limit=${limit}`, {
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
      .catch((error) => console.error('Error fetching data:', error))
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

  const handleEdit = (theatre: TManager) => {
    setSelectedTheatre(theatre);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: 'Delete this theatre?',
      text: 'This action is irreversible!',
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
            Urls.deleteTheatre,
            { id },
            { headers: { Authorization: `Bearer ${currentUser.token}` } },
          )
          .then((res) => {
            if (res.data.status) {
              toast.success('Theatre deleted!');
              setSellers((prev) => prev.filter((s) => s._id !== id));
            } else {
              toast.error('Failed to delete!');
            }
          })
          .catch((error: any) => {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                'Oops! Something went wrong. Please try again later.',
              {
                className: 'z-[99999]',
              },
            );

            console.error(err);
          });
      }
    });
  };

  const handleToggleStatus = (id: string, current: boolean) => {
    axios
      .post(
        Urls.changeTheatreStatus,
        { id, isActive: !current },
        { headers: { Authorization: `Bearer ${currentUser.token}` } },
      )
      .then((res) => {
        if (res.data.status) {
          setSellers((prev) =>
            prev.map((s) => (s._id === id ? { ...s, isActive: !current } : s)),
          );
          toast.success('Status updated!');
        }
      })
      .catch(() => toast.error('Error updating status!'));
  };

  const filtered = sellers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleTheatreClick = (id: string) => {
    navigate(`/grabABites/${id}`);
  };

  const handleManagerClick = (id: string) => {
    navigate(`/screens/${id}`);
  };

  return (
    <div className="rounded-sm  px-5 pt-6 pb-2.5 sm:px-7.5 xl:pb-1">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
        />
        {/* {roleName === 'admin' && (
          <AddTheatreModal
            onSubmitSuccess={() => fetchSellers(currentPage, itemsPerPage)}
          />
        )} */}
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full bg-white text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500">
            <tr>
              <th className="px-6 py-4 text-center rounded-tl-lg">
                Theatre {renderSortIcon('name')}
              </th>
              <th className="px-6 py-4 text-center">
                Location {renderSortIcon('location')}
              </th>
              <th className="px-6 py-4 text-center">
                Grab A Bite {renderSortIcon('isGrabABite')}
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
                      <div className="w-12 h-12 bg-slate-300 rounded-full mx-auto mb-2"></div>
                      <div className="h-4 bg-slate-300 w-20 mx-auto rounded"></div>
                    </td>
                    {[...Array(3)].map((_, j) => (
                      <td key={j} className="px-6 py-4 text-center">
                        <div className="h-4 bg-slate-300 rounded w-full mx-auto"></div>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              : filtered.map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-700/10 transition cursor-pointer"
                  >
                    <td
                      className="px-6 py-5 text-center"
                      onClick={() => handleManagerClick(t._id)}
                    >
                      <div className="flex flex-col items-center">
                        <FontAwesomeIcon
                          icon={faTheaterMasks}
                          className="text-xl text-indigo-500 mb-1"
                        />
                        <span className="font-semibold text-sm">{t.name}</span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-5 text-base text-center"
                      onClick={() => handleManagerClick(t._id)}
                    >
                      {t.location}
                    </td>
                    <td
                      className="px-6 py-5 text-base text-center"
                      onClick={() => handleManagerClick(t._id)}
                    >
                      <span
                        className={`text-sm font-medium ${
                          t.isGrabABite ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {t.isGrabABite ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-8 text-center flex justify-center items-center">
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(t._id, t.isActive);
                        }}
                        className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 transition ${
                          t.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-white'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-white'
                        }`}
                      >
                        {t.isActive ? 'Active' : 'Inactive'}
                      </button> */}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(t._id, t.isActive);
                        }}
                        className="flex items-center cursor-pointer focus:outline-none"
                      >
                        <div className="relative w-11 h-6">
                          <div
                            className={`w-full h-full rounded-full transition-colors duration-300 ${
                              t.isActive ? 'bg-indigo-500' : 'bg-slate-500'
                            }`}
                          ></div>
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
                              t.isActive ? 'translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/grabABites/${t._id}`);
                          }}
                          className="text-amber-600 hover:text-amber-800 "
                          title="Grab A Bite"
                        >
                          {/* <FontAwesomeIcon icon={faHamburger} /> */}
                          <Soup size={20} aria-label="Grab A Bite" />
                        </button>
                        {!t.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(t._id);
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
        <UpdateTheatreModal
          theatreData={selectedTheatre}
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
  );
};

export default TheatresTable;
