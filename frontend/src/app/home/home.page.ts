import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,IonCardContent,IonIcon,IonCardSubtitle,IonCardHeader,IonCardTitle,IonHeader,IonTitle,IonCard,IonToolbar
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import socket from 'socket.io-client';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonContent,IonIcon, IonInput,IonCardSubtitle, IonGrid, IonRow, IonCol, IonButton,IonCardContent,IonCardHeader,IonCardTitle,IonHeader,IonTitle,IonCard,IonToolbar],
})
export class HomePage implements OnInit {
  socket: any;
  userEmail: string | null = null;
  public player: any;
  public host_url = 'https://backbingo.onrender.com';
   public user: any
    public url_host: string = 'https://backbingo.onrender.com';
      users: string[] = [];
  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private http: HttpClient ,
    private router: Router
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe((data) => {
      this.player = data;
      console.log('Usuario logueado:', this.player);
      this.user = {
        email : this.player.email,
        name : this.player.nickname
      }
      if (this.user?.email) {
       
       this.http.get(`${this.host_url}/players/${this.player.email}`).subscribe(
  (response) => {
    if (response === 'User not found') { // Cambiar comparación
      this.guardaruser();
    }
  }
);
      }
    });
     this.socket = socket(this.host_url);
      
  }

   logout() {
   
    this.router.navigate(['/login']);
  }

guardaruser() {
  const body = {
    id: this.user.email,
    nombre_usuario: this.user.name,
    dinero: 0 // Asegurar que siempre se envíe el campo
  };
  
  this.http.post(this.url_host + '/user', body).subscribe({
    next: (response) => {
      console.log('Usuario creado:', response);
    },
    error: (err) => {
      console.error('Error creando usuario:', err);
    }
  });
}
irsala() {
  // Pasar el objeto player como parámetro de estado
this.router.navigate(['/sala'], {
  queryParams: {
    player: JSON.stringify(this.player)
  }
});
}
crearjuego() {
  const room_num = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
  this.router.navigate(['/game', { room: room_num, player: JSON.stringify(this.player) }]);
}
}