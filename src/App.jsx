import { useState, useEffect, useRef } from "react";
import { Shirt, Plus, Trash2, WashingMachine, RefreshCw, CloudRain, Sun, Cloud, Check, Sparkles } from "lucide-react";

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

const CATEGORIEEN = [
  { id: "top", label: "Bovenstuk" },
  { id: "broek", label: "Broek / rok" },
  { id: "schoenen", label: "Schoenen" },
  { id: "jas", label: "Jas" },
  { id: "accessoire", label: "Accessoire" },
];

const WARMTE = [
  { id: "alle", label: "Alle temperaturen" },
  { id: "warm", label: "Warm (19° en hoger)" },
  { id: "mild", label: "Mild (10–19°)" },
  { id: "koud", label: "Koud (onder 10°)" },
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

const KLEUR_OPTIES = [
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

const STIJLEN = ["Modern preppy", "Casual", "Smart casual", "Sportief", "Klassiek"];

const VOORBEELD_ITEMS = [
  { naam: "Oxford overhemd (lichtblauw)", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "lichtblauw", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 1 },
  { naam: "Poloshirt (navy)", categorie: "top", laag: "basis", pasvorm: "slim", kleur: "navy", patroon: false, warmte: "warm", stijl: "Modern preppy", maxDraag: 1 },
  { naam: "Linnen overhemd (wit)", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "warm", stijl: "Smart casual", maxDraag: 1 },
  { naam: "Geruit flanellen hemd", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "bordeaux", patroon: true, warmte: "koud", stijl: "Casual", maxDraag: 1 },
  { naam: "Wit t-shirt", categorie: "top", laag: "basis", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "alle", stijl: "Casual", maxDraag: 1 },
  { naam: "Kabeltrui (crème)", categorie: "top", laag: "over", pasvorm: "regular", kleur: "creme", patroon: false, warmte: "koud", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Gestreept rugbyshirt", categorie: "top", laag: "over", pasvorm: "ruim", kleur: "navy", patroon: true, warmte: "mild", stijl: "Modern preppy", maxDraag: 2 },
  { naam: "V-hals vest (navy)", categorie: "top", laag: "over", pasvorm: "slim", kleur: "navy", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Chino (beige)", categorie: "broek", pasvorm: "slim", kleur: "beige", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Chino (navy)", categorie: "broek", pasvorm: "regular", kleur: "navy", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 3 },
  { naam: "Wollen pantalon (grijs, geruit)", categorie: "broek", pasvorm: "ruim", kleur: "grijs", patroon: true, warmte: "koud", stijl: "Klassiek", maxDraag: 3 },
  { naam: "Korte broek (kaki)", categorie: "broek", pasvorm: "regular", kleur: "beige", patroon: false, warmte: "warm", stijl: "Casual", maxDraag: 2 },
  { naam: "Loafers (bruin leer)", categorie: "schoenen", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 10, regenOk: false },
  { naam: "Witte sneakers", categorie: "schoenen", pasvorm: "regular", kleur: "wit", patroon: false, warmte: "alle", stijl: "Casual", maxDraag: 10, regenOk: true },
  { naam: "Chelsea boots", categorie: "schoenen", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "koud", stijl: "Smart casual", maxDraag: 10, regenOk: true },
  { naam: "Trenchcoat", categorie: "jas", pasvorm: "regular", kleur: "beige", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 10, regenOk: true },
  { naam: "Wollen overjas (camel)", categorie: "jas", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "koud", stijl: "Klassiek", maxDraag: 10, regenOk: false },
  { naam: "Harrington jack", categorie: "jas", pasvorm: "regular", kleur: "navy", patroon: false, warmte: "mild", stijl: "Modern preppy", maxDraag: 10, regenOk: true },
  { naam: "Leren riem (bruin)", categorie: "accessoire", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 30 },
  { naam: "Wollen sjaal (tartan)", categorie: "accessoire", pasvorm: "regular", kleur: "bordeaux", patroon: true, warmte: "koud", stijl: "Modern preppy", maxDraag: 10 },
  { naam: "Horloge (leren band)", categorie: "accessoire", pasvorm: "regular", kleur: "bruin", patroon: false, warmte: "alle", stijl: "Klassiek", maxDraag: 30 },
];

const DAGNAMEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const OPSLAG_SLEUTEL = "garderobe-app-v3";

// ---------- Hulpfuncties ----------
const nieuwId = () => Math.random().toString(36).slice(2, 10);

const warmteVanTemp = (t) => (t >= 19 ? "warm" : t >= 10 ? "mild" : "koud");

// Datumhelpers voor de 5-daagse cyclus: een plan hoort bij vaste datums en
// blijft geldig tot en met zijn laatste dag. Daarna begint een nieuwe "week".
const vandaagISO = () => new Date().toISOString().slice(0, 10);
const dagLabel = (datumISO) => {
  const vandaag = vandaagISO();
  if (datumISO === vandaag) return "vandaag";
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
      dag: i === 0 ? "vandaag" : DAGNAMEN[d.getDay()],
      temp: Math.round(basis + (Math.random() * 8 - 4)),
      regenkans: Math.round(Math.random() * 100),
    };
  });
};

