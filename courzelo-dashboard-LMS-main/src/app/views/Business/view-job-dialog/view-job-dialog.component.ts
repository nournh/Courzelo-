import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JobOffersDTO } from 'src/app/shared/models/JobOffers.model';
import * as Mydata from '../../../../assets/CourzeloBusiness/json/industry.json';
import { JobOfferService } from 'src/app/shared/services/job-offer.service';

@Component({
  selector: 'app-view-job-dialog',
  templateUrl: './view-job-dialog.component.html',
  styleUrls: ['./view-job-dialog.component.scss']
})
export class ViewJobDialogComponent implements OnInit {

  jobOffer!: JobOffersDTO;
  subIndustries: any;
  countries: any;
  theData: any;

  constructor(
    public dialogRef: MatDialogRef<ViewJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private JobsService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.theData = Mydata;
    this.jobOffer = this.data.message;
    this.loadCountries();
    this.setSubIndustries();
  }

  loadCountries() {
    this.JobsService.GetCountries().subscribe(res => {
      this.countries = res;
    });
  }

  setSubIndustries() {
    for (let i = 0; i < this.theData.industries.length; i++) {
      if (this.theData.industries[i].industry.industryName === this.jobOffer.industry) {
        this.subIndustries = this.theData.industries[i].subIndustries;
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
