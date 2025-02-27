import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { catchError, last, map, tap } from 'rxjs';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadprogressService {
  constructor(private http: HttpClient) {}

  uploadFile(req: HttpRequest<any>, file: File): Observable<any> {
    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => this.getEventMessage(event, file)),
      tap((message) => this.showProgress(message)),
      last(), // Emit last (completed) message to the caller
      catchError((error) => this.handleError(error, file)) // Error handling
    );
  }

  private getEventMessage(event: HttpEvent<any>, file: File): string {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;

      case HttpEventType.UploadProgress:
        // Compute and show the percentage done:
        if (event.total) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          return `File "${file.name}" is ${percentDone}% uploaded.`;
        }
        return `Uploading file "${file.name}".`;

      case HttpEventType.Response:
        return `File "${file.name}" was completely uploaded!`;

      default:
        return `File "${file.name}" surprising upload event: ${event.type}.`;
    }
  }

  private showProgress(message: string): void {
    // Log progress to console or update UI with progress messages
    console.log(message);
  }

  private handleError(error: any, file: File): Observable<never> {
    // Handle error, log to console, or return a user-friendly message
    console.error(`Error uploading file "${file.name}":`, error);
    return throwError(() => new Error(`Error uploading file "${file.name}"`));
  }
}
