# M7 — Uitgebreid uitvoeringsplan voor het resterende werk

Versie 3.4 · 31 oktober 2026 · eigenaar Rob · status: gepland, niet geïmplementeerd.

Dit is de leidende aanvulling op M7_PLAN.md. Rob heeft de eerder buiten M7 geplaatste productverbeteringen expliciet naar M7 verplaatst. Bij strijd met oude uitsluitingen, volgorde of afsluitcriteria geldt dit document. Bestaande Price/Stock-contracten en geaccepteerde vormgeving blijven behouden. M7_PROGRESS.md bevat uitsluitend de actuele uitvoering en het hervatpunt.

## 1. Startpunt en bewijsgrenzen

- Remote main op 29 oktober gecontroleerd: `3fe3b2dd92b70976d9eeb9f99ff680072b83b3a0`, `feat: integrate stock balances workflow with quantity notation and reports`. M7.4e is dus gepusht. De Windows-werkmap is niet rechtstreeks bekeken; push bewijst geen eigen lokale gebruikersacceptatie of werkende liveflow.
- De voorbereidingscheckout bevat de zes profielen, exacte Price/Stock-adapter, gedeelde compacte kaarten en aparte Invoice-workspace. De lokale git-HEAD is ouder; de opgebouwde wijzigingen mogen niet worden gereset. Vergelijk bij bouwen met actuele remote én eventuele nieuwe lokale wijzigingen.
- Historisch bewijs M7.4e: 86 tests geslaagd, lint zonder fouten met twee bekende warnings, productiebuild geslaagd en gerichte browserchecks. Deze planronde voert die tests niet opnieuw uit en verklaart geen nieuwe test geslaagd.
- Open dataprobleem: Invoice gebruikt normalizeNumber; tekst `1.234` wordt `1234`. Invoice gebruikt nog niet de exacte Price/Stock-bronroute. Ook financiële vergelijkingen gebruiken momenteel JavaScript Number.
- M7.4f en de volledige eindtest zijn niet afgerond. Geen nieuwe profielnamen toevoegen om volledigheid te suggereren.

## 2. Eindresultaat en vaste grenzen

M7 levert multi-file met maximaal vijf bestanden, bestandstabs en gezamenlijke ZIP-export, naast zes betrouwbare generieke profielen, begrijpelijke review, CSV/XLSX-data-export, deelbare XLSX/PDF-reviewrapporten, één concreet ERP-template, begrensde lokale referentiecontroles en configureerbare regels, plus commerciële voorbereiding en een onafhankelijke praktijktest.

De consultant/implementatiemedewerker is de primaire ontwerpgebruiker; finance- en datamedewerkers moeten dezelfde flow zelfstandig kunnen volgen. Exact Online en AFAS zijn onderzoekskandidaten, geen reeds gekozen of ondersteunde bestemmingen. Odoo is alternatief. Partneraantallen, betalingsbereidheid en marktleiderschap uit aangeleverde adviezen zijn geen bewezen productfeiten.

Behoud zwart/koper/off-white, de geaccepteerde header/bronkaart, compacte records en Step 1 mapping → Step 2 review → Step 3 export. Alleen gerichte leesbaarheidsingrepen; Rob beoordeelt één representatief voorstel voordat we het uitrollen.

Blijft buiten dit plan: live ERP-connector, automatische import, accounts/SSO, cloudopslag/samenwerking, algemene scripting/rule builder, in-app broncelbewerking, automatische bulkcorrectie, fuzzy merging, valuta-/eenheidsconversie, voorraadmutaties/waardering/batches/serienummers, desktopapp en brede ondersteuning van meerdere ERP-systemen. Een benoemde herstelactie is geen automatische mutatie.

Commerciële voorbereiding betekent in M7 een aanbod, transparante limieten/entitlements en werkende demonstratie van beschikbare betaalde meerwaarde. Echte betaalverwerking/accountinfrastructuur is niet stilzwijgend inbegrepen. Als Rob die wil, eerst een concreet aanvullend contract opnemen. Geen nep-checkout, fictieve aankoop of als veilig verkochte browser-only toegangscontrole.

## 3. Volgorde, afhankelijkheden en opleveringen

R05a is op 31 oktober op Robs verzoek vervroegd: exportbediening, contextuele hulp en optionele spotlightgids. Dit is een deeloplevering van R05; R04 en resterende leesbaarheidsacceptatie blijven open.

Op 31 oktober heeft Rob gevraagd ook de bestaande rapportexports direct mee te nemen; R07a wordt daarom na R03 en vóór R04 uitgevoerd. R07b bewaakt latere contextuitbreidingen. De oude M7.1–M7.4e blijven historische stappen. Onderstaande R-ID's identificeren de resterende werkpakketten; de afhankelijkheden bepalen de volgorde en R07a is expliciet vervroegd; M7.4f valt onder R04. De oude M7.5-eindtest verhuist naar R12–R14, na de nieuwe functies. Geen voltooiing van de oude eindtest gebruiken om de uitgebreide M7 af te sluiten.

