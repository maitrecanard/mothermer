#!/usr/bin/env node
/*
 * Génère « Morthemer-Recherche-Historique.pdf » : synthèse chronologique illustrée
 * de la recherche sur Morthemer (Valdivienne, 86), depuis l'an 900.
 * Reconstruit à neuf d'après le cahier des charges actualisé (textes d'époque,
 * manuscrits, plans, gravures).
 *
 * Dépendance : pdfkit  ->  npm install pdfkit
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = __dirname, IMG = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'Morthemer-Recherche-Historique.pdf');
const INK = '#1d2b3a', ACCENT = '#7a5230', MUTED = '#5b6671', RULE = '#c9b48f', QBG = '#f5efe2';

const doc = new PDFDocument({
  size: 'A4', margins: { top: 64, bottom: 64, left: 64, right: 64 },
  info: {
    Title: 'Morthemer — Recherche historique et archéologique',
    Author: 'Recherche médiéviste',
    Subject: "Histoire de Morthemer (Valdivienne, Vienne) depuis l'an 900",
    Keywords: 'Morthemer, Valdivienne, château, église, tour de Cognac, crypte, Chandos, Froissart',
  },
});
doc.pipe(fs.createWriteStream(OUT));
const PAGE_W = doc.page.width;
const CONTENT_W = PAGE_W - doc.page.margins.left - doc.page.margins.right;
const LEFT = doc.page.margins.left;

function ensureSpace(h){ if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage(); }
function hr(){ ensureSpace(16); doc.moveDown(0.3);
  doc.save().strokeColor(RULE).lineWidth(1).moveTo(LEFT,doc.y).lineTo(LEFT+CONTENT_W,doc.y).stroke().restore();
  doc.moveDown(0.6); }
function h1(t){ ensureSpace(52); doc.moveDown(0.5);
  doc.fillColor(ACCENT).font('Times-Bold').fontSize(18).text(t); doc.moveDown(0.2); hr(); doc.fillColor(INK); }
function h2(t){ ensureSpace(34); doc.moveDown(0.4);
  doc.fillColor(INK).font('Times-Bold').fontSize(13).text(t); doc.moveDown(0.25); }
function para(t){ doc.fillColor(INK).font('Times-Roman').fontSize(11).text(t,{align:'justify',lineGap:2}); doc.moveDown(0.45); }
function bullet(t){ doc.fillColor(INK).font('Times-Roman').fontSize(11).text('•  '+t,{align:'left',lineGap:1.5,indent:8}); doc.moveDown(0.2); }
function note(t){ ensureSpace(28); doc.fillColor(MUTED).font('Times-Italic').fontSize(10).text(t,{align:'left',lineGap:1.5}); doc.moveDown(0.45); }
function quote(t, cite){
  doc.font('Times-Italic').fontSize(10.5);
  const innerW = CONTENT_W - 24;
  const h = doc.heightOfString(t,{width:innerW,lineGap:2}) + (cite?doc.heightOfString(cite,{width:innerW}):0) + 20;
  ensureSpace(h);
  const y0 = doc.y;
  doc.save().fillColor(QBG).rect(LEFT, y0, CONTENT_W, h).fill().restore();
  doc.save().fillColor(ACCENT).rect(LEFT, y0, 4, h).fill().restore();
  doc.fillColor(INK).font('Times-Italic').fontSize(10.5).text(t, LEFT+14, y0+8, {width:innerW, lineGap:2});
  if (cite){ doc.fillColor(MUTED).font('Times-Roman').fontSize(8.5).text(cite, LEFT+14, doc.y+2, {width:innerW}); }
  doc.y = y0 + h; doc.moveDown(0.5); doc.fillColor(INK);
}
function table(cols, widths, rows){
  const gap=12, units=widths.reduce((a,b)=>a+b,0), usable=CONTENT_W-gap*(widths.length-1);
  const colW=widths.map(w=>usable*w/units);
  function header(){ ensureSpace(22); const y=doc.y; doc.fillColor(ACCENT).font('Times-Bold').fontSize(9.5); let x=LEFT;
    cols.forEach((c,i)=>{doc.text(c,x,y,{width:colW[i]}); x+=colW[i]+gap;});
    doc.y=y+Math.max(...cols.map((c,i)=>doc.heightOfString(c,{width:colW[i]})))+4;
    doc.save().strokeColor(RULE).lineWidth(0.8).moveTo(LEFT,doc.y).lineTo(LEFT+CONTENT_W,doc.y).stroke().restore(); doc.moveDown(0.2); }
  header();
  rows.forEach(r=>{ doc.font('Times-Roman').fontSize(9.5);
    const rowH=Math.max(...r.map((c,i)=>doc.heightOfString(String(c),{width:colW[i],lineGap:1})))+6;
    if (doc.y+rowH>doc.page.height-doc.page.margins.bottom){ doc.addPage(); header(); }
    const y=doc.y; let x=LEFT;
    r.forEach((c,i)=>{ doc.fillColor(i===0?ACCENT:INK).font(i===0?'Times-Bold':'Times-Roman').fontSize(9.5)
      .text(String(c),x,y+2,{width:colW[i],lineGap:1}); x+=colW[i]+gap; });
    doc.y=y+rowH;
    doc.save().strokeColor('#ece4d0').lineWidth(0.4).moveTo(LEFT,doc.y-2).lineTo(LEFT+CONTENT_W,doc.y-2).stroke().restore();
  });
  doc.moveDown(0.5); doc.fillColor(INK);
}
function figure(file, caption, maxH){
  const p=path.join(IMG,file); if(!fs.existsSync(p)) return; maxH=maxH||300;
  let img; try{ img=doc.openImage(p); }catch(e){ return; }
  const scale=Math.min(CONTENT_W/img.width, maxH/img.height);
  const w=img.width*scale, h=img.height*scale;
  const capH=caption?doc.heightOfString(caption,{width:CONTENT_W})+6:0;
  // réserve la hauteur réelle (image + légende) ; saute de page si nécessaire
  if (doc.y + h + capH + 10 > doc.page.height - doc.page.margins.bottom) doc.addPage();
  doc.moveDown(0.2);
  const x=LEFT+(CONTENT_W-w)/2, y=doc.y;
  try{ doc.image(p, x, y, {width:w, height:h}); doc.y = y + h; }
  catch(e){ doc.fillColor('red').fontSize(9).text('[image: '+file+']'); }
  doc.moveDown(0.2);
  if(caption){ doc.fillColor(MUTED).font('Times-Italic').fontSize(9).text(caption,{align:'center'}); }
  doc.moveDown(0.6); doc.fillColor(INK);
}

/* ---- COUVERTURE ---- */
doc.moveDown(3);
doc.fillColor(ACCENT).font('Times-Bold').fontSize(34).text('MORTHEMER',{align:'center'});
doc.fillColor(INK).font('Times-Italic').fontSize(15).text('Un village médiéval du Poitou',{align:'center'});
doc.moveDown(0.6);
doc.save().strokeColor(RULE).lineWidth(1.5).moveTo(LEFT+120,doc.y).lineTo(LEFT+CONTENT_W-120,doc.y).stroke().restore();
doc.moveDown(1.2);
doc.fillColor(MUTED).font('Times-Roman').fontSize(12).text('Recherche historique et archéologique',{align:'center'});
doc.text('Commune de Valdivienne — Vienne (86)',{align:'center'});
doc.text("Chronologie raisonnée depuis l'an 900",{align:'center'});
if (fs.existsSync(path.join(IMG,'03-chateau-eglise-ancien.jpg'))){
  doc.moveDown(1.5);
  doc.image(path.join(IMG,'03-chateau-eglise-ancien.jpg'),{fit:[CONTENT_W,280],align:'center'});
  doc.moveDown(0.2);
  doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
    .text('Le château (donjon) et l’église collégiale Notre-Dame — cliché ancien (≈ un siècle), '
      +'Médiathèque de l’architecture et du patrimoine (domaine public).',{align:'center'});
}
doc.moveDown(0.8);
doc.fillColor(MUTED).font('Times-Italic').fontSize(9).text('« Reconstituer l’histoire d’un village plein de mystère. »',{align:'center'});

