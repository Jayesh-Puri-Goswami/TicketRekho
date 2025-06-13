import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import Sellerform from '../Sellerform';
import CreateManModal from '../Modals/CreateManModal';
import EditManModal from '../Modals/EditManModal';
import toast from 'react-hot-toast';
import { Manager } from 'socket.io-client';
import AddTheatreModal from '../../pages/TheatreManager/AddTheatreModal';

import {motion} from 'framer-motion';
import { MapPin } from 'lucide-react';

interface TManager {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  role: string;
  password: string;
  status: boolean;
  createdAt: Date;
}

const TheatreManagerTable: React.FC = () => {
  const [sellers, setSellers] = useState<TManager[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TManager | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<TManager | null>(
    null,
  );

  const formatRoleName = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .split(' ') // Split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Join words back
  };

  const fetchSellers = (page: number, limit: number, search: string) => {
    setLoading(true);

    // Convert 'Active'/'Inactive' search to boolean
    let searchQuery = search;
    if (search.toLowerCase() === 'active') {
      searchQuery = 'true';
    } else if (search.toLowerCase() === 'inactive') {
      searchQuery = 'false';
    }

    axios
      .get(
        `${
          Urls.getManagers
        }?page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (
          response.data.status &&
          response.data.data.userList &&
          Array.isArray(response.data.data.userList)
        ) {
          const managerData = response.data.data.userList.map(
            (manager: any) => ({
              ...manager,
              image: `${Urls.Image_url}${manager.profileImage}`,
              phoneNumber: manager.phoneNumber,
              email: manager.email,
              password: manager.password,
              status: manager.active,
              role: formatRoleName(manager.role),
            }),
          );

          setSellers(managerData);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  };

  const handleUpdateSuccess = () => {
    fetchSellers(currentPage, itemsPerPage, searchTerm);
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   fetchSellers(currentPage, itemsPerPage);
  // }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSellers(currentPage, itemsPerPage, searchTerm);
    }, 400); // Add debounce delay

    return () => clearTimeout(delayDebounce);
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof TManager) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSellers = [...sellers].sort((a, b) => {
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

  // Handle adding/updating theatres
  const handleFormSubmitSuccess = (updatedManager: TManager) => {
    if (selectedManagerId) {
      // Update existing theatre in the list
      setSellers((prev) =>
        prev.map((t) => (t._id === updatedManager._id ? updatedManager : t)),
      );
    } else {
      // Add new theatre to the list
      setSellers((prev) => [...prev, updatedManager]);
    }
    setIsModalOpen(false);
    setSelectedManagerId(null);
    fetchSellers(currentPage, itemsPerPage, searchTerm);
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;

    axios
      .post(
        `${Urls.changeSubUserStatus}`,
        {
          userId: id,
          active: updatedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          // Update the status locally after a successful API response
          toast.success('User status changed successfully!');
          setSellers((prevSellers) =>
            prevSellers.map((seller) =>
              seller._id === id ? { ...seller, status: updatedStatus } : seller,
            ),
          );
        }
      })
      .catch((error) => {
        console.error('Error updating seller status:', error);
      });
  };

  // const filteredManagers = sellers.filter((seller) =>
  //   seller.name.toLowerCase().includes(searchTerm.toLowerCase()),
  // );

  const filteredManagers = sellers.filter((manager) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const isActiveString = manager.status ? 'active' : 'inactive';
    return (
      manager.name?.toLowerCase().includes(lowerSearchTerm) ||
      manager.email?.toLowerCase().includes(lowerSearchTerm) ||
      manager.role?.toLowerCase().includes(lowerSearchTerm) ||
      manager.phoneNumber?.toLowerCase().includes(lowerSearchTerm) ||
      isActiveString.includes(lowerSearchTerm)
    );
  });

  const renderSortIcon = (key: keyof TManager) => {
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
    fetchSellers(currentPage, itemsPerPage, searchTerm);
  };

  const handleManagerClick = (id: string) => {
    navigate(`/manager-detail/${id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedManagerId(null); // Reset the movie ID
  };

  // Open the modal with selected theatre data for updating
  const handleEdit = (theatre: TManager) => {
    setSelectedManagerId(theatre);
    setIsModalOpen(true);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center gap-4 mb-5">
        <input
          type="text"
          placeholder="Search..."
          className="w-[80%] p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
        />
        <AddTheatreModal />
      </div>
      {filteredManagers.length == 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center  p-8 text-center min-h-[30vh]"
        >
          <MapPin size={48} className="text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No Theaters Manager Found
          </h2>
          <p className="text-gray-500 mt-2">
            This Theater Owner hasn’t created any Theaters Manager  yet. Let's roll the
            reels!
          </p>
        </motion.div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th
                  className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white xl:pl-11 cursor-pointer text-center"
                  onClick={() => handleSort('name')}
                >
                  Managers {renderSortIcon('name')}
                </th>
                <th
                  className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white xl:pl-11 cursor-pointer text-center"
                  onClick={() => handleSort('role')}
                >
                  Role {renderSortIcon('role')}
                </th>
                <th
                  className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white xl:pl-11 cursor-pointer text-center"
                  onClick={() => handleSort('phoneNumber')}
                >
                  Contact {renderSortIcon('phoneNumber')}
                </th>
                <th
                  className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                  onClick={() => handleSort('email')}
                >
                  Email {renderSortIcon('email')}
                </th>
                <th
                  className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                  onClick={() => handleSort('createdAt')}
                >
                  Reg.Date {renderSortIcon('createdAt')}
                </th>
                <th
                  className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIcon('status')}
                </th>
                <th className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td className="py-4 px-4">
                          <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-slate-200 dark:bg-slate-300 h-10 w-10"></div>
                            <div className="flex-1 space-y-4 py-1 items-center flex ">
                              <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full"></div>
                              {/* <div className="h-4 bg-gray-300 dark:bg-slate-300 rounded w-1/2"></div> */}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                : filteredManagers.map((manager, index) => (
                    <tr
                      key={index}
                      onClick={() => handleManagerClick(manager._id)}
                      className="cursor-pointer"
                    >
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark text-center">
                        {/* <img
                        src={
                          manager.profileImage ||
                          'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010'
                        }
                        alt={manager.profileImage}
                        className="w-12 h-12 rounded-full mr-4"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010';
                        }}
                      /> */}
                        <h5 className="font-medium text-black dark:text-white">
                          {manager.name || 'N/A'}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <p className="text-black dark:text-white">
                          {manager.role}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <p className="text-black dark:text-white">
                          {manager.phoneNumber || 'N/A'}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <p className="text-black dark:text-white">
                          {manager.email || 'N/A'}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <p className="text-black dark:text-white">
                          {new Date(manager.createdAt)
                            .toISOString()
                            .slice(0, 10)}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(
                              manager._id,
                              manager.status ? true : false,
                            );
                          }}
                          className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                            manager.status
                              ? 'bg-success text-success'
                              : 'bg-danger text-danger'
                          }`}
                        >
                          {manager.status ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents the event from bubbling up to the row
                            handleEdit(manager);
                          }}
                          className="p-2 text-sm font-medium rounded-md focus:outline-none hover:text-[#472DA9]"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {isModalOpen && (
            <EditManModal
              managerData={selectedManagerId}
              onSubmitSuccess={handleFormSubmitSuccess}
              onClose={handleCloseModal}
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
      )}
    </div>
  );
};

export default TheatreManagerTable;
