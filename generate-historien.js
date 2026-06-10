#!/usr/bin/env node
/*
 * « Morthemer — Étude historique et archéologique d'un castrum poitevin »
 * PDF en mode historien : narration précise et sourcée depuis l'an 900.
 * Réutilise les images du dossier images/. Dépendance : pdfkit.
 *   NODE_PATH=/chemin/node_modules node generate-historien.js
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = __dirname;
const IMG = process.env.MORTHEMER_IMG ? path.resolve(process.env.MORTHEMER_IMG) : path.join(ROOT, 'images');
const OUT = process.env.MORTHEMER_OUT ? path.resolve(process.env.MORTHEMER_OUT) : path.join(ROOT, 'Morthemer-Etude-Historique.pdf');
const shown = new Set();

const INK='#22303c', ACCENT='#6b4a2b', GOLD='#9c7a3c', MUTED='#5b6671', RULE='#c9b48f', QBG='#f4eede';

const doc = new PDFDocument({ size:'A4', margins:{top:70,bottom:66,left:70,right:70}, bufferPages:true,
  info:{ Title:"Morthemer — Étude historique et archéologique", Author:"Étude d'un historien du bâti médiéval",
    Subject:"Histoire du castrum de Morthemer (Valdivienne, Vienne) depuis l'an 900",
    Keywords:"Morthemer, Mortemer, castrum, château, collégiale, tour de Cognac, crypte, Chandos, Taveau, Sénéchal" }});
doc.pipe(fs.createWriteStream(OUT));
const PW=doc.page.width, CW=PW-doc.page.margins.left-doc.page.margins.right, LEFT=doc.page.margins.left;

function ensure(h){ if(doc.y+h>doc.page.height-doc.page.margins.bottom) doc.addPage(); }
function rule(){ doc.save().strokeColor(RULE).lineWidth(1).moveTo(LEFT,doc.y).lineTo(LEFT+CW,doc.y).stroke().restore(); }
function h1(t){ doc.addPage(); doc.fillColor(GOLD).font('Times-Bold').fontSize(20).text(t,{align:'left'}); doc.moveDown(0.25); rule(); doc.moveDown(0.6); doc.fillColor(INK); }
function h2(t){ ensure(46); doc.moveDown(0.5); doc.fillColor(ACCENT).font('Times-Bold').fontSize(14).text(t); doc.moveDown(0.3); doc.fillColor(INK); }
function h3(t){ ensure(34); doc.moveDown(0.3); doc.fillColor(INK).font('Times-Italic').fontSize(12).text(t); doc.moveDown(0.2); }
function para(t){ doc.fillColor(INK).font('Times-Roman').fontSize(11).text(t,{align:'justify',lineGap:2.5}); doc.moveDown(0.5); }
function lead(t){ doc.fillColor(INK).font('Times-Italic').fontSize(11.5).text(t,{align:'justify',lineGap:2.5}); doc.moveDown(0.5); }
function bullet(t){ doc.fillColor(INK).font('Times-Roman').fontSize(11).text('•  '+t,{align:'left',lineGap:2,indent:6}); doc.moveDown(0.25); }
function note(t){ ensure(26); doc.fillColor(MUTED).font('Times-Italic').fontSize(9.5).text(t,{align:'justify',lineGap:1.5}); doc.moveDown(0.45); doc.fillColor(INK); }
function quote(t,cite){ doc.font('Times-Italic').fontSize(10.5); const iw=CW-26;
  const hh=doc.heightOfString(t,{width:iw,lineGap:2.5})+(cite?doc.heightOfString(cite,{width:iw})+4:0)+20; ensure(hh);
  const y0=doc.y; doc.save().fillColor(QBG).rect(LEFT,y0,CW,hh).fill().restore();
  doc.save().fillColor(GOLD).rect(LEFT,y0,4,hh).fill().restore();
  doc.fillColor(INK).font('Times-Italic').fontSize(10.5).text(t,LEFT+16,y0+9,{width:iw,lineGap:2.5});
  if(cite){ doc.fillColor(MUTED).font('Times-Roman').fontSize(8.5).text(cite,LEFT+16,doc.y+3,{width:iw}); }
  doc.y=y0+hh; doc.moveDown(0.55); doc.fillColor(INK); }
function table(cols,wts,rows){ const gap=12,u=wts.reduce((a,b)=>a+b,0),us=CW-gap*(wts.length-1),cwid=wts.map(w=>us*w/u);
  function head(){ ensure(22); const y=doc.y; doc.fillColor(ACCENT).font('Times-Bold').fontSize(9.5); let x=LEFT;
    cols.forEach((c,i)=>{doc.text(c,x,y,{width:cwid[i]});x+=cwid[i]+gap;});
    doc.y=y+Math.max(...cols.map((c,i)=>doc.heightOfString(c,{width:cwid[i]})))+4;
    doc.save().strokeColor(RULE).lineWidth(0.8).moveTo(LEFT,doc.y).lineTo(LEFT+CW,doc.y).stroke().restore(); doc.moveDown(0.2);} head();
  rows.forEach(r=>{ doc.font('Times-Roman').fontSize(9.5); const rh=Math.max(...r.map((c,i)=>doc.heightOfString(String(c),{width:cwid[i],lineGap:1})))+6;
    if(doc.y+rh>doc.page.height-doc.page.margins.bottom){doc.addPage();head();}
    const y=doc.y; let x=LEFT; r.forEach((c,i)=>{ doc.fillColor(i===0?ACCENT:INK).font(i===0?'Times-Bold':'Times-Roman').fontSize(9.5).text(String(c),x,y+2,{width:cwid[i],lineGap:1}); x+=cwid[i]+gap;});
    doc.y=y+rh; doc.save().strokeColor('#ece4d0').lineWidth(0.4).moveTo(LEFT,doc.y-2).lineTo(LEFT+CW,doc.y-2).stroke().restore();});
  doc.moveDown(0.5); doc.fillColor(INK);}
function figure(file,caption,maxH){ const p=path.join(IMG,file); if(!fs.existsSync(p))return; shown.add(file); maxH=maxH||320;
  let img; try{img=doc.openImage(p);}catch(e){return;} const sc=Math.min(CW/img.width,maxH/img.height), w=img.width*sc, h=img.height*sc;
  const cap=caption?doc.heightOfString(caption,{width:CW})+6:0; if(doc.y+h+cap+12>doc.page.height-doc.page.margins.bottom) doc.addPage();
  doc.moveDown(0.2); const x=LEFT+(CW-w)/2, y=doc.y; try{doc.image(p,x,y,{width:w,height:h}); doc.y=y+h;}catch(e){}
  doc.moveDown(0.15); if(caption){doc.fillColor(MUTED).font('Times-Italic').fontSize(8.5).text(caption,{align:'center'});} doc.moveDown(0.55); doc.fillColor(INK);}

/* ============================= COUVERTURE ============================= */
doc.rect(0,0,PW,doc.page.height).fill('#fbf8f1'); doc.fillColor(INK);
doc.moveDown(2.2);
doc.fillColor(GOLD).font('Times-Bold').fontSize(13).text("ÉTUDE HISTORIQUE ET ARCHÉOLOGIQUE",{align:'center',characterSpacing:2});
doc.moveDown(0.5);
doc.fillColor(ACCENT).font('Times-Bold').fontSize(40).text("MORTHEMER",{align:'center'});
doc.fillColor(INK).font('Times-Italic').fontSize(15).text("Un castrum poitevin, de l'an 900 à nos jours",{align:'center'});
doc.moveDown(0.5);
doc.save().strokeColor(GOLD).lineWidth(1.4).moveTo(LEFT+150,doc.y).lineTo(LEFT+CW-150,doc.y).stroke().restore();
doc.moveDown(0.6);
doc.fillColor(MUTED).font('Times-Roman').fontSize(11).text("Le château, l'église collégiale Notre-Dame et la tour de Cognac",{align:'center'});
doc.text("Commune de Valdivienne — Vienne (86) — Poitou",{align:'center'});
if(fs.existsSync(path.join(IMG,'18-eglise-chevet-donjon.png'))){ doc.moveDown(1.1);
  const im=doc.openImage(path.join(IMG,'18-eglise-chevet-donjon.png')); const sc=Math.min(CW,300/im.height);
  doc.image(path.join(IMG,'18-eglise-chevet-donjon.png'),{fit:[CW,300],align:'center'}); shown.add('18-eglise-chevet-donjon.png'); }
