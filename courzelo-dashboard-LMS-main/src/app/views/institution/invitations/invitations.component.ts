import {Component, OnInit} from '@angular/core';
import {InstitutionService} from '../../../shared/services/institution/institution.service';
import {ResponseHandlerService} from '../../../shared/services/user/response-handler.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InvitationService} from '../../../shared/services/institution/invitation.service';
import {debounceTime} from 'rxjs/operators';
import {PaginatedInvitationsResponse} from '../../../shared/models/institution/PaginatedInvitationsResponse';
import {InstitutionResponse} from '../../../shared/models/institution/InstitutionResponse';
import {InvitationResponse} from '../../../shared/models/institution/InvitationResponse';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent implements OnInit {
  loadingInvitations = false;
  institutionID: string;
  _currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  searchControl: FormControl = new FormControl();
    currentInstitution: InstitutionResponse;
    currentInvitation: InvitationResponse;
    paginatedInvitations: PaginatedInvitationsResponse;
  constructor(
      private institutionService: InstitutionService,
      private invitationService: InvitationService,
      private handleResponse: ResponseHandlerService,
      private toastr: ToastrService,
      private route: ActivatedRoute,
      private modalService: NgbModal
  ) { }
    ngOnInit(): void {
      this.institutionID = this.route.snapshot.paramMap.get('institutionID');
        this.institutionService.getInstitutionByID(this.institutionID).subscribe(
            response => {
                this.currentInstitution = response;
            }
        );
      this.getInvitations(this.currentPage, this.itemsPerPage, null);
      this.searchControl.valueChanges
          .pipe(debounceTime(200))
          .subscribe(value => {
            this.getInvitations(1, this.itemsPerPage, value);
          });
    }
  get currentPage(): number {
    return this._currentPage;
  }
  set currentPage(value: number) {
    this._currentPage = value;
    if (this.searchControl.value == null) {
      this.getInvitations(this._currentPage, this.itemsPerPage, null);
    } else {
      this.getInvitations(this._currentPage, this.itemsPerPage, this.searchControl.value);
    }
  }
  resendInvitation(id: string) {
    this.loadingInvitations = true;
    this.invitationService.resendInvitation(id).subscribe(
        response => {
          this.toastr.success('Invitation resent successfully');
          this.getInvitations(this.currentPage, this.itemsPerPage, null);
        },
        error => {
          this.handleResponse.handleError(error);
          this.loadingInvitations = false;
        });
  }
    getInvitations(page: number, sizePerPage: number, keyword?: string) {
    this.loadingInvitations = true;
      this.invitationService.getInvitations(page - 1, sizePerPage, keyword, this.institutionID).subscribe(
          response => {
              console.log(response);
              response.invitations.forEach(
                  invitation => {
                      invitation.role = invitation.role.toLowerCase();
                  }
              );
              response.invitations.forEach(
                    invitation => {
                        if (Array.isArray(invitation.expiryDate)) {
                            const [year, month, day, hour, minute, second, nanosecond] = invitation.expiryDate;
                            invitation.expiryDate = new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
                        }
                        if (invitation.expiryDate <= new Date() && invitation.status === 'PENDING') {
                            invitation.status = 'EXPIRED';
                        }
                    }
              );
            this.paginatedInvitations = response;
            this.totalPages = response.totalPages;
            this.totalItems = response.totalItems;
            this._currentPage = response.currentPage + 1;
            this.loadingInvitations = false;
          },
          error => {
            this.handleResponse.handleError(error);
            this.loadingInvitations = false;
          }
      );
    }
    deleteInvitation(id: string) {
        this.loadingInvitations = true;
        this.invitationService.deleteInvitation(id).subscribe(
            response => {
                this.toastr.success('Invitation deleted successfully');
                this.getInvitations(this.currentPage, this.itemsPerPage, null);
            },
            error => {
                this.handleResponse.handleError(error);
                this.loadingInvitations = false;
            }
        );
    }
    modalConfirmFunction(content: any, invitation: InvitationResponse) {
        this.currentInvitation = invitation;
        this.modalService.open(content, { ariaLabelledBy: 'confirm Invitation', backdrop: false })
            .result.then((result) => {
            if (result === 'Ok') {
                this.deleteInvitation(this.currentInvitation.id);
                this.currentInvitation = null;
            }
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
}