| ID | Werkpakket | Afhankelijk van | Controleerbare oplevering |
| --- | --- | --- | --- |
| R00 | Baseline en plan toepassen | — | Actuele code/pushstatus, docs v3 en exact hervatpunt |
| R01 | Invoice exact getalcontract | R00 | Versiegewijzigd profiel, regressies, precieze bronroute |
| R02 | Checkboxbediening getalnotatie | R01 | Expliciete keuze zonder dropdown voor Invoice/Price/Stock |
| R03 | Eén exportbasis, gangbare bestandsformaten | R01–R02 | CSV (; of ,), XLSX, TXT/TSV-tab en JSON met dezelfde toegestane rijen |
| R07a | Rapportformats aansluitend op R03 | R03 | Issue-CSV/XLSX, volledig review-XLSX/PDF en actuele runcontext |
| R04 | Zesprofielintegratie, M7.4f | R03, R07a | Contextisolatie en ketenbewijs voor alle zes |
| R05a | Export-UX en optionele workflowhulp | R07a; expliciet vervroegd | Tabs, vraagtekens, gids; lokale beoordeling open |
| R05 | Resterende leesbaarheid en onboarding | R04, R05a | Eén beoordeeld voorstel, daarna consistente uitrol |
| R06 | Review zoeken/filteren/sorteren | R05 | Bruikbare grote lijsten zonder exportscopewijziging |
| R08 | Eerste ERP-template specificeren | R04; onderzoek kan eerder | Versiegebonden contract met bronverwijzingen en fixtures |
| R09 | Template, referenties en beperkte custom rules bouwen | R07a, R08 | Uitvoerbare regels, juiste export en duidelijke grenzen |
| R10 | Reviewbesluiten en herstel | R06, R09 | Waarschuwing accepteren met traceerbare registratie |
| R07b | Rapportcontext uitbreiden bij nieuwe functies | R06, R09, R10 | Templates/rules/reviewbesluiten meenemen zodra die bestaan |
| R11 | Commercieel aanbod en eerlijke upgradeflow | R07b, R09–R10 | Beschikbare meerwaarde, expliciete limieten, branded rapport |
| R11a | Multi-file wachtrij en bestandstabs | R04–R06, R10 | Maximaal vijf geisoleerde bestandssessies met individuele exports |
| R11b | Gezamenlijke ZIP-export | R03, R07b, R11a | Expliciet overzicht en volledige, actuele export per bestand |
| R12 | Uitgebreide tests profiel voor profiel | Alle functies; gerichte tests lopen steeds mee | Testlog voor zes profielen plus ERP-template |
| R13 | Onafhankelijke praktijktest en herstel | R12 | Observeerbare taakuitkomst en opgeloste belangrijke bevindingen |
| R14 | Definitieve release en afsluiting | R13 | Docs, checks, lokale bevestiging, push, deployment en livebewijs |

R08-onderzoek kan naast de bouw plaatsvinden; implementatie van het template wacht op een bewezen contract. Wachten op een gebruiker blokkeert onafhankelijke technische pakketten niet. Geen vaste sessieduur of deadline beloven: per sessie een bruikbaar checkpoint, meerdere kleine pakketten mogen samen.

## 4. R01 — Invoice zonder heuristische getalinterpretatie

Contract voor de implementatie: één expliciete decimaalnotatie per bron, van toepassing op amount en vat. Geen automatische detectie op basis van land, browsertaal, bedrag of bestandsnaam. Hergebruik de strikte decimalen en broncelmetadata uit Price/Stock waar passend; wijzig hun domeinregels niet.

| Invoer als tekst | Punt gekozen | Komma gekozen |
| --- | --- | --- |
| `1.234` | exacte decimaaltekst `1.234` | Blocked |
| `1,234` | Blocked | exacte decimaaltekst `1.234` |
| `1234` | `1234` | `1234` |
| `12.50` / `12,50` | alleen `12.50` geldig | alleen `12,50` geldig, export `12.50` |
| `1.234,56`, `1,234.56`, `1 234`, `€12`, `1e3`, `+1`, `.5`, `12.` | Blocked | Blocked |
| `-0.00` / `-0,00` | alleen passend teken; numeriek nul | alleen passend teken; numeriek nul |

Duizendtalscheiding is binnen dit contract niet toegestaan. De interface zegt dat expliciet: puntnotatie betekent niet dat `1,234` duizend tweehonderdvierendertig is. Vooraf ontbrekende keuze blokkeert de run, ook bij integer-only bron. Buitenste witruimte mag weg; interne witruimte blijft ongeldig.

