import { AuthBusiness } from "../AuthBusiness";

    export class SignupB {
        email!: string;
        password!: string;
        matchingPassword!: string;
        name!: string;
        lastname!: string;
        birthDate!: Date;
        gender!: string;
        country!: string;
        roles: string[] = [];
        specialty: string[] = [];
        authBusiness!: AuthBusiness;
        constructor() {
            this.authBusiness = new AuthBusiness();
          }}