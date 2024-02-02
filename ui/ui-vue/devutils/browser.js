// Small utilities for convenience when testing / working on game UI stuff OUTSIDE of the game (in a normal browser)


/**
 * Run the passed function if we're outside of the game
 *
 * @param      {Function}  fn      The function to run
 */
export const runInBrowser = fn => {
  if (!window.beamng) fn()
}

