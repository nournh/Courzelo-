import { Component, OnInit } from '@angular/core';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-assigned-challenges',
  templateUrl: './assigned-challenges.component.html',
  styleUrls: ['./assigned-challenges.component.scss']
})
export class AssignedChallengesComponent implements OnInit {
  allChallenges: any[] = [];
  filteredChallenges: any[] = [];
  loading = true;
  error: string | null = null;

  // Filter controls
  searchControl = new FormControl('');
  difficultyFilter = new FormControl('all');
  skillsFilter = new FormControl('all');
  
  difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];
  
  skillsOptions = [
    { value: 'all', label: 'All Skills' }
  ];
  allSkills: Set<string> = new Set();

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.fetchAssignedChallenges();
    
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
      
    this.difficultyFilter.valueChanges.subscribe(() => this.applyFilters());
    this.skillsFilter.valueChanges.subscribe(() => this.applyFilters());
  }
  
  fetchAssignedChallenges() {
    this.challengeService.getAllChallenges().subscribe({
      next: (res) => {
        this.allChallenges = (Array.isArray(res) ? res : [res])
          .filter(challenge => {
            // Convert to array if it's a Set
            const candidates = this.getAssignedCandidatesArray(challenge);
            return candidates.length > 0;
          });

        console.log('Assigned challenges:', this.allChallenges); // Debug log
  
        this.allChallenges.forEach(challenge => {
          if (challenge.requiredSkills) {
            challenge.requiredSkills.forEach((skill: string) => {
              this.allSkills.add(skill);
            });
          }
        });
  
        this.skillsOptions = [
          { value: 'all', label: 'All Skills' },
          ...Array.from(this.allSkills).map(skill => ({
            value: skill.toLowerCase(),
            label: skill
          }))
        ];
  
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assigned challenges. Please try again later.';
        this.loading = false;
        console.error('Error fetching assigned challenges:', err);
      }
    });
  }

  private getAssignedCandidatesArray(challenge: any): string[] {
    if (!challenge.assignedCandidates) return [];
    if (Array.isArray(challenge.assignedCandidates)) return challenge.assignedCandidates;
    if (challenge.assignedCandidates instanceof Set) return Array.from(challenge.assignedCandidates);
    return [];
  }
 
  applyFilters() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const difficulty = this.difficultyFilter.value;
    const skill = this.skillsFilter.value;
  
    this.filteredChallenges = this.allChallenges.filter(challenge => {
      const candidates = this.getAssignedCandidatesArray(challenge);
      
      const matchesSearch = 
        challenge.title?.toLowerCase().includes(searchTerm) ||
        challenge.description?.toLowerCase().includes(searchTerm) ||
        (challenge.requiredSkills?.some((s: string) => 
          s?.toLowerCase().includes(searchTerm))
        ) ||
        (challenge.tasks?.some((task: any) => 
          task.question?.toLowerCase().includes(searchTerm))
        ) ||
        candidates.some(email => 
          email?.toLowerCase().includes(searchTerm));
  
      const matchesDifficulty = 
        difficulty === 'all' || 
        challenge.difficulty?.toLowerCase() === difficulty;
  
      const matchesSkill = 
        skill === 'all' ||
        (challenge.requiredSkills?.some((s: string) => 
          s?.toLowerCase() === skill));
  
      return matchesSearch && matchesDifficulty && matchesSkill;
    });
  }
  
  formatSkills(skills: string[]): string {
    return skills?.join(', ') || 'No skills specified';
  }

  formatAssignedCandidates(challenge: any): string {
    const candidates = this.getAssignedCandidatesArray(challenge);
    return candidates.length > 0 ? candidates.join(', ') : 'No assigned candidates';
  }

  getTasks(challenge: any): any[] {
    return challenge.tasks || [];
  }
}