const navTrack = document.getElementById("navTrack");
const navIndicator = document.getElementById("navIndicator");

function moveIndicator(el) {
  const r = el.getBoundingClientRect();
  const tr = navTrack.getBoundingClientRect();
  navIndicator.style.width = r.width - 8 + "px";
  navIndicator.style.left = r.left - tr.left + 4 + "px";
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((i) => i.classList.remove("active"));
    btn.classList.add("active");
    moveIndicator(btn);
  });
});

window.addEventListener("load", () => {
  moveIndicator(document.querySelector(".nav-item.active"));
});
const pages = {
  home: `
    <div class="bandeau-demo">Mode Démo</div>
    <h1>Bonjour</h1>
    <div class="carte">
      <h2>Où allez-vous ?</h2>
      <select class="champ" id="homeDepart"></select>
      <select class="champ" id="homeArrivee"></select>
      <p class="erreur" id="homeErreur"></p>
      <button class="bouton" id="homeRechercher" type="button">Rechercher</button>
    </div>
    <h2>Carte du réseau</h2>
    <div id="carte-ville" class="carte-ville"></div>
    <h2>Lignes favorites</h2>
    <div id="homeFavoris"></div>
  `,
  trajet: "<h1>Trajet</h1>",
  reseau: `
    <h1>Réseau</h1>
    <div id="legendeReseau" class="legende"></div>
    <div id="carte-reseau" class="carte-reseau"></div>
  `,
  lignes: `
    <h1>Lignes</h1>
    <div id="listeLignes"></div>
  `,
  billets: `
    <h1>Billets</h1>
    <button class="bouton plein" id="btnAcheter" type="button">Acheter un billet</button>
    <div class="onglets">
      <button class="onglet actif" data-f="actifs" type="button">Actifs</button>
      <button class="onglet" data-f="historique" type="button">Historique</button>
      <button class="onglet" data-f="tous" type="button">Tous</button>
    </div>
    <div id="listeBillets"></div>
  `,
};
let carte = null;

function afficherPage(nom) {
  if (carte) {
    carte.remove();
    carte = null;
  }
  document.getElementById("app").innerHTML = pages[nom];
  if (nom === "home") initCarte();
  if (nom === "home") initAccueil();
  if (nom === "billets") initBillets();
  if (nom === "lignes") initLignes();
  if (nom === "reseau") initReseau();
}

function initCarte() {
  carte = L.map("carte-ville", { zoomControl: false }).setView(
    [0.4162, 9.4673],
    12,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "©️ OpenStreetMap",
  }).addTo(carte);

  const arrets = [
    { nom: "Aéroport Léon-Mba", pos: [0.4586, 9.4123] },
    { nom: "Centre-ville", pos: [0.3925, 9.453] },
    { nom: "Université Omar Bongo", pos: [0.429, 9.499] },
  ];

  arrets.forEach((a) => {
    L.circleMarker(a.pos, {
      radius: 9,
      color: "#0b7d4b",
      fillColor: "#0b7d4b",
      fillOpacity: 1,
    })
      .addTo(carte)
      .bindPopup(a.nom);
  });
}
const optionsBtn = document.getElementById("optionsBtn");
const optionsMenu = document.getElementById("optionsMenu");

optionsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  optionsMenu.classList.toggle("ouvert");
});

document.addEventListener("click", () =>
  optionsMenu.classList.remove("ouvert"),
);
const utilisateur = { nom: "NGUIAMBAMBA Judaxe Kevin" };

const mesBillets = [
  {
    id: "CNT-0001",
    trajet: "Centre-ville → Aéroport",
    ligne: "Ligne 1",
    prix: "1 000 FCFA",
    date: "02 oct. 2026",
    statut: "actif",
  },
  {
    id: "CNT-0002",
    trajet: "Université → Centre-ville",
    ligne: "Ligne 3",
    prix: "500 FCFA",
    date: "28 sept. 2026",
    statut: "actif",
  },
  {
    id: "CNT-0003",
    trajet: "Akébé → Centre-ville",
    ligne: "Ligne 2",
    prix: "500 FCFA",
    date: "20 sept. 2026",
    statut: "expire",
  },
];

