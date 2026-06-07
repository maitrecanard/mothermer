#!/usr/bin/env node
/*
 * Génère « Morthemer-Recherche-Historique.pdf » : synthèse chronologique illustrée
 * de la recherche historique sur le village de Morthemer (Valdivienne, 86).
 * Édition approfondie (v2) : seigneurs, imbrication église/château et passage des
 * chevaliers, Jean Chandos & légendes, fonds d'archives.
 *
 * Dépendance : pdfkit  ->  npm install pdfkit
 * Les polices standard (Helvetica/Times) couvrent les caractères accentués français.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = __dirname;
const IMG = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'Morthemer-Recherche-Historique.pdf');

const INK = '#1d2b3a', ACCENT = '#7a5230', MUTED = '#5b6671', RULE = '#c9b48f';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 64, bottom: 64, left: 64, right: 64 },
  info: {
    Title: 'Morthemer — Recherche historique et archéologique',
    Author: 'Recherche médiéviste',
    Subject: "Histoire du village de Morthemer (Valdivienne, Vienne) depuis l'an 900",
    Keywords: 'Morthemer, Valdivienne, château, église, collégiale, tour de Cognac, crypte, Chandos, médiéval',
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
  ensureSpace(52);
  doc.moveDown(0.5);
  doc.fillColor(ACCENT).font('Times-Bold').fontSize(18).text(txt);
  doc.moveDown(0.2); hr(); doc.fillColor(INK);
}
function h2(txt) {
  ensureSpace(34);
  doc.moveDown(0.4);
  doc.fillColor(INK).font('Times-Bold').fontSize(13).text(txt);
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
  doc.fillColor(MUTED).font('Times-Italic').fontSize(10).text(txt, { align: 'left', lineGap: 1.5 });
  doc.moveDown(0.45);
}
// Tableau générique à largeurs de colonnes proportionnelles
function table(cols, widths, rows, opts) {
  opts = opts || {};
  const gap = 12;
  const totalUnits = widths.reduce((a, b) => a + b, 0);
  const usable = CONTENT_W - gap * (widths.length - 1);
  const colW = widths.map(w => usable * w / totalUnits);
  // en-tête
  function header() {
    ensureSpace(22);
    const y = doc.y;
    doc.fillColor(ACCENT).font('Times-Bold').fontSize(9.5);
    let x = LEFT;
    cols.forEach((c, i) => { doc.text(c, x, y, { width: colW[i] }); x += colW[i] + gap; });
    doc.y = y + Math.max(...cols.map((c, i) => doc.heightOfString(c, { width: colW[i] }))) + 4;
    doc.save().strokeColor(RULE).lineWidth(0.8)
      .moveTo(LEFT, doc.y).lineTo(LEFT + CONTENT_W, doc.y).stroke().restore();
    doc.moveDown(0.2);
  }
  header();
  rows.forEach(r => {
    doc.font('Times-Roman').fontSize(9.5);
    const hs = r.map((cell, i) => doc.heightOfString(String(cell), { width: colW[i], lineGap: 1 }));
    const rowH = Math.max(...hs) + 6;
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom) { doc.addPage(); header(); }
    const y = doc.y;
    let x = LEFT;
    r.forEach((cell, i) => {
      doc.fillColor(i === 0 ? ACCENT : INK).font(i === 0 ? 'Times-Bold' : 'Times-Roman').fontSize(9.5)
        .text(String(cell), x, y + 2, { width: colW[i], lineGap: 1 });
      x += colW[i] + gap;
    });
    doc.y = y + rowH;
    doc.save().strokeColor('#ece4d0').lineWidth(0.4)
      .moveTo(LEFT, doc.y - 2).lineTo(LEFT + CONTENT_W, doc.y - 2).stroke().restore();
  });
  doc.moveDown(0.5);
  doc.fillColor(INK);
}
function figure(file, caption, maxH) {
  const p = path.join(IMG, file);
  if (!fs.existsSync(p)) return;
  maxH = maxH || 300;
  ensureSpace(Math.min(maxH, 180));
  doc.moveDown(0.2);
  try { doc.image(p, { fit: [CONTENT_W, maxH], align: 'center' }); }
  catch (e) { doc.fillColor('red').fontSize(9).text('[image illisible : ' + file + ']'); }
  doc.moveDown(0.2);
  doc.fillColor(MUTED).font('Times-Italic').fontSize(9).text(caption, { align: 'center' });
  doc.moveDown(0.6); doc.fillColor(INK);
}

/* ----------------------------- COUVERTURE ----------------------------- */
doc.moveDown(3);
doc.fillColor(ACCENT).font('Times-Bold').fontSize(34).text('MORTHEMER', { align: 'center' });
doc.fillColor(INK).font('Times-Italic').fontSize(15).text('Un village médiéval du Poitou', { align: 'center' });
doc.moveDown(0.6);
doc.save().strokeColor(RULE).lineWidth(1.5)
  .moveTo(LEFT + 120, doc.y).lineTo(LEFT + CONTENT_W - 120, doc.y).stroke().restore();
