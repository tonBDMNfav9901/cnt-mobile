const express = require("express");
const cors = require("cors");
const path = require("path");
const { JSONFilePreset } = require("lowdb/node");

const PORT = 3000;

async function start() {
  const db = await JSONFilePreset(path.join(__dirname, "db.json"), {
    billets: [],
    signalements: [],
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Liste des billets
  app.get("/api/billets", (req, res) => {
    res.json(db.data.billets);
  });

  // Achat d'un billet (toujours simulé, aucun vrai paiement)
  app.post("/api/billets", async (req, res) => {
    const billet = { id: Date.now(), ...req.body };
    db.data.billets.push(billet);
    await db.write();
    res.json(billet);
  });

  // Liste des signalements
  app.get("/api/signalements", (req, res) => {
    res.json(db.data.signalements);
  });

  // Nouveau signalement
  app.post("/api/signalements", async (req, res) => {
    const s = { id: Date.now(), date: new Date().toISOString(), ...req.body };
    db.data.signalements.unshift(s);
    await db.write();
    res.json(s);
  });

  // Statistiques pour l'espace CNT
  app.get("/api/stats", (req, res) => {
    const parLigne = {};
    db.data.signalements.forEach((s) => {
      parLigne[s.ligne] = (parLigne[s.ligne] || 0) + 1;
    });
    res.json({
      totalBillets: db.data.billets.length,
      totalSignalements: db.data.signalements.length,
      signalementsParLigne: parLigne,
    });
  });

  app.listen(PORT, () =>
    console.log(`Serveur lancé sur http://localhost:${PORT}`),
  );
}

start();
