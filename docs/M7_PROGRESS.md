# M7 — Voortgang en hervatpunt

Bijgewerkt: 31 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 3.4. Resterende uitvoering: [M7_REMAINING_PLAN.md](M7_REMAINING_PLAN.md).

## Actueel checkpoint — R06 zoeken/filteren/sorteren voorbereid

- R05d door Rob lokaal bevestigd. Laatst onafhankelijk geverifieerde remote blijft fbe5790; geen nieuwe R05d-push of liveacceptatie geclaimd. Rob vraagt efficiënter bouwen: één samenhangend pakket, gerichte controle en documentatie per werkpakket.
- R06 gebruikt één pure reviewfilterfunctie en gedeelde bediening over alle zes profielen. Zoeken in ID/rij/bronwaarde/genormaliseerde waarde/probleem/reden/herstel, optioneel alle statussen; filters ernst/veld/issuetype combineren op dezelfde issue. Sorteren op prioriteit, bronrij of aantal issues heeft stabiele bronrij-tiebreak. Elke rij verschijnt eenmaal.
- Oorspronkelijke statusaantallen blijven behouden. Showing X of Y telt rijen binnen huidige status of alle statussen; apart aantal issues in die rijen. Details blijven bij dezelfde bronrij na sorteren. Reset/lege-uitkomstherstel aanwezig. Nieuwe bron/profiel/reset neemt geen oude filters over. Zoek-/filterwaarden worden niet opgeslagen.
- Validatieregels en data-/rapportexportscope onveranderd: filteren maakt uitsluitend de reviewlijst kleiner, geen bronmutatie of alternatieve validatierun. Data-export bevat nog alle rijen zonder blockers.
- Bewijs: 138 tests geslaagd (134 bestaand + 4 gerichte filtertests), productiebuild/TypeScript en lint geslaagd (0 fouten/2 bestaande warnings). Gerichte browserchecks alle zes: zoeken, gecombineerde issuefilters, stabiele Details/bronrijnummers, counts/reset/bronisolatie, 1440/390 en daadwerkelijke onveranderde export. Geen volledige R04-herhaling of nieuwe livecontrole.
- Pakket datapreflight-m7-r06-review-filters.zip vereist het lokaal bevestigde R05d. Geen dependencies. Lokale toepassing/beoordeling, commit/push en live van R06 open. R05d en R06 kunnen na bevestiging samen worden vastgelegd.
- Exact vervolg na bevestiging: R08 één concrete ERP-template/importbestemming specificeren, met officiële eisen en echt voorbeeldbestand; daarna R09. R07b-contextuitbreiding volgt zodra template/rules/besluiten bestaan. Brede M7 met multi-file/tabs/ZIP, praktijktest en R12–R14 blijft gepland. Geen nieuwe audit of groene suite herhalen zonder relevante wijziging.

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

R00-plan en R01/R02 zijn bevestigd/gepusht als 2e5c65b; R03 als efc917c. R07a + R05a lokaal bevestigd/gepusht als 3a40d60. R04-integratie geslaagd in voorbereiding; checkpoint/testbestanden nog toepassen/push. R05–R14 inclusief R07b en R11a/R11b zijn nog niet afgerond. Zie het leidende resterende plan voor afhankelijkheden en per-pakket-acceptatie. Oude uitsluitingen van ERP-template, beperkte referenties/custom rules en praktijktest zijn vervallen door Robs expliciete scopewijziging. Accounts/betalingsinfrastructuur, live ERP-connectors, cloudopslag, algemene rule builder, broncelbewerking, orders en extra generieke profielen blijven buiten scope. Geen werk stil schrappen of automatisch toevoegen.

## Sessieregistratie

26 oktober 2026 — planronde: remote gecontroleerd op 130ccaf. Zesprofielscope expliciet gevraagd door Rob. Plan en voortgang voorbereid; geen applicatiecode gewijzigd en geen brede controles herhaald. Remote/documentatiestatus vóór toepassing blijft ouder. Volgende stap M7.2a.

