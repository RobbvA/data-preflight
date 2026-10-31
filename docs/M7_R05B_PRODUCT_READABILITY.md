> R05b lokaal toegepast en goedgekeurd door Rob. De daaropvolgende uitrol over alle zes profielen staat in [R05c](M7_R05C_READABLE_RECORDS.md); de onderstaande proefbeschrijving is historische registratie.

# M7 R05b — Representatief Product-voorstel

31 oktober 2026. Basis: R04-push 3d6eecdb92da9d596cf6cbdbd1a22bdbb2fc8eec. Voorbereid; Robs lokale beoordeling, commit/push en live staan open.

| Element | Voor | Voorstel |
| --- | --- | --- |
| Hoofdprobleem en herstelactie | 14px / 20px | 16px / 24px |
| Rij-/issuetelling | 12px | 14px |
| Veldnamen in Details | 12px | 14px |
| Hersteltekst | secondary #c9c0b5 | primary #e5dac8 |

Alleen ProductReviewRecord activeert readableText in gedeelde ReviewRecord. De andere vijf profielen behouden hun stijl. Kaartpadding, neutrale achtergrond #1a1a18, kop/omschrijving, volgorde, probleemselectie en Details-bediening blijven gelijk. Hoofdprobleem/herstel worden niet extra herhaald. Verplichte inhoud wordt niet afgekapt; lange tekst mag doorlopen. Een kaart wordt daardoor iets hoger wanneer tekst omslaat, zonder extra padding.

## Bewijs

Productvoorbeeld op 1440 en 390px in lokale productie-Chromium: daadwerkelijk gerenderde fontgroottes, normaal tekstcontrast tegen de bestaande achtergronden, zichtbare rij/probleem/herstelactie, uitgeklapte Details, toetsenbordbediening en geen horizontale overflow gecontroleerd. Gemeten hersteltekst/cardcontrast 12.61:1 en rijlabel/cardcontrast 9.70:1. Normale tekst voldoet op de gecontroleerde kaarten aan 4.5:1; bestaande kleuren zijn behouden behalve helderdere hersteltekst. Product-export blijft exact 001 en 005 (2 rijen), 5 Blocked/0 review/2 Ready. Invoice-hoofdhersteltekst blijft aantoonbaar 14px. Geen paginafouten of brondatarequests.

Productiebuild/TypeScript geslaagd; lint nul fouten en twee bestaande warnings. Geen volledige zesprofieltest opnieuw gedraaid voor deze kleine presentatieproef; R04 is het recente functionele bewijs. Geen volledige WCAG-audit of live-/fysiek telefoontest geclaimd.

## Beoordelen en hervatten

Pakket toepassen, localhost verversen en Product / Material → Try example bekijken. Beoordeel vooral of probleem en herstel makkelijker leesbaar zijn en de kaart compact genoeg blijft. Open één Details-paneel. Geen npm install of verplichte dubbeltest.

Na akkoord dezelfde regels consequent uitrollen naar alle zes profielen en de tijdelijke readableText-proefvariant verwijderen. Daarna resterende R05-labels/contrast rond mapping/review/export gericht nalopen. R05 niet nu al volledig afvinken; andere geplande M7-pakketten blijven behouden.
