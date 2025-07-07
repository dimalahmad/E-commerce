const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function writeUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

exports.getAll = (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const users = readUsers();
    const { username, email, password, role } = req.body;
    
    // Validasi field wajib
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username wajib diisi' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email wajib diisi' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password wajib diisi' });
    }
    
    // Validasi email tidak boleh duplikat (case-insensitive)
    const trimmedEmail = email.trim().toLowerCase();
    if (users.find((u) => u.email.toLowerCase() === trimmedEmail)) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: trimmedEmail,
      password,
      role: role || 'konsumen',
      joinedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    const { username, email, password, role } = req.body;
    
    // Validasi field wajib
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username wajib diisi' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email wajib diisi' });
    }
    
    // Validasi email tidak boleh duplikat (case-insensitive, kecuali user yang sedang diedit)
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = users.find((u) => 
      u.email.toLowerCase() === trimmedEmail && 
      u.id != req.params.id
    );
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    
    users[idx] = {
      ...users[idx],
      username: username.trim(),
      email: trimmedEmail,
      password: password || users[idx].password,
      role: role || users[idx].role,
    };
    writeUsers(users);
    res.json(users[idx]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    let users = readUsers();
    const idx = users.findIndex((u) => u.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    const removed = users.splice(idx, 1);
    writeUsers(users);
    res.json({ message: 'User deleted', removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 