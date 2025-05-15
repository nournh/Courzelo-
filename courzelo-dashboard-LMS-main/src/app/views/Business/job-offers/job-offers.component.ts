import { Component, OnInit } from '@angular/core';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import { AddJobDialogComponent } from '../add-job-dialog/add-job-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ViewJobDialogComponent } from '../view-job-dialog/view-job-dialog.component';
import { UpdJobDialogComponent } from '../upd-job-dialog/upd-job-dialog.component';
import { ViewApplicationsDialogComponent } from '../view-applications-dialog/view-applications-dialog.component'; 
@Component({
  selector: 'app-job-offers',
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.scss']
})
export class JobOffersComponent implements OnInit {
  jobOffers: JobOffersDTO[] = [];
  filteredJobOffers: JobOffersDTO[] = [];
  startDate: string;
  endDate: string;
  pageSize = 5; // Number of items per page
currentPage = 1;
totalPages = 0;
pagedJobOffers: JobOffersDTO[] = []; 
  constructor(
    private jobOfferService: JobOfferService,
    private modalService: NgbModal,
    private route: Router,
    private diag: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadJobOffers();
  }
  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedJobOffers = this.filteredJobOffers.slice(start, end);
    this.totalPages = Math.max(1, Math.ceil(this.filteredJobOffers.length / this.pageSize));
    
    // Ensure currentPage is within bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.paginate(); // Recursive call with corrected page
    }
  }
  
  loadJobOffers(): void {
    this.jobOfferService.getAllJobs().subscribe((data: JobOffersDTO[]) => {
      console.log('Loaded jobs:', data); // Add this line
      this.jobOffers = data;
      this.filteredJobOffers = [...this.jobOffers];
      this.currentPage = 1;
      this.paginate();
    });
  }
  
  doFilter(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    this.filteredJobOffers = this.jobOffers.filter(job =>
      (job.title?.toLowerCase().includes(term) || '') ||
      (job.location?.toLowerCase().includes(term) || '')
    );
    this.currentPage = 1;
    this.paginate();
  }
  
  filterPeriod(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      this.filteredJobOffers = this.jobOffers.filter(job => {
        const date = new Date(job.creationDate).getTime();
        return date >= start && date <= end;
      });
      this.currentPage = 1;
      this.paginate();
    }
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  

  AddJobDialog(): void {
    this.diag.open(AddJobDialogComponent, {
      width: '900px',
      height: '750px',
      disableClose: true,
    }).afterClosed().subscribe(() => {
      this.loadJobOffers();
    });
  }

  DeleteJob(jobOffer: JobOffersDTO): void {
    Swal.fire({
      title: 'Confirm Delete',
      text: `Are you sure you want to delete "${jobOffer.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.jobOfferService.deleteJob(jobOffer.idJob).subscribe(() => {
          Swal.fire('Deleted', 'Job offer deleted successfully', 'success');
          this.loadJobOffers();
        });
      }
    });
  }

  UpdJob(jobOffer: JobOffersDTO): void {
    const jobCopy = Object.assign({}, jobOffer);
    this.diag.open(UpdJobDialogComponent, {
      width: '650px',
      height: 'auto',
      data: { message: jobCopy }
    }).afterClosed().subscribe(() => {
      this.loadJobOffers();
    });
  }

  ViewJob(jobOffer: JobOffersDTO): void {
    const jobCopy = Object.assign({}, jobOffer);
    this.diag.open(ViewJobDialogComponent, {
      width: '650px',
      height: 'auto',
      data: { message: jobCopy }
    }).afterClosed().subscribe(() => {
      this.loadJobOffers();
    });
  }

  viewApplications(jobOffer: any): void {
    this.route.navigate(['/view-applications', jobOffer.idJob]);
 
  }
  goToAddTest(jobId: string): void {
    this.route.navigate(['/add-test', jobId]);
  }
  check(): void {
    // Status filter logic if needed
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  
}
