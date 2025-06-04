import React from 'react';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { motion } from 'framer-motion';

// import { State } from '../types';
export interface State {
  _id: string;
  name: string;
  stateImage: string;
  cityImage: string;
  cities: string[];
}
import Urls from '../../networking/app_urls';
import { Plus } from 'lucide-react';

interface StateCardProps {
  state: State;
  onEdit: (id: any) => void;
  onDelete: (id: string) => void;
  onClick: (e: any) => void;
}

const StateCard: React.FC<StateCardProps> = ({
  state,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div className="bg-[#f1f5f9] group rounded-xl cursor-pointer overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-black/10">
      <div onClick={onClick} className="relative h-48 overflow-hidden">
        <img
          src={`../../../public//Image/Fallback Image/78787.jpg`}
          alt={`${state.name} landscape`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 group-hover:scale-105"
          onError={(e: any) => {
            e.target.onerror = null; // Prevents looping in case fallback also fails
            e.target.src =
              '../../../public/Image/Fallback Image/default-fallback-image.png'; // Your fallback image path
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h2 className="text-white text-2xl font-bold tracking-tight">
            {state.name}
          </h2>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-4">
          <div className="">
            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1., }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-md bg-transparent px-4 py-1 text-black font-medium focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-all duration-300"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Add City</span>
            </motion.button>
          </div>
          <div className="flex space-x-2">
            {/* <button
              onClick={() => onEdit(state._id)}
              className="p-1.5 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={`Edit ${state.name}`}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button> */}
            <button
              onClick={() => onDelete(state._id)}
              className="p-1.5 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              aria-label={`Delete ${state.name}`}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
        {/* 
        <h3 className="text-sm font-medium text-gray-500">Cities</h3>

        <ul className="space-y-1">
          {state.cities?.map((city: string, index: any) => (
            <li
              key={index}
              className="py-1.5 px-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {city}
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
};

export default StateCard;
