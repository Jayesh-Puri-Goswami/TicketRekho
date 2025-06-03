import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Film,
  Globe,
  Star,
  Tag,
  User,
  Video,
  PlayCircle,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Urls from '../networking/app_urls';
import { useParams } from 'react-router-dom';

interface CastMember {
  name: string;
  role: string;
  castImage?: string;
  _id?: string;
}

interface MovieData {
  _id: string;
  name: string;
  description: string;
  director: string;
  runtime: string;
  certification: string;
  genre: string[];
  format: string[];
  language: string[];
  cast: CastMember[];
  movieImage: string;
  bannerImage: string;
  advImage: string;
  isBanner: boolean;
  isAds: boolean;
  isPopular: boolean;
  isLatest: boolean;
  releaseDate: string;
  rating: number;
  totalRatings: number;
}

interface MovieDetailProps {
  movieId: string;
}

const MovieDetail: React.FC<MovieDetailProps> = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const titleY = useTransform(scrollY, [0, 300], [0, 100]);

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { movieId } = useParams<{ movieId: string }>();

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        console.log(movieId);

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
        setMovieData({
          ...data,
          isBanner: data.isBanner === true || data.isBanner === 'true',
          isAds: data.isAds === true || data.isAds === 'true',
          isPopular: data.isPopular === true || data.isPopular === 'true',
          isLatest: data.isLatest === true || data.isLatest === 'true',
        });
        document.title = `${data.name} | Movie Details`;
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast.error('Failed to load movie data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (movieId && currentUser?.token) {
      fetchMovieData();
    }
  }, [movieId, currentUser?.token]);

  if (isLoading || !movieData) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-indigo-500 w-12 h-12 border-b-4 border-slate-200"></div>
          <p className="text-lg text-slate-700 dark:text-slate-200 font-semibold">
            Loading movie data...
          </p>
        </div>
      </div>
    );
  }

  // Format release date
  const releaseDate = new Date(movieData.releaseDate);
  const formattedDate = releaseDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Check if movie is released
  const isReleased = new Date() > releaseDate;

  // Calculate days until release
  const daysUntilRelease = Math.ceil(
    (releaseDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Hero Section with Banner */}
      <div className="relative h-[70vh] overflow-hidden rounded-xl">
        <motion.div
          style={{ opacity, scale }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={Urls.Image_url + movieData.bannerImage}
            alt={movieData.name}
            className="w-full h-full object-cover object-center"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src =
                '../../../public/Image/Fallback Image/fallback-1.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 mix-blend-overlay" />
        </motion.div>

        <motion.div
          style={{ y: titleY }}
          className="absolute bottom-0 left-0 w-full p-8 md:p-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              {movieData.genre.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full"
                >
                  {genre}
                </span>
              ))}
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                {movieData.certification}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {movieData.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{movieData.runtime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{movieData.director}</span>
              </div>
            </div>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
            >
              <PlayCircle size={20} />
              Watch Trailer
            </motion.button> */}
          </motion.div>
        </motion.div>
      </div>

      {/* Movie Info Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Poster and Quick Info */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl overflow-hidden shadow-xl shadow-indigo-200 relative aspect-[2/3]"
            >
              <img
                src={Urls.Image_url+ movieData.movieImage}
                alt={`${movieData.name} poster`}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src =
                    '../../../public/Image/Fallback Image/fallback-1.jpg';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                {isReleased ? (
                  <div className="text-white font-medium">Now Showing</div>
                ) : (
                  <div className="text-white font-medium">
                    Releases in {daysUntilRelease} days
                  </div>
                )}
              </div>
            </motion.div>

            <div className="mt-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  FORMATS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.format.map((format, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  LANGUAGES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.language.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Star size={16} />
                  RATING
                </h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + star * 0.1 }}
                      >
                        <Star
                          size={24}
                          className={
                            star <= Math.round(movieData.rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-slate-300'
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                  <span className="ml-2 text-lg font-semibold">
                    {movieData.rating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-slate-500">
                    ({movieData.totalRatings} reviews)
                  </span>
                </div>
              </motion.div> */}
            </div>
          </div>

          {/* Right Column - Details and Cast */}
          <div className="md:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Film className="text-indigo-500" />
                Description
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {movieData.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-indigo-500" />
                Cast & Crew
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movieData.cast.map((member, index) => (
                  <motion.div
                    key={member._id || index}
                    whileHover={{ y: 0 }}
                    className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl overflow-hidden shadow-md group transition-transform duration-300"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={
                           Urls.Image_url+member.castImage ||
                          ''
                        }
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src =
                            '../../../public/Image/Fallback Image/fallback-1.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Video />
                Watch Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.a
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center"
                  href='https://ticketrekho.com/TicketRekhoProd.apk'
                >
                  Book Tickets
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center"
                >
                  Get Notified
                </motion.button>
              </div>
            </motion.div> */}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      {/* <div className="bg-slate-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-indigo-600">
                {movieData.name}
              </h3>
              <p className="text-slate-500">
                © 2025 Paramount Pictures. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-full"
              >
                <Star size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-full"
              >
                <PlayCircle size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-full"
              >
                <Calendar size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default MovieDetail;
