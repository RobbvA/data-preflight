# M7 R03 — Exportformaten op basis van officiële ERP-documentatie

31 oktober 2026 · basis remote `2e5c65b4a073ce598ac87f42480c48e8271bcc5a` · R01/R02 lokaal geaccepteerd en push onafhankelijk bevestigd. Dit document beschrijft voorbereid werk; lokaal toepassen/acceptatie, push en livecontrole van R03 volgen afzonderlijk.

## Onderzoek en keuze

Rob vroeg om meer exportkeuzes die in de ERP-wereld gangbaar/relevant zijn, met onderzoek en toepassing. Officiële importdocumentatie is gebruikt om ondersteunde werkvormen te bepalen. Dit is geen marktaandeelmeting of bewijs van koopbereidheid; productversie en importobject bepalen de uiteindelijke compatibiliteit.

| Formaat | Besluit | Onderbouwing |
| --- | --- | --- |
| CSV | Bouwen, puntkomma standaard en komma als keuze | AFAS ondersteunt tekstimport met scheidingstekens; NetSuite documenteert meerdere CSV-separators; Odoo ondersteunt CSV |
| Excel XLSX | Bouwen | Odoo documenteert XLSX-import; leesbare spreadsheetuitvoer voor controle, met expliciete tekstcellen voor behoud |
| Tabgescheiden TXT | Bouwen | AFAS noemt TXT met tabs expliciet; Microsoft Finance & Operations noemt tab-delimited brondata |
| TSV | Bouwen | Dezelfde tabgescheiden UTF-8-structuur onder herkenbare .tsv-extensie; geen apart ERP-contract of claim van universele .tsv-acceptatie |
| JSON | Bouwen voor scripts/integraties | Microsoft documenteert JSON voor OData; onze output is een generieke array met stringwaarden, geen OData/ERP-payload en geen claim van directe bestandsimport |
| XML | Bij de concrete ERP-template uitwerken | Microsoft/Exact kunnen XML gebruiken, maar een generiek XML-bestand zonder passend schema is geen importcompatibiliteit |
| PDF | Reviewrapport in R07 | Presentatie en overdracht, geen schone-data-importformaat |
| XLS / vaste breedte PRN | Niet toevoegen in R03 | Legacy- en vaste-positie-eisen vragen een specifiek contract; XLSX en bewezen tekstformaten vormen de huidige keuze |

Bronnen, geraadpleegd 31 oktober 2026:

- AFAS Profit, Importbestand opzetten: https://help.afas.nl/content/nl/se/App_Imp_Impdef_FileType.htm — vaste breedte, gescheiden CSV en tabgescheiden TXT; quote-/decimaalbeleid configurabel.
- AFAS importdefinitie: https://kb.afas.nl/help/NL/SE/App_Imp_viaNw_Impdef.htm — scheidingsteken, tabs, tekstquotes en decimaalteken zijn onderdeel van de importdefinitie.
- Oracle NetSuite, General CSV File Conventions: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N453326.html — separator moet overeenkomen met importinstelling; headers en referenties hebben eigen eisen.
- Odoo 19, Export and import data: https://www.odoo.com/documentation/19.0/applications/general/export_import_data.html — officiële zoekresultaattekst bevestigt CSV/XLSX; rechtstreeks ophalen time-out. Geen ruimere claim gebaseerd op die mislukte fetch.
- Microsoft Finance & Operations: https://learn.microsoft.com/nl-nl/dynamics365/fin-ops-core/dev-itpro/data-entities/data-management-integration-data-entity — bronbestanden CSV/XML/tab-delimited, JSON in OData-scenario. Pagina toont ook autorisatiebanner, relevante secties waren leesbaar.
- Microsoft Excel-limieten: https://support.microsoft.com/en-us/excel/excel-specifications-and-limits — 1.048.576 rijen inclusief kop, 16.384 kolommen, 32.767 tekens per cel. Een expliciete grensfout is nodig, geen stille afkap.
- OWASP CSV injection: https://github.com/OWASP/www-community/blob/master/pages/attacks/CSV_Injection.md — alleen quoten maakt formuleachtige tekst niet veilig bij spreadsheet-openen.

## Implementatiecontract

Eén `createExportDataSet` bepaalt headers, bronvolgorde en textwaarden uit de actuele rijen zonder blockers. Alle vijf writers gebruiken die dataset; interne normalized_invoice_key verdwijnt, ontbrekende cellen worden lege strings. Geen bronmutatie, revalidatie of alternatieve filtering per formaat. Reviewfilters blijven los van exportscope.

CSV gebruikt UTF-8 met BOM, alle waarden gequote, double quotes escaped, LF-recordscheiding, expliciete puntkomma of komma. TXT/TSV gebruiken dezelfde regels met een tab. Genormaliseerde decimalen blijven puntnotatie ongeacht de invoernotatie. Spreadsheetsoftware kan teksttypen raden bij direct openen van deze bestanden; de interface zegt dit.

