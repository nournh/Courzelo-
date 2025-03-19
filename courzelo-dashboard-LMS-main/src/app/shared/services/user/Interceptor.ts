import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from './authentication.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';


@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(
              private authService: AuthenticationService,
              private toastr: ToastrService,
              private router: Router
              ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedRequest = request.clone({
      withCredentials: true
    });
    return next.handle(modifiedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
         //   const isAuthRoute = request.url.includes('/sessions/signin');
        //    console.log(isAuthRoute);
          if (error.status === 401 && !error.url.includes('/api/v1/auth/check-auth') ) {
              this.toastr.error('Session Expired', 'Error', {progressBar: true});
            this.authService.logout();
          }
           return throwError(error);
         })
    );
  }
}
