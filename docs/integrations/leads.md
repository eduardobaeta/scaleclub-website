# Lead destinations

Every form posts to its endpoint in `src/pages/api/`; `src/features/leads/integrations/configured-lead-gateway.ts`
sends the validated lead to two providers and confirms the submission only after both accept it. While any variable
below is missing, the forms answer `503` and show their "unavailable" message.

| Variable                                          | Purpose                                                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ATTIO_API_TOKEN`                                 | Attio access token with `record_permission`, `object_configuration`, `list_entry` and `list_configuration` read-write |
| `ATTIO_DEAL_OWNER_EMAIL`                          | E-mail of the Attio workspace member who owns new deals                                                               |
| `BREVO_API_TOKEN`                                 | Brevo API key; the account must not restrict API calls by IP, because Vercel Functions have no fixed address          |
| `BREVO_EBOOK_LIST_ID`, `BREVO_NEWSLETTER_LIST_ID` | Brevo lists in the "Scale Club" folder                                                                                |

## Attio (CRM)

| Form                      | Result                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `meeting-request`         | Person upserted by e-mail + deal "Mesa · {name}" in stage "New lead"                           |
| `mentoring-application`   | Company found or created by name + person + deal "Mesa · {company}" with team size and problem |
| `ebook-request`           | Person + entry in the "Double Diamond e-book" list, stage "Downloaded"                         |
| `newsletter-subscription` | Person + entry in the "Newsletter" list                                                        |

A person keeps one open deal per product: a later meeting request or application updates it (name, source, company, team size,
problem) and leaves stage, owner and value as the team set them. When a person in the e-book list opens or updates a
deal, their e-book entry moves to "Converted". Existing list entries are never re-created, so their stage is
not reset.

Workspace configuration the adapter relies on (created through the API on 2026-11-25):

- Lists on People: `ebook_double_diamond` (status `stage`: Downloaded, Engaged, Converted) and `newsletter`.
- People: `lead_source` select ("Meeting request (site)", "Mesa application", "Double Diamond e-book", "Newsletter").
- Deals: `product` select ("A Mesa"; one option and one filtered Kanban view per product, as Attio recommends
  for pipelines that share stages), `lead_source` select, `team_size` select ("1–4 people" … "50+ people"), `problem` text; stages
  renamed to "New lead", "First meeting", "Won 🎉" and "Lost"; value R$ 4.500 (set the Value attribute's
  currency to BRL in Attio's settings, the API cannot change it).

## Brevo (e-mail)

E-book and newsletter leads join their list (`updateEnabled` keeps one contact per e-mail). E-book leads then receive
the transactional template "[site] - scale club - entrega e-book double diamond", sent by `scale@criamosmomentum.com`;
its HTML source is `docs/integrations/brevo-ebook-email.html` and the PDF is `public/materials/ebook-double-diamond.pdf`.
The e-mail links to the production domain, so the PDF must be deployed there.
