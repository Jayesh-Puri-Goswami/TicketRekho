import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import Urls from '../../networking/app_urls';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { QrData, MovieTicket, GrabABiteItem } from '../types/scanner';
import { fetchTicketDetails, fetchGrabABiteList, verifyTicket } from '../hooks/scanner';
import ScannerOverlay from '../components/Scanner/ScannerOverlay';
import TicketDetails from '../components/Scanner/TicketDetails';
import FoodList from '../components/Scanner/FoodList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCameraRotate } from '@fortawesome/free-solid-icons';
// import './Scanner.css';
const MovieQRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [ticketDetails, setTicketDetails] = useState<MovieTicket | null>(null);
  const [grabABiteList, setGrabABiteList] = useState<GrabABiteItem[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.user.currentUser?.data);

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

              if (currentUser?.token) {
                const [ticket, foodItems] = await Promise.all([
                  fetchTicketDetails(parsedData.bookingId, currentUser.token),
                  fetchGrabABiteList(parsedData.bookingId, currentUser.token),
                ]);
                setTicketDetails(ticket);
                setGrabABiteList(foodItems);
              }
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
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
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
      setQrData(parsedData);

      if (currentUser?.token) {
        const [ticket, foodItems] = await Promise.all([
          fetchTicketDetails(parsedData.bookingId, currentUser.token),
          fetchGrabABiteList(parsedData.bookingId, currentUser.token),
        ]);
        setTicketDetails(ticket);
        setGrabABiteList(foodItems);
      }
    } catch (error) {
      console.error('Error scanning image:', error);
      setErrorMessage('Invalid QR Code in image. Please try again.');
    }
  };

  const handleVerifyTicket = async () => {
    if (!qrData || !currentUser?.token) return;

    setIsSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const message = await verifyTicket(qrData.bookingId, currentUser.token);
      setSuccessMessage(message);
    } catch (error: any) {
      console.error('Failed to verify ticket:', error);
      setErrorMessage(
        error.response?.data?.message || 'Failed to verify ticket. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const resetScanner = () => {
    setQrData(null);
    setTicketDetails(null);
    setGrabABiteList([]);
    setSuccessMessage(null);
    setErrorMessage(null);
    stopCameraScanner();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-8 px-4">
      <div className="bg-white dark:bg-boxdark shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          Movie Ticket Scanner
        </h2>

        {!isCameraActive ? (
          <>
            <button
              onClick={startCameraScanner}
              className="w-full py-2 mb-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 shadow-md"
            >
              Scan QR Code
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-black font-medium bg-gray-600 hover:bg-gray-700 border border-slate-400 rounded-md transition-all duration-300 shadow-md"
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
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4 shadow-inner overflow-hidden">
              <video ref={videoRef} className="w-full h-full" />
              <ScannerOverlay isActive={!isSending} />
            </div>
            <button
              onClick={switchCamera}
              className="w-full py-2 mb-3 text-white font-medium bg-graydark hover:bg-slate-600 rounded-md transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              {/* <FontAwesomeIcon icon={faCameraRotate} className="text-lg" /> */}
              Switch Camera
            </button>
            <button
              onClick={stopCameraScanner}
              className="w-full py-2 mb-3 text-white font-medium bg-red-600 hover:bg-red-700 rounded-md transition-all duration-300 shadow-md"
            >
              Stop Scanning
            </button>
          </>
        )}

        {qrData && ticketDetails && (
          <div className="mt-4">
            <TicketDetails
              ticket={ticketDetails}
              bookingId={qrData.bookingId}
              successMessage={successMessage}
              isVerifying={isSending}
              onVerify={handleVerifyTicket}
            />
          </div>
        )}

        {grabABiteList.length > 0 && (
          <div className="mt-4">
            <FoodList items={grabABiteList} />
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 p-3 rounded-md mb-4">
            <p className="text-center font-medium">{errorMessage}</p>
          </div>
        )}

        {qrData && (
          <button
            onClick={resetScanner}
            className="w-full py-2 mt-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 shadow-md"
          >
            Scan Another Ticket
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieQRScanner;