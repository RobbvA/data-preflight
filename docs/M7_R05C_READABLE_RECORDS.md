# M7 R05c — Goedgekeurde recordtekst over alle zes profielen

31 oktober 2026. Rob heeft het Productvoorstel lokaal toegepast en geaccepteerd: beter, niet perfect maar vooruitgang. Deze uitrol past exact die regels toe op Invoice, Customer, Vendor, Product, Price List en Stock via hun gedeelde ReviewRecord.

- Probleem en herstel: 16px / 24px regelhoogte, herstel in bestaande primaire tekstkleur.
- Rij-/issuetelling en detailnamen: 14px.
- Kaartpadding, achtergrond, volgorde en Details-bediening blijven gelijk.
- De tijdelijke readableText-proefproperty is verwijderd; één consistente implementatie.

Productiebuild/TypeScript geslaagd; lint nul fouten/twee bekende warnings. Alle zes voorbeelden op 1440/390px: daadwerkelijke tekstgroottes, toetsenbord-Details, geen horizontale overflow en echte exportaantallen (Invoice 3, Customer 2, Vendor 3, Product 2, Price 3, Stock 3) gecontroleerd. Geen paginafouten of brondatarequests. R05b mat op dezelfde gedeelde achtergrond/kleuren 12.61:1 hoofd-/hersteltekst en 9.70:1 rijlabel. Geen volledige WCAG- of liveacceptatie claimen. Domeinregels niet gewijzigd; recente groene R04-suite niet volledig herhaald voor deze tekstwijziging.

Cumulatief pakket accepteert bekende R04- en R05b-bestanden; onbekende lokale wijzigingen worden vóór kopiëren geweigerd. Geen npm install nodig. R05b is lokaal geaccepteerd; lokale toepassing/commit/push/live van deze uitrol staan open. R05 blijft open voor resterende kleine ondersteunende labels/contrast in mapping/review/export. Daarna R06; geen extra kaartontwerp of scopewijziging.
