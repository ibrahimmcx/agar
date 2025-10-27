import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {};
const food = [];
const WORLD_SIZE = 3000;
const FOOD_COUNT = 300;

// Yemek oluştur
for (let i = 0; i < FOOD_COUNT; i++) {
  food.push({
    x: Math.random() * WORLD_SIZE,
    y: Math.random() * WORLD_SIZE,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  });
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.emit('init', { id: socket.id, worldSize: WORLD_SIZE });

  socket.on('spawn', (data) => {
    players[socket.id] = {
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      size: 20,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      name: data.name || 'Oyuncu',
      alive: true
    };
    console.log('Player spawned:', data.name);
  });

  socket.on('move', (data) => {
    const player = players[socket.id];
    if (player && player.alive) {
      const speed = Math.max(2, 5 - player.size / 30);
      const dx = data.x - player.x;
      const dy = data.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        player.x += (dx / dist) * speed;
        player.y += (dy / dist) * speed;
        player.x = Math.max(player.size, Math.min(WORLD_SIZE - player.size, player.x));
        player.y = Math.max(player.size, Math.min(WORLD_SIZE - player.size, player.y));
      }

      // Yemek ye
      for (let i = food.length - 1; i >= 0; i--) {
        const f = food[i];
        const fdx = f.x - player.x;
        const fdy = f.y - player.y;
        if (Math.sqrt(fdx * fdx + fdy * fdy) < player.size) {
          food.splice(i, 1);
          player.size += 0.5;
          food.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
          });
        }
      }

      // Oyuncuları ye
      for (const id in players) {
        if (id !== socket.id) {
          const other = players[id];
          if (other.alive) {
            const pdx = other.x - player.x;
            const pdy = other.y - player.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            
            if (pdist < Math.abs(player.size - other.size) / 2) {
              if (player.size > other.size * 1.15) {
                player.size += other.size * 0.3;
                other.alive = false;
                io.to(id).emit('dead');
                console.log(`${player.name} ate ${other.name}`);
              } else if (other.size > player.size * 1.15) {
                other.size += player.size * 0.3;
                player.alive = false;
                socket.emit('dead');
                console.log(`${other.name} ate ${player.name}`);
              }
            }
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    console.log('Player disconnected:', socket.id);
  });
});

setInterval(() => {
  const alivePlayers = {};
  for (const id in players) {
    if (players[id].alive) {
      alivePlayers[id] = players[id];
    }
  }
  io.emit('state', { players: alivePlayers, food });
}, 1000 / 30);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});