XLSX heeft één Data-sheet, alle cellen (inclusief headers, IDs, decimalen en ISO-datums) zijn tekst met format @. Geen formulecellen, numerieke afronding of stil reconstructiebeleid. Target-import moet teksttypen accepteren of een eigen templatecontract krijgen. Excel-limieten worden vóór schrijven gecontroleerd.

JSON is een array van recordobjecten met dezelfde headers en uitsluitend stringwaarden. Daardoor geen precisieverlies door JSON-getallen; lege waarden blijven lege strings. Geen API-/ERP-schema of connector geclaimd.

Bij formuleachtige tekst in headers of waarden blokkeren CSV/TXT/TSV met een zichtbare melding, zonder apostrofs of andere bronwijzigingen. XLSX/JSON bewaren de tekst. Gewone negatieve decimaalwaarden blijven exporteerbaar. CSV-rapporten gebruiken dezelfde writer; fouten worden in de UI opgevangen. Voor validation-report met formuleachtig bronbestand-/kolomlabel wordt herstel van naam/header uitgelegd. Dit is gerichte exportbescherming, geen volledige securityaudit.

Gedeelde DataExportControls in beide workspaces: formaat, CSV-separator waar relevant, korte gebruiksuitleg en dezelfde export-/issueknoppen. Bronvervanging/reset/ongeldige mapping maakt de bestaande component ongedaan, zodat geen oude downloadkeuze/fout op een nieuwe bron blijft hangen. Geen localStorage voor brondata/exportkeuze.

Issue-report: exportbesluit is op hele rij gebaseerd. Een waarschuwing op een rij met een blocker wordt dus ook als uitgesloten gemarkeerd. Bestaande issue-/validationreports blijven CSV; XLSX/PDF-reviewrapporten volgen R07. Geen nieuwe dependency geïnstalleerd; bestaande SheetJS gebruikt.

## Verificatie

- `npm test`: 121 geslaagd, 0 mislukt (101 bestaande + 20 nieuwe exporttests).
- Nieuwe tests omvatten alle writers, beide CSV-separators, stabiele headers, IDs/lange decimalen/schaal/lege velden/Unicode/tabs/regeleinden, typevaste XLSX-cellen, formuleachtige tekst/headers, JSON-stringwaarden/prototypekeys, expliciete Excel-limieten, extensie/MIME/echte Blob-downloads/object-URL-opruiming, rijbrede issuerapportbesluiten en alle zes profielen. 1.000 rijen volledig teruggelezen per writer.
- Lint: 0 fouten en alleen de 2 bestaande warnings (Metadata in app/layout.tsx en _tone in DataSetPreview.tsx). Productiebuild inclusief TypeScript geslaagd.
- Productiebrowser: per profiel Invoice/Customer/Vendor/Product/Price/Stock de echte CSV-puntkomma, CSV-komma, XLSX, TXT, TSV en JSON gedownload en teruggelezen; onderling exact dezelfde kolommen/waarden/rijen en aantallen als scherm. Issue- en validationreports bleven geldig CSV bij een geselecteerd ander dataformaat.
- Eigen Invoice-bron: geen export vóór notatie; `0001`, `900719925474099312345.1234500`, `2.5000` en nul `0.00` exact in ieder formaat. Ongeldige rij ontbreekt; warning-only nul blijft inbegrepen. Ontbrekende mapping verwijdert exportbediening en herstelde mapping biedt actuele data.
- Eigen Product-bron met `=1+1` als omschrijving: CSV/TXT/TSV geblokkeerd met melding; XLSX expliciete tekstcel zonder formule en JSON bewaren exact `=1+1`. Geen stille neutralisatie. All-blocked bron kan geen dataformaat exporteren. Nieuwe bron/reset herstelt de standaardkeuze zonder oude foutmelding.
- 1440/390px: geen horizontale overflow; formaat/separator en acties bereikbaar, keyboard gebruikt. Exportsectie visueel gecontroleerd op beide breedtes. Geen fysieke telefoon geclaimd.
- Geen browserfouten of onverwachte/netwerkverzoeken met brongegevens geobserveerd; geen volledige securityaudit of rechtstreekse ERP-importtest.

Interne browserreproductie: m7-visual-preview/export-r03-check.cjs en export-r03-results.json. Screenshots uitsluitend voor visuele voorbereiding, niet als deliverable opgeslagen.

## Grenzen en volgende actie

R03 is voorbereid/getest, nog niet op Robs Windows-checkout of live beoordeeld. Formaatondersteuning is geen garantie op target-ERP import: veldnamen, relaties, versies, create/update en referenties blijven contractspecifiek. Geen nieuwe inputformaten toegevoegd: JSON/TXT/TSV zijn uitvoeropties. CSV-rapporten hebben nog geen eigen XLSX/PDF-keuze; dat volgt R07. Batch-ZIP volgt R11b.

Lokaal na toepassen: kies Invoice of Price → Try example, selecteer XLSX en controleer de export; probeer CSV met komma en bekijk de vijf formaten. Voorbereiding heeft de inhoudelijke matrix al uitgevoerd; geen verplicht volledig dubbel testrondje. Na bevestiging commit/push en R04 zesprofielintegratie/gerichte bevindingen, daarna R05 leesbaarheid.
