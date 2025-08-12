export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  accessToken?: string;
  fanCount?: number;
  hasInstagramAccount?: boolean;
}

export interface SocialAccount {
  _id: string;
  id: string;
  accountId: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  user: string;
  accountName: string;
  accountProfilePic: string;
  accountUsername: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastTokenValidation: string;
  permissions: string[];
  tokenExpiry: string;
  tokenValidationStatus: 'valid' | 'invalid' | 'expired';
  __v: number;
}

export interface ConnectedAccountsResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: {
    accounts: SocialAccount[];
    count: number;
  };
  timestamp: string;
}

export interface FacebookConnectionRequest {
  accessToken: string;
  userID: string;
}

export interface FacebookConnectionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    platform: string;
    name: string;
    platformUserId: string;
    isActive: boolean;
    pages: FacebookPage[];
    tokenExpiresAt: string;
    connectedAt: string;
  };
}

export interface TokenValidationResponse {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    expiresAt?: string;
    scopes?: string[];
    appId?: string;
    error?: string;
  };
}

export interface DisconnectResponse {
  success: boolean;
  message: string;
}

// LinkedIn normalized profile
export interface LinkedInNormalizedProfile {
  id: string;
  fullName?: string;
  headline?: string;
  photoUrl?: string;
}

// Extended Facebook Profile interfaces
export interface FacebookProfile {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  birthday?: string;
  hometown?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
  website?: string;
  about?: string;
  bio?: string;
  gender?: string;
  locale?: string;
  timezone?: number;
  verified?: boolean;
  updated_time?: string;
  picture?: {
    data: {
      url: string;
      is_silhouette: boolean;
    };
  };
  cover?: {
    source: string;
    offset_x: number;
    offset_y: number;
  };
  link?: string;
  age_range?: {
    min: number;
  };
  languages?: Array<{
    id: string;
    name: string;
  }>;
}

export interface DetailedFacebookProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: FacebookProfile;
    account: {
      id: string;
      platform: string;
      platformUserId: string;
      connectedAt: string;
    };
  };
}

// Enhanced Facebook Page interfaces
export interface FacebookPageDetails {
  id: string;
  name: string;
  category: string;
  category_list: Array<{
    id: string;
    name: string;
  }>;
  fan_count: number;
  followers_count: number;
  picture: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
    offset_x?: number;
    offset_y?: number;
  };
  about?: string;
  description?: string;
  website?: string;
  phone?: string;
  emails?: string[];
  location?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    latitude?: number;
    longitude?: number;
  };
  hours?: {
    [key: string]: string;
  };
  parking?: {
    lot: number;
    street: number;
    garage: number;
    valet: number;
  };
  public_transit?: string;
  payment_options?: {
    cash_only: number;
    visa: number;
    mastercard: number;
    american_express: number;
    discover: number;
  };
  price_range?: string;
  is_published: boolean;
  is_verified: boolean;
  verification_status?: string;
  checkins?: number;
  were_here_count?: number;
  talking_about_count?: number;
  new_like_count?: number;
  link?: string;
  username?: string;
  founded?: string;
  company_overview?: string;
  mission?: string;
  products?: string;
  general_info?: string;
  awards?: string;
  can_checkin?: boolean;
  can_post?: boolean;
  has_added_app?: boolean;
  is_community_page?: boolean;
  is_unclaimed?: boolean;
  voip_info?: {
    has_permission: boolean;
  };
  whatsapp_number?: string;
  access_token?: string;
  perms?: string[];
  tasks?: string[];
  unread_message_count?: number;
  unread_notif_count?: number;
  unseen_message_count?: number;
}

export interface FacebookPagesResponse {
  success: boolean;
  message: string;
  data: {
    pages: FacebookPageDetails[];
    count: number;
    account: {
      id: string;
      platform: string;
      platformUserId: string;
    };
  };
}

export interface FacebookPageDetailsResponse {
  success: boolean;
  message: string;
  data: {
    page: FacebookPageDetails;
    account: {
      id: string;
      platform: string;
      platformUserId: string;
    };
  };
}

// Page Insights interfaces
export interface PageInsight {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
  title: string;
  description: string;
}

export interface PageInsightsResponse {
  success: boolean;
  message: string;
  data: {
    insights: PageInsight[];
    page: {
      id: string;
      name: string;
      category: string;
    };
    account: {
      id: string;
      platform: string;
      platformUserId: string;
    };
  };
}

// Instagram interfaces
export interface InstagramAccount {
  id: string;
  name: string;
  username: string;
  profile_picture_url: string;
  followers_count: number;
  media_count: number;
  biography?: string;
  website?: string;
  account_type?: string;
  follows_count?: number;
  connected_page?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface InstagramAccountsResponse {
  success: boolean;
  message: string;
  data: {
    instagramAccounts: InstagramAccount[];
    count: number;
    account: {
      id: string;
      platform: string;
      platformUserId: string;
    };
  };
}

export interface InstagramProfileResponse {
  success: boolean;
  message: string;
  data: {
    instagram: InstagramAccount;
    connectedPage: {
      id: string;
      name: string;
      category: string;
    };
    account: {
      id: string;
      platform: string;
      platformUserId: string;
    };
  };
}