doc.moveDown(0.5);
doc.fillColor(MUTED).font('Times-Italic').fontSize(9).text("« Le chevet roman de Notre-Dame et le donjon du château dominant la vallée de la Dive. »",{align:'center'});
doc.moveDown(1.2);
doc.fillColor(ACCENT).font('Times-Italic').fontSize(10).text("Étude conduite dans la perspective d'un historien du bâti médiéval —\nchaque assertion est rattachée à sa source ; les points débattus sont signalés.",{align:'center'});

/* ============================= AVANT-PROPOS ============================= */
h1("Avant-propos de l'historien");
lead("Reconstituer l'histoire d'un lieu comme Morthemer, c'est lire trois écritures superposées : celle des pierres, celle des chartes, et celle des hommes qui, du chroniqueur médiéval à l'érudit du XIXᵉ siècle, ont transmis — parfois déformé — la mémoire du site. La présente étude s'efforce de les confronter.");
para("Morthemer offre un cas d'école : un promontoire fortifié où se soudent, sur le même rocher, un château seigneurial et une église collégiale ; une châtellenie qui figure parmi les premières du Poitou ; et un épisode de portée européenne — la mort, en ses murs, du connétable anglais Jean Chandos, au cœur de la guerre de Cent Ans. À cela s'ajoute une énigme de terrain, le « trou en forme d'œil » de la voûte, et un toponyme presque effacé, la « tour de Cognac ».");
para("La méthode suivie est celle de l'archéologie du bâti croisée à la critique documentaire. J'ai dépouillé les sources accessibles — base Mérimée et Inventaire général (Ministère de la Culture), base Mémoire de la Médiathèque de l'architecture et du patrimoine, cartulaires poitevins (Nouaillé, Saint-Cyprien), Dictionnaire topographique de la Vienne de L. Rédet (1881), Dictionnaire des familles du Poitou de Beauchet-Filleau, Chroniques de Froissart, Gascon Rolls et chroniques anglaises, travaux universitaires (Ph. Durand ; base ArmmA), cartes de Cassini et d'état-major — et signalé scrupuleusement ce qui relève du fait établi, de la tradition locale ou de l'hypothèse. Le lecteur trouvera l'appareil critique au chapitre XI.");
para("Cette étude doit beaucoup au travail fondateur d'Yvette Dupuis-Bourumeau, native de Morthemer, dont les recherches d'histoire et de généalogie (diffusées par le Cercle généalogique poitevin) ont jeté les bases de la connaissance moderne du village. Elle a aussi bénéficié des corrections d'un chercheur de longue date sur Morthemer, que je remercie : grâce à lui, plusieurs erreurs héritées de compilations en ligne ont pu être redressées — sur la datation du « petit château », sur la propriété du château à la Révolution, et sur l'interprétation du « trou » de la voûte (chapitres IV, III et VII).");
note("Avertissement onomastique récurrent : il faut distinguer le Morthemer poitevin (Vienne) du Mortemer normand (Seine-Maritime : bataille de 1054, abbaye cistercienne, famille Mortimer). Plusieurs sources confondent les deux — la présente étude les sépare systématiquement.");

/* ============================= I. SITE ET NOM ============================= */
h1("I. Le site et son nom");
h2("Une position commandée par l'eau");
para("Morthemer occupe un éperon dominant la vallée de la Dive, modeste cours d'eau qui rejoint la Vienne en aval. Le site relève d'une logique castrale classique en Poitou : un point haut, défendable, contrôlant un passage et un fond de vallée humide. C'est cette topographie — un promontoire au-dessus d'eaux dormantes — qui a fixé l'habitat seigneurial et, avec lui, le bourg.");
h2("L'étymologie : la « mer morte »");
para("Le nom est éclairé par ses formes anciennes. Attesté Mortemarum (1077), Mortemer (1164, et chez Froissart vers 1370), Morthomer (1478), il se stabilise en Morthemer à l'époque moderne. Il s'analyse comme un composé « Morte- » (eau stagnante) et « -mer » (latin mare, étendue d'eau dormante, ici les marais de la Dive) : un Mortuum Mare, une « mer morte ». Le type est connu (Morteau, Mortefontaine). Le toponyme dit donc le paysage : un éperon au-dessus d'eaux mortes.");
figure('plan-etat-major-morthemer.png',"Carte d'état-major (1820-1866) : Morthemer, La Chapelle-Morthemer, Salles-en-Toulon et la vallée de la Dive (IGN — Licence Ouverte).",330);
figure('plan-cassini-morthemer.png',"Carte de Cassini (XVIIIᵉ s.) : le même secteur au siècle des Lumières (IGN / BnF — Licence Ouverte).",330);

