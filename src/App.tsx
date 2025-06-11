import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import PrivateRoute from './components/PrivateRoute';
import DefaultLayout from './layout/DefaultLayout';
import { Toaster } from 'react-hot-toast';

// Pages
import SignIn from './pages/Authentication/SignIn';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RolesPermission from './pages/RolesPermission';
import Movies from './pages/Movies';
import Tickets from './pages/Bookings';
import Banner from './pages/Banner';
import State from './pages/State';
import City from './pages/City';
import Manager from './pages/Manager';
// import ManagerDetails from './pages/ManagerDetails';
import SellerDetails from './pages/SellerDetails';
import User from './pages/User';
import UserDetails from './pages/UserDetails';
import Terms from './pages/Terms';
import Notification from './pages/Notification';
import Coupon from './pages/Coupon';
import AssignCoupon from './pages/AssignCoupon';
import Enquiry from './pages/Enquiry';
import Support from './pages/Support';
import Commission from './pages/Commission';
import Ads from './pages/Ads';
import Events from './pages/Events';
// import EventManage from './pages/EventManage';
import Venue from './pages/Venue';
import EventReport from './pages/EventReport';
import TheatreReport from './pages/TheatreReport';
import EventSeatLayout from './pages/TheatreManager/EventSeatLayout';
import VenueNonSittingTable from './components/Tables/VenueNonSittingTable';
import MoviesTicket from './pages/TheatreManager/moviesTickets';
import EventTicket from './pages/TheatreManager/eventTickets';
import EventGrabABites from './pages/TheatreManager/eventGrabABites';
import ShowTime from './pages/ShowTime';
// import QRScanner from './pages/Seller/QRScanner';
import QRScannerMovie, {QRScanner} from './pages/QR/QRScannerMovie';
import ProfileManager from './pages/ProfileManager';
import SellerMDetails from './pages/Manager/SellerMDetails';
import SellerDash from './pages/Seller/SellerDash';
import TheatreManagerDashboard from './pages/Dashboard/theatreManagerDashboard';
import EventManagerDashboard from './pages/Dashboard/EventManagerDashboard';
import ECommerce from './pages/Dashboard/ECommerce';
import Theatres from './pages/TheatreManager/theatres';
import Screens from './pages/TheatreManager/Screens';
import SeatLayout from './pages/TheatreManager/SeatLayout';
import GrabABites from './pages/TheatreManager/grabABites';
import ShowTimeRealTimeSeatStatus from './pages/TheatreManager/ShowTimeRealTimeSeatStatus';
import EventRealTimeSittingSeatStatus from './pages/TheatreManager/EventRealTimeSittingSeatStatus';
import EventRealTimeNonSittingSeatStatus from './pages/TheatreManager/EventRealTimeNonSittingSeatStatus';
// import ViewManagerProfile from './components/Modals/ViewManagerProfile';
import Employee from './pages/Employee';
import EmployeeDetails from './pages/EmployeeDetails';
import MovieDetail from './pages/MovieDetail';
import Swal from 'sweetalert2';
import TheaterRevenueAdmin from './pages/TheaterRevenueAdmin';
import EventDetail from './pages/EventDetails';
import TheaterOwner from './pages/TheaterOwner';
import EventOrganizer from './pages/EventOrganizer';
import TheaterOwnerDetail from './pages/theaterOwnerDetail';
import EventOrganizerDetail from './pages/EventOrganizerDetail';

