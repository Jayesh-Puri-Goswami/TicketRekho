import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import url from '../networking/app_urls';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';


const Profile = () => {
  const currentUser = useSelector(
    (state: any) => state.user.currentUser.data,
  );

  // Initialize state with empty strings or with currentUser values once loaded.
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState<boolean>(false);

  // Set state values when currentUser is available or updated.
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhoneNumber(currentUser.phoneNumber || "");
      setEmail(currentUser.email || "");
      // For password, usually you wouldn't set it this way
      setPassword("");
    }
  }, [currentUser, reload]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    setErrorMessage(null);
    setLoading(true);
  
    const formData = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
    };
  
    try {
      await axios.post(url.updateAdminProfile, formData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Profile updated successfully!');
      setReload((prev) => !prev);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        'Oops! Something went wrong while updating your profile. Please try again later.',
      );
      setErrorMessage('Oops! Something went wrong while updating your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Breadcrumb pageName="Profile" />
      <div className="flex flex-col gap-9 mb-9">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Update Profile
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  value={name} // Use state variable
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Mobile
                </label>
                <input
                  type="text"
                  value={phoneNumber} // Use state variable
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter Mobile"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  type="text"
                  value={email} // Use state variable
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password} // Use state variable
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
  
              {errorMessage && (
                <p className="text-red-500 col-span-2">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded bg-[#865BFF] hover:bg-[#6a48c9] p-3 font-medium text-gray md:col-start-2"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <div className="max-w-4xl mx-auto">
        <Breadcrumb pageName="Profile" />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        </div>
      </div> */}
    </>
  );
};

export default Profile;



















// import { useState, useEffect, FormEvent, useRef } from 'react';
// import axios from 'axios';
// import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
// import url from '../networking/app_urls';
// import { useSelector } from 'react-redux';
// import toast from 'react-hot-toast';
// import { Eye, EyeOff, Camera, User, Mail, Phone, Lock, Upload, Check, X } from 'lucide-react';

// const Profile = () => {
//   const currentUser = useSelector(
//     (state: any) => state.user.currentUser.data,
//   );

//   console.log(currentUser);
  

//   // Profile fields state
//   const [name, setName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [profileImage, setProfileImage] = useState<string | null>(null);
  
//   // Password management state
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showOldPassword, setShowOldPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
//   // UI state
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [reload, setReload] = useState<boolean>(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
  
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Set state values when currentUser is available or updated
//   useEffect(() => {
//     if (currentUser) {
//       setName(currentUser.name || "");
//       setPhoneNumber(currentUser.phoneNumber || "");
//       setEmail(currentUser.email || "");
//       setProfileImage(currentUser.profileImage || null);
//       setImagePreview(currentUser.profileImage || null);
//       // Reset password fields
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//       setIsChangingPassword(false);
//     }
//   }, [currentUser, reload]);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast.error('Image size should be less than 5MB');
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validatePasswordChange = () => {
//     if (!oldPassword.trim()) {
//       setErrorMessage('Please enter your current password');
//       return false;
//     }
//     if (newPassword.length < 6) {
//       setErrorMessage('New password must be at least 6 characters long');
//       return false;
//     }
//     if (newPassword !== confirmPassword) {
//       setErrorMessage('New password and confirm password do not match');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
    
//     setErrorMessage(null);
    
//     // Validate password change if user is changing password
//     if (isChangingPassword && !validatePasswordChange()) {
//       return;
//     }
    
//     setLoading(true);

//     const formData: any = {
//       name: name,
//       email: email,
//       phoneNumber: phoneNumber,
//     };

//     // Only include password fields if user is changing password
//     if (isChangingPassword) {
//       formData.oldPassword = oldPassword;
//       formData.password = newPassword;
//     }

//     // Include profile image if changed
//     if (imagePreview && imagePreview !== currentUser?.profileImage) {
//       formData.profileImage = imagePreview;
//     }

//     try {
//       await axios.post(url.updateAdminProfile, formData, {
//         headers: {
//           Authorization: `Bearer ${currentUser.token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       toast.success('Profile updated successfully!');
//       setReload((prev) => !prev);
//       setIsChangingPassword(false);
//     } catch (error: any) {
//       console.error('Error submitting form:', error);
//       const errorMsg = error.response?.data?.message || 'Oops! Something went wrong while updating your profile. Please try again later.';
//       toast.error(errorMsg);
//       setErrorMessage(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word.charAt(0))
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <>
//       <div className="max-w-4xl mx-auto">
//       <Breadcrumb pageName="Profile" />
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           {/* Header Section */}
//           <div className="bg-indigo-purple px-8 py-12 relative overflow-hidden">
//             <div className="absolute inset-0 bg-black/10"></div>
//             <div className="relative z-10">
//               <div className="flex flex-col md:flex-row items-center gap-6">
//                 {/* Profile Image */}
//                 <div className="relative group">
//                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/5 backdrop-blur-sm">
//                     {imagePreview ? (
//                       <img 
//                         src={imagePreview} 
//                         alt="Profile" 
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-indigo-purple-glass backdrop-blur-lg text-white text-2xl font-bold">
//                         {name ? getInitials(name) : <User size={40} />}
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group-hover:bg-blue-50"
//                   >
//                     <Camera size={16} className="text-gray-600" />
//                   </button>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="hidden"
//                   />
//                 </div>

//                 {/* User Info */}
//                 <div className="text-center md:text-left">
//                   <h1 className="text-3xl font-bold text-white mb-2">
//                     {name || 'Your Name'}
//                   </h1>
//                   <p className="text-blue-100 text-lg mb-1">{email}</p>
//                   <p className="text-blue-100">{phoneNumber}</p>
//                   <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
//                     <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
//                     <span className="text-white text-sm font-medium">Active</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form Section */}
//           <div className="p-8">
//             <div className="mb-8">
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
//               <p className="text-gray-600">Update your personal information and security settings</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Personal Information */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
//                   <User className="mr-2 text-blue-600" size={20} />
//                   Personal Information
//                 </h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700 flex items-center">
//                       <User size={16} className="mr-2 text-gray-400" />
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="Enter your full name"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700 flex items-center">
//                       <Phone size={16} className="mr-2 text-gray-400" />
//                       Phone Number
//                     </label>
//                     <input
//                       type="tel"
//                       value={phoneNumber}
//                       onChange={(e) => setPhoneNumber(e.target.value)}
//                       placeholder="Enter your phone number"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2 md:col-span-2">
//                     <label className="text-sm font-medium text-gray-700 flex items-center">
//                       <Mail size={16} className="mr-2 text-gray-400" />
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="Enter your email address"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Password Section */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                     <Lock className="mr-2 text-blue-600" size={20} />
//                     Security Settings
//                   </h3>
//                   <button
//                     type="button"
//                     onClick={() => setIsChangingPassword(!isChangingPassword)}
//                     className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
//                   >
//                     {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
//                   </button>
//                 </div>

//                 {isChangingPassword && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2 md:col-span-2">
//                       <label className="text-sm font-medium text-gray-700">
//                         Current Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showOldPassword ? "text" : "password"}
//                           value={oldPassword}
//                           onChange={(e) => setOldPassword(e.target.value)}
//                           placeholder="Enter your current password"
//                           className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowOldPassword(!showOldPassword)}
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
//                         >
//                           {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">
//                         New Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showNewPassword ? "text" : "password"}
//                           value={newPassword}
//                           onChange={(e) => setNewPassword(e.target.value)}
//                           placeholder="Enter new password"
//                           className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowNewPassword(!showNewPassword)}
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
//                         >
//                           {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-gray-700">
//                         Confirm New Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showConfirmPassword ? "text" : "password"}
//                           value={confirmPassword}
//                           onChange={(e) => setConfirmPassword(e.target.value)}
//                           placeholder="Confirm new password"
//                           className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
//                         >
//                           {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Password Strength Indicator */}
//                     {newPassword && (
//                       <div className="md:col-span-2">
//                         <div className="text-sm text-gray-600 mb-2">Password Strength:</div>
//                         <div className="flex space-x-2">
//                           <div className={`h-2 w-full rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
//                           <div className={`h-2 w-full rounded ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
//                           <div className={`h-2 w-full rounded ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
//                         </div>
//                         <div className="flex items-center mt-2 space-x-4 text-xs">
//                           <span className={`flex items-center ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
//                             {newPassword.length >= 6 ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
//                             6+ characters
//                           </span>
//                           <span className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
//                             {/[A-Z]/.test(newPassword) ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
//                             Uppercase letter
//                           </span>
//                           <span className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
//                             {/[0-9]/.test(newPassword) ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
//                             Number
//                           </span>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Error Message */}
//               {errorMessage && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <div className="flex items-center">
//                     <X className="text-red-500 mr-2" size={20} />
//                     <p className="text-red-700 font-medium">{errorMessage}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Submit Button */}
//               <div className="flex justify-end pt-6 border-t border-gray-200">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                       Updating...
//                     </>
//                   ) : (
//                     <>
//                       <Upload size={18} className="mr-2" />
//                       Update Profile
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Profile;