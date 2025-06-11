import { Clapperboard } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import MoviesTable from '../components/Tables/MoviesTable';
import {motion} from 'framer-motion'

const Movies = () => {
  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Movie" />
      <div className="mt-14">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-10"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Clapperboard size={28} className="mr-2 text-indigo-600" />
              Movie Management
            </h1>
            <p className="text-gray-600 mt-1">
              Browse, search and filter movies and add new "Movies"
            </p>
          </div>{' '}
        </motion.div>
      </div>
      <MoviesTable />
    </div>
  );
};

export default Movies;