29 oktober 2026 — uitgebreide M7 gepland op verzoek van Rob. Remote Stock-push bevestigd op 3fe3b2d. Documentatiepakket v3 voorbereid; geen applicatiecode of nieuwe tests. Hervatten bij R00 toepassen/baseline en R01 Invoice.

31 oktober 2026 — bouwsessie R01/R02: Invoice-getalcontract en exacte financiële vergelijkingen gebouwd; gedeelde checkboxuitstraling voor notatie aangesloten. 101 tests, lint, build en browserbewijs in M7_R01_INVOICE_NUMBERS.md. Plan v3.1 bevat multi-file/tabs/ZIP. Lokale toepassing/push/live open; hervatten R03 na bevestiging van dit pakket.

31 oktober 2026 — R03 na Robs exportverzoek: formats onderzocht, vijf uitvoerformaten plus CSV-separator gebouwd, 121 tests en echte zesprofiel-downloadchecks geslaagd. Lokaal toepassen/push/live nog open. Hervatten R04 na bevestiging.

31 oktober 2026 — R03 lokaal voltooid/gepusht als efc917c. Op Robs verzoek R07a aansluitend gebouwd: issue-CSV/XLSX en volledig review-XLSX/PDF; 134 tests en browser-/PDFbewijs geslaagd. Lokaal toepassen/npm install/beoordelen/push nog open. Daarna R04/R05.

31 oktober 2026 — R05a op Robs verzoek naar voren gehaald: exporttabs, contextuele hulp en optionele spotlightgids. Cumulatieve R07a/R05a-oplevering, lokaal/push/live open. Daarna R04 en resterende R05.

31 oktober 2026 — R04 alle zes profielen in één testronde op Robs verzoek. Remote 3a40d60 bytegetrouw vergeleken; 134 tests/build/lint en brede browserketenchecks geslaagd. Geen applicatiefix nodig. Checkpoint/testpakket nog toepassen/push; hervatten resterende R05.

31 oktober 2026 — R04-push bevestigd op 3d6eecd. R05b Product-typografieproef voorbereid na Robs akkoord. Alleen recordtekst/labels, geen layout-/validatie-/exportwijziging. Lokale beoordeling/push open; na akkoord consequent uitrollen en proefvariant verwijderen.

31 oktober 2026 — R05b lokaal geaccepteerd. R05c dezelfde leesbare recordtekst via gedeelde component over zes profielen voorbereid; tijdelijke opt-in verwijderd. Gerichte checks geslaagd; apply/push/live open.

31 oktober 2026 — Nieuwe sessie: fbe5790 en 148 uitgangsbestanden geverifieerd. Aangeleverde feedback binnen M7 verwerkt. R05d labels/contrast, mappingvervolgstappen en actuele hulp voorbereid; gerichte UI/exportchecks geslaagd. Lokale acceptatie/push open; daarna R06.


31 oktober 2026 — R05d/R06 en de gerichte rustige-presentatiepakketten zijn door Rob lokaal voltooid verklaard; laatste refinement plaatst Problem/Fix/Why op alle kaarten. Eerdere push door Rob gemeld, actuele remote-SHA in deze ronde niet opnieuw vastgesteld. Geen automatische correcties: Rob vindt dit te foutgevoelig.

31 oktober 2026 — R08-contract en R09a eerste ERP-template voorbereid: Odoo 19 company contacts als optionele overlay op Customer. Exact-voorbeeld niet beschikbaar; Rob heeft Odoo goedgekeurd en staat verdere onderbouwde templates toe. ID-transformatie, gebundelde landenreferentie, blockers, CSV/XLSX en rapportcontext aangesloten. 142 tests, gerichte lint en productiebuild geslaagd. Zie M7_R08_ODOO_CONTRACT.md. Lokale toepassing/push/live/proefimport nog open. R09 custom rules/verdere referenties blijven open; geen M7-eindacceptatie. Hervatten na lokale beoordeling: resterend R09, daarna R10/R07b volgens plan.
