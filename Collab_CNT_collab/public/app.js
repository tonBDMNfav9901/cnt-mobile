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
const notifications = [
  {
    titre: "Perturbation sur une ligne",
    texte:
      "Ligne 1 (Centre-ville → Aéroport) : circulation ralentie, retards possibles.",
    date: "Aujourd'hui",
  },
  {
    titre: "Rappel de départ",
    texte: "Votre bus pour Lambaréné part dans 1h.",
    date: "Aujourd'hui",
  },
];

function ouvrirNotifications() {
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourNotifs">← Retour</button>
    <h1>Notifications</h1>
    ${
      notifications.length
        ? notifications
            .map(
              (n) => `
      <div class="carte">
        <div class="ligne"><span>${n.titre}</span><span class="gris">${n.date}</span></div>
        <p class="gris">${n.texte}</p>
      </div>
    `,
            )
            .join("")
        : '<div class="carte"><p class="gris">Aucune notification pour le moment.</p></div>'
    }
  `;
  document
    .getElementById("retourNotifs")
    .addEventListener("click", ouvrirRecherche);
}

document.querySelectorAll("#optionsMenu button").forEach((b) => {
  b.addEventListener("click", () => {
    optionsMenu.classList.remove("ouvert");
    if (b.dataset.action === "notifications") ouvrirNotifications();
  });
});

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

function optionsArrets(titre, valeur) {
  const opt = (a) => `<option ${a === valeur ? "selected" : ""}>${a}</option>`;
  return (
    `<option value="">${titre}</option>` +
    `<optgroup label="Libreville · urbain">${listeArrets.map(opt).join("")}</optgroup>` +
    `<optgroup label="Interurbain">${villesInter().map(opt).join("")}</optgroup>`
  );
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
  if (estInter(depart, arrivee)) {
    afficherResultatsInter(depart, arrivee);
    return;
  }
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

function afficherResultatsInter(depart, arrivee) {
  const ville = depart === "Libreville" ? arrivee : depart;
  const t = trajetsInter().find((x) => x.ville === ville);
  achat.depart = depart;
  achat.arrivee = arrivee;
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourResultats">← Modifier</button>
    <h1>${depart} → ${arrivee}</h1>
    ${
      t
        ? `<div class="carte choix resultat">
            <div class="ligne"><span>CNT Interurbain</span></div>
            <p class="gris">${t.duree} min · prochain départ dans 10 min</p>
            <p class="prix-ligne">${fcfa(t.prix)}</p>
          </div>`
        : '<div class="carte"><p>Aucun trajet interurbain disponible.</p></div>'
    }
  `;
  document
    .getElementById("retourResultats")
    .addEventListener("click", ouvrirRecherche);
  document.querySelectorAll(".resultat").forEach((c) => {
    c.addEventListener("click", () => {
      achat.ligne = {
        nom: "CNT Interurbain",
        prix: t.prix,
        attente: 10,
        inter: true,
      };
      ouvrirPaiement();
    });
  });
}
const VEHICULES = [
  {
    id: "standard",
    nom: "Bus Standard",
    desc: "Eicher · climatisé, places assises",
    supplement: 0,
  },
  {
    id: "confort",
    nom: "Minibus Confort (Coaster)",
    desc: "Trajet plus rapide, moins d'arrêts, sièges inclinables",
    supplement: 2000,
  },
];