/* ---- 1. SITUATION ---- */
doc.addPage();
h1('1. Situation et étymologie');
para("Morthemer est un ancien village et chef-lieu de châtellenie du Poitou, sur un promontoire "
  +"dominant la rivière la Dive, à l’est de Poitiers, dans la commune de Valdivienne (Vienne) — née "
  +"en 1969 de la fusion de Morthemer, Salles-en-Toulon et Saint-Martin-la-Rivière.");
para("Étymologie : le nom, composé de « Morte- » (eau stagnante) et « -mer » (latin mare, eau "
  +"dormante), signifie « mer morte » (Mortuum Mare), en écho aux étangs du site. Les formes "
  +"écrites successives constituent la plus ancienne trace documentaire du lieu :");
table(['Forme écrite','Date','Source'],[1.2,1,2.2],[
  ['Mortemarum','1077','acte : Castellania Mortemari (châtellenie)'],
  ['Mortemer','1164 ; Froissart v. 1370','charte ; chronique'],
  ['Morthomer','1478','acte'],
  ['Morthemer','époque moderne','forme stabilisée'],
]);

/* ---- 2. CHRONOLOGIE ---- */
h1('2. Chronologie depuis l’an 900');
table(['Date','Événement'],[1.1,4],[
  ['v. 900',"Terminus a quo. Le promontoire commande un passage sur la Dive."],
  ['Xe s.',"Première mention du château (Mérimée)."],
  ['1054',"Le nom des seigneurs de Morthemer est cité (vicomtes de Châtellerault)."],
  ['1066',"(Tradition) « Raoul de Mortemer » à Hastings — confusion probable avec les Mortemer normands."],
  ['1077',"Castellania Mortemari (châtellenie) ; forme Mortemarum."],
  ['XIe s.',"Tour de Cognac. Chevet et crypte romans."],
  ['fin XIe–XIIe s.',"Église romane Notre-Dame."],
  ['années 1220',"Collège de chanoines (collégiale)."],
  ['v. 1230–1250',"Remaniement gothique ; peintures de la crypte."],
  ['XIIIe s.',"La seigneurie passe aux Sénéchal."],
  ['v. 1369–1375',"Les Sénéchal (re)bâtissent le donjon ; église fortifiée."],
  ['31 déc. 1369',"Jean Chandos blessé au pont de Lussac ; transporté à Mortemer, il y meurt (1er janv. 1370) — Froissart."],
  ['1428',"Morthemer érigée en baronnie (28 fiefs)."],
  ['XVe–XVIIIe s.',"Seigneurie aux Taveau (Mathurin Taveau, ép. Renée Sanglier)."],
  ['1771',"« Petit château » (logis classique)."],
  ['1844',"Le baron de Soubeyran acquiert le domaine (quasi-ruine)."],
  ['v. 1865',"Restauration par Émile Boeswillwald (faux mâchicoulis)."],
  ['1886',"Monument commémoratif de Chandos déplacé (à Mazerolles)."],
  ['1908',"Église classée Monument Historique."],
  ['18 mars 1927',"Donjon inscrit MH."],
  ['1969',"Création de Valdivienne."],
  ['1978 / 1982-83',"Découverte puis restauration des peintures de la crypte."],
  ['14 mai 2008',"Inscription MH de l’ensemble du château."],
]);