function initBillets() {
  document
    .getElementById("btnAcheter")
    .addEventListener("click", ouvrirRecherche);
  afficherListe("actifs");
  document.querySelectorAll(".onglet").forEach((o) => {
    o.addEventListener("click", () => {
      document
        .querySelectorAll(".onglet")
        .forEach((x) => x.classList.remove("actif"));
      o.classList.add("actif");
      afficherListe(o.dataset.f);
    });
  });
  document.getElementById("listeBillets").addEventListener("click", (e) => {
    const c = e.target.closest(".billet");
    if (c) ouvrirBillet(c.dataset.id);
  });
}

function afficherListe(filtre) {
  const liste = mesBillets.filter((b) =>
    filtre === "tous"
      ? true
      : filtre === "actifs"
        ? b.statut === "actif"
        : b.statut !== "actif",
  );
  document.getElementById("listeBillets").innerHTML =
    liste
      .map(
        (b) => `
    <div class="carte billet" data-id="${b.id}">
      <div class="ligne"><span>${b.trajet}</span><span class="statut ${b.statut === "actif" ? "fluide" : "expire"}">${b.statut === "actif" ? "Actif" : "Expiré"}</span></div>
      <p class="gris">${b.ligne} · ${b.date} · ${b.prix}</p>
    </div>
  `,
      )
      .join("") || '<p class="gris">Aucun billet.</p>';
}

function ouvrirBillet(id) {
  const b = mesBillets.find((x) => x.id === id);
  const expire = b.statut !== "actif";
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourBillets">← Retour</button>
    <div class="distributeur">
      <div class="fente"><span class="voyant"></span></div>
      <div class="sortie">
        <div class="ticket-or ${expire ? "expire" : ""}">
          <div class="ticket-haut">
            <div class="ticket-marque">CNT</div>
            <p class="ticket-label">Trajet</p>
            <h2>${b.trajet}</h2>
            <div class="ticket-infos">
              <div><p class="ticket-label">Passager</p><p class="ticket-valeur">${nomUtilisateur()}</p></div>
              <div><p class="ticket-label">Valable jusqu'au</p><p class="ticket-valeur">${b.date}</p></div>
            </div>
          </div>
          <div class="coupure"></div>
          <div class="ticket-bas">
            <div id="qrBillet" class="qr-boite"></div>
            <p class="ticket-label">${b.id} · ${b.ligne}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  new QRCode(document.getElementById("qrBillet"), {
    text: b.id,
    width: 180,
    height: 180,
  });
  document
    .getElementById("retourBillets")
    .addEventListener("click", () => afficherPage("billets"));
}
const fcfa = (n) => n.toLocaleString("fr-FR") + " FCFA";

const reseau = [
  {
    nom: "Ligne 1",
    arrets: ["Aéroport Léon-Mba", "Akébé", "Centre-ville"],
    prix: 1000,
    attente: 5,
    statut: "fluide",
  },
  {
    nom: "Ligne 2",
    arrets: ["Akébé", "Centre-ville", "Université Omar Bongo"],
    prix: 500,
    attente: 12,
    statut: "perturbe",
  },
  {
    nom: "Ligne 3",
    arrets: ["Université Omar Bongo", "Centre-ville"],
    prix: 500,
    attente: 8,
    statut: "fluide",
  },
];
const listeArrets = [...new Set(reseau.flatMap((l) => l.arrets))];
let achat = { depart: "", arrivee: "", ligne: null, operateur: "Airtel Money" };

function optionsArrets(titre, valeur){
  const opt = a => `<option ${a === valeur ? 'selected' : ''}>${a}</option>`;
  return `<option value="">${titre}</option>` +
    `<optgroup label="Libreville · urbain">${listeArrets.map(opt).join('')}</optgroup>` +
    `<optgroup label="Interurbain">${villesInter().map(opt).join('')}</optgroup>`;
}

