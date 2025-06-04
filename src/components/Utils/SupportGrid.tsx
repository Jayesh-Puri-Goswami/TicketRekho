// <DOCUMENT filename="SupportGrid.tsx">
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Urls from '../../networking/app_urls';
import SupportCard from '../Cards/SupportCard';
import ViewTicketModal from '../Modals/ViewTicketModal';
import ReplyTicketModal from '../Modals/ReplyModal';
import SkeletonCard from '../Skeleton/SkeletonCard';
import SupportFilterOptions, { SupportStatus } from '../Utils/SupportFilterOptions';

export interface SupportTicket {
  _id: string;
  adminReply: string;
  appUserId: {
    name: string;
    email: string;
    mobileNumber: string;
    profileImage: string;
  };
  title: string;
  message: string;
  status: string;
}

const SupportGrid: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReply, setIsReply] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<SupportStatus[]>([]); // New state for status filters

  // Modal states
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);

  const currentUser = useSelector((state: any) => state.user.currentUser.data);

  const fetchSupportTickets = (page: number, limit: number) => {
    setLoading(true);

    axios
      .post(`${Urls.supportTickets}?page=${page}&limit=${limit}`, null, {
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
        toast.error('Failed to load support tickets');
      })
      .finally(() => {
         setTimeout(() => {
            setLoading(false);
          }, 1000);
      });
  };

  useEffect(() => {
    fetchSupportTickets(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    setLoading(true);
    const updatedStatus = currentStatus === 'open' ? 'closed' : 'open';

    axios
      .post(
        `${Urls.updateSupportTicket}`,
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
          toast.success('Support ticket status changed successfully!');
          
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

  const handleViewTicket = (ticket: SupportTicket) => {
    setViewTicket(ticket);
  };

  const handleReplyTicket = (ticket: SupportTicket) => {
    setReplyTicket(ticket);
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
        status: 'closed',
      };
      setLoading(true);
      const response = await axios.post(`${Urls.updateSupportTicket}`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      toast.success('Reply sent successfully!');
      setReplyTicket(null);

    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to send reply. Please try again.');
      return;
    } finally {
      setLoading(false);
      setIsReply(false);
      fetchSupportTickets(currentPage, itemsPerPage);
    }
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        ticket.appUserId?.name?.toLowerCase().includes(search) ||
        ticket.appUserId?.email?.toLowerCase().includes(search) ||
        ticket.title?.toLowerCase().includes(search) ||
        ticket.message?.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        (selectedStatuses.includes('Active') && ticket.status === 'open') ||
        (selectedStatuses.includes('Inactive') && ticket.status === 'closed');

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort active (open) tickets first
      if (a.status === 'open' && b.status === 'closed') return -1;
      if (a.status === 'closed' && b.status === 'open') return 1;
      return 0;
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
      {/* Search and filters section */}
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, title, or message..."
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

        {/* Status Filter */}
        <SupportFilterOptions
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        />

        {/* Grid layout for support tickets */}
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
              <SupportCard
                key={ticket._id}
                ticket={ticket}
                onView={() => handleViewTicket(ticket)}
                onReply={() => handleReplyTicket(ticket)}
                onToggleStatus={() => toggleStatus(ticket._id, ticket.status)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No tickets found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || selectedStatuses.length > 0
                  ? 'Try adjusting your search or filter terms.'
                  : 'There are no support tickets to display.'}
              </p>
            </div>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTickets.length} of {tickets.length} tickets
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

      {/* Modals */}
      {viewTicket && (
        <ViewTicketModal
          ticket={viewTicket}
          onClose={handleCloseModal}
          onReply={() => {
            setViewTicket(null);
            setReplyTicket(viewTicket);
          }}
          isReply={isReply}
        />
      )}

      {replyTicket && (
        <ReplyTicketModal
          ticket={replyTicket}
          onClose={handleCloseModal}
          onSubmit={handleReplySubmit}
          isReply={isReply}
        />
      )}
    </div>
  );
};

export default SupportGrid;
// </DOCUMENT>