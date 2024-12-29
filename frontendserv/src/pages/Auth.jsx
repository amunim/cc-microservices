import React, { useState } from 'react';
import { registerUser, loginUser } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Box, TextField, Button, Typography, Tabs, Tab, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const Auth = () => {
  const { setToken } = useAuth(); // Access the setToken function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleLogin = async () => {
    try {
      const { data } = await loginUser({ username, password });
      setToken(data.token); // Store the token in context
      alert('Login successful!');
    } catch (err) {
      console.log(err);
      alert('Login failed!');
    }
  };

  const handleRegister = async () => {
    try {
      const { data } = await registerUser({ username, password, name, phone, email });
      alert('Registration successful!');
      setTabIndex(0); // Switch to login tab after successful registration
    } catch (err) {
      console.log(err);
      alert('Registration failed!');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        padding: 3,
      }}
    >
      <Avatar sx={{ bgcolor: '#FF3B30', width: 56, height: 56, mb: 2 }}>
        <LockIcon />
      </Avatar>
      <Typography variant="h4" gutterBottom>
        Welcome
      </Typography>
      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} centered>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>
      {tabIndex === 0 ? (
        <Box
          sx={{
            width: 300,
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            sx={{
              bgcolor: '#FF3B30',
              ':hover': { bgcolor: '#FF1E0A' },
            }}
          >
            Login
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            width: 300,
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Phone"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRegister}
            sx={{
              bgcolor: '#FF3B30',
              ':hover': { bgcolor: '#FF1E0A' },
            }}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Auth;
