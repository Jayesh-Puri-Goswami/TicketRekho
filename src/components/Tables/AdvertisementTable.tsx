import React, { useState, useEffect } from 'react';
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
//import EditCityModal from '../Modals/EditCityModal';
import AdvertisementForm from '../AdvertisementForm';
import toast from 'react-hot-toast';

interface advertisements {
  _id: string;
  adsImg: string;
  url: string;
}

const AdvertisementTable: React.FC = () => {
  const [advertisementy, setadvertisementy] = useState<advertisements[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof advertisements | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [selectedAdvertisement, setSelectedAdvertisement] =
    useState<advertisements | null>(null);
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  //const [editCity, setEditCity] = useState<advertisements | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdvertisement = (page: number, limit: number) => {
    setLoading(true);

    axios
      .get(`${Urls.getAdvertisementsUrl}?page=${page}&limit=${limit}`, {
        // params: { page, limit }, // Append query parameters
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.data.ads) {
          const ticketData = response.data.data.ads;
          setadvertisementy(ticketData);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  const handleModalFormSubmit = () => {
    setIsModalOpen(false);
    setSelectedAdvertisement(null);
    fetchAdvertisement(currentPage, itemsPerPage);
  };

  // const handleEditClick = (city: cities) => {
  //   setEditCity(city);
  //   setIsModalOpen(true);
  // };

  // const handleEditClose = () => {
  //   setEditCity(null);
  //   setIsModalOpen(false);
  // };

  // Parent component - updated onSubmit function signature
  // const handleEditSubmit = (
  //   updatedCity: cities,
  //   cityImageFile: File | null,
  // ) => {
  //   // Create FormData instance to append data (name and city image)
  //   const formData = new FormData();
  //   formData.append('id', updatedCity._id); // Append the city ID
  //   formData.append('name', updatedCity.name); // Append the updated name

  //   if (cityImageFile) {
  //     formData.append('cityImage', cityImageFile); // Append the city image file if available
  //   }

  //   axios
  //     .post(`${Urls.UpdateCity}`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //         Authorization: `Bearer ${currentUser.token}`,
  //       },
  //     })
  //     .then(() => {
  //       alert('City updated successfully!');
  //       handleEditClose(); // Close modal
  //       fetchCity(currentPage, itemsPerPage); // Refresh city data
  //     })
  //     .catch((error) => {
  //       console.error('Error updating city:', error);
  //     });
  // };

  const handleDelete = (id: string) => {
    axios
      .post(
        `${Urls.deleteAdvertisementUrl}`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          toast.success('Advertisement deleted successfully.',{
        className : 'z-[99999]'
      });
          setadvertisementy((prevAdvertisements) =>
            prevAdvertisements.filter(
              (advertisement) => advertisement._id !== id,
            ),
          );
        }
      })
      .catch((error) => {
        console.error('Error deleting advertisement:', error);
      });
  };

  useEffect(() => {
    fetchAdvertisement(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: keyof advertisements) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedTickets = [...advertisementy].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setadvertisementy(sortedTickets);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
  };

  const filteredCities = advertisementy.filter((city) =>
    `${city.url}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderSortIcon = (key: keyof advertisements) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-2" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2" />
      );
    }
    return null;
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
        <AdvertisementForm
          // advertisement={selectedAdvertisement}
          onSubmitSuccess={handleModalFormSubmit}
          //onCancel={handleCancelEdit} // Add this prop to handle canceling edit
        />
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th
                className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11 cursor-pointer"
                onClick={() => handleSort('url')}
              >
                Ads URL {renderSortIcon('url')}
              </th>
              <th
                className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer"
                onClick={() => handleSort('adsImg')}
              >
                Image {renderSortIcon('adsImg')}
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
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
              : filteredCities.map((item, index) => (
                  <tr key={index} className="cursor-pointer">
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11 flex items-center">
                      {/* <img
                        src={
                          `${Urls.Image_url}${item.userId.profileImage}` ||
                          'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010'
                        }
                        alt={ticket.userId.firstName}
                        className="w-12 h-12 rounded-full mr-4"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010';
                        }}
                      /> */}
                      <h5 className="font-medium text-black dark:text-white h-12 flex items-center">
                        {item.url}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <a
                        href={`${Urls.Image_url}${item.adsImg}`}
                        target="_blank"
                      >
                        <img
                          className="h-12 w-full object-contain"
                          src={`${Urls.Image_url}${item.adsImg}`}
                          alt=""
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src =
                              '../../../public/Image/Fallback Image/fallback-1.jpg';
                          }}
                        />
                      </a>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex gap-2">
                        {/* <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-sm font-medium rounded-md focus:outline-none hover:text-[#472DA9]"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button> */}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-sm font-medium rounded-md hover:text-[#d43232] focus:outline-none "
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
          {/* {isModalOpen && editCity && (
            <EditCityModal
              city={editCity}
              onClose={handleEditClose}
              onSubmit={handleEditSubmit}
            />
          )} */}
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

export default AdvertisementTable;