/* ============================= II. ORIGINES ============================= */
h1("II. Aux origines (vers 900 – XIᵉ siècle)");
h2("Le cadre : un Poitou franc, menacé, qui se fortifie");
para("Vers l'an 900, le Poitou relève entièrement du monde franc : les comtes de Poitiers et ducs d'Aquitaine — Èbles Manzer, Guillaume le Pieux (fondateur de Cluny en 909), puis Guillaume III Tête d'Étoupe — y exercent le pouvoir. C'est une époque d'insécurité : les incursions normandes remontent la Vienne et ses affluents (Melle est brûlée). Pour tenir le pays, les princes multiplient les points fortifiés et créent des vicomtés-écrans, dont la vicomté de Châtellerault — celle-là même d'où sont issus les premiers seigneurs de Morthemer.");
para("C'est dans ce contexte qu'il faut situer l'apparition d'un castrum sur la Dive. La notice Mérimée place « la première mention du château au 10ᵉ siècle ». Aucune charte ne date toutefois la fondation : l'établissement d'un poste fortifié vers 900-950 est une lecture de contexte, vraisemblable mais non prouvée pièce en main.");
note("La tradition locale (exposé HÉRAGE, d'après J.-H. Calmon) avance des « Mortemer » dès 936, sous le prénom d'Engelelmus ; cette mention n'a pu être reliée à une charte éditée précise et doit être tenue pour une assertion érudite à vérifier.");
h2("Les plus anciens écrits : le cartulaire de Nouaillé");
para("La plus ancienne attestation que l'on puisse confirmer dans une édition savante figure dans le cartulaire de l'abbaye de Nouaillé (éd. dom de Monsabert, 1936). Vers 1091-1115, un acte met en scène la famille :");
quote("« Engelelme de Morthemer et ses frères Pierre et Bernard renoncent aux redevances que leur père Engelelme percevait indûment à Fleuré, Mazerolles, Bouresse, la Carte d'Arbert… le tout rendu déjà à l'abbaye de Nouaillé par Engelelme le père, mais conservé par le fils… »","Cartulaire de Nouaillé, charte n°177 (v. 1091-1115), éd. Monsabert, p. 279.");
para("Le même fonds cite encore Goscelin, Samuel le Riche de Mortemer, et un Petrus, prior de Mortemer — indice d'un prieuré dépendant de Nouaillé. Nous sommes là sur le terrain ferme de la documentation : une lignée seigneuriale enracinée dès la fin du XIᵉ siècle, en relation avec les grandes abbayes du Poitou.");
figure('document-cartulaire-nouaille.png',"La plus ancienne trace écrite : charte n°177 du cartulaire de Nouaillé (v. 1091-1115) nommant Engelelme de Morthemer (Gallica / BnF).",380);
para("Sur les archives anglaises, que l'on m'a parfois invité à interroger pour cette période : elles n'ont rien à en dire, et c'est normal. L'Aquitaine n'entre dans la mouvance des rois d'Angleterre qu'en 1152 (mariage d'Aliénor et d'Henri Plantagenêt). Chercher Morthemer vers 900 à Londres serait un anachronisme de deux siècles et demi.");

/* ============================= III. SEIGNEURS ============================= */
h1("III. La châtellenie et ses seigneurs");
para("En 1077, un acte qualifie le lieu de Castellania Mortemari : Morthemer est le chef-lieu d'une châtellenie, érigée plus tard en baronnie (hommage de Geoffroy Taveau en 1428), réputée l'une des premières du Poitou, avec quelque vingt-huit fiefs dans sa mouvance. La seigneurie passe, par héritages et alliances, entre plusieurs maisons :");
table(["Période","Lignée","Faits marquants"],[1.1,1.5,3],[
 ["XIᵉ–XIIIᵉ s.","de Morthemer (vicomtes de Châtellerault)","Nom cité dès 1054 ; châtellenie en 1077."],
 ["XIIIᵉ s.","Chenin, puis de la Vergne","Guillaume V Chenin († v. 1276), Agathe Chenin (héritière), Guillaume de la Vergne."],
 ["XIIIᵉ–XIVᵉ s.","Sénéchal","Aubert Sénéchal (cité dès 1267) épouse Agathe Chenin ; les Sénéchal (re)bâtissent le donjon (v. 1369-1375). Armes : d'or, au chef de gueules à deux pals de vair (écu peint de la crypte)."],
 ["fin XIVᵉ–XVIIIᵉ s.","Taveau","Guillaume Taveau, baron de Mortemer, maire de Poitiers (1388-1413), sénéchal d'Olivier de Clisson (1385), reçoit Mortemer par mariage avec Sibylle de Saint-Martin ; Geoffroy Taveau (hommage 1428) ; Mathurin Taveau (av. 1512, ép. Renée Sanglier)."],
 ["1789-1795","de la Haye Montbaut","Alexis de la Haye Montbaut, propriétaire à la Révolution ; resté à Morthemer sans être inquiété ; ruiné par l'abolition des privilèges seigneuriaux."],
 ["1795","Augron","Vente du château au citoyen Jacques Augron."],
 ["1844 →","de Soubeyran","Acquièrent le domaine ; J.-M.-G. de Soubeyran commandite la restauration (v. 1865)."],
 ["XXᵉ s.","propriétaires successifs","Propriété privée (transmissions diverses au XXᵉ s.)."]]);
