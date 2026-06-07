# mothermer — Recherche historique sur le village de Morthemer

> **Nature du projet.** Ce dépôt n'est pas un projet de code applicatif mais un
> **projet de recherche historique** : reconstituer l'histoire du village
> médiéval de **Morthemer** (aujourd'hui commune de **Valdivienne**, Vienne, 86),
> depuis l'an **900**, à partir des écrits, récits et archives publiques.

*Le brief original (voir « Cahier des charges » plus bas) demandait d'adopter la
posture d'un historien-archéologue médiéviste, de rassembler un maximum de pièces,
de récupérer des images, et d'aboutir à un **PDF chronologique précis**.*

---

## 📦 Livrables produits

| Livrable | Fichier | Description |
|----------|---------|-------------|
| 📄 **PDF chronologique illustré** | [`Morthemer-Recherche-Historique.pdf`](Morthemer-Recherche-Historique.pdf) | Synthèse de **14 pages** (éd. approfondie), chronologie depuis l'an 900 + 10 illustrations |
| 📝 **Dossier de recherche détaillé** | [`RECHERCHE-MORTHEMER.md`](RECHERCHE-MORTHEMER.md) | **v3** — 11 sections : données, seigneurs, passage des chevaliers, hypothèses, galerie étendue, sources |
| 🖼️ **Iconographie** | [`images/`](images/) | **15 images** (domaine public / Creative Commons) |
| ⚖️ **Crédits & licences** | [`CREDITS.md`](CREDITS.md) | Source/licence de chaque image + liens vers plans/peintures non redistribués |
| ⚙️ **Générateur de PDF** | [`generate-pdf.js`](generate-pdf.js) | Script Node/pdfkit reproductible |

---

## ✅ Cahier des charges → état des livrables

Les « fonctionnalités » demandées dans le brief initial, traitées **une par une** :

| # | Fonctionnalité demandée | Statut | Où ? |
|---|--------------------------|--------|------|
| 1 | 🏯 Le **château de Morthemer** | ✅ Approfondi (donjon, petit château, Soubeyran, restauration) | RECHERCHE § 4 |
| 2 | ⛪ L'**église collégiale Notre-Dame** | ✅ Approfondi | RECHERCHE § 6 |
| 3 | 🗼 La **tour de Cognac** | ✅ Traité (sources rares, pistes d'archives données) | RECHERCHE § 7 |
| 4 | 👁️ Le **mystère du trou (« œil »)** à l'opposé du clocher | ✅ Analysé (5 hypothèses argumentées) | RECHERCHE § 8 |
| 5 | 🖼️ **Images / croquis / plans / peintures** + fonds d'archives | ✅ **15 images** téléchargées + plan, peintures de la crypte, héraldique & notices **liés** | `images/`, `CREDITS.md`, RECHERCHE § 10 |
| 6 | 📄 **PDF chronologique précis** depuis l'an 900 | ✅ Généré (14 p.) | `Morthemer-Recherche-Historique.pdf` |
| 7 | ⚔️ **Passage des seigneurs/chevaliers** entre église et château *(approfondissement demandé)* | ✅ Section dédiée | RECHERCHE § 5 |

---

## 🔎 Résumé des découvertes

- **Morthemer** = chef-lieu d'une **châtellenie** du Poitou (attestée *Castellania
  Mortemari* en **1077**), érigée en **baronnie en 1428** (28 fiefs). Étymologie :
  *Mortuum Mare*, « mer morte » (eaux dormantes / étangs).
- **Seigneurs successifs** : famille de **Morthemer** (vicomtes de Châtellerault) →
  **Sénéchal** (XIIIe-XIVe s., bâtisseurs du donjon v. 1369-1375) → **Taveau**
  (XVe-XVIIIe s.) → **baron de Soubeyran** (1844, sauve le château de la ruine).
- **⚔️ Le passage des chevaliers (axe approfondi)** : église et château **soudés**
  sur le rocher. Un **passage voûté sous la 2ᵉ travée de la nef** mène à la cour du
  château — **on entre dans la forteresse par l'église**. Grand **portail ouest
  muré**, accès reporté au nord le long du chevet ; **tribune seigneuriale** d'où le
  seigneur et sa garnison suivaient la messe à part ; **crypte = nécropole**. *(La
  qualification de « chapelle castrale » est **débattue** : ArmmA y voit une
  paroissiale + collégiale dès les années 1220.)*
- **Château** : donjon **carré à 5 niveaux** (tourelles-contreforts), **petit
  château de 1771** ; **quasi-ruine avant 1860**, puis **« restauration abusive »**
  par **Boeswillwald** (~1865) — la silhouette actuelle est en partie une
  **recomposition du XIXe s.** Donjon inscrit MH **1927**, ensemble **2008**.
- **Église collégiale Notre-Dame** : romane (XIe-XIIe s.), remaniée gothique
  **1230-1250**, **crypte à 3 vaisseaux** avec peintures (Christ en Majesté, Vierge
  à l'Enfant) **découvertes en 1978**, restaurées 1982-1983 ; **classée MH 1908**.
- **Jean Chandos**, sénéchal du Poitou, blessé à **Lussac-les-Châteaux** le **31 déc.
  1369**, **transporté à Morthemer**, y meurt le 1ᵉʳ janv. 1370 et y est inhumé. Son
  **monument commémoratif** (XIVe s.) a été **déplacé à Mazerolles en 1886** (à ne pas
  confondre avec le lieu d'inhumation). **Légendes** : fantôme de Chandos ; « Dames de Morthemer ».
- **Plans, peintures de la crypte & héraldique** : un **plan de l'église** (relevé Durand
  1979-80), les **peintures** (Christ en Majesté, Vierge à l'Enfant) et l'**écu des Taveau**
  sont documentés par la base **ArmmA** — **liés** (droits réservés), voir [`CREDITS.md`](CREDITS.md).
- **Tour de Cognac** : datée XIe s. (toponyme local *Conniacum*, sans rapport avec
  la ville de Cognac) — documentation lacunaire, à compléter en archives.
- **Le « trou-œil »** : non documenté dans les sources publiques. Hypothèse
  privilégiée : un **oculus** (« œil » de pierre), à la fois fonctionnel (lumière)
  et **symbolique** (l'« Œil de Dieu »), son décalage par rapport au clocher
  s'expliquant par les remaniements de 1230-1250. **À valider par un relevé in situ.**

> 🖼️ **Images d'archives avant la restauration de 1865.** Le château actuel étant une
> recomposition du XIXe s., son **état primitif (quasi-ruine)** n'apparaît que sur des
> vues antérieures à 1865 — **aucune n'est librement téléchargeable** (Wikimedia n'en a
> pas ; les dépôts qui en conservent sont sous droits ou à accès restreint). Les clichés
> APMH/Gossin réunis ici montrent l'édifice **il y a ~un siècle** (après restauration).
> Liste des **6 fonds d'archives** à consulter (Médiathèque Grand Poitiers / Gossin 1918,
> Geneanet, base Mémoire, Gallica, Arch. dép. Vienne) : [`RECHERCHE-MORTHEMER.md`](RECHERCHE-MORTHEMER.md) § 10.

> ⚠️ **Note critique majeure** : la présence d'un « Raoul de Mortemer » à **Hastings
> (1066)**, reprise par les sites locaux, relève vraisemblablement d'une **confusion
> avec les Mortemer normands** (Mortemer-en-Bray). Traité comme légende seigneuriale
> faute de charte poitevine. Détails dans [`RECHERCHE-MORTHEMER.md`](RECHERCHE-MORTHEMER.md) § 8.

---

## 🔁 Cycle qualité appliqué

Le brief demandait un cycle « développement → vérification → tests → exécution →
correction → régression ». Ce cycle, conçu pour du code, a été **transposé à un
projet de recherche** :

1. **Recherche** — collecte multi-sources (sites officiels, base Mérimée/POP,
   ArmmA-Univ. Poitiers, Wikipédia, offices de tourisme).
2. **Vérification croisée** — chaque date/fait confirmé par ≥ 2 sources quand
   possible ; divergences explicitement signalées (datation des peintures, MH).
3. **« Tests » de cohérence** — contrôle chronologique (an 900 → 2008) et
   structurel du PDF (9 pages, 8 images, en-tête/trailer/EOF valides).
4. **Exécution** — génération du PDF via `generate-pdf.js`.
5. **Correction** — images d'erreur Wikimedia détectées et remplacées par des
   versions valides redimensionnées (PDF ramené de 9,8 Mo → 2,2 Mo).
6. **Non-régression** — revalidation complète du PDF après correction.

---

## 🛠️ Régénérer le PDF

Prérequis : Node.js + [`pdfkit`](https://pdfkit.org/).

```bash
# 1. Installer la dépendance (dans un dossier de build au choix)
npm install pdfkit

# 2. Générer le PDF (les images doivent être présentes dans images/)
NODE_PATH=/chemin/vers/node_modules node generate-pdf.js
# -> Morthemer-Recherche-Historique.pdf
```

Le script lit le dossier `images/` et produit le PDF à la racine. Toute mise à jour
du contenu se fait dans `generate-pdf.js` (texte) puis régénération.

---

## 📚 Sources principales

Site officiel de **Valdivienne**, base **Mérimée / POP** (PA00105752), **ArmmA**
(Univ. Poitiers), **Monumentum**, offices de tourisme Sud Vienne Poitou & Chauvigny,
**Wikipédia**, **Wikimedia Commons** (images). Liste complète et liens dans
[`RECHERCHE-MORTHEMER.md`](RECHERCHE-MORTHEMER.md) § 9.

---

## 📜 Cahier des charges initial (brief d'origine)

> Recherche sur le passé d'un village médiéval, but : retrouver et reconstituer
> l'histoire du village. Posture : historien-archéologue médiéviste. Récupérer
> toutes les informations sur Morthemer (86) depuis l'an 900, sur : la tour de
> Cognac, l'église, le trou « en forme d'œil » au plafond à l'opposé du clocher
> (pourquoi ?), le château. Récupérer des images/croquis. Finalité : un PDF
> extrêmement précis suivant la chronologie depuis l'an 900.

---

*Recherche menée et compilée automatiquement. Les points incertains sont signalés —
la rigueur prime sur le romanesque. Version 1.0.*
