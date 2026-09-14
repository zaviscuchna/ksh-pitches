// ====== Data realizací — jeden zdroj pro galerii i administraci ======
// V produkci nahradí databáze; DEMO ukládá změny do localStorage prohlížeče.

const PKM_KEY = 'pkm_projects_v1';

const DEFAULT_PROJECTS = [
  { cat:'rodinne',  tag:'Realizace',   img:'img/g-leseni.jpg',       title:'Rekonstrukce a nadstavba RD',      desc:'Kompletní projekt rekonstrukce a nadstavby rodinného domu včetně statického řešení a vyřízení stavebního povolení.' },
  { cat:'rodinne',  tag:'Realizace',   img:'img/g-garaz.jpg',        title:'Novostavba RD s garáží',           desc:'Projekt novostavby rodinného domu s garáží a krytým stáním — od studie po stavební povolení.' },
  { cat:'rodinne',  tag:'Realizace',   img:'img/g-cihlovy.jpg',      title:'Novostavba RD — hrubá stavba',     desc:'Zděná novostavba rodinného domu. Kompletní dokumentace pro povolení stavby včetně všech profesí.', bp:'img/bp-cihlovy.jpg' },
  { cat:'rekreacni',tag:'Realizace',   img:'img/g-tiny-babice.jpg',  title:'Tiny house · Babice u Řehenic',    desc:'Projekt rekreačního objektu včetně umístění na pozemku a vyřízení povolení.' },
  { cat:'rekreacni',tag:'Realizace',   img:'img/g-tiny-interier.jpg',title:'Tiny house · Rataje nad Sázavou',  desc:'Interiér realizovaného tiny housu — dispozice navržená na míru malému prostoru.' },
  { cat:'obcanska', tag:'Realizace',   img:'img/g-kancelare.jpg',    title:'Podkrovní kanceláře',              desc:'Přestavba nevyužité půdy na moderní kancelářské prostory — návrh, dokumentace i dozor při realizaci.' },
  { cat:'rodinne',  tag:'Realizace',   img:'img/g-hruba-cihla.jpg',  title:'Novostavba zděného RD',            desc:'Projekt zděné novostavby rodinného domu; hrubá stavba pod naším stavebním dozorem.' },
  { cat:'rodinne',  tag:'Realizace',   img:'img/g-zazemi.jpg',       title:'Volnočasové zázemí u RD',          desc:'Projekt volnočasového zázemí s bazénem a krytou terasou u rodinného domu.' },
  { cat:'rekreacni',tag:'Realizace',   img:'img/g-tiny-int2.jpg',    title:'Interiér rekreačního objektu',     desc:'Obytný prostor s kuchyní a spacím patrem — promyšlené řešení každého metru.' },
  { cat:'obcanska', tag:'Vizualizace', img:'img/g-tribuna.jpg',      title:'Zastřešení fotbalové tribuny',     desc:'Návrh ocelové konstrukce zastřešení tribuny fotbalového hřiště.' },
  { cat:'rodinne',  tag:'Vizualizace', img:'img/g-moderni-rd.jpg',   title:'Moderní RD s plochou střechou',    desc:'Architektonická studie moderního rodinného domu s plochou střechou a bazénem.' },
  { cat:'obcanska', tag:'Vizualizace', img:'img/g-naves-viz.jpg',    title:'Revitalizace návsi — návrh',       desc:'Vizualizace revitalizace návsi. Od tohoto návrhu jsme projekt dovedli až k realizaci.' },
  { cat:'obcanska', tag:'Vizualizace', img:'img/g-centrum.jpg',      title:'Centrum služeb pro turisty',       desc:'Studie objektu občanské vybavenosti pro obec — centrum služeb pro turisty.' },
  { cat:'rekreacni',tag:'Vizualizace', img:'img/g-chalupa-viz.jpg',  title:'Studie rekreační chalupy',         desc:'Návrh rekreační chalupy — tradiční tvarosloví v současném provedení.' },
];

const CAT_LABELS = { rodinne:'Rodinné domy', rekreacni:'Rekreační objekty', obcanska:'Občanská vybavenost' };

function pkmLoad() {
  try {
    const raw = localStorage.getItem(PKM_KEY);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d) && d.length) return d; }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
}
function pkmSave(list) { localStorage.setItem(PKM_KEY, JSON.stringify(list)); }
function pkmReset() { localStorage.removeItem(PKM_KEY); }