para("Cette succession, plus complexe que la chaîne « Morthemer → Taveau » des notices grand public, est établie par les actes recensés chez Beauchet-Filleau (Dictionnaire des familles du Poitou) et par l'analyse héraldique de la base ArmmA. Elle a une conséquence archéologique directe : c'est aux Sénéchal, et non aux Taveau, qu'il faut attribuer la grande campagne du donjon au troisième quart du XIVᵉ siècle, et probablement l'écu peint de la crypte.");
para("Un point mérite d'être redressé, car il court dans les compilations en ligne : à la Révolution, Morthemer n'appartenait plus aux Taveau (si un Taveau émigra bien en 1789, ce fut sans rapport avec Morthemer). Le château était alors la propriété d'Alexis de la Haye Montbaut, qui demeura à Morthemer sans être inquiété jusqu'en 1795 ; ruiné par l'abolition des privilèges seigneuriaux, il dut alors le vendre au citoyen Jacques Augron. Ce n'est qu'au XIXᵉ siècle que le domaine échut aux Soubeyran.");
figure('document-taveau-beauchet-filleau.png',"Notice « Taveau, branche de Mortemer » dans le Dictionnaire des familles du Poitou de Beauchet-Filleau, p. 694 (Gallica / BnF).",360);

/* ============================= IV. CHÂTEAU ============================= */
h1("IV. Le château : lecture d'un bâti recomposé");
lead("Le château de Morthemer est un piège pour l'historien pressé : ce que l'œil prend pour une forteresse médiévale est, pour une large part, une recomposition du XIXᵉ siècle. Il faut donc lire l'édifice à deux niveaux.");
h2("Le donjon");
para("Le donjon est une tour quadrangulaire de cinq niveaux, flanquée de contreforts-tourelles sur trois angles et d'une tour en saillie sur le quatrième, avec un avant-corps plus bas d'un étage à l'angle sud-est. Il est couronné d'un parapet crénelé sur faux mâchicoulis. La maçonnerie médiévale remonte au troisième quart du XIVᵉ siècle (campagne des Sénéchal, v. 1369-1375), sur une assise antérieure ; la notice Mérimée évoque pour la première mention le Xᵉ siècle.");
h2("La restauration de Boeswillwald (à partir de 1865) — une recomposition assumée");
para("À partir de 1865, Jean-Marie-Georges de Soubeyran confie la restauration à Émile Boeswillwald, collaborateur de Viollet-le-Duc et inspecteur général des Monuments historiques. L'intervention est jugée de « très bonne qualité » sur le plan de l'art, mais elle est largement créatrice : le restaurateur a établi de toutes pièces le système défensif sommital — parapet crénelé, faux mâchicoulis — et la plupart des baies, et doté l'intérieur d'un décor néo-gothique très soigné. Autrement dit, la silhouette « féodale » que l'on photographie aujourd'hui est, pour son couronnement, une œuvre du Second Empire appliquant la doctrine de l'école Viollet-le-Duc. C'est, dans la Vienne, un témoin remarquable de cette doctrine autant qu'un château médiéval.");
note("Conséquence de méthode : toute lecture « militaire » du donjon (mâchicoulis, créneaux) doit être maniée avec prudence — elle décrit le XIXᵉ siècle restituant le Moyen Âge, non le Moyen Âge lui-même.");
figure('13-chateau-cour.png',"Le donjon et le corps de logis à arcades, depuis la cour (base Mémoire — Licence Ouverte).",320);
figure('01-chateau-vue-nord.png',"Le château et l'église, vue nord : la masse du donjon restauré domine l'ensemble (Wikimedia Commons).",300);
h2("Le « petit château » et l'ensemble");
para("Au donjon répond le « petit château » — l'aile Renaissance —, corps de logis rectangulaire de la seconde moitié du XVIIᵉ siècle (et non de 1771, comme l'écrivent par erreur certaines notices), appuyé à l'est sur l'église paroissiale. Il présente quatre travées de fenêtres au sud, côté village, et s'ouvre au nord par un portique aux arcs légèrement brisés surmonté d'une rangée de baies étroites et d'un parapet crénelé. Donjon et petit château sont reliés par une tour ; au nord, un corps de bâtiment s'organise de part et d'autre d'un pavillon d'entrée vers le parc.");
figure('14-chateau-vue-ancienne.png',"Le château avant l'effacement complet du bourg ancien : photographie ancienne (base Mémoire).",300);
para("Protection : le donjon est inscrit au titre des Monuments historiques le 18 mars 1927 ; l'ensemble (petit château, communs, murs d'enceinte) l'est le 14 mai 2008 (réf. PA00105752). Le château est une propriété privée et ne se visite pas.");

