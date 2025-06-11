import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: any) => React.ReactNode;
  className?: string;
  _id?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading: boolean;
  sortField: keyof T;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof T) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (n: number) => void;
  skeletonRows?: number;
  statusToggle?: (row: T) => React.ReactNode;
  getRowKey: (row: T) => string;
  path?: string;
}

function DataTable<T extends object>({
  columns,
  data,
  loading,
  sortField,
  sortDirection,
  onSort,
  page,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  skeletonRows = 5,
  statusToggle,
  getRowKey,
  path = '',
}: DataTableProps<T>) {
  const SortIcon = ({ field }: { field: keyof T }) => (
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

  const navigate = useNavigate();


  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md "
    >
      <div className="overflow-x-auto min-h-[20rem] rounded-t-xl">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-indigo-purple text-white rounded-t-xl">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer group ${
                    col.className || ''
                  }`}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
              {statusToggle && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            <AnimatePresence>
              {loading
                ? Array(skeletonRows)
                    .fill(0)
                    .map((_, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        {columns.map((col, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap ">
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                          </td>
                        ))}
                        {statusToggle && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                : data.map((row, index) => (
                    <motion.tr
                      key={getRowKey(row)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1, delay: index * 0.05 }}
                      className="hover:bg-slate-50"
                    >
                      {columns.map((col, i) => (
                        <td
                          key={i}
                          onClick={() => {
                            if (path !== '' ) {
                              navigate(`${path}${row._id}`);
                            }
                          }}
                          className="px-6 py-4 whitespace-nowrap flex-row items-center justify-center"
                        >
                          {col.render
                            ? col.render(row, index)
                            : String(row[col.key] ?? '')}
                        </td>
                      ))}
                      {statusToggle && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {statusToggle(row)}
                        </td>
                      )}
                    </motion.tr>
                  ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-4 pb-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="itemsPerPage"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DataTable;
