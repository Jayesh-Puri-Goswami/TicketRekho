import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ChevronDown, Mail, Phone, Calendar } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Urls from '../../networking/app_urls';
import SearchBar from '../Utils/SearchBar';

interface AppUser {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  active: boolean;
  createdAt: Date;
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof AppUser>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleUsers, setVisibleUsers] = useState(15);

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchUsers = (page: number, limit: number, search: string) => {
    setLoading(true);
    
    let searchQuery = search;
    if (search.toLowerCase() === 'active') {
      searchQuery = 'true';
    } else if (search.toLowerCase() === 'inactive') {
      searchQuery = 'false';
    }

    axios
      .get(`${Urls.getUserList}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && response.data.data.users && Array.isArray(response.data.data.users)) {
          const userData = response.data.data.users;
          setUsers((prev) => page === 1 ? userData : [...prev, ...userData]);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(currentPage, itemsPerPage, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, itemsPerPage, searchTerm]);

  const toggleStatus = (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    setLoading(true);

    axios
      .post(
        `${Urls.changeAppUserStatus}`,
        {
          appUserId: id,
          active: updatedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data && response.data.status) {
          toast.success('User status changed successfully!');
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === id ? { ...user, active: updatedStatus } : user,
            ),
          );
        } else {
          toast.error(response?.data?.message || 'An error occurred.');
        }
      })
      .catch((error) => {
        toast.error('An error occurred.');
        console.error('Error updating user status:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredUsers = users.filter((user) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const isActiveString = user.active ? "active" : "inactive";

    // console.log(user);
    

    return (
      user.name?.toLowerCase().includes(lowerSearchTerm) ||
      user.email?.toLowerCase().includes(lowerSearchTerm) ||
      user.mobileNumber?.toLowerCase().includes(lowerSearchTerm) ||
      isActiveString.includes(lowerSearchTerm)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc'
      ? aValue > bValue ? -1 : 1
      : aValue < bValue ? -1 : 1;
  });

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setVisibleUsers((prev) => prev + 15);
      console.log(visibleUsers);
      
    } else {
      toast('All users loaded 🚀');
    }
  };

  const handleSort = (field: keyof AppUser) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof AppUser }) => (
    <ChevronDown
      size={16}
      className={`ml-1 transition-transform ${
        sortField === field
          ? sortDirection === 'desc'
            ? 'transform rotate-180'
            : ''
          : 'opacity-0 group-hover:opacity-100'
      }`}
    />
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 max-w-7xl">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Users className="w-8 h-8 text-indigo-600 mr-2" />
                Users
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and monitor user accounts
              </p>
            </div>
          </motion.div>
          <SearchBar placeholder= {`Search Users ...`} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-indigo-purple text-white">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('mobileNumber')}
                  >
                    <div className="flex items-center">
                      Contact
                      <SortIcon field="mobileNumber" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Reg. Date
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="active" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                <AnimatePresence>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 animate-pulse"></div>
                            <div className="ml-4">
                              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    sortedUsers.slice(0, visibleUsers).map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || user?.mobileNumber?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {user.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone size={16} className="text-slate-400 mr-2" />
                            {user.mobileNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400 mr-2" />
                            {user.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar size={16} className="text-slate-400 mr-2" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(user._id, user.active);
                            }}
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {!loading &&  (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium"
              >
                Load More
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UsersTable;