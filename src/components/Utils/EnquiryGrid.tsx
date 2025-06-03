import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Urls from '../../networking/app_urls';
import EnquiryCard from '../Cards/EnquiryCard';
import ViewEnquiryModal from '../Modals/ViewEnquiryModal';
import ReplyEnquiryModal from '../Modals/ReplyEnquiryModal';
import SkeletonCard from '../Skeleton/SkeletonCard';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

export interface EnquiryTicket {
  _id: string;
  name: string;
  email: string;
  description: string;
  status: string;
  adminReply?: string;
}

const MySwal = withReactContent(Swal);

const EnquiryGrid: React.FC = () => {
  const [tickets, setTickets] = useState<EnquiryTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReply, setIsReply] = useState(true);

  // Modal states
  const [viewTicket, setViewTicket] = useState<EnquiryTicket | null>(null);
  const [replyTicket, setReplyTicket] = useState<EnquiryTicket | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchEnquiryTickets = (page: number, limit: number) => {
    setLoading(true);

    axios
      .post(`${Urls.getEnquiryTickets}?page=${page}&limit=${limit}`, null, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })
      .then((response) => {
        if (response.data.data && response.data.data.supportReq) {
          const ticketData = response.data.data.supportReq;
          setTickets(ticketData);
          setTotalPages(response.data.data.pagination?.totalPages || 1);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        toast.error('Failed to load enquiry tickets');
      })
      .finally(() => {
         setTimeout(() => {
            setLoading(false);
          }, 1000);
      });
  };

  useEffect(() => {
    fetchEnquiryTickets(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    setLoading(true);
    const updatedStatus = currentStatus === 'open' ? 'closed' : 'open';

    axios
      .post(
        `${Urls.updateEnquiryTicket}`,
        {
          ticketId: id,
          status: updatedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data && response.data.status) {
          toast.success('Enquiry ticket status changed successfully!');
          setTickets((prevTickets) =>
            prevTickets.map((ticket) =>
              ticket._id === id ? { ...ticket, status: updatedStatus } : ticket,
            ),
          );
        } else {
          toast.error(
            response?.data?.message || 'Failed to update ticket status',
          );
        }
      })
      .catch((error) => {
        toast.error('An error occurred while updating the ticket status.');
        console.error('Error updating ticket status:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

const handleDelete = async (id: string) => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
    try {
      const response = await axios.post(
        `${Urls.deleteEnquiryTicket}`,
        { ticketId: id },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (response.data.status) {
        toast.success('Enquiry deleted successfully');
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket._id !== id),
        );
      } else {
        toast.error('Failed to delete enquiry');
      }
    } catch (error: any) {
      console.error('Error deleting enquiry:', error);
      toast.error('An error occurred while deleting the enquiry');
    }
  }
};


  const handleViewTicket = (ticket: EnquiryTicket) => {
    setViewTicket(ticket);
  };

  const handleReplyTicket = (ticket: EnquiryTicket) => {
    setReplyTicket(ticket);
    setIsReply(false);
  };

  const handleCloseModal = () => {
    setViewTicket(null);
    setReplyTicket(null);
  };

  const handleReplySubmit = async (ticketId: string, replyMessage: string) => {
    try {
      const formData = {
        ticketId,
        adminReply: replyMessage,
        status: 'closed'
      };
      setLoading(true);
      const response = await axios.post(
        `${Urls.updateEnquiryTicket}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      toast.success('Reply sent successfully!');
      setReplyTicket(null);

    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to send reply. Please try again.');
      return;
    } finally {

      setLoading(false);
      setIsReply(false);
      fetchEnquiryTickets(currentPage, itemsPerPage);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();
    return (
      ticket.name?.toLowerCase().includes(search) ||
      ticket.email?.toLowerCase().includes(search) ||
      ticket.description?.toLowerCase().includes(search)
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or description..."
              className="w-full p-3 pl-10 rounded-lg border border-stroke bg-whiter dark:border-strokedark dark:bg-meta-4 focus:border-primary focus:ring-0 dark:focus:border-primary"
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
          </div>

          <div className="flex items-center space-x-2">
            <label
              htmlFor="itemsPerPage"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 rounded-lg border border-stroke bg-whiter dark:border-strokedark dark:bg-meta-4 focus:border-primary focus:ring-0 dark:focus:border-primary"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array(itemsPerPage > 6 ? 6 : itemsPerPage)
              .fill(0)
              .map((_, index) => (
                <SkeletonCard key={index} />
              ))}
          </motion.div>
        ) : filteredTickets.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTickets.map((ticket) => (
              <EnquiryCard
                key={ticket._id}
                ticket={ticket}
                onView={() => handleViewTicket(ticket)}
                onReply={() => handleReplyTicket(ticket)}
                onDelete={() => handleDelete(ticket._id)}
                onToggleStatus={() => toggleStatus(ticket._id, ticket.status)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No enquiries found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : 'There are no enquiries to display.'}
              </p>
            </div>
          </div>
        )}

        {!loading && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTickets.length} of {tickets.length} enquiries
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center p-2 rounded-md border border-stroke bg-whiter text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center p-2 rounded-md border border-stroke bg-whiter text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {viewTicket && (
        <ViewEnquiryModal
          ticket={viewTicket}
          onClose={handleCloseModal}
          onReply={() => {
            setViewTicket(null);
            setReplyTicket(viewTicket);
          }}
        />
      )}

      {replyTicket && (
        <ReplyEnquiryModal
          ticket={replyTicket}
          onClose={handleCloseModal}
          onSubmit={handleReplySubmit}
          isReply={isReply}
        />
      )}
    </div>
  );
};

export default EnquiryGrid;
