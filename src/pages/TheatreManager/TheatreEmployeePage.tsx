import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { Theater, MoreVertical, Pencil } from 'lucide-react';
import DataTable, { DataTableColumn } from '../../components/Tables/DataTable';
import SearchBar from '../../components/Utils/SearchBar';
import Urls from '../../networking/app_urls';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AddTheaterManagerModal from '../../components/Modals/AddTheatreManagerModal';
import Loader from '../../components/Loader/Loader';
import EditEmployeeModal from '../../components/Modals/EditEmployeeModal';
import CreateEmployeeModal from '../../components/Modals/CreateEmployeeModal';
import EditTheaterUserModal from '../../components/Modals/EditTheaterEmployeeModal';

interface TheaterEmployee {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  createdAt: string;
}

const ActionDropdown = ({
  row,
  setEditModalOpen,
  setEditTheaterEmployeeId,
  setData,
}: {
  row: TheaterEmployee;
  setEditModalOpen: (value: boolean) => void;
  setEditTheaterEmployeeId: (id: string) => void;
  setData : (data : any)=> void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onClick: () => {
        setEditTheaterEmployeeId(row._id);
        setEditModalOpen(true);
        setData(row);
      },
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

function TheatreEmployeePage() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [theaterEmployees, setTheaterEmployees] = useState<TheaterEmployee[]>(
    [],
  );
  const [sortField, setSortField] = useState<keyof TheaterEmployee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageLoading, setPageLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTheaterEmployeeId, setEditTheaterEmployeeId] =
    useState<string>('');
  const [data, setData] = useState<string>('');

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchTheaterEmployees = (
    page: number,
    limit: number,
    search: string,
  ) => {
    setLoading(true);

    let searchQuery = search;
    if (search.toLowerCase() === 'active') {
      searchQuery = 'true';
    } else if (search.toLowerCase() === 'inactive') {
      searchQuery = 'false';
    }

    axios
      .get(
        `${
          Urls.getTheatreOwnerAllEmployee
        }?page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          setTheaterEmployees(response.data.data);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
          setLoading(false);
        } else {
          toast.error('Failed to fetch theater employees');
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching theater employees:', error);
        toast.error(
          error.response.data.message || 'Error fetching theater employees',
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchTheaterEmployees(1, itemsPerPage, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchTheaterEmployees(page, itemsPerPage, searchTerm);
  }, [page]);

  useEffect(() => {
    if (submitSuccess) {
      setLoading(true);
      fetchTheaterEmployees(page, itemsPerPage, searchTerm);
      setSubmitSuccess(false);
    }
    setTimeout(() => {
      setPageLoading(false);
    }, 1000);
  }, [submitSuccess]);

  const handleSort = (field: keyof TheaterEmployee) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...theaterEmployees].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === null || bValue === null) return 0;
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const columns: DataTableColumn<TheaterEmployee>[] = [
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
      label: 'Phone Number',
      sortable: true,
    },
    // {
    //   key: 'address',
    //   label: 'Address',
    //   sortable: true,
    //   render: (row) => row.address || 'N/A',
    // },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <span className="capitalize">
          {row.role.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      ),
    },
    // {
    //   key: 'createdBy',
    //   label: 'Created By',
    //   sortable: true,
    //   render: (row) => row.createdBy || 'N/A',
    // },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <ActionDropdown
          row={row}
          setEditModalOpen={setEditModalOpen}
          setEditTheaterEmployeeId={setEditTheaterEmployeeId}
          setData={setData}
        />
      ),
    },
  ];

  if (pageLoading) {
    return <Loader text="Loading Theater Employees ..." />;
  }

  return (
    <div className="mx-auto max-w-[95%] p-4 md:p-8">
      <Breadcrumb pageName="Client Management / Theater Employees" />

      <div className="flex flex-col md:flex-row md:items-center justify-evenly gap-4 mb-8 mt-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-4 w-[100%] md:w-full lg:w-[30%]"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Theater size={28} className="mr-2 text-indigo-500" />
              <span>Theater Employees</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Browse, search, and filter Theater Manager and Theater Employees
              or add new.
            </p>
          </div>
        </motion.div>
        <SearchBar
          placeholder="Search by name, email, phone number ..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-[100%] md:w-full lg:w-[30%] "
        />

        <AddTheaterManagerModal onSubmitSuccess={setSubmitSuccess} />
        <CreateEmployeeModal
          buttonText="Add Theatre Employee"
          role="theatreEmployee"
          onSubmitSuccess={setSubmitSuccess}
        />
      </div>

      {editModalOpen && (
        <EditTheaterUserModal
          id={editTheaterEmployeeId}
          onSubmitSuccess={setSubmitSuccess}
          isOpen={editModalOpen}
          setIsOpen={setEditModalOpen}
          role="theatreManager"
          data={data}
        />
      )}

      {theaterEmployees.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-8 text-center min-h-[30vh]"
        >
          <Theater size={48} className="text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No Theater Employees Found
          </h2>
          <p className="text-gray-500 mt-2">
            No employees have been added yet. Let's get started!
          </p>
        </motion.div>
      ) : (
        <DataTable<TheaterEmployee>
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
          path={`/theater-employee-detail/`}
        />
      )}
    </div>
  );
}

export default TheatreEmployeePage;
