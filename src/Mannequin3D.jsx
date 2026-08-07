import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

// ---------- Kleurhelpers ----------
// Elk kledingstuk in de app heeft een kleuren-array (of oudere enkelvoudige
// kleur) en een lijst met { id, hex } kleurdefinities. Hier pakken we gewoon
// de eerste kleur als hoofdkleur voor de 3D-vulling — bij een meerkleurig
// stuk (zoals een gestreepte sjaal) is dat een nette, simpele keuze.
function hoofdkleur(item, kleurenLijst) {
  const ids = item?.kleuren?.length ? item.kleuren : [item?.kleur].filter(Boolean);
  const id = ids[0];
  const info = kleurenLijst.find((k) => k.id === id);
  return info?.hex || "#B8A6C9";
}

const HUID = "#E8C6A0";

// ---------- Weer-achtergrond ----------
// Simpele gradient-achtergrond + regen-animatie op basis van temperatuur en
// regenkans. Geen echte hemel-simulatie, maar genoeg om "buiten, en het
// weer van vandaag" te laten voelen.
function weerKleuren(temp, regenkans) {
  const regent = regenkans >= 50;
  if (regent) return { boven: "#7C8A99", onder: "#B9C2CB", mist: "#8B97A3" };
  if (temp >= 22) return { boven: "#7EB6E0", onder: "#F4E4B8", mist: "#BFE0F2" };
  if (temp >= 10) return { boven: "#A9CBE0", onder: "#E9E6D8", mist: "#CFE0EA" };
  return { boven: "#C7D3DE", onder: "#EDEDED", mist: "#DCE3E8" };
}

