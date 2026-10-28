# M7 — Voortgang en hervatpunt

Bijgewerkt: 28 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.4c

- M7.4b lokaal toegepast/bevestigd/gepusht. Remote main gecontroleerd op b7e495b5133b8d69712597690951d7a716d0cb1e, `feat: add price list validation rules and fixtures`. Geen nieuwe live-workflowcontrole geclaimd.
- Actieve stap: M7.4c — volledige Price List-workflow gebouwd/getest in voorbereiding. Lokaal toepassen/beoordelen en commit/push/live van dit pakket nog open.
- Vijfde profiel aangesloten op bestaande layout en compacte recordpresentatie. Notatie staat bij Step 1. Voorbeeld krijgt zichtbaar point; elk eigen bestand (ook dezelfde bestandsnaam) begint zonder keuze. Geen resultaten/exports/rapport vóór geldige mapping en gekozen notatie. Remapping en saved-mapping-apply behouden uitsluitend de huidige bronkeuze; een nieuwe bron/reset/profielwissel wist die.
- Prijsbron gebruikt uitsluitend de exacte adapter en getypeerde sourceCells. Report bevat priceContext met de werkelijk gekozen notatie, bron/worksheet/mapping/aantallen, numerieke bronregels en niet-uitgevoerde ERP-/prijscontroles.
- Bewijs: 69 tests geslaagd; volledige lint 0 fouten/2 bekende warnings; productiebuild/TypeScript geslaagd. Productiebrowserchecks: vijf pickeropties, exacte 8/1/2 en 3 echte exportrijen, 9 issuerijen, rapportcontext/notatiewissel, eigen CSV/XLS/XLSX/worksheets, missing/duplicate mapping en herstel, saved mappings zonder notatiebypass, all-blocked/empty category, reset/switch, vertraagde Excel-completion, 1440px/390px/toetsenbord/focus en vier bestaande voorbeelden. Geen browserfouten of onverwachte netwerkrequests in de gecontroleerde flow.
- Pakket: datapreflight-m7-4c-price-list-workflow.zip; basis b7e495b. Volledig bewijs en grenzen: docs/M7_4C_PRICE_LIST_WORKFLOW.md. Fysieke telefoon en volledige zesprofiel-eindtest niet geclaimd.
- Exacte volgende actie: lokaal Price List → Try example (8 Blocked / 1 Needs review / 2 Ready), export met drie rijen en eigen upload die opnieuw notatie vraagt beoordelen. Na bevestiging Price List-checkpoint vastleggen en M7.4d Stock Balances-domein hervatten; pas daarna M7.4e volledige Stock-flow.
- Geaccepteerde header/bronkaart/recordkleuren blijven de basis; nieuwe wijzigingen alleen voor een concreet probleem. Geen actieve side quest.
- OPEN vóór M7-eindacceptatie: bestaande Invoice-normalisatie 1.234→1234. Afzonderlijk expliciet notatie-/afwijscontract en regressie nodig in M7.5b of eerdere gerichte side quest. Nieuwe Price-route is geen bewijs dat dit is opgelost.
- Zesprofiel-eindtest blijft M7.5; daarna gericht zelfstandig ERP/data-gebruikersonderzoek met eigen bestand.

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
| M7.4c | Price List volledige workflow | Gebouwd/getest in voorbereiding; lokaal beoordelen/push/live open |
| M7.4d | Stock-domein en exacte 7/0/3-fixture | Niet gestart |
| M7.4e | Stock volledige workflow | Niet gestart |
| M7.4f | Zesprofielintegratie | Niet gestart |
| M7.5a | Uitgebreide hele-app-test met testlog | Niet gestart |
| M7.5b | Bevindingen herstellen/gericht hertesten | Niet gestart |
| M7.5c | Definitieve docs, lokale checks, push en live | Niet gestart |
| M7.5d | Acceptatiecriteria afvinken en afsluiten | Niet gestart |

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

## Backlog buiten M7

Foutgroepering per regel; geannoteerde herstelbestanden; eigen product-/leverancier-/magazijnreferenties; beperkte organisatiespecifieke regelinstellingen; een concrete ERP-importbestemming; Warehouse/Location en orderregels; betalingen/accounts; verdere marktvalidatie. Outreach na M7 gericht op één doelgroep en één concreet profiel.

## Sessieregistratie

26 oktober 2026 — planronde: remote gecontroleerd op 130ccaf. Zesprofielscope expliciet gevraagd door Rob. Plan en voortgang voorbereid; geen applicatiecode gewijzigd en geen brede controles herhaald. Remote/documentatiestatus vóór toepassing blijft ouder. Volgende stap M7.2a.
