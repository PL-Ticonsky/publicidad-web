export type KeychainShapeGroup = "Geométricos" | "Troquel a medida" | "Con función";

export interface KeychainShape {
  id: string;
  name: string;
  group: KeychainShapeGroup;
  holeY: number;
  path: string;
}

// Geometrías 100 × 100 extraídas del inventario PP_SHAPES del export de Claude Design.
export const keychainShapes = [
  { id: "circulo", name: "Círculo", group: "Geométricos", holeY: 18, path: "M92 50a42 42 0 11-84 0 42 42 0 0184 0" },
  { id: "rect", name: "Rectángulo", group: "Geométricos", holeY: 26, path: "M14 16h72v68H14z" },
  { id: "cuadrado", name: "Cuadrado", group: "Geométricos", holeY: 26, path: "M22 14h56a12 12 0 0112 12v48a12 12 0 01-12 12H22a12 12 0 01-12-12V26a12 12 0 0112-12z" },
  { id: "hexagono", name: "Hexágono", group: "Geométricos", holeY: 22, path: "M50 6l38 22v44L50 94 12 72V28z" },
  { id: "casa", name: "Casa", group: "Troquel a medida", holeY: 30, path: "M50 8l42 36v48H8V44z" },
  { id: "carro", name: "Carro", group: "Troquel a medida", holeY: 42, path: "M10 62l12-24h22l10-12h28l10 36z" },
  { id: "gota", name: "Gota", group: "Troquel a medida", holeY: 30, path: "M50 6c18 22 30 34 30 50a30 30 0 01-60 0c0-16 12-28 30-50z" },
  { id: "corazon", name: "Corazón", group: "Troquel a medida", holeY: 30, path: "M50 88C22 68 10 54 10 38 10 24 21 14 34 14c7 0 13 3 16 8 3-5 9-8 16-8 13 0 24 10 24 24 0 16-12 30-40 50z" },
  { id: "estrella", name: "Estrella", group: "Troquel a medida", holeY: 30, path: "M50 6l12 30 32 2-25 21 8 31-27-18-27 18 8-31L6 38l32-2z" },
  { id: "escudo", name: "Escudo", group: "Troquel a medida", holeY: 24, path: "M50 6l38 12v34c0 22-16 34-38 42C28 86 12 74 12 52V18z" },
  { id: "destapador", name: "Destapador", group: "Con función", holeY: 20, path: "M36 10h28v20l6 10v54H30V40l6-10z" },
  { id: "placa", name: "Placa ID", group: "Con función", holeY: 26, path: "M26 14h48l16 20v40a8 8 0 01-8 8H26a8 8 0 01-8-8V22z" },
] as const satisfies readonly KeychainShape[];
