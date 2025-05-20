import { Component,Inject, OnInit } from '@angular/core';
import { CommonModule , DOCUMENT} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})
export class LoginPage implements OnInit {

 
  userEmail: string | null = null;

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user && user.email) {
        this.userEmail = user.email;
        console.log('Correo del usuario:', this.userEmail);
      }
    });
  }

  login() {
    this.auth.loginWithRedirect({
      appState: { target: '/home' }
    });
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: this.doc.location.origin
      }
    });
  }
}
