# M7 — Voortgang en hervatpunt

Bijgewerkt: 27 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.3a

- Rob heeft het compacte Product-pakket lokaal toegepast en de recordpresentatie expliciet goedgekeurd. M7.2b is lokaal geaccepteerd; commit/push/live nog niet bevestigd.
- Actieve stap: M7.3a — dezelfde compacte recordpresentatie doorvoeren naar Customer, Vendor en Invoice.
- Uitvoering: gedeelde ReviewRecord-presentatie, Product als dunne bestaande adapter. Alle vier gebruiken dezelfde neutrale #1a1a18 kaart, 10px verticale padding, identificatie/probleem/herstel direct zichtbaar en uitklapbare velden/Why/overige issues. Invoice houdt alle bestaande zichtbare rijvelden (zonder interne normalisatiesleutel) en actieadvies beschikbaar onder Details. Sortering, categorieën, validatie en exportberekeningen blijven ongewijzigd.
- Bestaande workspace-layout, header/profiel-bronkaart, mapping, reviewbediening, unitcontrole en export blijven behouden. De eerdere brede hiërarchie is ingetrokken en mag niet alsnog worden uitgerold.
- Pakket: datapreflight-m7-3a-compact-records-all-profiles.zip; voorbereiding, lokale toepassing/bevestiging, push en live zijn afzonderlijke checkpoints.
- Laatst bevestigde plancommit: 66ab1b5e1c589a9c0f21f2a325536dd410d5c01f (eerdere sessie). Geen nieuwe remote- of livecontrole voor deze wijziging.
- Price List en Stock Balances zijn nog niet gebouwd. Zesprofielscope en hele-app-eindtest blijven behouden.
- Voorbereidingsbewijs: TypeScript geslaagd; gerichte ESLint nul fouten en de bekende _tone-warning. Browserchecks alle vier profielen: categorieën en Details open/dicht, toetsenbord, 1440px/390px zonder overflow, echte exports (Product 001/005; Customer C-1001/C-1003; Vendor 001/003/005; Invoice 3 rijen gelijk aan getoond aantal), geen browserfouten. Geen volledige suite/build of M7-eindtest voor deze presentatieaanpassing herhaald.
- Exacte volgende actie: pakket toepassen; Customer/Vendor/Invoice voorbeeld en Details kort lokaal beoordelen. Na bevestiging M7.3b: gerichte feedback/herstel-check, daarna M7.4a strikte decimalen/Excelbescherming.
- Geen actieve side quest. Kleine presentatievragen krijgen kleine wijzigingen en gerichte controles; zichtbare nieuwe ontwerpkeuzes eerst afstemmen.

## Werkpakketten

| ID | Uitkomst | Stand |
| --- | --- | --- |
| Behouden UX | Stapkoppen, unitcontrole, leesbaarheid, off-white, tabaccenten | Geaccepteerd/gepusht; deployment success gemeld |
| M7.1a | Baseline, scope, documentatie en werkafspraken | Lokaal toegepast/gepusht als 66ab1b5 |
| M7.1b | Price- en Stock-contract met exacte fixtures | Vastgelegd in plan; uitvoerbare tests volgen in M7.4 |
| M7.2a | Gericht Product-voorstel desktop/390px | Beoordeeld; brede richting ingetrokken, alleen records behouden |
| M7.2b | Compacte Product-recordkaarten, bestaande werkruimte behouden | Lokaal toegepast/geaccepteerd door Rob; push/live niet bevestigd |
| M7.3a | Compacte recordpresentatie consequent over bestaande vier | Gebouwd in voorbereiding; lokale beoordeling open |
| M7.3b | Feedback/herstel en vierprofielcheckpoint | Niet gestart |
| M7.4a | Strikte decimalen en gerichte Excelbescherming | Niet gestart |
| M7.4b | Price List-domein en exacte 8/1/2-fixture | Niet gestart |
| M7.4c | Price List volledige workflow | Niet gestart |
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
