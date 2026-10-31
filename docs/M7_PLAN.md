# M7 — Professional UX, Price List & Stock Balances

Planversie: 3.2 · 31 oktober 2026 · eigenaar: Rob.

**Actuele resterende scope, volgorde en acceptatiecriteria:** [M7_REMAINING_PLAN.md](M7_REMAINING_PLAN.md). Rob heeft de productuitbreidingen op 29 oktober expliciet binnen M7 geplaatst. Inclusief Robs aanvulling van 30 oktober: multi-file (maximaal vijf), bestandstabs en gezamenlijke ZIP-export. Die aanvulling vervangt strijdige uitsluitingen, de oude afsluitvolgorde en het eerdere besluit om praktijktests pas na M7 te doen. De onderstaande versie-2-contracten en historie blijven als basis behouden; ze zijn geen actuele takenlijst.

Actueel bewijs: remote main `3fe3b2d` bevat M7.4e. De 86 geslaagde tests zijn historisch voorbereidingsbewijs; deze documentatieronde draait geen nieuwe applicatiechecks.

Dit plan vervangt voor M7 de eerdere eindscope van vijf profielen. Rob heeft op 26 oktober expliciet zes profielen gevraagd. Het zesde profiel wordt in dit plan afgebakend als Stock Balances / Voorraadstanden. De reeds afgesproken Price List-regels blijven behouden. Dit document is een uitvoeringsplan, geen verklaring dat geplande functionaliteit al beschikbaar is.

Voortgang en exact hervatpunt: [M7_PROGRESS.md](M7_PROGRESS.md). De algemene roadmap verwijst hiernaar; sessiehistorie blijft in SESSION_LOG.md. Geen afzonderlijke, concurrerende takenlijst bijhouden.

## 1. Eindresultaat en scope

M7 levert zes zorgvuldig begrensde profielen: Invoice 1.0.2, Customer 1.0.0, Vendor 1.0.0, Product / Material 1.0.0, Price List / Item Prices 1.0.0 en Stock Balances 1.0.0. Versies van bestaande profielen blijven alleen gelijk als hun normalisatie- en validatiegedrag gelijk blijft.

Daarnaast: herkenbare taken, duidelijke hiërarchie, leesbare resultaten, begrijpelijke herstelacties, consistente feedback en transparante exports op desktop en mobiel. Step 1 Field mapping → Step 2 Review → Step 3 Export blijft intact. Automatische validatie is geen menselijke beoordeling; een complete mapping bewijst geen inhoudelijk juiste koppeling.

Binnen scope: CSV/XLSX/XLS, worksheets, mappinghergebruik, expliciete decimaalnotatie voor de twee nieuwe profielen, exacte tekstuele decimalen, geschikte Excel-celwaarden, samengestelde duplicaten, review, exports, rapportcontext, regressies en een brede eindtest van de hele app.

Buiten scope: AI, accounts, betalingen, cloudopslag, ERP-connectors, dashboard/projectbeheer, in-app brondata bewerken, algemene rule builder, automatische valuta- of eenheidsconversie, voorraadmutaties, waardering, batches/serienummers, Warehouse/Location-stamprofiel en orderregels. Ook geen nieuwe brede reference-engine. De bestaande Product-unitcheck blijft behouden. Outreach en onafhankelijke gebruikerstests volgen na M7; ze zijn geen blokkade voor technische afronding.

## 2. Uitgangspunt: behouden en niet opnieuw doen

Remote main is op 26 oktober gecontroleerd op 130ccaff2f7464da353895b395b9bb16b2b626e8. Commit 790f648 bevat de geaccepteerde stapkoppen, compacte unitcontrole, warmere tekstkleur en leesbaarheidsverbeteringen. Commit 130ccaf bevat uitsluitend de subtiele tabaccenten. Vercel meldt voor beide een succesvolle deployment; dat is geen nieuwe volledige live-workflowtest.

Vier profielen werken; Price List en Stock Balances zijn nog niet gebouwd. De laatste complete behouden suite telt 39 geslaagde tests. De laatste brede voorbereiding had nul lintfouten, twee bestaande warnings en een geslaagde productiebuild inclusief TypeScript. Dit zijn historische controles, niet opnieuw uitgevoerde checks voor deze planwijziging.

Behoud de reeds geaccepteerde grotere koperkleurige stapkoppen, #e5dac8 off-white, compacte optionele Product-unitcontrole met zichtbare status, resultaat-/exportleesbaarheid en rood/geel/groen in de tabkoppen. De eerdere brede header- en kaartredesigns zijn afgewezen. Een nieuw voorstel moet dus een concreet, klein verschil ten opzichte van de geaccepteerde basis tonen; het oude voorstel geldt niet als goedgekeurd ontwerp.

Niet herhalen zonder reden: de volledige oorspronkelijke audit, de Excel-headerbotsingsfix, bestaande domeinregels en de tabkleurwijziging. De vijf Excel-headerregressies en alle andere bestaande tests blijven onderdeel van de suite.

## 3. Onderzoek omzetten in toetsbare productkeuzes

De aangeleverde concurrentie- en reviewsignalen zijn hypotheses voor onze keuzes, geen bewijs van actuele tekortkomingen bij alle concurrenten, vraag naar zes profielen of betalingsbereidheid. We kopiëren geen complete importer en claimen geen unieke privacyfunctionaliteit.