De businessbetekenis blijft: bedrag niet positief waarschuwt, negatieve VAT waarschuwt, VAT hoger dan bedrag en verdachte ratio volgen de bestaande regelernst. Leg die ernst vóór wijziging vast in regressies. VAT is in het bestaande Invoice-profiel verplicht en blijft verplicht; leeg wordt niet stil nul. De eerdere formulering over optionele VAT is gecorrigeerd na codecontrole. Ongeldige getallen blokkeren en veroorzaken geen fictieve aanvullende rekenwaarschuwingen.

Gebruik exacte teken/decimaalvergelijkingen voor financiële grenzen en ratio's; bijvoorbeeld VAT > 30% zonder afrondende Number-conversie. Geen nieuwe precisie verliezen om oude checks na te bootsen. Excel formule/date/boolean/error/percentage-cellen in de financiële velden afwijzen volgens het expliciete numerieke broncontract; echte getalcellen lezen uit opgeslagen waarde, niet weergegeven afronding. Andere Invoice-velden en datums behouden hun contract. Behoud bronwaarden voor rapportage.

Wijzig Invoice-profielversie bij deze gedragswijziging. Bestaande opgeslagen kolommappings blijven vindbaar met zichtbare compatibiliteitscontrole; ze slaan notatie niet op en omzeilen de keuze niet. Werk voorbeeld en exacte verwachte aantallen bij als het oude voorbeeld gemengde notaties heeft; geen tests aanpassen zonder inhoudelijke verwachting.

Acceptatie: punt/komma/ongeldig, lange decimalen, grenswaarden VAT-ratio, negatief/nul, XLS/XLSX stored-versus-displayed en echte downloads getest. `1.234` wordt nergens ongemerkt `1234`.

## 5. R02 — Checkbox zonder verborgen standaardkeuze

Robs voorkeur: geen notatiedropdown. Voorgestelde concrete bediening: twee compact weergegeven keuzes met checkboxuitstraling en wederzijds exclusief gedrag: `Punt — 12.50` en `Komma — 12,50`. Gebruik toegankelijke radiogroepsemantiek voor deze één-uit-twee-keuze. Geen enkele binaire checkbox waarbij niets doen ongemerkt punt betekent, en geen twee tegelijk actieve keuzes. Rob beoordeelt dit compacte voorstel bij implementatie; de voorkeur voor checkboxbediening blijft leidend.

Interne toestand is unset/point/comma. Eigen nieuwe bron start unset, ook met dezelfde bestandsnaam. Voorbeeldpreset is zichtbaar. Notatiewijziging valideert opnieuw; remapping bewaart de huidige keuze. Reset, bronvervanging en bevestigde profielwissel ruimen brongebonden context op. Annuleren van profielwissel behoudt de run. Saved mappings bewaren alleen kolommen.

Acceptatie: muis/toetsenbord/mobiel, geen bypass door saved mappings, late uploads of exporthandlers; rapport volgt de actieve keuze.

## 6. R03 — Exportcontract voor CSV, XLSX, TXT, TSV en JSON

Architectuur: één getypeerde exportdataset uit de actuele validatierun. Alle writers gebruiken dezelfde kolommen/rijen/volgorde. Op 31 oktober heeft Rob expliciet om de relevante gangbare exportkeuzes gevraagd; CSV heeft een puntkomma-/kommakeuze, TXT en TSV zijn tabgescheiden en JSON is een array van records met stringwaarden voor scripts/integraties. XML volgt alleen bij een concreet ERP-schema; PDF blijft een reviewrapport onder R07. Exportknoppen vragen geen alternatieve validatie aan. Reviewfilters veranderen nooit de data-export; toon dit en toon inclusie/exclusieaantallen bij de actie.

- CSV: behoud UTF-8/BOM en puntkomma als standaard; bied ook een expliciete kommakeuze. Voor TXT/TSV dezelfde quoting met tabs. JSON bevat geen BOM en behoudt waarden als strings; vaste headerorde en correcte quoting voor quotes/newlines/separators. Genormaliseerde decimalen gebruiken punt. ERP-template mag alleen met gedocumenteerd eigen contract afwijken.
- XLSX: één sheet met schone data; identifiers en exacte decimalen als tekstcellen om voorloopnullen, schaal en lange precisie te behouden. Datums als expliciete ISO-tekst. Geen formules of automatische typegok. Geen automatische Number-conversie voor een mooiere weergave. Een later ERP-template dat numerieke cellen vereist moet eigen bewezen verliesvrije grenzen hebben en anders blokkeren.
- Uitleg: CSV bewaart tekstwaarden, maar Excel kan bij direct openen typen raden. XLSX is de voorspelbare tekstbehoudende uitvoer. Geen Excel-auto-open-garantie voor CSV geven.
- Bestaande issue- en validation-CSV's blijven beschikbaar. Reviewrapporten hebben een eigen actie; geen schone data in PDF als importbestand presenteren.
- Spreadsheet-formuleachtige tekst (`=`, `+`, `-`, `@`, tabs) opnemen in exporttests. XLSX schrijft uitdrukkelijk tekst, nooit formule. Voor CSV/TXT/TSV geldt vanaf R03: formuleachtige tekst blokkeert deze download met een zichtbare herstelactie naar XLSX/JSON; normale negatieve decimaalwaarden blijven toegestaan. Deze regel is ook op CSV-rapporten van toepassing, met passende herstelmelding. Geen stille neutralisatie. Algemeen: importwaarden niet stil wijzigen met apostrofs of formules. Risicovolle tekst moet zichtbaar behandeld worden; als ongewijzigde CSV niet veilig kan worden aangeboden, die download blokkeren met herstelactie en XLSX aanbieden. Geldige negatieve decimaalwaarden zijn geen formuletekst. Test ook rapportcellen.