function verifierTrajet(d, a) {
  if (!d || !a) return "Choisissez un départ et une destination.";
  if (d === a) return "Le départ et la destination doivent être différents.";
  return "";
}

function initAccueil() {
  afficherFavoris();
  document.getElementById("homeDepart").innerHTML = optionsArrets(
    "Départ",
    achat.depart,
  );
  document.getElementById("homeArrivee").innerHTML = optionsArrets(
    "Destination",
    achat.arrivee,
  );
  document.getElementById("homeRechercher").addEventListener("click", () => {
    const d = document.getElementById("homeDepart").value;
    const a = document.getElementById("homeArrivee").value;
    const msg = verifierTrajet(d, a);
    document.getElementById("homeErreur").textContent = msg;
    if (!msg) afficherResultats(d, a);
  });
}

function ouvrirRecherche() {
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourRecherche">← Retour</button>
    <h1>Acheter un billet</h1>
    <div class="carte">
      <select class="champ" id="rechDepart">${optionsArrets("Départ", achat.depart)}</select>
      <select class="champ" id="rechArrivee">${optionsArrets("Destination", achat.arrivee)}</select>
    </div>
    <p class="erreur" id="rechErreur"></p>
    <button class="bouton plein" id="rechBtn" type="button">Rechercher</button>
  `;
  document
    .getElementById("retourRecherche")
    .addEventListener("click", () => afficherPage("billets"));
  document.getElementById("rechBtn").addEventListener("click", () => {
    const d = document.getElementById("rechDepart").value;
    const a = document.getElementById("rechArrivee").value;
    const msg = verifierTrajet(d, a);
    document.getElementById("rechErreur").textContent = msg;
    if (!msg) afficherResultats(d, a);
  });
}

function afficherResultats(depart, arrivee) {
  if (estInter(depart, arrivee)) { afficherResultatsInter(depart, arrivee); return; }
  achat.depart = depart;
  achat.arrivee = arrivee;
  const trouvees = reseau.filter(
    (l) => l.arrets.includes(depart) && l.arrets.includes(arrivee),
  );
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourResultats">← Modifier</button>
    <h1>${depart} → ${arrivee}</h1>
    ${
      trouvees.length
        ? '<p class="gris">Choisissez une ligne</p>'
        : '<div class="carte"><p>Aucune ligne directe entre ces deux arrêts.</p></div>'
    }
    ${trouvees
      .map((l) => {
        const nb = Math.abs(
          l.arrets.indexOf(depart) - l.arrets.indexOf(arrivee),
        );
        return `
        <div class="carte choix resultat" data-i="${reseau.indexOf(l)}">
          <div class="ligne"><span>${l.nom}</span><span class="statut ${l.statut}">${l.statut === "fluide" ? "Fluide" : "Perturbé"}</span></div>
          <p class="gris">${nb * 8} min · prochain départ dans ${l.attente} min</p>
          <p class="prix-ligne">${fcfa(l.prix)}</p>
        </div>`;
      })
      .join("")}
  `;
  document
    .getElementById("retourResultats")
    .addEventListener("click", ouvrirRecherche);
  document.querySelectorAll(".resultat").forEach((c) => {
    c.addEventListener("click", () => {
      achat.ligne = reseau[Number(c.dataset.i)];
      ouvrirPaiement();
    });
  });
}

