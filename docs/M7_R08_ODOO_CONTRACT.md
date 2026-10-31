# M7 R08 / R09a — Odoo 19 company contacts

31 oktober 2026. Rob heeft Odoo als eerste bestemming goedgekeurd en staat meer templates toe. Eén eerste template geïmplementeerd; andere ERP-contracten worden afzonderlijk onderbouwd. Geen automatische broncorrecties. R09 is hiermee niet volledig afgerond: configureerbare custom rules en verdere lokale referenties blijven gepland.

## Contract v1.0.0

- ID: `odoo-19-customer-company`. ERP: Odoo 19.0, standaard Contacts, model res.partner, CSV/XLSX via Import records.
- Overlay op Customer v1.0.0; generieke regels en ernst blijven intact. Geen zevende generiek profiel. Dit template maakt bedrijfscontacten, geen volledig financieel ingerichte debiteuren.
- Keuze is per bron: nieuwe bron, worksheet of reset keert terug naar Generic customer. Templatewissel herberekent de run en wist reviewfilters/selectie. Opgeslagen mappings bewaren geen template.
- Import is create-or-update op External ID. Geen create-only-garantie. Vast namespace: datapreflight_customer. Customer-ID 000123 wordt datapreflight_customer.customer_000123. Reference blijft 000123. ID-case en voorloopnullen blijven behouden. Generieke duplicate-ID-controle blijft bewust hoofdletterongevoelig.
- Extra blockers: ID bevat iets anders dan ASCII letters/cijfers/underscore/hyphen; niet-lege landcode ontbreekt in de gebundelde Odoo 19 base-landenlijst. ID-beperking is een expliciete templatebeperking, geen universele Odoo-regel. Geen automatische vervanging van tekens.
- Landcontrole gebruikt 251 Odoo-baserecords met exacte XML-ID uit de officiële bron. Geen verzonnen base.xx-referentie voor een onbekend land; geen live databasecheck. Optionele lege landcode blijft leeg.
- Bestaande Customer-normalisatie blijft gelden (trim, naamwitruimte, e-mail lowercase en land uppercase); oorspronkelijke bronwaarden blijven in rapporten beschikbaar. Nieuwe automatische herstelacties zijn niet toegevoegd.

| Exportkolom, vaste volgorde | Waarde | Controle/grens |
| --- | --- | --- |
| id | datapreflight_customer.customer_<customer_id> | Verplicht/stabiel; bestaande ID kan update veroorzaken |
| name | genormaliseerde name | Verplicht volgens Customer-profiel |
| is_company | True | Template is uitsluitend bedrijfscontacten |
| email | genormaliseerde email | Optioneel; formaatfout blijft waarschuwing/exporteerbaar |
| country_id/id | base.<XML-ID uit landenlijst> | Optioneel; onbekende landcode blokkeert |
| vat | vat_number | Optioneel; inhoudelijke/fiscale geldigheid niet gecontroleerd |
| ref | customer_id | Referentie, niet het Odoo-matchmechanisme |

Technische veldheaders vermijden afhankelijkheid van vertaalde veldlabels. Controleer de preview/toewijzing in de doelomgeving; de bestaande schrijvers leveren CSV met gekozen separator of XLSX met expliciete tekstcellen. Geen JSON/TXT/TSV als ondersteunde Odoo-template-output aanbieden. Waarschuwingen blijven inbegrepen, blockers uitgesloten. Alle gemapte Customer-velden hebben een expliciete exportkolom.

Vóór data-export een verplichte bevestiging dat overeenkomende External IDs bestaande contacten kunnen bijwerken. Deze bevestiging is geen geverifieerde reviewbeslissing en verandert Ready niet. Bron/template/mappingwijziging wist bevestiging door een nieuwe exportcontext. Lege geëxporteerde optionele velden kunnen bestaande waarden wissen; dit staat bij Template details. Rapportdownload vereist deze data-exportbevestiging niet.

Rapportcontext bevat template-ID/versie, transformatie, headers, uitgevoerde controles, updategedrag en niet-uitgevoerde controles. Bestaande generieke rapporten blijven templatevrij.

## Bewijs en acceptatie

- Vier nieuwe betekenisvolle regressies: overlay zonder mutatie/afzwakking; exacte CSV/XLSX met warning-only rij; rapportcontext en tellingsvalidatie; ID/country-randgevallen en duplicaten. Zesrijenfixture: 3 Blocked, 1 Needs review, 2 Ready; export 3. De fixture en exacte verwachte export staan uitvoerbaar in tests/erp-template.test.mjs.
- Volledige bestaande testset plus nieuwe tests: 142 geslaagd, 0 mislukt. Gerichte ESLintcontrole zonder fouten/warnings. Productiebuild inclusief TypeScript geslaagd.
- Gerichte lokale productiebrowsercontrole geslaagd: generiek/template wisselen, werkelijke CSV/XLSX-downloads teruggelezen, blockers uitgesloten en warnings inbegrepen, bevestiging gewist bij template-/bronwissel, desktop en 390px zonder horizontale overflow; screenshots visueel bekeken. Geen browserfouten. De testrunner is intern; de eerste run gebruikte ten onrechte Try example na laden, waarna de runner is gecorrigeerd naar bronvervanging. Geen applicatiefout gevonden.
- Nog niet bewezen: proefimport in een Odoo-testdatabase, geïnstalleerde modules/maatwerk, gebruikersrechten, bestaande doel-ID's, fiscale VAT-controles en administratiespecifieke defaults. UI en rapport zeggen expliciet Trial import pending. Geen Ready for import-garantie.
- Lokale toepassing door Rob, commit/push en livecontrole van dit pakket zijn nog open.

## Officiële bronnen

- Importgedrag en External ID: https://www.odoo.com/documentation/19.0/applications/general/export_import_data.html
- Officieel Contacts-voorbeeld (daadwerkelijk gedownload en uitgelezen): https://raw.githubusercontent.com/odoo/odoo/19.0/odoo/addons/base/static/xls/contacts_import_template.xlsx
- Templatepad en veldmodel: https://github.com/odoo/odoo/blob/19.0/odoo/addons/base/models/res_partner.py
- Importveldtoewijzing: https://github.com/odoo/odoo/blob/19.0/addons/base_import/models/base_import.py
- Gebundelde landenbron: https://github.com/odoo/odoo/blob/19.0/odoo/addons/base/data/res_country_data.xml

Het officiële voorbeeld heeft Name*, Company Type*, Related Company, Email, Phone, Street, Street2, City, State, Zip, Country, Tax ID, Website, Tags, Reference, Notes. Ons beperkte contract kiest bewust geen adres-/hiërarchie-/tagsvelden; die zijn geen bestaande gemapte Customer-velden. External ID is een expliciete toevoeging uit de officiële importdocumentatie, niet gelijk aan Reference.

Bronbestanden gelezen op 31 oktober; branchinhoud vastgelegd via SHA-256:
- contacts_import_template.xlsx: 4eea531b4569def32408d64697cfef5c17b8ab8c7d6d4f2a08816305dc92f2b4
- res_partner.py: 1d5764c7aa35b2c086e987410b78f0b9aff920fd247122d44c0309402a3d5953
- base_import.py: 71127aadeb41f94e7856386e5db0525bda620a2236b961b0b516bd944b6c7ecf
- res_country_data.xml: 332f757dc987783aa2cc8de555498328fbe996dfc39a5b759200ff1207399ce4
