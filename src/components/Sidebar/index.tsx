import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import {
  faUserTie,
  faGamepad,
  faTicketAlt,
  faTheaterMasks,
  faComments,
  faQrcode,
  faFileInvoice,
  faUser,
  faFileContract,
  faBell,
  faClock,
  faMapMarkerAlt,
  faFileAlt,
  faClipboardList,
  faQuestionCircle,
  faTimes,
  faChartLine,
  faHandHoldingDollar,
  faChevronRight,
  faKey,
} from '@fortawesome/free-solid-svg-icons';

interface SubMenuItem {
  path: string;
  label: string;
  permission?: string;
  subIcon?: any;
}

interface MenuItem {
  path: string;
  icon: any;
  label: string;
  permission?: string;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const permissions = currentUser?.permissions?.permissions || [];
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const hasPermission = (permissionName?: string) => {
    return permissionName
      ? permissions.some(
          (p: { name: string; status: boolean }) =>
            p.name === permissionName && p.status,
        )
      : true;
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path],
    );
  };

  const UserMenuList: MenuItem[] = [
    ...(currentUser.role === 'admin'
      ? [
          { path: '/dashboard', icon: faGamepad, label: 'Dashboard' },
          {
            path: '/roles-permission',
            icon: faKey,
            label: 'Roles & Permissions',
          },
        ]
      : []),
    ...(['theatreManager', 'theatreEmployee'].includes(currentUser.role)
      ? [{ path: '/theatre-dashboard', icon: faGamepad, label: 'Dashboard' }]
      : []),
    ...(['eventManager', 'eventEmployee'].includes(currentUser.role)
      ? [{ path: '/event-dashboard', icon: faGamepad, label: 'Dashboard' }]
      : []),
    ...(['theatreOwner'].includes(currentUser.role)
      ? [
          {
            path: '/theatre-owner-dashboard',
            icon: faGamepad,
            label: 'Dashboard',
          },
        ]
      : []),

    ...(['eventOrganizer'].includes(currentUser.role)
      ? [
          {
            path: '/event-organizer-dashboard',
            icon: faGamepad,
            label: 'Dashboard',
          },
        ]
      : []),
    {
      path: '/location',
      icon: faMapMarkerAlt,
      label: 'Location',
      permission: 'states',
    },
    {
      path: '/client-management',
      icon: faUserTie,
      label: 'Client Management',
      permission: 'managers',
      subItems: [
        {
          path: '/theater-owner',
          subIcon: faTheaterMasks,
          label: 'Theater Owner',
        },
        {
          path: '/event-organizer',
          subIcon: faTicketAlt,
          label: 'Event Organizer',
        },
      ],
    },
    { path: '/users', icon: faUser, label: 'Users', permission: 'users' },
    {
      path: '/movies',
      icon: faTheaterMasks,
      label: 'Movie Management',
      permission: 'movie management',
    },
    {
      path: '/theatres',
      icon: faTheaterMasks,
      label: 'Manage Theatres',
      permission: 'manage theatres',
    },
    {
      path: '/showtime',
      icon: faClock,
      label: 'Showtimes',
      permission: 'showtimes',
    },
    {
      path: '/movie-qr-code',
      icon: faQrcode,
      label: 'Movie QR Management',
      permission: 'movie qr management',
    },
    {
      path: '/theatre-report',
      icon: faFileAlt,
      label: 'Manage Theatre Reports',
      permission: 'manage theatre reports',
    },
    {
      path: '/staff-management',
      icon: faClipboardList,
      label: 'Staff Management',
      permission: 'employee management',
    },
    {
      path: '/employee-management',
      icon: faClipboardList,
      label: 'Employee Management',
      permission: 'employee management',
    },
    {
      path: '/events',
      icon: faClipboardList,
      label: 'Event Management',
      permission: 'event management',
    },
    {
      path: '/venues',
      icon: faMapMarkerAlt,
      label: 'Manage Venues',
      permission: 'manage venues',
    },
    {
      path: '/event-qr-code',
      icon: faQrcode,
      label: 'Event QR Management',
      permission: 'event qr management',
    },
    {
      path: '/event-report',
      icon: faFileInvoice,
      label: 'Manage Event Reports',
      permission: 'manage event reports',
    },
    {
      path: '/coupon',
      icon: faTicketAlt,
      label: 'Coupon Codes',
      permission: 'coupon codes',
    },
    {
      path: '/notification',
      icon: faBell,
      label: 'Notifications',
      permission: 'notifications',
    },
    {
      path: '/commission',
      icon: faChartLine,
      label: 'Commission Rate',
      permission: 'commission rate',
    },
    {
      path: '/theater-revenue-admin',
      icon: faHandHoldingDollar,
      label: 'Theater Revenue Report',
      permission: 'theater revenue',
    },
    {
      path: '/enquiry',
      icon: faQuestionCircle,
      label: 'Enquiries',
      permission: 'enquiries',
    },
    {
      path: '/support',
      icon: faComments,
      label: 'Support & Feedback',
      permission: 'support & feedback',
    },
    {
      path: '/terms',
      icon: faFileContract,
      label: 'Terms & Conditions',
      permission: 'terms & conditions',
    },
  ];

  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1000) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    });
  });

  let redirectTo = '/';
  if (currentUser?.role === 'admin') redirectTo = '/dashboard';
  else if (currentUser?.role === 'eventManager')
    redirectTo = '/event-dashboard';
  else if (currentUser?.role === 'theatreManager')
    redirectTo = '/theatre-dashboard';

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={sidebar}
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className={`fixed left-0 top-0 z-[999] flex h-screen w-72 flex-col overflow-hidden bg-gradient-to-t from-indigo-500/90 to-purple-500/90 backdrop-blur-lg dark:from-indigo-600/90 dark:to-purple-600/90 lg:static lg:translate-x-0  lg:z-auto `}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-6 ">
          <NavLink to={redirectTo} className="flex items-center space-x-3">
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src="../../../public/Image/Logo/appiconMasked.png"
              alt="TicketRekho Logo"
              className="h-[4.5rem] w-[120px] drop-shadow-lg"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src =
                  '../../../public/Image/Fallback Image/fallback-1.jpg';
              }}
            />
          </NavLink>

          <motion.button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden absolute z-[999] left-[15rem] p-2 px-[0.85rem] rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <ul className="space-y-1">
            {UserMenuList.filter((item) => hasPermission(item.permission)).map(
              (item) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Main Menu Item */}
                  {item.subItems ? (
                    // Item with sub-items
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.path)}
                        className="group relative flex items-center gap-4 px-4 py-2 text-white rounded-xl transition-all duration-200 overflow-hidden w-full hover:bg-white/15"
                      >
                        {/* Icon */}
                        <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 text-white/90 group-hover:bg-white/20 group-hover:text-white">
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="text-sm"
                          />
                        </div>

                        {/* Label */}
                        <span className="relative z-10 font-medium transition-all duration-200 text-white/90 group-hover:text-white flex-1 text-left">
                          {item.label}
                        </span>

                        {/* Arrow */}
                        <motion.div
                          animate={{
                            rotate: expandedItems.includes(item.path) ? 90 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10 text-white/70"
                        >
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-xs"
                          />
                        </motion.div>
                      </button>

                      {/* Sub Items */}
                      <AnimatePresence>
                        {expandedItems.includes(item.path) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <ul className="ml-8 mt-1 space-y-1">
                              {item.subItems
                                .filter((subItem) =>
                                  hasPermission(subItem.permission),
                                )
                                .map((subItem) => (
                                  <motion.li
                                    key={subItem.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <NavLink
                                      to={subItem.path}
                                      className={({ isActive }) => {
                                        const baseClasses =
                                          'group relative flex items-center gap-3 px-4 py-2 text-white/80 rounded-lg transition-all duration-200 text-sm';

                                        if (isActive) {
                                          return `${baseClasses} bg-white/20 backdrop-blur-sm text-white`;
                                        }

                                        return `${baseClasses} hover:bg-white/10 hover:text-white`;
                                      }}
                                    >
                                      <span className="relative z-10 flex items-center gap-5">
                                        <FontAwesomeIcon
                                          icon={subItem.subIcon}
                                          className="text-sm"
                                        />
                                        {subItem.label}
                                      </span>
                                    </NavLink>
                                  </motion.li>
                                ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // Regular item without sub-items
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => {
                        const baseClasses =
                          'group relative flex items-center gap-4 px-4 py-2 text-white rounded-xl transition-all duration-200 overflow-hidden ';

                        if (isActive) {
                          return `${baseClasses} bg-white/25 backdrop-blur-sm  shadow-lg`;
                        }

                        return `${baseClasses} hover:bg-white/15  `;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Icon */}
                          <div
                            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-white/30 text-white'
                                : 'text-white/90 group-hover:bg-white/20 group-hover:text-white'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              className="text-sm"
                            />
                          </div>

                          {/* Label */}
                          <span
                            className={`relative z-10 font-medium transition-all duration-200 ${
                              isActive
                                ? 'text-white'
                                : 'text-white/90 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-lg"
                              initial={false}
                              transition={{
                                type: 'spring',
                                stiffness: 700,
                                damping: 30,
                              }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  )}
                </motion.li>
              ),
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-white/20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-white/70 text-xs capitalize">
                {currentUser?.role || 'Role'}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
