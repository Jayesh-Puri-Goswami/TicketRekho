import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MoreVertical, Pencil, Lock, Ban } from 'lucide-react';
import DataTable, { DataTableColumn } from '../components/Tables/DataTable';
import SearchBar from '../components/Utils/SearchBar';
import Urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface Venue {
  _id: string;
  name: string;
  events: number;
  showtimes: string;
  status: boolean;
  createdAt: string;
}

const ActionDropdown = ({ row }: { row: Venue }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row: Venue) => alert(`Edit ${row.name}`),
    },
    {
      label: row.status ? 'Inactive' : 'Active',
      icon: <Ban className="w-4 h-4" />,
      onClick: (row: Venue) => alert(`${row.status ? 'Deactivate' : 'Activate'} ${row.name}`),
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

function EventOrganizerDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [sortField, setSortField] = useState<keyof Venue>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchVenueDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Urls.getVenueByManager}?id=${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (response.data.status && Array.isArray(response.data.data)) {
        const parsed: Venue[] = response.data.data.map((v: any) => ({
          _id: v._id,
          name: v.name,
          events: v.events ?? 0,
          showtimes: 'N/A',
          status: v.status,
          createdAt: v.createdAt || new Date().toISOString(),
        }));
        setVenues(parsed);
        setFilteredVenues(parsed);
      } else {
        toast.error('Failed to fetch venue details');
        setVenues([]);
        setFilteredVenues([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error fetching venue details');
      setVenues([]);
      setFilteredVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  useEffect(() => {
    const filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (searchTerm.toLowerCase() === 'active' && venue.status) ||
        (searchTerm.toLowerCase() === 'inactive' && !venue.status)
    );
    setFilteredVenues(filtered);
  }, [searchTerm, venues]);

  const handleSort = (field: keyof Venue) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredVenues].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null || bVal === null) return 0;
    if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const columns: DataTableColumn<Venue>[] = [
    {
      key: 'serial',
      label: 'Serial',
      render: (_row, index) => index + 1,
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'events', label: 'Events', render: (row) => row.events || 'N/A' },
    { key: 'showtimes', label: 'Showtimes', render: () => 'N/A' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
    { key: 'actions', label: 'Actions', render: (row) => <ActionDropdown row={row} /> },
  ];

  return (
    <div className="mx-auto max-w-[95%] p-4 md:p-8">
      <Breadcrumb pageName="Client Management / Event Organizer Detail" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <MapPin size={28} className="mr-2 text-indigo-600" />
              Event Organizer Detail
            </h1>
            <p className="text-gray-600 mt-1">
              Browse, search, and filter venues for the selected Event Organizer.
            </p>
          </div>
        </motion.div>
        <SearchBar
          placeholder="Search Venues..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {loading ? (
        <DataTable<Venue>
          columns={columns}
          data={[]}
          loading={true}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          itemsPerPage={venues.length}
          onItemsPerPageChange={() => {}}
          skeletonRows={5}
          getRowKey={(row) => row._id}
        />
      ) : venues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-8 text-center min-h-[192px]"
        >
          <MapPin size={48} className="text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No venues found for this event organizer
          </h2>
          <p className="text-gray-500 mt-2">
            This event organizer has not created any venues yet.
          </p>
        </motion.div>
      ) : (
        <DataTable<Venue>
          columns={columns}
          data={sortedData}
          loading={false}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          itemsPerPage={venues.length}
          onItemsPerPageChange={() => {}}
          skeletonRows={5}
          getRowKey={(row) => row._id}
        />
      )}
    </div>
  );
}

export default EventOrganizerDetail;