| Signaal of gebruikersprobleem | M7-antwoord | Bewijs bij afronding |
| --- | --- | --- |
| Veel configuratie voordat iemand kan starten | Herkenbare taaknamen, korte profielomschrijving, voorbeeld en beperkte verplichte opties | Zes voorbeelden starten zonder schema- of rule-builderconfiguratie; eigen bestand heeft alleen relevante keuzes |
| Onrustige en volle foutlijsten | Identificatie + hoofdprobleem scanbaar; reden en herstel begrijpelijk; overige velden ondergeschikt | Desktop/390px en fixture met veel issues; geen cruciale fout alleen achter details |
| Onduidelijk hoe brondata hersteld moet worden | Probleem → reden → concrete herstelactie, met bronrij en betrokken veld | Ontbrekend veld, duplicaat en onleesbaar getal doorlopen: bron corrigeren, heruploaden, ander resultaat |
| Onzekerheid over wat meegaat | Exacte exportaantallen, warning-inclusie en blocker-exclusie bij hoofdactie | Getoonde aantallen vergelijken met werkelijk gedownloade inhoud |
| Moeilijke vergelijking met referentielijsten | Bestaande begrensde Product-unitcheck goed vindbaar houden, status en grenzen expliciet | Actief, afwezig, afgewezen en verwijderd controleren; geen nieuwe join-engine |
| Onzekerheid over validatiebereik | Profielversie, bron, worksheet, mapping, notatie/reference en beperkingen zichtbaar | Validation details en rapport komen overeen met de uitgevoerde run |

Foutgroepering per regel, geannoteerde herstelbestanden, eigen product-/leverancier-/magazijnlijsten, herbruikbare organisatiespecifieke regels en een concrete ERP-bestemming blijven na M7 op de onderzoeksbacklog. Voorraadstanden verplaatst door Robs expliciete scopewijziging als enige van deze kandidaten naar M7.

## 4. Werkpakketten en volgorde

Een werkpakket is een controleerbare eenheid, geen vaste sessieduur. Een korte sessie mag een deel afronden; een langere sessie mag aansluitende pakketten uitvoeren. Bij iedere sessiestart kiezen we één actief subdoel en leveren we één bruikbaar checkpoint. Niet wachten met bouwen op een perfect ontwerp.

### M7.1 — Baseline en definitieve profielcontracten

**M7.1a — Status en scope vastleggen.** Uitkomst: dit plan, voortgangsregister en consistente hoofddocumentatie. Zesprofielbesluit, behouden UX, afgewezen voorstellen en oude verificatie staan apart. Klaar wanneer documentatiepakket lokaal toegepast/bevestigd is en het volgende subdoel vaststaat. Planning kan intussen als werkafspraak gelden; niet aannemen dat het pakket al is toegepast of gepusht.

**M7.1b — Contracten vastleggen.** Price List uit §6 behouden; Stock Balances uit §7 als beperkte productkeuze vastleggen. Uitkomst: velden, notatie, duplicaatsleutels, Excel-beleid en fixtures met exacte verwachtingen. Klaar in voorbereiding wanneer alle uitkomsten ondubbelzinnig zijn; de uitvoerbare tests volgen bij de domeinpakketten. Nieuwe feiten mogen een expliciete contractwijziging rechtvaardigen; geen stille afwijkingen in code.

### M7.2 — Eén representatieve Product-werkruimte

**M7.2a — Gericht voorstel, desktop en 390px.** Probleem: taak, bron, mapping, resultaten en export hebben nog niet overal de juiste nadruk. Toon de geaccepteerde Product-basis met alleen de voorgestelde verschillen, voor (1) onvolledige mapping en (2) complete mapping met blockers. Laat broncontext, mapping, optionele unitstatus, review en export samen zien. Behoud alle stappen en herstelacties. Klaar wanneer Rob gericht heeft kunnen beoordelen wat verandert en waarom. Eén gerichte feedbackronde, daarna bouwen; extra rondes alleen voor concrete onopgeloste problemen. Geen herhaling van het afgewezen brede redesign.

**M7.2b — Geaccepteerde verschillen in Product bouwen.** Beperkte wijziging van broncontext/hiërarchie en recordweergave alleen waar M7.2a dat onderbouwt. Identificatie en hoofdprobleem voorop; informatie niet onbedoeld verwijderen of dubbel tonen. Geen tablogica, domeinregels of exportscope veranderen. Controle: juiste nadruk bij missende en complete mapping, unitcontrole actief/afwezig/fout, details open/dicht, desktop/390px en toetsenbord. Productierisico bepaalt eventuele lint/buildcheck. Klaar met volledig bestandspakket en lokale bevestiging; brede uitrol pas daarna.

### M7.3 — Bestaande workflow consequent maken

**M7.3a — Geaccepteerde UX over vier profielen toepassen.** Gebruik bestaande gedeelde onderdelen; Invoice mag zijn eigen workspace houden. Pas alleen de goedgekeurde principes toe: context, staphiërarchie, leesbare records, exportaantallen/hoofdactie en bereikbare aanvullende rapporten. Controle: vier voorbeelden, mappingherstel, lege categorie, exportgrenzen en gewijzigde gedeelde bediening. Klaar wanneer dezelfde handeling consistent heet en werkt, met verklaarbare domeinverschillen.

