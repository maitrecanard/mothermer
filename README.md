# mothermer

## Description
Ceci n'est pas un projet de code mais de recherche sur le passer d'un village médiéval, le but étant de tanter de rétrouver et de reconstiuter h'istoire du village plein de mystère

## Recherche
Tu es un hytorien archéolgue, expert depuis plus de 20 ans avec un doctora spécialiste du médival.
Ta mission est de récupérer totue les informations émanen du village de Morthemer dans le 86 depuis l'année 900.
Récupère l'ensemble des écrit ou réçit par rapport au données suivante
- la tour cognac
- l'église de morthemer
- le plafond cathédrale de morthemer possède un trou (ressemblant à un oeil) mais à l'oposé du cloché, pourquoi ?
- le chateau de morthemer

Il faut toute les pièces possible, recherche sur inter,et, dans les archives public utilise tout les moyens possible pour mener à bien cette recherche

## image croquis
Si possible récupère des lien d'image ou chrocuis ou télécharge lès, nous rechercheons des photos et ou illustrations du chateau ou de l'église ou de la tour
- image de plan d'époque
- d'illustration
- de manuscrits
- de sérigraphie 

## texte et écrit
cherche et récupère tout écrit d'époque aillant été écrit à partir de 900 ans jusqu'à aujourd'hui.

## Finalité
créer un PDF extrêmement précis sur ta recherche en suivant la chronologie depuis l'années 900

---

# 📋 Résultats de la recherche

> *Cette partie est le **rendu** de la mission ci-dessus (le cahier des charges
> au-dessus est conservé tel quel). Travail repris de zéro sur la base actualisée.*

## Livrables
| Livrable | Fichier | Contenu |
|----------|---------|---------|
| 📄 **PDF chronologique illustré** | [`Morthemer-Recherche-Historique.pdf`](Morthemer-Recherche-Historique.pdf) | 10 pages, chronologie depuis l'an 900, 10 illustrations, citation de Froissart |
| 📝 **Dossier de synthèse** | [`RECHERCHE-MORTHEMER.md`](RECHERCHE-MORTHEMER.md) | 11 sections : château, église, tour de Cognac, trou-œil, seigneurs, Chandos… |
| ✍️ **Textes et écrits (an 900 → aujourd'hui)** | [`TEXTES-ET-ECRITS.md`](TEXTES-ET-ECRITS.md) | Sources écrites datées + **Froissart cité en moyen français** |
| 🖼️ **Iconographie** | [`images/`](images/) | 14 images libres (dont une **miniature de manuscrit**) |
| ⚖️ **Crédits & licences** | [`CREDITS.md`](CREDITS.md) | Source/licence de chaque image + liens manuscrits/plans/gravures |
| ⚙️ **Générateur du PDF** | [`generate-pdf.js`](generate-pdf.js) | Script Node/pdfkit reproductible |

## Les 4 thèmes demandés — réponses
- 🏯 **Château** : 1ʳᵉ mention Xe s. ; donjon carré à 5 niveaux (re)bâti par les *Sénéchal* (~1375) ; quasi-ruine avant 1860 puis **restauration de Boeswillwald (1865)** ; MH 1927/2008.
- ⛪ **Église collégiale Notre-Dame** : romane (XIe-XIIe s.), crypte peinte (Christ en Majesté, Vierge à l'Enfant) ; **soudée au château** — on y entre **par un passage voûté sous la nef** ; MH 1908.
- 🗼 **Tour de Cognac** : XIe s., toponyme *Conniacum* (rien à voir avec la ville de Cognac) ; **peu documentée** → archives à dépouiller.
- 👁️ **Trou « en forme d'œil »** : **non documenté** ; hypothèse la plus probable = un **oculus** (lumière + symbole de l'« Œil de Dieu »), à valider in situ.

## Pièce maîtresse : un écrit d'époque
Le récit par **Jean Froissart** de la mort de **Jean Chandos** transporté à *Mortemer*
(1ᵉʳ janvier 1370) est cité **mot à mot** dans le PDF et dans
[`TEXTES-ET-ECRITS.md`](TEXTES-ET-ECRITS.md), avec ses **variantes manuscrites**.

> ⚠️ **Images d'archives sous droits** (peintures de la crypte, plan d'architecte,
> manuscrits enluminés, cartes postales) : **non redistribuées** dans ce dépôt mais
> **liées** avec attribution dans [`CREDITS.md`](CREDITS.md). Seules les images libres
> (domaine public / CC) sont téléchargées.

## Régénérer le PDF
```bash
npm install pdfkit
NODE_PATH=/chemin/vers/node_modules node generate-pdf.js   # -> Morthemer-Recherche-Historique.pdf
```