function ouvrirPaiement() {
  const l = achat.ligne;
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourPaiement">← Retour</button>
    <h1>Paiement</h1>
    <div class="carte">
      <div class="ligne"><span>${achat.depart} → ${achat.arrivee}</span></div>
      <p class="gris">${l.resume || `${l.nom} · prochain départ dans ${l.attente} min`}</p>
      <div class="ligne total"><span>Total</span><span>${fcfa(l.prix)}</span></div>
    </div>
    <h2>Mobile Money</h2>
    <div class="operateurs">
      <div class="carte choix op ${achat.operateur === "Airtel Money" ? "actif" : ""}" data-op="Airtel Money">Airtel Money</div>
      <div class="carte choix op ${achat.operateur === "Moov Money" ? "actif" : ""}" data-op="Moov Money">Moov Money</div>
    </div>
    <input class="champ" id="achatTel" placeholder="Numéro Mobile Money" inputmode="tel">
    <p class="erreur" id="erreurPaiement"></p>
    <button class="bouton plein" id="btnPayer" type="button">Payer ${fcfa(l.prix)}</button>
  `;
  document
    .getElementById("retourPaiement")
    .addEventListener("click", () =>
      afficherResultats(achat.depart, achat.arrivee),
    );
  document.querySelectorAll(".op").forEach((o) => {
    o.addEventListener("click", () => {
      achat.operateur = o.dataset.op;
      document
        .querySelectorAll(".op")
        .forEach((x) => x.classList.remove("actif"));
      o.classList.add("actif");
    });
  });
  document.getElementById("btnPayer").addEventListener("click", () => {
    const tel = document.getElementById("achatTel").value.replace(/\D/g, "");
    if (tel.length < 8) {
      document.getElementById("erreurPaiement").textContent =
        "Entrez un numéro valide.";
      return;
    }
    traiterPaiement();
  });
}

function traiterPaiement() {
  const l = achat.ligne;
  document.getElementById("app").innerHTML = `
    <div class="attente">
      <div class="skeleton gros"></div>
      <div class="skeleton"></div>
      <div class="skeleton court"></div>
      <p class="gris">Confirmation du paiement ${achat.operateur}…</p>
    </div>
  `;
  setTimeout(() => {
    const id = "CNT-" + String(mesBillets.length + 1).padStart(4, "0");
    mesBillets.unshift({
      id,
      trajet: `${achat.depart} → ${achat.arrivee}`,
      ligne: l.nom,
      prix: fcfa(l.prix),
      date: l.dateVoyage || new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      statut: "actif",
    });
    achat = { depart: "", arrivee: "", ligne: null, operateur: "Airtel Money" };
    ouvrirBillet(id);
  }, 2500);
}
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => afficherPage(btn.dataset.v));
});

afficherPage("home");
function lireFavoris() {
  try {
    const s = JSON.parse(localStorage.getItem("cnt-favoris"));
    if (Array.isArray(s)) return s;
  } catch (e) {}
  return ["Ligne 1", "Ligne 3"];
}
function ecrireFavoris(liste) {
  try {
    localStorage.setItem("cnt-favoris", JSON.stringify(liste));
  } catch (e) {}
}
function estFavori(nom) {
  return lireFavoris().includes(nom);
}
function basculerFavori(nom) {
  const f = lireFavoris();
  ecrireFavoris(f.includes(nom) ? f.filter((n) => n !== nom) : [...f, nom]);
}
function couleurLigne(nom) {
  return (
    { "Ligne 1": "#0b7d4b", "Ligne 2": "#eab308", "Ligne 3": "#2563eb" }[nom] ||
    "#0b7d4b"
  );
}
function frequenceLigne(nom) {
  return { "Ligne 1": 20, "Ligne 2": 15, "Ligne 3": 10 }[nom] || 20;
}
function etoile(plein) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="${plein ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}
function formatHeure(min) {
  const h = String(Math.floor(min / 60) % 24).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function prochainsDeparts(nom) {
  const freq = frequenceLigne(nom);
  const maintenant = new Date().getHours() * 60 + new Date().getMinutes();
  const liste = [];
  for (let t = 330; t <= 1260; t += freq) {
    if (t >= maintenant) liste.push(t);
    if (liste.length === 4) break;
  }
  return liste;
}
function badgeStatut(l) {
  return `<span class="statut ${l.statut}">${l.statut === "fluide" ? "Fluide" : "Perturbé"}</span>`;
}

function afficherFavoris() {
  const conteneur = document.getElementById("homeFavoris");
  if (!conteneur) return;
  const liste = reseau.filter((l) => estFavori(l.nom));
  conteneur.innerHTML = liste.length
    ? liste
        .map(
          (l) => `
      <div class="carte ligne" data-i="${reseau.indexOf(l)}"><span>${l.nom}</span>${badgeStatut(l)}</div>`,
        )
        .join("")
    : "<p class=\"gris\">Aucun favori. Touchez l'étoile d'une ligne pour l'ajouter.</p>";
  conteneur.querySelectorAll(".ligne").forEach((c) => {
    c.addEventListener("click", () => ouvrirLigne(Number(c.dataset.i)));
  });
}

function initLignes() {
  document.getElementById("listeLignes").innerHTML = reseau
    .map(
      (l, i) => `
    <div class="carte ligne-carte" data-i="${i}">
      <span class="pastille" style="background:${couleurLigne(l.nom)}"></span>
      <div class="ligne-infos">
        <strong>${l.nom}</strong>
        <p class="gris">${l.arrets[0]} ↔️ ${l.arrets[l.arrets.length - 1]}</p>
      </div>
      ${badgeStatut(l)}
      <button class="etoile ${estFavori(l.nom) ? "actif" : ""}" data-nom="${l.nom}" type="button" aria-label="Favori">${etoile(estFavori(l.nom))}</button>
    </div>
  `,
    )
    .join("");
  document.querySelectorAll(".ligne-carte").forEach((c) => {
    c.addEventListener("click", () => ouvrirLigne(Number(c.dataset.i)));
  });
  document.querySelectorAll(".etoile").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      basculerFavori(b.dataset.nom);
      initLignes();
    });
  });
}

function ouvrirLigne(i) {
  const l = reseau[i];
  const couleur = couleurLigne(l.nom);
  const departs = prochainsDeparts(l.nom);
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourLignes">← Retour</button>
    <div class="ligne-entete">
      <span class="pastille grande" style="background:${couleur}"></span>
      <h1>${l.nom}</h1>
      <button class="etoile ${estFavori(l.nom) ? "actif" : ""}" id="favoriLigne" type="button" aria-label="Favori">${etoile(estFavori(l.nom))}</button>
    </div>
    ${badgeStatut(l)}
    <div class="carte infos-ligne">
      <div><p class="ticket-label">Premier départ</p><p class="ticket-valeur">05:30</p></div>
      <div><p class="ticket-label">Dernier départ</p><p class="ticket-valeur">21:00</p></div>
      <div><p class="ticket-label">Fréquence</p><p class="ticket-valeur">${frequenceLigne(l.nom)} min</p></div>
    </div>
    <h2>Prochains départs</h2>
    <div class="departs">${
      departs.length
        ? departs
            .map((t) => `<span class="depart">${formatHeure(t)}</span>`)
            .join("")
        : '<p class="gris">Service terminé, reprise à 05:30.</p>'
    }</div>
    <h2>Arrêts</h2>
    <div class="carte">
      <ul class="arrets">
        ${l.arrets.map((a, k) => `<li style="--c:${couleur}"><span class="arret-nom">${a}</span><span class="gris">+${k * 8} min</span></li>`).join("")}
      </ul>
    </div>
    <button class="bouton plein" id="reserverLigne" type="button">Acheter un billet</button>
  `;
  document.getElementById("retourLignes").addEventListener("click", () => {
    afficherPage(document.querySelector(".nav-item.active").dataset.v);
  });
  document.getElementById("favoriLigne").addEventListener("click", () => {
    basculerFavori(l.nom);
    ouvrirLigne(i);
  });
  document
    .getElementById("reserverLigne")
    .addEventListener("click", ouvrirRecherche);
}
const positionsArrets = {
  "Aéroport Léon-Mba": [0.4586, 9.4123],
  Akébé: [0.376, 9.462],
  "Centre-ville": [0.3925, 9.453],
  "Université Omar Bongo": [0.429, 9.499],
};