doc.moveDown(1.2);
doc.fillColor(MUTED).font('Times-Roman').fontSize(12)
  .text('Recherche historique et archéologique — édition approfondie', { align: 'center' });
doc.text('Commune de Valdivienne — Vienne (86)', { align: 'center' });
doc.text("Chronologie raisonnée depuis l'an 900", { align: 'center' });
if (fs.existsSync(path.join(IMG, '04-eglise-ensemble-sud.jpg'))) {
  doc.moveDown(1.5);
  doc.image(path.join(IMG, '04-eglise-ensemble-sud.jpg'), { fit: [CONTENT_W, 280], align: 'center' });
  doc.moveDown(0.2);
  doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
    .text('Le château (donjon) et l’église collégiale Notre-Dame, ensemble sud — cliché ancien '
      + '(≈ il y a un siècle), Médiathèque de l’architecture et du patrimoine (domaine public).',
      { align: 'center' });
}
doc.moveDown(0.8);
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text('« Reconstituer l’histoire d’un village plein de mystère. »', { align: 'center' });

/* ------------------------------- 1. SITUATION ------------------------------- */
doc.addPage();
h1('1. Situation et étymologie');
para("Morthemer est un ancien village et chef-lieu de châtellenie du Poitou, perché sur un "
  + "promontoire dominant la rivière la Dive, à l’est de Poitiers, dans l’actuelle commune de "
  + "Valdivienne (Vienne). Valdivienne a été créée en 1969 par la fusion de Morthemer, "
  + "Salles-en-Toulon et Saint-Martin-la-Rivière ; La Chapelle-Morthemer l’a rejointe dans les "
  + "années 1970.");
h2('Étymologie');
para("Nom attesté dès 1077 sous la forme latine Mortemarum, puis Mortemer (1164) et Morthomer "
  + "(1478). Lecture courante : composé « Morte- » (mort, stagnant) + « -mer » (latin mare, eau "
  + "dormante : étang, marais), soit une « mer morte » (Mortuum Mare), en écho aux étangs du "
  + "site, sur le modèle de Morteau ou Mortefontaine.");

