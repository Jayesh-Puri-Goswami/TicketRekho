import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import toast from 'react-hot-toast';
import { X, Film, Clock, User, Tag, Languages, Cast, Calendar, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../Utils/ImageUploader';
import FormField from '../Utils/FormField';
import clsx from 'clsx';

interface CastMember {
  name: string;
  role: string;
}

interface MovieModalFormProps {
  onSubmitSuccess?: () => void;
}

const MovieModalForm: React.FC<MovieModalFormProps> = ({ onSubmitSuccess }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
  const [releaseDate, setReleaseDate] = useState('');

  // Images
  const [movieImage, setMovieImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [advImage, setAdvImage] = useState<File | null>(null);
  const [castImages, setCastImages] = useState<File[]>([]);

  // Flags
  const [isBanner, setIsBanner] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isLatest, setIsLatest] = useState(false);

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

  const clearFormState = () => {
    setName('');
    setDescription('');
    setDirector('');
    setRuntime('');
    setCertification('');
    setGenres([]);
    setFormats([]);
    setLanguages([]);
    setCast([]);
    setReleaseDate('');
    setMovieImage(null);
    setBannerImage(null);
    setAdvImage(null);
    setCastImages([]);
    setIsBanner(false);
    setIsAds(false);
    setIsPopular(false);
    setIsLatest(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation checks
    if (!name.trim()) return toast.error('Please enter the movie name.',{
        className : 'z-[99999]'
      });
    if (!description.trim()) return toast.error('Please enter the movie description.',{
        className : 'z-[99999]'
      });
    if (!director.trim()) return toast.error('Please enter the director name.',{
        className : 'z-[99999]'
      });
    if (!runtime.trim()) return toast.error('Please enter the runtime.',{
        className : 'z-[99999]'
      });
    if (!certification) return toast.error('Please select the certification.',{
        className : 'z-[99999]'
      });
    if (genres.length === 0) return toast.error('Please add at least one genre.',{
        className : 'z-[99999]'
      });
    if (formats.length === 0) return toast.error('Please add at least one format.',{
        className : 'z-[99999]'
      });
    if (languages.length === 0) return toast.error('Please add at least one language.',{
        className : 'z-[99999]'
      });
    if (cast.length === 0) return toast.error('Please add at least one cast member.',{
        className : 'z-[99999]'
      });
    if (!movieImage) return toast.error('Please upload the movie image.',{
        className : 'z-[99999]'
      });
    if (!bannerImage) return toast.error('Please upload the banner image.',{
        className : 'z-[99999]'
      });
    if (!advImage) return toast.error('Please upload the advertisement image.',{
        className : 'z-[99999]'
      });
    if (!releaseDate) return toast.error('Please select the release date.',{
        className : 'z-[99999]'
      });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('director', director);
    formData.append('runtime', runtime);
    formData.append('certification', certification);
    genres.forEach(genre => formData.append('genre[]', genre));
    formats.forEach(format => formData.append('format[]', format));
    languages.forEach(language => formData.append('language[]', language));
    formData.append('movieImage', movieImage);
    formData.append('bannerImage', bannerImage);
    formData.append('advImage', advImage);
    formData.append('cast', JSON.stringify(cast));
    formData.append('isBanner', String(isBanner));
    formData.append('isAds', String(isAds));
    formData.append('isPopular', String(isPopular));
    formData.append('isLatest', String(isLatest));
    formData.append('releaseDate', releaseDate);
    castImages.forEach(file => formData.append('castImages', file));

    try {
      const response = await axios.post(Urls.createMovie, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Movie added successfully!',{
        className : 'z-[99999]'
      });
      clearFormState();
      setIsOpen(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to add movie. Please try again.';
      toast.error(errorMessage,{
        className : 'z-[99999]'
      });
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white"
        style={{
          background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
        }}
      >
        Add Movie
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Add New Movie
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-5">
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
                                  onChange={(e) => setGenres(genres.map((g, i) => i === index ? e.target.value : g))}
                                  className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter genre"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setGenres(genres.filter((_, i) => i !== index))}
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
                                onChange={(e) => setFormats(formats.map((f, i) => i === index ? e.target.value : f))}
                                className="flex-1 rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter format"
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setFormats(formats.filter((_, i) => i !== index))}
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
                                  onChange={(e) => setLanguages(languages.map((l, i) => i === index ? e.target.value : l))}
                                  className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Enter language"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
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

                  {/* Cast Section */}
                  <div className="space-y-4">
                    <FormField label="Cast Members" name="cast">
                      <div className="space-y-2">
                        {cast.map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Cast className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => setCast(cast.map((c, i) => i === index ? { ...c, name: e.target.value } : c))}
                                className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Actor name"
                              />
                            </div>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => setCast(cast.map((c, i) => i === index ? { ...c, role: e.target.value } : c))}
                              className="flex-1 rounded-md border py-2.5 px-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Role"
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setCast(cast.filter((_, i) => i !== index))}
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
                          onClick={() => setCast([...cast, { name: '', role: '' }])}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Cast Member
                        </motion.button>
                      </div>
                    </FormField>

                    {/* Image Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Movie Image (104 × 123 px)" name="movieImage">
                        <ImageUploader
                          onImageChange={(file : any) => setMovieImage(file)}
                          selectedImage={movieImage}
                        />
                      </FormField>

                      <FormField label="Banner Image (345 × 153 px)" name="bannerImage">
                        <ImageUploader
                          onImageChange={(file : any) => setBannerImage(file)}
                          selectedImage={bannerImage}
                        />
                      </FormField>

                      <FormField label="Advertisement Image (306 × 485 px)" name="advImage">
                        <ImageUploader
                          onImageChange={(file : any) => setAdvImage(file)}
                          selectedImage={advImage}
                        />
                      </FormField>

                      <FormField label="Cast Images" name="castImages">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setCastImages(e.target.files ? Array.from(e.target.files) : [])}
                            className="w-full rounded-md border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            accept="image/*"
                          />
                        </div>
                        {castImages.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {castImages.map((image, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{image.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setCastImages(castImages.filter((_, i) => i !== index))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </FormField>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isBanner}
                          onChange={(e) => setIsBanner(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Banner</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Popular</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isLatest}
                          onChange={(e) => setIsLatest(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Latest</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isAds}
                          onChange={(e) => setIsAds(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Ads</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto relative overflow-hidden rounded-md py-2.5 px-6 font-medium text-white disabled:opacity-70"
                      style={{
                        background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Add Movie'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MovieModalForm;