Acceptatie: echte bestanden downloaden en onafhankelijk teruglezen; `000123`, lange IDs, `12.5000`, nul, Unicode, multiline, lege optionele velden, all-blocked en warning-only. Geen interne keys in data. Templateheaders en schrijvers hebben expliciete tests.

## 7. R04–R06 — Integratie, leesbaarheid en review

R04: zes voorbeelden en eigen CSV/XLSX/XLS, worksheetkeuze, mappingguards, saved mappings en contextisolatie. Price blijft 8 Blocked/1 review/2 Ready met drie exportrijen; Stock 7/0/3 met drie inclusief nul. Invoice krijgt zijn eigen nieuwe fixtureverwachtingen. Product zonder eenhedenlijst claimt geen referentiecontrole. Profielwissels lekken geen notation/template/reference/branding/acceptancecontext.

R05: toon één representatieve Product- of Invoice-run inclusief mapping, review en export op 1440px en 390px. Doelwaarden: essentiële probleem-/hersteltekst circa 16px, ondersteunende tekst bij voorkeur minstens 14px; normaal tekstcontrast minstens 4.5:1. Meet werkelijke kleuren. Geen volledige accessibilitycertificering claimen. Compact door herhaling te verwijderen, niet door belangrijke tekst te verkleinen. Rij/record, hoofdprobleem en herstelactie blijven direct zichtbaar; reden en andere velden onder Details. Status gebruikt tekst en icoon naast kleur. Behoud de bestaande indeling. Na Robs gerichte beoordeling dezelfde regels toepassen op alle zes.

Onboarding: profiel → bron/example → relevante bronkeuzes/mapping → automatische review → export. Geen extra wizardstappen. Samenvatting verschijnt pas als een geldige run bestaat; bij onvolledige mapping geen oude aantallen tonen. Korte privacytekst beschrijft feitelijke datastroom; foutmeldingen geven de volgende actie. Toon echte voortgang als beschikbaar, anders indeterminate laden. Houd export goed bereikbaar zonder mobiele content te bedekken.

R06: tekstzoekactie over record-ID/rij/bronveld/waarde/probleem, filters status/ernst/type/kolom en voorspelbare sortering bronrij of ernst. Filters combineren expliciet en zijn met één actie te wissen. Toon `zichtbaar X van Y`; lege filteruitkomst biedt reset. Exporteer alle rijen zonder blockers, onafhankelijk van zoekactie. Foutentelling telt issues; recordtelling telt unieke rijen. Geen dubbele telling bij meerdere issues. Test stabiele bronrijidentiteit en details na sorteren. Optimaliseer rendering pas bij gemeten knelpunt.

## 8. R07 — Deelbaar reviewrapport

Eén reportmodel voedt CSV, XLSX en PDF, zodat aantallen en uitleg overeenkomen. XLSX bevat Summary, Issues, Rows en Validation context. Ook een volledig geslaagde run zonder issues heeft een rapport en een expliciete lege Issues-sheet. PDF bevat leesbare samenvatting/context en gepagineerde issues met herhaalde kolomkoppen; nooit stil afkappen. Te grote PDF expliciet weigeren met XLSX-alternatief, op basis van geteste grens.

Inhoud: bronnaam/worksheet, profiel- en templateversie, mapping, notatie, referentiecontext, toegepaste custom rules, rij-/statustellingen, exportbesluit per rij, bronrij/record/veld, oorspronkelijke en eventuele genormaliseerde waarde, problem/why/fix en bekende niet-uitgevoerde controles. Een warning-issue op een verder geblokkeerde rij mag niet ten onrechte melden dat die rij geëxporteerd wordt; rijbesluit is leidend.

