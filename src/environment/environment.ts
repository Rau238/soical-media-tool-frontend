export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:4205',
  oauth: {
    facebook: {
      appId: '1827649851425755',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_manage_metadata,pages_read_user_content,pages_read_user_content,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,instagram_basic,public_profile,email',
    },
    linkedIn: {
      appId: '77ysvdxtge1ob9',
      scope: 'profile,email,w_member_social,openid,r_organization_admin,w_organization_social,r_dma_admin_pages_content',
      redirectUri: 'http://localhost:4205/connect-account'
    },
  },
  google: {
    clientId: '527269112417-njps29hi9ba0576dc940e6lqrfdn1cq1.apps.googleusercontent.com',
    redirectUri: 'http://localhost:3000/api/auth/google/callback'
  },
  apiEndpoints: {
    auth: '/api/auth',
    socialAccounts: '/api/social-accounts',
    users: '/api/users'
  }
};
