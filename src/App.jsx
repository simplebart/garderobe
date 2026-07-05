import { useState, useEffect, useRef } from "react";
import { Shirt, Plus, Trash2, WashingMachine, RefreshCw, CloudRain, Sun, Cloud, Check, Sparkles, Camera, Settings2, X, Download, Upload, Pencil } from "lucide-react";

// ---------- Constanten ----------
const KLEUREN = {
  navy: "#1F2E4D",
  ivoor: "#F7F5EF",
  wit: "#FFFFFF",
  groen: "#3E6B4F",
  bordeaux: "#7C2D3A",
  goud: "#C9A86A",
  grijs: "#6B7280",
  lijn: "#E3DFD4",
};

// ---------- Temperatuurbanden ----------
// Elk kledingstuk krijgt één of meer banden waarin het draagbaar is.
// Voorbeeld: wollen pantalon = "< 0°" + "0–10°" + "10–15°" + "15–20°",
// maar niet de banden daarboven — boven de 20° wordt hij te warm.
const TEMP_BANDEN = [
  { id: "b_min0", label: "< 0°", min: -Infinity, max: 0 },
  { id: "b_0", label: "0–10°", min: 0, max: 10 },
  { id: "b_10", label: "10–15°", min: 10, max: 15 },
  { id: "b_15", label: "15–20°", min: 15, max: 20 },
  { id: "b_20", label: "20–25°", min: 20, max: 25 },
  { id: "b_25", label: "25–30°", min: 25, max: 30 },
  { id: "b_30", label: "30°+", min: 30, max: Infinity },
];
const ALLE_BANDEN = TEMP_BANDEN.map((b) => b.id);
const bandVanTemp = (t) => (TEMP_BANDEN.find((b) => t >= b.min && t < b.max) || TEMP_BANDEN[2]).id;

// Migratie van de oude grove klassen (koud/mild/warm/alle) naar banden,
// zodat bestaande items niets merken van de overstap.
const WARMTE_NAAR_BANDEN = {
  koud: ["b_min0", "b_0"],
  mild: ["b_10", "b_15"],
  warm: ["b_20", "b_25", "b_30"],
  alle: ALLE_BANDEN,
};

// Leesbare samenvatting: aaneengesloten banden worden samengevoegd,
// dus b.v. "< 0°" t/m "15–20°" wordt gewoon "tot 20°".
function tempTekst(banden) {
  if (!banden?.length || banden.length === TEMP_BANDEN.length) return "alle temperaturen";
  const gekozen = TEMP_BANDEN.map((b, i) => ({ ...b, i })).filter((b) => banden.includes(b.id));
  const segmenten = [];
  let start = null, vorige = null;
  for (const b of gekozen) {
    if (start === null) { start = b; vorige = b; continue; }
    if (b.i === vorige.i + 1) { vorige = b; continue; }
    segmenten.push([start, vorige]);
    start = b; vorige = b;
  }
  if (start) segmenten.push([start, vorige]);
  return segmenten
    .map(([a, z]) => {
      if (a.i === 0 && z.i === TEMP_BANDEN.length - 1) return "alle temperaturen";
      if (a.i === 0) return `tot ${z.max}°`;
      if (z.i === TEMP_BANDEN.length - 1) return `vanaf ${a.min}°`;
      return `${a.min}–${z.max}°`;
    })
    .join(" · ");
}

const CATEGORIEEN = [
  { id: "top", label: "Bovenstuk" },
  { id: "broek", label: "Broek / rok" },
  { id: "schoenen", label: "Schoenen" },
  { id: "jas", label: "Jas" },
  { id: "accessoire", label: "Accessoire" },
];

const PASVORMEN = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Regular" },
  { id: "ruim", label: "Ruim / oversized" },
];

const LAGEN = [
  { id: "basis", label: "Basislaag (hemd, t-shirt, polo)" },
  { id: "over", label: "Overlaag (trui, vest, hoodie)" },
];

// Startlijsten — via "Kleuren & stijlen aanpassen" in de app uit te breiden
// of in te korten; de aangepaste lijsten worden opgeslagen.
const STANDAARD_KLEUREN = [
  { id: "wit", label: "Wit", hex: "#F5F5F5" },
  { id: "creme", label: "Crème / off-white", hex: "#EFE7D5" },
  { id: "beige", label: "Beige / kaki", hex: "#C9B28A" },
  { id: "lichtblauw", label: "Lichtblauw", hex: "#A8C4E0" },
  { id: "navy", label: "Navy", hex: "#1F2E4D" },
  { id: "grijs", label: "Grijs", hex: "#8A8F98" },
  { id: "zwart", label: "Zwart", hex: "#1C1C1C" },
  { id: "groen", label: "Groen", hex: "#3E6B4F" },
  { id: "bordeaux", label: "Bordeaux / rood", hex: "#7C2D3A" },
  { id: "bruin", label: "Bruin / cognac", hex: "#7A5233" },
  { id: "anders", label: "Anders / gemengd", hex: "#B8A6C9" },
];

const STANDAARD_STIJLEN = ["Modern preppy", "Casual", "Smart casual", "Sportief", "Klassiek"];