/* ------------------------------- 2. CHRONOLOGIE ------------------------------- */
h1('2. Chronologie générale (depuis l’an 900)');
table(['Date', 'Événement'], [1.1, 4], [
  ['v. 900', "Terminus a quo de l’enquête. Le promontoire, lié à ses eaux dormantes (Mortuum Mare), commande un passage sur la Dive."],
  ['Xe s.', "Première mention du château (notice Mérimée)."],
  ['1054', "Le nom des seigneurs de Morthemer est cité ; ils se rattachent aux vicomtes de Châtellerault."],
  ['1066', "(Tradition locale) Raoul de Mortemer se serait illustré à Hastings. ⚠ À nuancer : probable confusion avec les Mortemer normands (§ 11)."],
  ['1077', "Le lieu est qualifié de Castellania Mortemari ; forme Mortemarum."],
  ['XIe s.', "Tour de Cognac. Chevet et crypte romans (2e moitié du XIe s.)."],
  ['fin XIe – déb. XIIe s.', "Église romane Notre-Dame (chœur, crypte)."],
  ['années 1220', "L’église est le siège d’un collège de chanoines (collégiale)."],
  ['1164', "Forme Mortemer."],
  ['v. 1230–1250', "Grand remaniement gothique de l’église : transept, nef, clocher, voûtement ; peintures de la crypte."],
  ['XIIIe s.', "La seigneurie passe de la famille de Morthemer aux Sénéchal."],
  ['v. 1369–1375', "Les Sénéchal font (re)construire le donjon ; l’église est fortifiée."],
  ['31 déc. 1369', "Jean Chandos, sénéchal du Poitou, blessé mortellement au pont de Lussac ; transporté à Morthemer, il y meurt le 1er janvier 1370 et y est inhumé."],
  ['1428', "Morthemer érigée en baronnie ; 28 fiefs dans sa mouvance."],
  ['XVe s.', "La seigneurie revient aux Taveau, jusqu’au XVIIIe s."],
  ['avant 1512', "Mathurin Taveau, seigneur ; gisant de Renée Sanglier, son épouse."],
  ['1771', "Construction (probable) du « petit château »."],
  ['1844', "Le baron de Soubeyran acquiert le domaine."],
  ['av. 1860', "Le château est en quasi-ruine : « sans intervention, le donjon n’existerait plus »."],
  ['v. 1865', "« Restauration abusive » par Émile Boeswillwald (disciple de Viollet-le-Duc) : donjon néo-médiéval, faux mâchicoulis « créés de toutes pièces »."],
  ['1908', "Église Notre-Dame classée Monument Historique."],
  ['1918', "Campagne photographique de Gossin (Médiathèque Grand Poitiers)."],
  ['18 mars 1927', "Donjon inscrit au titre des Monuments Historiques."],
  ['1969', "Création de la commune de Valdivienne."],
  ['1978', "Découverte des peintures murales de la crypte."],
  ['1982–1983', "Restauration des peintures."],
  ['14 mai 2008', "Inscription MH de l’ensemble du château."],
]);
note("Les peintures de la crypte sont datées du XIVe s. par certaines sources, de la campagne "
  + "1230-1250 (XIIIe s.) par d’autres : les deux datations sont rapportées sans trancher.");

/* ------------------------------- 3. SEIGNEURS ------------------------------- */
h1('3. Les seigneurs de Morthemer');
table(['Période', 'Lignée / personnage', 'Faits'], [1.2, 1.6, 3], [
  ['XIe–XIIIe s.', 'Famille de Morthemer (vicomtes de Châtellerault)', "Nom cité dès 1054 ; châtellenie en 1077."],
  ['XIIIe–XIVe s.', 'Famille Sénéchal (Senescallus)', "Reçoit la seigneurie ; (re)bâtit le donjon v. 1369-1375 ; armoiries probables dans la crypte (écu « accroché à un clou »)."],
  ['XVe–XVIIIe s.', 'Famille Taveau', "Baronnie en 1428 (28 fiefs) ; Mathurin Taveau (av. 1512), époux de Renée Sanglier (gisant)."],
  ['1844 →', 'Baron de Soubeyran et son fils', "Sauvent le château de la ruine ; commanditent la restauration Boeswillwald (1865)."],
]);
note("Jean Chandos porte le titre de sénéchal du Poitou ; cette coïncidence titre/patronyme "
  + "(famille Sénéchal de Morthemer) a pu nourrir localement des associations — à manier avec prudence.");

/* ------------------------------- 4. CHÂTEAU ------------------------------- */
h1('4. Le château');
h2('Le donjon');
para("Première mention au Xe siècle ; siège d’une châtellenie dès 1077, baronnie en 1428. Le "
  + "donjon est une tour quadrangulaire de cinq niveaux, flanquée de tourelles-contreforts sur "
  + "trois angles et d’une tour en saillie sur le quatrième, avec un ressaut à l’angle sud-est, "
  + "couronnée d’un parapet crénelé sur faux mâchicoulis. Il fut (re)construit par les Sénéchal "
  + "au 3e quart du XIVe siècle.");
