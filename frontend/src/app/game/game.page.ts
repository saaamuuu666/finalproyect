import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonButton,IonInput, IonText, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import socket from 'socket.io-client';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton,IonInput, IonText, IonItem, IonLabel, CommonModule, FormsModule
  ]
})
export class GamePage implements OnInit {
  room: any;
  cantidadCartones = 1;
  juegoIniciado = false;
  cartones: ({ numero: number, tachado: boolean } | null)[][][] = [];
  mensajesBingo: string[] = [];
  numerosDisponibles: number[] = [];
  numeroActual: number | null = null;
  numerosCantados: number[] = [];
  intervalo: any;
  socket: any;
  public host_url = 'https://backbingo.onrender.com';
  public player: any;
  public isHost: boolean = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.socket = socket(this.host_url);
    const params: any = this.route.snapshot.params;
    this.room = params['room'];
    this.player = JSON.parse(params.player);

    let info = {
      code: this.room,
      username: this.player.name,
      email: this.player.email
    };

    this.socket.emit("join_room", info.code);
    this.socket.on('user_list_' + info.code, (userList: string[]) => {
      console.log(`user list: ${userList}`);
    });

    this.resetNumeros();

    this.socket.on('set_host', () => {
      this.isHost = true;
    });

    this.socket.on('game_started', () => {
      this.empezarJuego();
    });

    this.socket.on('numero_actual', (numeroActual:number) => {
      this.numeroActual = numeroActual;
      
    });
  }

startGame() {
  this.socket.emit('start_game', this.room);
}

  resetNumeros() {
    this.numerosDisponibles = Array.from({ length: 90 }, (_, i) => i + 1);
  }

  generarCarton(): ({ numero: number, tachado: boolean } | null)[][] {
    let filas = 3;
    let columnas = 9;
    let carton: ({ numero: number, tachado: boolean } | null)[][] = Array.from({ length: filas }, () =>
      Array(columnas).fill(null)
    );

    let columnasConNumeros: number[][] = [];
    for (let i = 0; i < columnas; i++) {
      let min = i === 0 ? 1 : i * 10;
      let max = i === 8 ? 90 : i * 10 + 9;
      let cantidad = 1 + Math.floor(Math.random() * 2); // entre 1 y 2 números
      columnasConNumeros[i] = this.generarNumerosAleatorios(cantidad, min, max).sort((a, b) => a - b);
    }

    for (let col = 0; col < columnas; col++) {
      for (let n = 0; n < columnasConNumeros[col].length; n++) {
        let intentos = 0;
        while (intentos < 10) {
          let fila = Math.floor(Math.random() * filas);
          if (carton[fila][col] === null && carton[fila].filter(c => c !== null).length < 5) {
            carton[fila][col] = {
              numero: columnasConNumeros[col][n],
              tachado: false
            };
            break;
          }
          intentos++;
        }
      }
    }

    for (let f = 0; f < filas; f++) {
      let fila = carton[f];
      while (fila.filter(c => c !== null).length < 5) {
        let columnasDisponibles = fila
          .map((c, i) => (c === null ? i : -1))
          .filter(i => i !== -1);

        if (!columnasDisponibles.length) break;

        let col = columnasDisponibles[Math.floor(Math.random() * columnasDisponibles.length)];
        let min = col === 0 ? 1 : col * 10;
        let max = col === 8 ? 90 : col * 10 + 9;
        let nuevoNumero = this.generarNumerosAleatorios(1, min, max)[0];

        if (!carton.some(row => row[col]?.numero === nuevoNumero)) {
          fila[col] = { numero: nuevoNumero, tachado: false };
        }
      }
    }

    return carton;
  }

  generarNumerosAleatorios(cantidad: number, min: number, max: number): number[] {
    let nums: number[] = [];
    while (nums.length < cantidad) {
      let n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(n)) {
        nums.push(n);
      }
    }
    return nums;
  }

  empezarJuego() {
    this.resetNumeros();
    this.numeroActual = null;
    this.numerosCantados = [];
    this.juegoIniciado = true;
    this.cartones = [];
    this.mensajesBingo = [];

    for (let i = 0; i < this.cantidadCartones; i++) {
      this.cartones.push(this.generarCarton());
      this.mensajesBingo.push('');
    }

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    this.intervalo = setInterval(() => {
      if (this.numerosDisponibles.length === 0) {
        clearInterval(this.intervalo);
        return;
      }

      let index = Math.floor(Math.random() * this.numerosDisponibles.length);
      let numero = this.numerosDisponibles.splice(index, 1)[0];
      this.numeroActual = numero;
      this.numerosCantados.push(numero);
    }, 6000);
  }

  cantarBingo(index: number) {
    let carton = this.cartones[index];
    let todosTachadosValidos = carton.flat().every(celda =>
      !celda || (!celda.tachado || this.numerosCantados.includes(celda.numero))
    );

    let totalNumeros = carton.flat().filter(c => c !== null).length;
    let totalTachados = carton.flat().filter(c => c && c.tachado).length;

    if (todosTachadosValidos && totalTachados === totalNumeros) {
      this.mensajesBingo[index] = '¡Bingo correcto!';
      clearInterval(this.intervalo);
    } else {
      this.mensajesBingo[index] = 'Bingo incorrecto. Asegúrate de tachar solo números cantados.';
    }
  }

  toggleTachado(celda: { numero: number, tachado: boolean }) {
    celda.tachado = !celda.tachado;
  }
}