// const Bash_url = 'https://testing.ticketrekho.com/api';
// const Image_url = 'https://testing.ticketrekho.com/api/uploads/';
// const Socket_url = 'https://testing.ticketrekho.com';

const Bash_url = 'http://localhost:4100/api';
const Image_url = 'http://localhost:4100/api/uploads/';
const Socket_url = 'http://localhost:4100';

// Admin API's
const loginUrl = `${Bash_url}/admin/adminLogin`;

const getBannerUrl = `${Bash_url}/admin/getBanners`;
const createBannerUrl = `${Bash_url}/admin/createBanner`;
const deleteBannerUrl = `${Bash_url}/admin/deleteBanner`;
const updateBannerUrl = `${Bash_url}/admin/updateBanner`;
const getAdminBanners = `${Bash_url}/admin/getAdminBanners`;
const changeBannerStatus = `${Bash_url}/admin/changeBannerStatus`;
const updateAdminProfile = `${Bash_url}/admin/updateAdminProfile`;

//App User

const getUserList = `${Bash_url}/admin/getUserList`;
const getAllUserList = `${Bash_url}/admin/getAllUserList`;
const deleteAppUser = `${Bash_url}/admin/deleteAppUser`;
const changeAppUserStatus = `${Bash_url}/admin/changeAppUserStatus`;

const userDetail = `${Bash_url}/admin/userDetail`;
const getManagerDetails = `${Bash_url}/admin/getManagerDetails`;

//SubUser
const changeSubUserStatus = `${Bash_url}/admin/changeSubUserStatus`;
const updateSubUserProfile = `${Bash_url}/subUser/updateSubUserProfile`;

//Terms & Conditions
const getTermPolicyList = `${Bash_url}/admin/termPolicyList`;
const createOrUpdateTermPolicy = `${Bash_url}/admin/createOrUpdateTermPolicy`;

//advertisement
const getAdminAdsurl = `${Bash_url}/admin/getAdminAds`;
const changeAdvertisementStatus = `${Bash_url}/admin/changeAdvertisementStatus`;
const getAdvertisementsUrl = `${Bash_url}/admin/getAdvertisements`;
const createAdvertisementUrl = `${Bash_url}/admin/createAdvertisement`;
const deleteAdvertisementUrl = `${Bash_url}/admin/deleteAdvertisement`;

//coupon
const getCouponsUrl = `${Bash_url}/admin/getCoupons`;
const createCouponUrl = `${Bash_url}/admin/createCoupon`;
const updateCouponUrl = `${Bash_url}/admin/updateCoupon`;
const deleteCouponUrl = `${Bash_url}/admin/deleteCoupon`;
const getCouponDetail = `${Bash_url}/admin/getCouponDetail`;

//Assign Coupon Code

const assignCouponCodeToSingleUser = `${Bash_url}/admin/assignCouponCodeToSingleUser`;
const assignCouponCodeToAllUsers = `${Bash_url}/admin/assignCouponCodeToAllUsers`;
const assignCouponCodeAccordingToStatesAndCity = `${Bash_url}/admin/assignCouponCodeAccordingToStatesAndCity`;

// state
const getStates = `${Bash_url}/admin/getStates`;
const getStatesList = `${Bash_url}/subUser/getStates`;
const CreateStates = `${Bash_url}/admin/createState`;
const UpdateState = `${Bash_url}/admin/updateState`;
const getSingleState = `${Bash_url}/admin/getSingleState`;
const deleteState = `${Bash_url}/admin/deleteState`;

// city
const getCities = `${Bash_url}/admin/getCities`;
const CreateCities = `${Bash_url}/admin/createCity`;
const UpdateCity = `${Bash_url}/admin/updateCity`;
const getCitiesByState = `${Bash_url}/admin/getCitiesByState`;
const getCitiesListByState = `${Bash_url}/subUser/getCitiesByState`;
const deleteCity = `${Bash_url}/admin/deleteCity`;

// support
const supportTickets = `${Bash_url}/admin/getSupportTickets`;
const updateSupportTicket = `${Bash_url}/admin/updateSupportTicket`;

// Enquiry
const getEnquiryTickets = `${Bash_url}/admin/getEnquiryTickets`;
const updateEnquiryTicket = `${Bash_url}/admin/updateEnquiryTicket`;
const deleteEnquiryTicket = `${Bash_url}/admin/deleteEnquiryTicket`;

// notification
const sendNotificationsToSingleUser = `${Bash_url}/admin/sendNotificationsToSingleUser`;
const sendNotificationsToUsers = `${Bash_url}/admin/sendNotificationsToUsers`;

// get Managers

const createClient = `${Bash_url}/admin/createClient`;
const updateClient = `${Bash_url}/admin/updateClient`;

