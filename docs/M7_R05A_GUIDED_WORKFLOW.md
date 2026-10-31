# M7 R05a — Gerichte export-UX en begeleide workflow

31 oktober 2026. Voorbereid; lokale gebruikersacceptatie, push en live blijven apart.

## Gedrag

- Data export en Reports als toetsenbordbedienbare tabs. Formatkeuzes en organisatienaam blijven behouden bij tabwissel; lopende PDF wordt ongeldig gemaakt zodat geen late download volgt.
- Twee rapportkeuzes met eigen korte uitleg; organisatienaam optioneel ingeklapt. Vijf dataformaten en alle rapportformaten blijven beschikbaar.
- Vraagtekens bij profiel, mapping, decimaalnotatie, review en export. Klik opent uitleg; Escape/Sluiten keert terug naar het vraagteken. Klik/tab buiten sluit zonder focus terug te stelen.
- Quick guide en Walk me through it starten optioneel een gids. Alleen bestaande zichtbare onderdelen doen mee. De actieve sectie wordt uitgelicht, rest gedimd/inert; Back/Next/Done, focuslus en Escape. Verdwijnend doel sluit de gids. Geen automatische start, tracking of opgeslagen voltooiing.
- Gids is uitleg: verandert geen profiel, bron, mapping, notatie, resultaten of exportbesluit. Geen omzeilen van vereiste mapping/notatie.

## Voorbereidingsbewijs

134 bestaande domein-/writer-/rapporttests geslaagd, productiebuild/TypeScript geslaagd. Lint nul fouten, twee reeds bekende warnings in layout en DataSetPreview. Gerichte Chromiumchecks in productiebuild op desktop 1440 en mobielviewport 390: geen horizontale overflow; popovers binnen viewport; focusherstel, focuslus en Escape; volledige vijfstappengids bij Invoice; alleen beschikbare drie onderdelen bij eigen bron zonder notatie; Data/Reports-tabtoetsen en behoud instellingen; echte data-/issue-downloads voor alle zes profielen en volledig review-XLSX; vertraagde PDF geannuleerd bij tabwissel. Geen brondatarequests of paginafouten. Desktop/mobielscreenshots intern visueel beoordeeld.

Dit is geen fysieke telefoontest, volledige WCAG-audit, formele R04/R12 of bewijs van livewerking. R07a-PDFinhoud en validatielogica zijn niet gewijzigd. R05 blijft open voor verdere leesbaarheid na gebruikersbeoordeling en R04.

## Oplevering

Cumulatief datapreflight-m7-r05a-guided-workflow.zip met R07a, dependencies en lokale font/licentie. Guard accepteert bekende R03- en R07a-versies, controleert alles voor kopiëren en weigert onbekende lokale wijzigingen. Na toepassing npm install, localhost vernieuwen. Rob beoordeelt uiterlijk en begeleiding; commit/push daarna apart. Hervatten R04 en resterende R05.
