import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { progressInterceptor } from './progress.interceptor';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UploadprogressService } from './uploadprogress.service';


@Component({
  selector: 'app-root',
  imports: [CommonModule,ReactiveFormsModule],
  template: `
  @for( d of name;track $index){
    <h1>{{ d.name }}!</h1>
  }

    <input type='file' (change)="handleFileInput($event)"/>
    <input type='submit' value='Submit' (click)='postData()'/>
  `,
})
export class App {
  name: any[] = [];
  downloadData: any
  fileToUpload:any
  constructor(private http: HttpClient, private upload: UploadprogressService) { 
   
  }
  handleFileInput(event: any) {
    this.fileToUpload = event.target.files[0];
}

  ngOnInit() {
    this.loadDataWithInterceptor()
    // this.getData().subscribe({
    //   next: (data) => {
    //     console.log(data);

    //   }
    // });
  }

  // This will trigger the interceptor automatically and this will track the data loading
  loadDataWithInterceptor(): void {
    this.http.get('https://jsonplaceholder.typicode.com/users').subscribe({
      next: (data: any) => this.name = data,
      error: (error) => console.error(error)
    });
  }

  //For Download and Upload Kind of operation and not for api data loading
  getData(): Observable<any> {
    return this.http.get('https://picsum.photos/400/400', {
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
              this.downloadData = `${progress}%`
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

  postData(){
    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    const req = new HttpRequest('POST', 'https://api.escuelajs.co/api/v1/files/upload', formData, {
      reportProgress: true
    });
    

    this.upload.uploadFile(req,this.fileToUpload).subscribe()
  }

}

bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([progressInterceptor]))],
});
