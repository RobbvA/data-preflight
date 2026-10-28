# M7.4c — Volledige Price List-workflow

Datum: 28 oktober 2026. Basis: b7e495b5133b8d69712597690951d7a716d0cb1e plus dit pakket. Voorbereid en getest; lokaal toepassen/beoordelen, commit/push en livecontrole blijven afzonderlijke checkpoints.

## Geleverd

Vijfde profiel Price List / Item Prices v1.0.0. De bestaande workspace, profiel-/bronkaart, Step 1/2/3, mappingpanel, saved mappings, categorieën, exportbediening en neutrale compacte recordkaart worden hergebruikt. Geen nieuw paginadesign.

- Price notation staat bij Step 1, zichtbaar en verplicht per eigen bron. Voorbeeldpreset is point. Alleen getrimde tekst volgt de gekozen grammatica; getypeerde Excelnumbers gebruiken de opgeslagen waarde.
- Geen review/data-export/rapport vóór geldige mapping en notatie. De actuele bron, mapping, notatie, resultaten en rapportcontext horen bij dezelfde run.
- Remapping en saved-mapping-apply behouden de keuze voor dezelfde bron. Iedere eigen replacement, ook onder dezelfde bestandsnaam, begint zonder keuze. Reset/profielwissel wissen de run. Saved mappings bevatten geen notatie/sourceCells/bronrijen.
- Eigen CSV/XLSX/XLS gebruiken exactDataInput. Numerieke metadata blijft via sourceCells gekoppeld aan de gemapte prijskolom. Customer/Vendor/Product houden hun bestaande adapters en runValidation; Invoice blijft zijn eigen workspace gebruiken.
- Price-record toont product-ID, prijslijst, valuta, eenheid en prijs; probleem/herstel direct zichtbaar, aanvullende velden/reden/overige issues onder Details.
- Downloadbare data, issue report en Validation Report. Het rapport vereist actuele priceContext, benoemt notatie, source/worksheet/mapping/aantallen, opgeslagen Excelwaarden en controles die niet zijn uitgevoerd.
- Herkenbare Price-signature (product + lijst + prijs) wordt vóór de Product-fallback herkend. Partiële of gemengde headers worden conservatief aan de mapping overgelaten; er is geen automatische profielkeuze.

## Geautomatiseerde basis

69 tests geslaagd: 64 bestaande plus 5 integratietests voor compatibiliteit, overeenkomst voorbeeldfile/config, rapportcontext/-gate/-herhaalbaarheid en saved mappings zonder notatieopslag. Volledige ESLint: 0 fouten, 2 bekende warnings (Metadata en _tone ongebruikt). Productiebuild inclusief TypeScript geslaagd. git diff --check geslaagd.

## Werkelijk uitgevoerde productiebrowserchecks

Omgeving: voorbereide productiebuild, headless Chromium. Desktop 1440px en viewport 390px, geen fysieke telefoontest.

| Scenario | Werkelijk resultaat |
| --- | --- |
| Picker, voorbeeld | Vijf opties; Price zichtbaar; point geselecteerd; 8 Blocked / 1 Needs review / 2 Ready |
| Echte data-export | Precies 001/RETAIL/12.50, 001/WHOLESALE/10.00, 002/RETAIL/0; vijf domeinvelden, geen interne key |
| Echte issue-export | Precies negen issues, inclusief nulprijswaarschuwing en acht blocker-issues |
| Validation Report | Actuele Price-ID/versie, bron, notatie en niet-uitgevoerde ERP-controles aanwezig |
| Notatie veranderen | Voorbeeld op comma geeft uitsluitend de nulprijs als exportdata; terug naar point herstelt de oorspronkelijke drie rijen/8-1-2 |
| Categorie/details | Identiteit en herstel zichtbaar, vijf detailvelden bereikbaar; filter wijzigt de data-export niet |
| Eigen bron met dezelfde voorbeeldnaam | Geen preset/bypass: lege notatie en geen resultaten/export vóór keuze |
| Mappingguards/herstel | Verplicht veld leeg of dubbele bronkolom houdt resultaten/export tegen; saved mapping herstelt mapping en bewaart bestaande bronnotatie |
| Saved mapping op nieuw bestand | Kan de ontbrekende notatie niet omzeilen; localStorage bevat geen priceNotation of bronprijswaarden |
| Eigen komma-CSV | Exacte exports 0009/12.5000 en 0010/0.00; interne dubbele spatie in een prijs wordt niet gerepareerd en blokkeert |
| Eigen XLSX | Twee worksheets, omgekeerde kolommen, expliciete sheet en nieuwe notatiekeuze; 12.3456 blijft exact ondanks 0.00-opmaak; tekst 12,5000 → 12.5000; boolean/percentage/negatief/formule geblokkeerd |
| Eigen XLS | Dezelfde sheet-/mapping-/notatieroute en exacte prijzen; boolean/percentage/negatief geblokkeerd |
| Excelrapport | Juiste bronnaam rounding.xlsx/xls, worksheet Prices en actuele comma-notatie |
| All-blocked | Exportknop uitgeschakeld |
| All-ready/lege categorie | Bewust gekozen Needs review blijft leeg; beide Ready-rijen blijven in export |
| Reset/voorbeeld | Reset wist bron/notatie; nieuw voorbeeld krijgt zichtbaar point |
| Vertraagde Excel-completion | Oude arrayBuffer-uitlezing na Cancel file en nieuw voorbeeld kan bron/notatie/resultaten niet herstellen/overschrijven |
| Toetsenbord/focus | Notatiebediening bereikbaar; mapping sluit met Escape en herstelt focus |
| Desktop/390px | Geen horizontale overflow; bronkaart/notatie/mapping/review/export bereikbaar; screenshots visueel bekeken |
| Profielwissel | Annuleren behoudt Price-run; bevestigen wist Price en Product toont uitsluitend eigen unitcontrole |
| Bestaande profielen | Product 2 exportrijen; Customer/Vendor/Invoice voorbeelden hebben echte downloads gelijk aan getoonde aantallen; geen Price-instellingen zichtbaar |
| Browser/netwerk | Geen page errors en geen onverwachte netwerkrequests in deze gecontroleerde flow; geen bestandsuploadrequest waargenomen |

De XLS-writer bewaart geen formules in testworkbooks; de live XLS-browsercase claimt daarom geen formulefixture. Een echte BIFF8-formule met cache is al afzonderlijk afgedekt door de M7.4a-testfixture. XLSX-formuleafwijzing is hier wel via de browser en daadwerkelijke export bewezen.

## Grenzen

Dit is geen volledige zesprofiel-eindtest, fysieke telefoontest, performancebenchmark, securityaudit of zelfstandig gebruikersonderzoek. Stock Balances is nog niet gebouwd. Bestaande Invoice-interpretatie van 1.234 als 1234 is niet gewijzigd en blijft een expliciet vóór M7-acceptatie te behandelen punt.

## Lokale acceptatie en hervatten

1. Price List → Try example: 8 Blocked / 1 Needs review / 2 Ready.
2. Download data: drie rijen zoals hierboven, inclusief nulprijs.
3. Upload public/demo-data/price-list-example.csv als eigen bestand: eerst opnieuw point kiezen vóór review/export.

Daarna lokaal checkpoint bevestigen en commit/push/live afzonderlijk vastleggen. Volgende inhoudelijke stap: M7.4d Stock Balances-domein (7 Blocked / 0 Needs review / 3 Ready / 3 exportrijen), daarna M7.4e full workflow. Geen verdere Price-polish zonder concrete bevinding.