function initReseau() {
  carte = L.map("carte-reseau", { zoomControl: false }).setView(
    [0.405, 9.46],
    12,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "©️ OpenStreetMap",
  }).addTo(carte);

  const groupes = {};
  reseau.forEach((l) => {
    const couleur = couleurLigne(l.nom);
    const groupe = L.layerGroup();
    L.polyline(
      l.arrets.map((a) => positionsArrets[a]),
      { color: couleur, weight: 5, opacity: 0.9 },
    ).addTo(groupe);
    l.arrets.forEach((a) => {
      const desservies = reseau
        .filter((x) => x.arrets.includes(a))
        .map((x) => x.nom)
        .join(", ");
      L.circleMarker(positionsArrets[a], {
        radius: 8,
        color: couleur,
        weight: 3,
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .addTo(groupe)
        .bindPopup(`<strong>${a}</strong><br>${desservies}`);
    });
    groupe.addTo(carte);
    groupes[l.nom] = groupe;
  });

  document.getElementById("legendeReseau").innerHTML = reseau
    .map(
      (l) => `
    <button class="puce actif" data-nom="${l.nom}" type="button">
      <span class="pastille" style="background:${couleurLigne(l.nom)}"></span>${l.nom}
    </button>
  `,
    )
    .join("");
  document.querySelectorAll(".puce").forEach((p) => {
    p.addEventListener("click", () => {
      const g = groupes[p.dataset.nom];
      if (carte.hasLayer(g)) {
        carte.removeLayer(g);
        p.classList.remove("actif");
      } else {
        g.addTo(carte);
        p.classList.add("actif");
      }
    });
  });

  carte.fitBounds(L.latLngBounds(Object.values(positionsArrets)), {
    padding: [24, 24],
  });
  setTimeout(() => {
    if (carte) carte.invalidateSize();
  }, 100);
}
function echapper(texte){
  return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function profilParDefaut(){
  return { prenom: '', nom: '', telephone: '', email: '', justificatif: '', notifications: true, operateur: 'Airtel Money' };
}
function lireProfil(){
  try {
    const p = JSON.parse(localStorage.getItem('cnt-profil'));
    if (p && typeof p === 'object') return Object.assign(profilParDefaut(), p);
  } catch (e) {}
  return profilParDefaut();
}
function ecrireProfil(p){
  try { localStorage.setItem('cnt-profil', JSON.stringify(p)); } catch (e) {}
}
function nomUtilisateur(){
  const p = lireProfil();
  const complet = `${p.nom.toUpperCase()} ${p.prenom}`.trim();
  return echapper(complet || utilisateur.nom);
}

function ouvrirProfil(sauve){
  const p = lireProfil();
  const initiales = ((p.prenom[0] || '') + (p.nom[0] || '')).toUpperCase() || '?';
  document.getElementById('app').innerHTML = `
    <button class="retour" type="button" id="retourProfil">← Retour</button>
    <div class="profil-entete">
      <div class="avatar">${echapper(initiales)}</div>
      <div>
        <h1>${nomUtilisateur()}</h1>
        <span class="statut fluide">Étudiant</span>
      </div>
    </div>
    ${sauve ? '<p class="succes">Profil enregistré.</p>' : ''}

    <h2>Informations personnelles</h2>
    <div class="carte">
      <label class="etiquette">Prénom</label>
      <input class="champ" id="pfPrenom" value="${echapper(p.prenom)}" placeholder="Prénom" autocomplete="given-name">
      <label class="etiquette">Nom</label>
      <input class="champ" id="pfNom" value="${echapper(p.nom)}" placeholder="Nom" autocomplete="family-name">
      <label class="etiquette">Téléphone</label>
      <input class="champ" id="pfTel" value="${echapper(p.telephone)}" placeholder="Numéro de téléphone" inputmode="tel">
      <label class="etiquette">E-mail</label>
      <input class="champ" id="pfEmail" type="email" value="${echapper(p.email)}" placeholder="adresse@exemple.com">
    </div>

    <h2>Justificatif étudiant</h2>
    <div class="carte">
      <div class="ligne"><span>Carte d'étudiant</span><span class="statut ${p.justificatif ? 'attente' : 'expire'}" id="pfStatutJust">${p.justificatif ? 'En attente' : 'Non fourni'}</span></div>
      <p class="gris" id="pfNomFichier">${p.justificatif ? echapper(p.justificatif) : 'Ajoutez une photo de votre carte pour le tarif étudiant.'}</p>
      <img id="pfApercu" class="apercu" alt="" hidden>
      <input type="file" id="pfFichier" accept="image/*" hidden>
      <button class="bouton secondaire" id="pfChoisir" type="button">Ajouter une photo</button>
    </div>

    <h2>Préférences</h2>
    <div class="carte">
      <div class="ligne"><span>Alertes de perturbations</span>
        <label class="interrupteur"><input type="checkbox" id="pfNotifs" ${p.notifications ? 'checked' : ''}><span class="curseur"></span></label>
      </div>
      <p class="gris">Mobile Money par défaut</p>
      <div class="segments">
        <button class="segment ${p.operateur === 'Airtel Money' ? 'actif' : ''}" data-op="Airtel Money" type="button">Airtel Money</button>
        <button class="segment ${p.operateur === 'Moov Money' ? 'actif' : ''}" data-op="Moov Money" type="button">Moov Money</button>
      </div>
    </div>

    <p class="erreur" id="pfErreur"></p>
    <button class="bouton plein" id="pfEnregistrer" type="button">Enregistrer</button>
  `;

  document.getElementById('retourProfil').addEventListener('click', () => {
    afficherPage(document.querySelector('.nav-item.active').dataset.v);
  });
  document.getElementById('pfChoisir').addEventListener('click', () => {
    document.getElementById('pfFichier').click();
  });
  document.getElementById('pfFichier').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const apercu = document.getElementById('pfApercu');
    apercu.src = URL.createObjectURL(f);
    apercu.hidden = false;
    document.getElementById('pfNomFichier').textContent = f.name;
    const s = document.getElementById('pfStatutJust');
    s.textContent = 'En attente';
    s.className = 'statut attente';
    e.target.dataset.nom = f.name;
  });
  document.querySelectorAll('.segment').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.segment').forEach(x => x.classList.remove('actif'));
      b.classList.add('actif');
    });
  });
  document.getElementById('pfEnregistrer').addEventListener('click', () => {
    const tel = document.getElementById('pfTel').value.trim();
    if (tel && tel.replace(/\D/g, '').length < 8) {
      document.getElementById('pfErreur').textContent = 'Numéro de téléphone invalide.';
      return;
    }
    const op = document.querySelector('.segment.actif');
    ecrireProfil({
      prenom: document.getElementById('pfPrenom').value.trim(),
      nom: document.getElementById('pfNom').value.trim(),
      telephone: tel,
      email: document.getElementById('pfEmail').value.trim(),
      justificatif: document.getElementById('pfFichier').dataset.nom || lireProfil().justificatif,
      notifications: document.getElementById('pfNotifs').checked,
      operateur: op ? op.dataset.op : 'Airtel Money'
    });
    ouvrirProfil(true);
  });
}

