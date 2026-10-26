<?php
// @file: .content.php
// @desc: content of the CancasEditor wiki page: one entry per section, in french and english (nl falls back to en).
// Shortcuts are written with <kbd>; every text is html (trusted, static).

return [
	"title" => ["fr" => "Guide d'utilisation de CancasEditor", "en" => "CancasEditor user guide"],
	"intro" => [
		"fr" => "CancasEditor est un éditeur graphique 2D dans le navigateur : dessinez des formes, composez des documents à plusieurs calques, concevez des pages web, reliez vos documents en prototype puis exportez en PNG, SVG, HTML ou XML.",
		"en" => "CancasEditor is a 2D graphics editor in the browser: draw shapes, compose multi-layer documents, design web pages, link your documents into a prototype, then export to PNG, SVG, HTML or XML.",
	],
	"sections" => [
		[
			"id" => "start",
			"fr" => ["Démarrage", '
<p>À l\'ouverture, l\'éditeur affiche un premier document blanc (<code>document_1</code>) au centre de la surface sombre. Le menu est en haut, le panneau <strong>Propriétés</strong> à droite et la <strong>barre d\'état</strong> en bas (document, calque, taille, outil, zoom, sélection, langue).</p>
<ol>
<li>Choisissez un outil dans le menu <strong>Outils</strong> (ou une touche, voir <a href="#shortcuts">Raccourcis</a>).</li>
<li>Faites glisser sur la surface pour dessiner.</li>
<li>Sélectionnez avec l\'outil <em>Sélection</em> (<kbd>S</kbd>), puis modifiez l\'élément dans le panneau Propriétés.</li>
<li>Votre travail est sauvegardé automatiquement dans le navigateur.</li>
</ol>'],
			"en" => ["Getting started", '
<p>On opening, the editor shows a first white document (<code>document_1</code>) in the middle of the dark surface. The menu is at the top, the <strong>Properties</strong> panel on the right and the <strong>status bar</strong> at the bottom (document, layer, size, tool, zoom, selection, language).</p>
<ol>
<li>Pick a tool in the <strong>Tools</strong> menu (or press its key, see <a href="#shortcuts">Shortcuts</a>).</li>
<li>Drag on the surface to draw.</li>
<li>Select with the <em>Selection</em> tool (<kbd>S</kbd>), then edit the element in the Properties panel.</li>
<li>Your work is saved automatically in the browser.</li>
</ol>'],
		],
		[
			"id" => "interface",
			"fr" => ["L'interface", '
<table>
<tr><th>Menu</th><th>Contenu</th></tr>
<tr><td>Fichier</td><td>Nouveau, ouvrir, enregistrer, ajouter un document, nouvelle page web, importer, exporter (PNG, SVG, HTML, CSS, XML...)</td></tr>
<tr><td>Édition</td><td>Annuler / rétablir, copier / coller, dupliquer, supprimer, ordre (premier plan, arrière-plan), groupes, clip et masque</td></tr>
<tr><td>Afficher</td><td>Couleurs, fenêtre des propriétés, règles, grille de colonnes, accrochage, zoom</td></tr>
<tr><td>Outils</td><td>Sélection, ligne, rectangle, cercle, bézier, plume, arc, courbe, étoile, texte, hotspot, pipette...</td></tr>
<tr><td>Options</td><td>Paramètres : thème, langue, raccourcis, plugins</td></tr>
<tr><td>Fenêtre</td><td>Calques, propriétés</td></tr>
<tr><td>Document</td><td>Nouveau, supprimer, lier à..., supprimer les liens, présenter</td></tr>
<tr><td>Calque</td><td>Ajouter, supprimer, visibilité, fusion et opacité</td></tr>
<tr><td>Aide</td><td>À propos, Wiki (cette page)</td></tr>
</table>
<p>Sur un petit écran, le menu devient un tiroir (icône hamburger). Les entrées affichent leur raccourci clavier.</p>'],
			"en" => ["The interface", '
<table>
<tr><th>Menu</th><th>Content</th></tr>
<tr><td>File</td><td>New, open, save, add a document, new web page, import, export (PNG, SVG, HTML, CSS, XML...)</td></tr>
<tr><td>Edit</td><td>Undo / redo, copy / paste, duplicate, delete, order (bring to front, send to back), groups, clip and mask</td></tr>
<tr><td>View</td><td>Colors, properties window, rulers, column grid, snapping, zoom</td></tr>
<tr><td>Tools</td><td>Selection, line, rectangle, circle, bezier, plume, arc, curve, star, text, hotspot, eyedropper...</td></tr>
<tr><td>Options</td><td>Settings: theme, language, shortcuts, plugins</td></tr>
<tr><td>Window</td><td>Layers, properties</td></tr>
<tr><td>Document</td><td>New, delete, link to..., remove links, present</td></tr>
<tr><td>Layer</td><td>Add, delete, visibility, blending and opacity</td></tr>
<tr><td>Help</td><td>About, Wiki (this page)</td></tr>
</table>
<p>On a small screen the menu becomes a drawer (hamburger icon). Entries show their keyboard shortcut.</p>'],
		],
		[
			"id" => "draw",
			"fr" => ["Dessiner", '
<p>Chaque forme est créée en faisant glisser sur le document. Une fois dessinée, elle devient l\'élément en cours d\'édition : ses poignées apparaissent et le panneau Propriétés montre ses réglages.</p>
<ul>
<li><strong>Ligne, rectangle, cercle</strong> : glissez d\'un coin à l\'autre.</li>
<li><strong>Bézier, plume, arc, courbe</strong> : cliquez pour poser les points de contrôle ; <kbd>Shift</kbd>+<kbd>C</kbd> ferme le tracé, <kbd>Shift</kbd>+<kbd>R</kbd> le réinitialise.</li>
<li><strong>Étoile, polygone</strong> : glissez, puis réglez le nombre de branches dans les propriétés.</li>
<li><strong>Texte</strong> : cliquez pour poser le texte, puis éditez police, taille et couleur.</li>
<li><strong>Image / HTML</strong> : importez via le menu Fichier ; un élément HTML s\'édite en mode visuel ou en source.</li>
</ul>
<p>Pour revenir à la sélection depuis n\'importe quel outil, faites un clic droit.</p>'],
			"en" => ["Drawing", '
<p>Each shape is created by dragging on the document. Once drawn, it becomes the element being edited: its handles show up and the Properties panel displays its settings.</p>
<ul>
<li><strong>Line, rectangle, circle</strong>: drag from one corner to the other.</li>
<li><strong>Bezier, plume, arc, curve</strong>: click to place the control points; <kbd>Shift</kbd>+<kbd>C</kbd> closes the path, <kbd>Shift</kbd>+<kbd>R</kbd> resets it.</li>
<li><strong>Star, polygon</strong>: drag, then set the number of branches in the properties.</li>
<li><strong>Text</strong>: click to place the text, then edit font, size and color.</li>
<li><strong>Image / HTML</strong>: import from the File menu; an HTML element is edited visually or as source.</li>
</ul>
<p>To go back to selection from any tool, right-click.</p>'],
		],
		[
			"id" => "documents",
			"fr" => ["Documents et calques", '
<p>Une <strong>scène</strong> contient un ou plusieurs <strong>documents</strong>, chacun contenant des <strong>calques</strong> qui contiennent les <strong>éléments</strong>.</p>
<h3>Plusieurs documents</h3>
<ul>
<li><strong>Document &gt; Nouveau</strong> (ou le bouton + de l\'onglet Calques) ajoute un document à droite du dernier, nommé <code>document_N</code> où N est le plus grand numéro du projet plus un.</li>
<li>Avec plusieurs documents, l\'identifiant s\'affiche au-dessus du coin supérieur gauche : <em>faites-le glisser</em> pour déplacer le document, <em>cliquez</em> pour le sélectionner.</li>
<li>Survolez un document non sélectionné : il reçoit un halo violet. Un clic dedans le rend courant.</li>
<li>Chaque document garde son zoom et son déplacement.</li>
<li>L\'identifiant est modifiable (inspecteur ou double-clic dans l\'explorateur de calques) ; il doit être valide et unique.</li>
</ul>
<h3>Calques</h3>
<p>L\'onglet <strong>Calques</strong> montre l\'arbre documents &gt; calques &gt; éléments. Œil pour la visibilité, glisser-déposer pour l\'ordre, clic droit pour premier plan / arrière-plan, double-clic pour renommer.</p>
<h3>Grille de colonnes</h3>
<p>Chaque document peut afficher 1 à 12 colonnes égales avec gouttière (<em>Afficher &gt; Grille colonnes</em>). Les éléments s\'accrochent aux bords des colonnes.</p>'],
			"en" => ["Documents and layers", '
<p>A <strong>scene</strong> holds one or more <strong>documents</strong>, each holding <strong>layers</strong> that hold the <strong>elements</strong>.</p>
<h3>Several documents</h3>
<ul>
<li><strong>Document &gt; New</strong> (or the + button of the Layers tab) adds a document to the right of the last one, named <code>document_N</code> where N is the highest number of the project plus one.</li>
<li>With several documents, the id is shown above the top-left corner: <em>drag it</em> to move the document, <em>click it</em> to select it.</li>
<li>Hover an unselected document: it gets a purple glow. A click inside makes it current.</li>
<li>Each document keeps its own zoom and pan.</li>
<li>The id is editable (inspector or double-click in the layer explorer); it must be valid and unique.</li>
</ul>
<h3>Layers</h3>
<p>The <strong>Layers</strong> tab shows the documents &gt; layers &gt; elements tree. Eye for visibility, drag-drop for order, right-click for bring to front / send to back, double-click to rename.</p>
<h3>Column grid</h3>
<p>Each document can show 1 to 12 equal columns with a gutter (<em>View &gt; Column grid</em>). Elements snap to the column edges.</p>'],
		],
		[
			"id" => "inspector",
			"fr" => ["Propriétés et styles", '
<p>Le panneau Propriétés (à droite) est le « mode design » : il change selon la sélection.</p>
<ul>
<li><strong>Géométrie</strong> : position X / Y, largeur, hauteur, rotation, alignement, verrouillage du ratio, ajustement au document.</li>
<li><strong>Apparence</strong> : opacité, flou, luminosité, contraste, niveaux de gris, rotation de teinte, inversion, saturation.</li>
<li><strong>Couleurs</strong> : remplissage et contour avec transparence (alpha) ; pipette pour prélever une couleur.</li>
<li><strong>Ombres</strong> : plusieurs ombres par élément (décalage, flou, couleur) ; le marqueur d\'une ombre se déplace à la souris.</li>
<li><strong>Brosses</strong> : remplissages composites, dégradés linéaires et radiaux (poignées de départ, de fin, de rayon et arrêts de couleur), textures.</li>
<li><strong>Transformation</strong> : poignées d\'échelle, de rotation et d\'inclinaison sur l\'élément sélectionné.</li>
</ul>
<p>Sans sélection, le panneau montre les réglages du document : identifiant, titre, taille, fond, colonnes.</p>'],
			"en" => ["Properties and styles", '
<p>The Properties panel (right) is the "design mode": it changes with the selection.</p>
<ul>
<li><strong>Geometry</strong>: X / Y position, width, height, rotation, alignment, ratio lock, fit to document.</li>
<li><strong>Appearance</strong>: opacity, blur, brightness, contrast, grayscale, hue rotation, invert, saturation.</li>
<li><strong>Colors</strong>: fill and stroke with transparency (alpha); eyedropper to pick a color.</li>
<li><strong>Shadows</strong>: several shadows per element (offset, blur, color); a shadow marker can be dragged with the mouse.</li>
<li><strong>Brushes</strong>: composite fills, linear and radial gradients (start, end, radius handles and color stops), textures.</li>
<li><strong>Transform</strong>: scale, rotate and skew handles on the selected element.</li>
</ul>
<p>With no selection, the panel shows the document settings: id, title, size, background, columns.</p>'],
		],
		[
			"id" => "prototype",
			"fr" => ["Prototype : liens, hotspots et présentation", '
<ul>
<li><strong>Lien entre documents</strong> : faites glisser la pastille ronde à droite de l\'identifiant d\'un document vers un autre, ou utilisez <em>Document &gt; Lier à...</em> (cible, couleur, texte). Cliquez sur la flèche pour changer sa couleur ou son texte, ou la supprimer.</li>
<li><strong>Hotspot</strong> (<em>Outils &gt; Hotspot</em>) : dessinez une zone cliquable, puis choisissez dans « Aller à » le document cible (le document en cours n\'est pas proposé). Une flèche en pointillés courbe pointe vers l\'identifiant du document cible.</li>
<li><strong>Présenter</strong> (<em>Document &gt; Présenter</em>) : plein écran ; cliquez les hotspots ou les boutons de liens pour naviguer ; <kbd>←</kbd> revient, <kbd>→</kbd> suit le premier lien, <kbd>Échap</kbd> ferme.</li>
</ul>'],
			"en" => ["Prototype: links, hotspots and presenting", '
<ul>
<li><strong>Link between documents</strong>: drag the round handle at the right of a document id onto another one, or use <em>Document &gt; Link to...</em> (target, color, label). Click the arrow to change its color or label, or delete it.</li>
<li><strong>Hotspot</strong> (<em>Tools &gt; Hotspot</em>): draw a clickable area, then pick the target document in "Go to" (the document being edited is not listed). A curved dashed arrow points at the target document id.</li>
<li><strong>Present</strong> (<em>Document &gt; Present</em>): fullscreen; click the hotspots or link buttons to navigate; <kbd>←</kbd> goes back, <kbd>→</kbd> follows the first link, <kbd>Esc</kbd> closes.</li>
</ul>'],
		],
		[
			"id" => "shortcuts",
			"fr" => ["Raccourcis clavier", '
<p>Les raccourcis ne fonctionnent que lorsque la <strong>surface a le focus</strong> (cliquez dessus). Un champ de saisie, une boîte de dialogue ou le panneau Propriétés gardent leurs propres touches. Sur Mac, <kbd>Cmd</kbd> remplace <kbd>Ctrl</kbd>.</p>
<table>
<tr><th>Touche</th><th>Action</th></tr>
<tr><td><kbd>S</kbd> <kbd>L</kbd> <kbd>R</kbd> <kbd>C</kbd></td><td>Sélection, ligne, rectangle, cercle</td></tr>
<tr><td><kbd>B</kbd> <kbd>P</kbd> <kbd>A</kbd> <kbd>M</kbd> <kbd>K</kbd> <kbd>T</kbd></td><td>Bézier, plume, arc, courbe, étoile, texte</td></tr>
<tr><td><kbd>Suppr</kbd> / <kbd>Retour arrière</kbd></td><td>Supprimer la sélection</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd></td><td>Annuler, rétablir</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>V</kbd> / <kbd>A</kbd></td><td>Copier, coller, tout sélectionner</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>Dupliquer la sélection</td></tr>
<tr><td><kbd>Échap</kbd></td><td>Désélectionner ; ferme la boîte de dialogue au premier plan</td></tr>
<tr><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>Dans un menu ouvert : naviguer ; <kbd>Entrée</kbd> active</td></tr>
</table>
<p>Vous pouvez redéfinir chaque raccourci dans <em>Options &gt; Paramètres &gt; Raccourcis</em> ; une touche n\'appartient qu\'à une action.</p>'],
			"en" => ["Keyboard shortcuts", '
<p>Shortcuts only work when the <strong>surface has focus</strong> (click on it). An input field, a dialog or the Properties panel keep their own keys. On Mac, <kbd>Cmd</kbd> replaces <kbd>Ctrl</kbd>.</p>
<table>
<tr><th>Key</th><th>Action</th></tr>
<tr><td><kbd>S</kbd> <kbd>L</kbd> <kbd>R</kbd> <kbd>C</kbd></td><td>Selection, line, rectangle, circle</td></tr>
<tr><td><kbd>B</kbd> <kbd>P</kbd> <kbd>A</kbd> <kbd>M</kbd> <kbd>K</kbd> <kbd>T</kbd></td><td>Bezier, plume, arc, curve, star, text</td></tr>
<tr><td><kbd>Del</kbd> / <kbd>Backspace</kbd></td><td>Delete the selection</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd></td><td>Undo, redo</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>V</kbd> / <kbd>A</kbd></td><td>Copy, paste, select all</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>Duplicate the selection</td></tr>
<tr><td><kbd>Esc</kbd></td><td>Unselect; closes the topmost dialog</td></tr>
<tr><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>In an open menu: navigate; <kbd>Enter</kbd> activates</td></tr>
</table>
<p>You can redefine each shortcut in <em>Options &gt; Settings &gt; Shortcuts</em>; a key belongs to a single action.</p>'],
		],
		[
			"id" => "export",
			"fr" => ["Exporter et importer", '
<ul>
<li><strong>Fichier &gt; Exporter...</strong> : une seule boîte de dialogue (nom du projet + format) pour PNG, JPEG, SVG, HTML, phtml, bview ou XML (format projet <code>gkds</code>).</li>
<li><strong>Export CSS</strong> : le style de l\'élément sélectionné en règle CSS (cible HTML ou SVG), avec transition, survol et animation optionnels ; boutons Copier et Télécharger.</li>
<li><strong>Importer</strong> : fichiers SVG, images et HTML (scripts et attributs <code>on*</code> retirés).</li>
<li><strong>Page web</strong> : <em>Fichier &gt; Nouvelle page web</em> crée un document formé d\'éléments HTML5 (palette, arbre de structure, éditeur de balise) ; le type « email » limite la palette aux balises compatibles messagerie.</li>
</ul>'],
			"en" => ["Export and import", '
<ul>
<li><strong>File &gt; Export...</strong>: one dialog (project name + format) for PNG, JPEG, SVG, HTML, phtml, bview or XML (<code>gkds</code> project format).</li>
<li><strong>CSS export</strong>: the style of the selected element as a CSS rule (HTML or SVG target), with optional transition, hover and animation; Copy and Download buttons.</li>
<li><strong>Import</strong>: SVG files, images and HTML (scripts and <code>on*</code> attributes are removed).</li>
<li><strong>Web page</strong>: <em>File &gt; New web page</em> creates a document made of HTML5 elements (palette, structure tree, tag editor); the "email" type limits the palette to mail-safe tags.</li>
</ul>'],
		],
		[
			"id" => "saving",
			"fr" => ["Sauvegarde", '
<ul>
<li><strong>Dans le navigateur</strong> : le document, l\'historique, la vue et les préférences sont conservés automatiquement (localStorage) et restaurés à la réouverture.</li>
<li><strong>Compte connecté</strong> : vos options et plugins sont synchronisés avec le serveur ; <em>Fichier &gt; Enregistrer dans mon compte...</em> et <em>Ouvrir depuis mon compte...</em> gèrent vos surfaces.</li>
<li>Deux éléments ne peuvent pas porter le même identifiant : l\'enregistrement est refusé avec un avertissement tant que le doublon n\'est pas corrigé.</li>
</ul>'],
			"en" => ["Saving", '
<ul>
<li><strong>In the browser</strong>: the document, history, view and preferences are kept automatically (localStorage) and restored on reopening.</li>
<li><strong>Signed-in account</strong>: your options and plugins are synchronized with the server; <em>File &gt; Save to my account...</em> and <em>Open from my account...</em> manage your surfaces.</li>
<li>Two elements cannot share an id: saving is refused with a warning until the duplicate is fixed.</li>
</ul>'],
		],
		[
			"id" => "settings",
			"fr" => ["Paramètres", '
<p><em>Options &gt; Paramètres</em> : <strong>thème</strong> (sombre, clair, système), <strong>langue</strong> (français, anglais, néerlandais), <strong>raccourcis</strong> personnalisés, <strong>plugins</strong> et profil. Le thème s\'applique aussi aux menus et à cette page.</p>'],
			"en" => ["Settings", '
<p><em>Options &gt; Settings</em>: <strong>theme</strong> (dark, light, system), <strong>language</strong> (French, English, Dutch), custom <strong>shortcuts</strong>, <strong>plugins</strong> and profile. The theme also applies to the menus and to this page.</p>'],
		],
		[
			"id" => "limits",
			"fr" => ["Limites connues", '
<ul>
<li>Navigateurs : Chrome / Chromium et Firefox ; la pipette native n\'existe que sur Chromium (repli sur le canvas).</li>
<li>Une ombre est produite par le remplissage <em>et</em> le contour ; pas d\'ombre de groupe pour un calque.</li>
<li>Export CSS : un élément à la fois ; les dégradés et textures ne s\'expriment pas en CSS pour la cible SVG.</li>
<li>Import SVG : <code>feDropShadow</code>, dégradés et <code>foreignObject</code> non gérés.</li>
<li>Partage de surfaces : lecture seule ; pas de fusion si deux sessions modifient la même surface.</li>
</ul>'],
			"en" => ["Known limits", '
<ul>
<li>Browsers: Chrome / Chromium and Firefox; the native eyedropper only exists on Chromium (canvas fallback).</li>
<li>A shadow is cast by the fill <em>and</em> the stroke; no group shadow for a layer.</li>
<li>CSS export: one element at a time; gradients and textures cannot be expressed in CSS for the SVG target.</li>
<li>SVG import: <code>feDropShadow</code>, gradients and <code>foreignObject</code> are not handled.</li>
<li>Surface sharing: read-only; no merge when two sessions edit the same surface.</li>
</ul>'],
		],
	],
];
