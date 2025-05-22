// User related models
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  role: 'HOST' | 'RENTER' | 'ADMIN';
  profile?: UserProfile;
  lastLoginAt?: string;
  accountVerified?: boolean;
  provider: 'LOCAL' | 'GOOGLE';
  providerId?: string;
}

export interface UserProfile {
  id?: number;
  bio?: string;
  profileImageUrl?: string;
  addresses?: Address[];
}

export interface Address {
  id?: number;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Storage Space related models
export interface StorageSpace {
  id?: number;
  hostId?: number;
  title: string;
  description: string;
  pricePerMonth: number;
  sizeInSquareFeet: number;
  spaceType: 'GARAGE' | 'BASEMENT' | 'ATTIC' | 'STORAGE_UNIT' | 'ROOM' | 'SHED' | 'OTHER';
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'BOOKED' | 'DELETED';
  address?: Address;
  features?: StorageSpaceFeature[];
  images?: SpaceImage[];
  availabilityPeriod?: AvailabilityPeriod;
  ratings?: Rating[];
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export type StorageSpaceFeature = 
  'CLIMATE_CONTROLLED' | 
  'SECURITY_CAMERA' | 
  'TWENTY_FOUR_HOUR_ACCESS' | 
  'DRIVE_UP_ACCESS' | 
  'INDOOR' | 
  'OUTDOOR' | 
  'LOCKED' | 
  'SHELVING' | 
  'ELECTRICITY' | 
  'LIGHTING' | 
  'ALARM_SYSTEM';

export interface SpaceImage {
  id?: number;
  spaceId?: number;
  imageUrl: string;
  caption?: string;
  primary?: boolean;
  version?: number;
}

export interface AvailabilityPeriod {
  spaceId?: number;
  startDate: string;
  endDate: string;
}

export interface Rating {
  id?: number;
  userId: number;
  spaceId: number;
  overallScore: number;
  cleanlinessScore?: number;
  securityScore?: number;
  accessibilityScore?: number;
  valueScore?: number;
  accuracyScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Booking related models
export interface Booking {
  id?: number;
  spaceId: number;
  startDate: string;
  endDate: string;
  renter?: Renter;
  totalPrice?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}

export interface Renter {
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  profile?: UserProfile;
}

// API Response models
export interface ApiResponse<T> {
  metadata?: {
    timestamp?: string;
    traceId?: string;
  };
  status?: {
    statusCode?: number;
    statusMessage?: string;
    statusMessageKey?: string;
  };
  messages?: ApiMessage[];
  data?: T;
}

export interface ApiMessage {
  fieldName?: string;
  messageType?: 'ERROR' | 'WARNING' | 'INFO';
  errorType?: 'REQUEST_ERROR' | 'API_ERROR';
  messageKey?: string;
  value?: string;
}

// Request models
export interface SignUpRequest {
  username: string;
  firstName?: string;
  lastName?: string;
  role?: ('HOST' | 'RENTER' | 'ADMIN')[];
  password: string;
  email: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface AddNewAddressRequest {
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EditAddressRequest extends AddNewAddressRequest {
  id: number;
}

export interface CreateStorageSpaceRequest {
  title: string;
  description: string;
  pricePerMonth: number;
  sizeInSquareFeet: number;
  spaceType: 'GARAGE' | 'BASEMENT' | 'ATTIC' | 'STORAGE_UNIT' | 'ROOM' | 'SHED' | 'OTHER';
  addressId: number;
  features?: StorageSpaceFeature[];
  availabilityPeriod: {
    startDate: string;
    endDate: string;
  };
}

export interface BookingRequest {
  spaceId: number;
  startDate: string;
  endDate: string;
}

export interface FindNearestStorageSpaceRequest {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface UpdateAvailabilityPeriodRequest {
  startDate: string;
  endDate: string;
}
