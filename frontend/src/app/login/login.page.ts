import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { addIcons } from 'ionicons';
import { 
  logoGoogle,
  logOutOutline,
  personCircleOutline 
} from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    CommonModule
  ]
})
export class LoginPage implements OnInit {
  userEmail: string | null = null;
  public user: any
 
  public player: any

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,  private http: HttpClient
  ) {
    addIcons({ logoGoogle, logOutOutline, personCircleOutline });
  }
ngOnInit() {
      this.auth.user$.subscribe((data) => {
      this.user = data
      console.log(`Este es el user ${this.user}`);
     
      console.log(this.player)
    })

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
  }}