/* ============================= V. ÉGLISE ============================= */
h1("V. L'église collégiale Notre-Dame");
lead("Si le château a été refait, l'église a conservé l'essentiel de sa substance médiévale : c'est elle qui livre la chronologie la plus lisible du site. Édifice roman des XIᵉ-XIIᵉ siècles, profondément remanié au XIIIᵉ, fortifié au XIVᵉ, c'est un document de pierre de premier ordre.");
h2("Description architecturale");
para("L'édifice est bâti en pierre et couvert de tuile plate. Le plan est en croix latine, l'élévation à un seul vaisseau ; le couvrement combine cul-de-four (l'abside), voûte en berceau et voûtes d'ogives ; la couverture associe toit à longs pans et toit en pavillon. Le chevet est à hémicycle, surmontant une crypte ; un clocher-porche de pierre, coiffé d'une flèche, domine l'ensemble ; le chevet est orné de modillons sculptés (masques d'animaux, acrobates, visages).");
figure('17-eglise-elevation-sud.png',"Élévation sud de l'église : clocher roman, nef et chevet (base Mémoire — Licence Ouverte).",300);
figure('04-eglise-chevet.png',"Le chevet et les modillons sculptés, angle sud-est (Médiathèque de l'architecture et du patrimoine).",290);
h2("Les campagnes de construction (d'après l'Inventaire et Ph. Durand)");
para("On distingue plusieurs états. Le chevet et la crypte conservent leur structure romane de la seconde moitié du XIᵉ siècle. Au XIIIᵉ siècle, l'église est transformée : on ajoute un transept et un clocher, on couvre la nef de voûtes de style angevin (Plantagenêt) ; le transept est dissymétrique (le bras nord plus court, contrainte du sol), et le poids du clocher impose de renforcer l'abside — l'ajout de gros blocs dans la crypte condamne alors ses deux escaliers latéraux, remplacés par un escalier central.");
note("Discordance de datation à signaler honnêtement : l'Inventaire général rattache voûtes et clocher au « style de la fin du XIIᵉ siècle » ; la base ArmmA et la thèse de Ph. Durand situent ce grand remaniement vers 1230-1250. Les deux lectures sont rapportées ; je penche, avec Durand, pour une datation gothique du second tiers du XIIIᵉ s. (voûtes angevines, peintures contemporaines).");
figure('05-eglise-nef-choeur.png',"L'intérieur, nef vers le chœur en hémicycle (Médiathèque de l'architecture et du patrimoine).",300);
h2("Une collégiale soudée au château : le passage des seigneurs");
para("L'église et le château ne font qu'un organisme. Le petit château s'appuie sur la nef ; un passage voûté ménagé sous la deuxième travée de la nef donne accès à la cour du château — autrement dit, on entre dans la forteresse en passant sous l'église. Le grand portail occidental d'origine a été muré, et l'accès reporté au nord, le long du chevet, par un étroit passage entre l'église et l'enceinte. Une tribune en hauteur permettait au seigneur et à sa maison d'assister à l'office sans se mêler aux fidèles. La crypte, enfin, servait de nécropole seigneuriale.");
para("L'église fut le siège d'un collège de chanoines séculiers, de fondation seigneuriale, attesté de 1223 environ jusqu'à sa suppression en 1790. Sa qualification fait débat : la tradition y voit l'ancienne chapelle castrale agrandie, mais la recherche universitaire (ArmmA) souligne qu'il s'agit d'une église paroissiale et collégiale, non d'une simple chapelle du château. L'édifice avait été cédé dès 1110-1111 par l'évêque Pierre II aux moines de Saint-Cyprien de Poitiers (confirmation du pape Calixte II, 1119). Morthemer était par ailleurs chef-lieu d'un archiprêtré du diocèse de Poitiers — l'« archiprêtré de Mortemer » englobait des paroisses voisines (ainsi Saint-Julien-l'Ars) —, ce qui dit son poids ecclésiastique régional (Robuchon / Société des Antiquaires de l'Ouest).");
figure('08-eglise-chateau-nord.png',"La soudure église / château, vue nord : l'accès actuel longe le chevet (Médiathèque de l'architecture et du patrimoine).",300);
h2("La crypte, son décor peint et ses tombeaux");
para("Sous le chœur, la crypte à trois vaisseaux conserve un ensemble peint majeur : un Christ en Majesté à la voûte, entouré du tétramorphe, et une Vierge à l'Enfant sur le mur est, sur fond en damier trahissant l'influence de l'enluminure et du vitrail — campagne datée vers 1230-1250. Les peintures, longtemps masquées, furent redécouvertes en 1978 et restaurées en 1982-1983. Un écu peint, « d'or, au chef de gueules à deux pals de vair », y est réattribué par ArmmA à la famille Sénéchal (et non aux Taveau, comme on l'a longtemps cru), peut-être à Aubert Sénéchal.");
figure('06-eglise-crypte.png',"La crypte à trois vaisseaux, vue vers le nord-est (Médiathèque de l'architecture et du patrimoine).",300);
para("L'église conserve en outre deux enfeus du XIVᵉ siècle ; le gisant de Renée Sanglier, épouse de Mathurin Taveau (morte avant 1512) ; au fond de la nef, un tombeau de chevalier « en dos d'âne » (couvercle de sarcophage en bâtière) portant une épée et un écu gravés « au chef à trois fleurs de lis » — armes non identifiées, datables de la fin du XIIIᵉ ou du début du XIVᵉ siècle ; une Vierge à l'Enfant en bois polychrome du XVIIᵉ siècle ; un vitrail de sainte Radegonde ; et un tableau offert par l'empereur en 1861. L'église est classée Monument historique depuis 1908.");
figure('09-eglise-gisant.png',"Le gisant de Renée Sanglier (Médiathèque de l'architecture et du patrimoine).",260);

/* ============================= VI. TOUR DE COGNAC ============================= */
h1("VI. La tour de Cognac : un château oublié");
lead("De tous les éléments du dossier, la « tour de Cognac » est le plus fuyant — et, pour l'historien, le plus instructif, car il illustre comment un toponyme peut survivre à l'édifice qu'il désigne.");
para("Longtemps réduite à une simple ligne d'inventaire (« La Tour de Cognac, XIᵉ siècle »), elle est en réalité documentée par le Dictionnaire topographique du département de la Vienne de L. Rédet (1881), qui lui consacre une entrée décisive :");
quote("« Cognac, donjon en ruine à Mortemer. — Herbergamentum quod fuit Guidonis de Coignaco militis, 1372 ; houstel de Mortemer appelé anciennement l'oustel de Coignac, 1436 ; fief de Mortemer autrement Cougnac, 1639 (abb. de Nouaillé). — Ancien fief relevant de l'abbaye de Nouaillé. »","L. Rédet, Dictionnaire topographique de la Vienne, 1881, p. 129.");
para("Trois enseignements en découlent. D'abord, « Cognac » désigne bien, à Morthemer même, un donjon en ruine, tenu en fief de l'abbaye de Nouaillé — et non du baron. Ensuite, la formule de 1436 — « l'hôtel de Mortemer appelé anciennement l'hôtel de Coignac » — fonde l'idée, reprise par l'érudition locale, que Cognac fut la résidence seigneuriale primitive, antérieure au château actuel accolé à l'église. Enfin, un chevalier « Guy de Coignac » (Guido de Coignaco) apparaît dès 1372.");
figure('document-redet-cognac.png',"L'entrée « Cognac, donjon en ruine à Mortemer » dans le Dictionnaire de Rédet (1881), p. 129 (Gallica / BnF).",380);
para("Lecture d'historien du bâti : tout concorde avec une tour résidentielle (tour-maîtresse) isolée, premier caput de la seigneurie, abandonnée lorsque le siège seigneurial glissa vers le château neuf — schéma bien attesté en Poitou. Mais la prudence s'impose : la datation au XIᵉ siècle est une tradition (les textes ne remontent qu'aux années 1370) ; l'étymologie en Conniacum (domaine gallo-romain, sans rapport avec la ville de Cognac) est plausible mais non démontrée pour ce lieu ; et le toponyme est aujourd'hui éteint — absent de la Base Adresse Nationale, d'OpenStreetMap, illisible sur les cartes de Cassini et d'état-major. Aucune iconographie de la tour n'a pu être retrouvée, pas même dans les archives anglaises (qui sont d'ailleurs des rôles administratifs, non illustrés).");
note("Piste décisive non encore exploitée : le cadastre napoléonien de Morthemer (v. 1810-1830, Archives départementales de la Vienne, série 3 P) devrait livrer l'emprise parcellaire de Cognac. Son accès en ligne est protégé par un dispositif anti-robot ; la consultation doit se faire en navigateur ou en salle.");