/* ---- 3. SEIGNEURS ---- */
h1('3. Les seigneurs de Morthemer');
table(['Période','Lignée','Faits'],[1.2,1.4,3],[
  ['XIe–XIIIe s.','de Morthemer (vic. de Châtellerault)',"Nom cité dès 1054 ; châtellenie 1077."],
  ['XIIIe–XIVe s.','Sénéchal',"(Re)bâtissent le donjon v. 1369-1375."],
  ['XVe–XVIIIe s.','Taveau',"Baronnie 1428 ; Mathurin Taveau (av. 1512) ; écu de la crypte ; F.-A. Taveau (1743-1834)."],
  ['1844 →','de Soubeyran',"Sauvent le château ; restauration de 1865."],
]);

/* ---- 4. CHÂTEAU ---- */
h1('4. Le château');
para("Donjon : tour quadrangulaire de cinq niveaux, tourelles-contreforts sur trois angles et tour "
  +"en saillie sur le quatrième, parapet crénelé sur faux mâchicoulis ; (re)bâti par les Sénéchal au "
  +"3e quart du XIVe s. Petit château : logis rectangulaire (v. 1771) appuyé au nord sur l’église.");
para("Avant 1860, le château était si délabré que, sans l’intervention, « le donjon n’existerait "
  +"plus ». Acquis par le baron de Soubeyran (1844), il est restauré v. 1865 par Émile Boeswillwald, "
  +"disciple de Viollet-le-Duc : la silhouette « médiévale » actuelle est en partie une recomposition "
  +"du XIXe s. Donjon inscrit MH 1927, ensemble 2008 (PA00105752). Propriété privée.");
figure('01-chateau-vue-nord.jpg',"Le château, vue nord : le donjon restauré au XIXe s. et l’église (Wikimedia Commons).");
figure('02-donjon-ouest.jpg',"Le donjon, face ouest : tourelles-contreforts et parapet (Wikimedia Commons).",320);

