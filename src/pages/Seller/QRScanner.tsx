import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCameraRotate } from '@fortawesome/free-solid-icons';

interface QrData {
  userId: string;
  bookingId: string;
  appUserId: string;
  email: string;
  showtimeId: string;
}

interface GrabABiteItem {
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

const QRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(
    'environment',
  );
  const [grabABiteList, setGrabABiteList] = useState<GrabABiteItem[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);


  const startCameraScanner = async () => {
    setIsCameraActive(true);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const scanner = new QrScanner(
          videoRef.current,
          async (result) => {
            try {
              const parsedData: QrData = JSON.parse(result.data);
              setQrData(parsedData);
              setIsCameraActive(false);
              scannerRef.current?.stop();

              await fetchGrabABiteList(parsedData.bookingId);
            } catch (error) {
              console.error('Failed to parse QR data:', error);
              setErrorMessage('Invalid QR Code. Please try again.');
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          },
        );

        await scanner.start();
        scannerRef.current = scanner;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setErrorMessage(
        'Camera access denied. Please allow permissions in your browser settings.',
      );
    }
  };

  const stopCameraScanner = () => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    setCameraFacing((prev) =>
      prev === 'environment' ? 'user' : 'environment',
    );
    stopCameraScanner();
    startCameraScanner();
  };

  const scanImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await QrScanner.scanImage(file);
      
      const parsedData: QrData = JSON.parse(result);

      console.log('Parsed QR Data:', parsedData);
      
      setQrData(parsedData);

      await fetchGrabABiteList(parsedData.bookingId);
    } catch (error) {
      console.error('Error scanning image:', error);
      setErrorMessage('Invalid QR Code in image. Please try again.');
    }
  };

  const fetchGrabABiteList = async (bookingId: string) => {
    try {
      const response = await axios.post(
        Urls.getUserEventBookingTicketDetail,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (response.data.data?.bookingTickets?.grabABiteList) {
        setGrabABiteList(response.data.data.bookingTickets.grabABiteList);
      }
    } catch (error) {
      console.error('Failed to fetch grabABiteList:', error);
      setErrorMessage('Failed to fetch Grab a Bite list. Please try again.');
    }
  };

  const sendGameUserId = async () => {
    if (!qrData) return;

    setIsSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        Urls.scanEventQRCode,
        {
          bookingId: qrData.bookingId,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      setSuccessMessage(response.data.message);
    } catch (error: any) {
      console.error('Failed to send Booking ID:', error);
      setErrorMessage(
        error.response?.data?.message ||
          'Failed to verify ticket. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const resetScanner = () => {
    setQrData(null);
    setGrabABiteList([]);
    setSuccessMessage(null);
    setErrorMessage(null);
    stopCameraScanner();
  };

  return (
    <>
      <Breadcrumb pageName="Event QR Management" />
      <div className="flex flex-col items-center justify-center p-6 min-h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
          QR Code Scanner
        </h2>

        {!isCameraActive ? (
          <>
            <button
              onClick={startCameraScanner}
              className="w-full max-w-md py-2 mb-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 shadow-md"
            >
              Scan QR Code
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md py-2 text-black font-medium bg-gray-600 hover:bg-gray-700 border border-slate-400 rounded-md transition-all duration-300 shadow-md"
            >
              Scan an Image File
            </button>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={scanImageFile}
            />
          </>
        ) : (
          <>
            <div className="w-full max-w-md h-72 bg-white border-4 border-dashed border-blue-400 rounded-lg shadow-inner flex items-center justify-center mb-4 overflow-hidden">
              <video ref={videoRef} className="w-full h-full" />
            </div>
            <button
              onClick={switchCamera}
              className="w-full max-w-md py-2 mb-3 text-white font-medium bg-gray-800 hover:bg-gray-600 rounded-md transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              {/* <FontAwesomeIcon icon={faCameraRotate} className="text-lg" /> */}
              Switch Camera
            </button>
            <button
              onClick={stopCameraScanner}
              className="w-full max-w-md py-2 mb-3 text-white font-medium bg-red-600 hover:bg-red-700 rounded-md transition-all duration-300 shadow-md"
            >
              Stop Scanning
            </button>
          </>
        )}

        {qrData && (
          <div className="mt-4 p-4 bg-blue-100 text-blue-900 rounded-md text-center">
            <p className="text-md font-medium">
              Booking ID:{' '}
              <span className="font-semibold">{qrData.bookingId}</span>
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-2 rounded bg-red-100 text-red-800">
            <p className="text-lg">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div
            className={`mt-4 p-2 rounded ${
              successMessage === 'QR code scanned successfully.'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="text-lg">{successMessage}</p>
          </div>
        )}

        {qrData && (
          <button
            onClick={sendGameUserId}
            disabled={isSending}
            className={`mt-6 px-6 py-2 rounded-lg font-medium transition duration-200 max-w-md w-full ${
              isSending
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSending ? 'Sending...' : 'Verify Ticket'}
          </button>
        )}

        {grabABiteList.length > 0 && (
          <div className="mt-6 w-full">
            <h3 className="text-xl mb-2 font-bold text-black">
              Grab a Bite List:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Image</th>
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Quantity
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {grabABiteList.map((item) => (
                    <tr key={item._id} className="border border-gray-300">
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.grabABiteId.grabImage && (
                          <img
                            src={`${Urls.Image_url}${item.grabABiteId.grabImage}`}
                            alt={item.grabABiteId.name}
                            className="w-12 h-12 object-cover mx-auto"
                          />
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.grabABiteId.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-600">
                        {item.grabABiteId.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.qty}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-green-600 text-center">
                        {item.grabABiteId.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {qrData && (
          <button
            onClick={resetScanner}
            className="w-full max-w-md py-2 mt-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 shadow-md"
          >
            Scan Another Ticket
          </button>
        )}
      </div>
    </>
  );
};

export default QRScanner;
