# De Kledingkast

Persoonlijke garderobe-app: outfitvoorstellen voor 5 dagen op basis van het weer,
met stijlregels (pasvorm, laagvolgorde, kleuren, patronen) en was-administratie.

## Lokaal draaien
```bash
npm install
npm run dev
```

## Op GitHub + Vercel zetten
1. Maak een nieuwe repository op GitHub en push deze map:
   ```bash
   git init
   git add .
   git commit -m "Eerste versie"
   git remote add origin https://github.com/<jouw-naam>/garderobe.git
   git push -u origin main
   ```
2. Ga naar vercel.com → "Add New Project" → importeer de repository.
3. Vercel herkent Vite automatisch; gewoon op Deploy klikken. Klaar.

## Aanpassen
- **Locatie voor het weer**: de coördinaten staan in `haalWeerOp()` in `src/App.jsx`
  (nu Amsterdam). Weerdata komt van Open-Meteo, gratis en zonder API-key.
- **Botsende kleuren**: de lijst `KLEUR_CLASHES` bovenin `src/App.jsx`.
- **Stijlregels**: gedocumenteerd in het blok "Stijlregels" in `src/App.jsx`.
- Je gegevens (kast, plan, gedragen-status) staan in localStorage van je browser.
