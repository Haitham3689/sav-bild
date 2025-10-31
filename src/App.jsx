import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // States für Benutzer-Authentifizierung und Datei-Uploads
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  // Funktion zum Einloggen
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setIsLoggedIn(true);
      setMessage('Erfolgreich eingeloggt');
    } catch (error) {
      setMessage('Fehler bei der Anmeldung: ' + error.response?.data?.message || error.message);
    }
  };

  // Funktion zum Ausloggen
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessage('');
  };

  // Funktion für die Registrierung eines neuen Benutzers
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username,
        password,
      });
      setMessage('Benutzer erfolgreich registriert! Du kannst dich jetzt einloggen.');
    } catch (error) {
      setMessage('Fehler bei der Registrierung: ' + error.response?.data?.message || error.message);
    }
  };

  // Funktion zum Hochladen von Dateien
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (fileInput && fileInput.files) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
      }
      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUploadStatus('Dateien erfolgreich hochgeladen!');
        fetchFiles(); // Lade die Dateien nach dem Hochladen neu
      } catch (error) {
        setUploadStatus('Fehler beim Hochladen der Dateien');
        console.error(error);
      }
    }
  };

  // Funktion, um Dateien von der Server-API zu holen
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Fehler beim Abrufen der Dateien:', error);
    }
  };

  // Funktion zum Löschen einer Datei
  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="mt-4">رفع وعرض الملفات</h1>

      {!isLoggedIn ? (
        <div>
          {/* Sign-Up Formular */}
          <h2>تسجيل حساب جديد</h2>
          <form className="mt-4" onSubmit={handleSignup}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">اسم المستخدم</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">كلمة المرور</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">تسجيل</button>
          </form>

          {/* Login Formular */}
          <h2 className="mt-4">تسجيل الدخول</h2>
          <form className="mt-4" onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">اسم المستخدم a</label>
              <input
                type="text"
                id="loginUsername"
                name="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">كلمة المرور ap</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">تسجيل الدخول</button>
          </form>
        </div>
      ) : (
        <>
          <button className="btn btn-danger my-3" onClick={handleLogout}>تسجيل الخروج</button>

          {/* Datei-Upload Formular */}
          <form className="mb-4" onSubmit={handleFileUpload}>
            <div className="mb-3">
              <input
                type="file"
                ref={(input) => setFileInput(input)}
                multiple
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-success">رفع الملفات</button>
          </form>

          {uploadStatus && <p>{uploadStatus}</p>}

          <h2 className="mt-4">الملفات المرفوعة</h2>
          <ul className="list-group">
            {files.map((file) => (
              <li key={file._id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{file.originalName}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </div>
                <div>
                  <a href={`http://localhost:5000/files/${file._id}`} className="btn btn-info btn-sm" target="_blank" rel="noopener noreferrer">تحميل</a>
                  <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(file._id)}>حذف</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}

export default App;
