import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { Theater, MoreVertical, Pencil, Lock, Ban, MapPin } from 'lucide-react';
import DataTable, { DataTableColumn } from '../components/Tables/DataTable';
import SearchBar from '../components/Utils/SearchBar';
import Urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface Theater {
  _id: string;
  name: string;
  screens: number;
  showtimes: number;
  status: boolean;
  createdAt: string;
}

const ActionDropdown = ({ row }: { row: Theater }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: Theater) => alert(`Edit ${row.name}`),
    },
    {
      label: row.status ? 'Inactive' : 'Active',
      icon: <Ban className="w-4 h-4" />,
      onClick: (row: Theater) =>
        alert(`${row.status ? 'Deactivate' : 'Activate'} ${row.name}`),
    },
    {
      label: 'Reset Password',
      icon: <Lock className="w-4 h-4" />,
      onClick: () => alert(`Reset Password for ${row.name}`),
    },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-[50]"
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="mr-3">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function TheaterOwnerDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [filteredTheaters, setFilteredTheaters] = useState<Theater[]>([]);
  const [sortField, setSortField] = useState<keyof Theater>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchTheaterDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Urls.getTheatreDetailByManager}?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (response.data.status && Array.isArray(response.data.data)) {
        const parsed: Theater[] = response.data.data.map((t: any) => ({
          _id: t._id,
          name: t.name,
          screens: t.screens ?? 1,
          showtimes: t.showtimes ?? 0,
          status: t.status,
          createdAt: t.createdAt,
        }));
        setTheaters(parsed);
        setFilteredTheaters(parsed);
      } else {
        toast.error('Failed to fetch theater details');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error fetching theater details',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaterDetails();
  }, [id]);

  useEffect(() => {
    const filtered = theaters.filter(
      (theater) =>
        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (searchTerm.toLowerCase() === 'active' && theater.status) ||
        (searchTerm.toLowerCase() === 'inactive' && !theater.status),
    );
    setFilteredTheaters(filtered);
  }, [searchTerm, theaters]);

  const handleSort = (field: keyof Theater) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredTheaters].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null || bVal === null) return 0;
    if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const columns: DataTableColumn<Theater>[] = [
    {
      key: 'serial',
      label: 'Serial',
      render: (_row, index) => index + 1,
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'screens', label: 'Screens', render: (row) => row.screens || 'N/A' },
    {
      key: 'showtimes',
      label: 'Showtimes',
      render: (row) => row.showtimes || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.status
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created On',
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => <ActionDropdown row={row} />,
    },
  ];

  return (
    <div className="mx-auto max-w-[95%] p-4 md:p-8">
      <Breadcrumb pageName="Client Management / Theater Owner Detail" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Theater size={28} className="mr-2 text-indigo-600" />
              Theater Owner Detail
            </h1>
            <p className="text-gray-600 mt-1">
              Browse, search, and filter theaters for the selected Theater
              Owner.
            </p>
          </div>
        </motion.div>
        <SearchBar
          placeholder="Search Theaters..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {sortedData.length !== 0 ? (
        <DataTable<Theater>
          columns={columns}
          data={sortedData}
          loading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          itemsPerPage={theaters.length}
          onItemsPerPageChange={() => {}}
          skeletonRows={5}
          getRowKey={(row) => row._id}
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-8 text-center min-h-[192px]"
          >
            <MapPin size={48} className="text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">
              No Theaters found for this Theater Owner
            </h2>
            <p className="text-gray-500 mt-2">
              This Theater Owner has not created any Theaters yet.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default TheaterOwnerDetail;
