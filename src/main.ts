import { HttpClient, HttpEventType, HttpHeaders, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { progressInterceptor } from './progress.interceptor';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports:[CommonModule],
  template: `
  @for( d of name;track $index){
    <h1>{{ d.name }}!</h1>
  }
  `,
})
export class App {
  name:any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit(){
    this.loadDataWithInterceptor()
    this.getData().subscribe({
      next: (data)=>{
        console.log(data);
        
      }
    });
  }

    // This will trigger the interceptor automatically and this will track the data loading
    loadDataWithInterceptor(): void {
      this.http.get('https://jsonplaceholder.typicode.com/users').subscribe({
        next: (data:any) => this.name = data,
        error: (error) => console.error(error)
      });
    }

  //For Download and Upload Kind of operation and not for api data loading
  getData(): Observable<any> {
    return this.http.get('https://jsonplaceholder.typicode.com/users', {
      observe: 'events',
      reportProgress: true,
    }).pipe(
      tap(event => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent!');
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header received!');
            break;
          case HttpEventType.DownloadProgress:
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              console.log(`Download Progress: ${progress}%`);
            }
            break;
          case HttpEventType.Response:
            console.log('Response received!');
            break;
        }
      }),
      catchError(error => {
        console.error('Request failed', error);
        throw error; // Re-throw the error so that the component can handle it
      })
    );
  }

}

bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([progressInterceptor]))],
});
