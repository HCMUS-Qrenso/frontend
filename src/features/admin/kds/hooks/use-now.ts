/**
 * useNow Hook
 * Single tick timer for the entire KDS board
 * Avoids creating individual intervals per ticket card
 */

import { useState, useEffect } from 'react'

/**
 * Returns current timestamp, updating every tickMs
 * @param tickMs - Update interval in milliseconds (default 1000ms = 1s)
 */
export function useNow(tickMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // Initial update
    setNow(Date.now())

    // Set up interval
    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, tickMs)

    // Cleanup
    return () => clearInterval(intervalId)
  }, [tickMs])

  return now
}
