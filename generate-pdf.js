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
if (fs.existsSync(path.join(IMG,'03-chateau-eglise-ancien.png'))){
  doc.moveDown(1.5);
  doc.image(path.join(IMG,'03-chateau-eglise-ancien.png'),{fit:[CONTENT_W,280],align:'center'});
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
para("La plus ancienne mention écrite de la famille figure dans une charte de l’abbaye de Nouaillé "
  +"(v. 1091-1115) : « Engelelme de Morthemer et ses frères Pierre et Bernard renoncent aux redevances "
  +"que leur père Engelelme percevait… à Fleuré, Mazerolles, Bouresse… » (cf. ci-dessous).");
figure('document-cartulaire-nouaille.png',"La plus ancienne trace écrite : charte n°177 du cartulaire de l’abbaye de Nouaillé (v. 1091-1115) nommant Engelelme de Morthemer et ses frères (éd. Monsabert, p. 279 — source gallica.bnf.fr / BnF).",380);
table(['Période','Lignée','Faits'],[1.2,1.5,3],[
  ['XIe–XIIIe s.','de Morthemer (vic. de Châtellerault)',"Nom cité dès 1054 ; châtellenie 1077."],
  ['XIIIe s.','Chenin puis de la Vergne',"Guillaume V Chenin (†v.1276), Agathe Chenin, Guillaume de la Vergne."],
  ['XIIIe–XIVe s.','Sénéchal',"Aubert Sénéchal (dès 1267) ép. Agathe Chenin ; (re)bâtissent le donjon v.1369-1375 ; armes d'or au chef de gueules à deux pals de vair (écu de la crypte)."],
  ['fin XIVe–XVIIIe s.','Taveau',"G. Taveau baron v.1391 ; hommage 1428 ; Mathurin Taveau (av.1512, ép. Renée Sanglier) ; F.-A. Taveau (1743-1834, émigré 1789)."],
  ['1844 →','de Soubeyran',"Acquièrent le domaine ; commanditent la restauration de 1865."],
  ['XXe s. →','Werbrouck / Volpelières d’Escombreras',"Propriété privée (SCI Domaine de Morthemer) ; vendue en 1993."],
]);
para("D’après Beauchet-Filleau, Guillaume Taveau, baron de Mortemer (et maire de Poitiers en 1388, "
  +"1395-1398, 1412-1413 ; sénéchal d’Olivier de Clisson en 1385), reçut la terre de Mortemer par son "
  +"mariage avec Sibylle de Saint-Martin.");
figure('document-taveau-beauchet-filleau.png',"Entrée « Taveau, branche de Mortemer » dans le Dictionnaire des familles du Poitou de Beauchet-Filleau (p. 694). Source gallica.bnf.fr / BnF.",430);

/* ---- 4. CHÂTEAU ---- */
h1('4. Le château');
para("Donjon : tour quadrangulaire de cinq niveaux, tourelles-contreforts sur trois angles et tour "
  +"en saillie sur le quatrième, parapet crénelé sur faux mâchicoulis ; (re)bâti par les Sénéchal au "
  +"3e quart du XIVe s. Petit château : logis rectangulaire (v. 1771) appuyé au nord sur l’église.");
para("Avant 1860, le château était si délabré que, sans l’intervention, « le donjon n’existerait "
  +"plus ». Acquis par le baron de Soubeyran (1844), il est restauré v. 1865 par Émile Boeswillwald, "
  +"disciple de Viollet-le-Duc : la silhouette « médiévale » actuelle est en partie une recomposition "
  +"du XIXe s. Donjon inscrit MH 1927, ensemble 2008 (PA00105752). Propriété privée.");
figure('01-chateau-vue-nord.png',"Le château, vue nord : le donjon restauré au XIXe s. et l’église (Wikimedia Commons).");
figure('02-donjon-ouest.png',"Le donjon, face ouest : tourelles-contreforts et parapet (Wikimedia Commons).",320);

/* ---- 5. ÉGLISE & PASSAGE ---- */
h1('5. L’église et le passage des seigneurs et chevaliers');
para("Église romane des XIe–XIIe s. : chevet et crypte (2e moitié XIe s.) ; transept, nef et clocher "
  +"remaniés (gothique) — fin XIIe s. selon l’Inventaire, 1230-1250 selon ArmmA. Collégiale dès les "
  +"années 1220. Voûtes de style angevin et transept asymétrique (XIIIe s.) ; le poids du clocher "
  +"impose de renforcer l’abside (les 2 escaliers de la crypte sont alors condamnés, remplacés par un "
  +"escalier central). Au XIVe s., fortifiée : murs surélevés, fenêtres condamnées, meurtrières "
  +"(cf. § 7) ; système défensif supprimé par Boeswillwald au XIXe s. Plan en croix latine, chœur en "
  +"hémicycle sur crypte, clocher-porche à flèche, modillons sculptés au chevet.");
h2('L’imbrication église ↔ château');
bullet("Un passage voûté sous la 2e travée de la nef mène à la cour du château : on entre dans la "
  +"forteresse par l’église.");
bullet("Le grand portail ouest a été muré ; l’accès se fait au nord, le long du chevet.");
bullet("Une tribune permettait au seigneur et à sa garnison de suivre la messe à part.");
bullet("La crypte servait de nécropole seigneuriale.");
note("Point débattu : la qualification de « chapelle castrale » est contestée par ArmmA (église "
  +"paroissiale + collégiale dès 1220, non chapelle du château).");
figure('08-eglise-chateau-nord.png',"Ensemble nord : la jonction entre l’église et le château (Médiathèque de l’architecture et du patrimoine).");
para("Chapitre collégial : l’église Sainte-Marie est cédée en 1110-1111 aux moines de Saint-Cyprien "
  +"de Poitiers (confirmation du pape Calixte II, 1119) ; collège de chanoines séculiers de fondation "
  +"seigneuriale attesté de v.1223 à 1790 (supprimé à la Révolution).");
h2('La crypte et ses peintures');
para("Crypte à trois vaisseaux (nécropole). Christ en Majesté sur la voûte entouré du tétramorphe et "
  +"Vierge à l’Enfant sur le mur est, fond en damier ; campagne 1230-1250. Écu peint « d’or, au chef "
  +"de gueules à deux pals de vair », réattribué par ArmmA aux Sénéchal (et non aux Taveau). Peintures "
  +"découvertes en 1978, restaurées en 1982-1983. Au fond de la nef, tombeau de chevalier « en dos "
  +"d’âne » à épée et écu gravés (trois fleurs de lis — armes non identifiées). Mobilier : enfeus du "
  +"XIVe s., gisant de Renée Sanglier, Vierge à l’Enfant (XVIIe s.), vitrail de sainte Radegonde, "
  +"tableau donné par l’empereur en 1861. Église classée MH 1908. L’aumônerie (ancienne maladrerie, "
  +"XVe s.) fut rattachée à celle de Chauvigny en 1695.");
figure('06-eglise-crypte.png',"La crypte, vue vers le nord-est (Médiathèque de l’architecture et du patrimoine).");
figure('09-eglise-gisant.png',"Le gisant (Renée Sanglier) dans l’église (Médiathèque de l’architecture et du patrimoine).",260);

/* ---- 6. TOUR DE COGNAC ---- */
h1('6. La tour de Cognac');
para("Longtemps l’élément le plus obscur du dossier, la tour de Cognac est désormais documentée "
  +"par une source de premier ordre : le Dictionnaire topographique de la Vienne de L. Rédet (1881), "
  +"qui lui consacre une entrée, complétée par l’exposé local de la société HÉRAGE (2005).");
quote("« Cognac, donjon en ruine à Mortemer. — Herbergamentum quod fuit Guidonis de Coignaco "
  +"militis (1372) ; houstel de Mortemer appelé anciennement l’oustel de Coignac (1436) ; fief de "
  +"Mortemer autrement Cougnac (1639). — Ancien fief relevant de l’abbaye de Nouaillé. »",
  "L. Rédet, Dictionnaire topographique du département de la Vienne, 1881.");
bullet("« Cognac » est un toponyme attesté à Morthemer même, désignant un donjon en ruine — la "
  +"tour n’est donc pas un objet fantôme.");
bullet("Formes datées : un chevalier Guy de Coignac (1372) ; l’oustel de Coignac (1436) ; "
  +"Cougnac (1639). Fief tenu de l’abbaye de Nouaillé, avec son propre arrière-fief.");
bullet("La formule de 1436 — « l’hôtel de Morthemer appelé anciennement l’hôtel de Coignac » — "
  +"fonde l’idée que Cognac fut la RÉSIDENCE SEIGNEURIALE PRIMITIVE, à l’écart du château actuel.");
para("Lecture d’historien : tour résidentielle / maîtresse, premier caput de la châtellenie avant "
  +"le report du siège seigneurial vers le château accolé à l’église — schéma bien documenté en "
  +"Poitou. Réserves : la datation XIe s. est une tradition (les textes ne remontent qu’aux années "
  +"1370) ; l’étymologie Conniacum (type -acum) est plausible mais non sourcée pour ce lieu ; le "
  +"toponyme est éteint (absent de la BAN, d’OSM et illisible sur Cassini/état-major). La "
  +"localisation à la parcelle reste à chercher au cadastre napoléonien (Arch. dép. de la Vienne).");
figure('document-redet-cognac.png',"La preuve écrite : l’entrée « Cognac, donjon en ruine à Mortemer » dans le Dictionnaire topographique de la Vienne de L. Rédet (1881, p. 129). Source gallica.bnf.fr / BnF.",430);
h2('Plans d’époque (cartes anciennes)');
figure('plan-cassini-morthemer.png',"Carte de Cassini (XVIIIᵉ s.) : Morthemer, La Chapelle-Morthemer, Salles, Toulon et la Dive (IGN / BnF — Licence Ouverte).",430);
figure('plan-etat-major-morthemer.png',"Carte d’état-major (1820-1866) : le secteur de Morthemer et ses lieux-dits (IGN — Licence Ouverte).",430);

/* ---- 7. TROU-ŒIL ---- */
h1('7. Le mystère du « trou en forme d’œil »');
para("Question : la voûte présenterait un trou en forme d’œil, à l’opposé du clocher. Aucun document "
  +"public ne le décrit ; interprétation argumentée, à confirmer in situ. Le clocher est vers l’est "
  +"(chœur/château) ; « à l’opposé » désigne la partie ouest (ancien portail muré).");
h2('Hypothèse privilégiée : un vestige du dispositif défensif (église-refuge, XIVe s.)');
para("L’exhaussement est attesté par une source : l’exposé HÉRAGE (d’après la thèse de Ph. Durand) "
  +"décrit le XIVe s. ainsi —");
quote("« C’est l’époque de la Guerre de Cent Ans. On fortifie l’église en surélevant les murs, en "
  +"condamnant les fenêtres et en ouvrant des meurtrières. » — et au XIXe s. : « On supprime tout le "
  +"système défensif de la Guerre de Cent Ans » (restauration Boeswillwald).",
  "HÉRAGE, Morthemer, un village, une histoire (2005), d’après Ph. Durand.");
para("C’est exactement la surélévation (« toit rehaussé ») observée. Dans les églises fortifiées, "
  +"l’espace entre les voûtes et le toit servait de SALLE DE REFUGE (vivres, coffres) ; l’accès se "
  +"faisait par un percement de la voûte — une TRÉMIE, parfois doublée d’une trappe — par laquelle on "
  +"hissait gens et provisions, et qui servait de point de SURVEILLANCE. Le « trou » s’explique donc "
  +"comme un vestige de ce niveau de défense : meurtrière rescapée ou trémie du comble-refuge — la "
  +"plupart du système ayant été démantelé par Boeswillwald, d’où sa rareté et le mystère qui l’entoure.");
bullet("Attesté par écrit (murs surélevés, fenêtres condamnées, meurtrières) — pas une conjecture.");
bullet("Le toit exhaussé crée précisément l’espace de refuge que la trémie dessert.");
bullet("La position « à l’opposé du clocher » (ouest) cadre avec un accès au comble éloigné du beffroi.");
para("À vérifier sur place : y a-t-il une salle dans le comble au-dessus des voûtes ? Le trou est-il "
  +"une trémie traversante (et non un oculus de pignon) ? Traces d’exhaussement (reprises de "
  +"maçonnerie, ancienne ligne de toit), corbeaux, échelle/trappe, meurtrières ?");
h2('Autres hypothèses (subsidiaires)');
bullet("Oculus / œil-de-bœuf : simple ouverture de lumière (si le percement est au pignon).");
bullet("Symbolique — l’« Œil de Dieu » : faisceau de lumière sur le chœur.");
bullet("Trémie de cloche/corde antérieure au clocher actuel ; communication avec la tribune seigneuriale ; ouverture acoustique.");
para("Conclusion révisée : compte tenu de la fortification documentée, l’explication la plus probable "
  +"est une trémie d’accès à une salle de refuge sous un toit exhaussé (hissage / surveillance) plutôt "
  +"qu’un pur ornement ; l’oculus de lumière reste l’alternative si le percement est au pignon. À "
  +"trancher par un relevé du comble et auprès de la CRMH Nouvelle-Aquitaine.");
figure('07-eglise-nef-ouest.png',"La nef vue de l’entrée (extrémité ouest), côté de l’ancien portail muré — la zone « à l’opposé du clocher » (Médiathèque de l’architecture et du patrimoine).");

/* ---- 8. CHANDOS & FROISSART ---- */
h1('8. Jean Chandos, Froissart et les légendes');
para("Jean (John) Chandos († 1er janv. 1370), sénéchal du Poitou et connétable d’Aquitaine, grand "
  +"capitaine anglais de la guerre de Cent Ans, fut blessé au pont de Lussac le 31 décembre 1369 "
  +"(coup de Jacques de Saint-Martin), transporté à Mortemer, « la plus prochaine forteresse », où il "
  +"mourut. Jean Froissart en a tiré l’une des plus belles pages de ses Chroniques (texte d’époque) :");
figure('manuscrit-chandos-garter-1435.png',"Sir John Chandos, portrait enluminé du « Garter Book » de William Bruges (v. 1435, British Library, Stowe MS 594) — avec ses armes et l’insigne de la Jarretière (Wikimedia Commons, domaine public).",330);
quote("« Là fu li dis monsigneur Jehan Chandos de ses gens desarmés moult doucement et couchiés sus "
  +"targes et sus pavais, et amenés et aportés tout le pas à Mortemer, le plus proçainne forterèce de "
  +"là. […] Li gentilz chevaliers dessus nommés ne vesqui de ceste navrure q’un jour et une nuit, et "
  +"morut. Diex en ait l’ame pour se deboinaireté ; car onques, depuis cent ans, ne fu plus courtois, "
  +"plus gentilz ne plus plains de toutes bonnes et nobles vertus […], entre les Englès, de lui. »",
  "Jean Froissart, Chroniques, Livre I (éd. Société de l’Histoire de France, d’après les manuscrits).");
note("Critique des sources : les manuscrits de Froissart divergent — les uns font mourir Chandos "
  +"« un jour et une nuit » après sa blessure, d’autres « le tiers jour après » — d’où le flottement "
  +"des dates (31 déc. 1369 / 1er janv. 1370). Texte complet : voir TEXTES-ET-ECRITS.md.");
figure('chandos-mort-lussac.png',"Le combat du pont de Lussac où Chandos fut frappé — miniature d’un manuscrit médiéval des Chroniques (Wikimedia Commons, domaine public).",300);
figure('manuscrit-froissart-poitiers.png',"Folio des Chroniques de Froissart : la bataille de Poitiers (1356), où Chandos s’illustra aux côtés du Prince Noir (Wikimedia Commons, domaine public).",300);
quote("« Je Jehan Chandos, des Anglois capitaine, / Fort chevaler, de Poictou seneschal, / […] / "
  +"Les Poictevins près Lussac me defirent : / A Mortemer mon corps enterrer firent. »",
  "Épitaphe de Chandos, rapportée par le Dictionary of National Biography.");
para("Version divergente : la Chronique de Bertrand du Guesclin de Cuvelier fait mourir Chandos au "
  +"château de Chauvigny et l’inhume à Saint-Pierre — contradiction avec Froissart et l’épitaphe. Le "
  +"monument commémoratif (pierre en bâtière, XIVe s.), longtemps près du pont de Lussac, a été "
  +"déplacé en 1886 à Mazerolles (lieu-dit Aubeniaux) ; classé objet le 6 novembre 1909 (Palissy "
  +"PM86000321). Une rue Chandos subsiste à Morthemer.");
figure('chandos-cenotaphe-mazerolles.png',"Le cénotaphe de Jean Chandos (croix et dalle en bâtière sur dais), aujourd’hui à Mazerolles — cliché ancien (base Mémoire, Min. de la Culture, Licence Ouverte).",300);
h2('Légendes locales');
bullet("La « Dame d’Or » : pendant la guerre de Cent Ans, les Anglais capitulant devant Du Guesclin "
  +"auraient caché une Vierge en or dans un souterrain, jamais retrouvée — légende reprise par le "
  +"parcours Terra Aventura « La Malédiction de la Dame d’Or » (site officiel de Valdivienne).");
bullet("Le fantôme de Chandos : des pas entendus la nuit autour du château (tradition orale).");
bullet("L’empreinte de saint Martin (chapelle du Pas-de-Saint-Martin) ; la croix hosannière du cimetière.");
note("Ne pas confondre avec l’abbaye de Mortemer en Normandie (Lisors), homonyme, à laquelle "
  +"appartiennent les légendes de la Dame blanche et du lutin Goublin.");
figure('12-dames-de-morthemer.png',"« Les Dames de Morthemer », peinture symboliste de Lionel Le Falher (1957-2008) — les dames en robes de couleur devant le donjon (© L. Le Falher / Amis du patrimoine de Lussac, CC BY-SA 4.0).",330);

/* ---- 9. ÉCRITS DEPUIS L'AN 900 ---- */
h1('9. Les écrits, de l’an 900 à aujourd’hui');
para("Conformément au cahier des charges, les écrits se rapportant à Morthemer ont été recensés et "
  +"cités (dossier complet : TEXTES-ET-ECRITS.md). Synthèse par époque :");
bullet("Médiéval : actes et chartes (formes Mortemarum 1077, etc.) ; Froissart, Chroniques (mort de "
  +"Chandos à Mortemer, cité ci-dessus) ; cartulaires poitevins.");
bullet("Moderne : actes seigneuriaux des Taveau ; épitaphe de Chandos ; Cuvelier (version rivale) ; "
  +"Vie du Prince Noir du héraut Chandos (v.1385).");
bullet("Savant (XIXe-XXe s.) : Rédet, Dictionnaire topographique de la Vienne (1881, entrée Cognac) ; "
  +"Beauchet-Filleau (« Taveau de Morthemer ») ; base des collégiales (Limoges) ; Mérimée/Inventaire ; ArmmA.");
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
bullet("Plan de l’église (relevé Durand, 1979-1980) et peintures de la crypte (écu Sénéchal) — base ArmmA.");
bullet("Clichés anciens — Gossin (1918), Médiathèque Grand Poitiers ; cartes postales anciennes "
  +"(Geneanet) ; Rédet (1881) et Beauchet-Filleau sur Gallica / Internet Archive.");
bullet("Plan d’époque (cadastre napoléonien) — Archives départementales de la Vienne.");
figure('chandos-blason.png',"Armoiries de Sir John Chandos (Wikimedia Commons).",170);

/* ---- 11. NOTES & SOURCES ---- */
h1('11. Notes critiques et sources');
h2('Points débattus / à vérifier');
bullet("Hastings (1066) : tradition locale ; famille de Mortemer présente à la conquête = normande.");
bullet("« Chapelle castrale » : contesté par ArmmA (paroissiale + collégiale dès 1220).");
bullet("Datation voûtes/clocher : fin XIIe s. (Inventaire) vs 1230-1250 (ArmmA).");
bullet("Mort de Chandos : lieu d’inhumation contesté — Mortemer (Froissart, épitaphe) vs Chauvigny "
  +"(Cuvelier) ; cénotaphe déplacé à Mazerolles (1886).");
bullet("Écu de la crypte : réattribué aux Sénéchal par ArmmA (longtemps dit Taveau) ; tombeau aux "
  +"fleurs de lis non identifié.");
bullet("Tour de Cognac : documentée par Rédet (donjon en ruine, oustel de Coignac, fief de Nouaillé) ; "
  +"datation XIe s. = tradition ; localisation à confirmer (§ 6).");
bullet("« Congrès archéologique 1843 » : Morthemer n’y figure pas (référence écartée). « Dame d’Or » : "
  +"légende locale, ≠ légendes de l’abbaye normande de Mortemer. Le « trou-œil » : non documenté (§ 7).");
h2('Sources principales');
[
  "Froissart, Chroniques (Wikisource ; Gutenberg 73967 ; éd. Buchon/SHF) — texte au § 8.",
  "Cuvelier, Chronique de Du Guesclin ; épitaphe de Chandos (DNB) ; Vie du Prince Noir (héraut Chandos).",
  "L. Rédet, Dictionnaire topographique de la Vienne (1881) — entrée « Cognac ».",
  "POP : château PA00105752 ; Inventaire IA00045380 ; cénotaphe Chandos PM86000321.",
  "ArmmA (SAPRAT/CNRS/Univ. Poitiers) ; base des collégiales séculières (Univ. Limoges, 1223-1790).",
  "Beauchet-Filleau, familles du Poitou ; Histoire de la famille Taveau ; chartes de Nouaillé.",
  "HÉRAGE, « Morthemer, un village, une histoire » (2005, d’après Ph. Durand) — fortification « en surélevant les murs » ; Dame d’Or (Trésors de l’Histoire, 1990).",
  "IGN/data.geopf.fr (Cassini, état-major) ; Médiathèque Grand Poitiers ; Wikimedia Commons.",
].forEach(s=>bullet(s));
doc.moveDown(0.5); hr();
doc.fillColor(MUTED).font('Times-Italic').fontSize(9)
  .text("Morthemer — Recherche historique et archéologique. Généré à partir de RECHERCHE-MORTHEMER.md "
    +"et TEXTES-ET-ECRITS.md.",{align:'center'});

doc.end();
console.log('PDF généré : ' + OUT);
