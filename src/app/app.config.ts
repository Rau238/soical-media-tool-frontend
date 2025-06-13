import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { authInterceptor, } from './shared/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(appRoutes),
  provideHttpClient(),
  provideAnimations(),
    SocialLoginModule,
    GoogleSigninButtonModule,
  {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider('517352282689-m04590thj6eqlboviofh45tl4mn0a5m6.apps.googleusercontent.com', {
            oneTapEnabled: false, // Disable auto-login popup
            scopes: 'profile email', // Request profile and email scopes
          }),
        },
      ],
      onError: (err) => {
        console.error('SocialAuthServiceConfig Error:', err);
      },
    } as SocialAuthServiceConfig,
  },
  provideHttpClient(
    withInterceptors([authInterceptor])
  )
  ]
};