/* ============================= VII. LE TROU-ŒIL ============================= */
h1("VII. Le « trou en forme d'œil » : une énigme rouverte");
lead("On signale, dans la voûte de l'église, un percement « en forme d'œil », à l'opposé du clocher. C'est le genre de question où l'archéologie du bâti doit se garder des explications trop séduisantes — et où l'avis d'un connaisseur du monument vaut mieux qu'une théorie d'atelier.");
h2("Le point de départ : une église fortifiée");
para("Un fait est acquis, et il est précieux. L'historienne et généalogiste Yvette Dupuis-Bourumeau, native de Morthemer, dont les recherches (diffusées par le Cercle généalogique poitevin / HÉRAGE) fondent l'étude moderne du village, décrit ainsi la mise en défense de l'église au XIVᵉ siècle :");
quote("« C'est l'époque de la Guerre de Cent Ans. On fortifie l'église en surélevant les murs, en condamnant les fenêtres et en ouvrant des meurtrières. » — et, au XIXᵉ s. : « On supprime tout le système défensif de la Guerre de Cent Ans. »","Yvette Dupuis-Bourumeau, Morthemer, un village, une histoire (Cercle généalogique poitevin / HÉRAGE).");
para("La surélévation des murs ménage, entre les voûtes et le toit, un comble — espace où, dans bien des églises fortifiées, se tenaient les non-combattants en cas d'alerte. Ce comble existe ici : la documentation de la Médiathèque du patrimoine en conserve des vues, où l'on voit la charpente reposer sur l'extrados des voûtes.");
figure('20-eglise-charpente-comble-1.png',"L'espace sous comble, au-dessus des voûtes : la charpente et l'extrados — desservi par l'escalier à vis préexistant (base Mémoire — Licence Ouverte).",330);
h2("Une hypothèse séduisante… mais à écarter");
para("On serait tenté d'expliquer le « trou » comme une trémie de hissage du refuge — l'orifice par lequel on aurait monté gens et vivres dans le comble. Un chercheur ayant longuement étudié Morthemer m'a justement mis en garde contre cette lecture, pour deux raisons dirimantes que je fais miennes :");
bullet("Percer une large ouverture à la clé de voûte supposerait de démonter cette clé — l'élément qui tient tout l'édifice —, au risque très élevé de faire effondrer l'ensemble. On n'imagine pas une telle opération pour un usage de circulation.");
bullet("Surtout, le comble et l'extrados des voûtes étaient déjà desservis, avant même la fortification, par un escalier à vis très étroit — lui-même un dispositif défensif, puisqu'il ne livre passage qu'à une personne à la fois. Un système de hissage par trémie aurait donc été à la fois inutile et dangereux.");
para("La théorie du refuge-trémie tombe donc. C'est un bon exemple de la prudence qu'impose le bâti : la fortification est réelle, mais elle ne passe pas par ce percement — elle s'appuie sur des murs surélevés, des fenêtres condamnées, des meurtrières et un escalier à vis défensif, non sur un trou dans la voûte.");
h2("Alors, ce trou ?");
para("La question reste, en l'état, ouverte — et c'est plus honnête ainsi. Si le percement se trouve au pignon (et non à la clé de voûte), un simple oculus de lumière, éventuellement chargé d'un sens symbolique (« œil » divin éclairant le chœur), redevient l'explication la plus économique. S'il est réellement dans la voûte, sa présence même interroge la statique de l'édifice et appelle un examen attentif. Seul un relevé sur place — position exacte, rapport à la clé de voûte, ébrasement, traces de percement — permettra de trancher.");
note("Je dois cette mise au point à un chercheur de longue date sur Morthemer (que je remercie), poursuivant le travail fondateur d'Yvette Dupuis-Bourumeau. Elle corrige une hypothèse que j'avais d'abord retenue : preuve, s'il en fallait, qu'une étude documentaire ne remplace pas la connaissance du monument.");

