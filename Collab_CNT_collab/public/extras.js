/* extras.js : Trajet (suivi en direct) et VTC. À charger APRÈS app.js */
window.VITESSE = window.VITESSE || 3; // démo : 1 minute simulée = 3 secondes

function etoileSvg(plein) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="${plein ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}

function fcfaT(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function couleurDeLigne(nom) {
  if (typeof couleurLigne === "function") return couleurLigne(nom);
  return (
    { "Ligne 1": "#0b7d4b", "Ligne 2": "#eab308", "Ligne 3": "#2563eb" }[nom] ||
    "#0b7d4b"
  );
}

function positionsUrbaines() {
  return {
    "Aéroport Léon-Mba": [0.4586, 9.4123],
    Akébé: [0.376, 9.462],
    "Centre-ville": [0.3925, 9.453],
    "Université Omar Bongo": [0.429, 9.499],
  };
}

function positionsVilles() {
  // Coordonnées approximatives
  return {
    Libreville: [0.4162, 9.4673],
    Lambaréné: [-0.7001, 10.2406],
    Mouila: [-1.8685, 11.0559],
    Lebamba: [-2.2, 11.5],
    Tchibanga: [-2.85, 11.03],
    Makokou: [0.5738, 12.8642],
    Oyem: [1.5993, 11.5793],
    Bitam: [2.0833, 11.4833],
  };
}

function dureesInter() {
  return {
    Lambaréné: 210,
    Mouila: 420,
    Lebamba: 480,
    Tchibanga: 600,
    Makokou: 570,
    Oyem: 420,
    Bitam: 480,
  };
}

function dureeHM(min) {
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

function arreterSuivi() {
  if (window.timerSuivi) {
    clearInterval(window.timerSuivi);
    window.timerSuivi = null;
  }
}

function entre(a, b, f) {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function lisseRoute(points) {
  const sortie = [];
  for (let s = 0; s < points.length - 1; s++) {
    const a = points[s],
      b = points[s + 1];
    const dx = b[0] - a[0],
      dy = b[1] - a[1];
    const lon = Math.hypot(dx, dy) || 1;
    const nx = -dy / lon,
      ny = dx / lon;
    const amp = lon * 0.06 * (s % 2 === 0 ? 1 : -1);
    for (let j = 0; j < 16; j++) {
      const t = j / 16;
      const off =
        amp * Math.sin(Math.PI * t) + amp * 0.35 * Math.sin(3 * Math.PI * t);
      sortie.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
    }
  }
  sortie.push(points[points.length - 1]);
  return sortie;
}

function lisser(u) {
  return u * u * (3 - 2 * u);
}

function surRoute(path, nbSeg, f) {
  const x = Math.min(Math.max(f, 0), 1) * nbSeg;
  const s = Math.min(Math.floor(x), nbSeg - 1);
  const g = (s + lisser(x - s)) * 16;
  const i = Math.min(Math.floor(g), path.length - 2);
  return { pos: entre(path[i], path[i + 1], g - i), i: i };
}

function couleurDegrade(f) {
  const pts = [
    [11, 125, 75],
    [234, 179, 8],
    [37, 99, 235],
    [11, 125, 75],
  ];
  const x = (((f % 1) + 1) % 1) * 3;
  const i = Math.min(Math.floor(x), 2);
  const u = x - i;
  const c = pts[i].map((v, k) => Math.round(v + (pts[i + 1][k] - v) * u));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function tracerDegrade(path, opacite) {
  const segs = [];
  for (let i = 0; i < path.length - 1; i++) {
    segs.push(
      L.polyline([path[i], path[i + 1]], {
        color: couleurDegrade((i / (path.length - 1)) * 0.66),
        weight: 6,
        opacity: opacite,
        lineCap: "round",
      }).addTo(carte),
    );
  }
  return segs;
}

function allumerSegments(segs, jusqua) {
  if (segs.dernier === jusqua) return;
  segs.dernier = jusqua;
  segs.forEach((sg, i) => sg.setStyle({ opacity: i <= jusqua ? 0.95 : 0.3 }));
}

/* ---------- Page Trajet ---------- */

function initTrajet() {
  const zone = document.getElementById("suiviChoix");
  if (!zone) return;
  const actifs = mesBillets.filter((b) => b.statut === "actif");
  zone.innerHTML = actifs.length
    ? '<h2>Mes trajets</h2><p class="gris">Choisissez le billet à suivre en direct</p>' +
      actifs
        .map(
          (b) => `
        <div class="carte billet-suivi" data-id="${b.id}">
          <div class="ligne"><span>${b.trajet}</span><span class="statut fluide">Suivre</span></div>
          <p class="gris">${b.ligne} · ${b.id}</p>
        </div>`,
        )
        .join("")
    : `<div class="carte"><p>Aucun billet actif.</p><p class="gris">Achetez un billet pour suivre votre véhicule en direct.</p></div>
       <button class="bouton plein" id="suiviAcheter" type="button">Acheter un billet</button>`;
  zone.querySelectorAll(".billet-suivi").forEach((c) => {
    c.addEventListener("click", () => ouvrirSuivi(c.dataset.id));
  });
  const acheter = document.getElementById("suiviAcheter");
  if (acheter) acheter.addEventListener("click", ouvrirRecherche);
  ajouterCarteVtc();
}

function preparerSuivi(b) {
  const [tD, tA] = b.trajet.split(" → ");
  if (String(b.ligne).startsWith("CNT Interurbain")) {
    const v = positionsVilles();
    const ville = tD === "Libreville" ? tA : tD;
    const duree = dureesInter()[ville];
    if (!v[tD] || !v[tA] || !duree) return null;
    return {
      nom: "CNT Interurbain",
      couleur: "#0b7d4b",
      ligneArrets: [tD, tA],
      chemin: [tD, tA],
      coord: v,
      attente: 10,
      inter: true,
      minParSeg: duree,
    };
  }
  const l = reseau.find((x) => x.nom === b.ligne);
  if (!l) return null;
  const trouver = (t) => l.arrets.findIndex((a) => a === t || a.startsWith(t));
  const iD = trouver(tD),
    iA = trouver(tA);
  if (iD < 0 || iA < 0 || iD === iA) return null;
  const sens = iA > iD ? 1 : -1;
  const chemin = [];
  for (let k = iD; k !== iA + sens; k += sens) chemin.push(l.arrets[k]);
  return {
    nom: l.nom,
    couleur: couleurDeLigne(l.nom),
    ligneArrets: l.arrets,
    chemin,
    coord: positionsUrbaines(),
    attente: l.attente,
    inter: false,
    minParSeg: 8,
    avant: l.arrets[iD - sens],
  };
}

function ouvrirSuivi(id) {
  arreterSuivi();
  if (carte) {
    carte.remove();
    carte = null;
  }
  const b = mesBillets.find((x) => x.id === id);
  const s = preparerSuivi(b);

  if (!s) {
    document.getElementById("app").innerHTML = `
      <button class="retour" type="button" id="retourSuivi">← Retour</button>
      <div class="carte"><p>Le suivi n'est pas disponible pour ce billet.</p></div>`;
    document
      .getElementById("retourSuivi")
      .addEventListener("click", () => afficherPage("trajet"));
    return;
  }

  const couleur = s.couleur;
  const chemin = s.chemin;
  const pts = chemin.map((a) => s.coord[a]);
  const nbSeg = chemin.length - 1;
  const route = lisseRoute(pts);
  const avantPos = s.avant
    ? s.coord[s.avant]
    : [pts[0][0] + 0.012, pts[0][1] - 0.012];
  const approche = lisseRoute([avantPos, pts[0]]);
  const total = nbSeg * s.minParSeg;
  const ligneComplete = lisseRoute(s.ligneArrets.map((a) => s.coord[a]));
  const nbSegLigne = s.ligneArrets.length - 1;
  const traversee = nbSegLigne * (s.inter ? 90 : 8 * VITESSE);
  const decalages = s.inter ? [0.3, 0.7] : [0.25, 0.55, 0.85];
  const fmt = (x) => (x >= 60 ? dureeHM(x) : `${x} min`);

  function posFlotte(dec, secondes) {
    let p = (secondes / traversee + dec) % 2;
    if (p > 1) p = 2 - p;
    return surRoute(ligneComplete, nbSegLigne, p).pos;
  }

  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourSuivi">← Retour</button>
    <div class="ligne-entete">
      <span class="pastille grande" style="background:${couleur}"></span>
      <h1>${s.nom}</h1>
    </div>
    <p class="gris">${b.trajet}</p>
    <div id="carte-suivi" class="carte-suivi"></div>
    <p class="legende-suivi">
      <span class="pt" style="background:#7c3aed"></span><span class="lg">Vous</span>
      <span class="pt degrade"></span><span class="lg">Votre véhicule</span>
      <span class="pt autre"></span><span class="lg">Autres véhicules</span>
    </p>
    <div class="carte" id="suiviPanneau"></div>
  `;
  document
    .getElementById("retourSuivi")
    .addEventListener("click", () => afficherPage("trajet"));

  carte = L.map("carte-suivi", { zoomControl: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "©️ OpenStreetMap",
  }).addTo(carte);
  L.polyline(route, { color: couleur, weight: 5, opacity: 0.3 }).addTo(carte);
  const parcouru = L.polyline([], {
    color: couleur,
    weight: 6,
    opacity: 0.95,
  }).addTo(carte);
  chemin.forEach((a, k) => {
    const m = L.circleMarker(s.coord[a], {
      radius: 8,
      color: couleur,
      weight: 3,
      fillColor: "#fff",
      fillOpacity: 1,
    }).addTo(carte);
    if (k === 0) m.bindTooltip("Départ", { permanent: true, direction: "top" });
    if (k === chemin.length - 1)
      m.bindTooltip("Arrivée", { permanent: true, direction: "top" });
  });
  const autres = decalages.map((dec) =>
    L.circleMarker(posFlotte(dec, 0), {
      radius: 6,
      color: "#fff",
      weight: 2,
      fillColor: couleur,
      fillOpacity: 1,
    }).addTo(carte),
  );
  const moi = L.marker(pts[0], {
    icon: L.divIcon({
      className: "",
      html: '<div class="moi"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
    zIndexOffset: 900,
  })
    .addTo(carte)
    .bindTooltip("Vous", { permanent: true, direction: "bottom" });
  const vehicule = L.marker(avantPos, {
    icon: L.divIcon({
      className: "",
      html: '<div class="vehicule"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    }),
    zIndexOffset: 1000,
  }).addTo(carte);
  carte.fitBounds(L.latLngBounds([avantPos].concat(route)), {
    padding: [32, 32],
  });
  setTimeout(() => {
    if (carte) carte.invalidateSize();
  }, 100);

  let phase = "attente";
  let debut = Date.now();
  const t0 = Date.now();
  let secParMin = VITESSE;
  let dernierTexte = 0;

  function panneauAttente() {
    document.getElementById("suiviPanneau").innerHTML = `
      <p class="ticket-label">Votre véhicule</p>
      <h2 class="suivi-titre" id="sTitre"></h2>
      <p class="gris" id="sDetail"></p>
      <div class="barre"><span id="sBarre"></span></div>
      <p class="gris">${decalages.length + 1} véhicules en circulation · ${s.nom}</p>
      <button class="bouton plein" id="btnBord" type="button" disabled>Je suis monté à bord</button>
    `;
    document.getElementById("btnBord").addEventListener("click", () => {
      phase = "bord";
      debut = Date.now();
      secParMin = s.inter ? 75 / total : VITESSE;
      dernierTexte = 0;
      panneauBord();
      tick();
    });
  }

  function panneauBord() {
    document.getElementById("suiviPanneau").innerHTML = `
      <p class="ticket-label">À bord</p>
      <h2 class="suivi-titre" id="sTitre"></h2>
      <p class="gris" id="sDetail"></p>
      <div class="barre"><span id="sBarre"></span></div>
      <ul class="arrets suivi-arrets">
        ${chemin.map((a, j) => `<li style="--c:${couleur}" data-j="${j}"><span class="arret-nom">${a}</span><span class="gris" data-eta></span></li>`).join("")}
      </ul>
      <button class="bouton plein" id="btnFin" type="button" hidden>Terminer le trajet</button>
    `;
    document
      .getElementById("btnFin")
      .addEventListener("click", () => afficherPage("trajet"));
  }

  function tick() {
    if (!carte || !document.getElementById("suiviPanneau")) {
      arreterSuivi();
      return;
    }
    const maintenant = Date.now();
    autres.forEach((mk, i) =>
      mk.setLatLng(posFlotte(decalages[i], (maintenant - t0) / 1000)),
    );
    const m = (maintenant - debut) / 1000 / secParMin;
    const texte = maintenant - dernierTexte > 400;
    if (texte) dernierTexte = maintenant;

    if (phase === "attente") {
      const f = Math.min(m / s.attente, 1);
      const restant = Math.max(0, s.attente - m);
      const arrive = restant <= 0;
      vehicule.setLatLng(surRoute(approche, 1, f).pos);
      if (texte) {
        document.getElementById("sTitre").textContent = arrive
          ? "Le véhicule est à votre arrêt"
          : `Arrive dans ${Math.ceil(restant)} min`;
        document.getElementById("sDetail").textContent = arrive
          ? `${s.nom} · ${chemin[0]}. Montez à bord.`
          : `${s.nom} en approche vers ${chemin[0]}`;
        document.getElementById("sBarre").style.width = f * 100 + "%";
        document.getElementById("btnBord").disabled = !arrive;
      }
      return;
    }

    const f = Math.min(m / total, 1);
    const r = surRoute(route, nbSeg, f);
    vehicule.setLatLng(r.pos);
    moi.setLatLng(r.pos);
    parcouru.setLatLngs(route.slice(0, r.i + 1).concat([r.pos]));
    if (!texte) return;
    const k = Math.min(Math.floor(m / s.minParSeg), chemin.length - 2);
    const termine = m >= total;
    const reste = Math.max(1, Math.ceil((k + 1) * s.minParSeg - m));
    document.getElementById("sTitre").textContent = termine
      ? "Vous êtes arrivé"
      : `Prochain arrêt : ${chemin[k + 1]}`;
    document.getElementById("sDetail").textContent = termine
      ? chemin[chemin.length - 1]
      : `dans ${fmt(reste)}` +
        (k + 1 === chemin.length - 1 && reste <= 15
          ? " · Préparez-vous à descendre"
          : "");
    document.getElementById("sBarre").style.width = f * 100 + "%";
    document.querySelectorAll(".suivi-arrets li").forEach((li) => {
      const j = Number(li.dataset.j);
      const passe = m >= j * s.minParSeg;
      li.classList.toggle("passe", passe);
      li.querySelector("[data-eta]").textContent = passe
        ? j === chemin.length - 1
          ? "Arrivé"
          : "Passé"
        : fmt(Math.ceil(j * s.minParSeg - m));
    });
    document.getElementById("btnFin").hidden = !termine;
  }

  panneauAttente();
  tick();
  window.timerSuivi = setInterval(tick, 33);
}

/* ---------- VTC ---------- */

function lieuxVtc() {
  // Coordonnées approximatives
  return {
    "Centre-ville": [0.3925, 9.453],
    "Aéroport Léon-Mba": [0.4586, 9.4123],
    Akébé: [0.376, 9.462],
    "Université Omar Bongo": [0.429, 9.499],
    "Nzeng-Ayong": [0.456, 9.496],
    Owendo: [0.297, 9.507],
    Glass: [0.413, 9.447],
    Louis: [0.398, 9.456],
    "Mont-Bouët": [0.399, 9.465],
    PK8: [0.486, 9.503],
    "Batterie IV": [0.4, 9.435],
  };
}

function typesVtc() {
  // Tarifs d'exemple : à remplacer par ceux de la CNT
  return [
    {
      id: "eco",
      nom: "Éco",
      desc: "Berline, 4 places",
      base: 1000,
      km: 350,
      attente: 4,
    },
    {
      id: "confort",
      nom: "Confort",
      desc: "Berline récente, clim",
      base: 1500,
      km: 450,
      attente: 6,
    },
    {
      id: "van",
      nom: "Van",
      desc: "6 places, bagages",
      base: 2000,
      km: 550,
      attente: 8,
    },
  ];
}

function distanceKm(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]),
    dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function estimerVtc(t, km) {
  return Math.max(1500, Math.round((t.base + t.km * km) / 100) * 100);
}

function verifTrajetVtc(d, a) {
  if (!d || !a) return "Choisissez une prise en charge et une destination.";
  if (d === a)
    return "La prise en charge et la destination doivent être différentes.";
  return "";
}

function etatVtc() {
  if (!window.vtcEtat) {
    const op =
      typeof lireProfil === "function"
        ? lireProfil().operateur
        : "Airtel Money";
    window.vtcEtat = {
      depart: "",
      arrivee: "",
      type: 0,
      paiement: op || "Airtel Money",
    };
  }
  return window.vtcEtat;
}

function ajouterCarteVtc() {
  const conteneur = document.getElementById("suiviChoix");
  if (!conteneur || document.getElementById("carteVtc")) return;
  const bloc = document.createElement("div");
  bloc.id = "carteVtc";
  bloc.className = "carte";
  bloc.innerHTML = `
    <div class="ligne"><span>Commander un VTC</span><span class="statut fluide">CNT</span></div>
    <p class="gris">Un chauffeur vient vous chercher, où que vous soyez à Libreville.</p>
    <button class="bouton plein" id="btnVtc" type="button">Commander</button>`;
  conteneur.parentNode.insertBefore(bloc, conteneur);
  document.getElementById("btnVtc").addEventListener("click", ouvrirVtc);
}

function ouvrirVtc() {
  arreterSuivi();
  if (carte) {
    carte.remove();
    carte = null;
  }
  const s = etatVtc();
  const noms = Object.keys(lieuxVtc());
  const opts = (titre, val) =>
    `<option value="">${titre}</option>` +
    noms
      .map((n) => `<option ${n === val ? "selected" : ""}>${n}</option>`)
      .join("");

  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourVtc">← Retour</button>
    <h1>Commander un VTC</h1>
    <div class="carte">
      <select class="champ" id="vtcDepart">${opts("Prise en charge", s.depart)}</select>
      <select class="champ" id="vtcArrivee">${opts("Destination", s.arrivee)}</select>
    </div>
    <h2>Véhicule</h2>
    <div id="vtcTypes"></div>
    <h2>Paiement</h2>
    <div class="segments" id="vtcPaiement">
      ${["Airtel Money", "Moov Money"].map((p) => `<button class="segment ${p === s.paiement ? "actif" : ""}" data-p="${p}" type="button">${p}</button>`).join("")}
    </div>
    <p class="erreur" id="vtcErreur"></p>
    <button class="bouton plein" id="vtcCommander" type="button">Commander</button>
  `;

  function rendreTypes() {
    const d = document.getElementById("vtcDepart").value;
    const a = document.getElementById("vtcArrivee").value;
    const pos = lieuxVtc();
    const ok = d && a && d !== a;
    const km = ok ? distanceKm(pos[d], pos[a]) * 1.35 : 0;
    document.getElementById("vtcTypes").innerHTML = typesVtc()
      .map(
        (t, i) => `
      <div class="carte choix vtc-type ${i === s.type ? "actif" : ""}" data-i="${i}">
        <div class="ligne"><span>${t.nom}</span><span>${ok ? fcfaT(estimerVtc(t, km)) : "—"}</span></div>
        <p class="gris">${t.desc} · ${t.attente} min d'attente${ok ? ` · ${km.toFixed(1)} km` : ""}</p>
      </div>`,
      )
      .join("");
    document.querySelectorAll(".vtc-type").forEach((c) => {
      c.addEventListener("click", () => {
        s.type = Number(c.dataset.i);
        rendreTypes();
      });
    });
  }

  ["vtcDepart", "vtcArrivee"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      s.depart = document.getElementById("vtcDepart").value;
      s.arrivee = document.getElementById("vtcArrivee").value;
      rendreTypes();
    });
  });
  document.querySelectorAll("#vtcPaiement .segment").forEach((b) => {
    b.addEventListener("click", () => {
      s.paiement = b.dataset.p;
      document
        .querySelectorAll("#vtcPaiement .segment")
        .forEach((x) => x.classList.remove("actif"));
      b.classList.add("actif");
    });
  });
  document
    .getElementById("retourVtc")
    .addEventListener("click", () => afficherPage("trajet"));
  document.getElementById("vtcCommander").addEventListener("click", () => {
    s.depart = document.getElementById("vtcDepart").value;
    s.arrivee = document.getElementById("vtcArrivee").value;
    const msg = verifTrajetVtc(s.depart, s.arrivee);
    document.getElementById("vtcErreur").textContent = msg;
    if (!msg) lancerVtc();
  });
  rendreTypes();
}

function lancerVtc() {
  arreterSuivi();
  if (carte) {
    carte.remove();
    carte = null;
  }
  const s = etatVtc();
  const lieux = lieuxVtc();
  const type = typesVtc()[s.type];
  const A = lieux[s.depart],
    B = lieux[s.arrivee];
  const km = distanceKm(A, B) * 1.35;
  const prix = estimerVtc(type, km);
  const dureeMin = Math.max(5, Math.round((km / 25) * 60));
  const voitures = {
    eco: ["Toyota Yaris · bleue", "Kia Rio · noire"],
    confort: ["Toyota Camry · grise", "Hyundai Sonata · blanche"],
    van: ["Toyota HiAce · blanche"],
  }[type.id];
  const noms = [
    "Jean-Paul M.",
    "Brice O.",
    "Sylvie N.",
    "Hervé B.",
    "Ornella K.",
  ];
  const chauffeur = {
    nom: noms[Math.floor(Math.random() * noms.length)],
    voiture: voitures[Math.floor(Math.random() * voitures.length)],
    plaque: "AB-" + (100 + Math.floor(Math.random() * 900)) + "-CD",
    note: (4.6 + Math.random() * 0.4).toFixed(1).replace(".", ","),
  };
  const initiales = chauffeur.nom
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);
  const couleur = "#0b7d4b";
  const route = lisseRoute([A, B]);
  const graines = [0, 1.7, 3.1, 4.6];
  const errant = (g, t) => [
    A[0] + 0.012 * Math.sin(0.35 * t + g) + 0.005 * Math.sin(0.9 * t + g * 2),
    A[1] + 0.012 * Math.cos(0.3 * t + g * 1.3) + 0.005 * Math.cos(0.8 * t + g),
  ];
  const texteFin =
    s.paiement === "Espèces"
      ? `À régler en espèces au chauffeur : ${fcfaT(prix)}`
      : `Paiement de ${fcfaT(prix)} confirmé via ${s.paiement}`;

  document.getElementById("app").innerHTML = `
    <h1>Votre VTC</h1>
    <p class="gris">${s.depart} → ${s.arrivee} · ${type.nom} · ${fcfaT(prix)}</p>
    <div id="carte-suivi" class="carte-suivi"></div>
    <p class="legende-suivi">
      <span class="pt" style="background:#7c3aed"></span><span class="lg">Vous</span>
      <span class="pt degrade"></span><span class="lg">Votre chauffeur</span>
      <span class="pt autre"></span><span class="lg">Autres chauffeurs</span>
    </p>
    <div class="carte" id="suiviPanneau"></div>
  `;

  carte = L.map("carte-suivi", { zoomControl: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "©️ OpenStreetMap",
  }).addTo(carte);
  const baseRoute = L.polyline(route, {
    color: "#9ca3af",
    weight: 4,
    opacity: 0.8,
    dashArray: "6 10",
  }).addTo(carte);
  L.circleMarker(A, {
    radius: 8,
    color: couleur,
    weight: 3,
    fillColor: "#fff",
    fillOpacity: 1,
  })
    .addTo(carte)
    .bindTooltip("Prise en charge", { permanent: true, direction: "top" });
  L.circleMarker(B, {
    radius: 8,
    color: couleur,
    weight: 3,
    fillColor: "#fff",
    fillOpacity: 1,
  })
    .addTo(carte)
    .bindTooltip("Destination", { permanent: true, direction: "top" });
  const autres = graines.map((g) =>
    L.circleMarker(errant(g, 0), {
      radius: 6,
      color: "#fff",
      weight: 2,
      fillColor: couleur,
      fillOpacity: 1,
    }).addTo(carte),
  );
  const moi = L.marker(A, {
    icon: L.divIcon({
      className: "",
      html: '<div class="moi"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
    zIndexOffset: 900,
  }).addTo(carte);
  carte.fitBounds(
    L.latLngBounds([
      A,
      B,
      [A[0] + 0.016, A[1] + 0.016],
      [A[0] - 0.016, A[1] - 0.016],
    ]),
    { padding: [24, 24] },
  );
  setTimeout(() => {
    if (carte) carte.invalidateSize();
  }, 100);

  let vehicule = null;
  let queue = [];
  let segsApproche = [];
  let segsCourse = [];
  let approche = null;
  let tV0 = 0;
  let phase = "recherche";
  const t0 = Date.now();
  let debut = t0;
  let secParMin = VITESSE;
  let dernierTexte = 0;

  const ligneChauffeur = `
    <div class="chauffeur">
      <div class="avatar petit">${initiales}</div>
      <div><strong>${chauffeur.nom}</strong><p class="gris">★ ${chauffeur.note} · ${chauffeur.voiture}</p></div>
      <span class="plaque">${chauffeur.plaque}</span>
    </div>`;

  function annuler() {
    afficherPage("trajet");
  }

  function majTrainee(path, f) {
    const ph = (((Date.now() - tV0) / 1000) % 6) / 6;
    queue.forEach((mk, k) => {
      const kk = k + 1;
      mk.setLatLng(surRoute(path, 1, Math.max(0, f - kk * 0.03)).pos);
      mk.setStyle({
        fillColor: couleurDegrade(ph - kk * 0.04),
        fillOpacity: Math.max(0.1, 0.85 - kk * 0.12),
      });
    });
  }

  function panneauRecherche() {
    document.getElementById("suiviPanneau").innerHTML = `
      <p class="ticket-label">Recherche</p>
      <h2 class="suivi-titre">Recherche d'un chauffeur…</h2>
      <p class="gris">${graines.length} chauffeurs à proximité</p>
      <div class="skeleton"></div>
      <button class="bouton secondaire plein" id="vtcAnnuler" type="button">Annuler</button>
    `;
    document.getElementById("vtcAnnuler").addEventListener("click", annuler);
  }

  function panneauApproche() {
    document.getElementById("suiviPanneau").innerHTML = `
      ${ligneChauffeur}
      <h2 class="suivi-titre" id="sTitre"></h2>
      <p class="gris" id="sDetail"></p>
      <div class="barre"><span id="sBarre"></span></div>
      <button class="bouton plein" id="vtcMonte" type="button" disabled>Je monte à bord</button>
      <button class="bouton secondaire plein" id="vtcAnnuler" type="button">Annuler la course</button>
    `;
    document.getElementById("vtcAnnuler").addEventListener("click", annuler);
    document.getElementById("vtcMonte").addEventListener("click", () => {
      phase = "course";
      debut = Date.now();
      secParMin = 45 / dureeMin;
      dernierTexte = 0;
      segsApproche.forEach((sg) => carte.removeLayer(sg));
      carte.removeLayer(baseRoute);
      segsCourse = tracerDegrade(route, 0.3);
      panneauCourse();
      tick();
    });
  }

  function panneauCourse() {
    document.getElementById("suiviPanneau").innerHTML = `
      ${ligneChauffeur}
      <h2 class="suivi-titre" id="sTitre"></h2>
      <p class="gris" id="sDetail"></p>
      <div class="barre"><span id="sBarre"></span></div>
      <div id="vtcFin" hidden>
        <p class="paiement-ok">${texteFin}</p>
        <p class="gris">Notez votre chauffeur</p>
        <div class="notes">${[1, 2, 3, 4, 5].map((n) => `<button class="etoile" data-n="${n}" type="button">${etoileSvg(false)}</button>`).join("")}</div>
        <button class="bouton plein" id="vtcTerminer" type="button">Terminer</button>
      </div>
    `;
    document.querySelectorAll(".notes .etoile").forEach((b) => {
      b.addEventListener("click", () => {
        const choix = Number(b.dataset.n);
        document.querySelectorAll(".notes .etoile").forEach((x) => {
          const n = Number(x.dataset.n);
          x.classList.toggle("actif", n <= choix);
          x.innerHTML = etoileSvg(n <= choix);
        });
      });
    });
    document.getElementById("vtcTerminer").addEventListener("click", annuler);
  }

  function tick() {
    if (!carte || !document.getElementById("suiviPanneau")) {
      arreterSuivi();
      return;
    }
    const maintenant = Date.now();
    const t = (maintenant - t0) / 1000;
    autres.forEach((mk, i) => {
      if (!(i === 0 && phase !== "recherche"))
        mk.setLatLng(errant(graines[i], t));
    });
    const m = (maintenant - debut) / 1000 / secParMin;
    const texte = maintenant - dernierTexte > 400;
    if (texte) dernierTexte = maintenant;

    if (phase === "recherche") {
      if (t >= 3.5) {
        const p0 = errant(graines[0], t);
        carte.removeLayer(autres[0]);
        approche = lisseRoute([p0, A]);
        segsApproche = tracerDegrade(approche, 0.3);
        tV0 = maintenant;
        vehicule = L.marker(p0, {
          icon: L.divIcon({
            className: "",
            html: '<div class="vehicule"></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          zIndexOffset: 1000,
        }).addTo(carte);
        queue = [1, 2, 3, 4, 5, 6].map((k) =>
          L.circleMarker(p0, {
            radius: 7 - k * 0.9,
            stroke: false,
            fillColor: couleur,
            fillOpacity: 0.7,
          }).addTo(carte),
        );
        carte.fitBounds(L.latLngBounds([p0, A, B]), { padding: [32, 32] });
        phase = "approche";
        debut = maintenant;
        secParMin = VITESSE;
        dernierTexte = 0;
        panneauApproche();
        tick();
      }
      return;
    }

    if (phase === "approche") {
      const f = Math.min(m / type.attente, 1);
      const restant = Math.max(0, type.attente - m);
      const arrive = restant <= 0;
      const r = surRoute(approche, 1, f);
      vehicule.setLatLng(r.pos);
      majTrainee(approche, f);
      allumerSegments(segsApproche, r.i);
      if (texte) {
        document.getElementById("sTitre").textContent = arrive
          ? "Votre chauffeur est arrivé"
          : `Arrive dans ${Math.ceil(restant)} min`;
        document.getElementById("sDetail").textContent = arrive
          ? `${chauffeur.voiture} · ${chauffeur.plaque}`
          : `${chauffeur.nom} arrive à ${s.depart}`;
        document.getElementById("sBarre").style.width = f * 100 + "%";
        document.getElementById("vtcMonte").disabled = !arrive;
      }
      return;
    }

    const f = Math.min(m / dureeMin, 1);
    const r = surRoute(route, 1, f);
    vehicule.setLatLng(r.pos);
    moi.setLatLng(r.pos);
    majTrainee(route, f);
    allumerSegments(segsCourse, r.i);
    if (!texte) return;
    const termine = m >= dureeMin;
    document.getElementById("sTitre").textContent = termine
      ? "Vous êtes arrivé"
      : `Arrivée dans ${Math.max(1, Math.ceil(dureeMin - m))} min`;
    document.getElementById("sDetail").textContent = termine
      ? s.arrivee
      : `En route vers ${s.arrivee}`;
    document.getElementById("sBarre").style.width = f * 100 + "%";
    document.getElementById("vtcFin").hidden = !termine;
  }

  panneauRecherche();
  window.timerSuivi = setInterval(tick, 33);
}

/* ---------- Branchements sur app.js ---------- */

if (!window.hookExtras) {
  window.hookExtras = true;

  pages.trajet = '<h1>Trajet</h1><div id="suiviChoix"></div>';

  const afficherPageBase = afficherPage;
  afficherPage = function (nom) {
    arreterSuivi();
    afficherPageBase(nom);
    if (nom === "trajet") initTrajet();
  };

  const ouvrirBilletBase = ouvrirBillet;
  ouvrirBillet = function (id) {
    ouvrirBilletBase(id);
    const b = mesBillets.find((x) => x.id === id);
    if (
      b &&
      b.statut === "actif" &&
      !document.querySelector(".bouton.suivre")
    ) {
      const suivre = document.createElement("button");
      suivre.className = "bouton plein suivre";
      suivre.type = "button";
      suivre.textContent = "Suivre mon véhicule en direct";
      suivre.addEventListener("click", () => ouvrirSuivi(id));
      document.getElementById("app").appendChild(suivre);
    }
  };
}
