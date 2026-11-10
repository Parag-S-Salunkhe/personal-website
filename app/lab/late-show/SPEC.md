# Late Show (/lab/late-show)

A small repertory cinema after dark; the page is tonight's programme.

- Palette (dark only): velvet #2B0B14 page, curtain #6B1A2B raised surfaces, brass #D8A84E frames and rules,
  beam #FFF3D6 text, tungsten #FF9F43 bulbs, headline and the one button, seat #1F5C5A felt on the cooking row.
- Type: Big Shoulders Display 800/900 (marquee and signage, uppercase), Instrument Sans (body and UI).
- Signature moment: curtain call. Two velvet-fold curtains gather to the edges (scaleX, 1.3s, the site curve),
  revealing a marquee board whose bulbs chase once and stay lit. A projector beam and 24 dust specks sit behind;
  they pause when the hero is offscreen. Reduced motion: curtains already open, bulbs steady, no drift.
- Motif: marquee bulbs, ticket perforations and notches (CSS mask), film-leader poster fallback, torn tickets, felt letterboard.
- Cards: movie = brass-framed poster plus ticket stub (rating as punched holes); dish = felt menu board with a
  dotted price line and a cloche drawing (no photos exist); post = programme note; note = torn ticket.
- Light/dark: dark only, by design (a cinema after dark).
- Site-design section 3 avoided: not near-black plus one accent (oxblood, brass, beam, tungsten and teal all play);
  no cream plus serif plus clay; no SaaS card kit (frames, stubs, felt and paper differ); no eyebrow labels,
  gradient text, numbering, glass or side borders; icons are lucide or authored SVG.
- Data: real rows from getLabData(), junk and [test] titles shown as they are. Guestbook posts to /api/guestbook.

With more time: stagger the poster row in as a film strip, a seat-row footer drawing, a proper dish page
treatment, and a stub-tear animation on a successful note.
