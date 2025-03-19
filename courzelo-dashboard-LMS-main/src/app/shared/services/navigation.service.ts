import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SessionStorageService} from './user/session-storage.service';
import {UserResponse} from '../models/user/UserResponse';

export interface IMenuItem {
    id?: string;
    title?: string;
    description?: string;
    type: string;       // Possible values: link/dropDown/extLink
    name?: string;      // Used as display text for item and title for separator type
    state?: string;     // Router state
    icon?: string;      // Material icon name
    tooltip?: string;   // Tooltip text
    disabled?: boolean; // If true, item will not be appeared in sidenav.
    sub?: IChildItem[]; // Dropdown items
    badges?: IBadge[];
    active?: boolean;
    roles?: string[];
    mustBeInInstitutions?: boolean;
}
export interface IChildItem {
    id?: string;
    parentId?: string;
    type?: string;
    name: string;       // Display text
    state?: string;     // Router state
    icon?: string;
    sub?: IChildItem[];
    active?: boolean;
    roles?: string[];
    mustBeInInstitutions?: boolean;
}

interface IBadge {
    color: string;      // primary/accent/warn/hex color codes(#fff000)
    value: string;      // Display text
}

interface ISidebarState {
    sidenavOpen?: boolean;
    childnavOpen?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(private storageService: SessionStorageService) {
        this.user$ = this.storageService.getUser();
        this.user$.subscribe(user1 => {
            this.user = user1;
            console.log('User:', this.user);
            if (this.user) {
                this.setDefaultMenu();
                console.log('User is not null:', this.user);
                this.menuItems.next(this.filterMenuItemsByUser(this.defaultMenu, this.user));
            }
        });
    }
    public sidebarState: ISidebarState = {
        sidenavOpen: true,
        childnavOpen: false
    };
    selectedItem: IMenuItem;
    user: UserResponse = this.storageService.getUserFromSession();
    user$: Observable<UserResponse | null>;
    defaultMenu: IMenuItem[] = null;

    // sets iconMenu as default;
    menuItems = new BehaviorSubject<IMenuItem[]>(this.defaultMenu);
    // navigation component has subscribed to this Observable
    menuItems$ = this.menuItems.asObservable();
    setDefaultMenu() {
        this.defaultMenu = [
            {
                name: 'Dashboard',
                description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
                type: 'dropDown',
                icon: 'i-Bar-Chart',
                sub: [
                    { icon: 'fa fa-house', name: 'Home ', state: '/home', type: 'link' },
                    { icon: 'i-Clock', name: 'Acitivity ', state: '/dashboard/v5', type: 'link' },

                ]
            },
            {
                name: 'Timetable',
                description: '',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-File-Horizontal-Text', name: 'Generate Timetable', state: '/forms/Timetable', type: 'link' , roles: ['TEACHER'] },
                ]
            },
            {
                name: 'Project',
                description: '',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-File-Horizontal-Text', name: 'Project Dashboard', state: 'projects', type: 'link' , roles: ['STUDENT', 'TEACHER'] },
                    { icon: 'i-Full-View-Window', name: 'Projects', state: '/getallprojects', type: 'link', roles: ['TEACHER', 'STUDENT'] },
                ]
            },

