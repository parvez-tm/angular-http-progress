import { HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as NProgress from 'nprogress';

// Global variable to track the number of active requests
let activeRequests = 0;

export const progressInterceptor: HttpInterceptorFn = (req, next) => {

   // Start the NProgress bar when a request is made
   if (activeRequests === 0) {
    NProgress.start();
  }
  
  activeRequests++; // Increment active requests count


  NProgress.configure({ 
    minimum: 0.1,
    showSpinner: false,
    easing: 'ease',
    speed: 500,
    trickleSpeed: 200,
    //color: '#FF0000' // This won't work directly - need CSS override
  });
  
  
  // return next(req);
  NProgress.start();

    return next(req).pipe(
      finalize(() => {
         activeRequests--; // Decrease active requests count when request completes
      // When no active requests are left, stop the NProgress bar
      if (activeRequests === 0) {
        NProgress.done();
      }
      })
    );
};
