import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent,
  IonButton,
  IonInput,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonItem
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sala',
  templateUrl: './sala.page.html',
  styleUrls: ['./sala.page.scss'],
  standalone: true,
  imports: [
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent,
    IonGrid,
    IonCol,
    IonButton,
    IonInput,
    IonRow,
    IonIcon,
    IonItem,
    CommonModule,
    FormsModule
  ]
})
export class SalaPage implements OnInit {
  public roomCode: string = ''; // Variable para el código de sala
  public player: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['player']) {
      this.player = JSON.parse(queryParams['player']);
    }
    console.log(this.player);
  }

  joinRoom(roomNum?: number) {
    let roomCodeToJoin: string;
    
    // Si se proporciona un número de sala (desde los botones)
    if (roomNum !== undefined) {
      roomCodeToJoin = roomNum.toString();
    } 
    // Si se ha ingresado un código en el input
    else if (this.roomCode.trim() !== '') {
      roomCodeToJoin = this.roomCode.trim();
    } 
    // Si no hay nada, no hacer nada
    else {
      return;
    }

    this.router.navigate(['/game', {
      room: roomCodeToJoin,
      player: JSON.stringify(this.player)
    }]);
  }
}