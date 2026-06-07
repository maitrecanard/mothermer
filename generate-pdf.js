#!/usr/bin/env node
/*
 * Génère « Morthemer-Recherche-Historique.pdf » : une synthèse chronologique
 * illustrée de la recherche historique sur le village de Morthemer (Valdivienne, 86).
 *
 * Dépendance : pdfkit.
 *   npm install pdfkit
 * Les polices standard (Helvetica/Times) couvrent les caractères accentués français.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = __dirname;
const IMG = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'Morthemer-Recherche-Historique.pdf');

// Palette
const INK = '#1d2b3a';
const ACCENT = '#7a5230';
const MUTED = '#5b6671';
const RULE = '#c9b48f';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 64, bottom: 64, left: 64, right: 64 },
  info: {
    Title: 'Morthemer — Recherche historique et archéologique',
    Author: 'Recherche médiéviste',
    Subject: "Histoire du village de Morthemer (Valdivienne, Vienne) depuis l'an 900",
    Keywords: 'Morthemer, Valdivienne, château, église, tour de Cognac, crypte, médiéval',
  },
});
doc.pipe(fs.createWriteStream(OUT));

const PAGE_W = doc.page.width;
const CONTENT_W = PAGE_W - doc.page.margins.left - doc.page.margins.right;
const LEFT = doc.page.margins.left;

function ensureSpace(h) {
  if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function hr() {
  ensureSpace(16);
  doc.moveDown(0.3);
  doc.save().strokeColor(RULE).lineWidth(1)
    .moveTo(LEFT, doc.y).lineTo(LEFT + CONTENT_W, doc.y).stroke().restore();
  doc.moveDown(0.6);
}

function h1(txt) {
  ensureSpace(50);
  doc.moveDown(0.5);
  doc.fillColor(ACCENT).font('Times-Bold').fontSize(19).text(txt, { align: 'left' });
  doc.moveDown(0.2);
  hr();
  doc.fillColor(INK);
}

function h2(txt) {
  ensureSpace(34);
  doc.moveDown(0.4);
  doc.fillColor(INK).font('Times-Bold').fontSize(13.5).text(txt);
  doc.moveDown(0.25);
}

function para(txt) {
  doc.fillColor(INK).font('Times-Roman').fontSize(11).text(txt, { align: 'justify', lineGap: 2 });
  doc.moveDown(0.45);
}

function bullet(txt) {
  doc.fillColor(INK).font('Times-Roman').fontSize(11)
    .text('•  ' + txt, { align: 'left', lineGap: 1.5, indent: 8 });
  doc.moveDown(0.2);
}

function note(txt) {
  ensureSpace(30);
  const y0 = doc.y;
  doc.save().fillColor('#f3ecdd').rect(LEFT, y0 - 2, CONTENT_W, 0).restore();
  doc.fillColor(MUTED).font('Times-Italic').fontSize(10).text(txt, { align: 'left', lineGap: 1.5 });
  doc.moveDown(0.45);
}

// Table chronologique : tableau à deux colonnes (date, événement)
function chronoTable(rows) {
  const dateW = 96;
  const evW = CONTENT_W - dateW - 14;
  doc.font('Times-Roman').fontSize(10);
  rows.forEach(([date, ev]) => {
    const evH = doc.heightOfString(ev, { width: evW, lineGap: 1 });
    const dH = doc.heightOfString(date, { width: dateW, lineGap: 1 });
    const rowH = Math.max(evH, dH) + 8;
    ensureSpace(rowH + 2);
    const y = doc.y;
    doc.save().strokeColor('#e6ddc7').lineWidth(0.5)
      .moveTo(LEFT, y - 2).lineTo(LEFT + CONTENT_W, y - 2).stroke().restore();
    doc.fillColor(ACCENT).font('Times-Bold').fontSize(10)
      .text(date, LEFT, y + 2, { width: dateW });
    doc.fillColor(INK).font('Times-Roman').fontSize(10)
      .text(ev, LEFT + dateW + 14, y + 2, { width: evW, lineGap: 1 });
    doc.y = y + rowH;
  });
  doc.moveDown(0.4);
}

function figure(file, caption) {
  const p = path.join(IMG, file);
  if (!fs.existsSync(p)) return;
  const maxW = CONTENT_W;
  const maxH = 300;
  // Mesure approximative pour pagination : on réserve maxH + légende.
  ensureSpace(180);
  doc.moveDown(0.2);
  try {
    doc.image(p, { fit: [maxW, maxH], align: 'center' });
  } catch (e) {
    doc.fillColor('red').font('Times-Roman').fontSize(9).text('[image illisible : ' + file + ']');
  }
  doc.moveDown(0.2);
  doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
    .text(caption, { align: 'center' });
  doc.moveDown(0.6);
  doc.fillColor(INK);
}

/* ----------------------------- PAGE DE COUVERTURE ----------------------------- */
doc.moveDown(3);
doc.fillColor(ACCENT).font('Times-Bold').fontSize(34).text('MORTHEMER', { align: 'center' });
doc.fillColor(INK).font('Times-Italic').fontSize(15)
  .text("Un village médiéval du Poitou", { align: 'center' });
