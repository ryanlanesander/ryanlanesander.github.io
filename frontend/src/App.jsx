import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import PixiBackground from './components/PixiBackground';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Tools from './pages/Tools';
import Games from './pages/Games';
import Login from './pages/Login';
import Register from './pages/Register';
import Write from './pages/Write';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Box minH="100vh" position="relative">
      <PixiBackground />
      <Navbar />
      <Box as="main" pt={4} pb={12}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/games" element={<Games />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/write" element={
            <ProtectedRoute allowedRoles={['OWNER', 'WRITER']}><Write /></ProtectedRoute>
          } />
          <Route path="/write/:slug" element={
            <ProtectedRoute allowedRoles={['OWNER', 'WRITER']}><Write /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['OWNER']}><Admin /></ProtectedRoute>
          } />
        </Routes>
      </Box>
    </Box>
  );
}
