# M7.4e — Volledige Stock Balances-workflow

Datum: 28 oktober 2026. Basis: faed293328be6534fd98e2dc8896e800a330e753 plus dit pakket. Gebouwd/getest in voorbereiding; lokale toepassing/beoordeling, commit/push/live apart bevestigen.

## Geleverd

Stock Balances / On-hand Inventory v1.0.0 als zesde profiel, binnen de bestaande workspace/bronkaart/mapping/review/export en neutrale compacte recordpresentatie.

- Quantity notation bij Step 1 verplicht per eigen bron. Het voorbeeld krijgt zichtbaar point. Nieuwe eigen bron (ook dezelfde naam), reset of profielwissel wist de keuze; remapping en saved-mapping-apply behouden alleen de keuze van dezelfde bron.
- Geen resultaten/data-export/rapport zonder geldige mapping, quantity notation en getypeerde hoeveelheidscelmetadata.
- Exacte CSV/XLSX/XLS-route; broncelmetadata blijft gekoppeld aan de gemapte hoeveelheid. Geen formulecache of afgeronde weergave als invoerwaarde gebruiken.
- Recordidentiteit product + magazijn, hoeveelheid en eenheid zichtbaar; probleem/herstel direct, overige velden/reden/alle issues onder Details.
- Eén absolute stand per product/magazijn binnen één organisatie/snapshot per bestand. Geen mutaties/delta's, optellen of conversie. Nul is Ready zonder waarschuwing. Negatieve voorraad valt buiten deze profielversie, niet universeel buiten alle ERP-processen.
- Stock-context in UI/rapport: quantity notation, absolute snapshotbetekenis, duplicaatbereik, nulgedrag, Excelregels en niet-gecontroleerde organisatie/snapshotdatum/ERP-codes/echte voorraad/voorgaande bestanden/waardering/batches/serienummers.
- Getypeerde stockContext vereist voor Stock-rapporten. Geen Price- of Product-referencecontext bij Stock. Saved mappings blijven per profiel geïsoleerd en slaan geen notatie/sourceCells/bronrijen op.
- Sterke Stock/Price-signatures gaan vóór Product. Alleen Product ID bewijst geen profiel; partiële en concurrerende Price/Stock-signatures blijven handmatig mappable. Location wordt niet stil als Warehouse gekozen.

## Geautomatiseerde checks

86 tests geslaagd: 80 bestaande plus 6 Stock-integratietests voor signatureherkenning/ambiguïteit, exacte voorbeeldconfig, snapshotrapport/gates/isolatie en saved mappings. Volledige lint: 0 fouten, 2 bekende warnings (Metadata en _tone ongebruikt). Productiebuild inclusief TypeScript en git diff --check geslaagd.

## Werkelijke productie-browserchecks

Voorbereide productiebuild met headless Chromium, desktop 1440px en viewport 390px; geen fysieke telefoon.

| Scenario | Werkelijke uitkomst |
| --- | --- |
| Picker en voorbeeld | Zes opties; Stock zichtbaar; point-preset; 7 Blocked / 0 Needs review / 3 Ready |
| Echte data-export | 001/WH-A/10, 001/WH-B/5.50, 002/WH-A/0; vier domeinvelden, geen interne key |
| Echte issue-export | Zeven issues; geen kunstmatige waarschuwing voor nul |
| Nul en lege reviewcategorie | Nulkaart is Ready; Needs review bewust leeg; filter wijzigt export niet |
| Notatie wisselen | Comma op voorbeeld exporteert alleen de gehele hoeveelheden 10/0; point herstelt drie rijen |
| Rapport | Juiste bron/worksheet/notation/counts en snapshotgrenzen; geen Price notation of Product reference check |
| Eigen bestand met voorbeeldnaam | Geen preset/bypass; lege keuze, geen resultaten/export vóór expliciete keuze |
| Mapping/saved mappings | Ontbrekend Warehouse of dubbele toewijzing blokkeert; toepassen herstelt mapping en bewaart bestaande bronkeuze; nieuwe bron blijft een eigen keuze vereisen |
| Eigen komma-CSV | 0009/12.5000 en 0010/0.00 exact in export; interne dubbele spatie ongeldig; nul blijft zonder waarschuwing |
| LocalStorage | Geen quantityNotation of bronhoeveelheden; Stock-mapping verschijnt niet bij Price |
| EA/BOX-conflict | Beide rijen geblokkeerd; Details toont duplicaat én expliciet eenheidsconflict met hersteluitleg; export uitgeschakeld |
| Eigen XLSX | Twee worksheets/omgekeerde kolommen, nieuwe notatie vereist; 12.3456 blijft exact ondanks 0.00-opmaak; tekst 12,5000 → 12.5000; boolean/percentage/negatief/formule uitgesloten |
| Eigen XLS | Dezelfde route en exacte numerieke/textuele hoeveelheden; boolean/percentage/negatief uitgesloten |
| Excelrapport | Juiste stock-rounding.xlsx/xls, worksheet Stock en actuele comma-notatie |
| Reset en verouderde Excel-completion | Reset wist bron/keuze; voorbeeld krijgt point. Afgebroken oude Exceluitlezing herstelt geen oude bron/notatie/resultaten na nieuw voorbeeld |
| Desktop/390px/toetsenbord | Geen horizontale overflow, notatie/mapping bereikbaar, Escape herstelt focus; screenshots bekeken |
| Wisselen naar Price | Annuleren bewaart Stock comma; bevestigen wist context. Price-voorbeeld krijgt point, nulprijs blijft waarschuwing en Price-rapport heeft geen quantity notation |
| Overige vier voorbeelden | Product/Customer/Vendor/Invoice werkelijke exportaantallen gelijk aan UI; geen price/quantity-controls zichtbaar |
| Runtime/netwerk | Geen page errors of onverwachte requests; geen uploadrequest voor bronrijen tijdens de gecontroleerde acties |

XLS-formules zijn niet door de testwriter in het browserworkbook opgenomen, omdat die writer ze niet bewaart. De echte BIFF8-formulefixture is wel gedekt door de eerdere M7.4a-tests. XLSX-formuleafwijzing is hier via de browser en werkelijke export bewezen.

## Grenzen en lokaal checkpoint

Dit is geen complete M7.5-zesprofieltest, fysieke telefoontest, performancebenchmark of securityaudit. Bestaande Invoice 1.234→1234 blijft apart vóór eindacceptatie te corrigeren met een expliciet contract.

Lokaal controleren:
1. Stock Balances → Try example: 7 Blocked / 0 Needs review / 3 Ready.
2. Data-export heeft precies drie rijen, inclusief nulvoorraad.
3. Upload public/demo-data/stock-balances-example.csv als eigen bestand: eerst opnieuw point kiezen.

Na lokale bevestiging: checkpoint vastleggen, M7.4f zesprofielintegratie, daarna M7.5 gehele-app-test en oplossing van blokkerende bevindingen. Geen verdere profielen of automatische polishronde.
