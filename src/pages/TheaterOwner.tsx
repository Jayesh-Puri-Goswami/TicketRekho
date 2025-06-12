import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { Theater, MoreVertical, Pencil, Lock, Ban, MapPin } from 'lucide-react';
import DataTable, { DataTableColumn } from '../components/Tables/DataTable';
import SearchBar from '../components/Utils/SearchBar';
import Urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AddTheaterOwnerModal from '../components/Modals/AddTheaterOwnrModal';
import Loader from '../components/Loader/Loader';
import EditTheaterOwner from '../components/Modals/EditTheaterOwner';

interface TheaterOwner {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  theaters: number;
  active: boolean;
  createdAt: string;
}

const ActionDropdown = ({ row, setEditModalOpen, setEditTheaterOwnerId }: { 
  row: TheaterOwner, 
  setEditModalOpen: (value: boolean) => void, 
  setEditTheaterOwnerId: (id: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onClick: () => {
        setEditTheaterOwnerId(row._id);
        setEditModalOpen(true);
      },
    },
    // {
    //   label: row.active ? 'Inactive' : 'Active',
    //   icon: <Ban className="w-4 h-4" />,
    //   onClick: () => alert(`${row.active ? 'Deactivate' : 'Activate'} ${row.name}`),
    // },
    // {
    //   label: 'Reset Password',
    //   icon: <Lock className="w-4 h-4" />,
    //   onClick: () => alert(`Reset Password for ${row.name}`),
    // },
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
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
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

function TheaterOwner() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [theaterOwners, setTheaterOwners] = useState<TheaterOwner[]>([]);
  const [sortField, setSortField] = useState<keyof TheaterOwner>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageLoading, setPageLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTheaterOwnerId, setEditTheaterOwnerId] = useState<string>('');

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchTheaterOwners = (page: number, limit: number, search: string) => {
    setLoading(true);

    let searchQuery = search;
    if (search.toLowerCase() === 'active') {
      searchQuery = 'true';
    } else if (search.toLowerCase() === 'inactive') {
      searchQuery = 'false';
    }

    axios
      .get(
        `${Urls.getTheatreOwnerList}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (
          response.data.status &&
          response.data.data.userList &&
          Array.isArray(response.data.data.userList)
        ) {
          setTheaterOwners(response.data.data.userList);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
          setLoading(false);
        } else {
          toast.error('Failed to fetch theater managers');
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching theater managers:', error);
        toast.error(
          error.response.data.message || 'Error fetching theater managers',
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchTheaterOwners(1, itemsPerPage, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchTheaterOwners(page, itemsPerPage, searchTerm);
  }, [page]);

  useEffect(() => {
    if (submitSuccess) {
      setLoading(true);
      fetchTheaterOwners(page, itemsPerPage, searchTerm);
      setSubmitSuccess(false);
    }
    setTimeout(() => {
      setPageLoading(false);
    }, 1000);
  }, [submitSuccess]);

  const handleSort = (field: keyof TheaterOwner) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...theaterOwners].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === null || bValue === null) return 0;
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const columns: DataTableColumn<TheaterOwner>[] = [
    {
      key: 'serial',
      label: 'Serial',
      render: (_row, index) => (page - 1) * itemsPerPage + index + 1,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phoneNumber',
      label: 'Number',
      sortable: true,
    },
    {
      key: 'theaters',
      label: 'Theaters',
      render: (row) => row.theaters || 'N/A',
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.active ? 'Active' : 'Inactive'}
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
      render: (row) => (
        <ActionDropdown 
          row={row} 
          setEditModalOpen={setEditModalOpen} 
          setEditTheaterOwnerId={setEditTheaterOwnerId} 
        />
      ),
    },
  ];

  if (pageLoading) {
    return <Loader text="Loading Theater Owners ..." />;
  }

  return (
    <div className="mx-auto max-w-[95%] p-4 md:p-8">
      <Breadcrumb pageName=" Client Management / Theater Owner" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Theater size={28} className="mr-2 text-indigo-500 istiyor-600" />
              <span className="">Theater Owner</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Browse, search, and filter Theater Owners or add new "Theater
              Owner".
            </p>
          </div>
        </motion.div>
        <SearchBar
          placeholder="Search by name, email , phone number ..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <AddTheaterOwnerModal onSubmitSuccess={setSubmitSuccess} />
      </div>
      
      {editModalOpen && (
        <EditTheaterOwner
          id={editTheaterOwnerId}
          onSubmitSuccess={setSubmitSuccess}
          isOpen={editModalOpen}
          setIsOpen={setEditModalOpen}
        />
      )}

      {theaterOwners.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center  p-8 text-center min-h-[30vh]"
        >
          <MapPin size={48} className="text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No Theaters Found
          </h2>
          <p className="text-gray-500 mt-2">
            This Theater Owner hasn’t launched any Theaters yet. Let's roll the
            reels!
          </p>
        </motion.div>
      ) : (
        <DataTable<TheaterOwner>
          columns={columns}
          data={sortedData}
          loading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          skeletonRows={1}
          getRowKey={(row) => row._id}
          path={`/theater-owner-detail/`}
        />
      )}
    </div>
  );
}

export default TheaterOwner;