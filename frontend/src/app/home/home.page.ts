import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,IonCardContent,IonCardSubtitle,IonCardHeader,IonCardTitle,IonHeader,IonTitle,IonCard,IonToolbar
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonInput,IonCardSubtitle, IonGrid, IonRow, IonCol, IonButton,IonCardContent,IonCardHeader,IonCardTitle,IonHeader,IonTitle,IonCard,IonToolbar],
})
export class HomePage implements OnInit {

  userEmail: string | null = null;
  public player: any;
  public host_url = 'http://localhost:3000';

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private http: HttpClient 
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe((data) => {
      this.player = data;
      console.log('Usuario logueado:', this.player);

      if (this.player?.email) {
       
        this.http.get(`${this.host_url}/player/${this.player.email}`)
          .subscribe((response) => {
            //1.1 Check if player exists on DB
            if ( response =='Player not found'){
              // 1.2 If player doesn't exist Create player
              //Navigate to create player page.
            } else {
                //1.3 If player exist.Load player Data
              }
            console.log('Respuesta del backend:', response);
          });
      }
    });
  }
}