**M7.3b — Feedback en herstel afronden.** Controleer landing/profieloverlay, eigen upload, worksheet, opgeslagen mappings, loading, fouten, reset/replace en profielwissel. Voeg ontbrekende feedback toe voor lezen, opslaan/toepassen en afgewezen referentie. Voorkom dubbele acties die een ongeldige toestand veroorzaken. Geen extra marketing of instellingen. Check toetsenbord/focus/Escape en smal scherm. Bundel hier de eerste brede regressie, lint en build voor de gewijzigde vierprofielbasis.

### M7.4 — Twee nieuwe profielen, één voor één afmaken

**M7.4a — Strikte decimalen en gerichte Excel-bescherming.** Bouw alleen de benodigde gedeelde primitives: strikte tekstdecoder, exacte decimaaltekst en geschikte broncelinformatie voor gemapte numerieke velden. Geen algemene instellingenengine of globale raw:true-omschakeling. Uitkomst: directe tests voor grammatica, precisie, XLS/XLSX-opmaak, celtypen, tuplebotsingen en niet-muteren; bestaande parser/Invoice-regressies blijven groen. Klaar wanneer numerieke bronwaarden niet door weergegeven Excel-afronding veranderen en tekst niet stil wordt gerepareerd.

**M7.4b — Price List-domein.** Profiel, aliases, normalisatie, regels, exacte elf-rijenfixture, samengestelde duplicaten, status en export. Nog geen tweede profiel tegelijk bouwen. Tests voor punt/komma, nul/negatief, ontbrekende waarden, ambigue mapping, case/trim, lange decimalen, eenheden/lijsten, onvolledige keys en herhaalbaarheid. Klaar bij 8 Blocked / 1 Needs review / 2 Ready en precies drie exportrijen.

**M7.4c — Price List volledige workflow.** Picker, voorbeeld/eigen CSV/XLSX/XLS, worksheets, mapping/saved mappings, verplichte notatie, reviewidentiteit, downloads en getypeerde rapportcontext. Notatie ontbreekt: geen resultaten of data-export; toon herstelactie. Nieuwe eigen bron: keuze reset; dezelfde bron remappen: keuze blijft. Test oud async-resultaat, reset, profielwissel, notatiewijziging en echte exports. Daarna complete suite/lint/build en lokale acceptatie. Price List is pas functioneel klaar na deze stap.

**M7.4d — Stock Balances-domein.** Velden/aliases, beperkte snapshotsemantiek, strikte hoeveelheden, product-magazijnduplicaten en eenheidsconflicten. Gebruik bewezen primitives uit Price List waar de semantiek gelijk is; nulhoeveelheid is Ready, nulprijs blijft Needs review. Voeg exacte tien-rijenfixture en regressies toe. Klaar bij 7 Blocked / 0 Needs review / 3 Ready, exact drie exportrijen en gerichte conflicttests.

**M7.4e — Stock Balances volledige workflow.** Dezelfde aansluitingen als Price List, met hoeveelheidsnotatie, magazijncontext en snapshotgrenzen in UI/rapport. Controleer vooral verwarring met Product/Price List, repetitieve productcodes over magazijnen, unitconflicten, opgeslagen mappings en lifecycle. Daarna complete suite/lint/build en lokale acceptatie. Uitkomst: zes werkende profielen; zes zichtbare pickeropties alleen is onvoldoende.

**M7.4f — Zesprofielintegratie.** Loop landing, zoekbare picker, zes voorbeelden, switch/reset/replace, notatie/reference-isolatie, rapporten en exportlabels na. Oude opgeslagen mappings blijven bruikbaar. Geen profiel krijgt nepinstellingen of restcontext van een ander profiel. Klaar bij voorspelbare status en herstel over profielgrenzen; daarna geen nieuwe featureontwikkeling meer binnen M7.

### M7.5 — Uitgebreide eindtest en oplevering

**M7.5a — Hele-app-test uitvoeren.** Volg de matrix in §9, met resultaten per testcase en gebruikte commit/pakket. Test alle zes profielen en werkelijke downloads, geen beperkte demo. Klaar wanneer elk vereist scenario Pass, Fail of onderbouwd Not applicable heeft; Blocked door omgeving is geen Pass.

**M7.5b — Bevindingen herstellen en gericht hertesten.** Eerst dataverlies, verkeerde classificatie/export, bypasses, stale state en onbereikbare bediening. Alleen daarna concrete leesbaarheid/herstelproblemen. Na een fix: falende case plus geraakte regressie; brede checks opnieuw als gedeelde logica verandert of de definitieve release verschilt van de geteste basis. Geen nieuwe polish-backlog uit smaakverschillen.

**M7.5c — Documentatie, lokaal checkpoint, push en livecontrole.** Werk README/ROADMAP/PROJECT_STATUS/PRODUCT_VISION/SESSION_LOG en voortgang bij naar de echte toestand. Lever complete gewijzigde bestanden in ZIP. Rob past toe en bevestigt de gebundelde lokale eindchecks. Review diff, gerichte git add, commit en push; pas daarna remote HEAD en deployment afzonderlijk verifiëren. Live smoke voor zes voorbeelden, Price/Stock eigen bestand, werkelijke exportinhoud, mobiel en de gewijzigde browserroutes. Nieuwe runtimefout onderzoeken; niet automatisch hele audit herhalen.