/* ---- 5. ÉGLISE & PASSAGE ---- */
h1('5. L’église et le passage des seigneurs et chevaliers');
para("Église romane des XIe–XIIe s. : chevet et crypte (2e moitié XIe s.) ; transept, nef et clocher "
  +"remaniés (gothique) — fin XIIe s. selon l’Inventaire, 1230-1250 selon ArmmA. Collégiale dès les "
  +"années 1220, fortifiée au XIVe s. Plan en croix latine, chœur en hémicycle sur crypte, "
  +"clocher-porche à flèche, modillons sculptés au chevet.");
h2('L’imbrication église ↔ château');
bullet("Un passage voûté sous la 2e travée de la nef mène à la cour du château : on entre dans la "
  +"forteresse par l’église.");
bullet("Le grand portail ouest a été muré ; l’accès se fait au nord, le long du chevet.");
bullet("Une tribune permettait au seigneur et à sa garnison de suivre la messe à part.");
bullet("La crypte servait de nécropole seigneuriale.");
note("Point débattu : la qualification de « chapelle castrale » est contestée par ArmmA (église "
  +"paroissiale + collégiale dès 1220, non chapelle du château).");
figure('08-eglise-chateau-nord.jpg',"Ensemble nord : la jonction entre l’église et le château (Médiathèque de l’architecture et du patrimoine).");
h2('La crypte et ses peintures');
para("Crypte à trois vaisseaux (nécropole). Christ en Majesté sur la voûte (symboles des "
  +"évangélistes) et Vierge à l’Enfant sur le mur est ; frise végétale et écu armorié lu Taveau "
  +"(ArmmA). Peintures découvertes en 1978, restaurées en 1982-1983. Mobilier : enfeus du XIVe s., "
  +"gisant de Renée Sanglier, Vierge à l’Enfant (XVIIe s.), vitrail de sainte Radegonde. Classée MH 1908.");
figure('06-eglise-crypte.jpg',"La crypte, vue vers le nord-est (Médiathèque de l’architecture et du patrimoine).");
figure('09-eglise-gisant.jpg',"Le gisant (Renée Sanglier) dans l’église (Médiathèque de l’architecture et du patrimoine).",260);

/* ---- 6. TOUR DE COGNAC ---- */
h1('6. La tour de Cognac');
para("Longtemps le point le plus obscur du dossier, la tour de Cognac est éclairée par une source "
  +"locale : l’exposé « Morthemer, un village, une histoire » (société HÉRAGE, 16 avril 2005, "
  +"par Y. Bourumeau-Dupuis et J.-H. Calmon, ancien maire et professeur d’histoire).");
bullet("Datation : XIe siècle (une notice isolée avance le Xe s.).");
bullet("Bâtiment situé à l’écart de l’ensemble château-église.");
bullet("Surtout : considérée comme la PREMIÈRE RÉSIDENCE des seigneurs de Morthemer — la demeure "
  +"seigneuriale primitive, antérieure au donjon (XIIe-XIVe s.).");
para("Lecture d’historien : c’est une tour résidentielle seigneuriale (tour-maîtresse). Avant la "
  +"construction du donjon accolé à l’église, le caput de la châtellenie (seigneurs cités dès 1054) "
  +"se trouvait dans cette tour primitive ; le siège seigneurial a ensuite glissé vers le château "
  +"actuel — évolution classique du castrum poitevin du XIe au XIVe s.");
para("Reste à préciser : la localisation cadastrale et l’état actuel. Aucun lieu-dit « Cognac » "
  +"n’apparaît dans la Base Adresse Nationale ni dans OpenStreetMap pour Valdivienne, ni — à la "
  +"lecture — sur les cartes anciennes ci-dessous. « Cognac » est un microtoponyme (gallo-romain "
  +"Conniacum), sans rapport avec la ville de Cognac. À documenter via le Dictionnaire topographique "
  +"de la Vienne (Rédet, 1881), le cadastre napoléonien et les terriers (Arch. dép. de la Vienne).");
h2('Plans d’époque (cartes anciennes)');
figure('plan-cassini-morthemer.jpg',"Carte de Cassini (XVIIIᵉ s.) : Morthemer, La Chapelle-Morthemer, Salles, Toulon et la Dive (IGN / BnF — Licence Ouverte).",330);
figure('plan-etat-major-morthemer.jpg',"Carte d’état-major (1820-1866) : le secteur de Morthemer et ses lieux-dits (IGN — Licence Ouverte).",330);

