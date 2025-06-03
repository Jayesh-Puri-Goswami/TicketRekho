import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
// import Sellerform from '../Sellerform';
// import CreateManModal from '../Modals/CreateManModal';

interface AppUser {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  active: Boolean;
  createdAt: Date;
}

const AppUserTable: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AppUser | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  

  const fetchUsers = (page: number, limit: number, search: string) => {
    setLoading(true);

      // Convert 'Active'/'Inactive' search to boolean
    let searchQuery = search;
    if (search.toLowerCase() === 'active') {
      searchQuery = 'true';
    } else if (search.toLowerCase() === 'inactive') {
      searchQuery = 'false';
    }

    axios
      .get(`${Urls.getUserList}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (
          response.data.status &&
          response.data.data.users &&
          Array.isArray(response.data.data.users)
        ) {
          const managerData = response.data.data.users;
          setUsers(managerData);
          setTotalPages(response.data.data.pagination?.totalPages || 1); //response.data.data.pagination.totalPages
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  };

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchUsers(currentPage, itemsPerPage, searchTerm);
  }, 400); // Add debounce delay

  return () => clearTimeout(delayDebounce);
}, [currentPage, itemsPerPage, searchTerm]);


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1); // reset to first page on new search
};


  const handleSort = (key: keyof AppUser) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSellers = [...users].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setUsers(sortedSellers);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
  };

  

  const toggleStatus = (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;

    setLoading(true); // Optional: set a loading state if you have one

    axios
      .post(
        `${Urls.changeAppUserStatus}`,
        {
          appUserId: id,
          active: updatedStatus ? true : false, // Adjust according to your API requirements
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // Ensure correct string interpolation
          },
        },
      )
      .then((response) => {
        console.log('Response:', response); // Log response for debugging
        if (response.data && response.data.status) {
          toast.success(
            'User status changed successfully!',{
        className : 'z-[99999]'
      }
          );
          // Update the status locally after a successful API response

          

          setUsers((prevTicket) =>
            prevTicket.map((user) =>
              user._id === id // Use the correct id parameter here
                ? { ...user, active: updatedStatus }
                : user,
            ),
          );
        } else {
          toast.error(
            response?.data?.message,{
        className : 'z-[99999]'
      }
          );
          console.error('Unexpected response structure:', response.data);
        }
      })
      .catch((error) => {
        toast.error(
         'An error occured.',{
        className : 'z-[99999]'
      }
        );
        console.error('Error updating user status:', error);
      })
      .finally(() => {
        setLoading(false); // Optional: reset loading state
      });
  };



  const filteredManagers = users.filter((user) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
     const isActiveString = user.active ? "active" : "inactive";
    return (
      user.name?.toLowerCase().includes(lowerSearchTerm) ||
      user.email?.toLowerCase().includes(lowerSearchTerm) ||
      user.mobileNumber?.toLowerCase().includes(lowerSearchTerm) ||
        isActiveString.includes(lowerSearchTerm)
    );
  });
  
  const renderSortIcon = (key: keyof AppUser) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-2" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2" />
      );
    }
    return null;
  };



  const handleManagerClick = (id: string) => {
    navigate(`/user-detail/${id}`);
  };

  const handleModalFormSubmit = () => {
    fetchUsers(currentPage, itemsPerPage, searchTerm);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="mb-4 w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
        />
        {/* <CreateManModal onSubmitSuccess={handleModalFormSubmit} /> */}
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white xl:pl-11 cursor-pointer text-center"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIcon('name')}
              </th>
             
              <th
                className="w-[150px] py-4 px-4 font-bold text-black dark:text-white xl:pl-11 cursor-pointer text-center text-center"
                onClick={() => handleSort('mobileNumber')}
              >
                Contact {renderSortIcon('mobileNumber')}
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
                onClick={() => handleSort('active')}
              >
                Status {renderSortIcon('active')}
              </th>
              {/* <th
                className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {renderSortIcon('status')}
              </th> */}
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
              : filteredManagers.map((user, index) => (
                  <tr
                    key={index}
                    onClick={() => handleManagerClick(user._id)}
                    className="cursor-pointer"
                  >
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark text-center">
                     
                      <h5  
                      className="font-medium text-black dark:text-white">
                        {user.name || 'N/A'}
                      </h5>
                    </td>
                   
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {user.mobileNumber || 'N/A'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {user.email || 'N/A'}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                      {new Date(user.createdAt).toISOString().slice(0, 10)}
                      </p>
                    </td>
                  
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(user._id,user.active ? true : false);
                        }}
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          user.active == true
                            ? 'bg-success text-success'
                            : 'bg-danger text-danger'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                  </tr>
                ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default AppUserTable;
