# M7 R04 — Zesprofielintegratie

31 oktober 2026. Alle zes profielen in één controleopdracht getest. Geen applicatiefouten gevonden; geen applicatiecode gewijzigd.

## Basis en bewijsgrens

Remote main: `3a40d6047c16b04954a372c46aeb8097b62f7ca3` — rapportexports en guided workflow. Alle 143 repositorybestanden bytegetrouw vergeleken met de testcheckout, nul afwijkingen. Rob heeft de voorafgaande wijziging lokaal bevestigd en gepusht.

Deze ronde gebruikt een lokale productiebuild en geautomatiseerde Chromiumdownloads. Geen nieuwe live-/Vercelacceptatie, fysieke telefoon, volledige WCAG-audit, onafhankelijke gebruikerstest of afsluiting van de nog uitgebreide M7 geclaimd. Desktop/390px-help en PDF-rendering zijn eerder onder R05a/R07a gecontroleerd; die visuele suites zijn hier niet volledig herhaald.

## Gecontroleerde voorbeeldresultaten

| Profiel | Blocked | Needs review | Ready | Werkelijk geëxporteerd |
| --- | ---: | ---: | ---: | ---: |
| Invoice | 1 | 2 | 1 | 3 |
| Customer | 3 | 0 | 2 | 2 |
| Vendor | 3 | 1 | 2 | 3 |
| Product / Material | 5 | 0 | 2 | 2 |
| Price List | 8 | 1 | 2 | 3 |
| Stock Balances | 7 | 0 | 3 | 3 |

Geblokkeerde rijen ontbreken daadwerkelijk in de data-export. Warning-only rijen blijven inbegrepen en herkenbaar in het reviewrapport. Price-nul waarschuwt; Stock-nul blijft Ready en exporteerbaar. Price/Stock-rapportidentiteiten gebruiken de volledige samengestelde sleutel, niet alleen Product ID.

## Geslaagde controleblokken

Per profiel: voorbeeld en eigen CSV, XLSX en XLS; tekst-IDs en omgekeerde kolomvolgorde; expliciete Data-worksheet naast Notes; worksheetannulering; ontbrekende en dubbele verplichte mapping verwijderen alle resultaten/exports; opgeslagen mapping herstelt kolommen en kan de vereiste notatie niet omzeilen.

Per profiel: echte CSV met puntkomma én komma, Excel, TXT, TSV en JSON teruggelezen met exact dezelfde waarden/rijvolgorde/aantallen. Alle drie reviewcategorieën veranderen export niet. Issue-CSV en issue-XLSX vergeleken met volledige Issues-sheet. Volledig review-XLSX vergeleken op totaal/status/rijbesluiten/profiel/context; PDF gedownload en met onafhankelijke PDF-parser op geldigheid en pagina's gecontroleerd. Geen volledige PDF-inhoudsrendercontrole herhaald; zie R07a.

Per profiel: all-ready met lege Issues-sheet en uitgeschakeld issuerapport; all-blocked met alle vijf dataformaten uitgeschakeld en excluded_from_clean_export in rapport. Eigen-bronvervanging (ook dezelfde naam) herinitialiseert format/branding en numerieke keuze. Lege, kapotte en headers-only CSV laten geen oude resultaten staan. Profielwissel annuleren behoudt run; bevestigen wist bron/context; reset verwijdert resultaten. Late Excel-read na cancel én na directe vervanging overschrijft geen nieuwe bron.

Invoice/Price/Stock in XLSX én XLS: opgeslagen numerieke waarde `12.3456` blijft exact ondanks weergave `0.00`; tekst `900719925474099312345,1234500` wordt met expliciete komma exact `900719925474099312345.1234500`; tekst-ID `0001` blijft behouden. Geen displayafronding als nieuwe bronwaarde.

Product: zonder lijst meldt context Not run/presence only; actieve KG-lijst blokkeert EA; afgekeurde vervangende lijst verwijdert de oude lijst; nieuwe bron start zonder actieve referentie. Reports bevatten alleen de actuele profiel-/notatie-/referentiecontext. Geen paginafouten of brondata-netwerkrequests waargenomen.

134 bestaande geautomatiseerde tests geslaagd; productiebuild/TypeScript geslaagd; lint nul fouten en twee bekende warnings (layout Metadata en DataSetPreview _tone). Browserrunner eveneens lintvrij.

## Herhalen wanneer relevant

De optionele runner staat in tests/browser/r04-profiles.cjs met r04-fixtures.json. Node 24+, bestaande projectdependencies en apart Playwright/Chromium nodig. Deze toevoeging verandert package.json/lock niet en maakt npm test niet afhankelijk van een browser.

Alleen als de brede integratiesuite opnieuw nodig is:

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run build
node tests/browser/r04-profiles.cjs
```

De runner start zelf een localhostproductieserver en sluit browser/server na afloop. Resultaten gaan standaard naar de tijdelijke systeemmap datapreflight-r04-results, buiten de repository. R04_OUTPUT_DIR kan een andere bewijsmap kiezen. R04_BASE_URL accepteert uitsluitend localhost; R04_BASE_COMMIT legt de geteste SHA vast. Optioneel R04_PROFILES=price-list,stock-balances hervat alleen die profielblokken plus precisie/referentie/cancel; R04_FOCUS=lifecycle draait alleen all-ready/all-blocked/direct-replace. CI kan R04_PLAYWRIGHT_MODULE/R04_CHROMIUM_PATH/R04_CHROMIUM_ARGS instellen. Geen testbestanden op een live gebruikerssessie uitvoeren.

De ontwikkelrun is na twee runnercorrecties gericht hervat: volledige samengestelde Price/Stock-ID verwacht en smooth-scroll bij geautomatiseerde downloads uitgeschakeld. De volledige profielblokken zijn alle zes geslaagd; aanvullende precisie/referentie/cancel en all-ready/all-blocked/direct-replace zijn apart geslaagd. Geen applicatiefix nodig en geen hele groene suite onnodig opnieuw uitgevoerd.

## Hervatten

R04 technisch gecontroleerd op bovengenoemde commit. Test/documentatiepakket nog lokaal toepassen en commit/push. Daarna resterende R05-leesbaarheid en R06-reviewbediening. R07b, ERP-template/referenties/rules, multi-file met tabs en gezamenlijke ZIP, commerciële voorbereiding, R12–R14 blijven gepland. Deze groene ronde alleen herhalen na relevante wijzigingen of concrete bevindingen.