**M7.5d — Afsluiting.** Elk criterium in §10 afvinken met bewijs of expliciet geaccepteerde niet-blokkerende beperking. Maak een korte outreach-testtaak voor na M7, gericht op één doelgroep en profiel. Geen berichten versturen zonder opdracht; outreach hoeft niet plaats te vinden om M7 technisch af te ronden.

## 5. Architectuur en datastroom

Behoud: profiel → bestand → worksheet → mapping → relevante opties → normaliseren → valideren → review → export/rapport.

Hergebruik parseCsv-adapters, mappingStatus/ProfileMappingPanel, savedMappings, ReviewStatusControls, ExportSummary, exportData en validationReport. Customer/Vendor/Product blijven dezelfde geconfigureerde workspace delen. Voor Price/Stock beperkte configuratie en expliciete getypeerde uitvoeringscontext toevoegen waar nodig; geen brede generieke-workspaceherbouw. Concrete modules mogen gedeeld worden als twee gerealiseerde profielen dezelfde semantiek hebben.

Normalisatie en validatie blijven buiten UI. Profile ID/version, mapping, bron en context behoren bij dezelfde run. Nieuwe async-bronnen volgen bestaande request-ID-guards. Bronrijen niet muteren. Geen stille profielherkenning op alleen Product ID: Price List en Stock krijgen een herkenbare veldcombinatie vóór de Product-fallback, met tests voor ambigue/partiële headers.

Rapportcontext gericht typeren: Product unitReference; Price priceNotation; Stock quantityNotation. Invoice/Customer/Vendor krijgen geen verzonnen opties. Saved mappings blijven uitsluitend mapping/configuratie zoals nu; geen notatiekeuze, bronrijen of referentielijst toevoegen.

Excel: bestaande profielen houden hun huidige route. Voor gemapte prijs/hoeveelheid onderscheid maken tussen tekstcel en opgeslagen numerieke celwaarde. Tekst volgt de gekozen grammatica; een echte numerieke Excel-cel heeft zelf geen komma/puntnotatie. Leg dit kort uit bij de keuze. Gebruik de opgeslagen waarde zonder celopmaakafronding, groepeertekens of valutasymbolen. Standaard numerieke waarden zo nodig vanuit exponentweergave naar decimaaltekst uitschrijven; geen extra afronding. Behoud tekstuele schaal; Excel-getallen beloven geen originele schaal of precisie die Excel al heeft verloren.

Blokkeer voor de nieuwe numerieke velden formule-, datum-, boolean- en foutcellen met concrete herstelactie; we evalueren geen formules en vertrouwen geen cache. Niet-eindige waarden en onveilig grote numerieke waarden buiten de veilige integer-magnitude vereisen een tekstcel met de exacte waarde. Geen garanties over verloren bronprecisie. Gericht testen in XLS én XLSX, met gewone getallen, 0.00-opmaak, grouping, valutaopmaak en wetenschappelijke weergave. Nummeropmaak mag de opgeslagen numerieke waarde niet veranderen. Een percentcel als percentage afwijzen: percentages vallen buiten prijs/voorraadaantallen.

De nieuwe bronroute moet interne spaties in identifiers en getaltekst behouden; trimmen mag, interne whitespace stil samenvouwen of verwijderen niet. Test dit expliciet: de bestaande parser normaliseert ruimer. Geen ongeteste globale parserwijziging.

28 oktober 2026 — bevestigd bestaand Invoice-risico: normalizeNumber("1.234") levert "1234". De nieuwe Price/Stock-primitives gebruiken deze heuristiek niet. De bestaande Invoice-route is hiermee nog niet ambiguïteitsvrij: vóór M7-eindacceptatie een expliciet notatie-/afwijscontract vastleggen en gericht implementeren (M7.5b of eerdere gerichte side quest), inclusief regressie op bestaande bestanden. Dit open punt mag niet verdwijnen achter geslaagde tests voor de nieuwe profielen.

## 6. Price List / Item Prices v1.0.0

ID: price-list. Eén organisatiecontext, één vlak bestand. Eén prijs per product + prijslijst + valuta + eenheid. Geen staffels, geldigheidsperioden, korting of berekening.

Alle velden verplicht: product_id, price_list_id, currency, unit, unit_price. Product/prijslijst/eenheid trimmen; codes tekstueel behouden. Currency trimmen en uppercase; uitsluitend drie ASCII-letters, geen bestaancheck. Identifiers houden aanwezige voorloopnullen; geen verdwenen nullen reconstrueren.

Aliases: Product ID / Product Code / Item Code / SKU / Artikelnummer; Price List / Price List Code / Prijslijst / Prijslijstcode; Currency / Currency Code / Valuta; Unit / UOM / Unit of Measure / Eenheid; Unit Price / Price / Eenheidsprijs / Prijs. Meerdere plausibele bronkolommen: expliciete menselijke keuze, geen stille eerste match.

Notatie voor tekst na trim: punt `^-?[0-9]+(?:\.[0-9]+)?$`, komma `^-?[0-9]+(?:,[0-9]+)?$`. Gehele getallen toegestaan. Geen +1, .5, 12., duizenden, symbolen, wetenschappelijke tekst of interne spaties. Geen vaste decimalenlimiet. Negatief niet-nul: Blocked. Iedere representatie van nul inclusief -0/-0.00: Needs review en exporteerbaar; minteken bij export verwijderen, fractieschaal behouden. Punt in export, geen Number/parseFloat voor tekstuele bedragen. Geen onnodig verwijderen van decimale nullen.

