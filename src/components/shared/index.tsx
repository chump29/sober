// biome-ignore-all lint/suspicious/noExplicitAny: can log anything

/**
 * Find DOM element
 * @async
 * @function
 * @param {string} element - element identifier
 * @returns {Promise<HTMLElement>} DOM element
 * @throws {Error} If element not found
 */
const findElement = async (element: string): Promise<HTMLElement> => {
  const e: HTMLElement | null = document.querySelector(element)
  if (!e) {
    throw new Error(`Could not find element: ${element}`)
  }
  return e
}

/**
 * Format version string
 * @async
 * @function
 * @param {string | undefined} version - version string
 * @returns {Promise<string>} v[version], or N/A if undefined
 */
const getVersion = async (version: string | undefined): Promise<string> => {
  return version ? `v${version}` : "N/A"
}

export { findElement, getVersion}