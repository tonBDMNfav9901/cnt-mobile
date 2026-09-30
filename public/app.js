var API = "";
function apiGet(p) {
  return fetch(API + p).then(function (r) {
    return r.json();
  });
}
function apiPost(p, body) {
  return fetch(API + p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(function (r) {
    return r.json();
  });
}

var L = [
  {
    id: "L1",
    n: "Owendo – Akanda",
    c: "#0b7d4b",
    p: 500,
    f: 12,
    s: ["Owendo", "Nzeng-Ayong", "Mont-Bouët", "Glass", "Louis", "Akanda"],
  },
  {
    id: "L2",
    n: "Aéroport – Université",
    c: "#1d6fd8",
    p: 400,
    f: 15,
    s: ["Aéroport", "Lalala", "Glass", "Mont-Bouët", "Université"],
  },
  {
    id: "L3",
    n: "PK8 – Centre-ville",
    c: "#d97706",
    p: 300,
    f: 10,
    s: ["PK8", "Louis", "Glass", "Mont-Bouët"],
  },
];
var POS = {
  Owendo: [25, 190],
  "Nzeng-Ayong": [150, 158],
  "Mont-Bouët": [195, 118],
  Glass: [235, 88],
  Louis: [285, 58],
  Akanda: [335, 30],
  Aéroport: [35, 50],
  Lalala: [120, 78],
  Université: [130, 200],
  PK8: [330, 190],
};
var ST = Object.keys(POS).sort(function (a, b) {
  return a.localeCompare(b, "fr");
});
var S = {
  fav: [],
  v: "home",
  from: "Owendo",
  to: "Akanda",
  go: 0,
  tk: [],
  buy: { ty: "u", ln: "L1", op: "Airtel Money", ph: "", st: 0 },
  rp: [],
  rf: { t: "Retard", l: "L1", c: "" },
  stats: { totalBillets: 0, totalSignalements: 0, signalementsParLigne: {} },
};
var $ = function (i) {
    return document.getElementById(i);
  },
  P2 = function (n) {
    return ("0" + n).slice(-2);
  },
  fm = function (m) {
    return P2(Math.floor(m / 60) % 24) + ":" + P2(m % 60);
  };
var LN = function (id) {
    return L.filter(function (l) {
      return l.id == id;
    })[0];
  },
  lb = function (l) {
    return (
      '<span class="lb" style="background:' + l.c + '">' + l.id + "</span>"
    );
  };
function opts(a, sel) {
  return a
    .map(function (x) {
      var v = x.id || x,
        t = x.id ? x.id + " · " + x.n : x;
      return (
        '<option value="' +
        v +
        '"' +
        (v == sel ? " selected" : "") +
        ">" +
        t +
        "</option>"
      );
    })
    .join("");
}
function toast(t) {
  var e = $("toast");
  e.textContent = t;
  e.className = "on";
  clearTimeout(toast.h);
  toast.h = setTimeout(function () {
    e.className = "";
  }, 2400);
}
function nowm() {
  var d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function deps(l, idx, n) {
  var o = idx * 4,
    r = [];
  for (var t = 330 + o; t <= 1260 + o && r.length < n; t += l.f)
    if (t >= nowm()) r.push(t);
  return r;
}
function rel(t) {
  var m = t - nowm();
  return m <= 0 ? "À quai" : "Dans " + m + " min";
}
function routes(a, b) {
  var out = [];
  L.forEach(function (l) {
    var ia = l.s.indexOf(a),
      ib = l.s.indexOf(b);
    if (ia < 0 || ib < 0 || ia == ib) return;
    var dir = ib > ia ? 1 : -1,
      n = Math.abs(ib - ia),
      o = dir > 0 ? ia : l.s.length - 1 - ia,
      mid = l.s.slice(Math.min(ia, ib), Math.max(ia, ib) + 1);
    if (dir < 0) mid.reverse();
    out.push({ l: l, n: n, d: deps(l, o, 3), mid: mid });
  });
  return out.sort(function (x, y) {
    return x.n - y.n;
  });
}
function qr(code) {
  var h = 0,
    i,
    j,
    g = [];
  for (i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  for (i = 0; i < 11; i++)
    for (j = 0; j < 11; j++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if (
        (i < 3 && j < 3) ||
        (i < 3 && j > 7) ||
        (i > 7 && j < 3) ||
        (h >> 16) % 2
      )
        g.push('<rect x="' + j + '" y="' + i + '" width="1" height="1"/>');
    }
  return (
    '<svg viewBox="0 0 11 11" width="78" height="78" fill="currentColor">' +
    g.join("") +
    "</svg>"
  );
}
function map() {
  var h =
    '<svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice"><rect width="360" height="230" style="fill:var(--map)"/><path d="M0,120 C45,140 25,200 70,230 L0,230Z" style="fill:var(--sea)"/>';
  [
    [0, 40, 360, 70],
    [60, 0, 180, 230],
    [0, 150, 360, 120],
    [250, 0, 300, 230],
  ].forEach(function (r) {
    h +=
      '<line x1="' +
      r[0] +
      '" y1="' +
      r[1] +
      '" x2="' +
      r[2] +
      '" y2="' +
      r[3] +
      '" stroke-width="7" style="stroke:var(--road)"/>';
  });
  L.forEach(function (l) {
    var pts = l.s
      .map(function (s) {
        return POS[s].join(",");
      })
      .join(" ");
    h +=
      '<polyline points="' +
      pts +
      '" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><polyline points="' +
      pts +
      '" fill="none" stroke="' +
      l.c +
      '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  ST.forEach(function (s) {
    var p = POS[s];
    h +=
      '<circle cx="' +
      p[0] +
      '" cy="' +
      p[1] +
      '" r="5" fill="#fff" stroke="#24352b" stroke-width="2"/><text x="' +
      (p[0] + (p[0] > 280 ? -8 : 8)) +
      '" y="' +
      (p[1] + 16) +
      '" font-size="9" font-weight="700" text-anchor="' +
      (p[0] > 280 ? "end" : "start") +
      '" style="fill:var(--tx)">' +
      s +
      "</text>";
  });
  L.forEach(function (l, i) {
    var d =
      "M" +
      l.s
        .map(function (s) {
          return POS[s].join(",");
        })
        .join(" L");
    h +=
      '<circle r="6" fill="' +
      l.c +
      '" stroke="#fff" stroke-width="2.5"><animateMotion dur="' +
      (16 + i * 5) +
      's" repeatCount="indefinite" path="' +
      d +
      '"/></circle>';
  });
  return h + "</svg>";
}
function planner() {
  return (
    '<div class="card sc"><div class="pl"><span class="d"></span><select data-k="from">' +
    opts(ST, S.from) +
    '</select><span></span><span class="ln"></span><span></span><button class="btn sw" data-a="swap" style="justify-self:end;grid-row:2/4;grid-column:3">⇅</button><span class="d e"></span><select data-k="to">' +
    opts(ST, S.to) +
    '</select></div><button class="btn p" style="margin-top:12px" data-a="search">Voir les bus</button></div>'
  );
}
function price(b) {
  return b.ty == "u"
    ? LN(b.ln).p
    : b.ty == "s"
      ? Math.round((LN(b.ln).p * 0.7) / 50) * 50
      : b.ty == "w"
        ? 3000
        : 10000;
}
function seg(l, a, b) {
  var ia = l.s.indexOf(a),
    ib = l.s.indexOf(b),
    dir = ib > ia ? 1 : -1,
    n = Math.abs(ib - ia),
    o = dir > 0 ? ia : l.s.length - 1 - ia,
    mid = l.s.slice(Math.min(ia, ib), Math.max(ia, ib) + 1);
  if (dir < 0) mid.reverse();
  return { l: l, n: n, d: deps(l, o, 3), mid: mid };
}
function transfer(a, b) {
  var best = null;
  L.forEach(function (l1) {
    if (l1.s.indexOf(a) < 0) return;
    L.forEach(function (l2) {
      if (l2 == l1 || l2.s.indexOf(b) < 0) return;
      l1.s.forEach(function (h) {
        if (h == a || h == b || l2.s.indexOf(h) < 0) return;
        var x = seg(l1, a, h),
          y = seg(l2, h, b),
          t = x.n + y.n;
        if (!best || t < best.t) best = { x: x, y: y, h: h, t: t };
      });
    });
  });
  return best;
}
function transferCard(r) {
  var d0 = r.x.d[0],
    tot = r.t * 4 + 6;
  return (
    '<div class="card"><div class="row"><div>' +
    lb(r.x.l) +
    "→ " +
    lb(r.y.l) +
    '</div><span class="badge" style="background:var(--g);color:#fff">CORRESPONDANCE</span></div><div class="row" style="margin:12px 0 4px"><div><div class="big">' +
    tot +
    ' min</div><div class="mu">via ' +
    r.h +
    " · " +
    (r.x.l.p + r.y.l.p) +
    " FCFA</div></div>" +
    (d0
      ? '<div style="text-align:right"><span class="live">' +
        rel(d0) +
        '</span><div class="mu" style="margin-top:4px">' +
        fm(d0) +
        " → " +
        fm(d0 + tot) +
        "</div></div>"
      : "") +
    "</div>" +
    [r.x, r.y]
      .map(function (s, i) {
        return (
          '<div class="tl" style="--c:' +
          s.l.c +
          '"><div><b>' +
          s.l.id +
          " · " +
          s.l.n +
          "</b></div>" +
          s.mid
            .map(function (m) {
              return "<div>" + m + "</div>";
            })
            .join("") +
          "</div>" +
          (i == 0
            ? '<div class="mu" style="margin:8px 0 0 4px">🔁 Changement à ' +
              r.h +
              " (environ 6 min d'attente)</div>"
            : "")
        );
      })
      .join("") +
    '<button class="btn p" style="margin-top:14px" data-a="buy" data-l="' +
    r.x.l.id +
    '">🎫 Acheter les billets</button></div>'
  );
}
var V = {
  home: function () {
    var a = [
      [
        "#d97706",
        "⚠️",
        "L1",
        "Trafic ralenti à Mont-Bouët (travaux), prévoir +10 min",
      ],
      [
        "#1d6fd8",
        "ℹ️",
        "L2",
        "Passages renforcés pour la rentrée universitaire",
      ],
      ["#0b7d4b", "✅", "L3", "Circulation normale"],
    ];
    return (
      '<div class="top"><h1>Bonjour 👋<br>Où allez-vous ?</h1><span class="badge">PROTOTYPE<br>DONNÉES FICTIVES</span></div><div class="mapc">' +
      map() +
      "</div>" +
      planner() +
      '<div class="chips"><button class="chip" data-a="quick" data-f="Owendo" data-t="Akanda">🏠 Owendo → Akanda</button><button class="chip" data-a="quick" data-f="Aéroport" data-t="Université">🎓 Aéroport → Université</button><button class="chip" data-a="quick" data-f="PK8" data-t="Glass">💼 PK8 → Glass</button></div>' +
      '<div class="card"><h2>Prochains passages · Glass</h2>' +
      L.map(function (l) {
        var i = l.s.indexOf("Glass"),
          d = deps(l, i, 1)[0];
        return (
          '<div class="dp">' +
          lb(l) +
          '<div class="grow"><b>' +
          l.n +
          '</b><div class="mu">Toutes les ' +
          l.f +
          " min</div></div>" +
          (d
            ? '<span class="live">' + rel(d) + "</span>"
            : '<span class="mu">Terminé</span>') +
          "</div>"
        );
      }).join("") +
      "</div>" +
      '<div class="card"><h2>Infos trafic</h2>' +
      a
        .slice()
        .sort(function (p, q) {
          return (S.fav.indexOf(q[2]) >= 0) - (S.fav.indexOf(p[2]) >= 0);
        })
        .map(function (x) {
          return (
            '<div class="al" style="--c:' +
            x[0] +
            ";background:color-mix(in srgb," +
            x[0] +
            ' 10%,transparent)"><span>' +
            x[1] +
            "</span><div>" +
            (S.fav.indexOf(x[2]) >= 0 ? "⭐ " : "") +
            lb(LN(x[2])) +
            x[3] +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  },
  trajet: function () {
    var h =
      '<div class="top"><h1>Planifier<br>un trajet</h1></div>' + planner();
    if (S.go) {
      var r = routes(S.from, S.to);
      if (S.from == S.to)
        h += '<div class="card mu">Choisis deux arrêts différents.</div>';
      else if (!r.length) {
        var tr = transfer(S.from, S.to);
        h += tr
          ? transferCard(tr)
          : '<div class="card"><h2>🚧 Aucun itinéraire</h2><div class="mu">Aucune ligne ne relie ces deux arrêts dans ce réseau fictif.</div></div>';
      }
      r.forEach(function (x, i) {
        var d0 = x.d[0];
        h +=
          '<div class="card" style="--c:' +
          x.l.c +
          '"><div class="row"><div>' +
          lb(x.l) +
          "<b>" +
          x.l.n +
          "</b></div>" +
          (i == 0
            ? '<span class="badge" style="background:var(--g);color:#fff">LE PLUS RAPIDE</span>'
            : "") +
          "</div>" +
          '<div class="row" style="margin:12px 0 4px"><div><div class="big">' +
          x.n * 4 +
          ' min</div><div class="mu">' +
          x.n +
          " arrêt(s) · " +
          x.l.p +
          " FCFA</div></div>" +
          (d0
            ? '<div style="text-align:right"><span class="live">' +
              rel(d0) +
              '</span><div class="mu" style="margin-top:4px">' +
              fm(d0) +
              " → " +
              fm(d0 + x.n * 4) +
              "</div></div>"
            : '<span class="mu">Service terminé</span>') +
          "</div>" +
          (x.d.length
            ? "<div>" +
              x.d
                .map(function (t) {
                  return '<span class="dep">' + fm(t) + "</span>";
                })
                .join("") +
              "</div>"
            : "") +
          '<div class="tl">' +
          x.mid
            .map(function (s) {
              return "<div>" + s + "</div>";
            })
            .join("") +
          '</div><button class="btn p" style="margin-top:14px" data-a="buy" data-l="' +
          x.l.id +
          '">🎫 Acheter un billet</button></div>';
      });
    }
    return h;
  },
  lignes: function () {
    return (
      '<div class="top"><h1>Toutes<br>les lignes</h1></div>' +
      L.map(function (l) {
        return (
          '<div class="card" style="--c:' +
          l.c +
          '"><div class="row"><div>' +
          lb(l) +
          "<b>" +
          l.n +
          "</b></div><b>" +
          l.p +
          ' FCFA</b></div><div class="mu">Toutes les ' +
          l.f +
          ' min · 05:30 – 21:00</div><button class="chip" style="margin-top:8px;box-shadow:none;background:var(--in)" data-a="fav" data-l="' +
          l.id +
          '">' +
          (S.fav.indexOf(l.id) >= 0
            ? "🔔 Ligne suivie"
            : "🔕 Suivre cette ligne") +
          '</button><div class="tl">' +
          l.s
            .map(function (s) {
              return "<div>" + s + "</div>";
            })
            .join("") +
          "</div></div>"
        );
      }).join("")
    );
  },
  billets: function () {
    var b = S.buy,
      pr = price(b),
      o = function (v, t) {
        return (
          '<option value="' +
          v +
          '"' +
          (b.ty == v ? " selected" : "") +
          ">" +
          t +
          "</option>"
        );
      };
    var h =
      '<div class="top"><h1>Mes<br>billets</h1></div><div class="card"><h2>Acheter</h2><div class="row"><select data-k="ty">' +
      o("u", "Ticket 1 trajet") +
      o("s", "Ticket étudiant −30 %") +
      o("w", "Pass semaine") +
      o("m", "Pass mensuel") +
      "</select>" +
      (b.ty == "u" || b.ty == "s"
        ? '<select data-k="ln">' + opts(L, b.ln) + "</select>"
        : "") +
      "</div>" +
      '<div class="mu" style="margin-top:12px">Payer avec (simulation)</div><div class="ops">' +
      [
        ["Airtel Money", "#e5252a"],
        ["Moov Money", "#1d6fd8"],
        ["Mobicash", "#f28c00"],
      ]
        .map(function (x) {
          return (
            '<button class="op ' +
            (b.op == x[0] ? "on" : "") +
            '" style="--c:' +
            x[1] +
            '" data-a="op" data-o="' +
            x[0] +
            '"><i></i>' +
            x[0] +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<input data-k="ph" inputmode="tel" placeholder="📱 Numéro mobile money" value="' +
      b.ph +
      '"><button class="btn p" style="margin-top:12px" data-a="pay">Payer ' +
      pr.toLocaleString("fr-FR") +
      ' FCFA</button><div class="mu" style="margin-top:8px;text-align:center">Aucun vrai paiement n\'est effectué.</div></div>';
    h +=
      '<div class="card"><h2>Portefeuille</h2>' +
      (S.tk.length
        ? S.tk
            .map(function (t) {
              return (
                '<div class="wt"><div class="qb">' +
                qr(t.c) +
                '</div><div><b style="font-size:17px">' +
                t.n +
                '</b><div style="opacity:.85;font-size:13px">' +
                t.c +
                '</div><div style="opacity:.85;font-size:13px">Valide jusqu\'à ' +
                t.v +
                "</div></div></div>"
              );
            })
            .join("") +
          '<div class="mu" style="margin-top:10px">QR fictif : simple illustration.</div>'
        : '<div class="mu">Aucun billet pour le moment.</div>') +
      "</div>";
    return h;
  },
  cnt: function () {
    var c = S.stats.signalementsParLigne || {},
      base = { L1: 5200, L2: 3100, L3: 4180 },
      hr = [2, 6, 9, 7, 4, 3, 4, 5, 6, 8, 9, 5, 3],
      top = "";
    L.forEach(function (l) {
      if ((c[l.id] || 0) > (c[top] || 0)) top = l.id;
    });
    var K = function (v, l, col) {
      return (
        '<div style="background:var(--in);border-radius:14px;padding:12px"><div class="mu">' +
        l +
        '</div><div class="big" style="font-size:22px;margin-top:4px;color:' +
        (col || "var(--tx)") +
        '">' +
        v +
        "</div></div>"
      );
    };
    return (
      '<div class="top"><h1>Espace<br>CNT</h1><span class="badge">DÉMO · FICTIF</span></div><div class="card"><div class="mu" style="margin-bottom:10px">Vue réservée au personnel de la CNT. La fréquentation et les heures de pointe restent inventées ; les billets vendus et les signalements viennent du serveur.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      K(
        (12480 + S.stats.totalBillets).toLocaleString("fr-FR"),
        "Voyages aujourd'hui",
      ) +
      K(S.stats.totalBillets, "Billets vendus (serveur)", "var(--g)") +
      K("5,4 M", "Recettes (FCFA)") +
      K(S.stats.totalSignalements, "Signalements (serveur)", "var(--g)") +
      "</div></div>" +
      '<div class="card"><h2>Fréquentation par ligne</h2>' +
      L.map(function (l) {
        return (
          '<div style="margin:8px 0"><div class="row"><span>' +
          lb(l) +
          l.n +
          "</span><b>" +
          base[l.id].toLocaleString("fr-FR") +
          '</b></div><div style="height:9px;background:var(--in);border-radius:6px;margin-top:4px"><div style="height:100%;width:' +
          base[l.id] / 52 +
          "%;background:" +
          l.c +
          ';border-radius:6px"></div></div></div>'
        );
      }).join("") +
      "</div>" +
      '<div class="card"><h2>Heures de pointe</h2><div style="display:flex;align-items:flex-end;gap:4px;height:90px">' +
      hr
        .map(function (v) {
          return (
            '<div style="flex:1;height:' +
            (v / 9) * 100 +
            '%;background:linear-gradient(#1d6fd8,#0b7d4b);border-radius:5px 5px 0 0"></div>'
          );
        })
        .join("") +
      '</div><div class="row mu" style="margin-top:4px"><span>6h</span><span>9h</span><span>12h</span><span>15h</span><span>18h</span></div></div>' +
      '<div class="card"><h2>Signalements par ligne</h2>' +
      L.map(function (l) {
        return (
          '<div class="dp">' +
          lb(l) +
          '<div class="grow">' +
          l.n +
          "</div><b>" +
          (c[l.id] || 0) +
          "</b></div>"
        );
      }).join("") +
      (top
        ? '<div class="al" style="--c:#d97706;background:color-mix(in srgb,#d97706 10%,transparent);margin:10px 0 0"><span>⚠️</span><div>' +
          top +
          " est la ligne la plus signalée : à examiner en priorité.</div></div>"
        : "") +
      "</div>"
    );
  },
  signaler: function () {
    var f = S.rf,
      T = [
        ["Retard", "⏱️"],
        ["Bus bondé", "👥"],
        ["Incident", "🚨"],
        ["Propreté", "🧹"],
        ["Sécurité", "🛡️"],
        ["Autre", "💬"],
      ];
    return (
      '<div class="top"><h1>Signaler<br>un problème</h1></div><div class="card"><div class="tiles">' +
      T.map(function (t) {
        return (
          '<button class="tile ' +
          (f.t == t[0] ? "on" : "") +
          '" data-a="rt" data-t="' +
          t[0] +
          '"><b>' +
          t[1] +
          "</b>" +
          t[0] +
          "</button>"
        );
      }).join("") +
      '</div><select data-k="rl">' +
      opts(L, f.l) +
      '</select><textarea data-k="rc" rows="3" style="margin-top:8px" placeholder="Décris la situation (optionnel)">' +
      f.c +
      '</textarea><button class="btn p" style="margin-top:12px" data-a="rep">Envoyer le signalement</button></div>' +
      '<div class="card"><h2>Signalements récents</h2>' +
      S.rp
        .map(function (r) {
          return (
            '<div class="dp">' +
            lb(LN(r.l)) +
            '<div class="grow"><b>' +
            r.t +
            "</b><div>" +
            (r.c || "") +
            '</div><div class="mu">' +
            r.w +
            "</div></div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  },
};
function render() {
  $("app").innerHTML = V[S.v]();
  $("nav").innerHTML = [
    ["home", "🏠", "Accueil"],
    ["trajet", "🧭", "Trajet"],
    ["lignes", "🗺️", "Lignes"],
    ["billets", "🎫", "Billets"],
    ["signaler", "📣", "Signaler"],
    ["cnt", "📊", "CNT"],
  ]
    .map(function (x) {
      return (
        '<button class="' +
        (S.v == x[0] ? "on" : "") +
        '" data-a="nav" data-v="' +
        x[0] +
        '"><b>' +
        x[1] +
        "</b>" +
        x[2] +
        "</button>"
      );
    })
    .join("");
  var o = $("ov");
  o.hidden = !S.buy.st;
  o.style.display = S.buy.st ? "grid" : "none";
  o.innerHTML =
    '<div><div class="spin"></div>Validation sur ton téléphone…<br><span style="font-weight:400;opacity:.8">(simulation)</span></div>';
}
document.addEventListener("input", function (e) {
  var k = e.target.dataset.k;
  if (!k) return;
  var v = e.target.value;
  if (k == "from" || k == "to") S[k] = v;
  else if (k == "ty" || k == "ln" || k == "ph") S.buy[k] = v;
  else if (k == "rl") S.rf.l = v;
  else if (k == "rc") S.rf.c = v;
  if (k == "ty" || k == "ln") render();
});
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-a]");
  if (!b) return;
  var d = b.dataset,
    a = d.a,
    nav = 0;
  if (a == "nav") {
    S.v = d.v;
    nav = 1;
  } else if (a == "search") {
    S.v = "trajet";
    S.go = 1;
    nav = 1;
  } else if (a == "quick") {
    S.from = d.f;
    S.to = d.t;
    S.v = "trajet";
    S.go = 1;
    nav = 1;
  } else if (a == "swap") {
    var t = S.from;
    S.from = S.to;
    S.to = t;
  } else if (a == "buy") {
    S.v = "billets";
    S.buy.ty = "u";
    S.buy.ln = d.l;
    nav = 1;
  } else if (a == "op") {
    S.buy.op = d.o;
  } else if (a == "rt") {
    S.rf.t = d.t;
  } else if (a == "pay") {
    if (S.buy.st) return;
    if (S.buy.ph.replace(/\D/g, "").length < 8) {
      toast("Entre un numéro valide (8 chiffres ou plus)");
      return;
    }
    S.buy.st = 1;
    render();
    var ty = S.buy.ty,
      c = "CNT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      dt = new Date();
    dt.setDate(dt.getDate() + (ty == "w" ? 7 : 30));
    var billet = {
      code: c,
      type: ty,
      ligne: S.buy.ln,
      operateur: S.buy.op,
      nom:
        ty == "u"
          ? "Ticket " + S.buy.ln
          : ty == "s"
            ? "Ticket étudiant " + S.buy.ln
            : ty == "w"
              ? "Pass semaine"
              : "Pass mensuel",
      validite:
        ty == "u" || ty == "s"
          ? "ce soir 23:59"
          : dt.toLocaleDateString("fr-FR"),
    };
    setTimeout(function () {
      apiPost("/api/billets", billet)
        .then(function (saved) {
          S.tk.unshift({ c: saved.code, n: saved.nom, v: saved.validite });
          S.buy.st = 0;
          render();
          toast("✅ Paiement simulé réussi, billet ajouté");
        })
        .catch(function () {
          S.buy.st = 0;
          render();
          toast("⚠️ Le serveur ne répond pas, billet non enregistré");
        });
    }, 1200);
    return;
  } else if (a == "fav") {
    var fi = S.fav.indexOf(d.l);
    if (fi < 0) {
      S.fav.push(d.l);
      toast("🔔 Alertes activées pour " + d.l + " (démo)");
    } else S.fav.splice(fi, 1);
  } else if (a == "rep") {
    var sig = { type: S.rf.t, ligne: S.rf.l, commentaire: S.rf.c };
    apiPost("/api/signalements", sig)
      .then(function () {
        return apiGet("/api/signalements");
      })
      .then(function (list) {
        S.rp = list.map(function (x) {
          return {
            t: x.type,
            l: x.ligne,
            c: x.commentaire,
            w: new Date(x.date).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });
        S.rf.c = "";
        render();
        toast("Merci, signalement envoyé");
      })
      .catch(function () {
        toast("⚠️ Le serveur ne répond pas");
      });
    return;
  }
  render();
  if (nav) window.scrollTo(0, 0);
});
render();
Promise.all([
  apiGet("/api/billets"),
  apiGet("/api/signalements"),
  apiGet("/api/stats"),
])
  .then(function (r) {
    S.tk = r[0].map(function (x) {
      return { c: x.code, n: x.nom, v: x.validite };
    });
    S.rp = r[1].map(function (x) {
      return {
        t: x.type,
        l: x.ligne,
        c: x.commentaire,
        w: new Date(x.date).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
    S.stats = r[2];
    render();
  })
  .catch(function () {
    toast('⚠️ Serveur injoignable : lance "npm start" dans le terminal');
  });
var sp = $("sp"),
  hide = function () {
    sp.style.opacity = 0;
    setTimeout(function () {
      sp.remove();
    }, 500);
  };
sp.onclick = hide;
setTimeout(hide, 1200);
