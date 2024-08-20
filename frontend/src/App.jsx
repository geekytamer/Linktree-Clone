import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

function Links() {
  const [links, setLinks] = useState([]);
  const [colors, setColors] = useState({
    background: "#f0f0f0", // Default background color
    font: "#000000", // Default font color
    button: "#cccccc", // Default button color
  });
  const [logoUrl, setLogoUrl] = useState(""); // State for logo URL
  const { username } = useParams(); // Get the username from the URL

  // Fetch links, colors, and logo from the server when the component mounts
  useEffect(() => {
    fetch(`http://127.0.0.1:8001/api/links/${username}`)
      .then((response) => response.json())
      .then((data) => {
        setLinks(data.links);
        setColors({
          background: data.user.background_color || "#f0f0f0",
          font: data.user.font_color || "#000000",
          button: data.user.button_color || "#cccccc",
        });
        setLogoUrl(data.user.logo_url || ""); // Set logo URL
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [username]);

  return (
    <div
      className="p-4 h-screen flex flex-col justify-center items-center"
      style={{ backgroundColor: colors.background, color: colors.font }}
    >
      {/* Display the logo */}
      {logoUrl && (
        <div className="mb-8">
          <img src={logoUrl} alt={`${username}'s logo`} className="h-24" />
        </div>
      )}

      {!logoUrl && (<button
        className="w-1/2 sm:w-1/3 lg:w-1/4 h-16 sm:h-12 lg:h-10 mb-20"
        style={{
          backgroundColor: colors.button,
          color: colors.font,
        }}
      >
        {username}
      </button>)}

      {links.map((link, index) => (
        <button
          key={index}
          className="w-1/2 sm:w-1/3 lg:w-1/4 h-16 sm:h-15 lg:h-12 mb-12 p-2 pl-5 flex items-center rounded-3xl"
          style={{
            backgroundColor: colors.button,
            color: colors.font,
          }}
          onClick={() => window.open(link.url, "_blank")}
        >
          <div className="w-1/4 items-center justify-center">
            {link.icon_url && (
              <img
                src={link.icon_url} // Assuming `link.icon` contains the URL of the icon
                alt=""
                className="h-10 w-10 rounded-none border-none"
                style={{ backgroundColor: "transparent" }} // Ensures no background color
              />
            )}
          </div>
          <div className=" w-2/3 flex items-center justify-center">
            {link.title}
          </div>
        </button>
      ))}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:username" element={<Links />} />
      </Routes>
    </Router>
  );
}

export default App;
