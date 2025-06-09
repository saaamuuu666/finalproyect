// backend.ts

import express from "express";
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import * as db from './db-connection';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist/draw_board')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// --- INTERFACES ---

interface GameRoomState {
  numerosCantados: number[];       // números ya cantados
  numerosDisponibles: number[];    // números por cantar, orden aleatorio
  numeroActual: number | null;     // número actual cantado
  juegoTerminado: boolean;
  ganador: string | null;
  intervalo?: NodeJS.Timeout;
}

// --- DATOS GLOBALES ---

const users: { [roomCode: string]: Set<string> } = {};
const gameRooms: { [roomCode: string]: GameRoomState } = {};

// --- FUNCIONES AUXILIARES ---

function generarOrdenNumeros(): number[] {
  const numeros = Array.from({ length: 90 }, (_, i) => i + 1);
  for (let i = numeros.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
  }
  return numeros;
}

function generarNumerosAleatorios(cantidad: number, min: number, max: number): number[] {
  const numeros: Set<number> = new Set();
  while (numeros.size < cantidad) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numeros.add(num);
  }
  return Array.from(numeros);
}

export function generarCarton(): ({ numero: number, tachado: boolean } | null)[][] {
  const filas = 3;
  const columnas = 9;
  const carton: ({ numero: number, tachado: boolean } | null)[][] = Array.from({ length: filas }, () =>
    Array(columnas).fill(null)
  );

  const columnasConNumeros: number[][] = [];
  for (let i = 0; i < columnas; i++) {
    const min = i === 0 ? 1 : i * 10;
    const max = i === 8 ? 90 : i * 10 + 9;
    const cantidad = 1 + Math.floor(Math.random() * 2); // 1 o 2 números
    columnasConNumeros[i] = generarNumerosAleatorios(cantidad, min, max).sort((a, b) => a - b);
  }

  for (let col = 0; col < columnas; col++) {
    for (let n = 0; n < columnasConNumeros[col].length; n++) {
      let intentos = 0;
      while (intentos < 10) {
        const fila = Math.floor(Math.random() * filas);
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

  // Asegurar 5 números por fila
  for (let f = 0; f < filas; f++) {
    const fila = carton[f];
    while (fila.filter(c => c !== null).length < 5) {
      const columnasDisponibles = fila
        .map((c, i) => (c === null ? i : -1))
        .filter(i => i !== -1);

      if (!columnasDisponibles.length) break;

      const col = columnasDisponibles[Math.floor(Math.random() * columnasDisponibles.length)];
      const min = col === 0 ? 1 : col * 10;
      const max = col === 8 ? 90 : col * 10 + 9;
      let nuevoNumero = generarNumerosAleatorios(1, min, max)[0];

      if (!carton.some(row => row[col]?.numero === nuevoNumero)) {
        fila[col] = { numero: nuevoNumero, tachado: false };
      }
    }
  }

  return carton;
}

// --- RUTAS HTTP ---

app.get('/player/:id', async (req, res) => {
  try {
    const query = `SELECT * FROM players WHERE id='${req.params.id}'`;
    const db_response = await db.query(query);
    if (db_response.rows.length > 0) {
      res.json(db_response.rows[0]);
    } else {
      res.status(404).json({ message: "Player not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// --- SOCKET.IO ---

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    const room = socket.data.room_code;
    const user = socket.data.username;
    if (room && user && users[room]) {
      users[room].delete(user);
      if (users[room].size === 0) {
        // limpiar sala y juego
        delete users[room];
        if (gameRooms[room]?.intervalo) clearInterval(gameRooms[room].intervalo);
        delete gameRooms[room];
      } else {
        io.to(room).emit('user_list_' + room, Array.from(users[room]));
      }
    }
  });

  socket.on('join_room', ({ info }) => {
    const { code, user_name } = info;
    socket.join(code);
    socket.data.username = user_name;
    socket.data.room_code = code;

    if (!users[code]) users[code] = new Set();
    users[code].add(user_name);

    if (!gameRooms[code]) {
      gameRooms[code] = {
        numerosCantados: [],
        numerosDisponibles: generarOrdenNumeros(),
        numeroActual: null,
        juegoTerminado: false,
        ganador: null,
        intervalo: undefined,
      };

      // Lanzar números automáticamente cada 6 segundos
      gameRooms[code].intervalo = setInterval(() => {
      const room = gameRooms[code];
      if (!room) return;

      if (room.numerosDisponibles.length === 0) {
      if (room.intervalo) clearInterval(room.intervalo);
      room.juegoTerminado = true;
      io.to(code).emit('game_ended', { ganador: room.ganador || null });
      return;
  }

      const numero = room.numerosDisponibles.shift()!;
      room.numeroActual = numero;
      room.numerosCantados.push(numero);

    io.to(code).emit('numero_actual', {
      numeroActual: numero,
      numerosCantados: room.numerosCantados
  });

}, 6000);
    }

    io.to(code).emit('user_list_' + code, Array.from(users[code]));
  });

  socket.on('bingo_cantado', ({ roomCode, jugador }) => {
    const room = gameRooms[roomCode];
    if (!room || room.juegoTerminado) return;

    room.juegoTerminado = true;
    room.ganador = jugador;
    if (room.intervalo) clearInterval(room.intervalo);

    io.to(roomCode).emit('bingo_ganado', {
      ganador: jugador
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
