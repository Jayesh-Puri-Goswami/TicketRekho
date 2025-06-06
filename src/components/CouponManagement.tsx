import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  UserPlus,
  IndianRupee,
} from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Urls from '../networking/app_urls';
import CouponForm from '../components/CouponForm';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'flat';
  discountValue: number;
  applicableTo: string;
  description: string;
  expirationDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const navigate = useNavigate();

  const fetchCoupons = (page: number, limit: number) => {
    setLoading(true);
    axios
      .get(`${Urls.getCouponsUrl}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.status && response.data.data.coupons) {
          setCoupons(response.data.data.coupons);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching coupons:', error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Oops! Something went wrong while fetching coupons. Please try again later.',
          {
            className: 'z-[99999]',
          },
        );

        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoupons(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatus = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    return expiry > now ? 'active' : 'expired';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (couponId: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            Urls.deleteCouponUrl,
            { couponId },
            { headers: { Authorization: `Bearer ${currentUser.token}` } },
          )
          .then(() => {
            toast.success('Coupon deleted successfully!', {
              className: 'z-[99999]',
            });
            setCoupons((prev) => prev.filter((c) => c._id !== couponId));
          })
          .catch((error) => {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', {
              className: 'z-[99999]',
            });
          });
      }
    });
  };

  const handleModalSubmit = () => {
    setShowModal(false);
    setSelectedCoupon(null);
    fetchCoupons(currentPage, itemsPerPage);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const search = searchTerm.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(search) ||
      coupon.description.toLowerCase().includes(search) ||
      coupon.applicableTo.toLowerCase().includes(search) ||
      coupon.discountValue.toString().includes(search)
    );
  });

  const handleNavigation = (couponId: string) => {
    navigate(`/assignCoupon/${couponId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Ticket className="w-8 h-8 text-indigo-600 mr-2" />
              Coupon Management
            </h1>
            <p className="text-gray-600 mt-1">Manage discount coupons</p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              New Coupon
            </motion.button>
          </div>
        </div>

        <CouponForm
          coupon={selectedCoupon}
          onSubmitSuccess={handleModalSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedCoupon(null);
          }}
          show={showModal}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading
              ? Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <div className="p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-8 bg-gray-200 rounded-lg" />
                      </div>
                    </motion.div>
                  ))
              : filteredCoupons.map((coupon, index) => (
                  <motion.div
                    key={coupon._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-indigo-purple">
                            {coupon.code}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {coupon.description}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            getStatus(coupon.expirationDate),
                          )}`}
                        >
                          {getStatus(coupon.expirationDate).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <IndianRupee
                            size={16}
                            className="text-indigo-500 mr-2"
                          />
                          {coupon.discountType === 'percentage' ? (
                            <span>{coupon.discountValue}% OFF</span>
                          ) : (
                            <span>₹{coupon.discountValue} OFF</span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar
                            size={16}
                            className="text-indigo-500 mr-2"
                          />
                          <span>
                            Expires: {formatDate(coupon.expirationDate)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users size={16} className="text-indigo-500 mr-2" />
                          <span>Applicable to: <span className='capitalize font-bold' >{coupon.applicableTo}</span></span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowModal(true);
                          }}
                          className="flex-1 text-sm py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-100"
                        >
                          <Edit2 size={12} />
                          Edit
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(coupon._id)}
                          className="flex-1 text-sm py-2 px-3 bg-red-50 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                          Delete
                        </motion.button>

                        {/* New Assign Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleNavigation(coupon._id)}
                          className="flex-1 text-sm py-2 px-3 bg-yellow-100 text-yellow-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-yellow-200"
                        >
                          <UserPlus size={12} />
                          Assign
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-2 border rounded-lg bg-white"
            >
              <option value={8}>8 per page</option>
              <option value={16}>16 per page</option>
              <option value={24}>24 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg disabled:opacity-50"
            >
              Previous
            </motion.button>

            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg disabled:opacity-50"
            >
              Next
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
