# M7.4b — Price List-domein

Datum: 28 oktober 2026. Basis: e09cb8e61c743e6be0cb6c04322d56be14800995 plus dit pakket. Getest in voorbereiding; lokale toepassing/push/live van dit pakket nog open.

## Uitkomst

Price List / Item Prices v1.0.0, ID price-list. Eén prijs per product + prijslijst + valuta + eenheid. Geen staffels, geldigheidsperiode, korting, ERP-bestaancheck of prijsberekening.

De domeinmodule is gereed voor integratie. De picker toont nog vier profielen; M7.4c voegt de volledige gebruikersflow toe. Er is hier geen browserdownload of vijfde zichtbaar profiel geclaimd.

## API en verantwoordelijkheid

- priceListProfile: vijf verplichte velden en Engelse/Nederlandse aliases. Ambigue headerkandidaten blijven een expliciete gebruikerskeuze.
- runPriceListValidation(mappedRows, context): context bevat priceNotation en per rij de getypeerde priceCells. Geen automatische fallback naar een Excelcache of weergegeven prijs.
- runPriceListSourceValidation(exactDataSet, mapping, notation): controleert mapping en geldige bronkolommen, koppelt broncelmetadata aan de gemapte prijs en voert het domein uit. Zonder geldige mapping, notatie of broncelcontext: available=false en geen resultaten/exportdata.
- Run bevat normalizedRows en validationResult met issues/cleanRows/errorRows. cleanRows zijn exportdata, geen bewijs van een al gedownloade CSV.

Een traditionele ValidationProfile-runner zonder context wordt niet gebruikt: zo kan een ontbrekende notatie of verloren formulemetadata niet stil worden omzeild. UI, notatielifecycle en rapportcontext volgen M7.4c.

## Regels

Alle velden verplicht. IDs/lijst/eenheid alleen trimmen; interne whitespace en tekstuele voorloopnullen blijven behouden. Currency trim + uppercase, uitsluitend drie ASCII-letters; geen bestaancheck.

Prijzen gebruiken de M7.4a-decoder. Negatief niet-nul blokkeert. Nul en negatieve nul geven een waarschuwing, behouden fractieschaal en blijven exporteerbaar tenzij een ander probleem blokkeert. Ongeldige notatie, verboden celtype of onveilige numerieke magnitude blokkeert met probleem/reden/herstelactie.

Duplicaten gebruiken een getrimde, case-insensitieve JSON-tuple. Alleen complete keys met geldige valutavorm doen mee. Een ongeldige prijs verbergt de key niet. Alle betrokken rijen blokkeren; ook bij gelijke prijzen of een nulprijs. Andere lijst, valuta of eenheid is een andere combinatie. Geen samenvoegen, geen interne sleutel in output.

## Exacte voorbeeldfixture

Bron: public/demo-data/price-list-example.csv.

| Rij | Uitkomst | Reden |
| --- | --- | --- |
| 1 | Ready | 001 / RETAIL / EUR / EA / 12.50 |
| 2 | Ready | 001 / WHOLESALE / EUR / EA / 10.00 |
| 3 | Needs review | Nulprijs 002 / RETAIL / EUR / EA / 0 |
| 4 | Blocked | Negatieve prijs |
| 5 | Blocked | Onleesbare prijs |
| 6 | Blocked | Product-ID ontbreekt |
| 7 | Blocked | Valutavorm ongeldig |
| 8 | Blocked | Eenheid ontbreekt |
| 9 | Blocked | Dubbele samengestelde key |
| 10 | Blocked | Dezelfde key na trim/case-normalisatie |
| 11 | Blocked | Prijslijst ontbreekt |

Totaal: 11 rijen, 8 Blocked, 1 Needs review, 2 Ready. Exportdata exact rijen 1, 2 en 3, met prijzen 12.50 / 10.00 / 0. De warning-only rij blijft inbegrepen.

## Werkelijk testbewijs

64 tests gezamenlijk geslaagd: 54 bestaande tests + 10 nieuwe Price List-tests. Gerichte ESLint over de twee nieuwe bronmodules: 0 fouten/warnings. TypeScript en git diff --check geslaagd.

Nieuwe tests bewijzen:
- Exacte fixture, issuevolgorde, normalized values en exportdata zonder extra velden/interne key.
- Nederlandse aliases, ambigue prijs-/productkolommen, alle verplichte mappings, dubbele toewijzing en verouderde bronkolom.
- Geen resultaten bij ontbrekende notatie of broncelmetadata; een opgeslagen mapping kan de gate niet omzeilen.
- Trim-only IDs/lijsten/eenheden, currency uppercase, voorloopnullen en lange tekstdecimalen zonder schaalverlies.
- Iedere ontbrekende waarde, ongeldige valutavorm, negatieve prijs, alle nulvormen en afgewezen tekstvormen met uitleg van gekozen notatie.
- Volledige tupleduplicaten bij identieke, nul- en ongeldige prijzen; geen lege-/ongeldige-keyduplicaten; onderscheid tussen lijsten/valuta/eenheid en botsingsgevoelige identifiers.
- Getypte nummer-/formule-/datum-/boolean-/fout-/percentagecellen en onveilige magnitude.
- Echte XLS én XLSX via de exacte adapter, omgekeerde kolomvolgorde en 0.00-opmaak: opgeslagen 12.3456 blijft 12.3456 bij de gemapte prijs.
- Herhaalbaarheid, brondata niet muteren en behoud van oorspronkelijke broncontext.

Geen volledige productiebuild/browserronde herhaald voor de nog niet aan UI gekoppelde domeinmodule. M7.4c bevat daadwerkelijke downloads, notatiekeuze/reset, opgeslagen mappings, async-guards, rapportcontext, voorbeeld/eigen bestand en vijfprofiel-checkpoint. Stock pas daarna. De aparte Invoice-ambiguïteit 1.234→1234 blijft vóór M7-eindacceptatie te behandelen.
