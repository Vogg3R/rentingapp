/** Fare halosu yayları */
export const HALO_SPRING = { stiffness: 90, damping: 28, mass: 0.55 } as const;

/**
 * Parallax gücü (-0.5…0.5 normalize fare ofsetinden px).
 * Üç ana katman: üst başlık alanı | ana içerik | alt / yan panel hissi.
 */
export const PARALLAX_LAYER = {
  header: { kx: -4, ky: -3 },
  listings: { kx: 5, ky: 4 },
  requests: { kx: -2, ky: -2 },
} as const;

export type ParallaxLayerKey = keyof typeof PARALLAX_LAYER;