document.querySelectorAll('#optionsMenu button').forEach(b => {
  b.addEventListener('click', () => {
    const t = b.textContent.trim();
    if (t === 'Mon profil') ouvrirProfil();
    if (t === 'Mes favoris') document.querySelector('.nav-item[data-v="lignes"]').click();
  });
});
function trajetsInter(){
  // Données d'exemple : à remplacer par les vrais tarifs, durées et horaires de la CNT
  return [
    { ville: 'Lambaréné', prix: 6000, duree: 210, departs: ['06:30', '10:00', '15:00'] },
    { ville: 'Mouila', prix: 12000, duree: 420, departs: ['06:00', '13:00'] },
    { ville: 'Lebamba', prix: 14000, duree: 480, departs: ['06:00'] },
    { ville: 'Tchibanga', prix: 17000, duree: 600, departs: ['05:30', '12:00'] },
    { ville: 'Makokou', prix: 16000, duree: 570, departs: ['06:00'] },
    { ville: 'Oyem', prix: 14000, duree: 420, departs: ['06:00', '13:00'] },
    { ville: 'Bitam', prix: 16000, duree: 480, departs: ['06:00'] }
  ];
}

function villesInter(){
  return ['Libreville'].concat(trajetsInter().map(t => t.ville));
}

function estInter(d, a){
  const v = villesInter();
  return v.includes(d) && v.includes(a);
}