Branding: optionele consultant-/organisatienaam in rapportkop, standaard DataPreflight-herkomst zichtbaar. Naam is optionele metadata, geen identiteit/certificering. Logo-upload/white-label platform niet nodig voor eerste versie. Geen rapport of brondata naar server versturen. Exportmetadata/timestamp apart van deterministische validatieinhoud houden.

Acceptatie: PDF renderen en visueel controleren op lange waarden, paginering, Unicode en lege issues; XLSX teruglezen en cellen/aantallen controleren; alle formaten stemmen overeen.

## 9. R08–R09 — Eén ERP-template met aantoonbare regels

R08 levert vóór implementatie een contractbestand met ERP/productversie/importfunctie/object, create-versus-update, officiële specificatie of daadwerkelijk importvoorbeeld, verplichte/optionele velden, headers/volgorde/typen/formaten, duplicaatsleutel, bestaande-ID-semantiek, toegestane referenties en uitvoerformaat. Kies tussen Exact Online/AFAS/Odoo op beschikbare bewijsstukken en een bereikbaar praktijkcontact, niet op een generieke populariteitsclaim.

Voorkeursobject is een bestaande Customer- of Product-taak, definitief vast te leggen na onderzoek. Eén ERP en één importobject; geen verbintenis aan alle genoemde systemen. Template is versiegebonden overlay op een profiel, geen zevende generieke profielnaam. Template-selector verschijnt alleen waar relevant. Zonder aantoonbaar contract status Geblokkeerd/onderzoek open; geen verzonnen regels, geen universele Ready for import-belofte.

Referenties: hergebruik Product-unitcheck, voeg alleen door template vereiste product/leverancier/magazijn/codelijsten toe. Lokale CSV/XLSX-bestanden in geheugen; configureer header en exacte matchregel. Trim/casebeleid expliciet per code, voorloopnullen behouden, geen fuzzy matching of joins. Missende/verouderde referenties en ongeldige vervanging zijn zichtbaar; oude lijst mag geen actieve schijnzekerheid geven. Voor template-verplichte referentie blokkeert ontbrekende lijst een volledige template-run; generiek profiel kan met beperkte controle verder. Bron- en referentielezingen krijgen onafhankelijke stale-resultguards.

Beperkte custom rules: extra verplicht veld, toegestane waarden en numeriek minimum/maximum voor toepasselijke profielvelden. Geen uitvoerbare JS/regex of willekeurige formules. Gebouwde blockers niet uitschakelen of verlagen. Rule-config krijgt versie en zichtbare herkomst; alleen configuratie mag optioneel lokaal opgeslagen worden, niet de referentiewaarden of bronrijen. Wijziging veroorzaakt nieuwe run en maakt reviewbesluiten ongeldig.

Acceptatie: positieve/negatieve fixture met exact exportbestand; onbekende referentie, ontbrekend lijstje, dubbele codes, ongeldige vervanging, remapping, switch/reset/late load; templateversie en effectieve regels zichtbaar in UI/rapport. Proefimport waar een geschikte testomgeving beschikbaar is, anders expliciet nog niet bewezen. Geen echte bedrijfsimport zonder afzonderlijke opdracht.

## 10. R10 — Herstel en geaccepteerde waarschuwingen

Correctie blijft in het bronbestand, gevolgd door herupload/validatie. Een issue wordt alleen opgelost door de nieuwe run, nooit via een cosmetisch vinkje. Een waarschuwing mag bewust geaccepteerd worden met optionele reden en zichtbare registratie; Ready en validatie-ernst veranderen niet. Warn-only rijen waren al exporteerbaar; acceptatie introduceert geen nieuwe exportrechten.

Bewaar besluiten alleen in geheugen, gebonden aan bronidentiteit/worksheet/mapping/profielversie/template/notatie/referenties/rules/run. Geen hergebruik op basis van rijpositie of bestandsnaam alleen. Nieuwe context wist besluiten; filter/sortering niet. Rapport vermeldt geaccepteerd versus nog niet beoordeeld, zonder geverifieerde revieweridentiteit te suggereren. Geen audittrail met wettelijke garanties claimen.

## 11. R11 — Marktintroductie voorbereiden

Aanbod richt zich op consultants/implementatiepartners met een herhaalbare importtaak. Leg vast: gratis waarde, betaalde meerwaarde, transparante rij-/bestandslimieten en wanneer grotere volumes/ERP-template/custom rules/branded rapport beschikbaar zijn. Laat bestaande generieke profielen bij voorkeur bereikbaar; definitieve grenzen en prijs vooraf met Rob vaststellen op prestaties en praktijkgesprekken, niet verzonnen marktonderzoek.

