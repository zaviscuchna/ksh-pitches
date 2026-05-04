# 🧠 Mozek — Mapa všech projektů KSH

Vizuální dashboard všech projektů ve studiu — přehled stavu, klientů, stacků, linků.
Slouží Matymu jako rychlá orientace **a** Claude Code jako rozšířený kontextový mozek.

## Spuštění

Stačí dvojklik na `index.html`. Načítá `data.js` přes `<script>` tag, takže funguje
přímo z `file://` (žádný server netřeba).

## Struktura

```
mozek/
├── index.html      ← UI (KSH dark + gold, Playfair + Inter)
├── data.js         ← všechna data (zdroj pravdy)
├── assets/         ← drop-in loga / screenshoty (org. po projektech)
└── README.md
```

## Přidat / upravit projekt

1. Otevři `data.js`
2. Najdi pole `projects: [...]`
3. Přidej / uprav záznam
4. Refresh prohlížeče

### Šablona záznamu

```js
{
  id: "unikatni-id",
  name: "Název projektu",
  category: "active",        // active / delivered / pitch-sent / pitch-draft / internal / tooling
  stack: "html",             // html / nextjs / mixed / doc
  owner: "maty",             // maty / zavis / shared
  client: { name: "...", email: "...", company: "..." },
  package: "Premium — 20 990 Kč",
  status_note: "Krátký aktuální stav",
  links: {
    live: "https://...",
    repo: "https://github.com/...",
    folder: "cesta/k/projektu"
  },
  description: "Delší popis projektu",
  tech_notes: "Technické poznámky pro Claude / pro tebe",
  todo: ["co je třeba dodělat"],
  last_activity: "2026-05-01",
  tags: ["štítek", "štítek2"]
}
```

## Logo / asset projektu

Drop logo do `assets/<id-projektu>/logo.png` — UI ho automaticky vyzvedne (až bude
v3 podporováno; v1 zatím zobrazuje iniciálu). Zatím funguje jako sklad.

## Klávesové zkratky

- `/` — fokus do search
- `Esc` — zavřít detail / vyčistit search

## Filtry

V levém panelu klikni na kategorii / stack / vlastníka — kombinují se (AND).
Tlačítko `↻ Vyčistit filtry` smaže všechny.

## Roadmap (v2+)

- Drag&drop loga přímo do UI
- Markdown poznámky per projekt
- Timeline view (chronologická osa)
- Connections — kdo na čem dělá / závislosti
- Export do PDF
- Editace `data.js` přímo v UI (bez ručního editování souboru)
