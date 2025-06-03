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
  faMap,
  faUser,
  faFileContract,
  faBell,
  faKey,
  faClock,
  faMapMarkerAlt,
  faFileAlt,
  faClipboardList,
  faQuestionCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
  path: string;
  icon: any;
  label: string;
  permission?: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const permissions = currentUser?.permissions?.permissions || [];

  const hasPermission = (permissionName?: string) => {
    return permissionName
      ? permissions.some(
          (p: { name: string; status: boolean }) =>
            p.name === permissionName && p.status,
        )
      : true;
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
    { path: '/state', icon: faMap, label: 'States', permission: 'states' },
    {
      path: '/managers',
      icon: faUserTie,
      label: 'Managers',
      permission: 'managers',
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
      path: '/employees',
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

  // useEffect(() => {
  //   const clickHandler = ({ target }: MouseEvent) => {
  //     if (!sidebar.current || !trigger.current) return
  //     if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return
  //     setSidebarOpen(false)
  //   }
  //   document.addEventListener("click", clickHandler)
  //   return () => document.removeEventListener("click", clickHandler)
  // }, [sidebarOpen])

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

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
            // onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={sidebar}
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className={`fixed left-0 top-0 z-[9999] flex h-screen w-72 flex-col overflow-hidden bg-gradient-to-t from-indigo-500/90 to-purple-500/90 backdrop-blur-lg dark:from-indigo-600/90 dark:to-purple-600/90 lg:static lg:translate-x-0 lg:z-auto`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-6 ">
          <NavLink to={redirectTo} className="flex items-center space-x-3">
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src="../../../public/Image/Logo/appiconMasked.png"
              alt="TicketRekho Logo"
              className="h-16 w-[120px] drop-shadow-lg"
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
            className="lg:hidden p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
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