/* ============================= VIII. CHANDOS ============================= */
h1("VIII. Jean Chandos et la guerre de Cent Ans");
lead("Morthemer entre dans la grande histoire le 1ᵉʳ janvier 1370, par la mort, en ses murs, de Sir John Chandos — l'un des plus grands capitaines de la guerre de Cent Ans.");
h2("Le Poitou anglais et le sénéchal Chandos");
para("Après le traité de Brétigny (1360), le Poitou passe sous administration anglaise. Les Gascon Rolls de la chancellerie d'Édouard III (série C 61, The National Archives) montrent Jean Chandos, « baron de Saint-Sauveur-le-Vicomte », chargé de prendre possession des terres cédées, puis nommé sénéchal d'Aquitaine le 12 novembre 1361 ; la sénéchaussée de Poitou figure parmi les ressorts administrés. Chandos est alors l'homme fort de la domination anglaise dans la région.");
figure('manuscrit-chandos-garter-1435.png',"Sir John Chandos, portrait enluminé du « Garter Book » de William Bruges (v. 1435, British Library, Stowe MS 594) — avec ses armes et l'insigne de la Jarretière (domaine public).",330);
para("Sa renommée n'est pas usurpée : à la bataille d'Auray (1364), c'est Chandos qui fit prisonnier Bertrand du Guesclin. L'iconographie de ces hauts faits a essaimé dans toute l'Europe — j'en retiens un témoin majeur, conservé non en France mais aux Pays-Bas : un manuscrit des Chroniques de Froissart de la Bibliothèque royale de La Haye (Koninklijke Bibliotheek, KB 72 A 25), enluminé à Paris vers 1410 par le Maître de Virgile, qui figure aussi bien Auray que la mort même de Chandos.");
figure('manuscrit-chandos-auray.png',"La bataille d'Auray (1364), où Chandos captura Du Guesclin — Froissart, Chroniques, La Haye, KB 72 A 25, Maître de Virgile, v. 1410 (domaine public).",300);
h2("La mort à Mortemer (1ᵉʳ janvier 1370)");
para("Le 31 décembre 1369, défendant le pont de Lussac contre les Français, Chandos — borgne depuis cinq ans et n'ayant pas baissé sa visière — est frappé sous l'œil par l'écuyer Jacques de Saint-Martin. Froissart en a tiré l'une des plus belles pages de ses Chroniques :");
quote("« Là fu li dis monsigneur Jehan Chandos de ses gens desarmés moult doucement et couchiés sus targes et sus pavais, et amenés et aportés tout le pas à Mortemer, le plus proçainne forterèce de là. […] Li gentilz chevaliers dessus nommés ne vesqui de ceste navrure q'un jour et une nuit, et morut. Diex en ait l'ame… »","Jean Froissart, Chroniques, Livre I (éd. Société de l'Histoire de France).");
para("La critique des sources est instructive. Les manuscrits de Froissart divergent sur la durée de l'agonie (« un jour et une nuit » contre « le tiers jour »), d'où le flottement des dates. La traduction anglaise de Lord Berners nomme la place « Mortimer, the next fortress » (graphie trompeuse) ; l'éditeur Siméon Luce identifie sans ambiguïté « Mortemer (Vienne, c. Lussac) ». Walsingham, lui, signale la mort « in Wasconia » sans nommer le lieu. Une épitaphe (rapportée par Jean Bouchet) fait enfin parler le chevalier :");
quote("« Je Jehan Chandos, des Anglois capitaine, / Fort chevaler, de Poictou seneschal, / […] / Les Poictevins près Lussac me defirent : / A Mortemer mon corps enterrer firent. »","Épitaphe de Chandos (Dictionary of National Biography).");
note("Contradiction à conserver : le trouvère Cuvelier (Chronique de Du Guesclin) fait au contraire mourir Chandos à Chauvigny et l'inhumer à Saint-Pierre. Froissart et l'épitaphe l'emportent (Mortemer), mais l'historien doit signaler la dissonance.");
figure('chandos-mort-lussac.png',"« La mort de Sir John Chandos à Lussac » — Froissart, Chroniques, vol. I, La Haye, Koninklijke Bibliotheek, KB 72 A 25, enluminé par le Maître de Virgile (Paris, v. 1410) ; domaine public.",280);
figure('manuscrit-froissart-poitiers.png',"La bataille de Poitiers (1356), où Chandos s'illustra aux côtés du Prince Noir — folio des Chroniques de Froissart (domaine public).",280);
h2("Le cénotaphe");
para("Il faut distinguer le lieu de mort et de sépulture (Morthemer) du monument commémoratif. Ce dernier — une pierre en bâtière sur deux dais, du XIVᵉ siècle — a été déplacé en 1886 et se dresse aujourd'hui à Mazerolles, au lieu-dit Aubeniaux ; il est classé au titre objet depuis le 6 novembre 1909. Une rue Chandos perpétue le souvenir à Morthemer.");
figure('chandos-cenotaphe-mazerolles.png',"Le cénotaphe de Jean Chandos (croix et dalle en bâtière sur dais), aujourd'hui à Mazerolles — cliché ancien (base Mémoire — Licence Ouverte).",290);
figure('sceau-chandos-1357.png',"Sceau de Jean Chandos (1357) — Wikimedia Commons (domaine public).",170);

/* ============================= IX. MÉMOIRE ET LÉGENDES ============================= */
h1("IX. Mémoire et légendes");
para("Toute seigneurie nourrit ses récits. Morthemer ne fait pas exception, et l'historien doit les recueillir tout en les distinguant des faits.");
bullet("La « Dame d'Or » : pendant la guerre de Cent Ans, les occupants anglais, contraints de capituler devant Du Guesclin, auraient caché une Vierge en or dans un souterrain, jamais retrouvée. La légende, « connue des gens de Morthemer », a été publiée (revue Trésors de l'Histoire, août 1990) et est aujourd'hui mise en scène par le parcours Terra Aventura « La Malédiction de la Dame d'Or ». Les souterrains, eux, sont bien réels.");
bullet("Le fantôme de Chandos, dont on entendrait les pas certaines nuits autour du château : tradition orale contemporaine.");
bullet("L'empreinte de saint Martin (chapelle du Pas-de-Saint-Martin) et la croix hosannière du cimetière.");
para("La mémoire du lieu a aussi inspiré les artistes. Le peintre symboliste Lionel Le Falher (1957-2008) a consacré à Morthemer une toile, « Les Dames de Morthemer », qui rassemble des dames en robes de couleur devant le donjon — image rêvée d'un passé seigneurial.");
figure('12-dames-de-morthemer.png',"« Les Dames de Morthemer », peinture de Lionel Le Falher (© L. Le Falher / Amis du patrimoine de Lussac, CC BY-SA 4.0).",320);
note("À ne pas confondre avec les légendes de l'abbaye de Mortemer en Normandie (Dame blanche, lutin Goublin), homonyme sans rapport.");