function choisirVehicule(h, t, libelle) {
  achat.vehicule = achat.vehicule || VEHICULES[0];
  achat._ctx = { h, t, libelle };
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourVehicule">← Retour</button>
    <h1>Choisissez votre véhicule</h1>
    <p class="gris">Départ à ${h} · ${libelle}</p>
    ${VEHICULES.map(
      (v) => `
      <div class="carte choix veh ${achat.vehicule.id === v.id ? "actif" : ""}" data-id="${v.id}">
        <div class="ligne"><span>${v.nom}</span><span>${v.supplement > 0 ? "+" + fcfa(v.supplement) : "Inclus"}</span></div>
        <p class="gris">${v.desc}</p>
      </div>
    `,
    ).join("")}
    <button class="bouton plein" id="btnContinuerVehicule" type="button">Continuer</button>
  `;
  document
    .getElementById("retourVehicule")
    .addEventListener("click", () =>
      afficherResultatsInter(achat.depart, achat.arrivee),
    );
  document.querySelectorAll(".veh").forEach((c) => {
    c.addEventListener("click", () => {
      achat.vehicule = VEHICULES.find((v) => v.id === c.dataset.id);
      document
        .querySelectorAll(".veh")
        .forEach((x) => x.classList.remove("actif"));
      c.classList.add("actif");
    });
  });
  document
    .getElementById("btnContinuerVehicule")
    .addEventListener("click", () => {
      achat.ligne = {
        nom: `CNT Interurbain · ${h} · ${achat.vehicule.nom}`,
        prix: t.prix + achat.vehicule.supplement,
        resume: `Départ le ${libelle} à ${h} · ${achat.vehicule.nom}`,
        dateVoyage: libelle,
      };
      recapReservation();
    });
}

function recapReservation() {
  const l = achat.ligne;
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourRecap">← Modifier le véhicule</button>
    <h1>Récapitulatif</h1>
    <div class="carte">
      <div class="ligne"><span>${achat.depart} → ${achat.arrivee}</span></div>
      <p class="gris">${l.resume}</p>
      <div class="ligne total"><span>Total</span><span>${fcfa(l.prix)}</span></div>
    </div>
    <button class="bouton plein" id="btnConfirmerRecap" type="button">Confirmer et payer</button>
  `;
  document.getElementById("retourRecap").addEventListener("click", () => {
    const { h, t, libelle } = achat._ctx;
    choisirVehicule(h, t, libelle);
  });
  document
    .getElementById("btnConfirmerRecap")
    .addEventListener("click", ouvrirPaiement);
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
      date:
        l.dateVoyage ||
        new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      statut: "actif",
    });
    notifications.unshift({
      titre: "Billet confirmé",
      texte: `${achat.depart} → ${achat.arrivee} · ${fcfa(l.prix)}`,
      date: "À l'instant",
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
function echapper(texte) {
  return String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function profilParDefaut() {
  return {
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    justificatif: "",
    notifications: true,
    operateur: "Airtel Money",
  };
}
function lireProfil() {
  try {
    const p = JSON.parse(localStorage.getItem("cnt-profil"));
    if (p && typeof p === "object") return Object.assign(profilParDefaut(), p);
  } catch (e) {}
  return profilParDefaut();
}
function ecrireProfil(p) {
  try {
    localStorage.setItem("cnt-profil", JSON.stringify(p));
  } catch (e) {}
}
function nomUtilisateur() {
  const p = lireProfil();
  const complet = `${p.nom.toUpperCase()} ${p.prenom}`.trim();
  return echapper(complet || utilisateur.nom);
}

function ouvrirProfil(sauve) {
  const p = lireProfil();
  const initiales =
    ((p.prenom[0] || "") + (p.nom[0] || "")).toUpperCase() || "?";
  document.getElementById("app").innerHTML = `
    <button class="retour" type="button" id="retourProfil">← Retour</button>
    <div class="profil-entete">
      <div class="avatar">${echapper(initiales)}</div>
      <div>
        <h1>${nomUtilisateur()}</h1>
        <span class="statut fluide">Étudiant</span>
      </div>
    </div>
    ${sauve ? '<p class="succes">Profil enregistré.</p>' : ""}

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
      <div class="ligne"><span>Carte d'étudiant</span><span class="statut ${p.justificatif ? "attente" : "expire"}" id="pfStatutJust">${p.justificatif ? "En attente" : "Non fourni"}</span></div>
      <p class="gris" id="pfNomFichier">${p.justificatif ? echapper(p.justificatif) : "Ajoutez une photo de votre carte pour le tarif étudiant."}</p>
      <img id="pfApercu" class="apercu" alt="" hidden>
      <input type="file" id="pfFichier" accept="image/*" hidden>
      <button class="bouton secondaire" id="pfChoisir" type="button">Ajouter une photo</button>
    </div>

    <h2>Préférences</h2>
    <div class="carte">
      <div class="ligne"><span>Alertes de perturbations</span>
        <label class="interrupteur"><input type="checkbox" id="pfNotifs" ${p.notifications ? "checked" : ""}><span class="curseur"></span></label>
      </div>
      <p class="gris">Mobile Money par défaut</p>
      <div class="segments">
        <button class="segment ${p.operateur === "Airtel Money" ? "actif" : ""}" data-op="Airtel Money" type="button">Airtel Money</button>
        <button class="segment ${p.operateur === "Moov Money" ? "actif" : ""}" data-op="Moov Money" type="button">Moov Money</button>
      </div>
    </div>

    <p class="erreur" id="pfErreur"></p>
    <button class="bouton plein" id="pfEnregistrer" type="button">Enregistrer</button>
  `;

  document.getElementById("retourProfil").addEventListener("click", () => {
    afficherPage(document.querySelector(".nav-item.active").dataset.v);
  });
  document.getElementById("pfChoisir").addEventListener("click", () => {
    document.getElementById("pfFichier").click();
  });
  document.getElementById("pfFichier").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const apercu = document.getElementById("pfApercu");
    apercu.src = URL.createObjectURL(f);
    apercu.hidden = false;
    document.getElementById("pfNomFichier").textContent = f.name;
    const s = document.getElementById("pfStatutJust");
    s.textContent = "En attente";
    s.className = "statut attente";
    e.target.dataset.nom = f.name;
  });
  document.querySelectorAll(".segment").forEach((b) => {
    b.addEventListener("click", () => {
      document
        .querySelectorAll(".segment")
        .forEach((x) => x.classList.remove("actif"));
      b.classList.add("actif");
    });
  });
  document.getElementById("pfEnregistrer").addEventListener("click", () => {
    const tel = document.getElementById("pfTel").value.trim();
    if (tel && tel.replace(/\D/g, "").length < 8) {
      document.getElementById("pfErreur").textContent =
        "Numéro de téléphone invalide.";
      return;
    }
    const op = document.querySelector(".segment.actif");
    ecrireProfil({
      prenom: document.getElementById("pfPrenom").value.trim(),
      nom: document.getElementById("pfNom").value.trim(),
      telephone: tel,
      email: document.getElementById("pfEmail").value.trim(),
      justificatif:
        document.getElementById("pfFichier").dataset.nom ||
        lireProfil().justificatif,
      notifications: document.getElementById("pfNotifs").checked,
      operateur: op ? op.dataset.op : "Airtel Money",
    });
    ouvrirProfil(true);
  });
}

document.querySelectorAll(".depart-inter").forEach((c) => {
  c.addEventListener("click", () => {
    const h = c.dataset.h;
    choisirVehicule(h, t, libelle);
  });
});
window.VITESSE = window.VITESSE || 3; // démo : 1 minute simulée = 3 secondes réelles

function arreterSuivi() {
  if (window.timerSuivi) {
    clearInterval(window.timerSuivi);
    window.timerSuivi = null;
  }
}

function entre(a, b, f) {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function dureeTexte(min) {
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

function initTrajet() {
  const actifs = mesBillets.filter((b) => b.statut === "actif");
  document.getElementById("suiviChoix").innerHTML = actifs.length
    ? '<p class="gris">Choisissez le billet à suivre en direct</p>' +
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
  document.querySelectorAll(".billet-suivi").forEach((c) => {
    c.addEventListener("click", () => ouvrirSuivi(c.dataset.id));
  });
  const acheter = document.getElementById("suiviAcheter");
  if (acheter) acheter.addEventListener("click", ouvrirRecherche);
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

function preparerSuivi(b) {
  const [tD, tA] = b.trajet.split(" → ");
  if (String(b.ligne).startsWith("CNT Interurbain")) {
    const v = positionsVilles();
    const ville = tD === "Libreville" ? tA : tD;
    const t = trajetsInter().find((x) => x.ville === ville);
    if (!v[tD] || !v[tA] || !t) return null;
    return {
      nom: "CNT Interurbain",
      couleur: "#0b7d4b",
      ligneArrets: [tD, tA],
      chemin: [tD, tA],
      coord: v,
      attente: 10,
      inter: true,
      minParSeg: t.duree,
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
    couleur: couleurLigne(l.nom),
    ligneArrets: l.arrets,
    chemin,
    coord: positionsArrets,
    attente: l.attente,
    inter: false,
    minParSeg: 8,
    avant: l.arrets[iD - sens],
  };
}

function trajetsInter() {
  return [
    // { ville: "NomDeLaVille", duree: 0, prix: 0 },
    // duree en minutes, prix en FCFA
  ];
}

function villesInter() {
  return trajetsInter().map((x) => x.ville);
}

function estInter(depart, arrivee) {
  const villes = villesInter();
  return (
    (depart === "Libreville" && villes.includes(arrivee)) ||
    (arrivee === "Libreville" && villes.includes(depart))
  );
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
  const fmt = (x) => (x >= 60 ? dureeTexte(x) : `${x} min`);

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
      <span class="pt" style="background:${couleur}"></span><span class="lg">Votre véhicule</span>
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
      html: `<div class="vehicule" style="background:${couleur}"></div>`,
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

// Branchements : page Trajet + bouton sous le ticket (sans modifier le reste du fichier)
if (!window.hookSuivi) {
  window.hookSuivi = true;
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
function lireTheme() {
  try {
    return localStorage.getItem("cnt-theme") || "auto";
  } catch (e) {
    return "auto";
  }
}

function libelleTheme(choix) {
  return { auto: "Automatique", clair: "Clair", sombre: "Sombre" }[choix];
}

function appliquerTheme(choix) {
  const racine = document.documentElement;
  if (choix === "clair") racine.setAttribute("data-theme", "light");
  else if (choix === "sombre") racine.setAttribute("data-theme", "dark");
  else racine.removeAttribute("data-theme");
  const sombre =
    choix === "sombre" ||
    (choix !== "clair" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = sombre ? "#0e1512" : "#fcfdf9";
}

(function () {
  const menu = document.getElementById("optionsMenu");
  if (!menu || document.getElementById("optTheme")) return;
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.id = "optTheme";
  const maj = () => {
    bouton.textContent = `Apparence : ${libelleTheme(lireTheme())}`;
  };
  bouton.addEventListener("click", (e) => {
    e.stopPropagation();
    const suite = { auto: "clair", clair: "sombre", sombre: "auto" }[
      lireTheme()
    ];
    try {
      localStorage.setItem("cnt-theme", suite);
    } catch (err) {}
    appliquerTheme(suite);
    maj();
  });
  menu.appendChild(bouton);
  maj();
  appliquerTheme(lireTheme());
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => appliquerTheme(lireTheme()));
})();
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
      ${["Airtel Money", "Moov Money", "Espèces"].map((p) => `<button class="segment ${p === s.paiement ? "actif" : ""}" data-p="${p}" type="button">${p}</button>`).join("")}
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
        <div class="ligne"><span>${t.nom}</span><span>${ok ? fcfa(estimerVtc(t, km)) : "—"}</span></div>
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
    const msg = verifierTrajet(s.depart, s.arrivee);
    document.getElementById("vtcErreur").textContent = msg;
    if (!msg) lancerVtc();
  });
  rendreTypes();
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
      ? `À régler en espèces au chauffeur : ${fcfa(prix)}`
      : `Paiement de ${fcfa(prix)} confirmé via ${s.paiement}`;

  document.getElementById("app").innerHTML = `
    <h1>Votre VTC</h1>
    <p class="gris">${s.depart} → ${s.arrivee} · ${type.nom} · ${fcfa(prix)}</p>
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
        <div class="notes">${[1, 2, 3, 4, 5].map((n) => `<button class="etoile" data-n="${n}" type="button">${etoile(false)}</button>`).join("")}</div>
        <button class="bouton plein" id="vtcTerminer" type="button">Terminer</button>
      </div>
    `;
    document.querySelectorAll(".notes .etoile").forEach((b) => {
      b.addEventListener("click", () => {
        const choix = Number(b.dataset.n);
        document.querySelectorAll(".notes .etoile").forEach((x) => {
          const n = Number(x.dataset.n);
          x.classList.toggle("actif", n <= choix);
          x.innerHTML = etoile(n <= choix);
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

if (!window.hookVtc && typeof initTrajet === "function") {
  window.hookVtc = true;
  const initTrajetBase = initTrajet;
  initTrajet = function () {
    initTrajetBase();
    ajouterCarteVtc();
  };
}
window.addEventListener("resize", () => {
  const actif = document.querySelector(".nav-item.active");
  if (actif) moveIndicator(actif);
});