doc.moveDown(0.6);
doc.save().strokeColor(RULE).lineWidth(1.5)
  .moveTo(LEFT + 120, doc.y).lineTo(LEFT + CONTENT_W - 120, doc.y).stroke().restore();
doc.moveDown(1.2);
doc.fillColor(MUTED).font('Times-Roman').fontSize(12)
  .text('Recherche historique et archéologique', { align: 'center' });
doc.text("Commune de Valdivienne — Vienne (86)", { align: 'center' });
doc.text("Chronologie raisonnée depuis l'an 900", { align: 'center' });

if (fs.existsSync(path.join(IMG, '04-eglise-ensemble-sud.jpg'))) {
  doc.moveDown(1.5);
  doc.image(path.join(IMG, '04-eglise-ensemble-sud.jpg'),
    { fit: [CONTENT_W, 280], align: 'center' });
  doc.moveDown(0.2);
  doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
    .text('Le château (donjon) et l’église collégiale Notre-Dame, ensemble sud. '
      + 'Cliché ancien, Médiathèque de l’architecture et du patrimoine (domaine public).',
      { align: 'center' });
}
doc.moveDown(1);
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text('« Reconstituer l’histoire d’un village plein de mystère. »', { align: 'center' });

/* ------------------------------- 1. SITUATION ------------------------------- */
doc.addPage();
h1('1. Situation et étymologie');
para("Morthemer est un ancien village et chef-lieu de châtellenie du Poitou, perché sur "
  + "un promontoire dominant la rivière la Dive, à l’est de Poitiers, dans l’actuelle "
  + "commune de Valdivienne (Vienne). Valdivienne a été créée en 1969 par la fusion de "
  + "Morthemer, Salles-en-Toulon et Saint-Martin-la-Rivière ; La Chapelle-Morthemer l’a "
  + "rejointe dans les années 1970.");
h2('Étymologie');
para("Le nom est attesté dès 1077 sous la forme latine Mortemarum, puis Mortemer (1164) et "
  + "Morthomer (1478). La lecture la plus courante est un composé « Morte- » (mort, stagnant) "
  + "+ « -mer » (du latin mare, eau dormante : étang, marais) — littéralement une « mer morte » "
  + "(Mortuum Mare), en écho aux étangs du site, sur le modèle de Morteau ou Mortefontaine.");

/* ------------------------------- 2. CHRONOLOGIE ------------------------------- */
h1('2. Chronologie générale (depuis l’an 900)');
chronoTable([
  ['v. 900', "Terminus a quo de l’enquête. Le site, lié à ses eaux dormantes (Mortuum Mare), est occupé ; le promontoire commande un passage sur la Dive."],
  ['Xe s.', "Première mention du château dans les sources (notice Mérimée)."],
  ['1054', "Le nom des seigneurs de Morthemer est cité ; ils se rattachent aux vicomtes de Châtellerault."],
  ['1066', "(Tradition locale) Raoul de Mortemer se serait illustré à Hastings aux côtés de Guillaume le Conquérant. ⚠ À nuancer : probable confusion avec les Mortemer normands (voir § 8)."],
  ['1077', "Le lieu est qualifié de Castellania Mortemari (châtellenie) ; forme Mortemarum attestée."],
  ['XIe s.', "Tour de Cognac. Chevet et crypte romans (2e moitié du XIe s.)."],
  ['fin XIe – début XIIe s.', "Construction de l’église romane Notre-Dame."],
  ['1164', "Forme Mortemer."],
  ['v. 1230–1250', "Remaniement gothique de l’église : transept, nef, clocher, voûtement ; peintures de la crypte ; l’église devient collégiale."],
  ['XIIIe s.', "Érection en collégiale séculière (Notre-Dame)."],
  ['31 déc. 1369', "Jean Chandos, sénéchal du Poitou, blessé mortellement au pont de Lussac-les-Châteaux ; il meurt le lendemain et est inhumé à Morthemer."],
  ['XIVe s.', "Donjon (re)construit / fortifié ; crypte fortifiée ; enfeus et peintures gothiques."],
  ['1428', "Morthemer érigée en baronnie ; 28 fiefs dans sa mouvance."],
  ['1478', "Forme Morthomer."],
  ['avant 1512', "Mathurin Taveau, seigneur ; gisant de Renée Sanglier, son épouse, dans l’église."],
  ['v. 1865', "Restauration du château par Émile Boeswillwald (disciple de Viollet-le-Duc) : donjon néo-médiéval, faux mâchicoulis « créés de toutes pièces »."],
  ['1908', "Église Notre-Dame classée Monument Historique."],
  ['18 mars 1927', "Donjon du château inscrit au titre des Monuments Historiques."],
  ['1969', "Création de la commune de Valdivienne (fusion)."],
  ['1978', "Découverte des peintures murales de la crypte."],
  ['1982–1983', "Restauration des peintures de la crypte."],
  ['14 mai 2008', "Inscription MH de l’ensemble du château (petit château, communs, murs)."],
]);
note("Note de méthode : les peintures de la crypte sont datées du XIVe s. par certaines "
  + "sources, de la campagne de 1230-1250 (XIIIe s.) par d’autres. Les deux datations sont "
  + "rapportées sans trancher artificiellement.");