/* ---- 7. TROU-ŒIL ---- */
h1('7. Le mystère du « trou en forme d’œil »');
para("Question : la voûte présenterait un trou en forme d’œil, à l’opposé du clocher. Aucun document "
  +"public ne le décrit ; interprétation argumentée, à confirmer in situ. Le clocher est vers l’est "
  +"(chœur/château) ; « à l’opposé » désigne la partie ouest (ancien portail muré).");
bullet("Oculus (œil-de-bœuf) — oculus = « œil » : ouverture pour la lumière. La plus probable.");
bullet("Symbolique — l’« Œil de Dieu » : lumière éclairant le chœur, omniscience divine.");
bullet("Trémie de cloche/corde antérieure au clocher actuel, conservée (d’où le décalage).");
bullet("Communication avec la tribune seigneuriale (oculus d’observation/son).");
bullet("Ouverture acoustique (vase scellé) — ou hagioscope mal interprété (si le trou est dans un mur).");
para("Conclusion provisoire : très probablement un oculus, fonctionnel et peut-être symbolique ; "
  +"décalage dû aux remaniements du XIIIe s. À valider auprès de la CRMH Nouvelle-Aquitaine.");
figure('07-eglise-nef-ouest.jpg',"La nef vue de l’entrée (extrémité ouest), côté de l’ancien portail muré — la zone « à l’opposé du clocher » (Médiathèque de l’architecture et du patrimoine).");

/* ---- 8. CHANDOS & FROISSART ---- */
h1('8. Jean Chandos, Froissart et les légendes');
para("Jean (John) Chandos († 1er janv. 1370), sénéchal du Poitou et connétable d’Aquitaine, grand "
  +"capitaine anglais de la guerre de Cent Ans, fut blessé au pont de Lussac le 31 décembre 1369 "
  +"(coup de Jacques de Saint-Martin), transporté à Mortemer, « la plus prochaine forteresse », où il "
  +"mourut. Jean Froissart en a tiré l’une des plus belles pages de ses Chroniques (texte d’époque) :");
quote("« Là fu li dis monsigneur Jehan Chandos de ses gens desarmés moult doucement et couchiés sus "
  +"targes et sus pavais, et amenés et aportés tout le pas à Mortemer, le plus proçainne forterèce de "
  +"là. […] Li gentilz chevaliers dessus nommés ne vesqui de ceste navrure q’un jour et une nuit, et "
  +"morut. Diex en ait l’ame pour se deboinaireté ; car onques, depuis cent ans, ne fu plus courtois, "
  +"plus gentilz ne plus plains de toutes bonnes et nobles vertus […], entre les Englès, de lui. »",
  "Jean Froissart, Chroniques, Livre I (éd. Société de l’Histoire de France, d’après les manuscrits).");
note("Critique des sources : les manuscrits de Froissart divergent — les uns font mourir Chandos "
  +"« un jour et une nuit » après sa blessure, d’autres « le tiers jour après » — d’où le flottement "
  +"des dates (31 déc. 1369 / 1er janv. 1370). Texte complet : voir TEXTES-ET-ECRITS.md.");
figure('chandos-mort-lussac.jpg',"Le combat du pont de Lussac où Chandos fut frappé — miniature d’un manuscrit médiéval des Chroniques (Wikimedia Commons, domaine public).",300);
figure('manuscrit-froissart-poitiers.jpg',"Folio des Chroniques de Froissart : la bataille de Poitiers (1356), où Chandos s’illustra aux côtés du Prince Noir (Wikimedia Commons, domaine public).",300);
para("À distinguer : le lieu d’inhumation (Morthemer) et le monument commémoratif (pierre du XIVe s. "
  +"en bâtière) déplacé en 1886 à Mazerolles, classé objet en 1909 (Palissy PM86000321).");
h2('Légendes');
bullet("Le fantôme de Chandos : on entendrait, certaines nuits, des pas autour du château.");
bullet("Les « Dames de Morthemer » : illustration romantique de la légende seigneuriale.");
figure('12-dames-de-morthemer.jpg',"« Dames de Morthemer » : illustration de la légende (Wikimedia Commons).",220);

/* ---- 9. ÉCRITS DEPUIS L'AN 900 ---- */
h1('9. Les écrits, de l’an 900 à aujourd’hui');
para("Conformément au cahier des charges, les écrits se rapportant à Morthemer ont été recensés et "
  +"cités (dossier complet : TEXTES-ET-ECRITS.md). Synthèse par époque :");
