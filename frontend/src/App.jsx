import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

function Register() {
  const [formData, setFormData] = useState({
    uname: 'avnadmin',
    uemail: 'avnadmin@example.com',
    phon: '1234567890',
    password: 'YOUR_DATABASE_PASSWORD',
    confirmPassword: 'YOUR_DATABASE_PASSWORD'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        uname: formData.uname,
        uemail: formData.uemail,
        phon: formData.phon,
        password: formData.password
      });
      if (response.status === 201) {
        alert("Registration Success");
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="form-container signup-container">
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <input name="uname" placeholder="Username" value={formData.uname} onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="uemail" placeholder="Email" value={formData.uemail} onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="phon" placeholder="Phone Number" value={formData.phon} onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
        </div>
        <button type="submit" className="signup-btn">Create Account</button>
      </form>
      <div className="switch-link">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}

function Login() {
  const [formData, setFormData] = useState({
    uname: 'avnadmin',
    password: 'YOUR_DATABASE_PASSWORD'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, formData);
      if (response.status === 200) {
        alert("Login successful");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div className="form-container login-container">
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input name="uname" placeholder="Username" value={formData.uname} onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
      <div className="switch-link">
        <Link to="/">Go to Create Account</Link>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <div className="welcome-box" style={{ maxWidth: '400px', width: '100%' }}>
        <h1>Hello Welcome!</h1>
        <div style={{ marginTop: '20px' }}>
          <Link to="/database" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'underline' }}>
            View Aiven Database
          </Link>
        </div>
      </div>
    </div>
  );
}

function DatabasePage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="database-box" style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/dashboard" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'underline' }}>
            &larr; Back to Dashboard
          </Link>
        </div>
        <div style={{ color: '#000', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>AIVEN: MYSQL</div>
        <div className="db-inner">
          <div style={{ color: '#000', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>User</div>
          <table className="db-table">
            <thead>
              <tr>
                <th>uid</th>
                <th>uname</th>
                <th>uemail</th>
                <th>phon</th>
                <th>password</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.uid || i}>
                  <td>{user.uid}</td>
                  <td>{user.uname}</td>
                  <td style={{ color: '#000' }}>{user.uemail}</td>
                  <td>{user.phon}</td>
                  <td>{String(user.password).substring(0, 10)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/database" element={<DatabasePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
