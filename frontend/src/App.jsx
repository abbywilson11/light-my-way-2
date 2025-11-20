import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import Info from "./pages/Info/Info";
import SafetyTips from "./pages/SafetyTips/Safetytips";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/info" element={<Info />} />
        <Route path="/safety" element={<SafetyTips />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
