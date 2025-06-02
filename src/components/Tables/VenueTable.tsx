import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toast from 'react-hot-toast';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faTags,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import VenueForm from '../VenueForm';
import CreateVenueNameForm from '../CreateVenueNameForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


interface Venue {
  _id: string;
  name: string;
   address: string;
  seatType: string;
  isActive: boolean;
}

const VenueTable: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1); // Total pages from API
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Venue | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Venue | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
 // console.log("currentUser",currentUser.role);
  const roleName = currentUser.role;


  const formatName = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')         // Add space before capital letters
    .split(' ')                                   // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');                                   // Join words back
};

  const fetchManagers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.displayVenueList}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        console.log("response.data.data ",response.data.data);
        if(      
          response.data.status &&
          response.data.data         
        ) {
          const managerData = response.data.data;        
          setVenues(managerData);
          setTotalPages(response.data.data.pagination.totalPages); // Set total pages from API
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchManagers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof Venue) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedManagers = [...venues].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setVenues(sortedManagers);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };


  const toggleStatus = (venueId: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    axios
      .post(
        `${Urls.changeVenueStatus}`,
        { venueId,isActive: updatedStatus ? true : false, },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {

          toast.success(
            'Venue status changed successfully!',
          );

        

          setVenues((prevVenues) =>
            prevVenues.map((venue) =>
              venue._id === venueId // Use the correct id parameter here
                ? { ...venue, isActive: updatedStatus }
                : venue,
            ),
          );

        }
      })
      .catch((error) => {
        toast.error(
          'Oops! Something went wrong while updating the venue status. Please try again later.',
        );
        console.error('Error updating the venue status:', error);
      });
  };


 const MySwal = withReactContent(Swal);

const handleDelete = (venueId: string) => {
  MySwal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this venue? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    position: 'center', // Ensure modal is centered
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      deleteVenue(venueId);
    }
  });
};



  const deleteVenue = (venueId: string) => {

    axios
      .post(
        `${Urls.deleteVenue}`,
        { venueId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {

          toast.success(
            'Venue deleted successfully!',
          );

           setVenues((prevVenues) =>
            prevVenues.filter((venue) => venue._id !== venueId),
          );

        
        }
      })
      .catch((error: any) => {

          console.error('Error:', error);

  const errorMessage =
    error?.response?.data?.message ||
     'Oops! Something went wrong while deleting the venue. Please try again later.';

  toast.error(errorMessage);
      

      });
  };


const filteredManagers = venues.filter((manager) => {
  const search = searchTerm.toLowerCase();

  return (
    manager.name?.toLowerCase().includes(search) ||
    manager.seatType?.toLowerCase().includes(search) ||
    (manager.isActive ? 'Active' : 'Inactive').includes(search)
  );
});


  const renderSortIcon = (key: keyof Venue) => {
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
    setShowModal(false);
    setSelectedCoupon(null);
    fetchManagers(currentPage, itemsPerPage);
  };


  const handleCancelEdit = () => {
    // Reset selectedBanner and close the modal
    setSelectedCoupon(null);
    setShowModal(false);
  };

  const handleSittingClick = (id: string) => {
    navigate(`/event-seat-layout/${id}`);
  };

  const handleNonSittingClick = (id: string) => {
    navigate(`/nonsittingvenue/${id}`);
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
      <CreateVenueNameForm
        onSubmitSuccess={handleModalFormSubmit}
        onCancel={handleCancelEdit} // Add this prop to handle canceling edit
      />
    )}
    
      </div>

      <div className="max-w-full overflow-x-auto">
        
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="w-[220px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('name')}
              >
                Venue Name {renderSortIcon('name')}
              </th>
              <th
                className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('seatType')}
              >
                 Type {renderSortIcon('seatType')}
              </th>

                 <th
                className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('address')}
              >
                 Address {renderSortIcon('address')}
              </th>
             
              <th
                className="min-w-[150px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('isActive')}
              >
                 Status {renderSortIcon('isActive')}
              </th>
               <th
                 className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
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
                          {/* <div className="rounded-full bg-slate-200 dark:bg-slate-300 h-10 w-10"></div> */}
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
              : filteredManagers.map((venue, index) => (
                  <tr key={index}
                  onClick={(e) =>{ e.stopPropagation();
                            
                    if (venue.seatType === 'sitting') {
                      handleSittingClick(venue._id)
                    } else if (venue.seatType === 'nonSitting') {
                      handleNonSittingClick(venue._id)
                    }

                    }}
                   className="cursor-pointer"
                   >
                    <td className="border-b border-[#eee] py-5 px-4  dark:border-strokedark text-center">
                     
                      <h5 
                      //  title="Click to view seat layout"
                     
                      className="text-black dark:text-white"

                      >
                        {venue.name}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {formatName(venue.seatType)}
                      </p>
                    </td>
                   
                     <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <p className="text-black dark:text-white">
                        {venue.address}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(venue._id, venue.isActive ? true : false);
                        }}
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          venue.isActive == true
                            ? 'bg-success text-success'
                            : 'bg-danger text-danger'
                        }`}
                      >
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                                          {/* <div className="flex gap-2"> */}
                                            <button
                                              onClick={(e) =>{
                                                 e.stopPropagation();
                                               handleDelete(venue._id)}}
                                              className="p-2 text-sm font-medium rounded-md hover:text-[#d43232] focus:outline-none "
                                            >
                                              <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                          {/* </div> */}
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

export default VenueTable;