h2('Le « petit château »');
para("Corps de logis rectangulaire, probablement de 1771, s’appuyant au nord sur l’église ; "
  + "quatre travées de fenêtres au sud (côté village) et portique aux arcs légèrement brisés "
  + "côté parc.");
h2('État avant 1860 et restauration de Boeswillwald');
para("Le château était si délabré avant 1860 que, sans l’intervention, « le donjon n’existerait "
  + "plus ». Acquis par le baron de Soubeyran en 1844, il est restauré vers 1865 par Émile "
  + "Boeswillwald, disciple de Viollet-le-Duc : chemin de ronde couvert, crénelage et faux "
  + "mâchicoulis « créés de toutes pièces », décor intérieur néo-gothique. La silhouette "
  + "« médiévale » actuelle est donc en grande partie une recomposition du XIXe siècle — donnée "
  + "essentielle pour lire le bâti d’origine (voir § 10 sur les vues anciennes).");
h2('Protection et accès');
para("Donjon inscrit MH le 18 mars 1927 ; ensemble inscrit le 14 mai 2008 (réf. PA00105752). "
  + "Propriété privée : le château ne se visite pas ; seule l’église est ouverte. Coordonnées : "
  + "46° 28′ 28,9″ N, 0° 36′ 44,4″ E.");
figure('01-chateau-vue-nord.jpg', "Le château, vue nord : le donjon restauré au XIXe s. et l’église (Wikimedia Commons).");
figure('02-donjon-ouest.jpg', "Le donjon, face ouest : tourelles-contreforts et parapet (Wikimedia Commons).", 320);

/* ------------------------------- 5. PASSAGE CHEVALIERS ------------------------------- */
h1('5. Église ↔ château : le passage des seigneurs et chevaliers');
para("L’une des singularités majeures de Morthemer : l’église et le château sont soudés l’un à "
  + "l’autre sur le rocher, « collés ». Le petit château s’appuie directement sur la nef de "
  + "Notre-Dame, et un bâtiment-tour relie à l’ouest le logis au donjon.");
h2('Comment on passe de l’un à l’autre');
bullet("Un passage voûté sous la deuxième travée de la nef donne accès à la cour du château : "
  + "on pénètre dans la forteresse en passant sous / par l’église — cœur de la circulation "
  + "seigneuriale du site.");
bullet("Le grand portail occidental (entrée monumentale d’origine de l’église) a été muré — "
  + "témoignage direct de la mise en défense et du basculement de l’accès vers le château.");
bullet("L’entrée actuelle se fait par le nord, en longeant le chevet par un passage étroit "
  + "ménagé entre le mur de l’église et le mur d’enceinte du château.");
bullet("Une tribune (galerie en hauteur) permettait au seigneur et à sa maison — chevaliers, "
  + "garnison, familiers — d’assister à la messe sans se mêler aux fidèles : disposition typique "
  + "des églises fortifiées.");
bullet("La crypte servait de nécropole seigneuriale (tombes des seigneurs).");
para("Lecture d’historien : cette configuration matérialise la fusion du pouvoir militaire et "
  + "du pouvoir religieux entre les mains du seigneur — il contrôlait l’unique passage, dominait "
  + "l’assemblée depuis sa tribune, et reposait sous le chœur. Pour la garnison, franchir "
  + "l’église était littéralement franchir le premier seuil du château : image saisissante de "
  + "chevaliers traversant le sanctuaire pour gagner la cour et le donjon.");
note("Point débattu : une tradition (catalogue de la Médiathèque Grand Poitiers) présente "
  + "l’église comme l’ancienne chapelle du château agrandie en collégiale. La recherche "
  + "universitaire (ArmmA, Univ. Poitiers) le conteste : église paroissiale et collège de "
  + "chanoines dès les années 1220, sans fonction de chapelle castrale. On retient l’imbrication "
  + "physique avérée, en signalant que la qualification de « chapelle du château » est contestée.");
