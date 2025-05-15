import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/user/authentication.service';
import { HttpClient } from '@angular/common/http';
import { SignupB } from 'src/app/shared/models/user/requests/SignupB';
import { AuthBusiness } from 'src/app/shared/models/user/AuthBusiness';  // Adjust the path as per your project structure

@Component({
  selector: 'app-signup-b',
  templateUrl: './signup-b.component.html',
  styleUrls: ['./signup-b.component.scss']
})
export class SignupBComponent implements OnInit {

  recruiterForm: FormGroup;
  submitted = false;
  countries: string[] = ['USA', 'Canada', 'France', 'Germany'];  // Add your country list here
  industries: string[] = ['IT', 'Healthcare', 'Finance', 'Manufacturing'];  // Add your industry list here
  roles: string[] = ['HR Manager', 'Recruitment Specialist', 'Hiring Manager'];  // Add your roles here

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private router: Router,
              private http: HttpClient) { }

  ngOnInit(): void {
    this.recruiterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      matchingPassword: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      country: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      
      // AuthBusiness Fields
      companyName: ['', [Validators.required]],
      website: ['', []],
      nbEmployee: ['', []],

      recrutementRole: ['', []],
      phone: ['', []],
      industry: ['', []],
      address: ['', []],
      logo: ['', []],
      description: ['', []],
    });
  }

  get f() { return this.recruiterForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.recruiterForm.invalid) {
      return;
    }

    const formData = this.recruiterForm.value;

    const signupData = new SignupB();
    signupData.email = formData.email;
    signupData.password = formData.password;
    signupData.matchingPassword = formData.matchingPassword;
    signupData.name = formData.name;
    signupData.lastname = formData.lastname;
    signupData.birthDate = formData.birthDate;
    signupData.gender = formData.gender;
    signupData.country = formData.country;
    signupData.specialty = [formData.specialty];  // Assuming specialty is an array

    // Create AuthBusiness object and map fields
    signupData.authBusiness = new AuthBusiness();
    signupData.authBusiness.companyName = formData.companyName;
    signupData.authBusiness.website = formData.website;
    signupData.authBusiness.nbEmployee = formData.nbEmployee;
    signupData.authBusiness.firstName = formData.firstName;
    signupData.authBusiness.lastName = formData.lastName;
    signupData.authBusiness.recrutementRole = formData.recrutementRole;
    signupData.authBusiness.phone = formData.phone;
    signupData.authBusiness.industry = formData.industry;
    signupData.authBusiness.country = formData.country;
    signupData.authBusiness.address = formData.address;
    signupData.authBusiness.logo = formData.logo;
    signupData.authBusiness.description = formData.description;

    // Send the data to the backend to save the recruiter
    this.authService.signupProfessional(signupData).subscribe(response => {
      console.log('Recruiter registered successfully', response);
        // Save to localStorage so the ID is available later
  localStorage.setItem('userconnect', JSON.stringify(response));
      this.router.navigate(['/session/signin']);  // Redirect after successful registration
    }, error => {
      console.error('There was an error!', error);
    });
  }
}
