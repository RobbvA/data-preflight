# M7 R01/R02 — Invoice-getallen en expliciete notatiebediening

31 oktober 2026 · basis remote main `3fe3b2d` · gebouwd/getest in voorbereiding. Lokale toepassing/acceptatie, push en livecontrole van dit pakket nog niet bevestigd.

## Wat verandert

Invoice-profiel v1.1.0 vervangt heuristische getalnormalisatie door expliciete punt/komma. `1.234` is alleen bij puntkeuze een decimaal, nooit stil `1234`. Groepering, symbolen, exponenttekst en verkeerde/gemengde tekens blokkeren. Source metadata en mapping zijn vereist. Bedrag en VAT blijven verplicht; de bestaande businessernst (niet-positief bedrag/negatieve VAT/verdachte VAT als waarschuwing) blijft behouden. Nultekst verliest alleen minteken, niet schaal.

Exacte vergelijkingen beoordelen VAT > bedrag en VAT > 30% van bedrag zonder Number-afronding van financiële waarden. Lange tekstdecimalen blijven exact. De oude normalizeNumber-heuristiek en parseNormalizedNumber-conversie zijn verwijderd; Invoice gebruikt een runner met expliciete context in plaats van het contextloze generieke profielpad. Runtime kan zonder notatie geen resultaten/export opleveren.

De exacte adapter levert naast opgeslagen broncelwaarden ook geformatteerde tekst voor niet-financiële Invoice-velden. Daardoor blijven Excel-datums en geformatteerde factuurcodes als voorheen interpreteerbaar; financiële velden gebruiken uitsluitend getypeerde opgeslagen celwaarden. Price en Stock blijven hun eigen bronroute/contract gebruiken. Formule/date/boolean/error/percentage-cellen en onveilig grote numerieke cellen in amount/VAT blokkeren; een formulecache is geen goedgekeurd bedrag.

Invoice, Price en Stock delen compacte vierkante keuzen: één van punt/komma, met toegankelijke native radiogedragingen. Eigen bron start zonder keuze, ook dezelfde bestandsnaam. Voorbeelden hebben zichtbaar point. Saved mappings bewaren uitsluitend kolommen; versieverschil 1.0.2→1.1.0 vraagt de bestaande reviewbevestiging. Report vereist invoiceContext en vermeldt gekozen notatie, exacte financiële checks en beperkingen.

Dit pakket neemt plan v3.1 volledig mee, inclusief toekomstige multi-file/tabs/gezamenlijke ZIP. Die functies worden nu niet als geïmplementeerd gepresenteerd. Het eerdere v3-planpakket is geen vereiste.

## Uitgevoerde verificatie

- `npm test`: 101 geslaagd, 0 mislukt. 15 nieuwe Invoice-tests plus alle 86 bestaande regressies.
- Nieuwe tests: expliciete keuze/contextgates, dubbelzinnige punt/komma, ongeldige notaties, trim/schaal/lange waarden/niet-muteren, verplichte velden/zero/negatief, exacte VAT-grenzen, geen fictieve rekenwaarschuwing bij ongeldige invoer, unsupported Excel-typen, XLS/XLSX opgeslagen bedrag versus formatting, IDs/datums, XLSX-formules, remapping, legacy saved mapping, echte CSVdownload en rapportcontext.
- `npm run lint`: 0 fouten; 2 bekende bestaande warnings in app/layout.tsx (Metadata) en DataSetPreview.tsx (_tone). Geen nieuwe warnings.
- `npm run build`: productiebuild en TypeScript geslaagd.
- Headless Chromium op productiebuild, 1440px en 390px; geen horizontale overflow, één-uit-twee via keyboard, Escape/focusherstel. De nieuwe notatiebediening visueel bekeken op beide breedtes.
- Invoice-example exact 1 Blocked / 2 Needs review / 1 Ready. Data-download bevat INV-2001, INV-2002, INV-2004; INV-2003 ontbreekt. Issue-download heeft drie issues; rapport bevat v1.1.0 en actieve financiële context.
- Eigen CSV met dezelfde naam reset de keuze. Punt exporteert `1.234` en nultekst; komma exporteert uitsluitend de komma-rij als `1.234`; gemengde duizendtalsvorm blokkert. Warning-only nul blijft exporteerbaar.
- Legacy mappingversiewaarschuwing bevestigd; toepassen kan notatiekeuze niet omzeilen. Ontbrekende/dubbele mapping blokkeert resultaten; remapping behoudt actieve keuze. Geen rijen of notatie in localStorage.
- Eigen XLSX én XLS met meerdere sheets en herschikte kolommen: bedrag 12.3456 bij weergegeven €12.35 blijft 12.3456, tekst-VAT 2,5000 wordt 2.5000, factuurcode met 0000-opmaak blijft 0001 en datum blijft 2026-06-01. Booleanbedrag uitgesloten; XLSX-formulebedrag uitgesloten. Geen browser-XLS-formuleclaim: echte BIFF8-formules zijn reeds gedekt door de bestaande exact-adaptertest.
- Reset/cancel van vertraagde Excel-read, daarna nieuw voorbeeld en alsnog voltooien oude read: oude bron/keuze/resultaten keren niet terug. Annuleren profielwissel behoudt keuze; bevestigen wist broncontext. Price/Stock eigen bron vereist opnieuw keuze; overige drie profielen krijgen geen notatieoptie.
- Zes voorbeelden en werkelijke data-downloads gecontroleerd; exportaantallen stemmen overeen. Dit is gerichte integratie-smoke, geen afgeronde R04 of R12.
- Geen page errors of onverwachte requests bij deze routes geobserveerd; geen volledige securityaudit.

Interne browserreproductie: m7-visual-preview/invoice-r01-check.cjs met invoice-r01-results.json. Screenshots zijn intern controlebewijs en niet als deliverable opgeslagen.

## Grenzen en lokale beoordeling

Geen directe toegang tot Robs Windows-checkout, fysieke telefoon of functionele livecontrole in deze ronde. Geen bronprecisie of voorloopnullen reconstrueren die Excel eerder heeft verloren. CSV-waarden zijn correct, maar openen in spreadsheetsoftware kan alsnog automatische typeconversie uitvoeren; XLSX-export volgt in R03. Bestaande normale Invoice-datum-/contactregels zijn niet herontworpen. Algemene leesbaarheidsronde volgt in R05.

Gebundelde lokale checks na toepassen:

1. Invoice → Try example: 1 Blocked / 2 Needs review / 1 Ready, drie exportrijen; notatie punt is zichtbaar.
2. Upload `public/demo-data/messy-export.csv` als eigen bron: geen review/export tot een notatie gekozen is; punt herstelt dezelfde uitkomst.
3. Price en Stock: hetzelfde compacte vakjespaar; eigen bestand start zonder keuze. Beoordeel of de bediening binnen de geaccepteerde stijl past.

Na lokale bevestiging commit/push. Volgende bouwdoel R03: gedeelde data-export en keuze CSV/XLSX. Multi-file komt onder R11a/R11b vóór de definitieve eindtest.
