const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email dan password harus diisi' 
      });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Email atau password salah' 
      });
    }

    // Return user data (tanpa password) + dummy token
    const { password: _, ...userWithoutPassword } = user;
    const response = {
      user: userWithoutPassword,
      token: `dummy-token-${user.id}-${Date.now()}`,
      message: 'Login berhasil'
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Google OAuth Login/Register
exports.googleAuth = (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    if (!email || !name || !googleId) {
      return res.status(400).json({ 
        error: 'Data Google OAuth tidak lengkap' 
      });
    }

    const users = readUsers();
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Register user baru dengan Google
      const newUser = {
        id: (users.length + 1).toString(),
        username: name,
        email,
        password: 'google-oauth', // Password khusus untuk Google OAuth
        googleId: googleId,
        role: email === 'admin@gmail.com' ? 'admin' : 'konsumen', // Buat admin jika email tertentu
        joinedAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      user = newUser;
    } else if (!user.googleId) {
      // Email sudah ada tapi bukan dari Google OAuth (tidak ada googleId)
      return res.status(400).json({ 
        error: 'Email sudah terdaftar dengan metode lain' 
      });
    }

    // Return user data (tanpa password) + dummy token
    const { password: _, ...userWithoutPassword } = user;
    const response = {
      user: userWithoutPassword,
      token: `google-token-${user.id}-${Date.now()}`,
      message: user.googleId ? 'Login dengan Google berhasil' : 'Registrasi dengan Google berhasil'
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nama, email, dan password harus diisi' 
      });
    }

    // Validasi password
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password minimal 6 karakter' 
      });
    }

    const users = readUsers();
    
    // Cek email sudah terdaftar
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ 
        error: 'Email sudah terdaftar' 
      });
    }

    // Buat user baru
    const newUser = {
      id: (users.length + 1).toString(),
      username: name,
      email,
      password,
      role: 'konsumen',
      joinedAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Return user data (tanpa password) + dummy token
    const { password: _, ...userWithoutPassword } = newUser;
    const response = {
      user: userWithoutPassword,
      token: `dummy-token-${newUser.id}-${Date.now()}`,
      message: 'Registrasi berhasil'
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  try {
    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = (req, res) => {
  try {
    // Untuk sementara return dummy profile
    // Nanti bisa diimplementasikan dengan middleware auth
    res.json({ message: 'Profile endpoint' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 