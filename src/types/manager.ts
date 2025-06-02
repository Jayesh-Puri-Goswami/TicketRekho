export type ManagerCategory = "Event Employee" | "Theatre Manager" | "Event Manager" | "Theatre Employee"
export type ManagerStatus = "Active" | "Inactive"

export interface StateData {
  _id: string
  name: string
  stateImage: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface CityData {
  _id: string
  name: string
  cityImage: string
  state: string | StateData
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Manager {
  _id: string
  name: string
  email: string
  phoneNumber: string
  stateId: string | StateData
  cityId: string | CityData
  profileImage: string
  bankAccountNumber: string
  ifscCode: string
  address: string
  city: string
  pincode: string
  role: ManagerCategory
  managerId: string | null
  otp: string
  otpVerified: boolean
  expiryTime: string | null
  permissions: string
  fcmToken: string
  deviceId: string
  active: boolean
  createdAt: string
  updatedAt: string
  __v: number
  password?: string
  // Additional fields for theatre managers
  theatreName?: string
  location?: string
  isActive?: boolean
  isGrabABite?: boolean
}

export interface ManagerFormData {
  name: string
  email: string
  phoneNumber: string
  password: string
  role: string
  active: boolean
  stateId: string
  cityId: string
  address: string
  bankAccountNumber: string
  ifscCode: string
  profileImage?: File | null
  // Theatre manager specific fields
  theatreName?: string
  location?: string
  isActive?: boolean
  isGrabABite?: boolean
}

export interface ModalFormProps {
  onSubmitSuccess?: (data: any) => void
  setLoadingAfterAdd?: (loading: boolean) => void
}
