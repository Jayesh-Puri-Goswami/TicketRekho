import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
interface BreadcrumbProps {
  pageName: string;
  parentName?: string;
  parentPath?: string;
}

const Breadcrumb = ({ pageName, parentName, parentPath }: BreadcrumbProps) => {
  // For demonstration purposes, using dummy currentUser data
  // In a real app, you would use your actual Redux/context state
  const currentUser = { role: 'admin' };
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const shouldShowBack =
    !currentPath.includes('dashboard') &&
    !currentPath.includes('event-dashboard') &&
    !currentPath.includes('theatre-dashboard');

  let dashboardPath = '/';
  if (currentUser.role === 'admin') {
    dashboardPath = '/dashboard';
  } else if (currentUser.role === 'eventManager') {
    dashboardPath = '/event-dashboard';
  } else if (currentUser.role === 'theatreManager') {
    dashboardPath = '/theatre-dashboard';
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ">
      <nav className="flex justify-between items-center gap-3">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li className="flex items-center gap-1">
            <Link
              className="text-[16px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 
                dark:hover:text-indigo-300 transition-colors duration-200 hover:underline"
              to={dashboardPath}
            >
              Dashboard
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
          </li>

          {parentName && parentPath && (
            <li className="flex items-center gap-1">
              <Link
                className="text-[16px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 
                  dark:hover:text-indigo-300 transition-colors duration-200 hover:underline"
                to={parentPath}
              >
                {parentName}
              </Link>
              <span className="text-gray-400 dark:text-gray-500">/</span>
            </li>
          )}

          <li className="text-[16px] font-semibold text-gray-800 dark:text-white">
            {pageName}
          </li>
        </ol>
        {/* <div className="">
          {shouldShowBack && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[16px] font-medium text-white px-3 py-1.5 rounded-lg 
              bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
              shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
              aria-label="Go back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
          )}
        </div> */}
      </nav>
    </div>
  );
};

export default Breadcrumb;