// ---------- Stijlregels ----------
// Pasvorm: een ruime/oversized bovenkant gaat niet samen met een slim broek.
// Alle andere combinaties mogen: slim boven + ruim onder, én ruim op ruim.
const pasvormOk = (bovenRuim, broek) => !(bovenRuim && (broek.pasvorm || "regular") === "slim");

// Kleur: geen identieke hoofdkleur direct op elkaar (navy trui op navy chino),
// en een paar bekende botsers vermijden. Onbekende kleur ("anders") botst nooit.
const KLEUR_CLASHES = [["navy", "zwart"], ["bruin", "zwart"]];
const kleurenBotsen = (a, b) => {
  if (!a || !b || a === "anders" || b === "anders") return false;
  if (a === b) return true;
  return KLEUR_CLASHES.some((p) => p.includes(a) && p.includes(b));
};

// Patroon: maximaal één opvallend patroon in de kern van de outfit
// (basislaag + overlaag + broek). Accessoires tellen niet mee.

// Laagvolgorde: een basislaag (hemd/t-shirt) komt altijd ónder een overlaag
// (trui/vest). De generator bouwt alleen in die volgorde op.

// ---------- Outfitgenerator ----------
// Genereert één outfit voor één dag. `vermijden` is een zachte voorkeur:
// items daarin worden liever niet gekozen (denk: gisteren gedragen, of bij
// een herziening ook wat morgen al gepland staat), maar het is geen harde eis.
function genereerDag(items, dag, stijl, vermijden = new Set()) {
  const behoefte = warmteVanTemp(dag.temp);
  const regent = dag.regenkans >= 50;
  const vandaag = new Set();

  const kies = (categorie, extraFilter = () => true) => {
    const kandidaten = items.filter(
      (it) =>
        it.categorie === categorie &&
        !it.vies &&
        (it.warmte === "alle" || it.warmte === behoefte) &&
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

  // Kleur- en patroonregels zijn "zacht": eerst kiezen mét de regel, en alleen
  // als er dan niets schoons overblijft, zonder — liever een matige combinatie
  // dan helemaal geen outfit.
  const kiesMetVoorkeur = (categorie, hard, voorkeur) =>
    kies(categorie, (it) => hard(it) && voorkeur(it)) || kies(categorie, hard);

  // 1. Basislaag; zonder schone basislaag mag een trui alleen gedragen worden.
  let basislaag = kies("top", (it) => (it.laag || "basis") === "basis");
  let alleenOverlaag = false;
  if (!basislaag) {
    basislaag = kies("top", (it) => it.laag === "over");
    alleenOverlaag = true;
  }

  // 2. Overlaag erbóven bij koeler weer (onder 14°), nooit andersom.
  //    Voorkeur: kleur botst niet met de basislaag en niet twee patronen op elkaar.
  const overlaag =
    !alleenOverlaag && dag.temp < 14
      ? kiesMetVoorkeur(
          "top",
          (it) => it.laag === "over",
          (it) =>
            !kleurenBotsen(it.kleur, basislaag?.kleur) &&
            !(it.patroon && basislaag?.patroon)
        )
      : undefined;

  const buitensteTop = overlaag || basislaag;
  const patronenBoven = [basislaag, overlaag].filter((it) => it?.patroon).length;

  // 3. Broek. Hard: pasvormregel. Voorkeur: kleur botst niet met de zichtbare
  //    bovenlaag en de patroonlimiet blijft op één.
  const bovenRuim = [basislaag, overlaag].filter(Boolean).some((it) => (it.pasvorm || "regular") === "ruim");
  const broek = kiesMetVoorkeur(
    "broek",
    (it) => pasvormOk(bovenRuim, it),
    (it) => !kleurenBotsen(it.kleur, buitensteTop?.kleur) && !(it.patroon && patronenBoven >= 1)
  );

  // 4. Jas: voorkeur voor een kleur die niet botst met wat eronder zit.
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
  const [weer, setWeer] = useState([]);
  const [weerBron, setWeerBron] = useState("demo");
  const [plan, setPlan] = useState([]);
  const [tab, setTab] = useState("planner");
  const [geladen, setGeladen] = useState(false);
  const [nieuw, setNieuw] = useState({
    naam: "", categorie: "top", laag: "basis", pasvorm: "regular",
    kleur: "navy", patroon: false, warmte: "alle", stijl: "Modern preppy", maxDraag: 1,
  });
  const eersteOpslag = useRef(true);

  // Laden uit localStorage (met migratie van oudere items)
  useEffect(() => {
    try {
      const r = localStorage.getItem(OPSLAG_SLEUTEL);
      if (r) {
        const data = JSON.parse(r);
        if (data.items) {
          setItems(data.items.map((it) => ({
            pasvorm: "regular",
            laag: it.categorie === "top" ? "basis" : undefined,
            kleur: "anders",
            patroon: false,
            ...it,
          })));
        }
        if (data.stijl) setStijl(data.stijl);
        // Het plan hoort bij vaste datums: valt vandaag nog binnen de vijf
        // dagen van het opgeslagen plan, dan tonen we precies dat plan terug,
        // inclusief welke outfits al als "gedragen" zijn gemarkeerd.
        // Is de laatste dag voorbij, dan vervalt het en start een nieuwe cyclus.
        if (planNogGeldig(data.plan)) setPlan(data.plan);
      }
    } catch (e) {
      /* nog niets opgeslagen of onleesbaar */
    }
    setGeladen(true);
    haalWeerOp();
  }, []);

  // Opslaan bij wijzigingen
  useEffect(() => {
    if (!geladen) return;
    if (eersteOpslag.current) { eersteOpslag.current = false; return; }
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify({ items, stijl, plan }));
    } catch (e) {
      console.error("Opslaan mislukt", e);
    }
  }, [items, stijl, plan, geladen]);

  async function haalWeerOp() {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=4.89&daily=temperature_2m_max,precipitation_probability_max&forecast_days=5&timezone=auto"
      );
      if (!res.ok) throw new Error("geen verbinding");
      const d = await res.json();
      const dagen = d.daily.time.map((t, i) => {
        const dt = new Date(t);
        return {
          datum: t,
          dag: i === 0 ? "vandaag" : DAGNAMEN[dt.getDay()],
          temp: Math.round(d.daily.temperature_2m_max[i]),
          regenkans: d.daily.precipitation_probability_max[i] ?? 0,
        };
      });
      setWeer(dagen);
      setWeerBron("live");
    } catch (e) {
      setWeer(demoWeer());
      setWeerBron("demo");
    }
  }

  function maakPlan() {
    if (!weer.length) return;
    // Een lopend plan met al-gedragen outfits gooi je niet zomaar weg.
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

  // Vergelijkt het weer waarmee de outfit gepland is met de actuele voorspelling.
  // Significant afwijkend = 4° of meer verschil, of de regenverwachting wisselt
  // van "droog" naar "regen" (of andersom) over de 50%-grens.
  function weerAfwijking(dag) {
    const actueel = weer.find((w) => w.datum === dag.datum);
    if (!actueel) return null;
    const tempVerschil = actueel.temp - dag.temp;
    const regenWissel = (actueel.regenkans >= 50) !== (dag.regenkans >= 50);
    if (Math.abs(tempVerschil) < 4 && !regenWissel) return null;
    return { actueel, tempVerschil, regenWissel };
  }

  // Herziet alléén deze dag op basis van het actuele weer. De rest van het plan
  // blijft onaangeroerd. Items uit de dag ervoor en erna worden liever vermeden,
  // zodat de geen-twee-dagen-op-rij-regel ook na de herziening blijft kloppen.
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
      prev.map((d, j) =>
        j === i ? { ...d, temp: actueel.temp, regenkans: actueel.regenkans, outfit } : d
      )
    );
  }

  function voegToe() {
    if (!nieuw.naam.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        ...nieuw,
        naam: nieuw.naam.trim(),
        id: nieuwId(),
        vies: false,
        draagTeller: 0,
        maxDraag: Number(nieuw.maxDraag) || 1,
        regenOk: true,
        laag: nieuw.categorie === "top" ? nieuw.laag : undefined,
      },
    ]);
    setNieuw((n) => ({ ...n, naam: "" }));
  }

  function verwijder(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function laadVoorbeeld() {
    setItems(VOORBEELD_ITEMS.map((it) => ({ ...it, id: nieuwId(), vies: false, draagTeller: 0, regenOk: it.regenOk !== false })));
  }

  const aantalVies = items.filter((it) => it.vies).length;

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
  const kleurInfo = (id) => KLEUR_OPTIES.find((k) => k.id === id);

  const KleurStip = ({ kleur }) => {
    const info = kleurInfo(kleur);
    if (!info) return null;
    return (
      <span
        className="inline-block w-3 h-3 rounded-full align-middle"
        style={{ background: info.hex, border: `1px solid ${KLEUREN.lijn}` }}
        title={info.label}
      />
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
                {STIJLEN.map((s) => (
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ border: `1.5px solid ${KLEUREN.lijn}`, background: KLEUREN.wit }}
                title="Weer verversen"
              >
                <RefreshCw size={15} /> Weer {weerBron === "demo" ? "(demo)" : "(live)"}
              </button>
            </div>

            {!items.length && (
              <div className="rounded-xl p-8 text-center" style={{ background: KLEUREN.wit, border: `1.5px dashed ${KLEUREN.lijn}` }}>
                <Shirt className="mx-auto mb-3" size={32} style={{ color: KLEUREN.grijs }} />
                <p className="mb-4">De kast is nog leeg. Voeg kledingstukken toe of begin met een voorbeeldgarderobe.</p>
                <button onClick={laadVoorbeeld} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: KLEUREN.bordeaux, color: KLEUREN.ivoor }}>
                  Voorbeeldgarderobe laden
                </button>
              </div>
            )}

            {items.length > 0 && !plan.length && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {weer.map((d) => (
                  <div key={d.datum} className="rounded-lg p-3 text-center" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                    <p className="text-xs capitalize mb-1" style={{ color: KLEUREN.grijs }}>{d.dag}</p>
                    <div className="flex items-center justify-center gap-1">
                      <WeerIcoon regenkans={d.regenkans} temp={d.temp} />
                      <span className="font-semibold">{d.temp}°</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: KLEUREN.grijs }}>{d.regenkans}% regen</p>
                  </div>
                ))}
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
                    // Waarschuwing alleen voor dagen die nog komen (of vandaag)
                    // en nog niet gedragen zijn — het plan zelf blijft ongemoeid
                    // tot je zelf op "Outfit herzien" drukt.
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
                    <ul className="space-y-1.5 mb-3">
                      {OUTFIT_REGELS.map(({ sleutel, label }) => {
                        const it = dag.outfit[sleutel];
                        const verplicht = ["basislaag", "broek", "schoenen"].includes(sleutel);
                        if (!it && !verplicht) return null;
                        return (
                          <li key={sleutel} className="flex items-baseline gap-2 text-sm">
                            <span className="w-24 shrink-0 uppercase text-xs tracking-wide" style={{ color: KLEUREN.grijs }}>{label}</span>
                            {it ? (
                              <span className="flex items-center gap-1.5">
                                <KleurStip kleur={it.kleur} />
                                {it.naam}
                                {(it.pasvorm || "regular") !== "regular" && (
                                  <span className="text-xs" style={{ color: KLEUREN.grijs }}>· {pasvormLabel(it.pasvorm)}</span>
                                )}
                                {it.patroon && (
                                  <span className="text-xs" style={{ color: KLEUREN.grijs }}>· patroon</span>
                                )}
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
            <div className="rounded-xl p-4 mb-6" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
              <h2 className="font-medium mb-3" style={{ fontFamily: "Georgia, serif" }}>Kledingstuk toevoegen</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  value={nieuw.naam}
                  onChange={(e) => setNieuw({ ...nieuw, naam: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && voegToe()}
                  placeholder="Bijv. Oxford overhemd (lichtblauw)"
                  className="flex-1 min-w-40 px-3 py-2 rounded-lg text-sm"
                  style={{ border: `1.5px solid ${KLEUREN.lijn}` }}
                />
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
                <select value={nieuw.kleur} onChange={(e) => setNieuw({ ...nieuw, kleur: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {KLEUR_OPTIES.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-sm px-2" style={{ color: KLEUREN.grijs }}>
                  <input
                    type="checkbox"
                    checked={nieuw.patroon}
                    onChange={(e) => setNieuw({ ...nieuw, patroon: e.target.checked })}
                  />
                  Opvallend patroon
                </label>
                <select value={nieuw.warmte} onChange={(e) => setNieuw({ ...nieuw, warmte: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {WARMTE.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                </select>
                <select value={nieuw.stijl} onChange={(e) => setNieuw({ ...nieuw, stijl: e.target.value })} className="px-2 py-2 rounded-lg text-sm" style={{ border: `1.5px solid ${KLEUREN.lijn}` }}>
                  {STIJLEN.map((s) => <option key={s}>{s}</option>)}
                </select>
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
                <button onClick={voegToe} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: KLEUREN.navy, color: KLEUREN.ivoor }}>
                  <Plus size={16} /> Toevoegen
                </button>
              </div>
              <p className="text-xs mt-3" style={{ color: KLEUREN.grijs }}>
                Stijlregels: ruim boven + slim onder wordt vermeden (slim boven + ruim onder en ruim op ruim mogen wél),
                een basislaag komt altijd ónder een overlaag, geen identieke of botsende kleuren direct op elkaar,
                en maximaal één opvallend patroon per outfit.
              </p>
            </div>

            {!items.length ? (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: KLEUREN.grijs }}>Nog geen kledingstukken.</p>
                <button onClick={laadVoorbeeld} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: KLEUREN.bordeaux, color: KLEUREN.ivoor }}>
                  Voorbeeldgarderobe laden
                </button>
              </div>
            ) : (
              CATEGORIEEN.map((cat) => {
                const groep = items.filter((it) => it.categorie === cat.id);
                if (!groep.length) return null;
                return (
                  <div key={cat.id} className="mb-6">
                    <h3 className="uppercase text-xs tracking-widest mb-2" style={{ color: KLEUREN.bordeaux, letterSpacing: "0.15em" }}>{cat.label}</h3>
                    <ul className="space-y-1.5">
                      {groep.map((it) => (
                        <li key={it.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: KLEUREN.wit, border: `1px solid ${KLEUREN.lijn}` }}>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: it.vies ? KLEUREN.bordeaux : KLEUREN.groen }}
                            title={it.vies ? "Vies" : "Schoon"}
                          />
                          <span className="flex-1 text-sm flex items-center gap-1.5 flex-wrap">
                            <KleurStip kleur={it.kleur} />
                            {it.naam}
                            {it.categorie === "top" && (
                              <span className="text-xs" style={{ color: KLEUREN.grijs }}>
                                · {it.laag === "over" ? "overlaag" : "basislaag"}
                              </span>
                            )}
                            {it.patroon && <span className="text-xs" style={{ color: KLEUREN.grijs }}>· patroon</span>}
                          </span>
                          <span className="text-xs" style={{ color: KLEUREN.grijs }}>{pasvormLabel(it.pasvorm)}</span>
                          <span className="text-xs" style={{ color: KLEUREN.grijs }}>
                            {it.vies ? "vies" : `schoon · ${it.draagTeller || 0}/${it.maxDraag}x`}
                          </span>
                          <button onClick={() => verwijder(it.id)} title="Verwijderen" style={{ color: KLEUREN.grijs }}>
                            <Trash2 size={15} />
                          </button>
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
