import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';
import { CandidateAppService } from 'src/app/shared/services/candidate-app.service';
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-candidate-job',
  templateUrl: './candidate-job.component.html',
  styleUrls: ['./candidate-job.component.scss']
})
export class CandidateJobComponent implements OnInit {
  jobOffers: JobOffersDTO[] = [];
  filteredOffers: JobOffersDTO[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Search control
  searchControl = new FormControl('');
  
  // Filter controls
  jobTypeFilter = new FormControl('');
  locationTypeFilter = new FormControl('');
  industryFilter = new FormControl('');
  subIndustryFilter = new FormControl('');
  countryFilter = new FormControl('');
  salaryRangeFilter = new FormControl('');
  scheduleTypeFilter = new FormControl('');
  
  // Filter options
  jobTypeOptions: string[] = [];
  locationTypeOptions: string[] = ['on site', 'remote', 'mixed'];
  industryOptions: string[] = [];
  subIndustryOptions: string[] = [];
  countryOptions: string[] = [];
  scheduleTypeOptions: string[] = ['flexible', '8-hour shift', 'weekend availability', 'On call availability'];
  salaryRangeOptions: string[] = ['Under 5k', '5k - 10k', '10k - 15k', 'Over 15k'];

  constructor(
    private jobOfferService: JobOfferService,
    private candidateAppService: CandidateAppService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchJobOffers();
    
    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
      
    // Setup filter change listeners
    this.jobTypeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.locationTypeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.industryFilter.valueChanges.subscribe(() => {

      this.applyFilters();
    });
    this.subIndustryFilter.valueChanges.subscribe(() => this.applyFilters());
    this.countryFilter.valueChanges.subscribe(() => this.applyFilters());
    this.salaryRangeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.scheduleTypeFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  fetchJobOffers(): void {
    this.loading = true;
    this.jobOfferService.getAllJobs().subscribe({
      next: (data: JobOffersDTO[]) => {
        this.jobOffers = data;
        this.filteredOffers = [...data];
        this.extractFilterOptions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching job offers:', err);
        this.error = 'Failed to load job offers';
        this.loading = false;
      }
    });
  }

  extractFilterOptions(): void {
    // Extract unique values for filters from the job offers
    this.jobTypeOptions = [...new Set(this.jobOffers.map(job => job.jobType))];
    this.industryOptions = [...new Set(this.jobOffers.map(job => job.industry))];
    this.countryOptions = [...new Set(this.jobOffers.map(job => job.country))];
  }

 
  applyFilters(): void {
    let results = [...this.jobOffers];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      results = results.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        (job.businesss?.companyName && job.businesss.companyName.toLowerCase().includes(searchTerm)) ||
        (job.requirement && job.requirement.some(req => req.toLowerCase().includes(searchTerm)))
   ) }
    
    // Apply job type filter
    if (this.jobTypeFilter.value) {
      results = results.filter(job => job.jobType === this.jobTypeFilter.value);
    }
    
    // Apply location type filter
    if (this.locationTypeFilter.value) {
      results = results.filter(job => job.locationType === this.locationTypeFilter.value);
    }
    
    // Apply industry filter
    if (this.industryFilter.value) {
      results = results.filter(job => job.industry === this.industryFilter.value);
    }
    
    // Apply sub-industry filter
    if (this.subIndustryFilter.value) {
      results = results.filter(job => job.subIndustry === this.subIndustryFilter.value);
    }
    
    // Apply country filter
    if (this.countryFilter.value) {
      results = results.filter(job => job.country === this.countryFilter.value);
    }
    
    // Apply schedule type filter
    if (this.scheduleTypeFilter.value) {
      results = results.filter(job => job.schedulesType === this.scheduleTypeFilter.value);
    }
    
    // Apply salary range filter
    if (this.salaryRangeFilter.value) {
      switch(this.salaryRangeFilter.value) {
        case 'Under 5k':
          results = results.filter(job => job.salaryRangeMax < 5000);
          break;
        case '5k - 10k':
          results = results.filter(job => job.salaryRangeMax >= 5000 && job.salaryRangeMax <= 10000);
          break;
        case '10k - 15k':
          results = results.filter(job => job.salaryRangeMax > 10000 && job.salaryRangeMax <= 15000);
          break;
        case 'Over 15k':
          results = results.filter(job => job.salaryRangeMax > 15000);
          break;
      }
    }
    
    this.filteredOffers = results;
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.jobTypeFilter.setValue('');
    this.locationTypeFilter.setValue('');
    this.industryFilter.setValue('');
    this.subIndustryFilter.setValue('');
    this.countryFilter.setValue('');
    this.scheduleTypeFilter.setValue('');
    this.salaryRangeFilter.setValue('');
    this.filteredOffers = [...this.jobOffers];
  }

  viewDetails(job: JobOffersDTO): void {
    console.log('View details of job:', job);
  }

  applyToJob(idJob: string): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const idCandidate = user?.id;
  
    if (!idCandidate) {
      alert('Please log in first.');
      return;
    }
  
    this.router.navigate(['/apply-job', idJob, idCandidate]);
  }
}