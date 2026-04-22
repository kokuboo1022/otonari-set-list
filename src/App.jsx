import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SetlistPage from './pages/SetlistPage';
import SongsPage from './pages/SongsPage';
import MembersPage from './pages/MembersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setlist/:id" element={<SetlistPage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/members" element={<MembersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