const VOORBEELD_ITEMS = [
  { naam: "Oxford overhemd (lichtblauw)", merk: "", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "lichtblauw", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 1 },
  { naam: "Poloshirt (navy)", merk: "", categorie: "top", laag: "basis", pasvorm: "slim", kleur: "navy", patroon: false, warmte: "warm", stijl: "Modern preppy", maxDraag: 1 },
  { naam: "Linnen overhemd (wit)", merk: "", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "warm", stijl: "Smart casual", maxDraag: 1 },
  { naam: "Geruit flanellen hemd", merk: "", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "bordeaux", patroon: true, warmte: "koud", stijl: "Casual", maxDraag: 1 },
  { naam: "Wit t-shirt", merk: "", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "alle", stijl: "Casual", maxDraag: 1 },
  { naam: "Kabeltrui (crème)", merk: "", categorie: "top", laag: "over", pasvorm: "regular", kleur: "creme", patroon: false, warmte: "koud", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Gestreept rugbyshirt", merk: "", categorie: "top", laag: "over", pasvorm: "ruim", kleur: "navy", patroon: true, warmte: "mild", stijl: "Modern preppy", maxDraag: 2 },
  { naam: "V-hals vest (navy)", merk: "", categorie: "top", laag: "over", pasvorm: "slim", kleur: "navy", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Chino (beige)", merk: "", categorie: "broek", pasvorm: "slim", kleur: "beige", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Chino (navy)", merk: "", categorie: "broek", pasvorm: "regular", kleur: "navy", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Wollen pantalon (grijs, geruit)", merk: "", categorie: "broek", pasvorm: "ruim", kleur: "grijs", patroon: true, warmte: "koud", stijl: "Klassiek", maxDraag: 3 },
  { naam: "Korte broek (kaki)", merk: "", categorie: "broek", pasvorm: "regular", kleur: "beige", patroon: false, warmte: "warm", stijl: "Casual", maxDraag: 2 },
  { naam: "Loafers (bruin leer)", merk: "", categorie: "schoenen", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 10, regenOk: false },
  { naam: "Witte sneakers", merk: "", categorie: "schoenen", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "alle", stijl: "Casual", maxDraag: 10, regenOk: true },
  { naam: "Chelsea boots", merk: "", categorie: "schoenen", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "koud", stijl: "Smart casual", maxDraag: 10, regenOk: true },
  { naam: "Trenchcoat", merk: "", categorie: "jas", pasvorm: "regular", kleur: "beige", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 10, regenOk: true },
  { naam: "Wollen overjas (camel)", merk: "", categorie: "jas", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "koud", stijl: "Klassiek", maxDraag: 10, regenOk: false },
  { naam: "Harrington jack", merk: "", categorie: "jas", pasvorm: "regular", kleur: "navy", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 10, regenOk: true },
  { naam: "Leren riem (bruin)", merk: "", categorie: "accessoire", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 30 },
  { naam: "Wollen sjaal (tartan)", merk: "", categorie: "accessoire", pasvorm: "regular", kleur: "bordeaux", patroon: true, warmte: "koud", stijl: "Modern preppy", maxDraag: 10 },
  { naam: "Horloge (leren band)", merk: "", categorie: "accessoire", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Klassiek", maxDraag: 30 },
];

const DAGNAMEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const OPSLAG_SLEUTEL = "garderobe-app-v4";

// ---------- Seizoenen ----------
const SEIZOENEN = [
  { id: "lente", label: "Lente" },
  { id: "zomer", label: "Zomer" },
  { id: "herfst", label: "Herfst" },
  { id: "winter", label: "Winter" },
];

// Trefwoorden in de naam die een seizoen verraden. Wordt gecombineerd met de
// temperatuurklasse: staat er een trefwoord in de naam, dan wint dat; anders
// bepaalt de warmte het seizoen (koud -> herfst/winter, warm -> zomer,
// mild -> lente/herfst, alle -> alle vier).
const SEIZOEN_TREFWOORDEN = [
  { woorden: ["trui", "sweater", "hoodie", "kabel", "wol", "fleece", "gebreid", "coltrui", "flanel"], seizoenen: ["herfst", "winter"] },
  { woorden: ["short", "korte broek", "zwembroek", "linnen", "sandaal", "slipper", "espadrille"], seizoenen: ["zomer"] },
  { woorden: ["winterjas", "overjas", "parka", "dons", "puffer", "snowboot"], seizoenen: ["winter"] },
  { woorden: ["sjaal", "muts", "handschoen", "thermo"], seizoenen: ["herfst", "winter"] },
  { woorden: ["trench", "regenjas", "harrington", "windjack"], seizoenen: ["lente", "herfst"] },
  { woorden: ["zonnebril", "pet", "cap", "strohoed"], seizoenen: ["lente", "zomer"] },
];

const BAND_NAAR_SEIZOEN = {
  b_min0: ["winter"],
  b_0: ["herfst", "winter"],
  b_10: ["lente", "herfst"],
  b_15: ["lente", "herfst"],
  b_20: ["lente", "zomer"],
  b_25: ["zomer"],
  b_30: ["zomer"],
};

function afleidSeizoenen(item) {
  const naam = (item.naam || "").toLowerCase();
  const gevonden = new Set();
  for (const regel of SEIZOEN_TREFWOORDEN) {
    if (regel.woorden.some((w) => naam.includes(w))) {
      regel.seizoenen.forEach((s) => gevonden.add(s));
    }
  }
  if (!gevonden.size) {
    (item.tempBanden || ALLE_BANDEN).forEach((b) => (BAND_NAAR_SEIZOEN[b] || []).forEach((s) => gevonden.add(s)));
  }
  const lijst = SEIZOENEN.map((s) => s.id).filter((id) => gevonden.has(id));
  return lijst.length ? lijst : SEIZOENEN.map((s) => s.id);
}

const seizoenTekst = (lijst) => {
  if (!lijst?.length || lijst.length === 4) return "alle seizoenen";
  return SEIZOENEN.filter((s) => lijst.includes(s.id)).map((s) => s.label.toLowerCase()).join(" · ");
};

// ---------- Hulpfuncties ----------
const nieuwId = () => Math.random().toString(36).slice(2, 10);


const vandaagISO = () => new Date().toISOString().slice(0, 10);
const dagLabel = (datumISO) => {
  if (datumISO === vandaagISO()) return "vandaag";
  return DAGNAMEN[new Date(datumISO + "T12:00:00").getDay()];
};
const isVerleden = (datumISO) => datumISO < vandaagISO();
const planNogGeldig = (plan) => plan?.length > 0 && vandaagISO() <= plan[plan.length - 1].datum;
const formatteerDatum = (datumISO) => {
  const d = new Date(datumISO + "T12:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const demoWeer = () => {
  const basis = 8 + Math.random() * 14;
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      datum: d.toISOString().slice(0, 10),
      temp: Math.round(basis + (Math.random() * 8 - 4)),
      regenkans: Math.round(Math.random() * 100),
    };
  });
};

// Verkleint een gekozen foto tot max 320px en comprimeert naar JPEG, zodat
// tientallen foto's samen ruim binnen de localStorage-limiet (±5MB) blijven.
function comprimeerFoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 320;
        const schaal = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * schaal);
        canvas.height = Math.round(img.height * schaal);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("Afbeelding onleesbaar"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Bestand onleesbaar"));
    reader.readAsDataURL(file);
  });
}

// Zet een vrije naam om naar een kleur-id ("Olijfgroen" -> "olijfgroen")
const naarId = (naam) =>
  naam.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

// Vult ontbrekende velden aan bij oudere items — inclusief seizoenen, zodat
// alles wat je al hebt ingevoerd automatisch een seizoen krijgt zonder dat je
// het opnieuw hoeft te doen. Handmatig aangepaste seizoenen blijven staan.
function normaliseerItem(it) {
  const basis = {
    pasvorm: "regular",
    laag: it.categorie === "top" ? "basis" : undefined,
    kleur: "anders",
    patroon: false,
    merk: "",
    foto: null,
    ...it,
  };
  // Oude items met een grove warmteklasse krijgen automatisch de
  // bijbehorende temperatuurbanden; niets hoeft opnieuw ingevoerd.
  if (!Array.isArray(basis.tempBanden) || !basis.tempBanden.length) {
    basis.tempBanden = WARMTE_NAAR_BANDEN[basis.warmte] || ALLE_BANDEN;
  }
  if (!Array.isArray(basis.seizoenen) || !basis.seizoenen.length) {
    basis.seizoenen = afleidSeizoenen(basis);
  }
  return basis;
}

// ---------- Stijlregels ----------
const pasvormOk = (bovenRuim, broek) => !(bovenRuim && (broek.pasvorm || "regular") === "slim");

const KLEUR_CLASHES = [["navy", "zwart"], ["bruin", "zwart"]];
const kleurenBotsen = (a, b) => {
  if (!a || !b || a === "anders" || b === "anders") return false;
  if (a === b) return true;
  return KLEUR_CLASHES.some((p) => p.includes(a) && p.includes(b));
};

