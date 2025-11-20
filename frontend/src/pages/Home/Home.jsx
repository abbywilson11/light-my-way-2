import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">

      {/* MAP SECTION */}
      <div className="map-container">
        <img src="/map-image.png" alt="map" /> 
        {/* replace with your map component if needed */}
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <i className="search-icon">🔍</i>
        <input type="text" placeholder="Search map" />
        <i className="mic-icon">🎤</i>
      </div>

    </div>
  );
}