Eigen bestand: zichtbare keuze verplicht vóór prijsvalidatie/export. Voorbeeld: punt vooraf ingesteld en zichtbaar. Keuze blijft bij remapping en saved-mapping-apply op dezelfde bron, verdwijnt bij nieuw eigen bestand/reset/profielwissel, herberekent bij wijziging en staat in UI/rapport. Saved mappings kunnen de keuze niet omzeilen.

Duplicaatkey: JSON.stringify van de getrimde, case-insensitieve tuple [product_id, price_list_id, currency, unit]. Alleen volledige keys met geldige valutavorm doen mee; ontbrekende/ongeldige keyvelden veroorzaken hun eigen fout, geen misleidende lege-keyduplicaten. Een ongeldige prijs maakt een verder geldige key niet vrij van duplicaatcontrole. Alle betrokken rijen Blocked bij gelijke of verschillende prijzen. Andere lijst of eenheid toegestaan. Geen deduplicatie of interne key in export.

| Rij | Product | Prijslijst | Valuta | Eenheid | Prijs | Resultaat |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 001 | RETAIL | EUR | EA | 12.50 | Ready |
| 2 | 001 | WHOLESALE | EUR | EA | 10.00 | Ready |
| 3 | 002 | RETAIL | EUR | EA | 0 | Needs review |
| 4 | 003 | RETAIL | EUR | KG | -1.00 | Blocked |
| 5 | 004 | RETAIL | EUR | EA | twelve | Blocked |
| 6 | leeg | RETAIL | EUR | EA | 5.00 | Blocked |
| 7 | 005 | RETAIL | EURO | EA | 5.00 | Blocked |
| 8 | 006 | RETAIL | EUR | leeg | 5.00 | Blocked |
| 9 | 007 | RETAIL | EUR | EA | 9.95 | Blocked |
| 10 | 007 | retail | eur | ea | 10.95 | Blocked |
| 11 | 008 | leeg | EUR | EA | 5.00 | Blocked |

Exact: 11 rijen, 8 Blocked, 1 Needs review, 2 Ready; export rijen 1/2/3; één warning-only rij inbegrepen, acht rijen uitgesloten. Aparte fixtures: komma, ontbrekende prijs, verkeerde notatie, ambigue mapping, identieke/verschillende duplicaatprijzen, andere eenheden/lijsten, botsingsgevoelige identifiers en Excelprecisie.

Recordidentiteit toont product, prijslijst, valuta en eenheid. Unit-price zichtbaar. Foutmelding noemt verwachte notatie en herstel in het bronbestand. Geen claim dat codes in ERP bestaan of valuta bij een prijslijst hoort.

## 7. Stock Balances / Voorraadstanden v1.0.0

Nieuwe beperkte productkeuze in dit plan, geen universele ERP-importspecificatie. ID: stock-balances. Eén organisatie en één momentopname per bronbestand. Eén rij geeft de absolute aanwezige hoeveelheid van een product in een magazijn, in de opgegeven eenheid. Het is geen mutatie of delta. Geen afzonderlijk locatie-, batch-, serienummer-, eigenaar-, reserverings-, datum- of waarderingsveld in v1. Snapshotmoment en organisatie worden niet geverifieerd.

| Veld | Verplicht | Aliases | Gedrag |
| --- | --- | --- | --- |
| product_id | Ja | Product ID, Product Code, Item Code, SKU, Artikelnummer | Tekst, alleen trim |
| warehouse_id | Ja | Warehouse, Warehouse Code, Warehouse ID, Magazijn, Magazijncode | Tekst, alleen trim |
| unit | Ja | Unit, UOM, Unit of Measure, Eenheid | Tekst, alleen trim; geen conversie |
| quantity | Ja | Quantity, Stock Quantity, On Hand, On-hand Quantity, Aantal, Voorraad | Strikte gekozen punt-/kommanotatie |

Geen alias Location: daarmee zouden we magazijn en onderliggende locatie stil verwarren. Mappingambiguïteit vraagt menselijke keuze. Notatie en Excel-beleid volgen §5/§6, met eigen zichtbaar label quantity notation en getypeerde rapportcontext. Geen organisatiespecifieke decimalenlimiet of regels als EA alleen geheel; zulke regels zijn onbekend zonder productstamcontext.

Regels: ontbrekend verplicht veld, onleesbare hoeveelheid of negatieve niet-nulhoeveelheid → Blocked. Niet-negatieve getallen inclusief nul/-0 → Ready als andere checks slagen. Nulvoorraad is normaal en krijgt dus geen kunstmatige waarschuwing. De interface legt uit dat negatieve snapshots buiten dit profiel vallen; negatieve voorraad is hiermee niet universeel ongeldig verklaard.

Duplicaatkey is product_id + warehouse_id, getrimd/case-insensitief en botsingsvrij als tuple. Alle betrokken rijen Blocked, ook bij identieke hoeveelheden. Eenheid is hier géén extra sleutel: hetzelfde product in hetzelfde magazijn tweemaal in EA en BOX mag geen twee onafhankelijk Ready snapshots opleveren. Bij verschillende eenheden expliciet een eenheidsconflict melden; niet optellen of converteren. Hetzelfde product in een ander magazijn is wel toegestaan. Alleen complete product-magazijnkeys doen mee; ontbrekende hoeveelheid/eenheid op een verder volledige key mag een dubbel product-magazijn niet verbergen.