const getManagers = `${Bash_url}/admin/getSubUserList`;
const createManager = `${Bash_url}/admin/subUserSignup`;
const getSubUserProfileDetails = `${Bash_url}/admin/getSubUserProfileDetails`;

const getTheatreOwnerList = `${Bash_url}/admin/getTheatreOwnerList`;
const getEventOrganizerList = `${Bash_url}/admin/getEventOrganizerList`;
const getEventManagerList = `${Bash_url}/admin/getEventManagerList`;

const getTheatreDetailByManager = `${Bash_url}/subUser/getTheatreDetailByManager`;

// theatre managers
const getTheatreManager = `${Bash_url}/admin/getTheatreManagerList`;
const CreateTManager = `${Bash_url}/admin/theatreManagerSignup`;
const createTheatreManager = `${Bash_url}/admin/createTheatreManager`;

// event managers
const getEventManager = `${Bash_url}/admin/getEventManagerList`;
const createEventManager = `${Bash_url}/admin/createEventManager`;

const updateProfile = `${Bash_url}/subUser/updateProfile`;
const editTheatreMangerProfile = `${Bash_url}/admin/editTheatreMangerProfile`;
const editEventMangerProfile = `${Bash_url}/admin/editEventMangerProfile`;

// roles and permission
const updatePermission = `${Bash_url}/admin/updatePermission`;
const getRoles = `${Bash_url}/admin/getAllRolePermissions`;
const getPermissions = `${Bash_url}/admin/getPermissions`;

// movies
const getMovies = `${Bash_url}/admin/getMovies`;
const createMovie = `${Bash_url}/admin/createMovie`;
const updateMovie = `${Bash_url}/admin/updateMovie`;
const getMovieDetails = `${Bash_url}/admin/getMovie`;
const deleteMovie = `${Bash_url}/admin/deleteMovie`;
const changeMovieStatus = `${Bash_url}/admin/changeMovieStatus`;

// for theatre managers
const getTheatres = `${Bash_url}/subUser/getTheatres`;
const getActiveTheatres = `${Bash_url}/subUser/getActiveTheatres`;
const getAllTheatresList = `${Bash_url}/admin/getAllTheatresList`;
const addTheatre = `${Bash_url}/subUser/addTheatre`;
const deleteTheatre = `${Bash_url}/subUser/deleteTheatre`;
const changeTheatreStatus = `${Bash_url}/subUser/changeTheatreStatus`;
const updateTheatre = `${Bash_url}/subUser/updateTheatre`;
const getScreensDetailWithTheatre = `${Bash_url}/subUser/getScreensDetailWithTheatre`;
const getTheatreDetail = `${Bash_url}/subUser/getTheatreDetail`;

// for revenue and analytics
const getSingleTheatreRevenueReport = `${Bash_url}/admin/getSingleTheatreRevenueReport`;
const getAllTheatreRevenueReports = `${Bash_url}/admin/getAllTheatreRevenueReports`;

// screens
const getScreens = `${Bash_url}/subUser/getScreens`;
const addScreen = `${Bash_url}/subUser/addScreen`;
const updateScreen = `${Bash_url}/subUser/updateScreen`;
const deleteScreen = `${Bash_url}/subUser/deleteScreen`;
const changeScreenStatus = `${Bash_url}/subUser/changeScreenStatus`;
const getScreensByThreatreId = `${Bash_url}/subUser/getScreensByThreatreId`;
const getActiveScreensByThreatreId = `${Bash_url}/subUser/getActiveScreensByThreatreId`;

// movie seat
const addSeatLayout = `${Bash_url}/subUser/addSeatLayout`;
const movieSeatLayoutForAdmin = `${Bash_url}/subUser/movieSeatLayoutForAdmin`;
const getSeatNames = `${Bash_url}/subUser/getSeatNames`;

//movie grab a bite
const getGrabABiteList = `${Bash_url}/subUser/getGrabABiteList`;
const getGrabABiteListwithpagination = `${Bash_url}/subUser/getGrabABiteListwithpagination`;
const deleteGrabAABite = `${Bash_url}/subUser/deleteGrabAABite`;
const createGrabABite = `${Bash_url}/subUser/createGrabABite`;
const updateGrabABite = `${Bash_url}/subUser/updateGrabABite`;

