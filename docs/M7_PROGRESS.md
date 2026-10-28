# M7 — Voortgang en hervatpunt

Bijgewerkt: 28 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.4b

- M7.4a lokaal toegepast/bevestigd/gepusht. Remote main gecontroleerd op e09cb8e61c743e6be0cb6c04322d56be14800995, `feat: add exact decimal parsing and Excel source-cell handling`. Dit is broncode/pushbewijs; geen nieuwe live-workflowcontrole.
- Actieve stap: M7.4b — Price List / Item Prices v1.0.0 domein en elf-rijenfixture, gebouwd/getest in voorbereiding. Lokaal toepassen/bevestigen en commit/push van dit pakket nog open.
- Nieuw: priceListProfile met vereiste velden/aliases; expliciete context-runner runPriceListValidation; source-runner runPriceListSourceValidation bewaart numerieke celmetadata en blokkeert ongeldige mapping/ontbrekende notatie of sourceCells.
- Regels: alle velden verplicht; currency drie ASCII-letters uppercase zonder bestaancheck; gekozen strikte notatie; negatief Blocked; nul inclusief negatieve nul Needs review en exporteerbaar tenzij een ander issue blokkeert; alle complete/currency-geldige tupleduplicaten Blocked, ook als een prijs ongeldig is. Geen samenvoegen of identifierreparatie.
- Exact fixturebewijs: 11 rijen, 8 Blocked, 1 Needs review, 2 Ready; cleanRows exact bronrijen 1/2/3 met prijzen 12.50, 10.00 en 0. Geen interne sleutel in exportdata. Werkelijke browserdownload volgt M7.4c.
- Bewijs: 64 tests geslaagd (54 bestaande + 10 Price List), gerichte ESLint 0 fouten/warnings en TypeScript geslaagd. Geen browser/buildronde voor deze nog niet via UI gebruikte domeinmodule. Details: docs/M7_4B_PRICE_LIST_DOMAIN.md.
- Pakket: datapreflight-m7-4b-price-list-domain.zip; basis e09cb8e. Picker en bestaande vier profielen nog ongewijzigd. Voorbeeldbestand staat voorbereid in public/demo-data/price-list-example.csv.
- Exacte volgende actie: pakket lokaal toepassen en bevestigen. Daarna M7.4c: Price List zichtbaar aansluiten met dezelfde recordpresentatie; verplichte zichtbare notatiekeuze voor eigen bestand, zichtbaar voorbeeldpreset, reset/remap/saved-mapping-lifecycle, rapportcontext en echte downloads.
- Nieuwe zichtbare ontwerpkeuzes gericht afstemmen; geen redesign van geaccepteerde onderdelen. Price List volledig afronden vóór Stock.
- OPEN vóór M7-eindacceptatie: oude Invoice-normalisatie interpreteert 1.234 als 1234. Expliciet notatie-/afwijscontract kiezen en gericht corrigeren in M7.5b of eerdere afgebakende side quest. Nieuwe Price-tests bewijzen geen correctie van die bestaande route.
- Geen actieve side quest. Zesprofiel-eindtest blijft M7.5; daarna een ERP/data-gebruiker zelfstandig een eigen bestand laten verwerken.

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
| M7.4b | Price List-domein en exacte 8/1/2-fixture | Gebouwd/getest in voorbereiding; lokaal toepassen/bevestigen open |
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
