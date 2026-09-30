import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StarField from "./components/StarField";
import GlowOrbs from "./components/GlowOrbs";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import University from "./pages/University";
import Student from "./pages/Student";
import Verify from "./pages/Verify";

import Education from "./pages/Education";
import Government from "./pages/Government";
import Land from "./pages/Land";
import Healthcare from "./pages/Healthcare";

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col relative">
        <GlowOrbs />
        <StarField />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/university" element={<University />} />
              <Route path="/education" element={<Education />} />
              <Route path="/government" element={<Government />} />
              <Route path="/land" element={<Land />} />
              <Route path="/healthcare" element={<Healthcare />} />
              <Route path="/student" element={<Student />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:certId" element={<Verify />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </HashRouter>
  );
}