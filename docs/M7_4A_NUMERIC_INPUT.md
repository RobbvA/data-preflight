# M7.4a — Exacte numerieke invoer

Datum: 28 oktober 2026. Bronbasis: f8e185bec9858c3da249c756f5ecf579bc8d80e6 plus dit pakket. Technische voorbereiding; geen nieuwe zichtbare profielen of livecontrole.

## Verantwoordelijkheden

| Module / API | Contract |
| --- | --- |
| strictDecimal.decodeDecimalText(value, notation) | Alleen gekozen punt/komma, trim aan de randen, exacte decimaaltekst zonder Number/parseFloat |
| strictDecimal.decodeDecimalCell(cell, notation) | Tekstgrammatica óf opgeslagen Excel-number; weergave is niet de bronwaarde |
| exactDataInput.parseExactSourceFile(file, sheet?) | Opt-in CSV/XLSX/XLS-adapter; rows én gekoppelde sourceCells, interne whitespace behouden |
| exactDataInput.getExactReadableExcelSheetNames(file) | Ook formulecellen zonder cache zichtbaar houden voor sheetselectie en afwijzing |
| compositeKey.createCompositeKey(parts) | Getrimde/case-insensitieve JSON-tuple, zonder delimitersamenvoeging |
| parseCsvFile(file, {preserveCellText:true}) | Alleen nieuwe exacte route gebruikt trim-only data; bestaande callers behouden normalisatie |

De nieuwe celmetadata moet bij Price/Stock-mapping aan de gekozen bronkolom gekoppeld blijven. Numerieke velden lezen via decodeDecimalCell, niet via alleen de weergegeven row-string. Geen generiek profiel-/instellingenframework toegevoegd.

## Decimaalcontract

- Notatie is verplicht, ook als de Excelcellen numeriek zijn. UI-gate, keuze/reset en rapportcontext volgen bij Price/Stock-integratie.
- Punttekst: `^-?[0-9]+(?:\.[0-9]+)?$`; kommatekst dezelfde grammatica met komma.
- Geen duizendtalscheiding, plusteken, symbolen, wetenschappelijke tekst, interne spaties, .5 of 12. Geen automatische notatieherkenning.
- Tekstuele schaal en lange waarden blijven behouden. Exportwaarde gebruikt een punt; geen vaste schaal of stille afronding.
- Negatieve nul wordt nul zonder minteken, met behoud van fractieschaal. Negatieve niet-nulwaarden blijven herkenbaar voor domeinafwijzing.
- `1.234` met puntkeuze is exact 1.234; met kommakeuze is het ongeldig. `1,234` met kommakeuze is exact 1.234, nooit automatisch 1234.
- Price nulprijs wordt later Needs review; Stock nulhoeveelheid Ready. Die regels horen bij de domeinprofielen, niet de decoder.

## Excelcontract

Nummercellen gebruiken de opgeslagen number, zonder de weergave uit 0.00-, grouping-, valuta- of wetenschappelijke opmaak over te nemen. Exponentweergave van een number wordt zonder extra numerieke conversie uitgeschreven.

Formulecellen (ook met geldige cache of zonder cache), datum-, boolean-, fout- en percentagecellen leveren unsupported-cell. Letterlijke/escaped procenttekens in een gewone nummeropmaak zijn geen percentageberekening. Niet-eindige getallen en absolute magnitude boven Number.MAX_SAFE_INTEGER leveren unsafe-number; gebruik een tekstcel met de exacte waarde.

Deze code herstelt geen precisie of oorspronkelijke schaal die Excel al heeft verloren. Een Excelnumber is reeds een floating-pointbron; de route introduceert geen extra afronding. Foutcodes krijgen bij de profielintegratie veldspecifieke probleem-/hersteltekst.

## Werkelijk bewijs

- 39 bestaande tests + 15 nieuwe tests geslaagd. De suite met de eerste 14 nieuwe tests (53 totaal) is gezamenlijk uitgevoerd; de daarna toegevoegde echte BIFF8-formuletest is afzonderlijk geslaagd. Na die extra test geen productiecode gewijzigd.
- Gerichte ESLint over gewijzigde/nieuwe bronmodules: 0 fouten en 0 warnings. TypeScript geslaagd; git diff --check geslaagd.
- Werkelijke gegenereerde XLS én XLSX getest: 0.00-afronding, grouping, valuta, wetenschappelijke opmaak, precieze tekstschaal, lange tekstgetallen, voorloopnullen, interne whitespace, datum/boolean/error/percentage, unsafe magnitude, sheetselectie, lege tussenrijen en headerbotsingen.
- Voorbeelden: opgeslagen 12.3456 met 0.00-opmaak blijft 12.3456 via de exacte route; de bestaande route blijft als regressie 12.35 teruggeven. `1  2` blijft exact behouden en wordt afgewezen als getal; bestaande parsing blijft `1 2` leveren.
- XLSX: gecachete nummer-/tekstformules én ongecachete formule-only rij blijven aanwezig en worden afgewezen.
- XLS: tests/fixtures/price-formula.xls bevat een echte BIFF8-FORMULA voor B2=1+1 met cache 2. De standaard XLS-writer schrijft alleen de cache; deze fixture is daarom eenmaal gemaakt door de NUMBER-record te vervangen door FORMULA. Onafhankelijke readback in de test controleert formule en cache vóór de nieuwe decoder wordt gebruikt.
- CSV: gequote interne whitespace/NBSP, komma-precisie, determinisme en opt-in versus default-normalisatie getest via echte parsercallbacks met een minimale FileReader-testshim.
- Bestaande bronbytes en tuple-inputs blijven ongewijzigd. Herhaalde exact-inputruns geven dezelfde output. Tuples met scheidingstekens of quote-fragmenten botsen niet.

## Grenzen en open punten

Bestaande Invoice/Customer/Vendor/Product-adapters zijn niet omgeschakeld. Deze nieuwe modules worden nog niet aangeroepen vanuit de UI; geen volledige build/browserronde voor deze ongebruikte primitives uitgevoerd. Browserintegratie, werkelijke Price/Stock-downloads en rapportcontext volgen bij M7.4c/e; zesprofiel-eindtest blijft M7.5. Prijsprofiel/voorraadprofiel zijn nog niet gebouwd.

**Open vóór M7-eindacceptatie:** bestaande Invoice normalizeNumber("1.234") geeft bevestigd "1234". Dat kan de bedoelde duizendtalsnotatie zijn, maar is zonder broncontract dubbelzinnig. Dit pakket verandert het oude Invoice-gedrag niet stilzwijgend. Leg daar een expliciet notatie-/afwijscontract vast en implementeer dit gericht met regressies (M7.5b of eerdere afgebakende side quest). Succes voor de nieuwe decoder sluit dit open punt niet.

Lokaal toepassen/bevestigen en commit/push van M7.4a blijven open. Daarna M7.4b: Price List-domein, exacte 8 Blocked / 1 Needs review / 2 Ready en export 3 rijen.