bullet("Médiéval : actes et chartes (formes Mortemarum 1077, etc.) ; Froissart, Chroniques (mort de "
  +"Chandos à Mortemer, cité ci-dessus) ; cartulaires poitevins.");
bullet("Moderne : actes seigneuriaux des Taveau (aveux, contrats, testaments) ; F.-A. Taveau (1789).");
bullet("Savant (XIXe-XXe s.) : Congrès archéologique de France (Poitiers, 1843) ; Beauchet-Filleau, "
  +"Dictionnaire des familles du Poitou (« Taveau de Morthemer ») ; bases Mérimée/Inventaire ; ArmmA.");
bullet("Contemporain : notices POP, Wikipédia, études universitaires, offices de tourisme.");
note("Écrits non numérisés à dépouiller : Archives départementales de la Vienne (terriers, cadastre "
  +"napoléonien), Société des Antiquaires de l’Ouest, Médiathèque du patrimoine (Charenton), "
  +"cartulaires poitevins.");

/* ---- 10. ICONOGRAPHIE ---- */
h1('10. Iconographie : manuscrits, plans, gravures');
para("Le dossier inclut désormais des images libres de chaque type demandé : deux miniatures de "
  +"MANUSCRITS (Froissart, § 8), deux PLANS d’époque (Cassini et état-major, § 6), des OBJETS et "
  +"reliques (gisant, peintures de la crypte, statue, vitrail) et des illustrations. Source et licence "
  +"de chaque fichier : CREDITS.md. Les documents sous droits réservés ne sont pas redistribués mais liés :");
bullet("Manuscrits enluminés de Froissart — autres folios des catégories Wikimedia Commons des "
  +"Chroniques (BnF Fr 2643-2646, 2663-2664).");
bullet("Plan de l’église (relevé Durand, 1979-1980) et peintures de la crypte — base ArmmA.");
bullet("Gravures et clichés anciens — Congrès archéologique (Poitiers 1843) sur Gallica ; clichés "
  +"Gossin (1918), Médiathèque Grand Poitiers ; cartes postales anciennes (Geneanet).");
bullet("Plan d’époque (cadastre napoléonien) — Archives départementales de la Vienne.");
figure('chandos-blason.png',"Armoiries de Sir John Chandos (Wikimedia Commons).",170);

/* ---- 11. NOTES & SOURCES ---- */
h1('11. Notes critiques et sources');
h2('Points débattus / à vérifier');
bullet("Hastings (1066) : tradition locale ; famille de Mortemer présente à la conquête = normande.");
bullet("« Chapelle castrale » : contesté par ArmmA (paroissiale + collégiale dès 1220).");
bullet("Datation voûtes/clocher : fin XIIe s. (Inventaire) vs 1230-1250 (ArmmA).");
bullet("Mort de Chandos : Froissart varie (« un jour et une nuit » vs « le tiers jour »).");
bullet("Tombeau de Chandos : monument déplacé à Mazerolles (1886), ≠ lieu d’inhumation.");
bullet("Écu de la crypte : lu Taveau (ArmmA), parfois Sénéchal. Tour de Cognac : à confirmer. "
  +"Le « trou-œil » : non documenté (§ 7).");
h2('Sources principales');
[
  "Froissart, Chroniques (Wikisource ; Project Gutenberg ; éd. SHF) — texte cité au § 8.",
  "POP : château PA00105752 ; Inventaire IA00045380 ; monument Chandos PM86000321.",
  "ArmmA (SAPRAT/CNRS/Univ. Poitiers) — église, plan, crypte.",
  "Beauchet-Filleau, Dictionnaire des familles du Poitou — « Taveau de Morthemer ».",
  "HÉRAGE / Cercle généalogique poitevin, « Morthemer, un village, une histoire » (2005) — tour de Cognac.",
  "L. Rédet, Dictionnaire topographique du département de la Vienne (1881).",
  "Site officiel Valdivienne ; Wikipédia (Valdivienne) ; offices de tourisme ; Wikimedia Commons.",
].forEach(s=>bullet(s));
doc.moveDown(0.5); hr();
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text("Morthemer — Recherche historique et archéologique. Généré à partir de RECHERCHE-MORTHEMER.md "
    +"et TEXTES-ET-ECRITS.md.",{align:'center'});

doc.end();
console.log('PDF généré : ' + OUT);