| Rij | Product | Magazijn | Eenheid | Hoeveelheid | Resultaat |
| --- | --- | --- | --- | --- | --- |
| 1 | 001 | WH-A | EA | 10 | Ready |
| 2 | 001 | WH-B | EA | 5.50 | Ready |
| 3 | 002 | WH-A | KG | 0 | Ready |
| 4 | 003 | WH-A | EA | -1 | Blocked |
| 5 | 004 | WH-A | EA | ten | Blocked |
| 6 | leeg | WH-A | EA | 5 | Blocked |
| 7 | 005 | leeg | EA | 5 | Blocked |
| 8 | 006 | WH-A | leeg | 5 | Blocked |
| 9 | 007 | WH-A | EA | 2 | Blocked |
| 10 | 007 | wh-a | ea | 3 | Blocked |

Exact: 10 rijen, 7 Blocked, 0 Needs review, 3 Ready; export rijen 1/2/3; nul warning-only rijen, zeven uitgesloten. Aparte cases: -0, ontbrekende hoeveelheid, komma, lange decimalen, gelijke duplicaten, EA/BOX-conflict, onvolledige keys, andere magazijnen, tuplebotsingen, voorloopnullen en identieke/ambigue Product/Price/Stock-headers.

Recordidentiteit toont product én magazijn, hoeveelheid en eenheid. Rapport bevat profielversie, bron/worksheet/mapping, hoeveelheidsnotatie, aantallen en de snapshotgrenzen. Geen bestaancheck voor product/magazijn, geen check tegen echte voorraad, geen automatische vergelijking met eerder geladen bestanden en geen ERP-importgarantie.

## 8. Bouwsessies, side quests en hervatten

Bij "bouwsessie start nu" of vergelijkbare formulering:

1. Lees M7_PROGRESS.md, actuele relevante code en remote HEAD. Controleer bestaande werkbestanden; overschrijf geen lokale wijzigingen. In deze omgeving kan Robs Windows-checkout niet worden gezien; vraag alleen gericht om status/diff als dat voor veilig toepassen nodig is.
2. Meld maximaal kort: vorige afgeronde stap, huidige stap en één concreet sessiedoel met controleerbare einduitkomst. Niet opnieuw het hele plan presenteren.
3. Bouw de eerstvolgende onafgeronde stap; herhaal voltooid werk alleen bij gewijzigde code, nieuwe bevindingen of ontbrekend bewijs.
4. Lever wijzigingspakket met volledige nieuwe/gewijzigde bestanden in relatieve projectmappen, echte ZIP-naam, PowerShell-plaatsing en korte gerichte lokale check met verwachte uitkomst. Geen node_modules/.next/.git/credentials of volledige repo. Verwijderingen expliciet en uitsluitend met gecontroleerde paden instrueren.
5. Leg checkpoint vast voordat we overstappen of stoppen. Een sessie hoeft niet altijd een commit op te leveren; een logisch afgerond checkpoint wel. Commit/push alleen na toepasselijke opdracht, lokale bevestiging en reviewbare diff. Rob heeft de ZIP/PowerShell-werkwijze als standaard gekozen.

Side quest op verzoek van Rob direct oppakken zonder hem opnieuw te laten kiezen tussen milestone en side quest. Leg eerst vast: huidig werkpakket, laatste bewezen toestand, pending pakket/check, exacte volgende actie. Noteer sidequestdoel en afrondingscriterium. Is de side quest klein en raakt zij de taak, dan mag die in hetzelfde pakket; anders apart houden om gericht herstel mogelijk te maken. Na afronding aanbieden/uitvoeren wat Rob vraagt; bij terugkeer naar M7 het bewaarde hervatpunt nemen. Geen eindeloze herinneringen terwijl hij bewust een andere taak kiest.

Voortgangsregister bevat: actieve stap, doel, bewijs, bestanden/pakket, nog nodige lokale bevestiging, commit en deploy, open blocker, side quest en eerstvolgende actie. Status per werkpakket: niet gestart / voorbereid / getest in voorbereiding / lokaal bevestigd / gepusht / live gecontroleerd / afgerond of geblokkeerd. Niet iedere interne helper hoeft live; per pakket staan toepasselijke bewijsfasen apart.

Na een stop zonder bijgewerkt bestand kan het laatste chatbericht aanvullend bewijs zijn, maar niet automatisch belangrijker dan latere code. Bij een nieuw gesprek: plan/voortgang uit repo lezen. Zolang het documentatiepakket niet is toegepast is dat nog niet gegarandeerd; meld die grens eerlijk. Geen belofte van foutloos automatisch geheugen tussen gesprekken.

Planwijziging: alleen Robs expliciete scopewijziging of een aantoonbaar noodzakelijk implementatiebesluit. Noteer datum, reden, gevolg en vervangen besluit. Nieuwe ideeën niet vanzelf aan acceptatiecriteria toevoegen. Bij verifieerbaar risico keuzes benoemen met Critical/Improvement/Good; geen kunstmatige blocker voor kleine cosmetiek.

## 9. Uitgebreide eindtest van de hele app

