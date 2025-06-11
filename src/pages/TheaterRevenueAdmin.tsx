import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Calendar,
  Search,
  ChevronDown,
  Check,
  IndianRupee,
  TrendingUp,
  Users,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Percent,
  Ticket,
} from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import Urls from '../networking/app_urls';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

interface Theater {
  _id: string;
  userId: string;
  name: string;
  location: string;
  isGrabABite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface RevenueData {
  _id: string;
  totalEarnings: number;
  adminCommission: number;
  theatreManagerCommission: number;
  ticketCount: number;
  theatreName: string;
}

type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';
type SortField =
  | 'theatreName'
  | 'totalEarnings'
  | 'adminCommission'
  | 'theatreManagerCommission'
  | 'ticketCount';
type SortOrder = 'asc' | 'desc';

const TheaterRevenueAdmin: React.FC = () => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  // State management
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTheaters, setFetchingTheaters] = useState(true);

  // Table state
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalEarnings');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch theaters on component mount
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await axios.get(`${Urls.getTheatres}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setTheaters(response.data.data || []);
      } catch (error) {
        console.error('Error fetching theaters:', error);
        toast.error('Failed to load theaters');
      } finally {
        setFetchingTheaters(false);
      }
    };

    if (currentUser?.token) {
      fetchTheaters();
    }
  }, [currentUser]);

  // Filtered theaters for dropdown
  const filteredTheaters = useMemo(() => {
    return theaters.filter(
      (theater) =>
        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theater.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [theaters, searchTerm]);

  // Filtered and sorted revenue data for table
  const processedRevenueData = useMemo(() => {
    let filtered = revenueData.filter((item) =>
      item.theatreName.toLowerCase().includes(tableSearchTerm.toLowerCase()),
    );

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [revenueData, tableSearchTerm, sortField, sortOrder]);

  // Handle theater selection
  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheaters((prev) => {
      if (prev.includes(theaterId)) {
        return prev.filter((id) => id !== theaterId);
      } else {
        return [...prev, theaterId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTheaters.length === filteredTheaters.length) {
      setSelectedTheaters([]);
    } else {
      setSelectedTheaters(filteredTheaters.map((theater) => theater._id));
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Get revenue data
  const getRevenueData = async () => {
    if (selectedTheaters.length === 0) {
      toast.error('Please select at least one theater');
      return;
    }

    if (filter === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select start and end dates for custom filter');
      return;
    }

    setLoading(true);
    try {
      let response;
      const requestData = {
        filter,
        startDate: filter === 'custom' ? startDate : null,
        endDate: filter === 'custom' ? endDate : null,
      };

      if (selectedTheaters.length === theaters.length) {
        // Get all theaters revenue
        response = await axios.post(
          `${Urls.getAllTheatreRevenueReports}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      } else if (selectedTheaters.length === 1) {
        // Get single theater revenue
        response = await axios.post(
          `${Urls.getSingleTheatreRevenueReport}`,
          {
            ...requestData,
            theatreId: selectedTheaters[0],
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      } else {
        toast.error('Please select either one theater or all theaters');
        return;
      }

      setRevenueData(response.data.data || []);
      toast.success('Revenue data loaded successfully');
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get selected theater names
  const getSelectedTheaterNames = () => {
    if (selectedTheaters.length === 0) return 'Select theaters';
    if (selectedTheaters.length === theaters.length)
      return 'All theaters selected';
    if (selectedTheaters.length === 1) {
      const theater = theaters.find((t) => t._id === selectedTheaters[0]);
      return theater?.name || 'Unknown theater';
    }
    return `${selectedTheaters.length} theaters selected`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.01, transition: { duration: 0.2 } },
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Theater Revenue Reports" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl  mb-6">
            <div className="bg-indigo-purple px-8 py-6 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Theater Revenue Reports
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Analyze revenue performance across theaters
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Theater Selection */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      <span>Select Theaters</span>
                    </div>
                  </label>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 text-left bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      disabled={fetchingTheaters}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">
                          {fetchingTheaters
                            ? 'Loading theaters...'
                            : getSelectedTheaterNames()}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg"
                        >
                          {/* Search */}
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search theaters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* Select All */}
                          <div className="p-3 border-b border-gray-100 hover:bg-slate-200">
                            <motion.label
                              // whileHover={{ backgroundColor: '#f1f5f9' }}
                              className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg "
                              onClick={handleSelectAll}
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center  ${
                                  selectedTheaters.length ===
                                  filteredTheaters.length
                                    ? 'bg-indigo-purple border-transparent'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedTheaters.length ===
                                  filteredTheaters.length && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="font-medium text-gray-700">
                                Select All
                              </span>
                            </motion.label>
                          </div>

                          {/* Theater List */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredTheaters.map((theater) => (
                              <motion.label
                                key={theater._id}
                                // whileHover={{ backgroundColor: '#f1f5f9' }}
                                className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-slate-200"
                                onClick={() => handleTheaterSelect(theater._id)}
                              >
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    selectedTheaters.includes(theater._id)
                                      ? 'bg-indigo-purple border-transparent'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedTheaters.includes(theater._id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-700">
                                    {theater.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {theater.location}
                                  </div>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Time Period Filter */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-purple-500" />
                      <span>Time Period</span>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="w-full appearance-none px-4 py-3 border-2 border-violet-300 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all duration-200 pr-10 custom-select"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    {/* Custom Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown className="w-5 h-5 text-violet-500" />
                    </div>
                  </div>
                </div>

                {/* Date Range (for custom filter) */}
                {filter === 'custom' && (
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span>Date Range</span>
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Get Revenue Button */}
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={getRevenueData}
                  disabled={loading}
                  className={`w-full sm:w-auto text-center px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-purple hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center space-x-2 justify-center">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading Revenue...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>Get Revenue Report</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          {processedRevenueData.length > 1 && (
            <div className=" rounded-3xl p-6 sm:p-8 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <motion.div
                  className="relative bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <IndianRupee className="w-6 h-6 text-green-600 mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Total Earnings
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-green-600">
                      {formatCurrency(
                        processedRevenueData.reduce(
                          (sum, item) => sum + item.totalEarnings,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-gray-50/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.div
                  className="relative bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <Percent className="w-6 h-6 text-indigo-600 mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Admin Commission
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-indigo-600">
                      {formatCurrency(
                        processedRevenueData.reduce(
                          (sum, item) => sum + item.adminCommission,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-gray-50/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.div
                  className="relative bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <Users className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Manager Commission
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-purple-600">
                      {formatCurrency(
                        processedRevenueData.reduce(
                          (sum, item) => sum + item.theatreManagerCommission,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-gray-50/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <motion.div
                  className="relative bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-50"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <Ticket className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Total Tickets
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-gray-700">
                      {processedRevenueData
                        .reduce((sum, item) => sum + item.ticketCount, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-gray-50/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </div>
            </div>
          )}

          {/* Revenue Data Table */}
          {revenueData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Table Header */}
              <div className="bg-indigo-purple px-8 py-6">
                <div className="flex flex-col gap-3 md:flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Revenue Report
                      </h3>
                      <p className="text-indigo-100 text-sm mt-1">
                        {revenueData.length} theater
                        {revenueData.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                  </div>

                  {/* Table Search */}
                  <div className="relative">
                    <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2  text-white" />
                    <input
                      type="text"
                      placeholder="Search theaters..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/30 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        {
                          key: 'theatreName',
                          label: 'Theater Name',
                          icon: Building2,
                        },
                        {
                          key: 'totalEarnings',
                          label: 'Total Earnings',
                          icon: IndianRupee,
                        },
                        {
                          key: 'adminCommission',
                          label: 'Admin Commission',
                          icon: TrendingUp,
                        },
                        {
                          key: 'theatreManagerCommission',
                          label: 'Manager Commission',
                          icon: Users,
                        },
                        {
                          key: 'ticketCount',
                          label: 'Tickets Sold',
                          icon: Users,
                        },
                      ].map(({ key, label, icon: Icon }) => (
                        <th
                          key={key}
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => handleSort(key as SortField)}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                            <div className="flex flex-col">
                              {sortField === key ? (
                                sortOrder === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-indigo-500" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-indigo-500" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedRevenueData.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-slate-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {item.theatreName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(item.totalEarnings)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-indigo-600">
                            {formatCurrency(item.adminCommission)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-purple-600">
                            {formatCurrency(item.theatreManagerCommission)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-lg font-semibold text-gray-700">
                              {item.ticketCount.toLocaleString()}
                            </div>
                            <Users className="w-4 h-4 text-gray-400 ml-2" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && revenueData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center"
            >
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Revenue Data
              </h3>
              <p className="text-gray-500">
                Select theaters and click "Get Revenue Report" to view data
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TheaterRevenueAdmin;
