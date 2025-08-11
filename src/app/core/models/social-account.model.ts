export interface SocialAccount {
  id?: string;
  _id?: string; // MongoDB ID
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string;
  tokenSecret?: string; // For Twitter
  expiresAt?: string; // Token expiration
  profileId: string;
  username?: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
  isActive?: boolean;
  connectedAt?: string;
  lastUsed?: string;
  
  // Platform-specific data
  pages?: FacebookPage[];
  channels?: YouTubeChannel[];
  linkedinPages?: LinkedInPage[];
  
  // Permissions and scope
  grantedPermissions?: string[];
  scope?: string;
  
  // Error tracking
  lastError?: string;
  errorCount?: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
  category?: string;
  picture?: string;
  fanCount?: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  subscriberCount?: number;
}

export interface LinkedInPage {
  id: string;
  name: string;
  organizationType?: string;
  logo?: string;
  followerCount?: number;
}

export interface SocialAccountResponse {
  statusCode: number;
  success: boolean;
  data: SocialAccount;
  message?: string;
  timestamp?: string;
}

export interface SocialAccountListResponse {
  statusCode: number;
  success: boolean;
  data: SocialAccount[];
  message?: string;
  timestamp?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ConnectSocialAccountResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: {
    url: string;
    state?: string;
    expiresIn?: number;
  };
  timestamp?: string;
}

export interface OAuthCallbackResponse {
  statusCode: number;
  success: boolean;
  data: SocialAccount;
  message?: string;
  timestamp?: string;
}

export interface ConnectSocialAccountParams {
  platform: SocialPlatform;
  code?: string;
  state?: string;
  scope?: string;
  redirectUri?: string;
}

export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

// OAuth Error interface
export interface OAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
}