/* ============================= X. CHRONOLOGIE ============================= */
h1("X. Chronologie générale");
table(["Date","Événement"],[1.05,4],[
 ["v. 900","Contexte franc ; incursions normandes ; fortification des promontoires (vicomté de Châtellerault)."],
 ["Xᵉ s.","Première mention du château (notice Mérimée)."],
 ["1054","Le nom des seigneurs de Morthemer est cité."],
 ["1077","Castellania Mortemari : chef-lieu de châtellenie."],
 ["v. 1091-1115","Engelelme de Morthemer (charte de Nouaillé) — plus ancien écrit confirmé."],
 ["1110-1111","L'église cédée à Saint-Cyprien de Poitiers (conf. Calixte II, 1119)."],
 ["XIᵉ s.","Tour de Cognac (tradition) ; chevet et crypte romans."],
 ["v. 1223","Collège de chanoines (collégiale)."],
 ["XIIIᵉ s.","Remaniement gothique de l'église (transept, clocher, voûtes angevines) ; peintures de la crypte ; la seigneurie passe aux Sénéchal."],
 ["v. 1369-1375","Les Sénéchal (re)bâtissent le donjon ; l'église est fortifiée (murs surélevés, meurtrières)."],
 ["31 déc. 1369 – 1ᵉʳ janv. 1370","Jean Chandos, blessé au pont de Lussac, meurt à Mortemer."],
 ["1372","Guy de Coignac cité (Cognac)."],
 ["1428","Geoffroy Taveau : baronnie de Mortemer (28 fiefs)."],
 ["1436","« l'oustel de Mortemer appelé anciennement l'oustel de Coignac »."],
 ["av. 1512","Mathurin Taveau ; gisant de Renée Sanglier."],
 ["2e moitié XVIIᵉ s.","« Petit château » (aile Renaissance)."],
 ["1789-1795","Alexis de la Haye Montbaut, propriétaire ; reste à Morthemer jusqu'en 1795."],
 ["1795","Vente du château au citoyen Jacques Augron."],
 ["1844 / v. 1865","Acquisition Soubeyran / restauration Boeswillwald."],
 ["1886","Cénotaphe de Chandos déplacé à Mazerolles."],
 ["1908 / 1927 / 2008","Église classée MH / donjon inscrit / ensemble du château inscrit."],
 ["1969","Création de la commune de Valdivienne."],
 ["1978 / 1982-83","Découverte puis restauration des peintures de la crypte."]]);

/* ============================= XI. SOURCES ============================= */
h1("XI. Sources, archives et méthode critique");
h2("Points débattus / à confirmer");
bullet("Hastings (1066) : la présence d'un « Raoul de Mortemer » relève de la revendication locale ; l'historiographie courante l'attribue au Mortemer normand.");
bullet("Datation des voûtes et du clocher : fin XIIᵉ s. (Inventaire) ou 1230-1250 (Durand/ArmmA).");
bullet("Mort de Chandos : Mortemer (Froissart, épitaphe) ou Chauvigny (Cuvelier).");
bullet("Écu de la crypte : Sénéchal (ArmmA) plutôt que Taveau ; tombeau aux fleurs de lis non identifié.");
bullet("Tour de Cognac : datation XIᵉ s. = tradition ; localisation parcellaire à établir au cadastre.");
bullet("« Trou en forme d'œil » : non décrit par les notices ; hypothèse du comble-refuge (ch. VII) à vérifier in situ.");
h2("Sources et fonds consultés");
[ "Bases du Ministère de la Culture (POP) : Mérimée château PA00105752, église PA00105754, Inventaire IA00045380 ; Palissy : cénotaphe Chandos PM86000321 ; base Mémoire (Médiathèque de l'architecture et du patrimoine).",
  "Cartulaires poitevins : Nouaillé (éd. Monsabert, 1936) ; Saint-Cyprien de Poitiers (éd. Rédet, 1874).",
  "L. Rédet, Dictionnaire topographique du département de la Vienne (1881) — entrée « Cognac ».",
  "Beauchet-Filleau, Dictionnaire historique et généalogique des familles du Poitou — « Taveau de Morthemer », « Sénéchal ».",
  "Ph. Durand, Les campagnes de construction de l'église Notre-Dame de Morthemer (Bull. Soc. Antiquaires de l'Ouest, 1980) ; base ArmmA (SAPRAT-EPHE / CNRS / Univ. Poitiers).",
  "Base des collégiales séculières de France (Univ. Limoges) — chapitre 1223-1790.",
  "Froissart, Chroniques (éd. S. Luce, SHF ; trad. Berners) ; Walsingham, Historia Anglicana ; Gascon Rolls (C 61, gasconrolls.org / TNA) ; Foedera de Rymer ; DNB.",
  "Yvette Dupuis-Bourumeau, « Morthemer, un village, une histoire » (Cercle généalogique poitevin / HÉRAGE) — travail fondateur de l'histoire locale du village.",
  "Cartographie : Carte de Cassini (XVIIIᵉ s.) et Carte d'état-major (1820-1866), IGN / data.geopf.fr.",
  "Iconographie complémentaire (liens, droits réservés) : base ArmmA (plan Durand, peintures) ; Médiathèque Grand Poitiers (clichés Gossin, 1918) ; cadastre napoléonien (Arch. dép. de la Vienne, série 3 P)." ].forEach(s=>bullet(s));
note("Crédit et licence de chaque image : voir le fichier CREDITS.md du dépôt. Les pièces sous droits réservés ne sont pas reproduites ici mais référencées.");

/* ============================= XII. GALERIE ============================= */
(function(){ let files=[]; try{ files=fs.readdirSync(IMG).filter(f=>/\.png$/i.test(f)).sort(); }catch(e){ return; }
  const rest=files.filter(f=>!shown.has(f)); if(!rest.length) return;
  h1("XII. Annexe — galerie iconographique");
  para("Pièces complémentaires réunies dans le dépôt (vues du château, de l'église et de son environnement). Source et licence : CREDITS.md.");
  const pretty=f=>f.replace(/\.png$/i,'').replace(/^\d+-/,'').replace(/-/g,' ');
  for(const f of rest) figure(f, pretty(f), 250);
})();

/* ---- pagination footer ---- */
const range=doc.bufferedPageRange();
for(let i=range.start;i<range.start+range.count;i++){ doc.switchToPage(i);
  if(i===range.start) continue;
  const oldB=doc.page.margins.bottom; doc.page.margins.bottom=0;
  doc.fillColor(MUTED).font('Times-Italic').fontSize(8)
    .text("Morthemer — Étude historique et archéologique", LEFT, doc.page.height-40, {width:CW,align:'left',lineBreak:false});
  doc.text(String(i-range.start+1), LEFT, doc.page.height-40, {width:CW,align:'right',lineBreak:false});
  doc.page.margins.bottom=oldB;
}

doc.end();
console.log('PDF historien généré : '+OUT);
