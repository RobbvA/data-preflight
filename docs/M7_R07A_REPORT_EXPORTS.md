# M7 R07a — Samenhangende rapportexports

31 oktober 2026 · basis remote `efc917cc98135b529cf6eee0755bbefa74c0fa5d` · R03 lokaal geaccepteerd en push onafhankelijk bevestigd. Dit pakket is gebouwd/getest in voorbereiding; lokale toepassing/acceptatie, push en live van R07a zijn nog open.

## Scope en gedrag

Rob vroeg de bestaande rapporten direct mee te nemen bij exportverbeteringen. R07a is daarom naar voren gehaald, vóór R04/R05. Geen brede herbouw van de werkruimte. Alle zes profielen krijgen naast data-export één Reports-blok met:

- Issue report format: CSV of Excel XLSX; alle actuele issues, inclusief blocked rows en warnings.
- Review report format: Excel XLSX of directe PDF-download; samenvatting, alle issues, beslissingen voor alle rijen en actuele controlecontext.
- Optionele organisatienaam, maximaal 120 tekens, uitsluitend als rapportmetadata. Geen gebruikersidentiteit, handtekening, certificering of opgeslagen account.
- De bestaande validation-context-CSV onder Details blijft als aanvullende compatibele uitvoer beschikbaar.

Eén onveranderlijk rapportmodel voedt de schrijvers. Het model controleert rij-/issueposities en statustellingen tegen de actuele run. Reviewfilters veranderen de inhoud niet. Per issue: parsed data-row number, recordidentiteit, veld, bronkolom, geparste bronwaarde, beschikbare weergavewaarde, genormaliseerde waarde, regel/ernst/categorie/risico waar beschikbaar, probleem/reden/herstelactie, rijstatus en exportbesluit. Een waarschuwing op een blocked rij krijgt dezelfde uitsluiting als die hele rij.

Geparste bronwaarde is geen reconstructie van eerder verloren Excel-precisie. Waar de exacte adapter opgeslagen en weergegeven cellen apart levert, staan beide in het rapport. Dat is expliciet uitgelegd. Het datarijnummer is de rij binnen de geparste dataset, niet per definitie het fysieke Excel-regelnummer.

Het volledige XLSX heeft vier werkbladen: Summary, Issues, Rows en Validation context. Alle cellen zijn tekst en worden via dezelfde text-worksheethelper als data-export geschreven. IDs, decimalen, Unicode en formuleachtige tekst blijven exact; geen formules of stille neutralisatie. All-ready geeft een lege Issues-sheet met headers en nog steeds volledige samenvatting/rijbesluiten/context. All-blocked mag een rapport opleveren terwijl schone-data-export uitstaat.

PDF is een lokaal gegenereerd A4-document met selecteerbare tekst, duidelijke secties, herhaalde context bij doorlopende issues en paginanummers. Kleine secties delen pagina's; geen verplicht vierpagina-document voor één geslaagde rij. Lange waarden worden afgebroken, niet afgeknipt. Metadata bevat organisatienaam indien ingevuld; PDF-bestandsmetadata kan een generatietijd bevatten, terwijl validatie-/rapportinhoud deterministisch blijft.

## Privacy, grenzen en herstel

PDF gebruikt dynamisch geladen `pdf-lib` 1.17.1 en `@pdf-lib/fontkit` 1.1.1, plus de meegeleverde DejaVu Sans-font met licentietekst. Bestaande package-lock dependencies zijn niet bijgewerkt; zes nieuwe packageentries volgen uit deze twee nieuwe directe dependencies. Het lettertype is een eigen static asset. Alleen GET van lokale code/fontassets, geen externe fontdienst of upload van bron-/rapportdata.

Een bron-/runwijziging of unmount maakt een lopende PDF ongeldig. Cancel report onderdrukt de download; het is geen garantie dat reeds lopende synchrone PDF-berekeningen onmiddellijk stoppen. Tijdens generatie zijn rapportformaten/organisatie uitgeschakeld om geen verkeerde downloadkeuze te suggereren. Nieuwe eigen bron wist de brongebonden rapportkeuzes/organisatie. Oude async-jobs mogen geen bestand of foutmelding in de nieuwe sessie publiceren.

CSV-issues gebruiken de bestaande formulebescherming: formuleachtige brontekst weigert CSV, met Excel als alternatief zonder waardeverandering. Review-XLSX behoudt ook dergelijke tekst. PDF weigert tekens buiten het meegeleverde lettertype en niet-ondersteunde schrijfrichtingen expliciet met Excel-herstelactie; geen vervangtekens of stille transliteratie. Geteste accenten/Euro/Grieks werken; CJK en Arabisch vallen terug naar Excel. Dit is geen universele Unicode-/RTL-garantie.

