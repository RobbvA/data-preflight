# M7 — Voortgang en hervatpunt

Bijgewerkt: 31 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 3.2. Resterende uitvoering: [M7_REMAINING_PLAN.md](M7_REMAINING_PLAN.md).

## Actueel checkpoint — R03 exportkeuzes voorbereid/getest

- R01/R02 lokaal bevestigd; Rob kiest behoud van de vierkante notatiekeuzen. Remote push onafhankelijk gecontroleerd op `2e5c65b4a073ce598ac87f42480c48e8271bcc5a`, `fix: make invoice numbers explicit and exact`. Geen nieuwe liveacceptatie geclaimd.
- Rob vraagt meer relevante exportkeuzes, met onderzoek en toepassing. Officiële ERP-documentatie leidt tot CSV (puntkomma/komma), XLSX, tabgescheiden TXT/TSV en generiek JSON voor integraties. Ondersteuningsdocumentatie is geen marktaandeel- of vraagmeting. XML is schema/templategebonden; PDF blijft rapportwerk onder R07.
- R03 gebouwd/getest in voorbereiding: gedeelde stabiele exportdataset/writers en gedeelde bediening in beide workspaces voor zes profielen. Exacte waarden en dezelfde toegestane rijen per formaat. Expliciete XLSX-tekstcellen, Excel-limieten, JSON-stringwaarden en geen stille formule-neutralisatie. CSV/TXT/TSV met formuleachtige tekst blokkeren; veilige tekstuitvoer via XLSX/JSON. Issue-rapportbesluit volgt de hele rij.
- Bewijs: 121 tests geslaagd, lint 0 fouten/2 bekende warnings, productiebuild/TS geslaagd. Browser per profiel zes uitvoervarianten gedownload/teruggelezen; eigen exacte Invoice, formuleachtige Product-tekst, all-blocked, mapping/replace/reset, keyboard, 1440/390px en actuele CSV-rapporten. Geen onverwachte requests/page errors geobserveerd. Geen volledige R12-eindtest, ERP-proefimport of livecontrole.
- Pakket `datapreflight-m7-r03-export-formats.zip`; basis 2e5c65b. Lokale toepassing/acceptatie, push en live van R03 nog open. Details: [M7_R03_EXPORT_FORMATS.md](M7_R03_EXPORT_FORMATS.md).
- Exacte volgende actie: Rob past pakket toe en beoordeelt de vijf formaten in Step 3 (CSV heeft separatoroptie). Na bevestiging commit/push, vervolgens R04 zesprofielintegratie/gerichte bevindingen en R05 leesbaarheid. Geen nieuwe auditronde.
- Plan v3.2 behoudt alle uitgebreid afgesproken M7-scope, inclusief multi-file/tabs/gezamenlijke ZIP onder R11a/R11b. Nog niet gebouwd.
- Geen actieve side quest. ERP/object en commerciële grenzen worden bij R08/R11 besloten en blokkeren R04 niet.
- De onderstaande 28-oktoberstand en oorspronkelijke pakketten zijn historische registratie; dit checkpoint is leidend.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Historisch checkpoint — M7.4e (28 oktober)

- M7.4d lokaal toegepast/bevestigd/gepusht. Remote main gecontroleerd op faed293328be6534fd98e2dc8896e800a330e753, `feat: add stock balance validation rules and fixtures`. Geen nieuwe live-workflowcontrole geclaimd.
- Actieve stap: M7.4e — Stock Balances als zesde profiel volledig aangesloten, gebouwd/getest in voorbereiding. Lokale toepassing/beoordeling, commit/push en live van dit pakket nog open.
- Bestaande workspace/bronkaart/recordstijl behouden. Quantity notation bij Step 1 is verplicht voor iedere eigen bron; voorbeeld krijgt zichtbaar point. Exacte adapter en getypeerde quantityCells blijven bij de gemapte hoeveelheid. Report vereist eigen stockContext met quantityNotation en snapshotgrenzen.
- Snapshot: absolute voorraad per product/magazijn, geen mutatie/conversie/optellen. Nulvoorraad Ready zonder waarschuwing; duplicaten en EA/BOX-eenheidsconflicten blokkeren. Organisatie/snapshotdatum/ERP-codebestaan/echte voorraad worden niet geverifieerd.
- Bewijs: 86 tests geslaagd; lint 0 fouten/2 bekende warnings; productiebuild/TypeScript geslaagd. Productiebrowser: zes pickeropties, exact 7/0/3 en drie echte exportrijen, zeven issuerijen, nul Ready/lege review, punt-kommawissel, eigen CSV/XLS/XLSX/worksheets, broncelprecisie, conflicts/mapping/saved mappings, reset/switch/late Excel, desktop/390px/toetsenbord en bestaande vijf voorbeelden. Geen browserfouten of onverwachte netwerkrequests.
- Price- en quantity-notatie/referencecontext blijven profielspecifiek. Nieuwe eigen bron vraagt opnieuw keuze, zelfs bij dezelfde bestandsnaam. Saved mappings bewaren uitsluitend kolommen en kunnen de keuze niet omzeilen. Profielherkenning gebruikt sterke Stock/Price-signatures vóór Product; alleen Product ID bepaalt geen domein.
- Pakket: datapreflight-m7-4e-stock-balances-workflow.zip; basis faed293. Details/grenzen: docs/M7_4E_STOCK_BALANCES_WORKFLOW.md. Geen fysieke telefoon, volledige zesprofiel-eindtest of livecontrole geclaimd.
- Exacte volgende actie: lokaal Stock Balances → Try example: 7 Blocked / 0 Needs review / 3 Ready; export met drie rijen inclusief nul; eigen voorbeeldbestand vraagt opnieuw point. Na bevestiging checkpoint vastleggen en M7.4f zesprofielintegratie uitvoeren; daarna M7.5 gehele-app-test. Geen nieuwe profielen/polish zonder concrete bevinding.
- OPEN vóór M7-eindacceptatie: bestaande Invoice-normalisatie 1.234→1234. Expliciet notatie-/afwijscontract en gerichte correctie/regressies nodig in M7.5b of eerdere side quest. Nieuwe Price/Stock-route corrigeert die bestaande heuristiek niet stilzwijgend.
- Geen actieve side quest. Na M7 gericht zelfstandig ERP/data-gebruikersonderzoek met eigen bestand.

