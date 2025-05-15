// skills.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  // URL to your skills JSON file or API endpoint
  private skillsUrl = 'assets/data/skills.json'; // Example path to a local JSON file
  // Or use an external API like:
  // private skillsUrl = 'https://api.example.com/skills';

  constructor(private http: HttpClient) {}

  getAllSkills(): Observable<string[]> {
    return this.http.get<string[]>(this.skillsUrl).pipe(
      catchError(() => {
        // Fallback to a default list if API fails
        return of([
          'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue',
          'Node.js', 'Java', 'Spring Boot', 'Python', 'Django',
          'Flask', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Azure',
          'Git', 'CI/CD', 'HTML', 'CSS', 'SASS', 'Redux',
          'GraphQL', 'REST API', 'Microservices', 'Kubernetes'
        ]);
      })
    );
  }
}