figure('07-eglise-interieur-nef-choeur.jpg', "Intérieur : la nef vers le chœur en hémicycle. Le passage voûté vers le château ouvre sous la 2e travée (Médiathèque de l’architecture et du patrimoine).");

/* ------------------------------- 6. ÉGLISE ------------------------------- */
h1('6. L’église collégiale Notre-Dame');
h2('Datation et campagnes');
para("Édifice roman des XIe–XIIe s. Le chevet et la crypte conservent leur structure romane de "
  + "la 2e moitié du XIe s. ; le transept, la nef et le clocher furent lourdement remaniés entre "
  + "1230 et 1250 (gothique, voûtement). Collégiale (collège de chanoines) dès les années 1220 ; "
  + "édifice fortifié au XIVe s., restauré au XIXe s.");
h2('Plan et élévation');
para("Nef de quatre à cinq travées (les sources varient), transept asymétrique, chœur en "
  + "hémicycle surplombant la crypte. Clocher-porche en pierre coiffé d’une flèche (décrit comme "
  + "« clocher triangulaire trapu » dans une notice ancienne). Modillons sculptés au chevet "
  + "(masques d’animaux, acrobates, visages). Accès et tribune : voir § 5.");
figure('05-eglise-angle-sud-est.jpg', "Église, angle sud-est : chevet et modillons sculptés (Médiathèque de l’architecture et du patrimoine).");
h2('La crypte et ses peintures');
para("Crypte à trois vaisseaux (nécropole seigneuriale), jadis plus vaste, éclairée par quatre "
  + "ouvertures. Elle conserve un Christ en Majesté sur la voûte (entouré des symboles des "
  + "évangélistes) et une Vierge à l’Enfant sur le mur est ; frise végétale et écu armorié "
  + "« accroché à un clou » (probablement les Sénéchal). Le fond quadrillé trahit l’influence de "
  + "l’enluminure et du vitrail. Peintures découvertes en 1978, restaurées en 1982-1983, datées "
  + "du XIIIe–XIVe s. selon les sources.");
figure('08-eglise-crypte.jpg', "La crypte, vue vers le nord-est (Médiathèque de l’architecture et du patrimoine).");
h2('Mobilier');
para("Deux enfeus du XIVe s. ; gisant de Renée Sanglier (épouse de Mathurin Taveau, av. 1512) ; "
  + "Vierge à l’Enfant en bois polychrome du XVIIe s. ; vitrail de sainte Radegonde ; tableau "
  + "impérial de 1861. Église classée Monument Historique en 1908.");
figure('09-eglise-gisant.jpg', "Tombeau et gisant (Renée Sanglier) dans l’église (Médiathèque de l’architecture et du patrimoine).");

/* ------------------------------- 7. TOUR DE COGNAC ------------------------------- */
h1('7. La tour de Cognac');
para("Élément le plus discrètement documenté du dossier. La « tour de Cognac » est citée par le "
  + "patrimoine local comme datant du XIe siècle (une source isolée avance le Xe s.). Elle figure "
  + "dans les inventaires de Morthemer/Valdivienne, mais aucune monographie détaillée (fonction, "
  + "état, localisation cadastrale) n’a pu être retrouvée en ligne.");
para("Lecture d’historien : une tour isolée du XIe s. dans une châtellenie de cette importance "
  + "évoque soit une tour de guet / défense avancée commandant un point de passage (la Dive, un "
  + "gué, une route), soit une tour seigneuriale secondaire rattachée à l’un des 28 fiefs. Le nom "
  + "« Cognac » est ici un microtoponyme (du gallo-romain Conniacum), sans rapport avec la ville "
  + "de Cognac ni l’eau-de-vie.");
note("À documenter par les Archives départementales de la Vienne (cadastre, terriers de la châtellenie).");

/* ------------------------------- 8. LE TROU / ŒIL ------------------------------- */
h1('8. Le mystère du « trou en forme d’œil » au plafond');
para("Question posée : la voûte de l’église présenterait un trou ressemblant à un œil, situé à "
  + "l’opposé du clocher. Pourquoi ?");
