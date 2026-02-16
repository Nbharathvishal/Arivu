import React from 'react';
import User from './user';
import Register from './registration'
import Login from './Login'
import MainPage from './MainPage'
import ProfilePage from './ProfilePage';
import DocumentPage from './DocumentPage';
import NotesPage from './NotesPage';
import ForgetPage from './ResetPassword';
import { Routes, Route } from 'react-router-dom';



function App() {
  return (
    <Routes>
      <Route path="/" element={<User />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Login" element={<Login/>}/>
      <Route path="/MainPage" element={<MainPage/>}/>
      <Route path="/DocumentPage" element={<DocumentPage />}/>
      <Route path="/ProfilePage" element={<ProfilePage/>}/>
      <Route path="/NotesPage" element={<NotesPage/>}/>
      <Route path="/reset-password" element={<ForgetPage/>}/>
    </Routes>
  );
}

export default App;
