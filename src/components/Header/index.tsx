import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Menu, X } from 'lucide-react';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import LogoIcon from '../../../public/Image/Logo/appicon.png';
import DarkModeSwitcher from './DarkModeSwitcher';
import DropdownMessage from './DropdownMessage';
import { useSelector } from 'react-redux';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const currentUser = useSelector((state: any) => state.user.currentUser.data);
  return (
    <header
      className="sticky top-0 z-[998] flex w-full backdrop-blur-sm bg-white/30 shadow-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-grow items-center justify-between sm:justify-between lg:justify-end px-4 py-2 md:px-6 2xl:px-11">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-[999] block rounded-xl border border-white/30 bg-white/60 p-2 shadow hover:bg-white/80 transition duration-150"
          >
            {props.sidebarOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>

          <Link className="block flex-shrink-0 lg:hidden" to="/">
            {/* <img
              className="h-10 w-auto drop-shadow"
              src={LogoIcon}
              alt="Logo"
            /> */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:hidden block items-center gap-3 mr-auto ml-6"
            >
              <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/30 backdrop-blur-sm">
                <div>
                  <h2 className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome! {currentUser?.name || 'User'}
                  </h2> 
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden lg:flex items-center gap-3 mr-auto ml-6"
        >
          <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/30 backdrop-blur-sm">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome! {currentUser?.name || 'User'}
              </h2>
              {/* <p className="text-sm text-gray-600">Have a great day!</p> */}
            </div>
          </div>
        </motion.div>

        {/* Right section: dropdowns */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          <div className="relative rounded-xl z-[10000]">
            <DropdownUser />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
