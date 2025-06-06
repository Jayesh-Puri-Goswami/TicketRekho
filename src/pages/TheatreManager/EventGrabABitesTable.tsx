import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import AddEventGrabABiteModal from './AddEventGrabABiteModal';
import toast from 'react-hot-toast';
import UpdateEventGrabaBiteModal from './UpdateEventGrabaBiteModal';

interface TManager {
  _id: string;
  name: string;
  foodType: string;
  grabImage: string;
  description: string;
  status: boolean;
  price: number;
}

const EventGrabABitesTable: React.FC = () => {
  const { id } = useParams(); 
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

  const [selectedTheatre, setSelectedTheatre] = useState<TManager | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);


  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const roleName = currentUser.role;
 
  const data = {eventId:id, foodType:''};

  const fetchSellers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getEventGrabABiteListWithPagination}?eventId=${id}&page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (
          response.data.status &&
          response.data.data.grabList &&
          Array.isArray(response.data.data.grabList)
        ) {
          const managerData = response.data.data.grabList;
          // const managerData = response.data.data.map((manager: any) => ({
          //   ...manager,
          //   image: `${Urls.Image_url}${manager.profileImage}`,
          //   location: manager.location,
          //   isGrabABite: manager.isGrabABite,
          //   isOperational: manager.isOperational,
          // }));

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
 const formatName = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')         // Add space before capital letters
    .split(' ')                                   // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');                                   // Join words back
};


  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (!currentUser || !currentUser.token) {
        toast.error('User is not authenticated. Please log in again.');
        return;
      }
       const updatedStatus = !currentStatus;
      const response = await axios.post(
        `${Urls.deleteEventGrabAABite}`,
        {
          id: id,
          status: updatedStatus ? true : false, // Adjust according to your API requirements

         },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (response.data.status) {
        toast.success('Grab a bite status changed successfully');
        setSellers((prevTheatre) =>
            prevTheatre.map((theatre) =>
              theatre._id === id // Use the correct id parameter here
                ? { ...theatre, status: updatedStatus }
                : theatre,
            ),
          );

      } else {
        toast.error('Failed to change status of a grab a bite');
      }
    } catch (error: any) {
      console.error(
        'Error to change status of a  grab a bite:',
        error.response?.data || error.message,
      );

      // Handle specific logout scenarios
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('An error occurred while changing status of a the grab a bite.');
      }
    }
  };

  // Open the modal with selected theatre data for updating
  const handleEdit = (theatre: TManager) => {
    console.log("Working");
    console.log("theatre",theatre);
    setSelectedTheatre(theatre);
    setModalOpen(true);
  };

  // Handle adding/updating theatres
  const handleFormSubmitSuccess = (updatedTheatre: TManager) => {
    if (selectedTheatre) {
      // Update existing theatre in the list
      setSellers((prev) =>
        prev.map((t) => (t._id === updatedTheatre._id ? updatedTheatre : t)),
      );
    } else {
      // Add new theatre to the list
      setSellers((prev) => [...prev, updatedTheatre]);
    }
    setModalOpen(false);
    setSelectedTheatre(null);
     fetchSellers(currentPage, itemsPerPage);
  };

  // Close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTheatre(null);
  };

const filteredManagers = sellers.filter((seller) =>
  seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (seller.foodType?.toLowerCase().includes(searchTerm.toLowerCase()))
);


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
    fetchSellers(currentPage, itemsPerPage);
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
         {roleName !== 'admin' && (
         <AddEventGrabABiteModal onSubmitSuccess={handleModalFormSubmit} /> 
        )}
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center whitespace-nowrap"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIcon('name')}
              </th>

              <th
                className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center whitespace-nowrap"
              
              >
                Image 
              </th>

              <th
                className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center whitespace-nowrap"
                onClick={() => handleSort('foodType')}
              >
                Type {renderSortIcon('foodType')}
              </th>
              <th
                className="min-w-[220px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center whitespace-nowrap"
                onClick={() => handleSort('price')}
              >
                Price {renderSortIcon('price')}
              </th>
              <th
                className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center whitespace-nowrap"
                onClick={() => handleSort('status')}
              >
                Status {renderSortIcon('status')}
              </th>
              <th
                className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
               
              >
                Action 
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
                   
                    className="cursor-pointer"
                  >
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark text-center whitespace-nowrap">
                    
                      <h5 className="font-medium text-black dark:text-white">
                        {manager.name}
                      </h5>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <img
                                           className="h-12 w-full object-contain"
                                               src={`${Urls.Image_url}${manager.grabImage}` ||
                          'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010'
                                               }
                                             />
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {formatName(manager.foodType)}
                      </p>
                    </td>
                    
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {manager.price}
                      </p>
                    </td>

                   
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(manager._id,manager.status ? true : false);
                        }}
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          manager.status == true
                            ? 'bg-success text-success'
                            : 'bg-danger text-danger'
                        }`}
                      >
                        {manager.status ? 'Active' : 'Inactive'}
                      </button> */}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(manager._id,manager.status ? true : false);
                        }}
                        className="flex items-center cursor-pointer focus:outline-none"
                      >
                        <div className="relative w-11 h-6">
                          <div
                            className={`w-full h-full rounded-full transition-colors duration-300 ${
                              manager.status ? 'bg-indigo-500' : 'bg-slate-500'
                            }`}
                          ></div>
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
                              manager.status ? 'translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </button>
                    </td>
                   
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <div>
                        {/* className="flex gap-2" */}
                        <button
                          // onClick={() => editBanner(banner)}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents the event from bubbling up to the row
                            handleEdit(manager);
                          }}
                          className="p-2 text-sm font-medium rounded-md focus:outline-none hover:text-[#472DA9]"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
         {isModalOpen && (
          <UpdateEventGrabaBiteModal
            theatreData={selectedTheatre}
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
    </div>
  );
};

export default EventGrabABitesTable;