//ShowTime
const getMovieShowtimesbyManager = `${Bash_url}/subUser/getMovieShowtimesbyManager`;
const deleteMovieShowTime = `${Bash_url}/subUser/deleteMovieShowTime`;
const changeMovieShowTimeStatus = `${Bash_url}/subUser/changeMovieShowTimeStatus`;
const addMovieShowTime = `${Bash_url}/subUser/addMovieShowTime`;
const updateMovieShowTime = `${Bash_url}/subUser/updateMovieShowTime`;
const getMovieShowtimesbyId = `${Bash_url}/subUser/getMovieShowtimesbyId`;
const getMovieShowtimeFullDetailById = `${Bash_url}/subUser/getMovieShowtimeFullDetailById`;

const getdActiveMoviesList = `${Bash_url}/subUser/getdActiveMoviesList`;

//events
const getAllEventsByManagerId = `${Bash_url}/subUser/getAllEventsByManagerId`;
const getAllEventNames = `${Bash_url}/subUser/getAllEventNames`;
const deleteEvent = `${Bash_url}/subUser/deleteEvent`;
const changeEventStatus = `${Bash_url}/subUser/changeEventStatus`;
const createEvent = `${Bash_url}/subUser/createEvent`;
const updateEvent = `${Bash_url}/subUser/updateEvent`;
const getEventDetail = `${Bash_url}/subUser/getEventDetail`;

//event grab a bite
const getEventGrabABiteList = `${Bash_url}/subUser/getEventGrabABiteList`;
const getEventGrabABiteListWithPagination = `${Bash_url}/subUser/getEventGrabABiteListWithPagination`;
const deleteEventGrabAABite = `${Bash_url}/subUser/deleteEventGrabAABite`;
const createEventGrabABite = `${Bash_url}/subUser/createEventGrabABite`;
const updateEventGrabABite = `${Bash_url}/subUser/updateEventGrabABite`;
const getEventGrabaBiteDetails = `${Bash_url}/subUser/getEventGrabaBiteDetails`;

//Venue

const displayVenueList = `${Bash_url}/subUser/displayVenueList`;
const deleteVenue = `${Bash_url}/subUser/deleteVenue`;
const changeVenueStatus = `${Bash_url}/subUser/changeVenueStatus`;
const createVenue = `${Bash_url}/subUser/createVenue`;
const createVenueName = `${Bash_url}/subUser/createVenueName`;
const addTicketsForNonSitting = `${Bash_url}/subUser/addTicketsForNonSitting`;
const addTicketsForSitting = `${Bash_url}/subUser/addTicketsForSitting`;
const addEventSeatLayout = `${Bash_url}/subUser/addEventSeatLayout`;
const eventSeatLayoutForAdmin = `${Bash_url}/subUser/eventSeatLayoutForAdmin`;
const displayVenueDetail = `${Bash_url}/subUser/displayVenueDetail`;

const getVenueByManager = `${Bash_url}/subUser/getVenueByManager`;

const displayNonSittingTickets = `${Bash_url}/subUser/displayNonSittingTickets`;
const displaysittingTickets = `${Bash_url}/subUser/displaysittingTickets`;

//Movie Ticket Booking
const getUserMovieBookingTicketesByShowTime = `${Bash_url}/subUser/getUserMovieBookingTicketesByShowTime`;

//Event Ticket Booking

const getUserEventBookingTicketesbyEventID = `${Bash_url}/subUser/getUserEventBookingTicketesbyEventID`;

const getUserBookingTicketes = `${Bash_url}/admin/getUserBookingTicketes`;

//Report
const getEventReport = `${Bash_url}/subUser/getEventReport`;
const getThreatreReport = `${Bash_url}/subUser/getThreatreReport`;

//Scan QR Code
const scanEventQRCode = `${Bash_url}/subUser/scanEventQRCode`;
const getUserEventBookingTicketDetail = `${Bash_url}/subUser/getUserEventBookingTicketDetail`;

const scanMovieQRCode = `${Bash_url}/subUser/scanMovieQRCode`;
const getUserMovieBookingTicketDetail = `${Bash_url}/subUser/getUserMovieBookingTicketDetail`;

const createorUpdateCommissionCharges = `${Bash_url}/admin/createorUpdateCommissionCharges`;
const getCommissionCharges = `${Bash_url}/admin/getCommissionCharges`;

const adminDashboard = `${Bash_url}/admin/adminDashboard`;
const eventManagerDashboard = `${Bash_url}/subUser/eventManagerDashboard`;
const theatreManagerDashboard = `${Bash_url}/subUser/theatreManagerDashboard`;
const editMangerProfile = `${Bash_url}/admin/editMangerProfile`;

const createEmployee = `${Bash_url}/subUser/createEmployee`;
const updateEmployee = `${Bash_url}/subUser/updateEmployee`;
const getEmployeeListBymanagerId = `${Bash_url}/subUser/getEmployeeListBymanagerId`;
const deleteEmployee = `${Bash_url}/subUser/deleteEmployee`;
const getEmployeeDetails = `${Bash_url}/subUser/getEmployeeDetails`;
const changeEmployeeStatus = `${Bash_url}/subUser/changeEmployeeStatus`;

