# M7 — Voortgang en hervatpunt

Bijgewerkt: 28 oktober 2026. Plan: [M7_PLAN.md](M7_PLAN.md), versie 2.0.

## Eerst lezen bij een sessiestart

"Bouwsessie start nu" betekent: actuele voortgang/code/remote controleren, één concreet subdoel noemen en dat uitvoeren. Geen nieuwe volledige audit of roadmapronde. Bij een side quest eerst hieronder het exacte hervatpunt vastleggen.

## Actueel checkpoint — M7.3b

- M7.2b en M7.3a zijn door Rob lokaal toegepast, beoordeeld en gepusht. Commit 971b8f97c3d68bbcdf751de8228b56c17f9ee85f (28 oktober 2026), `feat: unify compact review records across four profiles`. PowerShell toont schone werkmap en main gelijk aan origin/main; commit ook opgehaald via GitHub. Geen nieuwe live-workflowcontrole geclaimd.
- Actieve stap: M7.3b — feedback/herstel en vierprofielcheckpoint, voorbereid; lokale acceptatie/push/live van dit pakket apart vaststellen.
- Gericht gewijzigd: Cancel file tijdens het lezen gebruikt de bestaande reset/request-ID-guard; annulering voorkomt verwerking/toepassing van een later resultaat, zonder te claimen dat onderliggende bestands-I/O fysiek wordt afgebroken. Header-only/lege gegevens geven een concrete herstelactie. Invoice noemt dezelfde ondersteunde bestandsformaten als de overige profielen.
- Voorbereidingsbewijs: 39 tests geslaagd; lint 0 fouten/2 bekende warnings; productiebuild/TypeScript geslaagd; vierprofiel-browsercheckpoint geslaagd zonder browserfouten. Details en beperkingen in docs/M7_3B_CHECKPOINT.md.
- Bestaande mappingguards, saved-mappingfeedback, worksheetkeuze, profielwisselbevestiging en afgewezen-unitlijstfeedback zijn behouden en gericht gecontroleerd. De geaccepteerde header/bronkaart, records, kleuren en layout zijn de basis.
- Pakket: datapreflight-m7-3b-feedback-recovery.zip; basis 971b8f9. Zie docs/M7_3B_CHECKPOINT.md voor werkelijk testbewijs en grenzen.
- Volgende actie: lokaal pakket toepassen en herstelmelding bij een CSV met alleen koppen bekijken; vervolgens M7.3b bevestigen en M7.4a hervatten.
- M7.4a: maak numerieke interpretatie expliciet, onderzoek het voorbeeld 1.234 in de bestaande normalisatie, test punt/komma/duizendtalscheiding en bescherm numerieke Excelwaarden tegen weergaveafronding. Geen onbewezen aanname dat het gemelde getalvoorbeeld opnieuw is geverifieerd. Price List en Stock Balances nog niet gebouwd.
- Ready betekent uitsluitend de geïmplementeerde controles; zonder actieve unitlijst wordt alleen aanwezigheid van de basiseenheid gecontroleerd. Brede zesprofiel-eindtest blijft M7.5; daarna zelfstandig eigen bestand door een ERP/data-gebruiker laten verwerken.
- Geen actieve side quest. Nieuwe zichtbare ontwerpkeuzes vooraf afstemmen; kleine wijzigingen krijgen gerichte controles, brede controles eenmaal op het afgesproken checkpoint.

## Werkpakketten

| ID | Uitkomst | Stand |
| --- | --- | --- |
| Behouden UX | Stapkoppen, unitcontrole, leesbaarheid, off-white, tabaccenten | Geaccepteerd/gepusht; deployment success gemeld |
| M7.1a | Baseline, scope, documentatie en werkafspraken | Lokaal toegepast/gepusht als 66ab1b5 |
| M7.1b | Price- en Stock-contract met exacte fixtures | Vastgelegd in plan; uitvoerbare tests volgen in M7.4 |
| M7.2a | Gericht Product-voorstel desktop/390px | Beoordeeld; brede richting ingetrokken, alleen records behouden |
| M7.2b | Compacte Product-recordkaarten, bestaande werkruimte behouden | Lokaal geaccepteerd en gepusht in 971b8f9; livecontrole apart |
| M7.3a | Compacte recordpresentatie consequent over bestaande vier | Lokaal geaccepteerd en gepusht in 971b8f9; livecontrole apart |
| M7.3b | Feedback/herstel en vierprofielcheckpoint | Voorbereid; lokaal toepassen/bevestigen open |
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