Maak bij M7.5 een testlog met testcase-ID, profiel, bronfixture, omgeving/viewport, verwachte uitkomst, werkelijk resultaat, bewijs, datum en exacte commit of pakketbasis. Status Pass/Fail/Not applicable/Blocked. Alleen werkelijk uitgevoerde controles afvinken. Een smalle desktopviewport is geen fysieke telefoontest; noteer een fysieke telefoon apart als Rob die gebruikt.

### 9.1 Geautomatiseerde basis en nieuwe domeinchecks

Behoud alle 39 tests: regression 11, vendor 7, excel-headers 5, saved-mappings 6, product 6, unit-reference 4. Voeg betekenisvolle nieuwe tests toe, geen vast nieuw testenaantal als succesdoel.

Nieuwe dekking: beide exacte fixtures en exports; elke verplichte waarde; mappingguards/ambiguïteit; komma/punt; afgewezen getalvormen; nul/negatief; decimale precisie; identifiers/spaties; tuples en alle betrokken duplicaten; prijsherhaling over lijsten/eenheden; voorraadhervatting over magazijnen en unitconflict; Excelceltypen/opmaak/precisie in XLS/XLSX; headerbotsingen; profielherkenning; runcontext/rapport; niet-muteren en herhaalbaarheid. Tests voor notatie-lifecycle/saved-mapping-bypass waar zinvol in logica; browsercheck blijft nodig voor de volledige interactie.

Brede checkpoints: na M7.3, na Price-integratie, na Stock-integratie en op de definitieve releasebasis. Tijdens kleine stappen alleen relevante checks. De uiteindelijke suite, lint en productiebuild inclusief TypeScript moeten slagen. Geen nieuwe lintwarnings; twee bestaande warnings mogen blijven met naam en locatie.

### 9.2 Functionele matrix voor alle zes profielen

Voor ieder profiel afzonderlijk:

- F01: profiel kiezen en bijpassend voorbeeld laden; aantallen/identiteit kloppen.
- F02: eigen CSV met normale en foutieve rijen, inclusief tekstuele voorloopnullen.
- F03: eigen XLSX met andere kolomvolgorde, meerdere gevulde worksheets en bewust gekozen sheet.
- F04: XLS-invoer; daarnaast kritieke numerieke opmaakcases uitgebreid voor Price/Stock.
- F05: verplichte mapping verwijderen, dubbele kolomtoewijzing en herstel zonder herupload; validatie/export niet beschikbaar bij ongeldige mapping.
- F06: mapping opslaan, toepassen, vervangen, verwijderen, reload; ontbrekende kolom/corrupte opslag herstellen. Opslagisolatie per profiel en profielversie controleren.
- F07: Blocked/Needs review/Ready inclusief bewust gekozen lege categorie en handmatig collapse; filter wijzigt export niet. Profielen zonder waarschuwingen krijgen een bewuste lege reviewtest.
- F08: detail toont probleem/reden/herstel en juiste bronrij/identiteit; case met meerdere issues en bronherstel/herupload.
- F09: all-blocked, all-ready en warning-only waar domeinmatig mogelijk; export disabled/enabled correct. Niet kunstmatig een waarschuwing toevoegen om een testcase te vullen.
- F10: werkelijke data-export, issue report en Validation Report downloaden; velden/waarden/volgorde, aantallen, uitgesloten blockers en context vergelijken met verwachtingen.
- F11: zelfde input/worksheet/mapping/versie/context tweemaal uitvoeren en downloads vergelijken; geen onnodige timestamps of bronmutatie.
- F12: reset, replace, profielwissel met bevestigen/annuleren en nieuwe bron; geen oude resultaten of settings lekken.

Gedeeld daarnaast: geen profiel geselecteerd, zoekbare overlay zonder layoutverschuiving, lege/kapotte/niet-ondersteunde bron, geen gevulde sheet, ongeldige sheet, bestand lezen/loading, snel vervangen/resetten/wisselen en oude async-completion. Werkelijke netwerkrequests inspecteren bij nieuwe eigen bestandsroutes, export en unitreference; geen bronrijen in localStorage of uitgaande data. Noteer bestaande assetrequests apart en claim geen volledige securityaudit.

Product-specifiek: unitreference afwezig/actief/ongeldig/reading, vervangen/verwijderen, onbekende unit, cancellation/stale read, reset/switch/reload; status zichtbaar als details dicht zijn; context klopt met export.

Price/Stock-specifiek: notatie ontbreekt/gekozen/gewijzigd, voorbeeldpreset, nieuw eigen bestand, remapping/saved mapping, reset/switch; resultaten en rapport volgen dezelfde actuele notatie. Echte Excel-numerieke cellen versus tekstcellen met komma/punt apart controleren. Price elf-rijenfixture en Stock tien-rijenfixture exact. Geen overschrijving door oude uploads.

### 9.3 UX, mobiel, toetsenbord en grotere lijsten

Desktop circa 1440px én 390px voor alle zes profielvoorbeelden en hun gewijzigde bediening. Geen horizontale overflow of onbereikbare knoppen; essentiële tekst blijft leesbaar. Lange bestandsnamen, headers en codes mogen niet breken. Test mappingoverlay, picker, saved mappings, unit/notatieopties, reviewdetails, export en rapporten.

Toetsenbord: logische tabvolgorde, zichtbare focus, labels, Enter/Space, Escape en focusherstel in picker/mapping, geen toetsenbordval. Status nooit alleen kleur. Nieuwe automatische feedback waar nodig als toegankelijke statusmelding; geen volledige toegankelijkheidscertificering claimen.

