import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SkillsService } from 'src/app/shared/services/skills.service';

@Component({
  selector: 'app-edit-challenge',
  templateUrl: './edit-challenge.component.html',
  styleUrls: ['./edit-challenge.component.scss']
})
export class EditChallengeComponent implements OnInit {
  challengeForm: FormGroup;
  difficulties = ['Easy', 'Medium', 'Hard'];
  allSkills: string[] = [];
  requiredSkills: string[] = [];
  isLoadingSkills = false;
  skillSearch: string = '';
  filteredSkills: string[] = [];
  isSubmitting: boolean = false;
  showSkillsDropdown = false;

  constructor(
    private fb: FormBuilder,
    private challengeService: ChallengeService,
    private skillsService: SkillsService,
    private dialogRef: MatDialogRef<EditChallengeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { challenge: any }
  ) {
    this.challengeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      difficulty: ['', Validators.required],
      tasks: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAllSkills();
    this.initializeForm();
  }

  initializeForm(): void {
    if (this.data.challenge) {
      this.challengeForm.patchValue({
        title: this.data.challenge.title,
        description: this.data.challenge.description,
        difficulty: this.data.challenge.difficulty
      });

      this.requiredSkills = [...this.data.challenge.requiredSkills || []];

      // Clear existing tasks
      while (this.tasks.length !== 0) {
        this.tasks.removeAt(0);
      }

      // Add tasks from the challenge
      if (this.data.challenge.tasks && this.data.challenge.tasks.length > 0) {
        this.data.challenge.tasks.forEach(task => {
          this.tasks.push(this.fb.group({
            question: [task.question, Validators.required],
            expectedAnswer: [task.expectedAnswer, Validators.required]
          }));
        });
      } else {
        // Add at least one empty task if none exist
        this.addTask();
      }
    }
  }

  loadAllSkills(): void {
    this.isLoadingSkills = true;
    this.skillsService.getAllSkills().subscribe({
      next: (skills) => {
        this.allSkills = [...new Set(skills)];
        this.filteredSkills = [...this.allSkills];
        this.isLoadingSkills = false;
      },
      error: () => {
        this.isLoadingSkills = false;
      }
    });
  }

  onSkillSearchChange(value: string): void {
    this.skillSearch = value;
    this.filterSkills();
  }

  filterSkills(): void {
    const query = this.skillSearch.toLowerCase();
    this.filteredSkills = this.allSkills.filter(skill =>
      skill.toLowerCase().includes(query) && !this.requiredSkills.includes(skill)
    );
    this.showSkillsDropdown = true;
  }

  toggleSkillSelection(skill: string): void {
    if (this.requiredSkills.includes(skill)) {
      this.requiredSkills = this.requiredSkills.filter(s => s !== skill);
    } else {
      this.requiredSkills.push(skill);
    }
    this.skillSearch = '';
    this.filterSkills();
  }

  removeSkill(skill: string, event: Event): void {
    event.stopPropagation();
    this.requiredSkills = this.requiredSkills.filter(s => s !== skill);
    this.filterSkills();
  }

  createTask(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      expectedAnswer: ['', Validators.required]
    });
  }

  get tasks(): FormArray {
    return this.challengeForm.get('tasks') as FormArray;
  }

  addTask(): void {
    this.tasks.push(this.createTask());
  }

  removeTask(index: number): void {
    this.tasks.removeAt(index);
  }

  onSubmit(): void {
    if (this.challengeForm.valid && this.data.challenge) {
      this.isSubmitting = true;
      
      const challengeData = {
        ...this.challengeForm.value,
        requiredSkills: this.requiredSkills
      };

      this.challengeService.updateChallenge(this.data.challenge.id, challengeData).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error updating challenge', err);
          alert('Failed to update challenge. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      alert('Please fill out all required fields.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-input-container')) {
      this.showSkillsDropdown = false;
    }
  }
}