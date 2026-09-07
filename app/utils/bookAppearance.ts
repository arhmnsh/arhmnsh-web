export interface ShelfBook {
  id: string
  title: string
  author: string
  cover: string
  review: string
  purchaseUrl: string
}

// Visual bindings, not claims about an edition's actual page count or materials.
export function bookAppearance(id: string) {
  const seed = [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7)
  return {
    depth: 19 + seed % 12,
    height: 92 + seed % 9,
    lean: (seed % 5 - 2) * 0.6,
    color: ['#453d32', '#343b3b', '#604733', '#394635', '#4d3540'][seed % 5],
  }
}