// ---------- Outfitgenerator ----------
function genereerDag(items, dag, stijl, vermijden = new Set()) {
  const dagBand = bandVanTemp(dag.temp);
  const regent = dag.regenkans >= 50;
  const vandaag = new Set();

  const kies = (categorie, extraFilter = () => true) => {
    const kandidaten = items.filter(
      (it) =>
        it.categorie === categorie &&
        !it.vies &&
        (it.tempBanden || ALLE_BANDEN).includes(dagBand) &&
        !vandaag.has(it.id) &&
        extraFilter(it)
    );
    const lagen = [
      kandidaten.filter((it) => it.stijl === stijl && !vermijden.has(it.id)),
      kandidaten.filter((it) => it.stijl === stijl),
      kandidaten.filter((it) => !vermijden.has(it.id)),
      kandidaten,
    ];
    for (const laag of lagen) {
      const pool = regent && categorie === "schoenen" ? laag.filter((it) => it.regenOk !== false) : laag;
      const bruikbaar = pool.length ? pool : laag;
      if (bruikbaar.length) {
        const keuze = bruikbaar[Math.floor(Math.random() * bruikbaar.length)];
        vandaag.add(keuze.id);
        return keuze;
      }
    }
    return null;
  };

  const kiesMetVoorkeur = (categorie, hard, voorkeur) =>
    kies(categorie, (it) => hard(it) && voorkeur(it)) || kies(categorie, hard);

  let basislaag = kies("top", (it) => (it.laag || "basis") === "basis");
  let alleenOverlaag = false;
  if (!basislaag) {
    basislaag = kies("top", (it) => it.laag === "over");
    alleenOverlaag = true;
  }

  const overlaag =
    !alleenOverlaag && dag.temp < 14
      ? kiesMetVoorkeur(
          "top",
          (it) => it.laag === "over",
          (it) => !kleurenBotsen(it.kleur, basislaag?.kleur) && !(it.patroon && basislaag?.patroon)
        )
      : undefined;

  const buitensteTop = overlaag || basislaag;
  const patronenBoven = [basislaag, overlaag].filter((it) => it?.patroon).length;

  const bovenRuim = [basislaag, overlaag].filter(Boolean).some((it) => (it.pasvorm || "regular") === "ruim");
  const broek = kiesMetVoorkeur(
    "broek",
    (it) => pasvormOk(bovenRuim, it),
    (it) => !kleurenBotsen(it.kleur, buitensteTop?.kleur) && !(it.patroon && patronenBoven >= 1)
  );

  const jas =
    dag.temp < 15 || regent
      ? kiesMetVoorkeur("jas", () => true, (it) => !kleurenBotsen(it.kleur, buitensteTop?.kleur))
      : undefined;

  const outfit = {
    basislaag,
    overlaag,
    broek,
    schoenen: kies("schoenen"),
    jas,
    accessoire: kies("accessoire") || undefined,
  };

  return { outfit, gebruikt: vandaag };
}

function genereerPlan(items, weerDagen, stijl) {
  let vorige = new Set();
  return weerDagen.map((dag) => {
    const { outfit, gebruikt } = genereerDag(items, dag, stijl, vorige);
    vorige = gebruikt;
    return { ...dag, outfit, gedragen: false };
  });
}

