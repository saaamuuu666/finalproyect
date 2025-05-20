import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAuth0 } from '@auth0/auth0-angular';
import {provideHttpClient} from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideAuth0({
      domain: 'dev-8pv06qu1x3ybt5p1.eu.auth0.com',
      clientId: 'IDIA4TTmLKsLDJrsJ4bYTLEQMuVkbBvN',
      authorizationParams:{
        redirect_uri:window.location.origin
      }
    }),
    
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
