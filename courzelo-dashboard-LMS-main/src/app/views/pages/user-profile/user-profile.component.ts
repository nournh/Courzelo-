import { Component, OnInit } from '@angular/core';
import { UserResponse } from '../../../shared/models/user/UserResponse';
import { SessionStorageService } from '../../../shared/services/user/session-storage.service';
import { UserService } from '../../../shared/services/user/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginResponse } from '../../../shared/models/user/LoginResponse';
import { ResponseHandlerService } from '../../../shared/services/user/response-handler.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  imageSrc: any;
  user: UserResponse;

  constructor(
    private sessionStorageService: SessionStorageService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private handleResponse: ResponseHandlerService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      let userEmail = params.get('email');  // Récupérer l'email de l'URL
  
      if (userEmail) {
        // 📌 Si un email est fourni dans l'URL, charger le profil de cet utilisateur
        this.loadUserProfile(userEmail);
      } else {
        // 📌 Sinon, charger le profil de l'utilisateur connecté
        const sessionUser = this.sessionStorageService.getUserFromSession();
        if (sessionUser && sessionUser.email) {
          this.loadUserProfile(sessionUser.email);
        } else {
          console.error("Aucun utilisateur en session !");
          this.router.navigateByUrl('/login'); // Rediriger vers la connexion si non connecté
        }
      }
    });
  }
  

  loadUserProfile(email: string) {
    this.userService.getUserProfileByEmail(email).subscribe(
      (user: LoginResponse) => {
        this.user = user.user;
        console.log(this.user); // Debug log to inspect the structure of the data

        // Load profile picture
        this.userService.getProfileImageBlobUrl(this.user.email).subscribe((blob: Blob) => {
          if (blob) {
            const objectURL = URL.createObjectURL(blob);
            this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }
        });
      },
      error => {
        this.handleResponse.handleError(error);
        this.router.navigateByUrl('/others/404');
      }
    );
  }
}
