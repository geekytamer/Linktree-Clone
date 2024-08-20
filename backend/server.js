import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database("./database.db");

app.set("view engine", "ejs");
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
// Create users and links tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    background_color TEXT,
    font_color TEXT,
    button_color TEXT,
    logo_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    url TEXT,
    icon_url TEXT,
    clicks INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Routes

// Home route to display links for a specific user
app.get("/:username", (req, res) => {
  const { username } = req.params;
  console.log(username);
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      console.error(err);
      res.status(404).send("User not found");
    } else {
      db.all(
        "SELECT * FROM links WHERE user_id = ?",
        [user.id],
        (err, rows) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            console.log(username)
            console.log({ links: rows, user });
            res.render("index", { links: rows, user });
          }
        }
      );
    }
  });
});

app.get("/api/links/:username", (req, res) => {
  const { username } = req.params;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      console.error(err);
      res.status(404).json({ error: "User not found" });
    } else {
      db.all(
        "SELECT title, url, icon_url FROM links WHERE user_id = ?",
        [user.id],
        (err, rows) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch links" });
          } else {
            res.json({links: rows, user: user });
          }
        }
      );
    }
  });
});

app.put("/api/links/:username/:linkId", (req, res) => {
  const { username, linkId } = req.params;
  const clickCount = 1; 
  console.log(`Updating click count for link ${linkId} by ${clickCount} for user: ${username}`);
  db.run(
    "UPDATE links SET clicks = clicks +? WHERE id =?",
    [clickCount, linkId],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to update click count");
      } else {
        res.json({ message: "Click count updated successfully" });
      }
    })
});

// Route to add a new link for a specific user
app.post("/:username/add", (req, res) => {
  const { username } = req.params;
  const { title, url, icon_url } = req.body;
  console.log(`Adding link: ${title} - ${url} for user: ${username}`);
  db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      console.error(err);
      res.status(404).send("User not found");
    } else {
      db.run(
        "INSERT INTO links (user_id, title, url, icon_url) VALUES (?, ?, ?, ?)",
        [user.id, title, url, icon_url],
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            res.status(201).send("Link added successfully");;
          }
        }
      );
    }
  });
});

// Route to create a new user
app.post("/create-user", (req, res) => {
    
  const { username, background_color, font_color, button_color, logo_url } = req.body;
  console.log(`Creating user: ${username}`);
  db.run("INSERT INTO users (username, background_color, font_color, button_color, logo_url) VALUES (?,?,?,?,?)", [username, background_color, font_color, button_color, logo_url], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("User creation failed");
    } else {
      res.status(201).send("User created successfully");
    }
  });
});

app.listen(8001, () => {
  console.log("Server is running on http://localhost:8001");
});
