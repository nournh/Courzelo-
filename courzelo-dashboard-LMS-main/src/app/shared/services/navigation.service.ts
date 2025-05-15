import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SessionStorageService } from "./user/session-storage.service";
import { UserResponse } from "../models/user/UserResponse";

export interface IMenuItem {
  id?: string;
  title?: string;
  description?: string;
  type: string; // Possible values: link/dropDown/extLink
  name?: string; // Used as display text for item and title for separator type
  state?: string; // Router state
  icon?: string; // Material icon name
  tooltip?: string; // Tooltip text
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
  name: string; // Display text
  state?: string; // Router state
  icon?: string;
  sub?: IChildItem[];
  active?: boolean;
  roles?: string[];
  mustBeInInstitutions?: boolean;
  description?: string; // 👈 Ajoute ça ici

}

interface IBadge {
  color: string; // primary/accent/warn/hex color codes(#fff000)
  value: string; // Display text
}

interface ISidebarState {
  sidenavOpen?: boolean;
  childnavOpen?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  constructor(private storageService: SessionStorageService) {
    this.user$ = this.storageService.getUser();
    this.user$.subscribe((user1) => {
      this.user = user1;
      console.log("User:", this.user);
      if (this.user) {
        this.setDefaultMenu();
        console.log("User is not null:", this.user);
        this.menuItems.next(
          this.filterMenuItemsByUser(this.defaultMenu, this.user)
        );
      }
    });
  }
  public sidebarState: ISidebarState = {
    sidenavOpen: true,
    childnavOpen: false,
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
        name: "Administrator",
        description: "",
        type: "dropDown",
        icon: "i-Gear",
        sub: [
          {
            icon: "i-Dashboard", 
            name: "Dashboard",
            state: "/home",
            type: "link",
            roles: ["SUPERADMIN","ADMIN","TEACHER","STUDENT"]
          },
          {
            icon: "i-Add-User", 
            name: "Admin Management",
            state: "/tools/users",
            type: "link",
            roles: ["SUPERADMIN"]
          },
          
          {
            icon: "i-Library", // Departments
            name: "Departments",
            state: "test4",
            type: "link",
            roles: [ "ADMIN"]
          },
          
          {
            icon: "i-Money-Bag", // Finance
            name: "Financial",
            state: "test",
            type: "link",
            roles: ["SUPERADMIN"]
          },
          {
            icon: "i-Bell", // Reclamations
            name: "Reclamations",
            state: "/tools/reclamtions",
            type: "link",
            roles: ["SUPERADMIN"]
          },
          {
            icon: "i-Car-2", // Transport
            name: "Transportation & Restoration",
            state: "test3",
            type: "link",
            roles: ["ADMIN"]
          }
        ]
      }
          
,
          
,     
{
  name: "Educational",
  description: "",
  type: "dropDown",
  icon: "i-Book",
  sub: [
    // TEACHER: Voir l'institution à laquelle l'enseignant appartient
    ...(this.user?.roles.includes('TEACHER') && this.user.education?.institutionID ? [{
      name: 'Mon espace Enseignant',
      description: 'Consultez votre institution et accédez à ses ressources.',
      type: "dropDown",
      icon: "i-University",
      sub: [
         // { icon: 'i-Home1', name: 'Home', state: `institution/${this.user.education.institutionID}`, type: 'link' },
         //{ icon: 'fa fa-book', name: 'Programmes', state: `institution/${this.user.education.institutionID}/programs`, type: 'link' },
         //{ icon: 'fa fa-book', name: 'Mes Programmes', state: `institution/${this.user.education.institutionID}/programs`, type: 'link' },
        // {icon: "i-University", name: 'Programs',state: "/tools/programs",type: "link",roles: ["TEACHER"]},
        { icon: 'fa fa-book', name: 'Programs', state: 'institution/' + this.user.education.institutionID + '/teacher/programs', type: 'link' },

         { icon: 'i-Over-Time-2', name: 'Time Table', state: `institution/${this.user.education.institutionID}/programs`, type: 'link' },

         // 👇 Bloc Courses transformé
          {icon: 'i-Student-Hat-2',name: 'Courses',type: 'dropDown',sub: [
            ...(this.user.education.classrooms?.map(course => ({icon: 'i-Book',name: course.classroomName,state: `institution/classroom/${course.classroomID}`,type: 'link'})) || [])]},  
          { icon: 'i-Calendar', name: 'Calendar', state: `institution/${this.user.education.institutionID}/programs`, type: 'link' },

          { icon: 'i-Find-User', name: 'Forum', state: `forum/${this.user.education.institutionID}`, type: 'link' },
        ]
      
    }] : []),
    
    // student section
...(this.user?.roles.includes('STUDENT') ? [{
  name: 'Mon espace étudiant',
  description: 'Test affichage menu',
  type: "dropDown",
  icon: "i-Student-Hat-2",
  sub: [
   // { icon: 'fa fa-book', name: 'Programs', state: 'institution/' + this.user.education.institutionID + '/Student/programs', type: 'link' },

    // Dynamic classrooms for student
    ...(this.user.education.classrooms?.length ? [{
      name: 'Mes Cours',
      type: "dropDown",
      icon: "i-Classroom",
      sub: this.user.education.classrooms.map(classroom => ({
        icon: 'i-Book',
        name: classroom.classroomName,
        state: 'institution/classroom/' + classroom.classroomID,
        type: 'link'
      }))
    }] : []),

    // Keep other student menu items if needed
    { icon: 'i-Calendar', name: 'Calendar', type: 'link', state: 'student/calendar' },
    { icon: 'i-Find-User', name: 'Forum', type: 'link', state: 'forum/' + this.user.education.institutionID }
  ]
}] : []),
    
  
    
   /* // Pour TEACHER, STUDENT, SUPERADMIN (Courses, Forum, Profile)
    {
      icon: "i-Library",
      name: "Courses",
      state: "/courses",
      type: "link",
      roles: ["TEACHER", "STUDENT", "SUPERADMIN"],
    },
    {
      icon: "i-Speach-Bubble-3",
      name: "Forum",
      state: "/forum",
      type: "link",
      roles: ["TEACHER", "STUDENT", "SUPERADMIN"],
    },
    {
      icon: "i-Male",
      name: "Profile",
      state: "/profile",
      type: "link",
      roles: ["TEACHER", "STUDENT", "SUPERADMIN"],
    },*/


    // Cas SUPERADMIN pour institutions : gestion dynamique

    {
      icon: "i-University", 
      name: 'All Institutions',
      state: "/tools/institutions",
      type: "link",
      roles: ["SUPERADMIN"]
    },
    // Pour ADMIN et SUPERADMIN : menu par institution
    ...(this.user?.education?.institutionID && (this.user.roles.includes('ADMIN') || this.user.roles.includes('SUPERADMIN')) ? [{
      name: this.user.education.institutionName,
      description: 'Access your institution\'s dashboard, manage users, classes, and more.',
      type: "dropDown",
      icon: "i-University",
      sub: [
        { icon: 'i-Home1', name: 'Home', state: 'institution/' + this.user.education.institutionID, type: 'link' },
        { icon: 'i-Find-User', name: 'Users', state: 'institution/' + this.user.education.institutionID + '/users', type: 'link', roles: ['ADMIN'] },
        { icon: 'i-Mail-Send', name: 'Invitations', state: 'institution/' + this.user.education.institutionID + '/invitations', type: 'link', roles: ['ADMIN'] },
        { icon: 'fa fa-book', name: 'Programs', state: 'institution/' + this.user.education.institutionID + '/programs', type: 'link', roles: ['ADMIN'] },
        { icon: 'i-Student-Hat-2', name: 'Classes', state: 'institution/' + this.user.education.institutionID + '/classes', type: 'link', roles: ['ADMIN'] },
        { icon: 'i-Pen-2', name: 'Time Table', state: 'institution/' + this.user.education.institutionID + '/timetable', type: 'link', roles: ['ADMIN'] },
         { icon: 'i-Pen-2', name: 'Rooms', state: 'institution/' + this.user.education.institutionID + '/rooms', type: 'link', roles: ['ADMIN'] },
        { icon: 'i-Find-User', name: 'Forum', state: 'forum/' + this.user.education.institutionID, type: 'link' },
        ...(this.user.education.classrooms ? this.user.education.classrooms.map(course => ({
          icon: 'i-Book',
          name: course.classroomName,
          state: 'institution/classroom/' + course.classroomID,
          type: 'link'
        })) : [])
      ]
    }] : [])
  ]
},
  
