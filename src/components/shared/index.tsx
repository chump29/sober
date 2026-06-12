/**
 * Find DOM element
 * @async
 * @function
 * @param {string} element - element identifier
 * @returns {Promise<HTMLElement>} DOM element
 * @throws {Error} If element not found
 */
const findElement = (element: string): HTMLElement | null => {
  return document.querySelector(element)
}

/**
 * Format version string
 * @async
 * @function
 * @param {string | undefined} version - version string
 * @returns {Promise<string>} v[version], or N/A if undefined
 */
const getVersion = (version: string | undefined): string => {
  return version ? `v${version}` : "N/A"
}

export { findElement, getVersion }
