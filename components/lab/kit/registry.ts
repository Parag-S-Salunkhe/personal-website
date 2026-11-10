// What the /lab index lists. One line each, plain language.
export type LabEntry = { id: string; title: string; line: string }

export const EXPERIMENTS: LabEntry[] = [
  { id: 'table-orbit', title: 'Table orbit', line: 'A candle-lit 3D table for eight; scrolling moves the camera from seat to seat.' },
  { id: 'projector-beam', title: 'Projector beam', line: 'A dark room, a volumetric projector cone with dust, flicker and film grain.' },
  { id: 'curtain', title: 'Curtain', line: 'A velvet curtain that parts as you scroll.' },
  { id: 'plates-physics', title: 'Plates physics', line: 'Plates and cutlery drop and settle with real physics; drag to toss them.' },
  { id: 'painted-guests', title: 'Painted guests', line: 'Hand-painted guests around a table, breathing and chatting; one reacts to you.' },
  { id: 'popup-book', title: 'Pop-up book', line: 'The dinner party as a paper pop-up book that unfolds with scroll.' },
  { id: 'tilt-shift', title: 'Tilt-shift flat', line: 'A miniature flat at dusk with depth-of-field blur; lights come on as you scroll.' },
  { id: 'infinite-zoom', title: 'Infinite zoom', line: 'Street, window, table, plate, film frame and back to the street, without end.' },
  { id: 'kinetic-type', title: 'Kinetic type', line: 'Split headlines, a weight swell and a split-flap NOW SHOWING board.' },
  { id: 'deco-marquee', title: 'Deco marquee', line: 'An Art Deco marquee with chasing bulbs and letters that light up.' },
  { id: 'silent-film', title: 'Silent film', line: 'Title cards, sepia grain, gate weave and iris transitions.' },
  { id: 'poster-to-page', title: 'Poster to page', line: 'A poster card grows into its movie page (shared-element transition).' },
  { id: 'spotlight-wall', title: 'Spotlight wall', line: 'A dark poster wall lit by your cursor; cards tilt in 3D.' },
  { id: 'steam-shader', title: 'Steam shader', line: 'GLSL steam, candle flame and heat haze over a dish.' },
  { id: 'particle-name', title: 'Particle name', line: '"Parag" built from popcorn particles that scatter as you scroll.' },
  { id: 'webgl-gallery', title: 'WebGL gallery', line: 'A scroll gallery of posters and dishes with liquid WebGL distortion.' },
  { id: 'illusions', title: 'Illusions', line: 'An anamorphic word that reads from one scroll position, plus parallax depth.' },
  { id: 'blender-hero', title: 'Blender hero', line: 'A vintage film projector modelled in Blender, lit in real time.' },
]

export const DIRECTIONS: LabEntry[] = [
  { id: 'table-for-eight', title: 'A. Table for Eight', line: 'The supper club as a living table: eight seats, eight sections, candlelight.' },
  { id: 'late-show', title: 'B. Late Show', line: 'Curtain, marquee and projector beam; the posters come alive; dinner is the pre-show.' },
  { id: 'dinner-and-a-movie', title: 'C. Dinner & a Movie', line: 'Scrolling is the evening passing, 7pm to 1am: the table dims into the home cinema.' },
  { id: 'wildcard', title: 'D. Wildcard', line: 'The most surprising experiment grown into a whole site.' },
]
