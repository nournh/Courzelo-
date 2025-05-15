import { Injectable } from '@angular/core';
import { LocalStoreService } from './local-store.service';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated = false;

  constructor(private store: LocalStoreService, private router: Router) {
    this.checkAuth();
  }

  // Vérifie l'état d'authentification depuis le localStorage
  checkAuth() {
    const status = this.store.getItem('demo_login_status');
    this.authenticated = status === true;
  }

  // Retourne les infos de l'utilisateur courant (fictive ici)
  getUser(): Observable<any> {
    const user = this.store.getItem('current_user');
    return of(user || {});
  }

  // Simulation de connexion
  signin(credentials: { email: string, password: string }): Observable<any> {
    this.authenticated = true;
    this.store.setItem('demo_login_status', true);
    this.store.setItem('current_user', { email: credentials.email, role: 'admin' }); // tu peux adapter ici
    return of({ message: 'Connexion réussie' }).pipe(delay(1500));
  }

  // Déconnexion
 

  // Permet de récupérer directement le rôle depuis le localStorage
  getCurrentUserRole(): string | null {
    const user = this.store.getItem('current_user');
    return user ? user.role : null;
  }


  signout() {
    this.authenticated = false;
    this.store.setItem('demo_login_status', false);
    this.router.navigateByUrl('/sessions/signin');
  }
}
