# M7 — Voortgang en hervatpunt

Bijgewerkt: 28 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.4a

- M7.3b is lokaal toegepast, bevestigd en gepusht. Remote main gecontroleerd op f8e185bec9858c3da249c756f5ecf579bc8d80e6, `fix: improve upload cancellation and recovery feedback`. Dit is broncode/pushbewijs; geen nieuwe volledige live-workflowcontrole.
- Actieve stap: M7.4a — strikte decimaaldecoder, opt-in exacte CSV/XLSX/XLS-invoer en botsingsvrije tuples. Gebouwd/getest in voorbereiding; pakket lokaal toepassen/bevestigen, commit/push apart.
- Notatie: tekst volgt uitsluitend de expliciet gekozen punt-/kommagammatica. Geen Number/parseFloat, groeperingsreparatie, interne-whitespacewijziging of prijsafronding. Tekstschaal blijft behouden; negatieve nul verliest uitsluitend het minteken.
- Excel: nieuwe leesroute bewaart celtype, formule en opmaak. Numerieke cellen gebruiken hun opgeslagen waarde zonder weergaveafronding; exponenten worden uitgeschreven. Formule/datum/boolean/fout/percentage afgewezen voor nieuwe numerieke velden. Onveilige numerieke magnitude vereist exacte tekst. Ongecachete formules blijven als afwijsbare cellen behouden.
- De vier bestaande profielen gebruiken deze route nog niet. Price List/Stock sluiten in M7.4b/c/d/e aan op sourceCells; die metadata mag bij mapping niet verloren gaan. Notatiegate, UI/rapport en veldspecifieke probleem/hersteltekst volgen bij integratie.
- Bewijs: bestaande 39 + 15 nieuwe tests geslaagd; gerichte ESLint 0 fouten/warnings; TypeScript geslaagd; geen extra volledige build/browserronde bij deze ongebruikte numerieke primitives. Details en API-contract: docs/M7_4A_NUMERIC_INPUT.md.
- Pakket: datapreflight-m7-4a-exact-numeric-input.zip; basis f8e185b. Aan de interface verandert in dit pakket niets.
- OPEN VÓÓR M7-EINDACCEPTATIE: bestaande Invoice-normalisatie bevestigt 1.234 → 1234. Die is in dit pakket bewust niet stil gewijzigd. Bij M7.5b (of eerder als gerichte side quest) expliciet notatie-/afwijscontract kiezen en implementeren, met regressie voor bestaande Invoice-bestanden; geen claim dat Invoice nu al exact of ambiguïteitsvrij is.
- Exacte volgende actie: technische bestanden lokaal toepassen en bevestigen; daarna M7.4b Price List-domein met exacte 8 Blocked / 1 Needs review / 2 Ready-fixture en 3 exportrijen. Geen nieuwe UI-keuzes zonder gerichte afstemming.
- Daarna volledige Price-workflow, pas daarna Stock. M7.5 blijft de zesprofiel-eindtest; na M7 zelfstandig eigen bestand door een ERP/data-gebruiker laten verwerken.
- Geen actieve side quest.

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
| M7.4a | Strikte decimalen en gerichte Excelbescherming | Technische basis gebouwd/getest; lokaal toepassen/bevestigen open |
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
