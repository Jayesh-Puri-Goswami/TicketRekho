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

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../Utils/TableUI';

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

interface Banner {
  id: string;
  title: string;
  image: string;
  isActive: boolean;
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
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Summer Sale',
      image: '/placeholder.svg?height=400&width=800',
      isActive: true,
    },
    {
      id: '2',
      title: 'New Releases',
      image: '/placeholder.svg?height=400&width=800',
      isActive: false,
    },
  ]);
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

  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

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
    // if (tab === 'advertisements') {
    //   fetchAdvertisement(currentPage, itemsPerPage);
    //   console.log(advertisements);

    // }else if (tab === 'banners') {
    // }
  };

  const handleImagePreview = (title: string, imageUrl: string) => {
    setPreviewImage({ title, url: imageUrl });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const fetchMovies = async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);

      // Convert 'Active'/'Inactive' search to boolean
      let searchQuery = search;
      if (search.toLowerCase() === 'active') {
        searchQuery = 'true';
      } else if (search.toLowerCase() === 'inactive') {
        searchQuery = 'false';
      }
      // Fetch data from API
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
      setLoading(false);
    }
  };

  // const fetchAdvertisement = (page: number, limit: number) => {
  //   setLoading(true);

  //   axios
  //     .get(`${Urls.getAdvertisementsUrl}?page=${page}&limit=${limit}`, {
  //       // params: { page, limit }, // Append query parameters
  //       headers: {
  //         Authorization: `Bearer ${currentUser.token}`,
  //       },
  //     })
  //     .then((response) => {
  //       if (response.data.data.ads) {
  //         const ticketData = response.data.data.ads;
  //         setAdvertisements(ticketData);
  //         setTotalPages(response.data.data.pagination?.totalPages || 1);
  //         setSellers(ticketData)
  //       }
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching data:', error);
  //       setLoading(false);
  //     });
  // };

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

  const handleManagerClick = (id: number) => {
    navigate(`/sellerDetail/${id}`);
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
          toast.success('Movie status updated successfully!');
        } else {
          toast.error('Failed to delete the movie.');
        }
      })
      .catch((error) => {
        console.error('Error deleting movie:', error);
        toast.error('Error deleting the movie. Please try again.');
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
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
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
          toast.success('Advertisement deleted successfully.');
        }
      })
      .catch((error) => {
        console.error('Error deleting advertisement:', error);
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
    // console.log(seller);

    const isBanner = seller.isBanner ? 'active' : 'inactive';

    if (seller.isBanner) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        seller.bannerImage?.toLowerCase().includes(search) ||
        seller.status?.toLowerCase().includes(search) ||
        isBanner.includes(search)
      );
    }
  });

  const filteredAdvertisements = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    // console.log(seller);

    const isAds = seller.isAds ? 'active' : 'inactive';

    if (seller.isAds) {
      return (
        seller.name?.toLowerCase().includes(search) ||
        seller.advertisementImage?.toLowerCase().includes(search) ||
        seller.status?.toLowerCase().includes(search) ||
        isAds.includes(search)
      );
    }
  });

  const renderSortIcon = (key: keyof Movies) => {
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
    fetchMovies(currentPage, itemsPerPage, searchTerm);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Tabs */}
      <div className="flex border-b border-stroke mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'movies'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('movies')}
        >
          Movies
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'banners'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('banners')}
        >
          Banners
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'advertisements'
              ? 'text-transparent bg-clip-text bg-indigo-purple border-b-2 border-primary'
              : 'text-black dark:text-white'
          }`}
          onClick={() => handleTabChange('advertisements')}
        >
          Advertisements
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="mb-4 w-full p-2 border border-gray-300 rounded dark:bg-boxdark"
          onChange={handleSearch}
          value={searchTerm}
        />
        {activeTab === 'movies' && (
          <MovieModalForm onSubmitSuccess={handleModalFormSubmit} />
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black dark:text-white">
                {previewImage.title}
              </h3>
              <button
                onClick={closeImagePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage.url || '/placeholder.svg'}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    '../../../public/Image/Fallback Image/default-fallback-image.png';
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        {activeTab === 'movies' && (
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th scope="col" className="px-6 py-4 text-center rounded-tl-lg">
                  Movies {renderSortIcon('name')}
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  Run Time {renderSortIcon('runtime')}
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  Genre {renderSortIcon('genre')}
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  Format {renderSortIcon('format')}
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  Status {renderSortIcon('isActive')}
                </th>
                <th scope="col" className="px-6 py-4 text-center rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-300 rounded-md mb-2"></div>
                          <div className="h-4 bg-slate-300 w-24 rounded"></div>
                        </div>
                      </td>
                      {[...Array(4)].map((_, i) => (
                        <td key={i} className="px-6 py-4 text-center">
                          <div className="h-4 bg-slate-300 rounded w-full"></div>
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
                : filteredMovies.map((movie, i) => (
                    <tr
                      key={i}
                      className="hover:bg-indigo-700/10 dark:hover:bg-indigo-700/10 transition"
                    >
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <img
                            src={movie.image}
                            onError={(e) =>
                              (e.currentTarget.src =
                                '../../../public/Image/Fallback Image/default-fallback-image.png')
                            }
                            alt={movie.name}
                            className="w-30 h-12 object-cover rounded-md mb-1"
                          />
                          <span className="font-semibold truncate w-[8rem]">
                            {movie.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">{movie.runtime}</td>
                      <td className="px-6 py-5 text-center">{movie.genre}</td>
                      <td className="px-6 py-5 text-center">{movie.format}</td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(movie.id, movie.isActive);
                          }}
                          className={`inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1 transition ${
                            movie.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-white'
                          }`}
                        >
                          {movie.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleEditClick(movie.id)}
                            className="text-indigo-500 hover:text-indigo-700 transition"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(movie.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition"
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
        )}

        {activeTab === 'banners' && (
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th className="px-6 py-4 text-center rounded-tl-lg">Banner</th>
                <th className="px-6 py-4 text-center">Title</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBanners.map((banner, i) => (
                <tr
                  key={i}
                  className="hover:bg-indigo-700/10 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <img
                        src={banner.image}
                        alt={banner.name}
                        onError={(e) =>
                          (e.currentTarget.src =
                            '../../../public/Image/Fallback Image/default-fallback-image.png')
                        }
                        className="w-30 h-12 object-cover rounded-md mb-1"
                      />
                      <button
                        onClick={() =>
                          handleImagePreview(banner.name, banner.image)
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Image
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-semibold text-sm inline-block">
                      {banner.name}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEditClick(banner.id)}
                        className="text-indigo-500 hover:text-indigo-700 transition"
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
          <table className="w-full bg-slate-100 text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600">
              <tr>
                <th className="px-6 py-4 text-center rounded-tl-lg">
                  Advertisement
                </th>
                <th className="px-6 py-4 text-center">Title</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAdvertisements.map((banner, i) => (
                <tr
                  key={i}
                  className="hover:bg-indigo-700/10 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <img
                        src={banner.image}
                        alt={banner.name}
                        onError={(e) =>
                          (e.currentTarget.src =
                            '../../../public/Image/Fallback Image/default-fallback-image.png')
                        }
                        className="w-30 h-12 object-cover rounded-md mb-1"
                      />
                      <button
                        onClick={() =>
                          handleImagePreview(banner.name, banner.image)
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Image
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-semibold text-sm  inline-block">
                      {banner.name}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEditClick(banner.id)}
                        className="text-indigo-500 hover:text-indigo-700 transition"
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

        {isModalOpen && selectedMovieId && (
          <UpdateMovie
            movieId={selectedMovieId}
            onClose={handleCloseModal}
            onSubmitSuccess={handleUpdateSuccess}
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
    </div>
  );
};

export default MoviesTable;
