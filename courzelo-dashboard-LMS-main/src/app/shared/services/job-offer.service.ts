import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Use the correct environment path
import { JobOffersDTO } from '../models/JobOffers.model'; // Create a DTO model based on your response structure
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {

  private apiUrl = 'http://localhost:8080/api/JobOffers';  // Adjust based on your backend URL

  constructor(private http: HttpClient) { }

  // Get all job offers
  getAllJobs(): Observable<JobOffersDTO[]> {
    return this.http.get<JobOffersDTO[]>(`${this.apiUrl}`);
  }

  // Get a job offer by its ID
  getJobById(idJob: string): Observable<JobOffersDTO> {
    return this.http.get<JobOffersDTO>(`${this.apiUrl}/${idJob}`);
  }

  // Get job offers by state
  getJobsByState(state: string): Observable<JobOffersDTO[]> {
    return this.http.get<JobOffersDTO[]>(`${this.apiUrl}/state/${state}`);
  }

  // Check if a prehiring test exists
  checkPrehiringTestExists(idPrehiringTest: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/existPrehiring/${idPrehiringTest}`);
  }

  // Get job offers by business
  getJobsByBusiness(idBusiness: string): Observable<JobOffersDTO[]> {
    return this.http.get<JobOffersDTO[]>(`${this.apiUrl}/business/${idBusiness}`);
  }

  // Get job offers by business and state
  getJobsByBusinessAndState(idBusiness: string, state: string): Observable<JobOffersDTO[]> {
    return this.http.get<JobOffersDTO[]>(`${this.apiUrl}/business/${idBusiness}/${state}`);
  }

  // Add a new job offer
  addJob(idBusiness: string, job: JobOffersDTO): Observable<JobOffersDTO> {
    return this.http.post<JobOffersDTO>(`${this.apiUrl}/${idBusiness}`, job, this.httpOptions());
  }

  // Update a job offer
  updateJob(idJob: string, job: JobOffersDTO): Observable<JobOffersDTO> {
    return this.http.put<JobOffersDTO>(`${this.apiUrl}/${idJob}`, job, this.httpOptions());
  }

  // Delete a job offer by ID
  deleteJob(idJob: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idJob}`);
  }

  // Deactivate a job offer
  deactivateJob(idJob: string): Observable<JobOffersDTO> {
    return this.http.put<JobOffersDTO>(`${this.apiUrl}/Desactivate/${idJob}`, {});
  }

  // Activate a job offer
  activateJob(idJob: string): Observable<JobOffersDTO> {
    return this.http.put<JobOffersDTO>(`${this.apiUrl}/Activate/${idJob}`, {});
  }

assignPrehiringTest(idJob: string, idPrehiringTests: string[]): Observable<JobOffersDTO> {
  return this.http.put<JobOffersDTO>(`${this.apiUrl}/AssignPrehiringTest/${idJob}`, idPrehiringTests, this.httpOptions());
}


  // Unassign a prehiring test from a job
  unassignPrehiringTest(idJob: string): Observable<JobOffersDTO> {
    return this.http.put<JobOffersDTO>(`${this.apiUrl}/UnAssignPrehiringTest/${idJob}`, {});
  }

  // Add a test to a job
  addTest(idJob: string, idTest: string): Observable<JobOffersDTO> {
    return this.http.put<JobOffersDTO>(`${this.apiUrl}/AddTest/${idJob}/${idTest}`, {});
  }

  // Delete a test from a job
  deleteTest(idJob: string, idTest: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idJob}/${idTest}`);
  }

  // Helper method to set HTTP headers (optional)
  private httpOptions() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return { headers };
  }
  


 // Update the GetCountries method in your service
public GetCountries(): Observable<{ name: string, flag: string, cca2: string }[]> {
  return this.http.get<any[]>('https://restcountries.com/v3.1/all').pipe(
    map((countries) => countries.map(c => ({ 
      name: c.name.common, 
      flag: c.flags[0],
      cca2: c.cca2 // Add country code
    })))
  );
}

// Add a new method to get cities/regions
public GetCities(countryCode: string): Observable<string[]> {
  // Note: You'll need to implement or use an API for this
  // Here's a placeholder implementation using a free API
  return this.http.get<any[]>(`https://api.example.com/cities/${countryCode}`).pipe(
    map(response => response.map(city => city.name))
  );
}
  // Get the assigned prehiring test for a job
getAssignedPrehiringTest(idJob: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/AssignedPrehiringTest/${idJob}`);
}

} 