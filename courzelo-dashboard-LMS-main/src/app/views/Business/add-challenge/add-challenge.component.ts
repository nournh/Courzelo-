import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SkillsService } from 'src/app/shared/services/skills.service';

@Component({
  selector: 'app-add-challenge',
  templateUrl: './add-challenge.component.html',
  styleUrls: ['./add-challenge.component.scss']
})
export class AddChallengeComponent implements OnInit {
  challengeForm: FormGroup;
  difficulties = ['Easy', 'Medium', 'Hard'];
  allSkills: string[] = [];
  requiredSkills: string[] = [];
  isLoadingSkills = false;
  skillSearch: string = '';
  filteredSkills: string[] = [];
  isSubmitting: boolean = false;
  showSkillsDropdown = false;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private challengeService: ChallengeService,
    private skillsService: SkillsService,
    private dialogRef: MatDialogRef<AddChallengeComponent>
  ) {
    // Set minimum date to today
    this.minDate = new Date().toISOString().split('T')[0];
    
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      difficulty: ['', Validators.required],
      deadline: ['', [this.futureDateValidator]],
      tasks: this.fb.array([this.createTask()], [Validators.required, Validators.minLength(1)]),
      requiredSkills: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  // Validator for future dates
  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadAllSkills();
  }

  loadAllSkills(): void {
    this.isLoadingSkills = true;
    this.skillsService.getAllSkills().subscribe({
      next: (skills) => {
        this.allSkills = [...new Set(skills)]; // Remove duplicates
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
    this.challengeForm.get('requiredSkills')?.setValue(this.requiredSkills);
  }

  removeSkill(skill: string, event: Event): void {
    event.stopPropagation();
    this.requiredSkills = this.requiredSkills.filter(s => s !== skill);
    this.challengeForm.get('requiredSkills')?.setValue(this.requiredSkills);
    this.filterSkills();
  }

  createTask(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required, Validators.maxLength(200)]],
      expectedAnswer: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  get tasks(): FormArray {
    return this.challengeForm.get('tasks') as FormArray;
  }

  addTask(): void {
    if (this.tasks.length < 10) { // Limite à 10 tâches maximum
      this.tasks.push(this.createTask());
    } else {
      alert('Maximum 10 tasks allowed');
    }
  }

  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.challengeForm.valid && this.requiredSkills.length > 0) {
      this.isSubmitting = true;
      const user = JSON.parse(sessionStorage.getItem('user')!);
      const recruiterId = user?.id;

      if (!recruiterId) {
        alert('Recruiter not identified. Please log in again.');
        this.isSubmitting = false;
        return;
      }

      const challengeData = {
        ...this.challengeForm.value,
        requiredSkills: this.requiredSkills
      };

      this.challengeService.addChallenge(challengeData, recruiterId).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error adding challenge', err);
          alert('Failed to add challenge. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.challengeForm);
      alert('Please fill out all required fields correctly.');
    }
  }

  // Helper to mark all fields as touched to show errors
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    if (this.challengeForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.dialogRef.close(false);
      }
    } else {
      this.dialogRef.close(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-input-container')) {
      this.showSkillsDropdown = false;
    }
  }
}