para("État des sources : aucun document public consulté ne décrit explicitement ce trou. Ce qui "
  + "suit relève de l’interprétation argumentée, à confirmer par un relevé sur place. Le clocher "
  + "se dresse vers l’est (côté chœur/château) ; « à l’opposé du clocher » désigne donc "
  + "vraisemblablement la partie occidentale (l’ancien grand portail muré, § 5).");
h2('Hypothèses, de la plus probable à la plus spéculative');
bullet("Un oculus (œil-de-bœuf) — la plus vraisemblable. Oculus signifie littéralement « œil » : "
  + "ouverture circulaire percée dans une voûte ou un pignon pour apporter la lumière. Très banal "
  + "dans le roman/gothique poitevin ; la forme « en œil » est alors fonctionnelle et nominale.");
bullet("Charge symbolique — l’« Œil de Dieu ». Un oculus bien placé crée un faisceau de lumière "
  + "balayant le chœur ; symbole de l’omniscience divine ou éclairage de l’autel à des moments "
  + "liturgiques précis.");
bullet("Trémie de cloche / passage de corde, antérieure à l’aménagement du clocher (v. 1230-1250) "
  + "et conservée ; le décalage s’expliquerait par un déplacement du beffroi.");
bullet("Lien avec la tribune seigneuriale (§ 5) : ouverture haute de communication entre la "
  + "galerie du seigneur et la nef (observation ou son), plausible dans une église si liée au château.");
bullet("Ouverture acoustique (vase scellé dans la voûte) — ou hagioscope mal interprété (peu "
  + "probable au plafond : ne tient que si le « trou » est en réalité dans un mur).");
para("Conclusion provisoire : l’explication la plus économique reste un oculus, fonctionnel "
  + "(lumière) et potentiellement symbolique (l’« œil » divin éclairant le chœur), son décalage "
  + "s’expliquant par les remaniements de 1230-1250. À valider par un relevé in situ et auprès de "
  + "la CRMH Nouvelle-Aquitaine.");

/* ------------------------------- 9. CHANDOS & LÉGENDES ------------------------------- */
h1('9. Jean Chandos et les légendes');
para("Jean (John) Chandos († 1er janvier 1370), sénéchal du Poitou et connétable d’Aquitaine, "
  + "fut l’un des grands capitaines anglais de la guerre de Cent Ans, chef des forces d’occupation "
  + "des provinces cédées par le traité de Brétigny. Le 31 décembre 1369, il est blessé "
  + "mortellement au combat du pont de Lussac-les-Châteaux ; transporté à la forteresse de "
  + "Morthemer, il y meurt le lendemain et y est inhumé. Une carte postale ancienne porte "
  + "explicitement la légende : « La forteresse de Morthemer où fut transporté Chandos, blessé au "
  + "Pont de Lussac » (§ 10).");
h2('Légendes locales');
bullet("Le fantôme de Chandos : certaines nuits, on entendrait encore des pas autour du château, "
  + "comme si l’âme du capitaine hantait les lieux — récit que les anciens du village transmettent.");
bullet("Les « Dames de Morthemer » : une illustration romantique met en scène des dames "
  + "médiévales devant le donjon, écho au folklore seigneurial du lieu.");
figure('10-dames-de-morthemer.jpg', "« Dames de Morthemer » : illustration romantique de la légende seigneuriale (Wikimedia Commons).", 240);

/* ------------------------------- 10. ICONOGRAPHIE & ARCHIVES ------------------------------- */
h1('10. Iconographie et fonds d’archives');
para("Toutes les images de ce dossier proviennent de Wikimedia Commons (domaine public / "
  + "Creative Commons), pour l’essentiel des clichés anciens de la Médiathèque de l’architecture "
  + "et du patrimoine (fonds APMH). Elles sont rassemblées dans le dossier images/ du dépôt.");