// import assetlinks from './pages/assetlinks'

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  // const currentUser = useSelector((state: any) => state.user.currentUser?.data);

  // console.log(currentUser);

  useEffect(() => {
    const tabKey = 'app-tab-open';
    // const warningId = 'single-tab-warning';

    // if (localStorage.getItem(tabKey) === 'true') {
    //   // Block UI with a full-screen warning
    //   const warning = document.createElement('div');
    //   warning.id = warningId;
    //   warning.style.position = 'fixed';
    //   warning.style.top = '0';
    //   warning.style.left = '0';
    //   warning.style.width = '100%';
    //   warning.style.height = '100%';
    //   warning.style.backgroundColor = '#fff';
    //   warning.style.zIndex = '99999';
    //   warning.style.display = 'flex';
    //   warning.style.justifyContent = 'center';
    //   warning.style.alignItems = 'center';
    //   warning.innerHTML = `<h1 style="color:red;">This site is already open in another tab.</h1>`;
    //   document.body.innerHTML = ''; // Clear existing UI
    //   document.body.appendChild(warning);
    // } else {
    //   localStorage.setItem(tabKey, 'true');
    // }

    const handleUnload = () => {
      localStorage.removeItem(tabKey);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      localStorage.removeItem(tabKey);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      Swal.close();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="Ticket Rekho" />
              <SignIn />
            </>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route
          element={
            <DefaultLayout>
              <PrivateRoute
                allowedRoles={[
                  'admin',
                  'theatreManager',
                  'Theatre Manager',
                  'eventManager',
                  'eventEmployee',
                  'theatreEmployee',
                  'Event Manager',
                  'Event Employee',
                ]}
              />
            </DefaultLayout>
          }
        >
          {/* Dashboards */}
          <Route
            path="/dashboard"
            element={
              <>
                <PageTitle title="Dashboard" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/event-dashboard"
            element={
              <>
                <PageTitle title="Event Dashboard" />
                <EventManagerDashboard />
              </>
            }
          />
          <Route
            path="/theatre-dashboard"
            element={
              <>
                <PageTitle title="Theatre Dashboard" />
                <TheatreManagerDashboard />
              </>
            }
          />

          {/* Profiles */}
          <Route
            path="/admin-profile"
            element={
              <>
                <PageTitle title="Profile" />
                <Profile />
              </>
            }
          />
          <Route
            path="/manager-profile"
            element={
              <>
                <PageTitle title="Profile" />
                <ProfileManager />
              </>
            }
          />
          <Route
            path="/eventmanager-profile"
            element={
              <>
                <PageTitle title="Profile" />
                <ProfileManager />
              </>
            }
          />

          {/* Common Entities */}
          <Route
            path="/roles-permission"
            element={
              <>
                <PageTitle title="Permissions" />
                <RolesPermission />
              </>
            }
          />
          <Route
            path="/movies"
            element={
              <>
                <PageTitle title="Movies" />
                <Movies />
              </>
            }
          />
          <Route
            path="/movies/detail/:movieId"
            element={
              <>
                <PageTitle title="Movies Detail" />
                <MovieDetail   />
              </>
            }
          />

          <Route
            path="/tickets"
            element={
              <>
                <PageTitle title="Movie Tickets" />
                <Tickets />
              </>
            }
          />
          <Route
            path="/showtime"
            element={
              <>
                <PageTitle title="ShowTime" />
                <ShowTime />
              </>
            }
          />
          <Route
            path="/theatres"
            element={
              <>
                <PageTitle title="Theatres" />
                <Theatres />
              </>
            }
          />
          <Route
            path="/screens/:id"
            element={
              <>
                <PageTitle title="Screens" />
                <Screens />
              </>
            }
          />
          <Route
            path="/seat-layout/:id"
            element={
              <>
                <PageTitle title="Seat Layout" />
                <SeatLayout />
              </>
            }
          />
          <Route
            path="/grabABites/:id"
            element={
              <>
                <PageTitle title="Grab A Bites" />
                <GrabABites />
              </>
            }
          />
          <Route
            path="/moviestickets/:id"
            element={
              <>
                <PageTitle title="Movies Tickets" />
                <MoviesTicket />
              </>
            }
          />
          <Route
            path="/movie-qr-code"
            element={
              <>
                <PageTitle title="Scan QR" />
                {/* <MovieQRScanner /> */}
                <QRScannerMovie />

              </>
            }
          />
          <Route
            path="/showtime-realtime-seat-status/:id"
            element={
              <>
                <PageTitle title="Real-Time Seat Status" />
                <ShowTimeRealTimeSeatStatus />
              </>
            }
          />

          <Route
            path="/events"
            element={
              <>
                <PageTitle title="Events" />
                <Events />
              </>
            }
          />
          <Route
            path="/events/detail/:eventId"
            element={
              <>
                <PageTitle title="Movies Detail" />
                <EventDetail   />
              </>
            }
          />
          <Route
            path="/event-seat-layout/:id"
            element={
              <>
                <PageTitle title="Event Seat Layout" />
                <EventSeatLayout />
              </>
            }
          />
          <Route
            path="/eventtickets/:id"
            element={
              <>
                <PageTitle title="Event Tickets" />
                <EventTicket />
              </>
            }
          />
          <Route
            path="/eventGrabABites/:id"
            element={
              <>
                <PageTitle title="Event Grab A Bites" />
                <EventGrabABites />
              </>
            }
          />
          <Route
            path="/event-realtime-sitting-seat-status/:id"
            element={
              <>
                <PageTitle title="Event Sitting Seat Status" />
                <EventRealTimeSittingSeatStatus />
              </>
            }
          />
          <Route
            path="/event-realtime-nonsitting-seat-status/:id"
            element={
              <>
                <PageTitle title="Event Non-Sitting Seat Status" />
                <EventRealTimeNonSittingSeatStatus />
              </>
            }
          />
          <Route
            path="/event-report"
            element={
              <>
                <PageTitle title="Event Report" />
                <EventReport />
              </>
            }
          />
          <Route
            path="/theatre-report"
            element={
              <>
                <PageTitle title="Theatre Report" />
                <TheatreReport />
              </>
            }
          />

          <Route
            path="/staff-management"
            element={
              <>
                <PageTitle title="Employees" />
                <Employee />
              </>
            }
          />
          <Route
            path="/employee-detail/:id"
            element={
              <>
                <PageTitle title="Employee Detail" />
                <EmployeeDetails />
              </>
            }
          />

          {/* <Route
            path="/client-management"
            element={
              <>
                <PageTitle title="Client Management" />
                <Manager />
              </>
            }
          /> */}
          <Route
            path="/theater-owner"
            element={
              <>
                <PageTitle title="Client Management" />
                <TheaterOwner />
              </>
            }
          />
          <Route
            path="/theater-owner-detail/:id"
            element={
              <>
                <PageTitle title="Theater Management" />
                <TheaterOwnerDetail />
              </>
            }
          />
          <Route
            path="/event-organizer"
            element={
              <>
                <PageTitle title="Client Management" />
                <EventOrganizer />
              </>
            }
          />
          <Route
            path="/event-organizer-detail/:id"
            element={
              <>
                <PageTitle title="Theater Management" />
                <EventOrganizerDetail  />
              </>
            }
          />
          {/* <Route path="/manager-detail/:id" element={<><PageTitle title="Manager Detail" /><ViewManagerProfile /></>} /> */}
          <Route
            path="/sellerDetail/:id"
            element={
              <>
                <PageTitle title="Seller Detail" />
                <SellerDetails />
              </>
            }
          />
          <Route
            path="/sellerDetails/:id"
            element={
              <>
                <PageTitle title="Seller Detail" />
                <SellerMDetails />
              </>
            }
          />
          <Route
            path="/users"
            element={
              <>
                <PageTitle title="Users" />
                <User />
              </>
            }
          />
          <Route
            path="/user-detail/:id"
            element={
              <>
                <PageTitle title="User Detail" />
                <UserDetails />
              </>
            }
          />

          <Route
            path="/banner"
            element={
              <>
                <PageTitle title="Banners" />
                <Banner />
              </>
            }
          />
          <Route
            path="/notification"
            element={
              <>
                <PageTitle title="Notifications" />
                <Notification />
              </>
            }
          />
          <Route
            path="/advertisement"
            element={
              <>
                <PageTitle title="Advertisements" />
                <Ads />
              </>
            }
          />
          <Route
            path="/coupon"
            element={
              <>
                <PageTitle title="Coupons" />
                <Coupon />
              </>
            }
          />
          <Route
            path="/assignCoupon/:id"
            element={
              <>
                <PageTitle title="Assign Coupon" />
                <AssignCoupon />
              </>
            }
          />
          <Route
            path="/Location"
            element={
              <>
                <PageTitle title="Location" />
                <State />
              </>
            }
          />
          <Route
            path="/city/:id"
            element={
              <>
                <PageTitle title="Cities" />
                <City />
              </>
            }
          />
          <Route
            path="/venues"
            element={
              <>
                <PageTitle title="Venue" />
                <Venue />
              </>
            }
          />
          <Route
            path="/nonsittingvenue/:id"
            element={
              <>
                <PageTitle title="Non Sitting Venue" />
                <VenueNonSittingTable />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <PageTitle title="Terms & Conditions" />
                <Terms />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <PageTitle title="Privacy Policy" />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/enquiry"
            element={
              <>
                <PageTitle title="Enquiry" />
                <Enquiry />
              </>
            }
          />
          <Route
            path="/support"
            element={
              <>
                <PageTitle title="Support" />
                <Support />
              </>
            }
          />
          <Route
            path="/commission"
            element={
              <>
                <PageTitle title="Commission" />
                <Commission />
              </>
            }
          />
          <Route
            path="/theater-revenue-admin"
            element={
              <>
                <PageTitle title="Theater Revenue Admin" />
                <TheaterRevenueAdmin />
              </>
            }
          />
          <Route
            path="/event-qr-code"
            element={
              <>
                <PageTitle title="Scan Event QR" />
                <QRScanner />
              </>
            }
          />
          <Route
            path="/seller-dash"
            element={
              <>
                <PageTitle title="Seller Dashboard" />
                <SellerDash />
              </>
            }
          />
          {/* <Route
            path=".well-known/assetlinks.json"
            element={
              <>
                <PageTitle title="Seller Dashboard" />
                <assetlinks/>
              </>
            }
          /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