Zet limieten vóór upload of vóór kostbaar werk duidelijk neer. Geen betaald slot nadat iemand onverwacht zijn hele herstelwerk heeft gedaan. Overlimiet blokkeert expliciet; nooit een deel van de bron valideren/exporteren alsof het volledig is. Upgrade verschijnt bij relevante beschikbare meerwaarde zonder essentiële foutuitleg te verbergen. Zonder echte entitlementinfrastructuur is dit eerlijk een aanbod-/interesseflow, geen veilig afgedwongen abonnementsproduct. Contact-/wachtlijstacties alleen bouwen met afgesproken bestemming; nooit zelfstandig berichten versturen.

Acceptatie: aanbod klopt met werkende functies, geen demo als aankoop presenteren, limietgrenswaarden getest, brandingrapport werkt, privacytekst onderscheidt brondata van eventuele vrijwillig verstuurde contactgegevens. Echte checkout vergt een expliciete aanvullende scopebeslissing.

## 11a. R11a–R11b — Multi-file, tabs en gezamenlijke ZIP binnen M7

Robs expliciete aanvulling van 30 oktober vervangt uitstel tot na M7. Scope: maximaal vijf bestanden per actieve sessie, CSV/XLSX/XLS, afzonderlijke verwerking en exports, plus gezamenlijke ZIP. Single-file blijft dezelfde eenvoudige route; geen automatische samenvoeging of cross-file duplicaat/referentiecontrole.

Architectuur: hergebruik dezelfde adapters, mapping, normalisatie, validators, review en exportmodel. Maak bestandssessies met eigen stabiele sessionId, source-generationId, profiel/versie/template, werkblad, mapping, notatie, referenties/rules, runresultaat, fouten en reviewbesluiten. Nooit bestandsnaam of tabpositie als identiteit gebruiken. Eerst een dunne sessiegrens om de huidige workspaces; geen tweede validatiesysteem en geen brede herbouw van domeinregels.

Een gecontroleerde wachtrij verwerkt maximaal één zware bronlees-/parsetaak tegelijk. Statussen: wachten, lezen, keuze nodig, gevalideerd, mislukt, geannuleerd. Mapping/worksheet/notatievragen gelden alleen voor dat bestand en blokkeren niet de rest van de wachtrij. Een bestandsfout stopt andere bestanden niet. Meet geheugen en UI-respons; verplaats zwaar werk pas naar een worker wanneer nodig. Annulering voorkomt steeds het publiceren van oude resultaten; onderscheid logisch annuleren van het daadwerkelijk onderbreken van een synchrone parser.

UX: tabs tonen herkenbare bestandsnaam plus status; gelijke namen krijgen een zichtbaar uniek achtervoegsel. Actieve tab toont de bekende drie stappen. Wisselen bewaart iedere bestandscontext. Sluiten verwijdert alleen die sessie en annuleert pending werk; kies voorspelbaar een overblijvende tab. Laat een bestand toevoegen/vervangen per sessie toe; zesde bestand wordt duidelijk geweigerd, niet stil overgeslagen. Nieuwe bron wist alleen de brongebonden keuzes van die sessie. Profielwissel wordt per bestand bevestigd. Mobiele tabbalk horizontaal scrollbaar; labels/focus/pijltjestoetsen/closeknop toetsenbordtoegankelijk. Totaaloverzicht telt bestandsstatussen en resultaten zonder onbehandelde bestanden als Ready te presenteren.

ZIP-contract: individuele exports blijven. Vóór downloaden een overzicht van geselecteerde bestanden, hun runstatus, exportrijen, warnings, uitgesloten blockers en rapportkeuze. Per bestand een veilige unieke map, bijvoorbeeld `01-bestand`, met gekozen CSV/XLSX en gevraagde rapporten. Geen path traversal of overschrijven bij dezelfde naam. All-blocked bestand levert alleen rapporten en een expliciete nul-data-uitleg. Een ongelezen/geannuleerd/mislukt bestand heeft geen valide data-export: gebruiker kiest zichtbaar uitsluiten, of het ZIP vermeldt dit bestand alleen met foutstatus in het overzicht; nooit een fictief validatierapport maken. Geen bestand stil laten verdwijnen.

ZIP bevat machineleesbaar manifest met oorspronkelijke bestandsnaam, unieke map, profiel/templateversie, geteste runcontext, status, aantallen, opgenomen bestanden en expliciete uitsluitredenen. Gebruik dezelfde schrijvers als individuele downloads. Neem een consistente snapshot van actuele runs; bij wijzigingen tijdens generatie ZIP annuleren of opnieuw opbouwen met zichtbare melding, nooit oude en nieuwe context mengen. Genereer achtereenvolgens om geheugen te beheersen, bied annulering en ruim buffers/object-URL's op. Geen upload van ZIP of brondata naar server.