## Werkpakketten

| ID | Uitkomst | Stand |
| --- | --- | --- |
| Behouden UX | Stapkoppen, unitcontrole, leesbaarheid, off-white, tabaccenten | Geaccepteerd/gepusht; deployment success gemeld |
| M7.1a | Baseline, scope, documentatie en werkafspraken | Lokaal toegepast/gepusht als 66ab1b5 |
| M7.1b | Price- en Stock-contract met exacte fixtures | Vastgelegd in plan; uitvoerbare tests volgen in M7.4 |
| M7.2a | Gericht Product-voorstel desktop/390px | Beoordeeld; brede richting ingetrokken, alleen records behouden |
| M7.2b | Compacte Product-recordkaarten, bestaande werkruimte behouden | Lokaal geaccepteerd en gepusht in 971b8f9; livecontrole apart |
| M7.3a | Compacte recordpresentatie consequent over bestaande vier | Lokaal geaccepteerd en gepusht in 971b8f9; livecontrole apart |
| M7.3b | Feedback/herstel en vierprofielcheckpoint | Lokaal bevestigd en gepusht als f8e185b; livecontrole apart |
| M7.4a | Strikte decimalen en gerichte Excelbescherming | Lokaal bevestigd/gepusht als e09cb8e; UI-integratie volgt per profiel |
| M7.4b | Price List-domein en exacte 8/1/2-fixture | Lokaal bevestigd/gepusht als b7e495b |
| M7.4c | Price List volledige workflow | Lokaal bevestigd/gepusht als 2984448; livecontrole apart |
| M7.4d | Stock-domein en exacte 7/0/3-fixture | Lokaal bevestigd/gepusht als faed293 |
| M7.4e | Stock volledige workflow | Remote push op 29 oktober bevestigd als 3fe3b2d; nieuwe livecontrole open |
| M7.4f | Zesprofielintegratie | Niet gestart; uitgevoerd onder R04 na getallen en export |
| M7.5a | Uitgebreide hele-app-test met testlog | Niet gestart; uitgebreid onder R12 |
| M7.5b | Bevindingen herstellen/gericht hertesten | Doorlopend per R-pakket en R12–R13 |
| M7.5c | Definitieve docs, lokale checks, push en live | Niet gestart; definitief onder R14 |
| M7.5d | Acceptatiecriteria afvinken en afsluiten | Niet gestart; nieuwe v3-criteria onder R14 |

## Checkpoint invullen bij verandering of einde sessie

- Actieve stap en sessiedoel:
- Gedaan / exact gewijzigd:
- Bewijs: voorbereiding / lokale bevestiging / push / live (afzonderlijk):
- Bestanden en pakketnaam:
- Open check of blocker:
- Exacte volgende actie:
- Actieve side quest, doel en stopcriterium:
- M7-hervatpunt na side quest:

Markeer stappen alleen afgerond met toepasselijk bewijs; voorbereid is niet lokaal toegepast. Een afgewezen pakket telt niet als behouden functionaliteit.

## Scope en werkpakketten vanaf 29 oktober

R00-plan en R01/R02 zijn lokaal bevestigd/gepusht als 2e5c65b. R03 is voorbereid/getest; lokale toepassing/push nog open. R04–R14 inclusief R11a/R11b zijn gepland en niet afgerond. Zie het leidende resterende plan voor afhankelijkheden en per-pakket-acceptatie. Oude uitsluitingen van ERP-template, beperkte referenties/custom rules en praktijktest zijn vervallen door Robs expliciete scopewijziging. Accounts/betalingsinfrastructuur, live ERP-connectors, cloudopslag, algemene rule builder, broncelbewerking, orders en extra generieke profielen blijven buiten scope. Geen werk stil schrappen of automatisch toevoegen.

## Sessieregistratie

26 oktober 2026 — planronde: remote gecontroleerd op 130ccaf. Zesprofielscope expliciet gevraagd door Rob. Plan en voortgang voorbereid; geen applicatiecode gewijzigd en geen brede controles herhaald. Remote/documentatiestatus vóór toepassing blijft ouder. Volgende stap M7.2a.

29 oktober 2026 — uitgebreide M7 gepland op verzoek van Rob. Remote Stock-push bevestigd op 3fe3b2d. Documentatiepakket v3 voorbereid; geen applicatiecode of nieuwe tests. Hervatten bij R00 toepassen/baseline en R01 Invoice.

31 oktober 2026 — bouwsessie R01/R02: Invoice-getalcontract en exacte financiële vergelijkingen gebouwd; gedeelde checkboxuitstraling voor notatie aangesloten. 101 tests, lint, build en browserbewijs in M7_R01_INVOICE_NUMBERS.md. Plan v3.1 bevat multi-file/tabs/ZIP. Lokale toepassing/push/live open; hervatten R03 na bevestiging van dit pakket.

31 oktober 2026 — R03 na Robs exportverzoek: formats onderzocht, vijf uitvoerformaten plus CSV-separator gebouwd, 121 tests en echte zesprofiel-downloadchecks geslaagd. Lokaal toepassen/push/live nog open. Hervatten R04 na bevestiging.
