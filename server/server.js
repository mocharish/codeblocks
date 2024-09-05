const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Create an instance of Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.io instance attached to the server
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST'],
  },
});

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000', // Allow CORS for this origin
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/codeBlocksDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a Mongoose schema and model for code blocks
const codeBlockSchema = new mongoose.Schema({
  title: String,
  code: String,
  original: String,
  solution: String,
});

const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

// Track users in each room
const roomUsers = {}; 

function normalizeCode(code) {
  return code.replace(/\s+/g, ' ').trim();
}

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  let currentRoom = null;

  // Handle joining a code block
  socket.on('joinCodeBlock', async (codeBlockId) => {
    if (currentRoom === codeBlockId) {
      // Prevent multiple joins by the same user
      console.log(`User ${socket.id} is already in room ${codeBlockId}`);
      return;
    }
    currentRoom = codeBlockId;
    socket.join(codeBlockId);

    // Initialize roomUsers if not already done
    if (!roomUsers[codeBlockId]) {
      roomUsers[codeBlockId] = { mentor: null, students: 0 };
    }

    // Check if this user was previously the mentor based on socket ID
    const isMentorRejoining = roomUsers[codeBlockId].mentor === socket.id;

    if (roomUsers[codeBlockId].mentor === null || isMentorRejoining) {
      // Either assign new mentor or reassign the previous mentor
      console.log(`Assigning mentor role to user ${socket.id}`);
      roomUsers[codeBlockId].mentor = socket.id;
      io.to(socket.id).emit('role', 'mentor');
    } else {
      console.log(`Assigning student role to user ${socket.id}`);
      roomUsers[codeBlockId].students += 1;
      io.to(socket.id).emit('role', 'student');
    }

    // Send the current code block to the user
    try {
      const codeBlock = await CodeBlock.findById(codeBlockId);
      if (codeBlock) {
        io.to(socket.id).emit('codeBlock', codeBlock);
      } else {
        io.to(socket.id).emit('codeBlock', { title: '', code: '' });
      }
    } catch (error) {
      console.error('Error fetching code block:', error);
    }

    // Broadcast the number of students to all users in the room
    io.to(codeBlockId).emit('studentCount', roomUsers[codeBlockId].students);

    // Handle code updates
    socket.on('updateCode', async (code) => {
      try {
        const codeBlock = await CodeBlock.findById(codeBlockId);
        if (codeBlock) {
          codeBlock.code = code;
          await codeBlock.save();
          socket.to(codeBlockId).emit('codeBlock', { title: codeBlock.title, code });

          // Check if the student's code matches the solution
          if (normalizeCode(code) === normalizeCode(codeBlock.solution)) {
            console.log('Solution matched for code block:', codeBlockId);
            io.to(codeBlockId).emit('solutionMatched', true);
          }
        }
      } catch (error) {
        console.error('Error updating code block:', error);
      }
    });

    // Handle disconnection
    // Handle disconnection
socket.on('disconnect', async () => {
    console.log(`User ${socket.id} disconnected from room ${currentRoom}`);
  
    if (currentRoom) {
      const room = io.sockets.adapter.rooms.get(currentRoom);
  
      if (roomUsers[currentRoom]) {
        if (roomUsers[currentRoom].mentor === socket.id) {
          console.log(`Mentor ${socket.id} left. Resetting code block and notifying students.`);
  
          try {
            // Fetch the code block from the database
            const codeBlock = await CodeBlock.findById(currentRoom);
            if (codeBlock) {
              // Reset the code block to its original state
              await CodeBlock.findByIdAndUpdate(currentRoom, { code: codeBlock.original });
              io.to(currentRoom).emit('mentorLeft', codeBlock.original);
            } else {
              console.error('Code block not found for room:', currentRoom);
            }
          } catch (error) {
            console.error('Error resetting code block:', error);
          }
  
          // Clear the mentor role
          roomUsers[currentRoom].mentor = null;
        } else {
          roomUsers[currentRoom].students -= 1;
          io.to(currentRoom).emit('studentCount', roomUsers[currentRoom].students);
        }
      }
  
      if (!room || room.size === 0) {
        console.log(`Room ${currentRoom} is now empty`);
        delete roomUsers[currentRoom];
      }
    }
  });
  
  });

  socket.on('leaveRoom', () => {
    console.log(`User ${socket.id} left the room`);
    socket.leave(currentRoom);
  });
});

// Endpoint to get all code blocks
app.get('/api/code-blocks', async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.json(codeBlocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch code blocks' });
  }
});

// Endpoint to get a single code block by ID
app.get('/api/code-blocks/:blockId', async (req, res) => {
  try {
    const { blockId } = req.params;
    const codeBlock = await CodeBlock.findById(blockId);
    if (codeBlock) {
      res.json(codeBlock);
    } else {
      res.status(404).json({ error: 'Code block not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch code block' });
  }
});

// Define the port for the server
const port = 3001;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
