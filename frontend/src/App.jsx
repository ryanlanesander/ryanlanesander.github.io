import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import PixiBackground from './components/PixiBackground';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Games from './pages/Games';
import Login from './pages/Login';
import Register from './pages/Register';
import Write from './pages/Write';
import Admin from './pages/Admin';
import Webtoons from './pages/Webtoons';
import WebtoonSeries from './pages/WebtoonSeries';
import WebtoonReader from './pages/WebtoonReader';
import WebtoonUpload from './pages/WebtoonUpload';

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
          <Route path="/webtoons" element={<Webtoons />} />
          <Route path="/webtoons/upload" element={
            <ProtectedRoute allowedRoles={['OWNER', 'WRITER']}><WebtoonUpload /></ProtectedRoute>
          } />
          <Route path="/webtoons/:seriesId" element={<WebtoonSeries />} />
          <Route path="/webtoons/:seriesId/episodes/:episodeId" element={<WebtoonReader />} />
        </Routes>
      </Box>
    </Box>
  );
}