Acceptatie: vijf gemengde profielen/bestanden, twee gelijke namen, verschillende sheets/notaties/mappings/referenties, fout tussen geldige bestanden, switch tijdens lezen, sluiten/wachtrij annuleren, verwijderen/toevoegen, replace/reset terwijl andere sessies actief zijn, zesde bestand, keyboard/mobiel en geheugenbelasting. Download ZIP werkelijk, pak uit en vergelijk iedere CSV/XLSX/rapportinhoud met de verwachte individuele export van exact dezelfde run. Inspecteer manifest en uitsluitingen; geen dubbele of verloren entries. R12–R14 volgen pas na deze twee pakketten.

## 12. R12 — Testmatrix, profiel voor profiel

Volgorde: Invoice → Customer → Vendor → Product → Price List → Stock Balances → ERP-template. Gerichte tests lopen tijdens bouwen mee. Finale matrix op de laatste releasebasis; geen routineherhaling zonder wijziging of nieuwe onzekerheid.

| Testgroep | Vereiste controles voor ieder toepasselijk profiel |
| --- | --- |
| T01 Bron | Voorbeeld, eigen CSV/XLSX/XLS, Unicode, leading zeros, lange waarden, reordered headers, meerdere sheets |
| T02 Ongeldige bron | Leeg/header-only/kapot/verkeerd type/verkeerd profiel/lege sheet, daarna herstellen |
| T03 Mapping | Verplicht ontbreekt, dubbele toewijzing, ambiguity, herstel zonder herupload |
| T04 Saved mappings | Opslaan/toepassen/vervangen/verwijderen/reload; versie/missende kolom/corrupte of onbeschikbare opslag |
| T05 Regels | Iedere regel geraakt, alle statussen, meerdere issues per rij, duplicaten; geen kunstmatige warnings |
| T06 Numeriek | Punt/komma/ongeldig, nul/negatief/precisie, Excel celtypen/opmaak, geen stil waardeverlies |
| T07 Review | Bronrij/identiteit, probleem/reden/fix, zoeken/filteren/sorteren, lege categorie, warningacceptatie |
| T08 Data-export | Echte CSV en XLSX downloaden/teruglezen, exacte cellen/kolommen/rijen, blockers eruit, warnings erin |
| T09 Rapporten | CSV/XLSX/PDF, juiste runcontext, oorspronkelijke waarden, rijbesluit, branding, PDF visueel |
| T10 Lifecycle | Zelfde naam nieuwe bron, replace tijdens laden, reset, switch bevestigen/annuleren, late oude read, reference/rules/notation wijzigen |
| T11 Herhaalbaarheid | Zelfde effectieve context geeft dezelfde genormaliseerde waarden/status/export; brondataset niet muteren |
| T13 Multi-file/ZIP | Sessies/queue/tabs/gelijke namen, individuele en uitgepakte gezamenlijke downloads, cancellation en snapshotconsistentie |
| T12 Bediening/privacy | 1440px/390px, contrast/tekst, keyboard/focus/Escape, netwerk en opslagobservatie |

Profielspecificaties: Customer/Vendor IDs/contact/land/duplicaten; Product unitcheck met en zonder lijst; Price complete tuple en nulprijswarn; Stock product-magazijn inclusief unitconflict en nul Ready; Invoice financiële grenzen/datums/status. Bestaande exacte Price/Stock-fixtures blijven gelden. Regressies omvatten bestaande Excel-headerbotsingen en realistische XLS-formules, niet alleen gegenereerde XLSX.

Belasting: deterministische 1.000- en 10.000-rijenfixtures op vastgelegde omgeving met meerdere issues; duur/geheugen/bruikbaarheid en exportvolledigheid noteren. Geen limiet of performanceclaim zonder bewijs; grotere stressrun alleen bij knelpunt of gekozen commerciële grens. Test exacte grens en grens+1 van ingestelde limieten. Browserviewport is geen fysieke telefoon; fysieke telefoon afzonderlijk noteren.

Testlogvelden: ID/profiel/fixture/versie of pakkehash/context/omgeving/verwachting/werkelijk resultaat/bewijspad/status/datum. Status Pass, Fail, Not applicable met reden, Blocked met reden. Omgevingsblokkade of ontbrekend ERP-account is geen Pass. Kritieke dataverwerking, exportbypass, privacy- of lifecyclefout oplossen vóór acceptatie. Per fix falende case + geraakte regressie; volledige suite/lint/build op gedeelde checkpoints en releasebasis.

## 13. R13–R14 — Praktijkbewijs en release

Onafhankelijke taak: kies profiel/template, laad eigen representatief bestand, kies sheet/notatie, controleer mapping, verklaar blocker/warning, herstel bron, herupload, hergebruik mapping en kies de juiste export. Observeer zonder uitleg; hulp registreren. Noteer twijfels, tijd, fouten en begrip van export/Ready. Vergelijk waar mogelijk met de oude werkwijze. Eén test bewijst geen markt of betalingsbereidheid; vraag expliciet naar herhaling en commerciële waarde zonder aankoop te veronderstellen.