/* ------------------------------- 3. CHÂTEAU ------------------------------- */
h1('3. Le château de Morthemer');
h2('Origines et seigneurs');
para("La première mention du château remonte au Xe siècle. Siège d’une châtellenie dès "
  + "1077 (Castellania Mortemari), il fut tenu par une lignée rattachée aux vicomtes de "
  + "Châtellerault, puis érigé en baronnie en 1428, au sommet d’un réseau de 28 fiefs. La "
  + "seigneurie passa notamment aux Taveau (Mathurin Taveau, avant 1512).");
h2('Architecture');
para("Le château se présente comme une forteresse en deux parties : un donjon quadrangulaire "
  + "massif et un corps de logis rectangulaire dit le « petit château », accolé à la nef de "
  + "l’église Notre-Dame. Le donjon est daté du XIIe siècle (construit ou reconstruit au "
  + "XIVe s. selon les notices).");
h2('La « restauration abusive » de Boeswillwald (v. 1865)');
para("Émile Boeswillwald, disciple de Viollet-le-Duc, donna au donjon son aspect défensif "
  + "actuel : chemin de ronde couvert, crénelage et faux mâchicoulis « créés de toutes pièces » "
  + "par le restaurateur, décor intérieur néo-gothique. C’est un cas classique de "
  + "restauration romantique du XIXe s. : la silhouette « médiévale » admirée aujourd’hui "
  + "est en partie une recomposition — donnée capitale pour lire le bâti d’origine.");
h2('Protection et accès');
para("Donjon inscrit MH le 18 mars 1927 ; ensemble des bâtiments inscrit le 14 mai 2008 "
  + "(réf. PA00105752). Propriété privée, le château ne se visite pas ; seule l’église est "
  + "ouverte. Coordonnées : 46° 28′ 28,9″ N, 0° 36′ 44,4″ E.");
figure('01-chateau-vue-nord.jpg', "Le château de Morthemer, vue nord : le donjon restauré au XIXe s. (Wikimedia Commons).");
figure('02-donjon-ouest.jpg', "Le donjon, face ouest (Wikimedia Commons).");

/* ------------------------------- 4. ÉGLISE ------------------------------- */
h1('4. L’église collégiale Notre-Dame');
h2('Datation et campagnes');
para("Édifice roman des XIe–XIIe siècles. Le chevet et la crypte conservent leur structure "
  + "romane de la 2e moitié du XIe s. ; le transept, la nef et le clocher furent lourdement "
  + "remaniés entre 1230 et 1250, introduisant le gothique et le voûtement. L’église devient "
  + "alors collégiale. Elle fut fortifiée au XIVe siècle (lien direct avec le château) puis "
  + "restaurée au XIXe s.");
h2('Plan et élévation');
para("Nef unique de cinq travées, transept asymétrique, chœur en hémicycle surplombant la "
  + "crypte. Clocher-porche en pierre coiffé d’une flèche. Le chevet est orné de modillons "
  + "sculptés (masques d’animaux, acrobates, visages). L’accès se fait par un passage "
  + "étroit entre l’église et l’enceinte du château, le portail principal ayant été muré "
  + "— témoignage de l’imbrication église/château.");