PDF-grenzen: maximaal 500 issues, 5.000 rijen, 200 pagina's en 1.000.000 tekens in het rapportmodel. Excel heeft zijn eigen bestaande sheet-/cellimieten. Bij overschrijding wordt de uitvoer expliciet geweigerd, nooit stil afgekapt. PDF is een reviewdocument en geen importformaat, juridisch auditcertificaat of ERP-goedkeuring. Template-/custom-rule-/acceptancecontext wordt toegevoegd onder R07b wanneer die functies worden gebouwd; geen uitgevoerde checks verzinnen.

## Verificatie

- 134 tests geslaagd, 0 mislukt: alle 121 bestaande plus 13 nieuwe rapporttests. Dekking: snapshots/niet-muteren/herhaalbaarheid, bron-/display-/genormaliseerde waarden, rijbrede besluiten, tellings-/contextguards, vier text-only XLSX-sheets, all-ready, echte issue CSV/XLSX-downloads, formuleachtige tekst, paginering/lange tekst/accents/Euro/Grieks, expliciete glyph-/richting-/groottelimieten, en echte fixtures van de overige vijf profielen.
- Lint nul fouten en uitsluitend de twee bekende warnings (Metadata in app/layout.tsx, _tone in DataSetPreview.tsx). Productiebuild/TypeScript geslaagd.
- Productiebrowser voor Invoice/Customer/Vendor/Product/Price/Stock: issue-CSV en issue-XLSX werkelijk gedownload en volledig vergeleken; reviewworkbook met samenvatting/alle issues/alle rijbesluiten/context/organisatie gecontroleerd; directe PDF-download en structuur gecontroleerd.
- PDF-tekst uit de echte browserbestanden gehaald en alle secties gecontroleerd; de pagina's gerenderd en visueel beoordeeld. Losse lange-tekst/Unicode-proef eveneens volledig gerenderd en gecontroleerd. Geen browserprintsessie of afbeelding-PDF als vervanging voor tekst-PDF.
- All-ready PDF/XLSX, disabled lege issuerapportactie, actieve Product-unitlijst met daadwerkelijke blocker/context, formuleachtige bronwaarde naar XLSX, ongeschikte PDF-tekens zonder beschadigde download, 1440/390px zonder overflow en keyboardbediening gecontroleerd.
- Vertraagde fontfetch annuleren, en dezelfde bestandsnaam vervangen tijdens lopende PDF: geen oude download; nieuwe bron vereist eigen notatie en behoudt geen oude organisatienaam. Geen page errors of onverwachte requests met brondata.
- Geen directe Windows-checkouttest, fysieke telefoon, volledige R12-eindmatrix of livefunctionele controle geclaimd. Dit is geen volledige security- of toegankelijkheidsaudit; PDF is niet als PDF/UA gecertificeerd.

Interne reproductie: m7-visual-preview/reports-check.cjs en reports-results.json. Voor optionele lokale unit-PDFpreview kan DATAPREFLIGHT_PDF_PREVIEW_PATH gezet worden; normale npm test schrijft niet naar een vaste hostmap en werkt ook op Windows. PDF-/screenshotproeven zijn intern bewijs, niet als gebruikerbestanden opgeslagen.

## Toepassen en hervatten

Het pakket bevat package.json, package-lock.json, de lokale font/licentie en alle gewijzigde projectbestanden. Na apply één keer `npm install` uitvoeren voor de PDF-dependencies, daarna localhost verversen (of devserver herstarten als nodig). Het applyscript controleert tekst en binaire bronbestanden vóór het overschrijven van bekende baselines.

Lokale beoordeling: kies een voorbeeldprofiel → Step 3 → Reports. Download het issuerapport als Excel en het volledige reviewrapport als PDF. Bekijk de inhoud en desgewenst de optionele organisatienaam. Voorbereiding heeft de brede downloadchecks al uitgevoerd; geen verplicht dubbel volledig testrondje.

Na bevestiging commit/push; hervatten R04 zesprofielintegratie/gerichte bevindingen en R05 leesbaarheid. R07b blijft gekoppeld aan nog komende template/rules/reviewbesluiten. Alle andere uitgebreide M7-scope, inclusief multi-file/tabs/gezamenlijke ZIP, blijft behouden.
