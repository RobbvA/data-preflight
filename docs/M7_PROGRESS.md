# M7 — Voortgang en hervatpunt

Bijgewerkt: 28 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.4d

- M7.4c Price List-workflow lokaal toegepast/beoordeeld/gepusht. Remote main gecontroleerd op 29844484605246b4ffe5d108a3b0b8cecb20e6cf, `feat: integrate price list workflow with explicit notation and reports`. Geen nieuwe live-workflowcontrole geclaimd.
- Actieve stap: M7.4d — Stock Balances / On-hand Inventory v1.0.0 domein gebouwd/getest in voorbereiding. Lokale toepassing/bevestiging en commit/push van dit pakket nog open.
- Snapshotcontract: één absolute voorraad per product/magazijn, geen mutaties/delta/waardering/batches/serienummers/conversie. Alle vier velden verplicht. IDs/warehouse/unit alleen trim; expliciete quantityNotation en getypeerde quantityCells verplicht. Location is geen warehouse-alias.
- Nul en negatieve nul zijn Ready zonder waarschuwing; negatieve niet-nulhoeveelheden vallen buiten dit profiel. Alle complete product-magazijncombinaties met meerdere rijen blokkeren, ook bij gelijke, ontbrekende of ongeldige hoeveelheden/eenheden. EA/BOX geeft daarnaast stock-unit-conflict op alle betrokken rijen. Geen optellen of converteren.
- Exacte fixture: 10 rijen, 7 Blocked / 0 Needs review / 3 Ready; exportdata exact rijen 1/2/3 met hoeveelheden 10, 5.50 en 0. Geen interne key in output.
- Bewijs: 80 tests geslaagd (69 bestaande + 11 Stock), gerichte ESLint 0 fouten/warnings, TypeScript en diff --check geslaagd. Echte XLS/XLSX broncel-/mappingintegratie via de exacte adapter getest. Geen nieuwe browser/buildronde voor een nog niet gebruikte domeinmodule.
- Pakket: datapreflight-m7-4d-stock-balances-domain.zip; basis 2984448. Picker toont nog vijf profielen. Voorbeeldbestand is voorbereid in public/demo-data/stock-balances-example.csv. Details: docs/M7_4D_STOCK_BALANCES_DOMAIN.md.
- Exacte volgende actie: technische bestanden lokaal toepassen/bevestigen; daarna M7.4e Stock aansluiten als zesde profiel met bestaande layout/records, verplichte quantity notation, contextlifecycle, snapshotgrenzen, rapporten en echte downloads. Signatureherkenning Product/Price/Stock hoort bij die integratie.
- Vervolgens M7.4f zesprofielintegratie en M7.5 gehele-app-test; geen extra profielen of nieuwe polishronde buiten concrete bevindingen.
- OPEN vóór M7-eindacceptatie: bestaande Invoice-normalisatie 1.234→1234. Afzonderlijk expliciet notatie-/afwijscontract en regressie nodig in M7.5b of een eerdere gerichte side quest. Nieuwe Price/Stock-tests lossen dat niet stilzwijgend op.
- Geen actieve side quest. Nieuwe UI-keuzes alleen gericht en binnen de goedgekeurde presentatie.

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
| M7.4d | Stock-domein en exacte 7/0/3-fixture | Gebouwd/getest in voorbereiding; lokaal toepassen/bevestigen open |
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
