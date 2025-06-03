'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Search, FileText, X, Save, Eye, Edit2 } from 'lucide-react';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Terms {
  _id: string;
  type: string;
  content: string;
  updatedAt: string;
}

const TermsGrid: React.FC = () => {
  const [terms, setTerms] = useState<Terms[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<Terms | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchTerms = () => {
    setLoading(true);
    axios
      .get(`${Urls.getTermPolicyList}?page=1&limit=4`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && response.data.data) {
          setTerms(response.data.data);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openUpdateModal = (term: Terms) => {
    setSelectedTerm(term);
    setEditContent(term.content);
    setShowModal(true);
    setError(null);
    setSuccess(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTerm(null);
    setEditContent('');
    setError(null);
    setSuccess(false);
  };

  const handleUpdate = async () => {
    if (!selectedTerm) return;

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = {
        type: selectedTerm.type,
        content: editContent,
      };

      const response = await axios.post(
        `${Urls.createOrUpdateTermPolicy}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setSuccess(true);
      toast.success('Updated terms & conditions.');
      closeModal();
      fetchTerms();
    } catch (error) {
      setError('Failed to update terms & conditions. Please try again.');
      console.error('Error updating term:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTerms = terms.filter(
    (term) =>
      term.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getTermIcon = (type: string) => {
    return <FileText className="w-6 h-6" />;
  };

  const getTermColor = (index: number) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms & Conditions
            </h1>
            <p className="text-gray-600">
              Manage and review your platform's terms and conditions
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
              onChange={handleSearch}
              value={searchTerm}
            />
          </div>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {loading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-md p-6 "
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-xl shimmer"></div>
                        <div className="h-6 w-1/2 rounded shimmer"></div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="h-4 w-full rounded shimmer"></div>
                        <div className="h-4 w-3/4 rounded shimmer"></div>
                        <div className="h-4 w-5/6 rounded shimmer"></div>
                      </div>
                    </div>
                  </motion.div>
                ))
            : filteredTerms.map((term, index) => (
                <motion.div
                  key={term._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  {/* Header */}
                  <div
                    className={`bg-gradient-to-r ${getTermColor(
                      index,
                    )} p-6 text-white relative`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          {getTermIcon(term.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold capitalize">
                            {term.type.replace('-', ' ')}
                          </h3>
                          <p className="text-white/80 text-sm">
                            Terms & Conditions
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openUpdateModal(term)}
                        className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="prose prose-gray max-w-none">
                      <div className="text-gray-700 leading-relaxed text-sm line-clamp-6 overflow-hidden">
                        {term.content.length > 300
                          ? `${term.content.substring(0, 300)}...`
                          : term.content}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Last updated</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(term.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {showModal && selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      Update {selectedTerm.type.replace('-', ' ')}
                    </h2>
                    <p className="text-white/80 mt-1">
                      Edit the terms and conditions content
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700 leading-relaxed"
                      placeholder="Enter terms and conditions content..."
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    Character count: {editContent.length}
                  </div>
                  {error && <p className="text-red-500">{error}</p>}
                  {success && (
                    <p className="text-green-500">
                      Terms updated successfully!
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdate}
                    disabled={updating || !editContent.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Terms
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TermsGrid;
