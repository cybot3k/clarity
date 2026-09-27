import type { Passage } from '@/types/session';
import type { SkillKey } from '@/types/history';

/**
 * Short, targeted exercises. Drills are Passage-shaped so the whole session
 * flow (teleprompter, scoring, results) works on them unchanged — only the
 * `drill-` id prefix marks the session record's mode.
 *
 * Artwork alphas stay < 1 so card glass reads through (see PassageCarousel).
 */
export const DRILLS: Passage[] = [
  {
    id: 'drill-minimal-pairs',
    title: 'Minimal Pairs',
    duration: '~1 min',
    category: 'drill',
    skills: ['accuracy'],
    artwork: {
      base: ['rgba(213,93,77,0.92)', 'rgba(148,52,108,0.85)'],
      blob: ['rgba(242,206,134,0.92)', 'rgba(239,131,107,0.55)'],
    },
    targetWpm: 100,
    text: `Ship and sheep. Bit and beat. Full and fool. Pull and pool. Live and leave. Fill and feel. Sit and seat. Chip and cheap.

Berry and very. Best and vest. Bat and vat. Boat and vote. Ban and van. Bowl and vole.

Three and free. Thread and Fred. Thirst and first. Think and sink. Thank and sank. Path and pass.

Light and right. Long and wrong. Lice and rice. Glass and grass. Fly and fry. Play and pray.`,
  },
  {
    id: 'drill-twister-sprint',
    title: 'Twister Sprint',
    duration: '~1 min',
    category: 'drill',
    skills: ['accuracy'],
    artwork: {
      base: ['rgba(29,137,121,0.92)', 'rgba(35,99,155,0.85)'],
      blob: ['rgba(161,245,201,0.9)', 'rgba(98,210,238,0.55)'],
    },
    targetWpm: 120,
    text: `Red leather, yellow leather. Red leather, yellow leather. Red leather, yellow leather.

Unique New York, unique New York, you know you need unique New York.

The sixth sick sheik's sixth sheep is sick. The sixth sick sheik's sixth sheep is sick.

Truly rural, truly rural, truly rural. Eleven benevolent elephants. Eleven benevolent elephants.`,
  },
  {
    id: 'drill-slow-read',
    title: 'Slow & Steady',
    duration: '~1 min',
    category: 'drill',
    skills: ['pace'],
    artwork: {
      base: ['rgba(99,83,187,0.92)', 'rgba(61,69,149,0.85)'],
      blob: ['rgba(178,203,246,0.9)', 'rgba(134,150,242,0.55)'],
    },
    targetWpm: 110,
    text: `Take a breath before you begin. Let each word arrive on its own time, unhurried and complete. There is no prize for finishing first.

Notice the pauses between sentences. They belong to you. A pause is not empty space. It is the frame that gives your words their shape.

Speak as if the listener is writing down every word. Give them time to keep up. Slow is smooth, and smooth is clear.`,
  },
  {
    id: 'drill-brisk-read',
    title: 'Brisk Delivery',
    duration: '~1 min',
    category: 'drill',
    skills: ['pace'],
    artwork: {
      base: ['rgba(214,138,50,0.92)', 'rgba(186,82,74,0.85)'],
      blob: ['rgba(245,233,161,0.92)', 'rgba(240,171,115,0.55)'],
    },
    targetWpm: 170,
    text: `The market opens in five minutes and there is a lot to cover, so let's move. Headlines first, details after, questions at the end.

Shipping is up, inventory is down, and the new line launches Friday in three colors and two sizes. The team pulled the deadline forward a week and still landed every feature on the list.

Keep the energy up and the words crisp. Fast does not mean sloppy. Every syllable still gets its moment, just a shorter one.`,
  },
  {
    id: 'drill-flow-lines',
    title: 'Smooth Flow',
    duration: '~1 min',
    category: 'drill',
    skills: ['fluency'],
    artwork: {
      base: ['rgba(45,133,165,0.92)', 'rgba(55,87,175,0.85)'],
      blob: ['rgba(170,233,245,0.9)', 'rgba(115,180,240,0.55)'],
    },
    targetWpm: 140,
    text: `The river does not stop to think about the stones; it simply finds its way around them, and the melody of moving water never breaks.

Let one sentence hand the next its momentum, the way a relay runner passes the baton at full stride, without a stumble, without a look back.

When a word trips you, glide on. The sentence carries you forward, and the current is always stronger than the stone.`,
  },
  {
    id: 'drill-expressive-read',
    title: 'Expressive Read',
    duration: '~1 min',
    category: 'drill',
    skills: ['intonation'],
    artwork: {
      base: ['rgba(144,64,176,0.92)', 'rgba(93,53,157,0.85)'],
      blob: ['rgba(246,178,218,0.92)', 'rgba(198,134,242,0.55)'],
    },
    targetWpm: 130,
    text: `Listen! Do you hear it? Far below the cliffs, the sea is calling, soft at first, then rising, wave upon wave, until the whole shore rings with it.

"Not tonight," she whispered. Then louder, certain now: "Not ever."

The door creaked open. One step. Two. And there, in the pale light of the window, sat the cat, completely unbothered, as cats always are.`,
  },
];

/** Extra display metadata for drill cards on the Practice tab. */
export const DRILL_META: Record<
  string,
  { blurb: string; skill: SkillKey }
> = {
  'drill-minimal-pairs': { blurb: 'Sharpen tricky sounds', skill: 'accuracy' },
  'drill-twister-sprint': { blurb: 'Precision at speed', skill: 'accuracy' },
  'drill-slow-read': { blurb: 'Hold a calm 110 wpm', skill: 'pace' },
  'drill-brisk-read': { blurb: 'Crisp at 170 wpm', skill: 'pace' },
  'drill-flow-lines': { blurb: 'No stumbles, no stalls', skill: 'fluency' },
  'drill-expressive-read': { blurb: 'Make the words move', skill: 'intonation' },
};

export function getDrill(id: string | undefined): Passage | undefined {
  return DRILLS.find((d) => d.id === id);
}
