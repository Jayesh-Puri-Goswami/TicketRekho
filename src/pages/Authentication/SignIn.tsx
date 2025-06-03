'use client';

import type React from 'react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../../redux/user/userSlice';
import appUrls from '../../../src/networking/app_urls';

interface FormData {
  [key: string]: string;
}

interface RootState {
  user: {
    error: string | null;
  };
}

const SignIn: React.FC = () => {
  const [formdata, setFormdata] = useState<FormData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<
    'success' | 'invalidCredentials' | 'failed' | 'accountInactive' | null
  >(null);
  const [inactiveMessage, setInactiveMessage] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state: RootState) => state.user.error);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormdata({ ...formdata, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setInactiveMessage(null);

    try {
      dispatch(signInStart());

      const res = await fetch(appUrls.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata),
      });

      const data = await res.json();

      if (res.ok) {
        const userRole = data.data.role;
        const status = data.data.active;

        if (status) {
          dispatch(signInSuccess(data));
          setLoginStatus('success');

          if (userRole === 'admin') {
            navigate('/dashboard');
          } else if (
            userRole === 'theatreManager' ||
            userRole === 'theatreEmployee' ||
            userRole === "Theatre Manager" ||
            userRole === "Theatre Employee"
          ) {
            console.log(userRole);
            navigate('/theatre-dashboard');
          } else if (
            userRole === 'eventManager' ||
            userRole === 'eventEmployee' ||
            userRole === 'Event Manager' ||
            userRole === 'Event Employee'
          ) {
            navigate('/event-dashboard');
          }
        } else {
          setLoginStatus('accountInactive');
          setInactiveMessage(
            'Your account is inactive. Please contact support.',
          );
          dispatch(signInFailure('Account inactive'));
        }
      } else {
        dispatch(signInFailure('Invalid credentials'));
        setLoginStatus('invalidCredentials');
      }
    } catch (error) {
      console.log(error);
      dispatch(signInFailure('Login failed. Please try again later.'));
      setLoginStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (inactiveMessage)
      return { message: inactiveMessage, color: 'text-red-500' };
    switch (loginStatus) {
      case 'success':
        return { message: 'Login successful!', color: 'text-green-500' };
      case 'invalidCredentials':
        return {
          message: 'Invalid email or password. Please try again.',
          color: 'text-red-500',
        };
      case 'failed':
        return {
          message: 'Login failed. Please try again later.',
          color: 'text-red-500',
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full blur-2xl opacity-40"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Left Section with Logo */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        variants={containerVariants}
      >
        <div className="max-w-lg w-full relative z-10">
          {/* Floating Logo Container */}
          <motion.div
            className="relative"
            variants={floatingVariants}
            animate="animate"
          >
            {/* Glow Effect Behind Logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl blur-xl opacity-20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />

            {/* Logo */}
            <motion.div
              className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.3,
              }}
            >
              <motion.img
                src="appicon.png"
                alt="TicketRekho"
                className="w-full max-w-sm mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '../../../public/Image/Logo/appicon.png';
                }}
              />
            </motion.div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-6 -left-6 w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>
      </motion.div>

      {/* Right Section with Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Email Field */}
            <motion.div transition={{ type: 'spring', stiffness: 300 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative group">
                <motion.input
                  id="email"
                  type="email"
                  onChange={handleChange}
                  className="w-full px-4 py-4 pl-12 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 group-hover:border-gray-300"
                  placeholder="Enter your email"
                  required
                  whileFocus={{ scale: 1 }}
                />
                <motion.div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  whileHover={{ scale: 1 }}
                >
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </motion.div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              whileHover={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative group">
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  className="w-full px-4 py-4 pl-12 pr-12 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 group-hover:border-gray-300"
                  placeholder="Enter your password"
                  required
                />
                <motion.div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </motion.div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              {/* Button Background Animation */}
              <motion.div
                className="absolute inset-0 bg-indigo-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />

              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <motion.div
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      }}
                    />
                    <span className="ml-3">Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.div
                      className="ml-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Status Message */}
          {statusMessage && (
            <motion.div
              className={`mt-6 p-4 rounded-xl text-center font-medium ${
                statusMessage.color === 'text-green-500'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              {statusMessage.message}
            </motion.div>
          )}

          {/* Mobile Logo */}
          <motion.div
            className="lg:hidden mt-8 text-center"
            variants={itemVariants}
          >
            <motion.img
              src="appicon.png"
              alt="TicketRekho"
              className="w-24 h-24 mx-auto opacity-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: 0.8 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '../../../public/Image/Logo/appicon.png';
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIn;
