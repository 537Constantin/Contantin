export type SkinType =
  | "Alle Hauttypen"
  | "Trockene Haut"
  | "Empfindliche Haut"
  | "Reife Haut"
  | "Mischhaut"
  | "Normale Haut";

export type Category = "Serum" | "Creme" | "Reinigung" | "Augenpflege" | "Toner" | "Öl";

export interface Product {
  id: string;
  name: string;
  promise: string;
  description: string;
  price: number;
  category: Category;
  skinType: SkinType;
  bestseller: boolean;
  rating: number;
  image: string;
  ingredients: string[];
  usage: string;
}

export const products: Product[] = [
  {
    id: "velvet-renewal-serum",
    name: "Velvet Renewal Serum",
    promise: "Feine Linien sichtbar verfeinern.",
    description:
      "Ein seidiges Premium-Serum mit gepflegter Textur für ein glattes, ebenmäßiges und strahlendes Hautbild.",
    price: 89,
    category: "Serum",
    skinType: "Alle Hauttypen",
    bestseller: true,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Niacinamid", "Peptide", "Hyaluron", "Squalan"],
    usage:
      "Morgens und abends 2–3 Tropfen auf die gereinigte Haut auftragen und sanft einarbeiten.",
  },
  {
    id: "pure-radiance-cream",
    name: "Pure Radiance Cream",
    promise: "Nährt intensiv und schenkt Komfort.",
    description:
      "Eine reichhaltige, dennoch moderne Pflegecreme für geschmeidige Haut und ein luxuriöses Finish.",
    price: 74,
    category: "Creme",
    skinType: "Trockene Haut",
    bestseller: true,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Ceramide", "Sheabutter", "Vitamin E", "Jojobaöl"],
    usage: "Als letzten Pflegeschritt morgens und abends auftragen.",
  },
  {
    id: "golden-dew-cleanser",
    name: "Golden Dew Cleanser",
    promise: "Milde Reinigung mit luxuriöser Haptik.",
    description:
      "Ein sanfter Cleanser, der Make-up, Alltagsspuren und überschüssigen Talg gründlich entfernt.",
    price: 42,
    category: "Reinigung",
    skinType: "Empfindliche Haut",
    bestseller: false,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Aloe Vera", "Panthenol", "Glycerin", "Haferextrakt"],
    usage: "Auf feuchter Haut einmassieren und mit Wasser abnehmen.",
  },
  {
    id: "luminous-eye-elixir",
    name: "Luminous Eye Elixir",
    promise: "Frischer Blick mit eleganter Leichtigkeit.",
    description:
      "Eine gezielte Augenpflege für ein geglättetes Erscheinungsbild und ein vitales, waches Aussehen.",
    price: 68,
    category: "Augenpflege",
    skinType: "Reife Haut",
    bestseller: false,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Koffein", "Peptide", "Hyaluron", "Magnolienextrakt"],
    usage: "Morgens und abends sanft um die Augenpartie einklopfen.",
  },
  {
    id: "silk-barrier-mist",
    name: "Silk Barrier Mist",
    promise: "Hydration in feinstem Sprühnebel.",
    description:
      "Ein ultrafeiner Pflege-Nebel zur Erfrischung, Durchfeuchtung und Vorbereitung der Haut auf die weitere Routine.",
    price: 48,
    category: "Toner",
    skinType: "Mischhaut",
    bestseller: false,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Rosenwasser", "Beta-Glucan", "Aminosäuren", "Glycerin"],
    usage: "Nach der Reinigung oder zwischendurch aufsprühen.",
  },
  {
    id: "nocturne-repair-oil",
    name: "Nocturne Repair Oil",
    promise: "Nächtliche Regeneration mit edlem Glow.",
    description:
      "Ein seidiges Gesichtsöl für die abendliche Pflegeroutine mit luxuriösem Hautgefühl und geschmeidigem Finish.",
    price: 79,
    category: "Öl",
    skinType: "Normale Haut",
    bestseller: true,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Arganöl", "Bakuchiol", "Squalan", "Aprikosenkernöl"],
    usage: "Abends 3–4 Tropfen als Abschluss der Routine auftragen.",
  },
];

export const categories: ("Alle" | Category)[] = [
  "Alle",
  "Serum",
  "Creme",
  "Reinigung",
  "Augenpflege",
  "Toner",
  "Öl",
];
