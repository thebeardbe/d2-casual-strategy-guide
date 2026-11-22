interface GuideProps {
  onBack: () => void
}

const VIDEO = 'https://www.youtube.com/watch?v=J1EFUYGk4CA'

/** Seconds where the video explains the hallway rule, not the player or stairs. */
const HALLWAY_AT = 147
const CATEGORIES_AT = 343

/**
 * The rule behind every card, on its own page so it can be linked and read once.
 * Wording follows the video; the links jump to the exact moment it is explained.
 */
export function Guide({ onBack }: GuideProps) {
  return (
    <article className="guide">
      <header className="guide__header">
        <h1 className="guide__title">How to read a map</h1>
        <p className="guide__lede">
          Every Diablo II map is built from tiles that fit together in many ways, but the exit almost
          always sits at a fixed angle from the way the entrance hallway points. That single rule is
          what the cards use.
        </p>
      </header>

      <section className="guide__section">
        <h2>1. Find the hallway, not the stairs</h2>
        <p>
          The question is <em>which way does the entrance pathway send me</em>. Not which way the
          stairs face, not which way your character faces, and not which way the doors next to it
          face. Look at the tile: if you cannot walk north, east or south out of it, then the hallway
          points west.
        </p>
        <p className="guide__source">
          <a href={`${VIDEO}&t=${HALLWAY_AT}s`} target="_blank" rel="noreferrer">
            Watch the video explain this at 2:27
          </a>
        </p>
      </section>

      <section className="guide__section">
        <h2>2. Turn 90 degrees from that hallway</h2>
        <p>
          In most caves and dungeons the exit pathway is 90 degrees counter-clockwise from the
          entrance pathway: line your character up with the entrance hallway, walk in, and take the
          first hallway that points to your left. Some levels go clockwise instead, and a few are
          straight, where the two hallways point the same way.
        </p>
        <ul className="guide__list">
          <li>Counter-clockwise: the exit is a left turn from the entrance hallway.</li>
          <li>Clockwise: the exit is a right turn instead. Few levels do this.</li>
          <li>Straight: entrance and exit point the same way, so keep walking.</li>
          <li>
            Random: no rule. Learn the dead-end hallway tiles and turn around the moment you see
            them.
          </li>
        </ul>
        <p className="guide__source">
          <a href={`${VIDEO}&t=${CATEGORIES_AT}s`} target="_blank" rel="noreferrer">
            Watch the video explain the categories at 5:43
          </a>
        </p>
      </section>

      <section className="guide__section">
        <h2>3. When it does not work</h2>
        <p>
          On Hell difficulty a big map can generate with the entrance and exit 90 degrees apart the
          other way round, so turning left leads nowhere. The moment you notice you cannot make that
          turn, stop and search near where you came in instead of pushing deeper. The bigger the map,
          the more likely this is, and it is still rare.
        </p>
        <p>
          On the level cards, the arrow diagram shows the rule, and the compass tool lets you enter
          the direction your own entrance hallway runs to read off the exit.
        </p>
      </section>

      <section className="guide__section">
        <h2>What the colours mean</h2>
        <p>
          The chart colours each area by how its map behaves: fixed layouts, a handful of fixed
          layouts, outdoor squares and rectangles, and the three turn rules. The legend under the
          chart names them, and every card repeats the type in words.
        </p>
      </section>

      <button className="guide__back" type="button" onClick={onBack}>
        Back to the chart
      </button>
    </article>
  )
}