            {
                name: 'Revision',
                description: '',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-File-Horizontal-Text', name: 'Revision Dashboard ', state: 'revision', type: 'link' , roles: ['STUDENT', 'TEACHER'] },
                    { icon: 'i-Full-View-Window', name: 'Revision', state: '/clientrevision', type: 'link' },
                ]
            },
            {
                name: 'Tools',
                description: 'Manage all users and institutions.',
                type: 'dropDown',
                icon: 'i-Gear-2',
                sub: [
                    { icon: 'i-Find-User', name: 'Users', state: '/tools/users', type: 'link' },
                    { icon: 'i-University', name: 'Institutions', state: '/tools/institutions', type: 'link' },
                ],
                roles: ['SUPERADMIN']
            },
            {
                name: this.user?.education?.institutionName,
                description: 'Access your institution\'s dashboard, manage users, classes, and more.',
                type: 'dropDown',
                icon: 'i-University',
                sub: [
                    { icon: 'i-Home1', name: 'Home', state: 'institution/' + this.user?.education?.institutionID,
                        type: 'link', mustBeInInstitutions: true },
                    { icon: 'i-Find-User', name: 'Users', state: 'institution/' + this.user?.education?.institutionID + '/users',
                        type: 'link', roles: ['ADMIN'], mustBeInInstitutions: true },
                    { icon: 'i-Mail-Send', name: 'Invitations', state: 'institution/' + this.user?.education?.institutionID +
                            '/invitations', type: 'link', roles: ['ADMIN'], mustBeInInstitutions: true },
                    { icon: 'fa fa-book', name: 'Programs', state: 'institution/' + this.user?.education?.institutionID + '/programs',
                        type: 'link', roles: ['ADMIN'], mustBeInInstitutions: true },
                    { icon: 'i-Student-Hat-2', name: 'Classes', state: 'institution/' + this.user?.education?.institutionID + '/classes',
                        type: 'link', roles: ['ADMIN'], mustBeInInstitutions: true },
                    { icon: 'i-Pen-2', name: 'Edit', state: 'institution/' + this.user?.education?.institutionID + '/edit',
                        type: 'link', roles: ['ADMIN'], mustBeInInstitutions: true },
                    { icon: 'i-Find-User', name: 'Forum', state: 'forum/' + this.user?.education?.institutionID,
                        type: 'link', mustBeInInstitutions: true },
                    ...(this.user?.education?.classrooms ? this.user.education.classrooms.map(course => ({
                        icon: 'i-Book',
                        name: course.classroomName,
                        state: 'institution/classroom/' + course.classroomID,
                        type: 'link',
                        mustBeInInstitutions: true
                    })) : [])
                ],
                mustBeInInstitutions: true
            },
            {
                name: 'Internships',
                description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
                type: 'dropDown',
                icon: 'i-Computer-Secure',
                sub: [
                    { icon: 'i-Add-File', name: 'Internship', state: '/stages/stages', type: 'link' }
                ]
            },
            {
                name: 'Transportation',
                description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
                type: 'dropDown',
                icon: 'i-Jeep',
                sub: [
                    { icon: 'i-Jeep', name: 'Transportation', state: '/transports/transports', type: 'link' }
                ]
            },
            {
                name: 'Profile',
                description: 'View your profile page.',
                state: '/pages/profile/' + this.user?.email,
                type: 'link',
                icon: 'i-Boy'
            },
            {
                name: 'Support',
                description: 'Support Menu',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-Support', name: 'Tickets', state: '/tickets/list', type: 'link' , roles: ['ADMIN'] },
                    { icon: 'i-Hand', name: 'FAQ', state: '/tickets/faq', type: 'link', roles: ['ADMIN'] },
                    { icon: 'i-Hand', name: 'FAQ', state: '/ticketsStudent/faq', type: 'link', roles: ['STUDENT'] },
                    { icon: 'i-Support', name: 'Support', state: '/ticketsStudent/list', type: 'link', roles: ['TEACHER', 'STUDENT'] },
                    { icon: 'icon-regular i-Mail-Reply', name: 'Mails', state: '/mailing', type: 'link' },
                ]
            },
            {
                name: 'Admission',
                description: 'Support Menu',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-Hand', name: 'Create Applications', state: '/admissionadmin', type: 'link', roles: ['ADMIN'] },
                    { icon: 'i-Hand', name: 'Show Applications', state: '/admissionadmin/list', type: 'link', roles: ['ADMIN'] },
                    { icon: 'i-Hand', name: 'Interviews', state: '/admissionteacher/list', type: 'link', roles: ['TEACHER', 'STUDENT'] },
                ]
            },
            {
                name: 'Social',
                description: 'Support Menu',
                type: 'dropDown',
                icon: 'i-File-Horizontal-Text',
                sub: [
                    { icon: 'i-Hand', name: 'Forums', state: '/forum/list', type: 'link', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
                    { icon: 'i-Hand', name: 'Groups Chat', state: '/chatgroups/chat', type: 'link', roles: ['TEACHER', 'STUDENT'] },
                ]
            },

        ];
    }
    filterMenuItemsByUser(menuItems: IMenuItem[], user: UserResponse): IMenuItem[] {
        console.log('Filtering menu items by user:', user);
        return menuItems.filter(item => {
            const accessibleByRole = (!item.roles || item.roles.some(role => user.roles.includes(role))) &&
                (!item.mustBeInInstitutions || (user.education.institutionName && user.education.institutionID));
            if (accessibleByRole && item.sub) {
                item.sub = this.filterChildItemsByRole(item.sub, user);
            }
            return accessibleByRole;
        });
    }
    filterChildItemsByRole(childItems: IChildItem[], user: UserResponse): IChildItem[] {
        return childItems.filter(item => {
            return (!item.roles || item.roles.some(role => user.roles.includes(role))) &&
                (!item.mustBeInInstitutions || (user.education.institutionName  && user.education.institutionID ));
        });
    }
    updateMenuItems(): void {
        const filteredMenu = this.filterMenuItemsByUser(this.defaultMenu, this.user);
        this.menuItems.next(filteredMenu);
    }

    // You can customize this method to supply different menu for
    // different user type.
    // publishNavigationChange(menuType: string) {
    //   switch (userType) {
    //     case 'admin':
    //       this.menuItems.next(this.adminMenu);
    //       break;
    //     case 'user':
    //       this.menuItems.next(this.userMenu);
    //       break;
    //     default:
    //       this.menuItems.next(this.defaultMenu);
    //   }
    // }
}