export default {
  Bash_url,
  loginUrl,
  Image_url,
  Socket_url,

  getBannerUrl,
  createBannerUrl,
  deleteBannerUrl,
  updateBannerUrl,
  getAdminBanners,
  changeBannerStatus,
  updateAdminProfile,
  changeAdvertisementStatus,

  changeSubUserStatus,
  updateSubUserProfile,

  getUserList,
  getAllUserList,
  deleteAppUser,
  changeAppUserStatus,
  userDetail,
  getManagerDetails,

  getTermPolicyList,
  createOrUpdateTermPolicy,

  getAdminAdsurl,
  getAdvertisementsUrl,
  createAdvertisementUrl,
  deleteAdvertisementUrl,

  getCouponsUrl,
  createCouponUrl,
  updateCouponUrl,
  deleteCouponUrl,
  getCouponDetail,

  assignCouponCodeToSingleUser,
  assignCouponCodeToAllUsers,
  assignCouponCodeAccordingToStatesAndCity,

  getStates,
  getStatesList,
  getSingleState,
  deleteState,

  CreateStates,
  UpdateState,
  getCities,
  getCitiesByState,
  getCitiesListByState,
  deleteCity,
  CreateCities,
  UpdateCity,
  supportTickets,
  updateSupportTicket,

  getEnquiryTickets,
  updateEnquiryTicket,
  deleteEnquiryTicket,

  sendNotificationsToSingleUser,
  sendNotificationsToUsers,
  // Client
  createClient,
  updateClient,

  getTheatreManager,
  CreateTManager,
  getEventManager,
  updatePermission,
  getRoles,
  getPermissions,
  getMovies,
  createMovie,
  updateMovie,
  getTheatreOwnerList,
  getEventOrganizerList,
  getEventManagerList,
  getTheatreDetailByManager,
  getManagers,
  createManager,
  createTheatreManager,
  createEventManager,
  updateProfile,
  editEventMangerProfile,
  editTheatreMangerProfile,
  getSubUserProfileDetails,
  getTheatres,
  getSingleTheatreRevenueReport,
  getAllTheatreRevenueReports,
  getAllTheatresList,
  getActiveTheatres,
  addTheatre,
  deleteTheatre,
  changeTheatreStatus,
  updateTheatre,
  getScreensDetailWithTheatre,
  getTheatreDetail,
  getScreens,
  getScreensByThreatreId,
  getActiveScreensByThreatreId,
  addScreen,
  updateScreen,
  deleteScreen,
  changeScreenStatus,
  getMovieDetails,
  deleteMovie,
  changeMovieStatus,
  getMovieShowtimesbyManager,
  deleteMovieShowTime,
  changeMovieShowTimeStatus,
  getdActiveMoviesList,
  addMovieShowTime,
  updateMovieShowTime,
  getMovieShowtimesbyId,
  getMovieShowtimeFullDetailById,

  getGrabABiteList,
  getGrabABiteListwithpagination,
  deleteGrabAABite,
  createGrabABite,
  updateGrabABite,

  addSeatLayout,
  movieSeatLayoutForAdmin,
  getSeatNames,

  getAllEventNames,
  getAllEventsByManagerId,
  deleteEvent,
  changeEventStatus,
  createEvent,
  updateEvent,
  getEventDetail,

  getEventGrabABiteList,
  getEventGrabABiteListWithPagination,
  deleteEventGrabAABite,
  createEventGrabABite,
  updateEventGrabABite,
  getEventGrabaBiteDetails,

  displayVenueList,
  deleteVenue,
  changeVenueStatus,
  getVenueByManager,
  createVenue,
  createVenueName,
  addTicketsForNonSitting,
  addTicketsForSitting,
  addEventSeatLayout,
  displayNonSittingTickets,
  displaysittingTickets,
  eventSeatLayoutForAdmin,
  displayVenueDetail,

  getUserMovieBookingTicketesByShowTime,
  getUserEventBookingTicketesbyEventID,
  getUserBookingTicketes,

  getEventReport,
  getThreatreReport,

  scanEventQRCode,
  getUserEventBookingTicketDetail,
  scanMovieQRCode,
  getUserMovieBookingTicketDetail,

  createorUpdateCommissionCharges,
  getCommissionCharges,

  adminDashboard,
  eventManagerDashboard,
  theatreManagerDashboard,
  editMangerProfile,

  createEmployee,
  updateEmployee,
  getEmployeeListBymanagerId,
  deleteEmployee,
  getEmployeeDetails,
  changeEmployeeStatus,
};
