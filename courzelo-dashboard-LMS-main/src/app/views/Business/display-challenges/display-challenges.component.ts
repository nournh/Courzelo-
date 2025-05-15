import { Component, OnInit } from '@angular/core';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-display-challenges',
  templateUrl: './display-challenges.component.html',
  styleUrls: ['./display-challenges.component.scss']
})
export class DisplayChallengesComponent implements OnInit {
  allChallenges: any[] = []; // Store all challenges for filtering
  filteredChallenges: any[] = []; // Challenges after filtering
  loading = true;
  error: string | null = null;
  activeTabs: { [challengeId: string]: string } = {};

  // Filter controls
  searchControl = new FormControl('');
  difficultyFilter = new FormControl('all');
  skillsFilter = new FormControl('all');
  
  // Available filter options
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

  // Track user inputs
  userInputs: { 
    [challengeId: string]: {
      email: string;
      answer?: string;
      file?: File;
    }
  } = {};

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.fetchChallenges();
    
    // Setup search and filter observables
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
      
    this.difficultyFilter.valueChanges.subscribe(() => this.applyFilters());
    this.skillsFilter.valueChanges.subscribe(() => this.applyFilters());
  }
  
  fetchChallenges() {
    this.challengeService.getAllChallenges().subscribe({
      next: (res) => {
        // Filter out challenges that have assigned candidates
        this.allChallenges = (Array.isArray(res) ? res : [res])
          .filter(challenge => 
            !challenge.assignedCandidates || 
            challenge.assignedCandidates.size === 0
          );

        // Initialize user inputs and active tabs
        this.allChallenges.forEach(challenge => {
          this.userInputs[challenge.id] = {
            email: '',
            answer: '',
            file: undefined
          };
          this.activeTabs[challenge.id] = '';
          
          // Collect all unique skills
          if (challenge.requiredSkills) {
            challenge.requiredSkills.forEach((skill: string) => {
              this.allSkills.add(skill);
            });
          }
        });

        // Update skills filter options
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
        this.error = 'Failed to load challenges. Please try again later.';
        this.loading = false;
        console.error('Error fetching challenges:', err);
      }
    });
  }


  applyFilters() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const difficulty = this.difficultyFilter.value;
    const skill = this.skillsFilter.value;
  
    this.filteredChallenges = this.allChallenges.filter(challenge => {
      // Search filter
      const matchesSearch = 
        challenge.title.toLowerCase().includes(searchTerm) ||
        challenge.description.toLowerCase().includes(searchTerm) ||
        (challenge.requiredSkills?.some((s: string) => 
          s.toLowerCase().includes(searchTerm)
        )) ||
        (challenge.tasks?.some((task: any) => 
          task.question.toLowerCase().includes(searchTerm)
        ));
  
      // Difficulty filter
      const matchesDifficulty = 
        difficulty === 'all' || 
        challenge.difficulty?.toLowerCase() === difficulty;
  
      // Skills filter
      const matchesSkill = 
        skill === 'all' ||
        (challenge.requiredSkills?.some((s: string) => 
          s.toLowerCase() === skill
        ));
  
      return matchesSearch && matchesDifficulty && matchesSkill;
    });
  }
  
  formatSkills(skills: string[]): string {
    return skills?.join(', ') || 'No skills specified';
  }

  switchTab(event: Event, tabType: string, challengeId: string) {
    event.preventDefault();
    this.activeTabs[challengeId] = tabType;
  }

  onFileChange(event: any, challengeId: string) {
    const file = event.target.files[0];
    if (file) {
      this.userInputs[challengeId].file = file;
    }
  }

  submitText(challengeId: string) {
    const { email, answer } = this.userInputs[challengeId];

    if (!email || !answer) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      email,
      answers: {
        response: answer
      }
    };

    this.challengeService.submitChallengeText(challengeId, payload).subscribe({
      next: () => {
        alert('Text submission successful!');
        this.resetInputs(challengeId);
      },
      error: (err) => {
        alert('Failed to submit text. Please try again.');
        console.error('Text submission error:', err);
      }
    });
  }

  submitFile(challengeId: string) {
    const { email, file } = this.userInputs[challengeId];

    if (!email || !file) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    this.challengeService.submitChallengeFile(challengeId, email, file).subscribe({
      next: () => {
        alert('File submission successful!');
        this.resetInputs(challengeId);
      },
      error: (err) => {
        alert('Failed to submit file. Please try again.');
        console.error('File submission error:', err);
      }
    });
  }

  private resetInputs(challengeId: string) {
    this.userInputs[challengeId] = {
      email: '',
      answer: '',
      file: undefined
    };
  }
// Add this method to your component class
cancelSubmission(challengeId: string) {
  this.activeTabs[challengeId] = '';
  this.resetInputs(challengeId);
}
  getTasks(challenge: any): any[] {
    return challenge.tasks || [];
  }
}