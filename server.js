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
const FOOD_COUNT = 800;

// Yemek oluştur
for (let i = 0; i < FOOD_COUNT; i++) {
  food.push({
    x: Math.random() * WORLD_SIZE,
    y: Math.random() * WORLD_SIZE,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    size: 6
  });
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.emit('init', { id: socket.id, worldSize: WORLD_SIZE });

  socket.on('spawn', (data) => {
    const startX = Math.random() * WORLD_SIZE;
    const startY = Math.random() * WORLD_SIZE;
    players[socket.id] = {
      x: startX,
      y: startY,
      size: 20,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      name: data.name || 'Oyuncu',
      alive: true,
      targetX: startX,
      targetY: startY,
      cells: [{
        x: startX,
        y: startY,
        size: 20,
        splitTime: null
      }]
    };
    console.log('Player spawned:', data.name);
  });

  socket.on('split', () => {
    const player = players[socket.id];
    if (player && player.alive && player.size > 30 && player.cells.length < 16) {
      // En büyük hücreyi böl
      const cellsToSplit = [...player.cells].filter(c => c.size > 30);
      
      cellsToSplit.forEach(cell => {
        if (player.cells.length >= 16) return;
        
        const newSize = cell.size / 1.4;
        
        // Fare yönüne doğru
        const dx = player.targetX - cell.x;
        const dy = player.targetY - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
        
        // Yeni hücre oluştur - etrafta kalacak
        player.cells.push({
          x: cell.x + Math.cos(angle) * (newSize * 1.5),
          y: cell.y + Math.sin(angle) * (newSize * 1.5),
          size: newSize,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          splitTime: Date.now()
        });
        
        // Orijinal hücreyi küçült
        cell.size = newSize;
        cell.splitTime = Date.now();
      });
      
      // Toplam boyutu güncelle
      player.size = player.cells.reduce((sum, cell) => sum + cell.size, 0);
      
      console.log(`✅ ${player.name} split! Cells: ${player.cells.length}, Total size: ${player.size}`);
    }
  });

  socket.on('eject', () => {
    const player = players[socket.id];
    if (player && player.alive && player.size > 22) {
      // En büyük hücreden fırlat
      const mainCell = player.cells.reduce((max, cell) => cell.size > max.size ? cell : max, player.cells[0]);
      
      if (mainCell.size > 22) {
        mainCell.size -= 1.5;
        
        // Fare yönüne doğru fırlat
        const dx = player.targetX - mainCell.x;
        const dy = player.targetY - mainCell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
        const distance = mainCell.size + 40;
        
        food.push({
          x: mainCell.x + Math.cos(angle) * distance,
          y: mainCell.y + Math.sin(angle) * distance,
          color: player.color,
          size: 8,
          isEjected: true,
          mass: 2
        });
        
        // Toplam boyutu güncelle
        player.size = player.cells.reduce((sum, cell) => sum + cell.size, 0);
      }
    }
  });

  socket.on('move', (data) => {
    const player = players[socket.id];
    if (player && player.alive) {
      // Hedef pozisyonu kaydet
      player.targetX = data.x;
      player.targetY = data.y;
      
      // Her hücreyi hareket ettir
      player.cells.forEach(cell => {
        // Hız formülü
        const baseSpeed = 3.5;
        const speed = Math.max(1.5, baseSpeed - cell.size / 50);
        const dx = data.x - cell.x;
        const dy = data.y - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          cell.x += (dx / dist) * speed;
          cell.y += (dy / dist) * speed;
        }
        
        // Bölünme hızını azalt
        if (cell.vx || cell.vy) {
          cell.x += cell.vx;
          cell.y += cell.vy;
          cell.vx *= 0.85;
          cell.vy *= 0.85;
          if (Math.abs(cell.vx) < 0.1) cell.vx = 0;
          if (Math.abs(cell.vy) < 0.1) cell.vy = 0;
        }
        
        cell.x = Math.max(cell.size, Math.min(WORLD_SIZE - cell.size, cell.x));
        cell.y = Math.max(cell.size, Math.min(WORLD_SIZE - cell.size, cell.y));
      });
      
      // Hücreleri birleştir (30 saniye sonra)
      const now = Date.now();
      const MERGE_TIME = 30000; // 30 saniye
      
      for (let i = player.cells.length - 1; i > 0; i--) {
        const cell = player.cells[i];
        if (cell.splitTime && now - cell.splitTime > MERGE_TIME) {
          // Diğer hücrelerle birleşmeyi dene
          for (let j = 0; j < i; j++) {
            const other = player.cells[j];
            const dx = other.x - cell.x;
            const dy = other.y - cell.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Hücreler yakınsa birleştir
            if (dist < (cell.size + other.size) / 2) {
              other.size += cell.size;
              player.cells.splice(i, 1);
              console.log(`🔵 ${player.name} merged cells! Now ${player.cells.length} cells`);
              break;
            }
          }
        }
      }
      
      // Ana pozisyonu güncelle (en büyük hücre)
      const mainCell = player.cells.reduce((max, cell) => cell.size > max.size ? cell : max, player.cells[0]);
      player.x = mainCell.x;
      player.y = mainCell.y;

      // Yemek ye - her hücre için
      player.cells.forEach(cell => {
        for (let i = food.length - 1; i >= 0; i--) {
          const f = food[i];
          const fdx = f.x - cell.x;
          const fdy = f.y - cell.y;
          if (Math.sqrt(fdx * fdx + fdy * fdy) < cell.size) {
            food.splice(i, 1);
            cell.size += (f.mass || 0.5);
            
            // Sadece normal yemekleri yenile
            if (!f.isEjected) {
              food.push({
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: 6
              });
            }
          }
        }
      });
      
      // Toplam boyutu güncelle
      player.size = player.cells.reduce((sum, cell) => sum + cell.size, 0);

      // Oyuncuları ye - hücre bazlı
      for (const id in players) {
        if (id !== socket.id) {
          const other = players[id];
          if (other.alive) {
            player.cells.forEach((myCell, myIdx) => {
              other.cells.forEach((otherCell, otherIdx) => {
                const pdx = otherCell.x - myCell.x;
                const pdy = otherCell.y - myCell.y;
                const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                
                if (pdist < Math.abs(myCell.size - otherCell.size) / 2) {
                  if (myCell.size > otherCell.size * 1.15) {
                    myCell.size += otherCell.size * 0.8;
                    other.cells.splice(otherIdx, 1);
                    if (other.cells.length === 0) {
                      other.alive = false;
                      io.to(id).emit('dead');
                      console.log(`${player.name} ate ${other.name}`);
                    }
                  }
                }
              });
            });
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
  // Yemek sayısını sınırla (performans için)
  if (food.length > 1000) {
    food.splice(0, food.length - 1000);
  }
  io.emit('state', { players: alivePlayers, food });
}, 1000 / 30);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});
