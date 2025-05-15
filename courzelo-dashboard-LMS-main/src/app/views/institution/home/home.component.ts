import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import * as L from 'leaflet';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer} from '@angular/platform-browser';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {ClassroomService} from '../../../shared/services/institution/classroom.service';
import {ClassRoomRequest} from '../../../shared/models/institution/ClassRoomRequest';
import {AuthenticationService} from '../../../shared/services/user/authentication.service';
import {GroupResponse} from '../../../shared/models/institution/GroupResponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
      private institutionService: InstitutionService,
      private route: ActivatedRoute,
        private router: Router,
      private toastr: ToastrService,
      private sanitizer: DomSanitizer,
      private sessionstorage: SessionStorageService,
      private modalService: NgbModal,
      private formBuilder: FormBuilder,
      private courseService: ClassroomService,
      private authenticationService: AuthenticationService
  ) { }
  institutionID: string;
  isAdmin: boolean = false;
  imageSrc: any;
  loading = false;
    code: string;
  currentInstitution: InstitutionResponse;
  course: ClassRoomRequest = {} as ClassRoomRequest;
  teachers ;
  groups: GroupResponse[] = [];
  currentUser = this.sessionstorage.getUserFromSession();
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
    createCourseForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            credit: [0, [Validators.required]],
            teacher: ['', [Validators.required]],
            group: ['', [Validators.required]]
        }
    );
  ngOnInit() {
    const user = this.currentUser; // ou récupéré d’un service
  this.isAdmin = user?.roles?.includes('ADMIN');
    this.institutionID = this.route.snapshot.paramMap.get('institutionID');
      this.route.queryParams.subscribe(params => {
          this.code = params['code'];
      });
    this.institutionService.getInstitutionByID(this.institutionID).subscribe(
        response => {
          this.currentInstitution = response;
            if (this.code && this.currentInstitution) {
                this.institutionService.acceptInvite(this.code).subscribe(
                    res => {
                        this.toastr.success('You have successfully joined ' + this.currentInstitution.name);
                        this.authenticationService.refreshPageInfo();
                    },
                    error => {
                        if (error.status === 403) {
                            this.toastr.error('You do not have permission');
                        } else {
                            this.toastr.error(error.error);
                        }
                    }
                );
            } else {
                if (!this.code) {
                    console.log('No code');
                }
                if (!this.currentInstitution) {
                    console.log('No currentInstitution');
                    this.toastr.error('Institution not found');
                    this.router.navigateByUrl('dashboard/v1');
                }
            }
          console.log('currentInstitution', this.currentInstitution);
        }, error => {
          console.error(error);
          this.toastr.error(error.error);
            this.router.navigateByUrl('dashboard/v1');
        }
    );
      this.institutionService.getImageBlobUrl(this.institutionID).subscribe((blob: Blob) => {
          const objectURL = URL.createObjectURL(blob);
          this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      });

  }
    onTabChange(event: any) {
        if (event.nextId === 2) {
            this.toastr.info('Loading Map...');
            setTimeout(() => {
                this.initializeMap();
            }, 1000);
        }

        if (event.nextId === 4) {  // The numeric ID for the Tools tab
            setTimeout(() => {
                this.loadGroupsAndTeachers();
            }, 0);
        }
    }

  loadGroupsAndTeachers() {
    this.institutionService.getInstitutionGroups(this.institutionID).subscribe(
        response => {
          this.groups = response;
          console.log('groups', this.groups);
        },
        error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Error loading groups');
            }
          this.toastr.error('Error loading groups');
        }
    );
    this.institutionService.getInstitutionTeachers(this.institutionID).subscribe(
        response => {
          this.teachers = response;
          console.log('teachers', this.teachers);
        },
        error => {
            if (error.error) {
                this.toastr.error(error.error);
            } else {
                this.toastr.error('Error loading teachers');
            }
            this.toastr.error('Error loading teachers');
        }
    );
  }
  initializeMap() {
      if (this.currentInstitution.latitude === 0 || this.currentInstitution.longitude === 0 ||
        this.currentInstitution.latitude === undefined || this.currentInstitution.longitude === undefined) {
      this.toastr.warning('You Don\'t have a location set, setting default location.');
      this.currentInstitution.latitude = 36.7832;
      this.currentInstitution.longitude = 10.1843;
    }
    if (this.map) {
        this.map.remove();
    }
    this.map = L.map('map').setView([this.currentInstitution.latitude, this.currentInstitution.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
     L.marker([this.currentInstitution.latitude, this.currentInstitution.longitude], {
      draggable: false
    }).addTo(this.map);
  }
}