Belangrijke onduidelijkheden herstellen en de geraakte taak opnieuw laten proberen. Gebruiker werven vergt Robs opdracht voor outreach. Ontbreekt deelnemer of ERP-testomgeving, blijft dat zichtbaar open; technische checks mogen intussen af, volledige acceptatie wordt niet verzonnen. Rob kan een expliciete scope-/acceptatiebeslissing nemen.

Release: complete suite, lint zonder nieuwe waarschuwingen/fouten, productiebuild/TS; definitieve docs en testlog. ZIP → Rob past lokaal toe → gebundelde lokale bevestiging → reviewbare diff → commit/push → remote controleren → deployment controleren → gerichte livechecks apart. Geen volledige matrix bij elk cosmetisch pakket herhalen. Bron-/referentiedata in bestanden/rapporten zijn alleen door gebruiker gedownloade output, geen verborgen opslag.

M7 klaar wanneer alle R-pakketten hun acceptatiecriteria hebben, kritieke bevindingen weg zijn, afgesproken leesbaarheid door Rob is beoordeeld, zes profielen plus template aangetoond werken, export-/rapportinhoud klopt, commerciële voorbereiding eerlijk is en documentatie/local/push/livebewijs overeenkomen. Open externe validatie is expliciet open, niet stil afgevinkt. Na acceptatie geen automatische nieuwe polishronde.

## 14. Startkaart voor de volgende bouwsessie

1. Lees M7_PROGRESS.md en dit plan; controleer nieuwste remote en Robs werkmapstatus. Geen nieuwe volledige audit.
2. Pas documentatiepakket v3 toe als nog niet gedaan. Behoud bestaande ongepushte wijzigingen.
3. Actief bouwdoel R01 (op 31 oktober gestart in voorbereiding): Invoice-getalcontract, exacte bronwaarden en financiële regressies.
4. Lever compleet ZIP-pakket met gerichte checks. Daarna R02 checkboxbediening en R03 exportkeuze.
5. Werk per oplevering voortgang bij: voorbereid/getest in voorbereiding/lokaal bevestigd/gepusht/live gecontroleerd. Noteer exacte volgende actie en open keuzes.

## 15. Onderbouwing en besluiten

- Rob, 29 oktober: alle eerder beschreven uitbreidingen vallen expliciet binnen M7; uitgebreid testen profiel voor profiel; goedgekeurde vormgeving behouden.
- Codecontrole 29 oktober: Invoice gebruikt normalizeInvoice.ts → normalizeNumber.ts en validateRows.ts met Number; exportData.ts schrijft momenteel CSV. Dit zijn concrete startpunten, geen al uitgevoerde fixes.
- Microsoft Support, geraadpleegd 29 oktober: https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers — automatische typeconversie en grens van 15 significante cijfers ondersteunen expliciete tekstcellen. Verloren bronprecisie/voorloopnullen kunnen niet achteraf gereconstrueerd worden.
- Odoo importdocumentatie, geraadpleegd 29 oktober: https://www.odoo.com/documentation/master/applications/general/base_import/import_faq.html — consistente External ID bij updates illustreert waarom create/update-semantiek in een templatecontract hoort. Geen keuze voor Odoo of bewijs voor Exact/AFAS-regels.
- Officiële doelgroepkanalen: https://www.exact.com/nl/partners en https://www.afas.nl/dienstverlening/partnernetwerk/implementatiepartner . Dit bewijst bereikbare partnerkanalen, geen koopbereidheid.
- Open productbesluiten vóór bijbehorend pakket: checkboxvoorstel beoordelen (R02), ERP/object/versie kiezen uit bewezen contract (R08), gratis/betaalde grenzen/prijs/contactbestemming afspreken (R11). Deze blokkeren R01 niet.

- Rob, 30 oktober: multi-file expliciet binnen M7, met bestandstabs en gezamenlijke ZIP-export. Uitgewerkt op 31 oktober als R11a/R11b, vóór de eindtest. Geen multi-file-implementatie in het R01/R02-pakket.

- Rob, 31 oktober: na R01/R02 meer relevante gangbare exportkeuzes onderzoeken en toepassen. R03 uitgebreid naar CSV met scheidingstekenkeuze, XLSX, tabgescheiden TXT/TSV en JSON voor integratiegebruik. Onderbouwing en bewijs: M7_R03_EXPORT_FORMATS.md. Geen generiek ERP-XML of import-PDF.

- Rob, 31 oktober: na R03 ook rapportexports aanpassen; R07a naar voren gehaald. Issues CSV/Excel; volledig reviewrapport Excel/PDF. Bestaande context-CSV behouden. R07b volgt de nog te bouwen template/rules/reviewbesluiten.