figure('07-eglise-interieur-nef-choeur.jpg', "Intérieur : la nef vers le chœur en hémicycle (Médiathèque de l’architecture et du patrimoine).");
h2('La crypte et ses peintures');
para("Crypte à trois vaisseaux (sépulture des seigneurs), jadis plus vaste et éclairée par "
  + "quatre ouvertures. Elle conserve un Christ en Majesté sur la voûte (entouré des symboles "
  + "des évangélistes) et une Vierge à l’Enfant sur le mur est ; frise végétale et écu "
  + "armorié « accroché à un clou » (probablement la famille du Sénéchal). Le fond quadrillé "
  + "trahit l’influence de l’enluminure et du vitrail. Peintures découvertes en 1978, "
  + "restaurées en 1982-1983, datées du XIIIe–XIVe s. selon les sources.");
figure('08-eglise-crypte.jpg', "La crypte, vue vers le nord-est (Médiathèque de l’architecture et du patrimoine).");
h2('Mobilier funéraire');
para("Deux enfeus du XIVe s. et le gisant de Renée Sanglier, épouse de Mathurin Taveau "
  + "(seigneur avant 1512) ; Vierge à l’Enfant en bois polychrome du XVIIe s. ; vitrail de "
  + "sainte Radegonde. Église classée Monument Historique en 1908.");
figure('09-eglise-gisant.jpg', "Tombeau et statue funéraire (gisant) dans l’église (Médiathèque de l’architecture et du patrimoine).");

/* ------------------------------- 5. TOUR DE COGNAC ------------------------------- */
h1('5. La tour de Cognac');
para("C’est l’élément le plus discrètement documenté du dossier. La « tour de Cognac » "
  + "est mentionnée par le patrimoine local comme datant du XIe siècle (une source isolée avance "
  + "le Xe s.). Elle figure dans les inventaires du patrimoine de Morthemer/Valdivienne, mais "
  + "aucune monographie détaillée (fonction, état, localisation cadastrale) n’a pu être "
  + "retrouvée dans les sources publiques en ligne.");
para("Lecture d’historien : une tour isolée du XIe s. dans une châtellenie de cette "
  + "importance évoque soit une tour de guet / de défense avancée commandant un point de passage "
  + "(la Dive, un gué, une route), soit une tour seigneuriale secondaire rattachée à l’un des "
  + "28 fiefs. Le nom « Cognac » est ici un microtoponyme local (du gallo-romain Conniacum), "
  + "sans rapport avec la ville de Cognac ni l’eau-de-vie.");
note("Recommandation : vérification sur place et dépouillement des Archives départementales de "
  + "la Vienne (cadastre, terriers de la châtellenie) pour documenter cette tour.");

/* ------------------------------- 6. LE TROU / ŒIL ------------------------------- */
h1('6. Le mystère du « trou en forme d’œil » au plafond');
para("Question posée : la voûte de l’église présenterait un trou ressemblant à un œil, "
  + "situé à l’opposé du clocher. Pourquoi ?");
para("État des sources : aucun document public consulté ne décrit explicitement ce trou. Ce qui "
  + "suit relève donc de l’interprétation argumentée, à confirmer par un relevé sur place "
  + "(la fonction dépend de la position exacte : voûte du chœur ? clé de voûte de la nef ? "
  + "pignon occidental ?). Le clocher se dresse à l’extrémité orientale (vers le chœur, côté "
  + "château) ; « à l’opposé du clocher » désigne donc vraisemblablement la partie "
  + "occidentale de l’édifice.");
h2('Hypothèses, de la plus probable à la plus spéculative');
bullet("Un oculus (œil-de-bœuf) — l’explication la plus vraisemblable. Oculus signifie "
  + "littéralement « œil » : ouverture circulaire percée dans une voûte ou un pignon pour apporter "
  + "la lumière. Très banal dans le roman/gothique poitevin ; la forme « en œil » est alors "
  + "fonctionnelle et nominale.");
bullet("Charge symbolique — l’« Œil de Dieu ». Un oculus bien placé crée un faisceau de "
  + "lumière balayant le chœur ; il a pu être voulu comme symbole de l’omniscience divine ou "
  + "pour illuminer l’autel à des moments liturgiques précis.");
bullet("Trémie de cloche / passage de corde. Avant l’aménagement du clocher (remanié vers "
  + "1230-1250), une ouverture de tirage de cloche ou de levage a pu être percée puis conservée ; "
  + "son décalage s’expliquerait par le déplacement du beffroi.");
