import axios from 'axios';
import { QrData, MovieTicket, GrabABiteItem } from '../types/scanner';

// This would normally come from your environment variables
const BASE_URL = 'https://api.example.com';
const IMAGE_URL = 'https://images.example.com/';

const Urls = {
  getUserMovieBookingTicketDetail: `${BASE_URL}/user/movie/booking/ticket/detail`,
  scanMovieQRCode: `${BASE_URL}/scan/movie/qrcode`,
  Image_url: IMAGE_URL
};

export interface TicketDetailsResponse {
  data: {
    movieName: string;
    theaterName: string;
    showtime: string;
    date: string;
    seatNumbers: string[];
    ticketPrice: number;
    status: string;
    grabABiteList?: GrabABiteItem[];
  };
}

export const fetchTicketDetails = async (bookingId: string, token: string): Promise<MovieTicket> => {
  const response = await axios.post<TicketDetailsResponse>(
    Urls.getUserMovieBookingTicketDetail,
    { bookingId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = response.data.data;
  return {
    movieName: data.movieName || 'Untitled Movie',
    theaterName: data.theaterName || 'Cinema Theater',
    showtime: data.showtime || '7:30 PM',
    date: data.date || new Date().toLocaleDateString(),
    seatNumbers: data.seatNumbers || ['A1', 'A2'],
    ticketPrice: data.ticketPrice || 0,
    bookingStatus: data.status || 'Confirmed',
  };
};

export const fetchGrabABiteList = async (bookingId: string, token: string): Promise<GrabABiteItem[]> => {
  const response = await axios.post<TicketDetailsResponse>(
    Urls.getUserMovieBookingTicketDetail,
    { bookingId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data?.grabABiteList || [];
};

export const verifyTicket = async (bookingId: string, token: string): Promise<string> => {
  const response = await axios.post(
    Urls.scanMovieQRCode,
    { bookingId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.message;
};

export default Urls;