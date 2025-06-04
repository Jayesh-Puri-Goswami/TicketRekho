import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Film,
  Clock,
  User,
  Tag,
  Languages,
  Cast,
  Calendar,
} from 'lucide-react';
import ImageUploader from '../Utils/ImageUploader';
import FormField from '../Utils/FormField';

interface CastMember {
  name: string;
  role: string;
  image: File | null;
}

interface MovieData {
  id: string;
  name: string;
  description: string;
  director: string;
  runtime: string;
  certification: string;
  genres: string[];
  formats: string[];
  languages: string[];
  cast: CastMember[];
  movieImage: string;
  bannerImage: string;
  advImage: string;
  castImages: string[];
  isBanner: string;
  isAds: string;
  isPopular: string;
  isLatest: string;
  releaseDate: string;
}

const UpdateMovie: React.FC<{
  movieId: string;
  onClose: () => void;
  onSubmitSuccess?: (data: any) => void;
}> = ({ movieId, onClose, onSubmitSuccess }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [director, setDirector] = useState('');
  const [runtime, setRuntime] = useState('');
  const [certification, setCertification] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [movieImage, setMovieImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [advImage, setAdvImage] = useState<File | null>(null);
  const [existingMovieImage, setExistingMovieImage] = useState('');
  const [existingBannerImage, setExistingBannerImage] = useState('');
  const [existingAdvImage, setExistingAdvImage] = useState('');
  const [existingCastImages, setExistingCastImages] = useState<string[]>([]);
  const [isBanner, setIsBanner] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isLatest, setIsLatest] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await axios.post(
          `${Urls.getMovieDetails}`,
          { movieId },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          },
        );

        const data = response.data.data;
        setMovieData(data);

        // Set state with fetched data
        setName(data.name);
        setDescription(data.description);
        setDirector(data.director);
        setRuntime(data.runtime);
        setCertification(data.certification);
        setGenres(data.genre);
        setFormats(data.format);
        setLanguages(data.language);
        setExistingMovieImage(data.movieImage || '');
        setExistingBannerImage(data.bannerImage || '');
        setExistingAdvImage(data.advImage || '');
        setExistingCastImages(data.cast.castImage || []);
        setIsBanner(data.isBanner === true);
        setIsAds(data.isAds === true);
        setIsPopular(data.isPopular === true);
        setIsLatest(data.isLatest === true);
        setReleaseDate(formatDate(data.releaseDate));
        setCast(
          data.cast.map((member: any) => ({
            name: member.name,
            role: member.role,
            image: null,
          })),
        );

        console.log(cast[0]);
        
        
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast.error('Failed to load movie data.', {
          className: 'z-[99999]',
        });
      }
    };

    fetchMovieData();
  }, [movieId, currentUser.token]);

  const formatDate = (date: any) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatDuration = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    let hours = '00';
    let minutes = '00';
    if (cleaned.length <= 2) {
      minutes = cleaned.padStart(2, '0');
    } else {
      hours = cleaned.slice(0, cleaned.length - 2).padStart(2, '0');
      minutes = cleaned.slice(-2).padStart(2, '0');
    }
    return `${hours}hrs : ${minutes}mins`;
  };

  const handleRuntimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRuntime(e.target.value);
  };

  const handleRuntimeBlur = () => {
    const formatted = formatDuration(runtime);
    setRuntime(formatted);
  };

  const handleCastImageChange = (index: number, file: File | null) => {
    setCast(
      cast.map((member, i) =>
        i === index ? { ...member, image: file } : member,
      ),
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the movie name.', { className: 'z-[99999]' });
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter the movie description.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (!director.trim()) {
      toast.error('Please enter the director name.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (!runtime.trim()) {
      toast.error('Please enter the runtime.', { className: 'z-[99999]' });
      return;
    }
    if (!certification.trim()) {
      toast.error('Please enter the certification.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (genres.length === 0 || genres.some((g) => !g.trim())) {
      toast.error('Please enter at least one genre.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (formats.length === 0 || formats.some((f) => !f.trim())) {
      toast.error('Please select at least one format.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (languages.length === 0 || languages.some((l) => !l.trim())) {
      toast.error('Please select at least one language.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (cast.length === 0) {
      toast.error('Please add at least one cast member.', {
        className: 'z-[99999]',
      });
      return;
    }
    if (!releaseDate) {
      toast.error('Please select the release date.', {
        className: 'z-[99999]',
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('id', movieId);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('director', director);
    formData.append('runtime', runtime);
    formData.append('certification', certification);
    genres.forEach((genre) => formData.append('genre[]', genre));
    formats.forEach((format) => formData.append('format[]', format));
    languages.forEach((language) => formData.append('language[]', language));

    if (movieImage) formData.append('movieImage', movieImage);
    if (bannerImage) formData.append('bannerImage', bannerImage);
    if (advImage) formData.append('advImage', advImage);

    formData.append('isBanner', String(isBanner));
    formData.append('isAds', String(isAds));
    formData.append('isPopular', String(isPopular));
    formData.append('isLatest', String(isLatest));
    formData.append('releaseDate', releaseDate);

    const castData = cast.map((member) => ({
      name: member.name,
      role: member.role,
    }));
    formData.append('cast', JSON.stringify(castData));

    cast.forEach((member) => {
      if (member.image) {
        formData.append('castImages', member.image);
      }
    });

    try {
      const response = await axios.post(`${Urls.updateMovie}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Movie updated successfully!', { className: 'z-[99999]' });

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      setIsOpen(false);
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to update movie. Please try again.';
      toast.error(errorMessage, { className: 'z-[99999]' });
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
    onClose();
  };

  if (!movieData) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999]">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-indigo-500 w-12 h-12 border-b-4 border-slate-200"></div>
          <p className="text-lg text-slate-700 dark:text-slate-200 font-semibold">
            Loading movie data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Update Movie
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBackdropClick}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-5 px-10">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField label="Movie Name" name="name">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Film className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter movie name"
                        />
                      </div>
                    </FormField>

                    <FormField label="Description" name="description">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter movie description"
                      />
                    </FormField>

                    <FormField label="Director" name="director">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={director}
                          onChange={(e) => setDirector(e.target.value)}
                          className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter director name"
                        />
                      </div>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Runtime" name="runtime">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Clock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={runtime}
                            onChange={handleRuntimeChange}
                            onBlur={handleRuntimeBlur}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="HH:MM"
                          />
                        </div>
                      </FormField>

                      <FormField label="Certification" name="certification">
                        <select
                          value={certification}
                          onChange={(e) => setCertification(e.target.value)}
                          className="w-full rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Select</option>
                          <option value="U">U</option>
                          <option value="A">A</option>
                          <option value="U/A">U/A</option>
                          <option value="S">S</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Release Date" name="releaseDate">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          value={releaseDate}
                          onChange={(e) => setReleaseDate(e.target.value)}
                          className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormField label="Genres" name="genres">
                      <div className="space-y-2">
                        {genres.map((genre, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Tag className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                value={genre}
                                onChange={(e) =>
                                  setGenres(
                                    genres.map((g, i) =>
                                      i === index ? e.target.value : g,
                                    ),
                                  )
                                }
                                className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter genre"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() =>
                                setGenres(genres.filter((_, i) => i !== index))
                              }
                              className="px-3 py-2 bg-red-500 text-white rounded-md"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setGenres([...genres, ''])}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Genre
                        </motion.button>
                      </div>
                    </FormField>

                    <FormField label="Formats" name="formats">
                      <div className="space-y-2">
                        {formats.map((format, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={format}
                              onChange={(e) =>
                                setFormats(
                                  formats.map((f, i) =>
                                    i === index ? e.target.value : f,
                                  ),
                                )
                              }
                              className="flex-1 rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Enter format"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() =>
                                setFormats(
                                  formats.filter((_, i) => i !== index),
                                )
                              }
                              className="px-3 py-2 bg-red-500 text-white rounded-md"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setFormats([...formats, ''])}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Format
                        </motion.button>
                      </div>
                    </FormField>

                    <FormField label="Languages" name="languages">
                      <div className="space-y-2">
                        {languages.map((language, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Languages className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                value={language}
                                onChange={(e) =>
                                  setLanguages(
                                    languages.map((l, i) =>
                                      i === index ? e.target.value : l,
                                    ),
                                  )
                                }
                                className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter language"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() =>
                                setLanguages(
                                  languages.filter((_, i) => i !== index),
                                )
                              }
                              className="px-3 py-2 bg-red-500 text-white rounded-md"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setLanguages([...languages, ''])}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Language
                        </motion.button>
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Cast Section - Updated to match CreateMovie */}
                <div className="space-y-4">
                  <FormField label="Cast Members" name="cast">
                    <div className="space-y-4">
                      {cast.map((member, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Cast className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) =>
                                  setCast(
                                    cast.map((c, i) =>
                                      i === index
                                        ? { ...c, name: e.target.value }
                                        : c,
                                    ),
                                  )
                                }
                                className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Actor name"
                              />
                            </div>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) =>
                                setCast(
                                  cast.map((c, i) =>
                                    i === index
                                      ? { ...c, role: e.target.value }
                                      : c,
                                  ),
                                )
                              }
                              className="flex-1 rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Role"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() =>
                                setCast(cast.filter((_, i) => i !== index))
                              }
                              className="px-3 py-2 bg-red-500 text-white rounded-md"
                            >
                              <X size={16} />
                            </motion.button>
                          </div>

                          {/* Individual Cast Image Upload */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Cast Image
                            </label>
                            <ImageUploader
                              onImageChange={(file: File | null) =>
                                handleCastImageChange(index, file)
                              }
                              selectedImage={member.image}
                              existingImage={Urls.Image_url + existingCastImages[index]}
                            />
                          </div>
                        </div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() =>
                          setCast([
                            ...cast,
                            { name: '', role: '', image: null },
                          ])
                        }
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        + Add Cast Member
                      </motion.button>
                    </div>
                  </FormField>

                  {/* Image Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      label="Movie Image (104 × 123 px)"
                      name="movieImage"
                    >
                      <ImageUploader
                        onImageChange={(file: any) => setMovieImage(file)}
                        selectedImage={movieImage}
                        existingImage={
                          existingMovieImage
                            ? Urls.Image_url + existingMovieImage
                            : undefined
                        }
                      />
                    </FormField>

                    <FormField
                      label="Banner Image (345 × 153 px)"
                      name="bannerImage"
                    >
                      <ImageUploader
                        onImageChange={(file: any) => setBannerImage(file)}
                        selectedImage={bannerImage}
                        existingImage={
                          existingBannerImage
                            ? Urls.Image_url + existingBannerImage
                            : undefined
                        }
                      />
                    </FormField>

                    <FormField
                      label="Advertisement Image (306 × 485 px)"
                      name="advImage"
                    >
                      <ImageUploader
                        onImageChange={(file: any) => setAdvImage(file)}
                        selectedImage={advImage}
                        existingImage={
                          existingAdvImage
                            ? Urls.Image_url + existingAdvImage
                            : undefined
                        }
                      />
                    </FormField>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-wrap gap-6">
                    {/* Banner */}
                    <label
                      htmlFor="banner"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="banner"
                          className="sr-only peer"
                          checked={isBanner}
                          onChange={(e) => setIsBanner(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Banner
                      </span>
                    </label>

                    {/* Popular */}
                    <label
                      htmlFor="popular"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="popular"
                          className="sr-only peer"
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Popular
                      </span>
                    </label>

                    {/* Latest */}
                    <label
                      htmlFor="latest"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="latest"
                          className="sr-only peer"
                          checked={isLatest}
                          onChange={(e) => setIsLatest(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Latest
                      </span>
                    </label>

                    {/* Ads */}
                    <label
                      htmlFor="ads"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="ads"
                          className="sr-only peer"
                          checked={isAds}
                          onChange={(e) => setIsAds(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Ads
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handleBackdropClick}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Movie'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateMovie;