bullet("Ouverture acoustique / vase acoustique scellé dans la voûte, dont subsisterait un orifice.");
bullet("Hagioscope mal interprété (peu probable au plafond) : ouverture latérale vers l’autel — "
  + "ne tient que si le « trou » est en réalité dans un mur.");
para("Conclusion provisoire : l’explication la plus économique est un oculus, fonctionnel "
  + "(lumière) et potentiellement symbolique (l’« œil » divin éclairant le chœur), son "
  + "décalage s’expliquant par les remaniements de 1230-1250. À valider par un relevé in situ "
  + "(position, diamètre, ébrasement, scellements) et auprès de la CRMH Nouvelle-Aquitaine.");

/* ------------------------------- 7. ICONOGRAPHIE ------------------------------- */
h1('7. Iconographie complémentaire');
figure('05-eglise-angle-sud-est.jpg', "Église, angle sud-est : chevet et modillons sculptés (Médiathèque de l’architecture et du patrimoine).");
figure('11-vitrail-radegonde.jpg', "Vitrail de sainte Radegonde (Wikimedia Commons).");
para("Toutes les images de ce dossier proviennent de Wikimedia Commons (domaine public ou "
  + "Creative Commons), pour l’essentiel des clichés anciens de la Médiathèque de "
  + "l’architecture et du patrimoine (fonds APMH). Les fichiers sont rassemblés dans le "
  + "dossier images/ du dépôt.");

/* ------------------------------- 8. NOTES CRITIQUES ------------------------------- */
h1('8. Notes critiques et points à vérifier');
bullet("Hastings (1066) : la présence d’un « Raoul de Mortemer » relève de la tradition "
  + "locale. Historiquement, la famille de Mortemer présente à la conquête de l’Angleterre "
  + "est normande (Mortemer-en-Bray, Seine-Maritime). L’homonymie rend l’attribution "
  + "douteuse tant qu’aucune charte poitevine ne l’étaye.");
bullet("Dates de protection : église classée 1908 ; donjon inscrit 1927 ; ensemble du château "
  + "inscrit 2008.");
bullet("Peintures de la crypte : XIIIe (campagne 1230-1250) ou XIVe s. selon les sources ; "
  + "découvertes 1978, restaurées 1982-1983.");
bullet("Tour de Cognac : datation (Xe/XIe s.) et fonction à confirmer en archives.");
bullet("Le « trou-œil » : non documenté ; hypothèses du § 6 à valider sur place.");

/* ------------------------------- 9. SOURCES ------------------------------- */
h1('9. Sources');
const sources = [
  "Site officiel de Valdivienne — Histoire et Légendes : valdivienne.fr/culture-et-tourisme/patrimoine/883-histoire-et-legende",
  "Site officiel de Valdivienne — Église Notre-Dame de Morthemer : valdivienne.fr/culture-et-tourisme/patrimoine/928-eglise-de-morthemer",
  "POP / Mérimée (Ministère de la Culture) — Château de Morthemer, PA00105752 : pop.culture.gouv.fr/notice/merimee/PA00105752",
  "ArmmA (SAPRAT / Univ. Poitiers) — Morthemer, église Notre-Dame : armma.saprat.fr/monument/sarcophage-morthemer-valdivienne",
  "Monumentum — Château de Morthemer : monumentum.fr/chateau-morthemer-pa00105752.html",
  "Office de tourisme Sud Vienne Poitou — Église Notre-Dame de Morthemer",
  "Tourisme Chauvigny — Château de Morthemer : tourisme-chauvigny.com/chateau-de-morthemer",
  "Wikipédia — Morthemer / Valdivienne : fr.wikipedia.org/wiki/Valdivienne",
  "Base des collégiales séculières de France — Notre-Dame de Morthemer (Univ. Limoges)",
  "Wikimedia Commons — Catégorie : Château de Morthemer (images, domaine public)",
];
sources.forEach(s => bullet(s));
note("Pistes d’archives non dépouillées en ligne : Archives départementales de la Vienne "
  + "(terriers et cadastre de la châtellenie), fonds CRMH Nouvelle-Aquitaine, société HÉRAGE / "
  + "Cercle généalogique poitevin (genea86.org), Congrès archéologique de France (Poitou).");
doc.moveDown(0.5);
hr();
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text("Morthemer — Recherche historique et archéologique. Document généré automatiquement "
    + "à partir du dossier de recherche (RECHERCHE-MORTHEMER.md). Version 1.0.",
    { align: 'center' });

doc.end();
console.log('PDF généré : ' + OUT);
