import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faEdit,
  faTrashAlt,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import MovieModalForm from '../Modals/CreateMovieModal';
import UpdateMovie from '../Modals/UpdateMovie';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader } from 'lucide-react';
import EditButton from '../Buttons/EditButton';
import StatusToggle from '../Buttons/ToggleSwitch';

import { motion } from 'framer-motion';

interface Movies {
  _id: string;
  name: string;
  runtime: string;
  image: string;
  genre: string;
  format: string;
  status: string;
  id: string;
  isActive: boolean;
  isAds: boolean;
  isBanner: boolean;
  advertisementImage: string;
  bannerImage: string;
}

interface Advertisement {
  id: string;
  title: string;
  image: string;
  isActive: boolean;
}

type TabType = 'movies' | 'banners' | 'advertisements';

const MoviesTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [sellers, setSellers] = useState<Movies[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([
    {
      id: '1',
      title: 'Premium Subscription',
      image: '/placeholder.svg?height=400&width=600',
      isActive: true,
    },
    {
      id: '2',
      title: 'Special Offer',
      image: '/placeholder.svg?height=400&width=600',
      isActive: true,
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Movies | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const handleEditClick = (movieId: string) => {
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleImagePreview = (title: string, imageUrl: string) => {
    setPreviewImage({ title, url: imageUrl });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const fetchMovies = async (page: number, limit: number, search: string) => {
    try {
      setTableLoading(true);
      let searchQuery = search;
      if (search.toLowerCase() === 'active') {
        searchQuery = 'true';
      } else if (search.toLowerCase() === 'inactive') {
        searchQuery = 'false';
      }
      const response = await axios.get(
        `${
          Urls.getMovies
        }?page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        },
      );

      const { status, data } = response.data;

      if (status && data && Array.isArray(data.movieList)) {
        const movieData = data.movieList.map((movie: any) => ({
          id: movie._id,
          name: movie.name,
          description: movie.description,
          runtime: movie.runtime,
          genre: movie.genre?.join(', ') || 'N/A',
          director: movie.director || 'Unknown',
          language: movie.language?.join(', ') || 'N/A',
          format: movie.format?.join(', ') || 'N/A',
          certification: movie.certification || 'Unrated',
          cast:
            movie.cast?.map((actor: any) => ({
              name: actor.name,
              role: actor.role,
              image: `${Urls.Image_url}${actor.castImage}`,
            })) || [],
          rating: movie.rating || 0,
          totalRatings: movie.totalRatings || 0,
          image: `${Urls.Image_url}${movie.movieImage}`,
          createdAt: new Date(movie.createdAt).toLocaleDateString(),
          isActive: movie.isActive,
          isBanner: movie.isBanner,
          isAds: movie.isAds,
          bannerImage: `${Urls.Image_url}${movie.bannerImage}`,
          advertisementImage: `${Urls.Image_url}${movie.advImage}`,
        }));

        setSellers(movieData);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        console.warn('Unexpected API response structure or missing data');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    fetchMovies(currentPage, itemsPerPage, searchTerm);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (activeTab === 'movies') {
        fetchMovies(currentPage, itemsPerPage, searchTerm);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof Movies) => {
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
    setItemsPerPage(Number.parseInt(e.target.value, 10));
  };

  const handleManagerClick = (id: string) => {
    navigate(`/movies/detail/${id}`);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    axios
      .post(
        `${Urls.changeMovieStatus}`,
        { id, isActive: updatedStatus ? true : false },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setSellers((prevMovies) =>
            prevMovies.map((movie) =>
              movie.id === id ? { ...movie, isActive: updatedStatus } : movie,
            ),
          );
          // toast.success('Movie status updated successfully!');
        } else {
          toast.error('Failed to update movie status.');
        }
      })
      .catch((error) => {
        console.error('Error updating movie status:', error);
        toast.error('Error updating movie status. Please try again.');
      });
  };

  const MySwal = withReactContent(Swal);

  const handleDelete = (movieId: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this movie? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      position: 'center',
      customClass: {
        confirmButton:
          'bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition',
        cancelButton:
          'bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMovie(movieId);
      }
    });
  };

  const handleAddDelete = (id: string) => {
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
          setAdvertisements((prevAds) => prevAds.filter((ad) => ad.id !== id));
          toast.success('Advertisement deleted successfully.');
        }
      })
      .catch((error) => {
        console.error('Error deleting advertisement:', error);
        toast.error('Error deleting advertisement.');
      });
  };

  const deleteMovie = (id: string) => {
    axios
      .post(
        `${Urls.deleteMovie}`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setSellers((prevMovies) =>
            prevMovies.filter((movie) => movie.id !== id),
          );
          toast.success('Movie deleted successfully!');
        } else {
          toast.error('Failed to delete the movie.');
        }
      })
      .catch((error: any) => {
        console.error('Error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          'Oops! Something went wrong while deleting the movie. Please try again later.';
        toast.error(errorMessage);
      });
  };

  const filteredMovies = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isActiveString = seller.isActive ? 'active' : 'inactive';
    return (
      seller.name?.toLowerCase().includes(search) ||
      seller.runtime?.toLowerCase().includes(search) ||
      seller.status?.toLowerCase().includes(search) ||
      seller.genre?.toLowerCase().includes(search) ||
      seller.format?.toLowerCase().includes(search) ||
      isActiveString.includes(search)
    );
  });

  const filteredBanners = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isBanner = seller.isBanner ? 'active' : 'inactive';
    if (seller.isBanner) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        seller.bannerImage?.toLowerCase().includes(search) ||
        seller.status?.toLowerCase().includes(search) ||
        isBanner.includes(search)
      );
    }
    return false;
  });

  const filteredAdvertisements = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    const isAds = seller.isAds ? 'active' : 'inactive';
    if (seller.isAds) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        seller.advertisementImage?.toLowerCase().includes(search) ||
        seller.status?.toLowerCase().includes(search) ||
        isAds.includes(search)
      );
    }
    return false;
  });

  const renderSortIcon = (key: keyof Movies) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} className="ml-2 text-gray-500" />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} className="ml-2 text-gray-500" />
      );
    }
    return null;
  };

  const handleModalFormSubmit = () => {
    fetchMovies(currentPage, itemsPerPage, searchTerm);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading Movies...</h2>
      </div>
    );
  }

  return (
    <div className="p-6  dark:bg-gray-900 rounded-xl shadow-sm">
      {/* Tabs */}
      {/* <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        {['movies'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleTabChange(tab as TabType)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div> */}

      {/* Search and Add Movie */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, genre, format, or status..."
            className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
            onChange={handleSearch}
            value={searchTerm}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {activeTab === 'movies' && (
          <MovieModalForm onSubmitSuccess={handleModalFormSubmit} />
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {previewImage.title}
              </h3>
              <button
                onClick={closeImagePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={previewImage.url || '/placeholder.svg'}
              alt={previewImage.title}
              className="w-full max-h-[70vh] object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.src =
                  '/Image/Fallback Image/default-fallback-image.png';
              }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl p-5">
        {activeTab === 'movies' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="px-6 py-4 rounded-tl-lg cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Movie {renderSortIcon('name')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('runtime')}
                >
                  Run Time {renderSortIcon('runtime')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('genre')}
                >
                  Genre {renderSortIcon('genre')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('format')}
                >
                  Format {renderSortIcon('format')}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSort('isActive')}
                >
                  Status {renderSortIcon('isActive')}
                </th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tableLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                          <div className="h-5 bg-gray-200 rounded w-40"></div>
                        </div>
                      </td>
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-5 bg-gray-200 rounded w-24"></div>
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredMovies.map((movie, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150 cursor-pointer"
                      onClick={() => handleManagerClick(movie.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.image}
                            alt={movie.name}
                            className="w-12 h-16 object-cover rounded-md"
                            onError={(e) =>
                              (e.currentTarget.src =
                                '/Image/Fallback Image/default-fallback-image.png')
                            }
                          />
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-100 max-w-[200px]">
                            {movie.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base text-gray-600 dark:text-gray-300">
                        {movie.runtime}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-600 dark:text-gray-300">
                        {movie.genre}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-600 dark:text-gray-300">
                        {movie.format}
                      </td>
                      <td className="px-6 py-4">
                        <label
                          htmlFor={`status-toggle-${movie.id}`}
                          className="flex items-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(movie.id, movie.isActive);
                          }}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              id={`status-toggle-${movie.id}`}
                              className="sr-only peer"
                              checked={movie.isActive}
                              readOnly
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                                movie.isActive
                                  ? 'bg-indigo-purple'
                                  : 'bg-slate-500'
                              }`}
                            ></div>
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
                                movie.isActive ? 'translate-x-5' : ''
                              }`}
                            ></div>
                          </div>
                          <span
                            className={`ml-3 text-xs font-semibold transition-colors ${
                              movie.isActive
                                ? 'text-green-700 dark:text-green-200'
                                : 'text-slate-700 dark:text-red-200'
                            }`}
                          >
                            {/* {movie.isActive ? 'Active' : 'Inactive'} */}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-8 flex">
                        <div className="flex items-center justify-center gap-3">
                          <EditButton
                            icon={faEdit}
                            title="Edit"
                            label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(movie.id);
                            }}
                          />
                          {!movie.isActive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(movie.id);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition transition-opacity duration-300"
                              title="Delete"
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
        )}

        {/* {activeTab === 'banners' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Banner</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBanners.map((banner, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={banner.bannerImage}
                        alt={banner.name}
                        className="w-12 h-16 object-cover rounded-md"
                        onError={(e) =>
                          (e.currentTarget.src =
                            '/Image/Fallback Image/default-fallback-image.png')
                        }
                      />
                      <button
                        onClick={() =>
                          handleImagePreview(banner.name, banner.bannerImage)
                        }
                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                      >
                        View Banner
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {banner.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(banner.id)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'advertisements' && (
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Advertisement</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredAdvertisements.map((ad, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.advertisementImage}
                        alt={ad.name}
                        className="w-12 h-16 object-cover rounded-md"
                        onError={(e) =>
                          (e.currentTarget.src =
                            '/Image/Fallback Image/default-fallback-image.png')
                        }
                      />
                      <button
                        onClick={() =>
                          handleImagePreview(ad.name, ad.advertisementImage)
                        }
                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                      >
                        View Advertisement
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {ad.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(ad.id)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleAddDelete(ad.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )} */}

        {isModalOpen && selectedMovieId && (
          <UpdateMovie
            movieId={selectedMovieId}
            onClose={handleCloseModal}
            onSubmitSuccess={handleUpdateSuccess}
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <label
              htmlFor="itemsPerPage"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviesTable;
