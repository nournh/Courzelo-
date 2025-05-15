import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import Mydata from '../../../../assets/CourzeloBusiness/json/industry.json';
import { SkillsService } from 'src/app/shared/services/skills.service';

@Component({
  selector: 'app-add-job-dialog',
  templateUrl: './add-job-dialog.component.html',
  styleUrls: ['./add-job-dialog.component.scss']
})
export class AddJobDialogComponent implements OnInit {
  subIndustriesList: any[] = [];
  jobForm!: FormGroup;
  loading: boolean = false;
  jobTypes: string[] = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'];
  data: any;
  subIndustries: any;
  countries: any;
  minDate: string;
  maxDate: string;
  skills: string[] = [];
  filteredSkills: string[] = [];
  selectedSkill: string = '';
  showSkillDropdown: boolean = false;
  newManualRequirement: string = '';

  constructor(
    private fb: FormBuilder,
    private jobService: JobOfferService,
    private skillsService: SkillsService,
    private dialogRef: MatDialogRef<AddJobDialogComponent>,
    private cdRef: ChangeDetectorRef,
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.GetCountry();
    this.data = Mydata;
    this.loadSkills();
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      deadlineDate: ['', [Validators.required, this.futureDateValidator]],
      startDate: ['', [Validators.required, this.futureDateValidator]],
      industry: ['', Validators.required],
      subIndustry: ['', Validators.required], // Add this line
      creationDate: [new Date()],
      state: ['Active'],
      jobType: ['', Validators.required],
      schedulesType: ['', Validators.required],
      location: ['', [Validators.maxLength(200)]],
      country: ['', Validators.required],
      locationType: ['on site', Validators.required],
      requirement: this.fb.array([this.fb.control('', [Validators.required, Validators.maxLength(200)])]),
      hireNumber: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      salaryOption: ['Exact amount'],
      salary: [0, [Validators.min(0)]],
      salaryRangeMax: [0, [Validators.min(0)]],
      salaryRangeMin: [0, [Validators.min(0)]],
      salaryStartAmout: [0, [Validators.min(0)]],
      salaryCurrency: ['USD'],
      communication: [false],
      communicationMails: this.fb.array([])
    }, { validators: [this.dateRangeValidator, this.salaryRangeValidator] });
  }

  

  loadSkills(): void {
    this.skillsService.getAllSkills().subscribe(skills => {
      this.skills = skills;
      this.filteredSkills = [...skills];
    });
  }

  filterSkills(searchTerm: string): void {
    this.filteredSkills = this.skills.filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  toggleSkillDropdown(): void {
    this.showSkillDropdown = !this.showSkillDropdown;
  }

  selectSkill(skill: string): void {
    this.addRequirement(skill);
    this.selectedSkill = '';
    this.showSkillDropdown = false;
  }

  addCustomRequirement(): void {
    if (this.selectedSkill && this.selectedSkill.trim()) {
      this.addRequirement(this.selectedSkill.trim());
      this.selectedSkill = '';
    }
  }
  addManualRequirement(): void {
    if (this.newManualRequirement && this.newManualRequirement.trim()) {
      // Check if this requirement already exists
      const exists = this.requirements.controls.some(
        control => control.value.toLowerCase() === this.newManualRequirement.toLowerCase()
      );
      
      if (!exists) {
        this.addRequirement(this.newManualRequirement.trim());
        this.newManualRequirement = '';
      } else {
        Swal.fire('Info', 'This requirement already exists', 'info');
      }
    }
  }

  // ... (keep all other existing methods exactly the same)
  // Only the skills-related methods above are modified

  // Custom validators
  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  dateRangeValidator(form: FormGroup) {
    const startDate = form.get('startDate')?.value;
    const deadlineDate = form.get('deadlineDate')?.value;

    if (startDate && deadlineDate) {
      const start = new Date(startDate);
      const end = new Date(deadlineDate);
      
      if (start > end) {
        return { dateRange: true };
      }
    }
    return null;
  }

  salaryRangeValidator(form: FormGroup) {
    const salaryOption = form.get('salaryOption')?.value;
    const min = form.get('salaryRangeMin')?.value;
    const max = form.get('salaryRangeMax')?.value;

    if (salaryOption === 'Range' && min && max && min > max) {
      return { salaryRange: true };
    }
    return null;
  }

  get requirements(): FormArray {
    return this.jobForm.get('requirement') as FormArray;
  }

  GetCountry() {
    this.loading = true;
    this.jobService.GetCountries().subscribe({
      next: (res) => {
        this.countries = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
        this.loading = false;
      }
    });
  }

  private addRequirement(value: string): void {
    if (this.requirements.length < 10) {
      this.requirements.push(this.fb.control(value, [Validators.required, Validators.maxLength(200)]));
    } else {
      Swal.fire('Info', 'Maximum 10 requirements allowed', 'info');
    }
  }

  removeRequirement(index: number): void {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  get mails(): FormArray {
    return this.jobForm.get('communicationMails') as FormArray;
  }

  addMail(): void {
    if (this.mails.length < 5) {
      this.mails.push(this.fb.control('', [Validators.required, Validators.email]));
    } else {
      Swal.fire('Info', 'Maximum 5 email addresses allowed', 'info');
    }
  }

  removeMail(index: number): void {
    this.mails.removeAt(index);
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.validateAllFormFields(this.jobForm);
      Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      return;
    }
  
    const newJob: JobOffersDTO = {
      ...this.jobForm.value,
      creationDate: new Date()
    };
    
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const idBusiness = user?.id;
  
    if (idBusiness) {
      this.jobService.addJob(idBusiness, newJob).subscribe({
        next: () => {
          Swal.fire('Success', 'Job offer created successfully!', 'success');
          this.dialogRef.close(true);
        },
        error: (err) => {
          Swal.fire('Error', 'Failed to create job offer', 'error');
          console.error(err);
        }
      });
    } else {
      Swal.fire('Error', 'Recruiter ID not found', 'error');
    }
  }

  private validateAllFormFields(formGroup: FormGroup | FormArray): void {
    if (formGroup instanceof FormGroup) {
      Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.validateAllFormFields(control);
        } else {
          control?.markAsTouched();
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => {
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.validateAllFormFields(control);
        } else {
          control.markAsTouched();
        }
      });
    }
  }

  close(): void {
    if (this.jobForm.dirty) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to leave?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        cancelButtonText: 'No, stay'
      }).then((result) => {
        if (result.isConfirmed) {
          this.dialogRef.close(false);
        }
      });
    } else {
      this.dialogRef.close(false);
    }
  }

  onChange(selectedIndustry: string): void {
    // Find the selected industry in your data
    const selectedIndustryData = this.data.industries.find(
      (industry: any) => industry.industry.industryName === selectedIndustry
    );
    
    // Set the sub-industries for the selected industry
    this.subIndustriesList = selectedIndustryData ? selectedIndustryData.subIndustries : [];
    
    // Reset the sub-industry form control when industry changes
    this.jobForm.patchValue({ subIndustry: '' });
    this.cdRef.detectChanges();
  }
  }
