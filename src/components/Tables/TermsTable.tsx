import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import TermForm from '../TermForm';

interface Terms {
  _id: string;
  type: string;
  content: string;
}

const TermsTable: React.FC = () => {
  const [terms, setTerms] = useState<Terms[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Terms | null;
    direction: string;
  }>({
    key: null,
    direction: 'ascending',
  });
  const [loading, setLoading] = useState(true);
  const [selectedTerms, setSelectedTerms] = useState<Terms | null>(null);
  const [showModal, setShowModal] = useState(false);

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchManagers = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getTermPolicyList}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && response.data.data) {
          const managerData = response.data.data;
          setTerms(managerData);
          setTotalPages(response.data.data.pagination.totalPages);
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

  const handleSort = (key: keyof Terms) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedManagers = [...terms].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setTerms(sortedManagers);
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const editBanner = (term: Terms) => {
    setSelectedTerms(term);
    setShowModal(true);
  };

  const handleAddTerm = () => {
    setSelectedTerms(null);
    setShowModal(true);
  };

  const filteredManagers = terms.filter((manager) =>
    manager.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderSortIcon = (key: keyof Terms) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <ChevronUp className="w-4 h-4 ml-2 inline" />
      ) : (
        <ChevronDown className="w-4 h-4 ml-2 inline" />
      );
    }
    return null;
  };

  const handleModalFormSubmit = () => {
    setShowModal(false);
    setSelectedTerms(null);
    fetchManagers(currentPage, itemsPerPage);
  };

  const handleCancelEdit = () => {
    setSelectedTerms(null);
    setShowModal(false);
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            onChange={handleSearch}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTerm}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Term
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <tr>
              <th
                className="py-4 px-6 font-semibold cursor-pointer"
                onClick={() => handleSort('type')}
              >
                Title {renderSortIcon('type')}
              </th>
              <th
                className="py-4 px-6 font-semibold cursor-pointer"
                onClick={() => handleSort('content')}
              >
                Description {renderSortIcon('content')}
              </th>
              <th className="py-4 px-6 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse mx-auto"></div>
                      </td>
                    </motion.tr>
                  ))
              ) : (
                filteredManagers.map((term, index) => (
                  <motion.tr
                    key={term._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="py-4 px-6 text-gray-900 dark:text-white font-medium capitalize">
                      {term.type}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {term.content}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => editBanner(term)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-gray-700 dark:text-gray-300">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Term Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
          >
           
              <TermForm
                term={selectedTerms}
                onSubmitSuccess={handleModalFormSubmit}
                onCancel={handleCancelEdit}
              />
        
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TermsTable;