  {
    name: "Professional",
    description: "",
    type: "dropDown",
    icon: "i-Suitcase", // Icône principale conservée
    sub: [
      {
        icon: "i-Business-Mens", // Jobs (anciennement i-Briefcase)
        name: "MyJobs",
        state: "/jobOffers",
        type: "link",
        roles: ["SUPERADMIN","PROFESSIONAL"],
      },

            
         {
            icon: "i-Business-Mens", 
           name: "JobOffers",
            state: "/CandidateJob",
           type: "link",
               roles: ["STUDENT", "TEACHER"],
      
    },
    {
      name: "My Applications",
      state: "/Myapplications",
      type: "link",
       roles: ["STUDENT", "TEACHER"],
    }
  

,
    {
        icon: "i-ID-Card", // Intership (anciennement i-Briefcase)
        name: "Tests",
        state: "/add-test",
        type: "link",
        roles: [ "SUPERADMIN","PROFESSIONAL"],
      },
    {
        icon: "i-Target", // Challenges
        name: "Challenges",
        state: "/recruiter/challenges",
        type: "link",
        roles: ["SUPERADMIN","PROFESSIONAL"],
      },
          {
        icon: "i-Target", // Challenges
        name: "Challenges",
        state: "/challenges",
        type: "link",
        roles: ["STUDENT"],
      },
           {
        icon: "i-Target", // Challenges
        name: "Assigned Challenges ",
        state: "/assigned-challenges",
        type: "link",
        roles: ["STUDENT"],
      },
      {
        icon: "i-Money-Bag", // Crowdfunding
        name: "CrowFunding",
        state: "/test4",
        type: "link",
        roles: [ "SUPERADMIN","STUDENT","PROFESSIONAL"],
      },
      {
        icon: "i-File-Edit", // Form
        name: "Forum",
        state: "/test5",
        type: "link",
        roles: ["STUDENT", "TEACHER", "SUPERADMIN","PROFESSIONAL"],
      },
      {
        icon: "i-Gear", // Skills
        name: "Skills",
        state: "/test6",
        type: "link",
        roles: ["STUDENT", "SUPERADMIN","PROFESSIONAL"],
      },
      {
        icon: "i-Checked-User", // Certifications
        name: "Certifications",
        state: "/test7",
        type: "link",
        roles: ["STUDENT", "TEACHER", "SUPERADMIN","PROFESSIONAL"],
      },
    ],
  }
  
    ];
  }
  filterMenuItemsByUser(
    menuItems: IMenuItem[],
    user: UserResponse
  ): IMenuItem[] {
    console.log("Filtering menu items by user:", user);
    return menuItems.filter((item) => {
      const accessibleByRole =
        (!item.roles || item.roles.some((role) => user.roles.includes(role))) &&
        (!item.mustBeInInstitutions ||
          (user.education.institutionName && user.education.institutionID));
      if (accessibleByRole && item.sub) {
        item.sub = this.filterChildItemsByRole(item.sub, user);
      }
      return accessibleByRole;
    });
  }
  filterChildItemsByRole(
    childItems: IChildItem[],
    user: UserResponse
  ): IChildItem[] {
    return childItems.filter((item) => {
      return (
        (!item.roles || item.roles.some((role) => user.roles.includes(role))) &&
        (!item.mustBeInInstitutions ||
          (user.education.institutionName && user.education.institutionID))
      );
    });
  }
  updateMenuItems(): void {
    const filteredMenu = this.filterMenuItemsByUser(
      this.defaultMenu,
      this.user
    );
    this.menuItems.next(filteredMenu);
  }
}