function Regendruppels({ actief }) {
  const ref = useRef();
  const posities = useMemo(
    () => Array.from({ length: 60 }, () => [(Math.random() - 0.5) * 6, Math.random() * 6, (Math.random() - 0.5) * 4]),
    []
  );
  useFrame(() => {
    if (!actief || !ref.current) return;
    ref.current.children.forEach((druppel, i) => {
      druppel.position.y -= 0.12;
      if (druppel.position.y < -0.2) druppel.position.y = 6;
    });
  });
  if (!actief) return null;
  return (
    <group ref={ref}>
      {posities.map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 4]} />
          <meshBasicMaterial color="#DCE7F0" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Zon({ zichtbaar }) {
  if (!zichtbaar) return null;
  return (
    <mesh position={[1.6, 2.6, -2.5]}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshBasicMaterial color="#FCE7A0" />
    </mesh>
  );
}

// ---------- De pop zelf ----------
// Een bewust gestileerde, laag-poly figuur — geen poging tot realisme, maar
// een duidelijke, nette silhouet-pop die de kledingkleuren draagt. Onderdelen
// zijn licht van elkaar gescheiden (kleur + kleine offset) zodat lagen zoals
// een jas over een shirt zichtbaar blijven.
function Pop({ outfit, kleurenLijst }) {
  const basiskleur = outfit.basislaag ? hoofdkleur(outfit.basislaag, kleurenLijst) : "#DDD8CC";
  const overkleur = outfit.overlaag ? hoofdkleur(outfit.overlaag, kleurenLijst) : null;
  const broekkleur = outfit.broek ? hoofdkleur(outfit.broek, kleurenLijst) : "#8A8F98";
  const schoenkleur = outfit.schoenen ? hoofdkleur(outfit.schoenen, kleurenLijst) : "#3A2E22";
  const jaskleur = outfit.jas ? hoofdkleur(outfit.jas, kleurenLijst) : null;

  const accessoires = outfit.accessoires || (outfit.accessoire ? [outfit.accessoire] : []);
  const vind = (vorm) => accessoires.find((a) => (a.__vorm || "") === vorm);

  return (
    <group position={[0, -1.55, 0]}>
      {/* Hoofd */}
      <mesh position={[0, 3.05, 0]} castShadow>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color={HUID} roughness={0.7} />
      </mesh>

      {/* Nek */}
      <mesh position={[0, 2.78, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.14, 12]} />
        <meshStandardMaterial color={HUID} roughness={0.7} />
      </mesh>

      {/* Basislaag (torso) */}
      <mesh position={[0, 2.32, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.3, 0.82, 16]} />
        <meshStandardMaterial color={basiskleur} roughness={0.85} />
      </mesh>

      {/* Armen (basislaagkleur als mouwen) */}
      {[-1, 1].map((zijde) => (
        <group key={zijde}>
          <mesh position={[zijde * 0.42, 2.42, 0]} rotation={[0, 0, zijde * 0.12]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.68, 10]} />
            <meshStandardMaterial color={basiskleur} roughness={0.85} />
          </mesh>
          {/* Handen */}
          <mesh position={[zijde * 0.47, 2.02, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={HUID} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Overlaag (trui/vest) — iets ruimer om over de basislaag heen te vallen */}
      {overkleur && (
        <mesh position={[0, 2.36, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.34, 0.62, 16]} />
          <meshStandardMaterial color={overkleur} roughness={0.9} />
        </mesh>
      )}

      {/* Broek (benen) */}
      {[-1, 1].map((zijde) => (
        <mesh key={zijde} position={[zijde * 0.15, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.9, 12]} />
          <meshStandardMaterial color={broekkleur} roughness={0.85} />
        </mesh>
      ))}

      {/* Schoenen */}
      {[-1, 1].map((zijde) => (
        <mesh key={zijde} position={[zijde * 0.15, 0.85, 0.06]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.32]} />
          <meshStandardMaterial color={schoenkleur} roughness={0.6} />
        </mesh>
      ))}

      {/* Jas — losse open buitenlaag, iets groter en een fractie naar voren */}
      {jaskleur && (
        <mesh position={[0, 2.3, 0.02]} castShadow>
          <cylinderGeometry args={[0.44, 0.4, 0.95, 16, 1, true, 0.3, Math.PI * 1.4]} />
          <meshStandardMaterial color={jaskleur} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Accessoires: eenvoudige, herkenbare props op de juiste plek */}
      {vind("riem") && (
        <mesh position={[0, 1.92, 0]}>
          <torusGeometry args={[0.33, 0.03, 8, 24]} />
          <meshStandardMaterial color={hoofdkleur(vind("riem"), kleurenLijst)} />
        </mesh>
      )}
      {vind("das") && (
        <mesh position={[0, 2.15, 0.3]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.08, 0.5, 0.02]} />
          <meshStandardMaterial color={hoofdkleur(vind("das"), kleurenLijst)} />
        </mesh>
      )}
      {vind("sjaal") && (
        <mesh position={[0, 2.7, 0]}>
          <torusGeometry args={[0.16, 0.07, 8, 20]} />
          <meshStandardMaterial color={hoofdkleur(vind("sjaal"), kleurenLijst)} />
        </mesh>
      )}
      {(vind("pet") || vind("muts")) && (
        <mesh position={[0, 3.28, 0]}>
          <sphereGeometry args={[0.27, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hoofdkleur(vind("pet") || vind("muts"), kleurenLijst)} />
        </mesh>
      )}
      {vind("zonnebril") && (
        <mesh position={[0, 3.08, 0.24]}>
          <boxGeometry args={[0.3, 0.06, 0.03]} />
          <meshStandardMaterial color="#1C1C1C" />
        </mesh>
      )}
      {vind("horloge") && (
        <mesh position={[0.47, 1.98, 0]}>
          <torusGeometry args={[0.045, 0.015, 6, 12]} />
          <meshStandardMaterial color={hoofdkleur(vind("horloge"), kleurenLijst)} metalness={0.4} />
        </mesh>
      )}
    </group>
  );
}

// ---------- Weer-scene: achtergrondgradient via een grote bol, plus rain/zon ----------
function WeerScene({ temp, regenkans }) {
  const kleuren = weerKleuren(temp, regenkans);
  const regent = regenkans >= 50;
  const zonnig = !regent && temp >= 18;
  return (
    <>
      <color attach="background" args={[kleuren.onder]} />
      <fog attach="fog" args={[kleuren.mist, 6, 14]} />
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[16, 10]} />
        <meshBasicMaterial color={kleuren.boven} />
      </mesh>
      <Zon zichtbaar={zonnig} />
      <Regendruppels actief={regent} />
    </>
  );
}

// ---------- Publiek component ----------
// props: outfit (met basislaag/overlaag/broek/schoenen/jas/accessoires),
// weer ({ temp, regenkans }), kleuren (de kleurenlijst uit de app),
// accessoireVorm (functie die van een item-naam de accessoiresoort afleidt).
export default function Mannequin3D({ outfit, weer, kleuren, accessoireVorm }) {
  // Elk accessoire krijgt zijn herkenbare "vorm" (riem, das, pet, ...) erbij,
  // zodat de pop weet welk propje hij moet tekenen.
  const outfitMetVorm = useMemo(() => {
    const accessoires = (outfit.accessoires || (outfit.accessoire ? [outfit.accessoire] : [])).map((a) => ({
      ...a,
      __vorm: accessoireVorm ? accessoireVorm(a.naam) : "horloge",
    }));
    return { ...outfit, accessoires };
  }, [outfit, accessoireVorm]);

  const temp = weer?.temp ?? 18;
  const regenkans = weer?.regenkans ?? 0;

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
      <Canvas shadows camera={{ position: [0, 0.4, 3.4], fov: 35 }} dpr={[1, 1.5]}>
        <WeerScene temp={temp} regenkans={regenkans} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
        <Pop outfit={outfitMetVorm} kleurenLijst={kleuren} />
        <ContactShadows position={[0, -1.56, 0]} opacity={0.4} scale={4} blur={2.2} far={2} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.2}
          maxDistance={5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, 0.3, 0]}
        />
      </Canvas>
    </div>
  );
}
