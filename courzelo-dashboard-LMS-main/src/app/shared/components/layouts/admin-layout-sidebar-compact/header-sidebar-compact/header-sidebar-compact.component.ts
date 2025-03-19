import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { SearchService } from 'src/app/shared/services/search.service';
import {AuthenticationService} from '../../../../services/user/authentication.service';
import {SessionStorageService} from '../../../../services/user/session-storage.service';
import {UserResponse} from '../../../../models/user/UserResponse';
import {UserService} from '../../../../services/user/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from "rxjs";

@Component({
  selector: 'app-header-sidebar-compact',
  templateUrl: './header-sidebar-compact.component.html',
  styleUrls: ['./header-sidebar-compact.component.scss']
})
export class HeaderSidebarCompactComponent implements OnInit {
  notifications: any[];

  constructor(
    private navService: NavigationService,
    public searchService: SearchService,
    private auth: AuthenticationService,
    private sessionStorageService: SessionStorageService,
    private userService: UserService,
    private sanitizer: DomSanitizer

  ) {
    this.notifications = [
      {
        icon: 'i-Speach-Bubble-6',
        title: 'New message',
        badge: '3',
        text: 'James: Hey! are you busy?',
        time: new Date(),
        status: 'primary',
        link: '/chat'
      },
      {
        icon: 'i-Receipt-3',
        title: 'New order received',
        badge: '$4036',
        text: '1 Headphone, 3 iPhone x',
        time: new Date('11/11/2018'),
        status: 'success',
        link: '/tables/full'
      },
      {
        icon: 'i-Empty-Box',
        title: 'Product out of stock',
        text: 'Headphone E67, R98, XL90, Q77',
        time: new Date('11/10/2018'),
        status: 'danger',
        link: '/tables/list'
      },
      {
        icon: 'i-Data-Power',
        title: 'Server up!',
        text: 'Server rebooted successfully',
        time: new Date('11/08/2018'),
        status: 'success',
        link: '/dashboard/v2'
      },
      {
        icon: 'i-Data-Block',
        title: 'Server down!',
        badge: 'Resolved',
        text: 'Region 1: Server crashed!',
        time: new Date('11/06/2018'),
        status: 'danger',
        link: '/dashboard/v3'
      }
    ];
  }
  imageSrc: any;
  user$: Observable<UserResponse | null>;
  ngOnInit() {
    this.user$ = this.sessionStorageService.getUser();
    this.user$.subscribe(user => {
      if (user && user.email) {
        this.userService.getProfileImageBlobUrl(user.email).subscribe((blob: Blob) => {
          if (blob != null) {
            const objectURL = URL.createObjectURL(blob);
            this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }
        });
      }
    });
  }

  toggelSidebar() {
    const state = this.navService.sidebarState;
    state.sidenavOpen = !state.sidenavOpen;
    state.childnavOpen = !state.childnavOpen;
  }
  signout() {
    this.auth.logoutImpl();
  }
}
