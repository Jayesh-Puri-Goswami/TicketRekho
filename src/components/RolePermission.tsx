import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Urls from '../networking/app_urls';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronDown, Shield } from 'lucide-react';

const RolePermission = () => {
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
  const [roles, setRoles] = useState<{ _id: string; role: string }[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const [permissions, setPermissions] = useState(
    [
      'states',
      'managers',
      'users',
      'movie management',
      'manage theatres',
      'showtimes',
      'movie qr management',
      'manage theatre reports',
      'event management',
      'manage venues',
      'event qr management',
      'manage event reports',
      'banners',
      'advertisements',
      'coupon codes',
      'notifications',
      'enquiries',
      'support & feedback',
      'terms & conditions',
      'employee management',
    ].map((name) => ({ name, status: false })),
  );

  const tooltipMap: Record<string, string> = {
    states: 'Manage state and location data',
    managers: 'Control access to manager roles',
    users: 'Manage user accounts and details',
    'movie management': 'Handle movie listings',
    'manage theatres': 'Add/edit theatre information',
    showtimes: 'Set and manage movie show schedules',
    'movie qr management': 'Handle QR codes for movies',
    'manage theatre reports': 'Access theatre analytics and reports',
    'event management': 'Create and manage events',
    'manage venues': 'Edit venue details for events',
    'event qr management': 'Handle QR codes for events',
    'manage event reports': 'View and manage event reports',
    banners: 'Manage promotional banners',
    advertisements: 'Control ad content and placement',
    'coupon codes': 'Create and manage discount codes',
    notifications: 'Send and manage alerts/messages',
    enquiries: 'Handle customer enquiries',
    'support & feedback': 'Manage user support and feedback',
    'terms & conditions': 'Edit platform policies and terms',
    'employee management': 'Edit employee details and roles',
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${Urls.getRoles}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setRoles(response.data.data);
      const firstRole = response.data.data[0];
      if (firstRole?._id) {
        setSelectedRoleId(firstRole._id);
        fetchPermissionByRoleID(firstRole._id);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissionByRoleID = async (roleID: string) => {
    try {
      const res = await axios.get(`${Urls.getPermissions}?id=${roleID}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const fetched = res.data.data?.permissions;
      if (!fetched || fetched.length === 0) {
        resetPermissions();
      } else {
        setPermissions(fetched);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const resetPermissions = () => {
    setPermissions(
      Object.keys(tooltipMap).map((name) => ({ name, status: false })),
    );
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedRoleId(id);
    fetchPermissionByRoleID(id);
  };

  const togglePermission = (index: number) => {
    const updated = [...permissions];
    updated[index].status = !updated[index].status;
    setPermissions(updated);
  };

  const handleUpdate = async () => {
    const selectedRole = roles.find((r) => r._id === selectedRoleId);
    if (!permissions.some((p) => p.status)) {
      toast.error('Please select at least one permission before updating.', {
        className: 'z-[99999]',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${Urls.updatePermission}`,
        {
          id: selectedRoleId,
          role: selectedRole?.role,
          permissions,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.status === 200) {
        toast.success('Permissions updated successfully!', {
          className: 'z-[99999]',
        });
        if (selectedRole?.role === 'admin') {
          toast('Your permissions changed. Logging out...');
          setTimeout(() => {
            localStorage.removeItem('persist:root');
            window.location.href = '/login';
          }, 1000);
        }
      } else {
        toast.error(`Error: ${res.data.message}`, {
          className: 'z-[99999]',
        });
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Oops! Something went wrong with permission. Please try again later.',
        {
          className: 'z-[99999]',
        },
      );
    }
  };

  const handleCancel = () => {
    resetPermissions();
    setSelectedRoleId('');
  };

  const formatRoleName = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              Roles & Permissions
            </h1>
          </div>

          <div className="mb-8 relative">
            <label className="mb-3 block text-black">Select Role</label>
            <div className="relative">
              <select
                value={selectedRoleId}
                onChange={handleRoleChange}
                className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-2 pr-10 bg-white dark:bg-slate-900 text-black dark:text-white"
              >
                <option value="" disabled>
                  Select Role
                </option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {formatRoleName(role.role)}
                  </option>
                ))}
              </select>

              {/* Custom dropdown icon */}
              <div className="pointer-events-none absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 dark:text-slate-300">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            {permissions.map(
              (perm, index) =>
                perm.status && (
                  <motion.label
                    key={perm.name}
                    className="permission-label"
                    whileHover={{ scale: 1.01 }}
                  >
                    <input
                      type="checkbox"
                      checked={perm.status}
                      onChange={() => togglePermission(index)}
                      className="hidden peer"
                      disabled
                    />
                    <div className="custom-checkbox">
                      {perm.status && (
                        <svg
                          width="12px"
                          height="12px"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <polyline
                            points="3.7 14.3 9.6 19 20.3 5"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="permission-name">
                      {perm.name}
                      <span className="custom-tooltip">
                        {tooltipMap[perm.name]}
                      </span>
                    </span>
                  </motion.label>
                ),
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {/* <button
              onClick={handleCancel}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded"
            >
              Cancel
            </button> */}
            {/* <button
              onClick={handleUpdate}
              className="px-6 py-2 bg-indigo-purple text-white hover:bg-indigo-purple-dark rounded"
            >
              Update
            </button> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RolePermission;