Een deterministische fixture met bijvoorbeeld 1.000 rijen en meerdere issues per rij controleert dat lijsten, details, sortering, categorieën en export bruikbaar blijven. Registreer omgeving en waargenomen duur; dit is een representatieve belastingcheck, geen bewezen bestandsgrootte- of prestatielimiet. Geen virtuele lijst of nieuw filterframework zonder concrete noodzaak.

### 9.4 Uitvoering en bewijslast

De assistent doet voorbereiding en geautomatiseerde/haalbare browserchecks. Rob bevestigt het toepassen en krijgt gebundelde lokale scenario's voor ontbrekend of lokaal afhankelijk bewijs. Geen nodeloze herhaling van alle tests bij ieder ZIP-pakket. De eindtest mag over sessies verdeeld worden; de testlog onthoudt het hervatpunt.

Wanneer een omgeving niet bereikbaar is: markeer de case Blocked of nog te doen; vraag de benodigde gerichte lokale controle. Geen localhost van Rob als getest claimen. Vercel success is deploymentbewijs; functionele livecontrole is een aparte stap. Een productiestatische route moet ook na refresh correct laden.

## 10. Definition of done en stopregel

M7 is klaar wanneer:

- Zes profielen hun expliciete contract uitvoeren, met volledige workflow.
- Price fixture: 8/1/2 en export 3; Stock fixture: 7/0/3 en export 3.
- Verplichte notatie niet te omzeilen is, exact wordt verwerkt en wordt gerapporteerd.
- Geen nieuwe stille afronding, whitespace-reparatie, tuplebotsing, bronmutatie of stale-statelek optreedt.
- Alle zes profielen de geaccepteerde UX toepassen; profiel/bron/taak, probleem/herstel en exportscope zijn duidelijk.
- Alle bestaande en relevante nieuwe tests slagen; lint heeft geen nieuwe warnings/fouten; productiebuild/TypeScript slaagt.
- De vereiste hele-app-testcases zijn afgehandeld en Critical-bevindingen opgelost; concrete noodzakelijke UX-herstelpunten opgelost.
- Documentatie actueel is; lokaal toepassen/bevestigen, push en livecontrole aantoonbaar zijn.
- Open beperkingen eerlijk benoemd zijn en outreach als volgende leerstap staat, zonder marktvalidatie te claimen.

Stopregel: een geslaagde acceptatiecontrole opent geen nieuwe automatische polishronde. Niet-blokkerende ideeën naar backlog. Zes profielen zijn scope, geen vervanging voor kwaliteit. Als tijd/complexiteit uitloopt: een expliciete scopebeslissing met Rob, geen stil schrappen en geen onbegrensd doorbouwen.

## 11. Bronnen en onderzoekstatus

Gebruikersaanvulling 26 oktober 2026 is de basis voor het volledige concurrentieoverzicht. Dit plan heeft niet alle reviews opnieuw onderzocht. Oude reviews blijven gedateerde signalen.

Op 26 oktober gericht opnieuw gelezen:

- ERPNext Stock Reconciliation: https://docs.frappe.io/erpnext/stock-reconciliation — item, magazijn en te zetten hoeveelheid illustreren de snapshottaak; ERPNext bevat ook waardering/batches die wij uitsluiten. De gekozen negatieve-voorraad- en unitconflictregels zijn DataPreflight-productkeuzes.
- ERPNext Item Price: https://docs.frappe.io/erpnext/item-price — item/prijslijst en UOM ondersteunen de taakafbakening; geen claim dat ons profiel het volledige ERPNext-importformaat is.
- Dromo FAQ: https://developer.dromo.io/faqs — Private Mode bevestigt dat lokale browserverwerking niet uniek is.
- OpenRefine Goal Posts: https://openrefine.org/docs/technical-reference/goal-posts — prioriteiten op basis van de 2024-survey benoemen complexiteit van reconciliation en lokale datasets. Geen bewijs van algemene actuele concurrentietekorten.

Overige aangeleverde bronnen, in deze planronde niet opnieuw geverifieerd: https://flatfile.com/docs/core-concepts/workbooks ; https://docs.oneschema.co/docs/intro ; https://csvbox.io/features/ ; https://www.g2.com/products/flatfile/reviews ; https://www.g2.com/products/oneschema/reviews . Het eerdere Odoo-artikel wordt niet als een nieuwe geslaagde broncontrole gepresenteerd.

## 12. Besluitenlog

- 2026-10-25: geaccepteerde eerste UX behouden; brede header-/reviewkaartontwerpen afgewezen en teruggedraaid.
- 2026-10-25: subtiele statusaccenten uitsluitend in tabkoppen alsnog geaccepteerd en gepusht als 130ccaf.
- 2026-10-26: Rob breidt M7 expliciet uit van vijf naar zes profielen; dit plan kiest het eerder sterkste vervolg, beperkte Stock Balances.
- 2026-10-26: zesde profiel is een niet-negatieve snapshot per product-magazijn, unit als attribuut en conflictcheck; dit is de nieuwe voorgestelde contractbasis voor implementatie.
- 2026-10-26: vaste werkpakketten, hervatpunt/sidequestregistratie en uitgebreide zesprofiel-eindtest opgenomen. Geen applicatiecode of nieuwe testresultaten bij deze planning.
