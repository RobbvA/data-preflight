# M7.3b — Vierprofielcheckpoint

Datum: 28 oktober 2026. Bronbasis: 971b8f97c3d68bbcdf751de8228b56c17f9ee85f plus de M7.3b-wijzigingen in het pakket. Dit is voorbereiding, geen claim over Robs lokale toepassing of live deployment.

## Wijziging

- Tijdens het lezen van een bronbestand is Cancel file bereikbaar. Deze gebruikt de bestaande reset/request-ID-bescherming; latere voltooiing wordt genegeerd. Onderliggende bestands-I/O wordt niet noodzakelijk fysiek gestopt.
- Een bestand met alleen koppen/zonder leesbare gegevens geeft een herstelactie: koppen en datarijen opnemen en opnieuw uploaden. Invoice noemt ondersteunde CSV/XLSX/XLS-formaten bij ongeschikte invoer.
- Header/bronkaart, kaarten, mapping-/validatieregels, decimalen en exportberekeningen zijn ongewijzigd.

## Uitgevoerde technische checks

| Check | Werkelijk resultaat |
| --- | --- |
| Bestaande Node-tests | 39 geslaagd, 0 mislukt |
| ESLint gehele app | 0 fouten, 2 bekende warnings: Metadata en _tone ongebruikt |
| Productiebuild inclusief TypeScript | Geslaagd |
| git diff --check | Geslaagd |

## Uitgevoerde browserchecks

Headless Chromium tegen de voorbereide productiebuild. Desktop 1440px en viewport 390px; geen fysieke telefoontest.

| Scenario | Customer | Vendor | Product | Invoice |
| --- | --- | --- | --- | --- |
| Eigen CSV met herkenbare voorbeeldgegevens | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Ontbrekende verplichte mapping houdt resultaten/export tegen | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Dubbele kolomtoewijzing houdt resultaten/export tegen | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Mapping opslaan, toepassen, vervangen en bevestigd verwijderen | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Opgeslagen mapping blijft na heropenen/bronvervanging beschikbaar | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Herstel van mapping en Escape/focus | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Header-only, ongesloten CSV-aanhaling en nul bytes vervangen de oude bron zonder oude resultaten/export | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Eigen XLSX, omgekeerde kolomvolgorde, twee gevulde werkbladen, selectie en annuleren | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Annuleren van profielwissel bewaart de huidige resultaten | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Reset wist resultaten en keert naar de start terug | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Werkelijke CSV-download en Validation Report met juiste broncontext | Geslaagd | Geslaagd | Geslaagd | Geslaagd |
| Zichtbaar exportaantal is gelijk aan gedownloade inhoud | 2 | 3 | 2 | 3 |
| Mappingpaneel bereikbaar en geen horizontale overflow op desktop/390px | Geslaagd | Geslaagd | Geslaagd | Geslaagd |

Exact geëxporteerde IDs:
- Customer: C-1001, C-1003. De duplicaat-/ontbrekende-ID-rijen ontbreken.
- Vendor: 001, 003, 005. De warning-only rij 003 blijft inbegrepen.
- Product: 001, 005. De overige vijf geblokkeerde rijen ontbreken.
- Invoice: INV-2001, INV-2002, INV-2004. Warning-only facturen blijven inbegrepen; INV-2003 is uitgesloten.

Aanvullend geslaagd:
- Profielzoeker met lege zoekuitkomst; Escape herstelt triggerfocus.
- Productbron vertraagd laten uitlezen, Cancel file, nieuw voorbeeld laden, oude uitlezing alsnog afronden: nieuwe bron en 001/005-export blijven behouden.
- Product zonder unitlijst meldt expliciet alleen aanwezigheidcontrole. Actieve KG-lijst beperkt de export tot 005; ongeldige vervanging laat geen oude lijst actief en toont herstelhulp.
- Geen browserfouten tijdens de geslaagde controle.

## Grenzen en volgende actie

Dit vervangt de M7.5-eindtest niet. Geen nieuwe volledige live-workflow, fysieke telefoon, eigen XLS-test, performancebenchmark of zelfstandige gebruikerstest geclaimd. Price List/Stock Balances en numerieke interpretatie (waaronder 1.234 en Excelweergaveafronding) behoren tot M7.4; die zijn hier niet gewijzigd of opnieuw bewezen. Bestaande waarschuwingen blijven staan.

Lokale toepassing/acceptatie, commit/push en livecontrole van M7.3b blijven afzonderlijke checkpoints. Na Robs lokale bevestiging volgt M7.4a.
