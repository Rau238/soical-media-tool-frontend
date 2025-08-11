export const environment = {
  production: true,
  apiUrl: 'https://api.socialspark.com/api',
  frontendUrl: 'https://app.socialspark.com',
  oauth: {
    facebook: {
      appId: '1827649851425755',
      scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts'
    },
    google: {
      clientId: '527269112417-njps29hi9ba0576dc940e6lqrfdn1cq1.apps.googleusercontent.com',
      redirectUri: 'http://localhost:3000/api/auth/google/callback'
    }
  }

};

