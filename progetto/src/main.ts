import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  Router,
  NavigationEnd,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { inject } from '@angular/core';
import { filter } from 'rxjs/operators';

function setupGlobalLogic() {
  const router = inject(Router);

  router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe((e) => {
      const current = (e as NavigationEnd).urlAfterRedirects;
      console.log('✅ Pagina attuale:', current);

      // puoi esportarla o assegnarla ad un servizio se vuoi
      // ad esempio: GlobalService.currentRoute = current;
    });
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
}).then(() => {
  setupGlobalLogic();
});
