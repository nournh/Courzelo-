import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Mydata from '../../../../assets/CourzeloBusiness/json/industry.json';
import Swal from 'sweetalert2';
import { SkillsService } from 'src/app/shared/services/skills.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-upd-job-dialog',
  templateUrl: './upd-job-dialog.component.html',
  styleUrls: ['./upd-job-dialog.component.scss']
})
export class UpdJobDialogComponent implements OnInit {
  subIndustriesList: any[] = [];
  jobForm!: FormGroup;
  loading: boolean = false;
  jobTypes: string[] = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'];
  data: any;
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
    private dialogRef: MatDialogRef<UpdJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public jobData: any,
    private cdRef: ChangeDetectorRef
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];
    this.data = Mydata;
  }

  ngOnInit(): void {
    this.GetCountry();
    this.loadSkills();
    this.initializeForm();
    this.populateForm();
  }

  initializeForm(): void {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      deadlineDate: ['', [Validators.required, this.futureDateValidator]],
      startDate: ['', [Validators.required, this.futureDateValidator]],
      industry: ['', Validators.required],
      subIndustry: ['', Validators.required],
      creationDate: [new Date()],
      state: ['Active'],
      jobType: ['', Validators.required],
      schedulesType: ['', Validators.required],
      location: ['', [Validators.maxLength(200)]],
      country: ['', Validators.required],
      locationType: ['on site', Validators.required],
      requirement: this.fb.array([], [Validators.required]),
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

  populateForm(): void {
    const job = this.jobData.message;
    
    // Set simple values
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
      creationDate: job.creationDate,
      startDate: job.startDate,
      deadlineDate: job.deadlineDate,
      state: job.state,
      jobType: job.jobType,
      locationType: job.locationType,
      location: job.location,
      country: job.country,
      hireNumber: job.hireNumber,
      salary: job.salary,
      industry: job.industry,
      subIndustry: job.subIndustry,
      schedulesType: job.schedulesType,
      salaryOption: job.salaryOption,
      salaryRangeMax: job.salaryRangeMax,
      salaryRangeMin: job.salaryRangeMin,
      salaryStartAmout: job.salaryStartAmout,
      salaryCurrency: job.salaryCurrency,
      communication: job.communication
    });

    // Set requirements
    const requirements = this.jobForm.get('requirement') as FormArray;
    requirements.clear();
    if (job.requirement && Array.isArray(job.requirement)) {
      job.requirement.forEach((req: string) => {
        requirements.push(this.fb.control(req, [Validators.required, Validators.maxLength(200)]));
      });
    }

    // Set communication emails
    const commMails = this.jobForm.get('communicationMails') as FormArray;
    commMails.clear();
    if (job.communicationMails && Array.isArray(job.communicationMails)) {
      job.communicationMails.forEach((email: string) => {
        commMails.push(this.fb.control(email, [Validators.required, Validators.email]));
      });
    }

    // Load sub-industries based on industry
    this.onChange(job.industry);
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

  onSkillInputBlur(): void {
    setTimeout(() => {
      this.showSkillDropdown = false;
    }, 200);
  }

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

  onChange(selectedIndustry: string): void {
    const selectedIndustryData = this.data.industries.find(
      (industry: any) => industry.industry.industryName === selectedIndustry
    );
    
    this.subIndustriesList = selectedIndustryData ? selectedIndustryData.subIndustries : [];
    this.cdRef.detectChanges();
  }

  updateJob(): void {
    if (this.jobForm.invalid) {
      this.validateAllFormFields(this.jobForm);
      Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      return;
    }
  
    const updatedJob: JobOffersDTO = {
      ...this.jobData.message,
      ...this.jobForm.value,
      requirement: this.jobForm.value.requirement,
      communicationMails: this.jobForm.value.communicationMails
    };
    
    this.jobService.updateJob(updatedJob.idJob, updatedJob).subscribe({
      next: () => {
        Swal.fire('Success', 'Job offer updated successfully!', 'success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        Swal.fire('Error', 'Failed to update job offer', 'error');
        console.error(err);
      }
    });
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
}