h2('Sur les vues avant la restauration de 1865');
para("Le château actuel étant une recomposition du XIXe s., seules des vues antérieures à 1865 "
  + "montrent son état primitif (quasi-ruine). Or aucune n’est librement téléchargeable : "
  + "Wikimedia Commons n’en possède pas, et les dépôts qui en conservent imposent des droits ou "
  + "un accès restreint. Les clichés APMH / Gossin (début XXe) réunis ici montrent l’édifice tel "
  + "qu’il était il y a ~un siècle, soit après la restauration — la source ancienne la plus proche "
  + "librement diffusable. Pour les vues antérieures, consulter :");
table(['Fonds', 'Description', 'Accès'], [1.4, 2.6, 1.4], [
  ['Médiathèque Grand Poitiers — Gossin, 1918', '2 estampes N&B : vue côté parc ; abside et vue partielle du château (cote 2017 A-B VIE F3).', 'Catalogue Syracuse (magasin)'],
  ['Médiathèque Grand Poitiers — château', 'Vue ancienne, auteur non déterminé (DocID 942872).', 'Catalogue Syracuse'],
  ['Geneanet — cartes postales', 'CPA « forteresse de Morthemer où fut transporté Chandos ».', 'geneanet.org (compte)'],
  ['Base Mémoire (POP, Min. Culture)', 'Photographies anciennes / fonds APMH.', 'pop.culture.gouv.fr'],
  ['Gallica / BnF', 'Congrès archéologique de France, session Poitiers 1843 : planches gravées possibles.', 'gallica.bnf.fr'],
  ['Arch. dép. de la Vienne', 'Cadastre napoléonien, terriers, fonds figurés.', 'archives-vienne.fr'],
]);

/* ------------------------------- 11. NOTES & SOURCES ------------------------------- */
h1('11. Notes critiques et sources');
h2('Points à vérifier / débattus');
bullet("Hastings (1066) : « Raoul de Mortemer » relève de la tradition locale ; la famille de "
  + "Mortemer présente à la conquête est normande (Mortemer-en-Bray). Attribution douteuse.");
bullet("Chapelle castrale vs collégiale : tradition contestée par ArmmA (paroissiale + collégiale "
  + "dès les années 1220). Cf. § 5.");
bullet("Dates de protection : église classée 1908 ; donjon inscrit 1927 ; ensemble du château 2008.");
bullet("Peintures de la crypte : XIIIe (1230-1250) ou XIVe s. ; découvertes 1978, restaurées 1982-1983.");
bullet("Nombre de travées de la nef : 4 ou 5 selon les sources. Tour de Cognac : datation et "
  + "fonction à confirmer. Le « trou-œil » : non documenté (§ 8).");
h2('Sources principales');
[
  "Site officiel de Valdivienne — Histoire et Légendes ; Église Notre-Dame de Morthemer.",
  "POP / Mérimée (Min. Culture) — Château de Morthemer, PA00105752.",
  "ArmmA (SAPRAT / Univ. Poitiers) — Morthemer, église Notre-Dame.",
  "chateau-fort-manoir-chateau.eu — Château de Morthemer (donjon, petit château, Soubeyran, état avant 1860).",
  "Monumentum — Château de Morthemer.",
  "Base des collégiales séculières de France (Univ. Limoges) — Notre-Dame de Morthemer.",
  "Médiathèque Grand Poitiers — Gossin, 1918 (vues anciennes).",
  "Geneanet — CPA forteresse de Morthemer / Chandos.",
  "Offices de tourisme Sud Vienne Poitou & Chauvigny ; Wikipédia (Valdivienne) ; Wikimedia Commons.",
].forEach(s => bullet(s));
note("Pistes non dépouillées en ligne : Archives départementales de la Vienne (cadastre, terriers), "
  + "CRMH Nouvelle-Aquitaine, société HÉRAGE / Cercle généalogique poitevin (genea86.org), Congrès "
  + "archéologique de France (Poitou, 1843), Gallica.");
doc.moveDown(0.5); hr();
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text("Morthemer — Recherche historique et archéologique. Édition approfondie (v2). Document "
    + "généré à partir du dossier RECHERCHE-MORTHEMER.md.", { align: 'center' });

doc.end();
console.log('PDF généré : ' + OUT);
