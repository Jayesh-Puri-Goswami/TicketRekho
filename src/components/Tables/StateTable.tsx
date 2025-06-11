import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  // faEdit,
  // faTrashAlt,
  // faCity,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
// import EditStateModal from '../Modals/EditStateModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import StateCard from '../Cards/StateCard';

interface states {
  _id: string;
  name: string;
  stateImage: string;
  state : string;
}

const StateTable: React.FC<{ reload: boolean }> = ({ reload }) => {
  const [statey, setStatey] = useState<states[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof states | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  const [editState, setEditState] = useState<states | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const fetchState = (page: number, limit: number) => {
    setLoading(true);

    axios
      .get(`${Urls.getStates}`, {
        // params: { page, limit }, // Append query parameters
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.data) {
          const ticketData = response.data.data;
          setStatey(ticketData);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  const handleEditClick = (state: states) => {
    setEditState(state);
    setIsModalOpen(true);
  };

  const handleEditClose = () => {
    setEditState(null);
    setIsModalOpen(false);
  };

  const handleStateClick = (id: string) => {
    navigate(`/city/${id}`);
  };

  // Parent component - updated onSubmit function signature
  const handleEditSubmit = (
    updatedState: states,
    stateImageFile: File | null,
  ) => {
    // Create FormData instance to append data (name and city image)
    const formData = new FormData();
    formData.append('id', updatedState._id); // Append the city ID
    formData.append('name', updatedState.name); // Append the updated name

    if (stateImageFile) {
      formData.append('stateImage', stateImageFile); // Append the city image file if available
    }

    axios
      .post(`${Urls.UpdateState}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then(() => {
        toast.success('State updated successfully!');
        handleEditClose(); // Close modal
        fetchState(currentPage, itemsPerPage); // Refresh city data
      })
      .catch((error) => {
        console.error('Error updating state:', error);
      });
  };

  useEffect(() => {
    fetchState(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, reload]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof states) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedTickets = [...statey].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setStatey(sortedTickets);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
  };

  const filteredStates = statey.filter((state) =>
    `${state.name}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const MySwal = withReactContent(Swal);

  const handleDelete = (stateId: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this state? This action cannot be undone.',
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
        deleteState(stateId);
      }
    });
  };

  const deleteState = (id: string) => {
    axios
      .post(
        `${Urls.deleteState}`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setStatey((prevStates) =>
            prevStates.filter((state) => state._id !== id),
          );

          // Show success toast
          toast.success('State deleted successfully!');
        } else {
          // Show error toast if the status is false
          toast.error('Failed to delete the state.');
        }
      })
      .catch((error: any) => {
        console.error('Error:', error);

        const errorMessage =
          error?.response?.data?.message ||
          'Oops! Something went wrong while deleting the state. Please try again later.';

        toast.error(errorMessage);
      });
  };

  const renderSortIcon = (key: keyof states) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-2" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2" />
      );
    }
    return null;
  };

  if (filteredStates.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 bg-clip-text text-transparent">
          No states added yet
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a state to start exploring its information here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by state name ..."
          className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input transition focus:border-primary dark:focus:border-primary"
          onChange={handleSearch}
        />
      </div>

      {/* <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('name')}
              >
                State Name {renderSortIcon('name')}
              </th>
              <th
                className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center"
                onClick={() => handleSort('stateImage')}
              >
                Image {renderSortIcon('stateImage')}
              </th>

              <th className="min-w-[120px] py-4 px-4 font-bold text-black dark:text-white cursor-pointer text-center">
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
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-300 rounded w-full animate-pulse"></div>
                      </td>
                    </tr>
                  ))
              : filteredStates.map((item, index) => (
                  // <tr
                  //   key={index}
                  //   onClick={(e) => {
                  //     e.stopPropagation();
                  //     handleStateClick(item._id);
                  //   }}
                  //   className="cursor-pointer"
                  // >
                  //   <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                  //     <h5
                  //       className="font-medium text-black dark:text-white h-12 flex items-center justify-center cursor-pointer hover:text-blue-600"
                  //       // title={`Click to view cities`} // 👈 T
                  //     >
                  //       {item.name}
                  //     </h5>
                  //   </td>
                  //   <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark w-32 text-center">
                  //     <a
                  //       href={`${Urls.Image_url}${item.stateImage}`}
                  //       target="_blank"
                  //       rel="noopener noreferrer"
                  //       className="inline-block w-full"
                  //     >
                  //       <img
                  //         src={`${Urls.Image_url}${item.stateImage}`}
                  //         alt="State"
                  //         className="h-12 mx-auto object-contain"
                  //         onError={(e: any) => {
                  //           e.target.onerror = null; // Prevents looping in case fallback also fails
                  //           e.target.src =
                  //             '../../../public/Image/Fallback Image/fallback-1.jpg'; // Your fallback image path
                  //         }}
                  //       />
                  //     </a>
                  //   </td>

                  //   <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center">
                  //     <div>

                  //       <button
                  //         onClick={(e) => {
                  //           e.stopPropagation(); // ✅ prevents triggering the row's onClick
                  //           handleEditClick(item);
                  //         }}
                  //         className="p-2 text-sm font-medium rounded-md focus:outline-none hover:text-[#472DA9]"
                  //       >
                  //         <FontAwesomeIcon icon={faEdit} />
                  //       </button>

                  //       <button
                  //         onClick={(e) => {
                  //           e.stopPropagation();
                  //           handleDelete(item._id);
                  //         }}
                  //         className="p-2 text-sm font-medium rounded-md hover:text-[#d43232] focus:outline-none "
                  //       >
                  //         <FontAwesomeIcon icon={faTrashAlt} />
                  //       </button>
                  //     </div>
                  //   </td>
                  // </tr>
                 
                ))}
          </tbody>
          {isModalOpen && editState && (
            <EditStateModal
              state={editState}
              onClose={handleEditClose}
              onSubmit={handleEditSubmit}
            />
          )}
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
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-5">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 animate-pulse-custom"
                >
                  <div className="relative h-48 bg-slate-200 shimmer rounded-t-xl" />

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 w-24 bg-slate-200 rounded shimmer"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-slate-200 rounded-full shimmer"></div>
                        <div className="h-8 w-8 bg-slate-200 rounded-full shimmer"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded shimmer"></div>
                      <div className="h-4 w-3/4 bg-slate-200 rounded shimmer"></div>
                      <div className="h-4 w-5/6 bg-slate-200 rounded shimmer"></div>
                    </div>
                  </div>
                </div>
              ))
          : filteredStates.map((state, index) => (
              <StateCard
                key={index}
                state={state}
                // onEdit={handleEditClick}
                onDelete={handleDelete}
                onClick={(e) => {
                  e.preventDefault();
                  handleStateClick(state._id);
                }}
              />
            ))}
      </div>
      {/* {isModalOpen && editState && (
        <EditStateModal
          state={editState}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
        />
      )} */}
    </div>
  );
};

export default StateTable;
