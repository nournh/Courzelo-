import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  selectedFile: File | null = null;
  uploadMessage: string | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post('/tk/api/replicas/file/upload', formData).subscribe(
        response => {
          this.uploadMessage = 'Upload successful!';
        },
        error => {
          console.error('Upload error:', error);
          this.uploadMessage = `Upload failed: ${error.message || error}`;
        }
      );
    } else {
      this.uploadMessage = 'No file selected.';
    }
  }
/*
  onUpload(event: Event): void {
    event.preventDefault(); // Prevent default form submission behavior
    
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      this.http.post('/tk/api/replicas/file/upload', formData).subscribe(
        (response: any) => {
          this.uploadMessage = 'Upload successful!';
        },
        (error: any) => {
          console.error('Upload error:', error);
          this.uploadMessage = `Upload failed: ${error.message || error}`;
        }
      );
    } else {
      this.uploadMessage = 'No file selected.';
    }
  }*/
}