// ---------- Component ----------
export default function GarderobeApp() {
  const [items, setItems] = useState([]);
  const [stijl, setStijl] = useState("Modern preppy");
  const [kleuren, setKleuren] = useState(STANDAARD_KLEUREN);
  const [stijlen, setStijlen] = useState(STANDAARD_STIJLEN);
  const [weer, setWeer] = useState([]);
  const [weerBron, setWeerBron] = useState("demo");
  const [weerTijd, setWeerTijd] = useState(null);
  const [weerLaadt, setWeerLaadt] = useState(false);
  const [plan, setPlan] = useState([]);
  const [tab, setTab] = useState("planner");
  const [geladen, setGeladen] = useState(false);
  const [beheerOpen, setBeheerOpen] = useState(false);
  const [nieuweKleur, setNieuweKleur] = useState({ label: "", hex: "#888888" });
  const [nieuweStijl, setNieuweStijl] = useState("");
  const [nieuw, setNieuw] = useState({
    naam: "", merk: "", categorie: "top", laag: "basis", pasvorm: "regular",
    kleur: "navy", patroon: false, tempBanden: [...ALLE_BANDEN], stijl: "Modern preppy", maxDraag: 1, foto: null,
  });
  const eersteOpslag = useRef(true);
  const nieuwFotoInput = useRef(null);

  // ---- Synchronisatie via Google Sheets (Apps Script) ----
  const [syncConfig, setSyncConfig] = useState({ url: "", geheim: "" });
  const [syncStatus, setSyncStatus] = useState("uit"); // uit | bezig | ok | fout
  const [laatsteSync, setLaatsteSync] = useState(null);
  const negeerPush = useRef(true); // eerste render en net-opgehaalde data niet terugpushen
  const SYNC_SLEUTEL = "garderobe-sync-v1";

  // Laden uit localStorage (met migratie van oudere items)
  useEffect(() => {
    try {
      const r = localStorage.getItem(OPSLAG_SLEUTEL);
      if (r) {
        const data = JSON.parse(r);
        if (data.items) {
          setItems(data.items.map(normaliseerItem));
        }
        if (data.stijl) setStijl(data.stijl);
        if (data.kleuren?.length) setKleuren(data.kleuren);
        if (data.stijlen?.length) setStijlen(data.stijlen);
        if (planNogGeldig(data.plan)) setPlan(data.plan);
      }
    } catch (e) {
      /* nog niets opgeslagen of onleesbaar */
    }
    setGeladen(true);
    haalWeerOp();
    // Sync-instellingen zijn per apparaat (eenmalig invullen) en staan los
    // van de kastdata. Zijn ze aanwezig, dan halen we direct de laatste
    // versie uit Google Sheets op.
    try {
      const s = localStorage.getItem(SYNC_SLEUTEL);
      if (s) {
        const cfg = JSON.parse(s);
        if (cfg.url) {
          setSyncConfig(cfg);
          haalRemoteOp(cfg, true);
        }
      }
    } catch (e) { /* geen sync ingesteld */ }
  }, []);

  // Opslaan bij wijzigingen. Foto's maken de data groter; als de opslag vol
  // raakt, melden we dat in plaats van stilletjes te falen.
  useEffect(() => {
    if (!geladen) return;
    if (eersteOpslag.current) { eersteOpslag.current = false; return; }
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify({ items, stijl, plan, kleuren, stijlen }));
    } catch (e) {
      console.error("Opslaan mislukt", e);
      alert("Opslaan mislukt — waarschijnlijk is de browseropslag vol. Verwijder een paar foto's van kledingstukken en probeer opnieuw.");
    }
  }, [items, stijl, plan, kleuren, stijlen, geladen]);

  async function haalWeerOp() {
    setWeerLaadt(true);
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&daily=temperature_2m_max,precipitation_probability_max&forecast_days=5&timezone=auto"
      );
      if (!res.ok) throw new Error(`Open-Meteo antwoordde met status ${res.status}`);
      const d = await res.json();
      const dagen = d.daily.time.map((t, i) => ({
        datum: t,
        temp: Math.round(d.daily.temperature_2m_max[i]),
        regenkans: d.daily.precipitation_probability_max[i] ?? 0,
      }));
      setWeer(dagen);
      setWeerBron("live");
    } catch (e) {
      console.error("Live weer ophalen mislukt, demo-weer actief:", e);
      setWeer(demoWeer());
      setWeerBron("demo");
    }
    setWeerTijd(new Date());
    setWeerLaadt(false);
  }

  function maakPlan() {
    if (!weer.length) return;
    if (planNogGeldig(plan) && plan.some((d) => d.gedragen)) {
      const ok = window.confirm(
        "Je huidige 5-daagse plan loopt nog en bevat al gedragen outfits. Weet je zeker dat je een nieuw plan wilt maken?"
      );
      if (!ok) return;
    }
    setPlan(genereerPlan(items, weer, stijl));
  }

  function registreerGedragen(dagIndex) {
    const dag = plan[dagIndex];
    if (!dag || dag.gedragen) return;
    const gedragenIds = Object.values(dag.outfit).filter(Boolean).map((it) => it.id);
    setItems((prev) =>
      prev.map((it) => {
        if (!gedragenIds.includes(it.id)) return it;
        const teller = (it.draagTeller || 0) + 1;
        return { ...it, draagTeller: teller, vies: teller >= (it.maxDraag || 1) };
      })
    );
    setPlan((prev) => prev.map((d, i) => (i === dagIndex ? { ...d, gedragen: true } : d)));
  }

  function wasAlles() {
    setItems((prev) => prev.map((it) => ({ ...it, vies: false, draagTeller: 0 })));
  }

  function weerAfwijking(dag) {
    const actueel = weer.find((w) => w.datum === dag.datum);
    if (!actueel) return null;
    const tempVerschil = actueel.temp - dag.temp;
    const regenWissel = (actueel.regenkans >= 50) !== (dag.regenkans >= 50);
    if (Math.abs(tempVerschil) < 4 && !regenWissel) return null;
    return { actueel, tempVerschil, regenWissel };
  }

  function herzieDag(i) {
    const actueel = weer.find((w) => w.datum === plan[i].datum);
    if (!actueel) return;
    const vermijden = new Set();
    [plan[i - 1], plan[i + 1]].forEach((buurdag) => {
      if (!buurdag) return;
      Object.values(buurdag.outfit).filter(Boolean).forEach((it) => vermijden.add(it.id));
    });
    const { outfit } = genereerDag(items, actueel, stijl, vermijden);
    setPlan((prev) =>
      prev.map((d, j) => (j === i ? { ...d, temp: actueel.temp, regenkans: actueel.regenkans, outfit } : d))
    );
  }

  function voegToe() {
    if (!nieuw.naam.trim()) return;
    const kaal = {
      ...nieuw,
      naam: nieuw.naam.trim(),
      merk: nieuw.merk.trim(),
      id: nieuwId(),
      vies: false,
      draagTeller: 0,
      maxDraag: Number(nieuw.maxDraag) || 1,
      regenOk: true,
      laag: nieuw.categorie === "top" ? nieuw.laag : undefined,
    };
    kaal.seizoenen = afleidSeizoenen(kaal);
    setItems((prev) => [...prev, kaal]);
    setNieuw((n) => ({ ...n, naam: "", merk: "", foto: null }));
    if (nieuwFotoInput.current) nieuwFotoInput.current.value = "";
  }

  function verwijder(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function laadVoorbeeld() {
    setItems(VOORBEELD_ITEMS.map((it) => normaliseerItem({ ...it, id: nieuwId(), vies: false, draagTeller: 0, foto: null, regenOk: it.regenOk !== false })));
  }

  // ---- Seizoenen: filter en handmatig bijstellen ----
  const [seizoenFilter, setSeizoenFilter] = useState("alle");
  const [bewerkSeizoenId, setBewerkSeizoenId] = useState(null);

  function wisselSeizoen(itemId, seizoen) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const huidig = it.seizoenen || [];
        const nieuwLijst = huidig.includes(seizoen)
          ? huidig.filter((s) => s !== seizoen)
          : [...huidig, seizoen];
        // Minstens één seizoen laten staan, anders verdwijnt het item overal.
        return nieuwLijst.length ? { ...it, seizoenen: nieuwLijst } : it;
      })
    );
  }

  function wisselTempBand(itemId, band) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const huidig = it.tempBanden || [...ALLE_BANDEN];
        const nieuwLijst = huidig.includes(band)
          ? huidig.filter((b) => b !== band)
          : [...huidig, band];
        // Minstens één band laten staan, anders kan het item nooit gekozen worden.
        return nieuwLijst.length ? { ...it, tempBanden: nieuwLijst } : it;
      })
    );
  }

  async function kiesNieuweFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const foto = await comprimeerFoto(file);
      setNieuw((n) => ({ ...n, foto }));
    } catch (err) {
      alert("Foto kon niet gelezen worden.");
    }
  }

  async function wijzigItemFoto(id, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const foto = await comprimeerFoto(file);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, foto } : it)));
    } catch (err) {
      alert("Foto kon niet gelezen worden.");
    }
  }

  // ---- Beheer van kleuren en stijlen ----
  function voegKleurToe() {
    const label = nieuweKleur.label.trim();
    if (!label) return;
    const id = naarId(label);
    if (kleuren.some((k) => k.id === id)) {
      alert("Er bestaat al een kleur met (bijna) deze naam.");
      return;
    }
    setKleuren((prev) => [...prev, { id, label, hex: nieuweKleur.hex }]);
    setNieuweKleur({ label: "", hex: "#888888" });
  }

  function verwijderKleur(id) {
    const inGebruik = items.filter((it) => it.kleur === id).length;
    if (inGebruik > 0) {
      alert(`Deze kleur is in gebruik bij ${inGebruik} kledingstuk(ken). Wijzig die eerst.`);
      return;
    }
    if (kleuren.length <= 2) return;
    setKleuren((prev) => prev.filter((k) => k.id !== id));
  }

  function voegStijlToe() {
    const naam = nieuweStijl.trim();
    if (!naam) return;
    if (stijlen.some((s) => s.toLowerCase() === naam.toLowerCase())) {
      alert("Deze stijl bestaat al.");
      return;
    }
    setStijlen((prev) => [...prev, naam]);
    setNieuweStijl("");
  }

  function verwijderStijl(naam) {
    const inGebruik = items.filter((it) => it.stijl === naam).length;
    if (inGebruik > 0) {
      alert(`Deze stijl is in gebruik bij ${inGebruik} kledingstuk(ken). Wijzig die eerst.`);
      return;
    }
    if (stijlen.length <= 1) return;
    setStijlen((prev) => prev.filter((s) => s !== naam));
    if (stijl === naam) setStijl(stijlen.find((s) => s !== naam));
  }

  const aantalVies = items.filter((it) => it.vies).length;

  // Past een volledige dataset toe (gebruikt door zowel import als sync).
  function pasDataToe(data) {
    if (!Array.isArray(data.items)) return false;
    setItems(data.items.map(normaliseerItem));
    if (data.stijl) setStijl(data.stijl);
    if (data.kleuren?.length) setKleuren(data.kleuren);
    if (data.stijlen?.length) setStijlen(data.stijlen);
    setPlan(planNogGeldig(data.plan) ? data.plan : []);
    return true;
  }

  // Haalt de kast op uit Google Sheets. Bij succes vervangt de remote versie
  // de lokale (last-write-wins: het laatst gesynchroniseerde apparaat wint).
  async function haalRemoteOp(cfg = syncConfig, stil = false) {
    if (!cfg.url) return;
    setSyncStatus("bezig");
    try {
      const res = await fetch(`${cfg.url}?geheim=${encodeURIComponent(cfg.geheim)}`);
      const j = await res.json();
      if (j.fout) throw new Error(j.fout);
      if (j.data) {
        negeerPush.current = true; // net opgehaald: niet meteen terugpushen
        pasDataToe(j.data);
      }
      setSyncStatus("ok");
      setLaatsteSync(new Date());
      return j.data ? "gevuld" : "leeg";
    } catch (e) {
      console.error("Sync ophalen mislukt:", e);
      setSyncStatus("fout");
      if (!stil) alert("Ophalen uit Google Sheets mislukt. Controleer de URL en het geheim.");
      return null;
    }
  }

  // Slaat de huidige kast op in Google Sheets. Let op: Content-Type text/plain
  // is bewust — Apps Script accepteert geen CORS-preflight, en een "simpel"
  // POST-verzoek omzeilt die. Het script leest de JSON gewoon uit de body.
  async function slaRemoteOp(cfg = syncConfig, stil = true) {
    if (!cfg.url) return;
    setSyncStatus("bezig");
    try {
      const res = await fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ geheim: cfg.geheim, data: { items, stijl, plan, kleuren, stijlen } }),
      });
      const j = await res.json();
      if (j.fout) throw new Error(j.fout);
      setSyncStatus("ok");
      setLaatsteSync(new Date());
    } catch (e) {
      console.error("Sync opslaan mislukt:", e);
      setSyncStatus("fout");
      if (!stil) alert("Opslaan naar Google Sheets mislukt. Controleer de URL en het geheim.");
    }
  }

  // Eenmalige koppeling: instellingen bewaren, ophalen wat er staat, en als
  // het blad nog leeg is de huidige (lokale) kast als eerste versie uploaden.
  async function verbindSync() {
    const cfg = { url: syncConfig.url.trim(), geheim: syncConfig.geheim.trim() };
    if (!cfg.url.startsWith("https://script.google.com/")) {
      alert("Vul de web-app-URL van je Apps Script in (begint met https://script.google.com/…).");
      return;
    }
    localStorage.setItem(SYNC_SLEUTEL, JSON.stringify(cfg));
    setSyncConfig(cfg);
    const resultaat = await haalRemoteOp(cfg, false);
    if (resultaat === "leeg" && items.length) {
      await slaRemoteOp(cfg, false);
    }
  }

  function ontkoppelSync() {
    localStorage.removeItem(SYNC_SLEUTEL);
    setSyncConfig({ url: "", geheim: "" });
    setSyncStatus("uit");
    setLaatsteSync(null);
  }

  // Automatisch pushen: elke wijziging wordt na 2,5s rust naar het blad
  // geschreven (debounce, zodat snel achter elkaar klikken één upload wordt).
  useEffect(() => {
    if (!geladen || !syncConfig.url) return;
    if (negeerPush.current) { negeerPush.current = false; return; }
    const timer = setTimeout(() => slaRemoteOp(), 2500);
    return () => clearTimeout(timer);
  }, [items, stijl, plan, kleuren, stijlen]);

  // ---- Overzetten tussen apparaten (handmatige synchronisatie) ----
  // Exporteert de volledige kast (incl. foto's, kleuren, stijlen en het
  // lopende plan) als één bestand dat je op een ander apparaat importeert.
  function exporteerData() {
    const data = JSON.stringify({ items, stijl, plan, kleuren, stijlen }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garderobe-backup-${vandaagISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importeerData(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.items)) throw new Error("geen geldige backup");
        const ok = window.confirm(
          `Backup gevonden met ${data.items.length} kledingstukken. Dit vervangt de huidige kast op dit apparaat. Doorgaan?`
        );
        if (!ok) return;
        pasDataToe(data);
      } catch (err) {
        alert("Dit bestand kon niet gelezen worden als garderobe-backup.");
      }
    };
    reader.readAsText(file);
  }

  const OUTFIT_REGELS = [
    { sleutel: "basislaag", label: "Basislaag" },
    { sleutel: "overlaag", label: "Overlaag" },
    { sleutel: "broek", label: "Broek" },
    { sleutel: "schoenen", label: "Schoenen" },
    { sleutel: "jas", label: "Jas" },
    { sleutel: "accessoire", label: "Accessoire" },
  ];

  // ---------- UI-onderdelen ----------
  const WeerIcoon = ({ regenkans, temp }) =>
    regenkans >= 50 ? <CloudRain size={18} /> : temp >= 19 ? <Sun size={18} /> : <Cloud size={18} />;

  const knopStijl = (actief) => ({
    background: actief ? KLEUREN.navy : "transparent",
    color: actief ? KLEUREN.ivoor : KLEUREN.navy,
    border: `1.5px solid ${KLEUREN.navy}`,
  });

  const pasvormLabel = (id) => PASVORMEN.find((p) => p.id === id)?.label || "Regular";
  const kleurInfo = (id) => kleuren.find((k) => k.id === id);
  const kleurNaam = (id) => kleurInfo(id)?.label || id || "onbekend";

  // Visueel blokje per kledingstuk: de foto als die er is, anders een
  // kleurvlak. De kleurnáám staat er altijd als tekst bij in de lijsten,
  // zodat je nooit alleen op kleurherkenning hoeft te vertrouwen.
  const ItemBeeld = ({ item, grootte = 44 }) => {
    if (item?.foto) {
      return (
        <img
          src={item.foto}
          alt={item.naam}
          className="rounded-lg object-cover shrink-0"
          style={{ width: grootte, height: grootte, border: `1px solid ${KLEUREN.lijn}` }}
        />
      );
    }
    const info = kleurInfo(item?.kleur);
    return (
      <span
        className="rounded-lg shrink-0 flex items-center justify-center"
        style={{ width: grootte, height: grootte, background: info?.hex || "#DDD", border: `1px solid ${KLEUREN.lijn}` }}
        title={kleurNaam(item?.kleur)}
      >
        <Shirt size={Math.round(grootte * 0.45)} style={{ color: "rgba(255,255,255,0.85)", mixBlendMode: "difference" }} />
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: KLEUREN.ivoor, fontFamily: "'Avenir Next', 'Segoe UI', sans-serif", color: KLEUREN.navy }}>
      {/* Rugbystreep — het signatuurelement */}
      <div style={{ display: "flex", height: 10 }}>
        <div style={{ flex: 3, background: KLEUREN.navy }} />
        <div style={{ flex: 1, background: KLEUREN.bordeaux }} />
        <div style={{ flex: 3, background: KLEUREN.navy }} />
        <div style={{ flex: 1, background: KLEUREN.goud }} />
        <div style={{ flex: 3, background: KLEUREN.navy }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <header className="pt-8 pb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="uppercase tracking-widest text-xs mb-1" style={{ color: KLEUREN.bordeaux, letterSpacing: "0.2em" }}>
              Persoonlijke garderobe
            </p>
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2.2rem", lineHeight: 1.1 }}>
              De Kledingkast
            </h1>
          </div>
          <button
            onClick={wasAlles}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95"
            style={{ background: KLEUREN.groen, color: KLEUREN.ivoor }}
            title="Markeer alles als schoon"
          >
            <WashingMachine size={18} />
            De was is gedaan{aantalVies > 0 ? ` (${aantalVies} vies)` : ""}
          </button>
        </header>

        <nav className="flex gap-2 mb-6">
          <button onClick={() => setTab("planner")} className="px-4 py-2 rounded-full text-sm font-medium" style={knopStijl(tab === "planner")}>
            Weekplanner
          </button>
          <button onClick={() => setTab("kast")} className="px-4 py-2 rounded-full text-sm font-medium" style={knopStijl(tab === "kast")}>
            Kledingkast ({items.length})
          </button>
        </nav>

        {/* ---------- PLANNER ---------- */}
        {tab === "planner" && (
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <label className="text-sm font-medium">Stijl:</label>
              <select
                value={stijl}
                onChange={(e) => setStijl(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
              >
                {stijlen.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={maakPlan}
                disabled={!items.length}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}
              >
                <Sparkles size={16} /> Stel outfits voor
              </button>
              <button
                onClick={haalWeerOp}
                disabled={weerLaadt}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
                title="Actuele voorspelling opnieuw ophalen"
              >
                <RefreshCw size={15} className={weerLaadt ? "animate-spin" : ""} />
                {weerLaadt
                  ? "Weer ophalen…"
                  : `Weer verversen${weerTijd ? ` · ${weerTijd.getHours()}:${String(weerTijd.getMinutes()).padStart(2, "0")}` : ""}`}
              </button>
            </div>

            {weerBron === "demo" && weerTijd && (
              <p className="text-sm mb-4 rounded-lg px-3 py-2" style={{ background: "#F9E9E4", color: KLEUREN.bordeaux }}>
                Live weer ophalen is niet gelukt — je ziet nu willekeurig demo-weer.
                Controleer je internetverbinding en de foutmelding in de browserconsole (F12).
              </p>
            )}

            {items.length > 0 && weer.length > 0 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: KLEUREN.grijs, letterSpacing: "0.15em" }}>
                  Actuele voorspelling {weerBron === "live" ? "· live via Open-Meteo" : "· demo"}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {weer.map((d) => (
                    <div key={d.datum} className="rounded-lg p-3 text-center" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                      <p className="text-xs capitalize mb-1" style={{ color: KLEUREN.grijs }}>{dagLabel(d.datum)}</p>
                      <div className="flex items-center justify-center gap-1">
                        <WeerIcoon regenkans={d.regenkans} temp={d.temp} />
                        <span className="font-semibold">{d.temp}°</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: KLEUREN.grijs }}>{d.regenkans}% regen</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!items.length && (
              <div className="rounded-xl p-8 text-center" style={{ background: KLEUREN.wit, border: `1.5px dashed ${KLEUREN.lijn}` }}>
                <Shirt className="mx-auto mb-3" size={32} style={{ color: KLEUREN.grijs }} />
                <p className="mb-4">De kast is nog leeg. Voeg kledingstukken toe of begin met een voorbeeldgarderobe.</p>
                <button onClick={laadVoorbeeld} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: KLEUREN.bordeaux, color: KLEUREN.ivoor }}>
                  Voorbeeldgarderobe laden
                </button>
              </div>
            )}

            {plan.length > 0 && (
              <p className="text-sm mb-3" style={{ color: KLEUREN.grijs }}>
                Plan voor {formatteerDatum(plan[0].datum)} t/m {formatteerDatum(plan[plan.length - 1].datum)} —
                dit plan blijft staan tot en met de laatste dag, daarna begint een nieuwe cyclus van vijf dagen.
              </p>
            )}
            <div className="space-y-4">
              {plan.map((dag, i) => {
                const vandaag = dag.datum === vandaagISO();
                const voorbij = isVerleden(dag.datum);
                return (
                <article
                  key={dag.datum}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: KLEUREN.wit,
                    border: vandaag ? `2px solid ${KLEUREN.goud}` : `1px solid ${KLEUREN.lijn}`,
                    opacity: dag.gedragen || voorbij ? 0.75 : 1,
                  }}
                >
                  <div className="flex items-center justify-between px-4 py-2" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                    <span className="capitalize font-medium" style={{ fontFamily: "Georgia, serif" }}>
                      {dagLabel(dag.datum)} <span className="text-xs font-normal opacity-70">{formatteerDatum(dag.datum)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <WeerIcoon regenkans={dag.regenkans} temp={dag.temp} /> {dag.temp}° · {dag.regenkans}% regen
                    </span>
                  </div>
                  {(() => {
                    if (dag.gedragen || voorbij) return null;
                    const afwijking = weerAfwijking(dag);
                    if (!afwijking) return null;
                    const { actueel, tempVerschil, regenWissel } = afwijking;
                    const delen = [];
                    if (Math.abs(tempVerschil) >= 4) {
                      delen.push(`${Math.abs(tempVerschil)}° ${tempVerschil > 0 ? "warmer" : "kouder"} dan gepland`);
                    }
                    if (regenWissel) {
                      delen.push(actueel.regenkans >= 50 ? "nu wél regen verwacht" : "regen lijkt over te waaien");
                    }
                    return (
                      <div
                        className="flex items-center justify-between gap-3 px-4 py-2 text-sm flex-wrap"
                        style={{ background: "#FBF3DC", borderBottom: `1px solid ${KLEUREN.goud}`, color: KLEUREN.navy }}
                      >
                        <span>
                          Voorspelling gewijzigd: {delen.join(", ")} (nu {actueel.temp}° · {actueel.regenkans}% regen).
                        </span>
                        <button
                          onClick={() => herzieDag(i)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium shrink-0"
                          style={{ border: `1.5px solid ${KLEUREN.navy}`, color: KLEUREN.navy, background: "transparent" }}
                        >
                          <RefreshCw size={13} /> Outfit herzien
                        </button>
                      </div>
                    );
                  })()}
                  <div className="p-4">
                    <ul className="space-y-2 mb-3">
                      {OUTFIT_REGELS.map(({ sleutel, label }) => {
                        const it = dag.outfit[sleutel];
                        const verplicht = ["basislaag", "broek", "schoenen"].includes(sleutel);
                        if (!it && !verplicht) return null;
                        return (
                          <li key={sleutel} className="flex items-center gap-3 text-sm">
                            <span className="w-20 shrink-0 uppercase text-xs tracking-wide" style={{ color: KLEUREN.grijs }}>{label}</span>
                            {it ? (
                              <span className="flex items-center gap-3 min-w-0">
                                <ItemBeeld item={it} grootte={44} />
                                <span className="min-w-0">
                                  <span className="block truncate">
                                    {it.merk ? `${it.merk} — ` : ""}{it.naam}
                                  </span>
                                  <span className="block text-xs" style={{ color: KLEUREN.grijs }}>
                                    {kleurNaam(it.kleur)}
                                    {(it.pasvorm || "regular") !== "regular" ? ` · ${pasvormLabel(it.pasvorm).toLowerCase()}` : ""}
                                    {it.patroon ? " · patroon" : ""}
                                  </span>
                                </span>
                              </span>
                            ) : (
                              <span style={{ color: KLEUREN.bordeaux }}>Geen schoon item beschikbaar — tijd voor de was?</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => registreerGedragen(i)}
                      disabled={dag.gedragen}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60"
                      style={{ background: dag.gedragen ? KLEUREN.groen : "transparent", color: dag.gedragen ? KLEUREN.ivoor : KLEUREN.groen, border: `1.5px solid ${KLEUREN.groen}` }}
                    >
                      <Check size={15} /> {dag.gedragen ? "Gedragen geregistreerd" : "Ik draag dit"}
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- KAST ---------- */}
        {tab === "kast" && (
          <section>
            {/* Toevoegen */}
            <div className="rounded-xl p-4 mb-4" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
              <h2 className="font-medium mb-3" style={{ fontFamily: "Georgia, serif" }}>Kledingstuk toevoegen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input
                  value={nieuw.naam}
                  onChange={(e) => setNieuw({ ...nieuw, naam: e.target.value })}
                  placeholder="Naam, bijv. Oxford overhemd (lichtblauw)"
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                />
                <input
                  value={nieuw.merk}
                  onChange={(e) => setNieuw({ ...nieuw, merk: e.target.value })}
                  placeholder="Merk, bijv. Ralph Lauren (optioneel)"
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <select value={nieuw.categorie} onChange={(e) => setNieuw({ ...nieuw, categorie: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {CATEGORIEEN.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {nieuw.categorie === "top" && (
                  <select value={nieuw.laag} onChange={(e) => setNieuw({ ...nieuw, laag: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                    {LAGEN.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                )}
                <select value={nieuw.pasvorm} onChange={(e) => setNieuw({ ...nieuw, pasvorm: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {PASVORMEN.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <select value={nieuw.stijl} onChange={(e) => setNieuw({ ...nieuw, stijl: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {stijlen.map((s) => <option key={s}>{s}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-sm px-2" style={{ color: KLEUREN.grijs }}>
                  <input type="checkbox" checked={nieuw.patroon} onChange={(e) => setNieuw({ ...nieuw, patroon: e.target.checked })} />
                  Opvallend patroon
                </label>
                <label className="flex items-center gap-1 text-sm px-2" style={{ color: KLEUREN.grijs }}>
                  Vies na
                  <input
                    type="number" min="1" max="30" value={nieuw.maxDraag}
                    onChange={(e) => setNieuw({ ...nieuw, maxDraag: e.target.value })}
                    className="w-14 px-2 py-2 rounded-lg text-sm"
                    style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                  />
                  x dragen
                </label>
              </div>

              {/* Temperatuurbanden: meerdere mogelijk, bijv. een pantalon
                  voor alles tot 20° maar niet daarboven. */}
              <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: KLEUREN.grijs }}>Draagbaar bij (meerdere mogelijk)</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TEMP_BANDEN.map((b) => {
                  const aan = nieuw.tempBanden.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() =>
                        setNieuw((n) => {
                          const lijst = aan ? n.tempBanden.filter((x) => x !== b.id) : [...n.tempBanden, b.id];
                          return { ...n, tempBanden: lijst.length ? lijst : n.tempBanden };
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: aan ? KLEUREN.navy : KLEUREN.wit,
                        color: aan ? KLEUREN.ivoor : KLEUREN.grijs,
                        border: `1.5px solid ${aan ? KLEUREN.navy : KLEUREN.lijn}`,
                      }}
                    >
                      {aan && <Check size={11} />}{b.label}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setNieuw((n) => ({
                      ...n,
                      tempBanden: n.tempBanden.length === TEMP_BANDEN.length ? [...ALLE_BANDEN] : [...ALLE_BANDEN],
                    }))
                  }
                  className="px-2.5 py-1.5 rounded-full text-xs"
                  style={{ border: `1.5px dashed ${KLEUREN.lijn}`, color: KLEUREN.grijs }}
                >
                  Alles aan
                </button>
              </div>

              {/* Kleurkeuze: grote klikbare vlakken mét naam, in plaats van een dropdown */}
              <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: KLEUREN.grijs }}>Kleur</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {kleuren.map((k) => {
                  const actief = nieuw.kleur === k.id;
                  return (
                    <button
                      key={k.id}
                      onClick={() => setNieuw({ ...nieuw, kleur: k.id })}
                      className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        border: actief ? `2px solid ${KLEUREN.navy}` : `1.5px solid ${KLEUREN.lijn}`,
                        background: actief ? "#EDF0F7" : KLEUREN.wit,
                      }}
                      title={k.label}
                    >
                      <span className="w-5 h-5 rounded-full" style={{ background: k.hex, border: `1px solid ${KLEUREN.lijn}` }} />
                      {k.label}
                      {actief && <Check size={13} />}
                    </button>
                  );
                })}
              </div>

              {/* Foto + toevoegen */}
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
                  style={{ border: `1.5px dashed ${KLEUREN.lijn}`, background: KLEUREN.ivoor }}
                >
                  <Camera size={16} />
                  {nieuw.foto ? "Andere foto kiezen" : "Foto toevoegen (optioneel)"}
                  <input ref={nieuwFotoInput} type="file" accept="image/*" onChange={kiesNieuweFoto} className="hidden" />
                </label>
                {nieuw.foto && (
                  <span className="flex items-center gap-2">
                    <img src={nieuw.foto} alt="Voorbeeld" className="w-11 h-11 rounded-lg object-cover" style={{ border: `1px solid ${KLEUREN.lijn}` }} />
                    <button onClick={() => setNieuw((n) => ({ ...n, foto: null }))} title="Foto verwijderen" style={{ color: KLEUREN.grijs }}>
                      <X size={16} />
                    </button>
                  </span>
                )}
                <button onClick={voegToe} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium ml-auto" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                  <Plus size={16} /> Toevoegen
                </button>
              </div>
            </div>

            {/* Beheer van kleuren en stijlen + overzetten tussen apparaten */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setBeheerOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
              >
                <Settings2 size={15} /> Kleuren & stijlen aanpassen {beheerOpen ? "▴" : "▾"}
              </button>
              <button
                onClick={exporteerData}
                disabled={!items.length}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-40"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
                title="Download je kast als bestand om over te zetten naar een ander apparaat"
              >
                <Download size={15} /> Exporteer kast
              </button>
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
                title="Laad een eerder geëxporteerd bestand in op dit apparaat"
              >
                <Upload size={15} /> Importeer
                <input type="file" accept="application/json,.json" onChange={importeerData} className="hidden" />
              </label>
            </div>

            {beheerOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-4" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                  <h3 className="font-medium mb-2" style={{ fontFamily: "Georgia, serif" }}>Kleuren</h3>
                  <ul className="space-y-1.5 mb-3">
                    {kleuren.map((k) => (
                      <li key={k.id} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-md shrink-0" style={{ background: k.hex, border: `1px solid ${KLEUREN.lijn}` }} />
                        <span className="flex-1">{k.label}</span>
                        <button onClick={() => verwijderKleur(k.id)} title="Kleur verwijderen" style={{ color: KLEUREN.grijs }}>
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2">
                    <input
                      value={nieuweKleur.label}
                      onChange={(e) => setNieuweKleur({ ...nieuweKleur, label: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && voegKleurToe()}
                      placeholder="Naam, bijv. Olijfgroen"
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm"
                      style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                    />
                    <input
                      type="color"
                      value={nieuweKleur.hex}
                      onChange={(e) => setNieuweKleur({ ...nieuweKleur, hex: e.target.value })}
                      className="w-9 h-9 rounded cursor-pointer"
                      title="Kies het kleurvlak"
                    />
                    <button onClick={voegKleurToe} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: KLEUREN.grijs }}>
                    De naam is leidend — het kleurvlak is alleen ter herkenning in de lijsten.
                  </p>
                </div>

                <div className="rounded-xl p-4" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                  <h3 className="font-medium mb-2" style={{ fontFamily: "Georgia, serif" }}>Stijlen</h3>
                  <ul className="flex flex-wrap gap-1.5 mb-3">
                    {stijlen.map((s) => (
                      <li key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                        {s}
                        <button onClick={() => verwijderStijl(s)} title="Stijl verwijderen" style={{ color: KLEUREN.grijs }}>
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2">
                    <input
                      value={nieuweStijl}
                      onChange={(e) => setNieuweStijl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && voegStijlToe()}
                      placeholder="Bijv. Streetwear"
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm"
                      style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                    />
                    <button onClick={voegStijlToe} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Synchronisatie via Google Sheets */}
                <div className="rounded-xl p-4 sm:col-span-2" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                  <h3 className="font-medium mb-1 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
                    Synchronisatie via Google Sheets
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      title={`Status: ${syncStatus}`}
                      style={{
                        background:
                          syncStatus === "ok" ? KLEUREN.groen :
                          syncStatus === "bezig" ? KLEUREN.goud :
                          syncStatus === "fout" ? KLEUREN.bordeaux : "#C4C4C4",
                      }}
                    />
                    <span className="text-xs font-normal" style={{ color: KLEUREN.grijs }}>
                      {syncStatus === "uit" && "niet verbonden"}
                      {syncStatus === "bezig" && "synchroniseren…"}
                      {syncStatus === "ok" && laatsteSync && `gesynchroniseerd om ${laatsteSync.getHours()}:${String(laatsteSync.getMinutes()).padStart(2, "0")}`}
                      {syncStatus === "fout" && "fout — controleer URL en geheim"}
                    </span>
                  </h3>
                  <p className="text-xs mb-3" style={{ color: KLEUREN.grijs }}>
                    Vul op elk apparaat eenmalig dezelfde web-app-URL en hetzelfde geheim in.
                    Wijzigingen worden daarna automatisch opgeslagen; bij het openen wordt de laatste versie opgehaald.
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      value={syncConfig.url}
                      onChange={(e) => setSyncConfig({ ...syncConfig, url: e.target.value })}
                      placeholder="https://script.google.com/macros/s/…/exec"
                      className="flex-1 min-w-48 px-2 py-1.5 rounded-lg text-sm"
                      style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                    />
                    <input
                      value={syncConfig.geheim}
                      onChange={(e) => setSyncConfig({ ...syncConfig, geheim: e.target.value })}
                      placeholder="Geheim"
                      type="password"
                      className="w-32 px-2 py-1.5 rounded-lg text-sm"
                      style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                    />
                    <button onClick={verbindSync} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                      Verbind & haal op
                    </button>
                    {syncStatus !== "uit" && (
                      <>
                        <button onClick={() => haalRemoteOp(syncConfig, false)} className="px-3 py-1.5 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                          Nu ophalen
                        </button>
                        <button onClick={() => slaRemoteOp(syncConfig, false)} className="px-3 py-1.5 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                          Nu opslaan
                        </button>
                        <button onClick={ontkoppelSync} className="px-3 py-1.5 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}`, color: KLEUREN.bordeaux }}>
                          Ontkoppel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seizoensfilter: klik een seizoen om alleen de passende stukken
                te zien — handig bij het wisselen/opruimen van de kast. */}
            {items.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-xs uppercase tracking-wide mr-1" style={{ color: KLEUREN.grijs }}>Seizoen:</span>
                {[{ id: "alle", label: "Alles" }, ...SEIZOENEN].map((s) => {
                  const actief = seizoenFilter === s.id;
                  const aantal = s.id === "alle" ? items.length : items.filter((it) => it.seizoenen?.includes(s.id)).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSeizoenFilter(s.id)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        background: actief ? KLEUREN.navy : KLEUREN.wit,
                        color: actief ? KLEUREN.ivoor : KLEUREN.navy,
                        border: `1.5px solid ${actief ? KLEUREN.navy : KLEUREN.lijn}`,
                      }}
                    >
                      {s.label} <span style={{ opacity: 0.6 }}>({aantal})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Itemlijst */}
            {!items.length ? (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: KLEUREN.grijs }}>Nog geen kledingstukken.</p>
                <button onClick={laadVoorbeeld} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: KLEUREN.bordeaux, color: KLEUREN.ivoor }}>
                  Voorbeeldgarderobe laden
                </button>
              </div>
            ) : (
              CATEGORIEEN.map((cat) => {
                const groep = items.filter(
                  (it) =>
                    it.categorie === cat.id &&
                    (seizoenFilter === "alle" || it.seizoenen?.includes(seizoenFilter))
                );
                if (!groep.length) return null;
                return (
                  <div key={cat.id} className="mb-6">
                    <h3 className="uppercase text-xs tracking-widest mb-2" style={{ color: KLEUREN.bordeaux, letterSpacing: "0.15em" }}>{cat.label}</h3>
                    <ul className="space-y-1.5">
                      {groep.map((it) => (
                        <li key={it.id} className="rounded-lg px-3 py-2" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                          <div className="flex items-center gap-3">
                          <ItemBeeld item={it} grootte={44} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm truncate">
                              {it.merk ? `${it.merk} — ` : ""}{it.naam}
                            </span>
                            <span className="block text-xs" style={{ color: KLEUREN.grijs }}>
                              {kleurNaam(it.kleur)}
                              {it.categorie === "top" ? ` · ${it.laag === "over" ? "overlaag" : "basislaag"}` : ""}
                              {` · ${pasvormLabel(it.pasvorm).toLowerCase()}`}
                              {it.patroon ? " · patroon" : ""}
                              {` · ${it.stijl}`}
                            </span>
                            <span className="block text-xs capitalize" style={{ color: KLEUREN.groen }}>
                              {seizoenTekst(it.seizoenen)} · {tempTekst(it.tempBanden)}
                            </span>
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              background: it.vies ? "#F9E9E4" : "#E8F0EA",
                              color: it.vies ? KLEUREN.bordeaux : KLEUREN.groen,
                            }}
                          >
                            {it.vies ? "vies" : `schoon ${it.draagTeller || 0}/${it.maxDraag}`}
                          </span>
                          <button
                            onClick={() => setBewerkSeizoenId(bewerkSeizoenId === it.id ? null : it.id)}
                            title="Seizoenen aanpassen"
                            className="shrink-0"
                            style={{ color: bewerkSeizoenId === it.id ? KLEUREN.navy : KLEUREN.grijs }}
                          >
                            <Pencil size={15} />
                          </button>
                          <label className="cursor-pointer shrink-0" title="Foto toevoegen of wijzigen" style={{ color: KLEUREN.grijs }}>
                            <Camera size={15} />
                            <input type="file" accept="image/*" onChange={(e) => wijzigItemFoto(it.id, e)} className="hidden" />
                          </label>
                          <button onClick={() => verwijder(it.id)} title="Verwijderen" className="shrink-0" style={{ color: KLEUREN.grijs }}>
                            <Trash2 size={15} />
                          </button>
                          </div>
                          {bewerkSeizoenId === it.id && (
                            <div className="mt-2 pt-2 space-y-2" style={{ borderTop: `1px dashed ${KLEUREN.lijn}` }}>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs mr-1" style={{ color: KLEUREN.grijs }}>Seizoen:</span>
                                {SEIZOENEN.map((s) => {
                                  const aan = it.seizoenen?.includes(s.id);
                                  return (
                                    <button
                                      key={s.id}
                                      onClick={() => wisselSeizoen(it.id, s.id)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        background: aan ? KLEUREN.groen : KLEUREN.wit,
                                        color: aan ? KLEUREN.ivoor : KLEUREN.grijs,
                                        border: `1.5px solid ${aan ? KLEUREN.groen : KLEUREN.lijn}`,
                                      }}
                                    >
                                      {aan && <Check size={11} />}{s.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs mr-1" style={{ color: KLEUREN.grijs }}>Temperatuur:</span>
                                {TEMP_BANDEN.map((b) => {
                                  const aan = (it.tempBanden || []).includes(b.id);
                                  return (
                                    <button
                                      key={b.id}
                                      onClick={() => wisselTempBand(it.id, b.id)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        background: aan ? KLEUREN.navy : KLEUREN.wit,
                                        color: aan ? KLEUREN.ivoor : KLEUREN.grijs,
                                        border: `1.5px solid ${aan ? KLEUREN.navy : KLEUREN.lijn}`,
                                      }}
                                    >
                                      {aan && <Check size={11} />}{b.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </section>
        )}
      </div>
    </div>
  );
}
