export const PDA_AWARENESS = ["Unaware", "Problem Unaware", "Problem Aware", "Solution Aware", "Product Aware"] as const;
export const PDA_PERSONAS = ["DIY Artist / Songwriter", "Artist Manager", "Music Publisher", "Music Producer"] as const;

export type PdaAwareness = typeof PDA_AWARENESS[number];
export type PdaPersona = typeof PDA_PERSONAS[number];