function dureeTexte(min){
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}

function hhmm(min){
  return `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

function afficherResultatsInter(depart, arrivee, jour){
  jour = jour || 0;
  achat.depart = depart;
  achat.arrivee = arrivee;
  const ville = depart === 'Libreville' ? arrivee : depart;
  const t = trajetsInter().find(x => x.ville === ville);
  const direct = (depart === 'Libreville' || arrivee === 'Libreville') && t;

  const dateVoyage = new Date();
  dateVoyage.setDate(dateVoyage.getDate() + jour);
  const libelle = dateVoyage.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const maintenant = new Date().getHours() * 60 + new Date().getMinutes();
  const minutes = h => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  const departs = direct ? t.departs.filter(h => jour > 0 || minutes(h) > maintenant) : [];
  const jours = ['Aujourd\'hui', 'Demain', 'Après-demain'];

  document.getElementById('app').innerHTML = `
    <button class="retour" type="button" id="retourInter">← Modifier</button>
    <h1>${depart} → ${arrivee}</h1>
    ${direct ? `
      <div class="segments dates">
        ${jours.map((j, i) => `<button class="segment ${i === jour ? 'actif' : ''}" data-j="${i}" type="button">${j}</button>`).join('')}
      </div>
      <p class="gris">${libelle} · ${dureeTexte(t.duree)} de route</p>
      ${departs.length
        ? departs.map(h => {
            const places = 8 + ((h.charCodeAt(1) + h.charCodeAt(4) + jour * 7 + ville.length) % 28);
            return `
              <div class="carte choix depart-inter" data-h="${h}">
                <div class="ligne"><span class="grosse-heure">${h}</span><span class="prix-ligne">${fcfa(t.prix)}</span></div>
                <p class="gris">Arrivée vers ${hhmm(minutes(h) + t.duree)} · ${dureeTexte(t.duree)}</p>
                <p class="gris">${places} places disponibles</p>
              </div>`;
          }).join('')
        : '<div class="carte"><p>Plus de départ aujourd\'hui.</p><p class="gris">Choisissez un autre jour.</p></div>'}
    ` : '<div class="carte"><p>Aucune liaison directe entre ces deux villes.</p><p class="gris">Les liaisons interurbaines partent de Libreville.</p></div>'}
  `;

  document.getElementById('retourInter').addEventListener('click', ouvrirRecherche);
  document.querySelectorAll('.segment[data-j]').forEach(b => {
    b.addEventListener('click', () => afficherResultatsInter(depart, arrivee, Number(b.dataset.j)));
  });
  document.querySelectorAll('.depart-inter').forEach(c => {
    c.addEventListener('click', () => {
      const h = c.dataset.h;
      achat.ligne = {
        nom: `CNT Interurbain · ${h}`,
        prix: t.prix,
        resume: `Départ le ${libelle} à ${h}`,
        dateVoyage: libelle
      };
      ouvrirPaiement();
    });
  });
}
