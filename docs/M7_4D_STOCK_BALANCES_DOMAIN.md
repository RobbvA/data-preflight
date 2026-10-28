# M7.4d — Stock Balances-domein

Datum: 28 oktober 2026. Basis: 29844484605246b4ffe5d108a3b0b8cecb20e6cf plus dit pakket. Gebouwd/getest in voorbereiding; lokale toepassing/push van het pakket nog open.

## Scope

Stock Balances / On-hand Inventory v1.0.0, ID stock-balances. Eén organisatie, één momentopname per bestand. Een rij beschrijft de absolute hoeveelheid van een product in een magazijn. Geen voorraadmutatie/delta, waardering, batch/serienummer, aparte locatie of eenheidsconversie. Organisatie, snapshotmoment en echte voorraad worden niet geverifieerd. Geen product-/magazijn-/eenheidbestaancheck of ERP-importgarantie.

Dit pakket voegt domeinregels toe. De picker houdt vijf profielen; de Stock-workflow volgt M7.4e.

## API

- stockBalancesProfile: product_id, warehouse_id, unit en quantity verplicht, Engelse/Nederlandse aliases. Location is bewust geen alias voor Warehouse.
- runStockBalancesValidation(mappedRows, context): quantityNotation en gekoppelde quantityCells vereist. Geen fallback naar weergegeven Exceltekst of formulecache.
- runStockBalancesSourceValidation(exactDataSet, mapping, notation): vereiste mapping, unieke/geldige bronkolommen en complete broncelcontext bewaken; koppelt numerieke metadata aan de gemapte hoeveelheid.
- Zonder mapping/notatie/sourceCells: available=false, geen normalizedRows of exportdata.
- Uitvoer bevat normalizedRows en issues/cleanRows/errorRows. Werkelijke downloads en rapportcontext volgen bij M7.4e.

## Regels

IDs, warehouse en unit worden uitsluitend getrimd; interne whitespace, case en tekstuele voorloopnullen blijven in de uitvoer behouden. Numerieke tekst volgt de gekozen strikte punt/kommanotatie. Excelnumbers gebruiken opgeslagen waarden zonder weergaveafronding. Tekstschaal blijft behouden, negatieve nul verliest alleen het minteken.

Ontbrekende velden, onleesbare of negatieve niet-nulhoeveelheden blokkeren. Negatieve snapshots vallen buiten deze profielversie; dat is geen universeel oordeel dat negatieve voorraad ongeldig is. Nulvoorraad en -0 zijn normale Ready-uitkomsten. Er is geen verzonnen EA-alleen-geheel-regel.

Een JSON-tuple van getrimde/case-insensitieve product_id + warehouse_id bepaalt duplicaten. Eenheid hoort niet bij de key. Alle betrokken rijen blokkeren bij gelijke of verschillende hoeveelheden, ook als een hoeveelheid/eenheid ontbreekt of ongeldig is. Verschillende niet-lege eenheden binnen de groep geven daarnaast stock-unit-conflict voor alle groepsleden. Er wordt nooit stil opgeteld, gededupliceerd of geconverteerd. Alleen complete product-magazijnkeys doen mee.

## Exacte fixture

public/demo-data/stock-balances-example.csv:

| Rij | Uitkomst | Reden |
| --- | --- | --- |
| 1 | Ready | 001 / WH-A / EA / 10 |
| 2 | Ready | 001 / WH-B / EA / 5.50 |
| 3 | Ready | 002 / WH-A / KG / 0 |
| 4 | Blocked | Negatieve hoeveelheid |
| 5 | Blocked | Onleesbare hoeveelheid |
| 6 | Blocked | Product-ID ontbreekt |
| 7 | Blocked | Magazijn ontbreekt |
| 8 | Blocked | Eenheid ontbreekt |
| 9 | Blocked | Product-magazijn dubbel |
| 10 | Blocked | Dezelfde key na trim/case |

Totaal: 10 rijen, 7 Blocked, 0 Needs review, 3 Ready. Exportdata exact rijen 1/2/3, hoeveelheden 10 / 5.50 / 0. Geen interne keys of extra velden.

## Werkelijk bewijs

80 tests gezamenlijk geslaagd: 69 bestaande + 11 Stock-tests. Gerichte ESLint over de twee nieuwe modules: 0 fouten/warnings. TypeScript en git diff --check geslaagd.

Nieuwe tests dekken exacte fixture/issuevolgorde/exportdata; alle verplichte waarden/mappings; aliasambiguïteit en ontbrekende Location-alias; verkeerde Product/Price-kolommen leveren geen geldige Stock-mapping; ontbrekende notatie/sourceCells; punt/komma/lange decimalen/interne whitespace/voorloopnullen; nul/-0 versus negatief; complete/onvolledige tuplekeys; gelijke/ongeldige/ontbrekende hoeveelheden of eenheden bij duplicaten; andere magazijnen; EA/BOX-conflict versus case-gelijke EA/ea; getypeerde Excelcellen en unsafe magnitude; echte XLS/XLSX met omgekeerde kolommen, 0.00-opmaak en opgeslagen 12.3456; geen bronmutatie en herhaalbaarheid.

De 69 bestaande tests omvatten Price-nulprijs als waarschuwing. Stock-nulvoorraad zonder waarschuwing wijzigt dat bestaande Price-contract niet.

Geen browser/buildronde voor deze nog niet via de UI gebruikte domeinmodule. M7.4e voegt de zesde pickeroptie, sterke Stock-signature vóór Product-fallback, quantity notation/lifecycle, snapshotgrenzen in UI/rapport, review en echte downloads toe. Daarna M7.4f en de uitgebreide M7.5-eindtest. Invoice 1.234→1234 blijft een afzonderlijk pre-releasepunt.
