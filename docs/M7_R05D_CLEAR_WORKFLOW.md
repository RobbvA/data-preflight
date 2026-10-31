# M7 R05d — Leesbare labels en duidelijke vervolgstappen

31 oktober 2026. Basis fbe5790c6e9cda8bf405dcdcadc4a039da349576. Alle 148 uitgangsbestanden komen overeen met remote. De Windows-werkmap is niet rechtstreeks bekeken. Voorbereid; lokale acceptatie/push/live van dit pakket open.

## Wijzigingen

Ondersteunende tekst rond bron, mapping, saved mappings, reviewcategorieën/sorteren, Product-referentie en exportcontext gaat van 10–12px naar 14px. Geaccepteerde recordkaarten en globale kleuren/indeling blijven behouden. Zwarte tekst op de bestaande koperen upload-/mapping-/data-exportknoppen geeft 5.32:1 contrast; de eerdere lichte knoptekst voldeed niet aan de normale 4.5:1-doelwaarde.

Mappingmeldingen hergebruiken de bestaande missingRequiredFields/duplicateMappedHeaders. Ze noemen ontbrekende velden/dubbele kolommen en wijzen naar Complete mapping. Geen tweede validatiesysteem of gewijzigde guard. Het paneel focust de eerste ongeldige select. Done mapping sluit zonder te claimen dat de nog ontbrekende notatie al is ingesteld.

Notatiehulp noemt amounts and VAT, prices of quantities voor het actieve profiel. Geen gekozen waarde: leg uit dat vereiste kolommen en point/comma compleet moeten zijn voordat review/export verschijnen. Er wordt geen keuze afgeleid of automatisch ingevuld.

De optionele gids gebruikt actuele bron, mappingstatus en notatie. Bestanden die al geladen zijn krijgen uitleg over doorgaan/vervangen/resetten. Niet-beschikbare stappen worden niet verzonnen. Sluiten keert terug naar de opener én oorspronkelijke scrollpositie. Popovers blijven korte uitleg bij één beslissing. Geen tracking, opgeslagen voltooiing of verplichte nieuwe wizard.

## Gerichte verificatie

Productiebuild/TypeScript geslaagd; lint nul fouten/twee bestaande warnings (layout Metadata en DataSetPreview _tone). Gerichte productie-Chromiumchecks bij alle zes profielen op 1440/390: ontbrekende/dubbele mapping verwijdert resultaten; melding benoemt de juiste velden/kolommen; Complete mapping focust juiste instelling; herstel geeft exact dezelfde exportrijen; notatie blijft expliciet; hulp/gids toont actuele profiel-/bronstatus en sluit met focus/scrollherstel. 14px-labels in mapping/review/context en normaal knopcontrast >=4.5 gemeten. Geen horizontale overflow, paginafouten of brondatarequests waargenomen.

Product-mapping/review/export intern visueel beoordeeld op desktop en mobiel. De mobiele kop werd eerst samengedrukt door de actie ernaast; na gerichte correctie neemt kop/status mobiel de volle regel en blijft de bestaande actie eronder. Geen breed nieuw ontwerp.

Geen 134 domeintests of volledige R04-suite herhaald: domeinregels, exacte numerieke verwerking en writers zijn niet aangepast. Recente R04 blijft het brede functionele bewijs. Deze ronde controleert de werkelijke export na de gewijzigde UI, geen eigen nieuwe liveacceptatie of volledige WCAG-certificering.

Robs aangeleverde review op fbe5790/live meldt drie juiste Invoice-data-exportrijen en vier correcte reviewrijbesluiten zonder nieuwe blocker. Bewaar dat als aangeleverd, gericht Invoice-livebewijs; niet veralgemenen naar alle zes profielen.

## Hervatpunt

Pakket toepassen, localhost verversen en bron/mapping/hulp kort beoordelen. Geen npm install of volledige dubbeltest nodig. Na bevestiging R05 afsluiten en R06 review zoeken/filteren/sorteren uitvoeren. Alle overige M7-pakketten blijven gepland, inclusief één echt ERP-importcontract, exacte teruggelezen exports, onafhankelijke praktijktest en multi-file/tabs/gezamenlijke ZIP.
