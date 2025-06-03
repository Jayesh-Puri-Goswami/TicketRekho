
export interface QrData {
  userId: string;
  bookingId: string;
}

export interface GrabABiteItem {
  grabABiteId: {
    _id: string;
    userId: string;
    eventId: string;
    name: string;
    foodType: string;
    grabImage: string;
    description: string;
    price: number;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
  qty: number;
  _id: string;
}

export interface MovieTicket {
  movieName: string;
  theaterName: string;
  showtime: string;
  date: string;
  seatNumbers: string[];
  ticketPrice: number;
  bookingStatus: string;
}