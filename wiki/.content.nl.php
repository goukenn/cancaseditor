<?php
// @file: .content.nl.php
// @desc: dutch content of the wiki page, merged into .content.php by wiki/default.phtml (same section ids).

return [
	"title" => "CancasEditor gebruikershandleiding",
	"intro" => "CancasEditor is een 2D-grafische editor in de browser: teken vormen, stel documenten met meerdere lagen samen, ontwerp webpagina's, koppel je documenten tot een prototype en exporteer naar PNG, SVG, HTML of XML.",
	"sections" => [
		"start" => ["Aan de slag", '
<p>Bij het openen toont de editor een eerste wit document (<code>document_1</code>) midden op het donkere werkblad. Het menu staat bovenaan, het paneel <strong>Eigenschappen</strong> rechts en de <strong>statusbalk</strong> onderaan (document, laag, grootte, gereedschap, zoom, selectie, taal).</p>
<ol>
<li>Kies een gereedschap in het menu <strong>Gereedschap</strong> (of druk op de toets, zie <a href="#shortcuts">Sneltoetsen</a>).</li>
<li>Sleep over het werkblad om te tekenen.</li>
<li>Selecteer met het gereedschap <em>Selectie</em> (<kbd>S</kbd>) en pas het element aan in het paneel Eigenschappen.</li>
<li>Je werk wordt automatisch in de browser bewaard.</li>
</ol>'],
		"interface" => ["De interface", '
<table>
<tr><th>Menu</th><th>Inhoud</th></tr>
<tr><td>Bestand</td><td>Nieuw, openen, opslaan, document toevoegen, nieuwe webpagina, importeren, exporteren (PNG, SVG, HTML, CSS, XML...)</td></tr>
<tr><td>Bewerken</td><td>Ongedaan maken / opnieuw, kopiëren / plakken, dupliceren, verwijderen, volgorde (naar voren, naar achteren), groepen, clip en masker</td></tr>
<tr><td>Weergave</td><td>Kleuren, eigenschappenvenster, linialen, kolomraster, magnetisme, zoom</td></tr>
<tr><td>Gereedschap</td><td>Selectie, lijn, rechthoek, cirkel, bézier, pen, boog, curve, ster, tekst, hotspot, pipet...</td></tr>
<tr><td>Opties</td><td>Instellingen: thema, taal, sneltoetsen, plug-ins</td></tr>
<tr><td>Venster</td><td>Lagen, eigenschappen</td></tr>
<tr><td>Document</td><td>Nieuw, verwijderen, koppelen aan..., koppelingen verwijderen, presenteren</td></tr>
<tr><td>Laag</td><td>Toevoegen, verwijderen, zichtbaarheid, overvloeien en dekking</td></tr>
<tr><td>Help</td><td>Over, Wiki (deze pagina)</td></tr>
</table>
<p>Op een klein scherm wordt het menu een lade (hamburgerpictogram). De menu-items tonen hun sneltoets.</p>'],
		"draw" => ["Tekenen", '
<p>Elke vorm maak je door over het document te slepen. Na het tekenen wordt hij het element dat je bewerkt: de hendels verschijnen en het paneel Eigenschappen toont de instellingen.</p>
<ul>
<li><strong>Lijn, rechthoek, cirkel</strong>: sleep van de ene hoek naar de andere.</li>
<li><strong>Bézier, pen, boog, curve</strong>: klik om de controlepunten te plaatsen; <kbd>Shift</kbd>+<kbd>C</kbd> sluit het pad, <kbd>Shift</kbd>+<kbd>R</kbd> zet het terug.</li>
<li><strong>Ster, veelhoek</strong>: sleep en stel daarna het aantal punten in bij de eigenschappen.</li>
<li><strong>Tekst</strong>: klik om de tekst te plaatsen en pas daarna lettertype, grootte en kleur aan.</li>
<li><strong>Afbeelding / HTML</strong>: importeer via het menu Bestand; een HTML-element bewerk je visueel of als bron.</li>
</ul>
<p>Om vanuit elk gereedschap terug te keren naar selectie, klik je met de rechtermuisknop.</p>'],
		"documents" => ["Documenten en lagen", '
<p>Een <strong>scène</strong> bevat een of meer <strong>documenten</strong>, elk met <strong>lagen</strong> die de <strong>elementen</strong> bevatten.</p>
<h3>Meerdere documenten</h3>
<ul>
<li><strong>Document &gt; Nieuw</strong> (of de knop + op het tabblad Lagen) voegt een document toe rechts van het laatste, met de naam <code>document_N</code>, waarbij N het hoogste nummer van het project plus één is.</li>
<li>Bij meerdere documenten staat de id boven de linkerbovenhoek: <em>sleep</em> hem om het document te verplaatsen, <em>klik</em> om het te selecteren.</li>
<li>Beweeg over een niet-geselecteerd document: het krijgt een paarse gloed. Een klik erin maakt het actief.</li>
<li>Elk document onthoudt zijn eigen zoom en positie.</li>
<li>De id is aanpasbaar (inspecteur of dubbelklik in de laagverkenner); hij moet geldig en uniek zijn.</li>
</ul>
<h3>Lagen</h3>
<p>Het tabblad <strong>Lagen</strong> toont de boom documenten &gt; lagen &gt; elementen. Oog voor zichtbaarheid, slepen voor de volgorde, rechtsklik voor naar voren / naar achteren, dubbelklik om te hernoemen.</p>
<h3>Kolomraster</h3>
<p>Elk document kan 1 tot 12 gelijke kolommen met tussenruimte tonen (<em>Weergave &gt; Kolomraster</em>). Elementen springen naar de kolomranden.</p>'],
		"inspector" => ["Eigenschappen en stijlen", '
<p>Het paneel Eigenschappen (rechts) is de "ontwerpmodus": het verandert met de selectie.</p>
<ul>
<li><strong>Geometrie</strong>: X / Y-positie, breedte, hoogte, rotatie, uitlijning, verhouding vergrendelen, aanpassen aan het document.</li>
<li><strong>Uiterlijk</strong>: dekking, vervaging, helderheid, contrast, grijstinten, tintrotatie, omkeren, verzadiging.</li>
<li><strong>Kleuren</strong>: vulling en lijn met transparantie (alfa); pipet om een kleur op te nemen.</li>
<li><strong>Schaduwen</strong>: meerdere schaduwen per element (verschuiving, vervaging, kleur); de markering van een schaduw sleep je met de muis.</li>
<li><strong>Penselen</strong>: samengestelde vullingen, lineaire en radiale verlopen (hendels voor begin, einde, straal en kleurstops), texturen.</li>
<li><strong>Transformatie</strong>: hendels voor schalen, roteren en kantelen op het geselecteerde element.</li>
</ul>
<p>Zonder selectie toont het paneel de documentinstellingen: id, titel, grootte, achtergrond, kolommen.</p>'],
		"prototype" => ["Prototype: koppelingen, hotspots en presenteren", '
<ul>
<li><strong>Koppeling tussen documenten</strong>: sleep de ronde hendel rechts van de id van een document naar een ander, of gebruik <em>Document &gt; Koppelen aan...</em> (doel, kleur, label). Klik op de pijl om kleur of label te wijzigen of de koppeling te verwijderen.</li>
<li><strong>Hotspot</strong> (<em>Gereedschap &gt; Hotspot</em>): teken een klikbaar gebied en kies bij "Ga naar" het doeldocument (het document dat je bewerkt wordt niet aangeboden). Een gebogen, gestippelde pijl wijst naar de id van het doeldocument.</li>
<li><strong>Presenteren</strong> (<em>Document &gt; Presenteren</em>): volledig scherm; klik op hotspots of koppelingsknoppen om te navigeren; <kbd>←</kbd> gaat terug, <kbd>→</kbd> volgt de eerste koppeling, <kbd>Esc</kbd> sluit.</li>
</ul>'],
		"shortcuts" => ["Sneltoetsen", '
<p>Sneltoetsen werken alleen als het <strong>werkblad focus heeft</strong> (klik erop). Een invoerveld, een dialoog of het paneel Eigenschappen behouden hun eigen toetsen. Op een Mac vervangt <kbd>Cmd</kbd> de toets <kbd>Ctrl</kbd>.</p>
<table>
<tr><th>Toets</th><th>Actie</th></tr>
<tr><td><kbd>S</kbd> <kbd>L</kbd> <kbd>R</kbd> <kbd>C</kbd></td><td>Selectie, lijn, rechthoek, cirkel</td></tr>
<tr><td><kbd>B</kbd> <kbd>P</kbd> <kbd>A</kbd> <kbd>M</kbd> <kbd>K</kbd> <kbd>T</kbd></td><td>Bézier, pen, boog, curve, ster, tekst</td></tr>
<tr><td><kbd>Del</kbd> / <kbd>Backspace</kbd></td><td>Selectie verwijderen</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd></td><td>Ongedaan maken, opnieuw</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>V</kbd> / <kbd>A</kbd></td><td>Kopiëren, plakken, alles selecteren</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>Selectie dupliceren</td></tr>
<tr><td><kbd>Esc</kbd></td><td>Selectie opheffen; sluit de bovenste dialoog</td></tr>
<tr><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>In een open menu: navigeren; <kbd>Enter</kbd> activeert</td></tr>
</table>
<p>Je kunt elke sneltoets opnieuw instellen via <em>Opties &gt; Instellingen &gt; Sneltoetsen</em>; een toets hoort bij één actie.</p>'],
		"export" => ["Exporteren en importeren", '
<ul>
<li><strong>Bestand &gt; Exporteren...</strong>: één dialoog (projectnaam + formaat) voor PNG, JPEG, SVG, HTML, phtml, bview of XML (projectformaat <code>gkds</code>).</li>
<li><strong>CSS-export</strong>: de stijl van het geselecteerde element als CSS-regel (HTML- of SVG-doel), met optionele overgang, hover en animatie; knoppen Kopiëren en Downloaden.</li>
<li><strong>Importeren</strong>: SVG-bestanden, afbeeldingen en HTML (scripts en <code>on*</code>-attributen worden verwijderd).</li>
<li><strong>Webpagina</strong>: <em>Bestand &gt; Nieuwe webpagina</em> maakt een document van HTML5-elementen (palet, structuurboom, tag-editor); het type "e-mail" beperkt het palet tot mailvriendelijke tags.</li>
</ul>'],
		"saving" => ["Opslaan", '
<ul>
<li><strong>In de browser</strong>: het document, de geschiedenis, de weergave en de voorkeuren worden automatisch bewaard (localStorage) en bij heropenen hersteld.</li>
<li><strong>Ingelogd account</strong>: je opties en plug-ins worden met de server gesynchroniseerd; <em>Bestand &gt; Opslaan in mijn account...</em> en <em>Openen vanuit mijn account...</em> beheren je werkbladen.</li>
<li>Twee elementen mogen niet dezelfde id hebben: opslaan wordt geweigerd met een waarschuwing totdat het dubbele is aangepast.</li>
</ul>'],
		"settings" => ["Instellingen", '
<p><em>Opties &gt; Instellingen</em>: <strong>thema</strong> (donker, licht, systeem), <strong>taal</strong> (Frans, Engels, Nederlands), eigen <strong>sneltoetsen</strong>, <strong>plug-ins</strong> en profiel. Het thema geldt ook voor de menu\'s en deze pagina.</p>'],
		"limits" => ["Bekende beperkingen", '
<ul>
<li>Browsers: Chrome / Chromium en Firefox; de ingebouwde pipet bestaat alleen in Chromium (terugval op het canvas).</li>
<li>Een schaduw wordt veroorzaakt door de vulling <em>en</em> de lijn; geen groepsschaduw voor een laag.</li>
<li>CSS-export: één element tegelijk; verlopen en texturen zijn niet in CSS uit te drukken voor het SVG-doel.</li>
<li>SVG-import: <code>feDropShadow</code>, verlopen en <code>foreignObject</code> worden niet ondersteund.</li>
<li>Werkbladen delen: alleen-lezen; geen samenvoeging als twee sessies hetzelfde werkblad bewerken.</li>
</ul>'],
	],
];
