export interface ScheduledPost {
  id?: string;
  content: {
    text: string;
    media?: {
      url: string;
      type: 'image' | 'video';
    }[];
    link?: {
      url: string;
      title?: string;
      description?: string;
    };
  };
  platforms: {
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
    accountId: string;
    pageId?: string;
  }[];
  scheduledAt: Date | string;
  status?: 'scheduled' | 'processing' | 'posted' | 'failed';
  postResults?: {
    platform: string;
    success: boolean;
    postId?: string;
    response?: any;
    error?: string;
    postedAt?: Date | string;
  }[];
}