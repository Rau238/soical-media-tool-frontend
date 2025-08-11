export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:4200',
  oauth: {
    facebook: {
      appId: '1827649851425755',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_manage_metadata,pages_read_user_content,pages_read_user_content,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,instagram_basic,public_profile,email',
    },
    linkedIn: {
      appId: '77km717rh2cz2e',
      scope: 'r_liteprofile,r_emailaddress,w_member_social',
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
