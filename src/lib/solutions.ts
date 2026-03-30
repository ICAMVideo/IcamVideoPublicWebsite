export type SolutionItem = {
  slug: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
};

export const solutions: SolutionItem[] = [
  {
    slug: "tipper-side-tipper",
    name: "Tipper / Side Tipper",
    imageSrc: "/Tipper/truck.png",
    imageAlt: "Tipper side tipper solution layout",
  },
  {
    slug: "tautliner-box-body",
    name: "Tautliner / Box Body",
    imageSrc: "/Tautliner/truck.png",
    imageAlt: "Tautliner box body solution layout",
  },
  {
    slug: "fuel-tanker",
    name: "Fuel Tanker",
    imageSrc: "/FuelSolution/truck.png",
    imageAlt: "Fuel tanker telematics overview",
  },
  {
    slug: "bus",
    name: "Bus",
    imageSrc: "/Bus/Bus.png",
    imageAlt: "Bus solution layout",
  },
  {
    slug: "yellow-metal-mining",
    name: "Yellow Metal / Mining",
    imageSrc: "/Mining/Mining.png",
    imageAlt: "Mining yellow metal solution layout",
  },
  {
    slug: "taxi-car",
    name: "Taxi / Car",
    imageSrc: "/Taxi/Taxi.png",
    imageAlt: "Taxi and car solution layout",
  },
  {
    slug: "ambulance-security",
    name: "Ambulance / Security",
    imageSrc: "/Ambulance/Ambulance.png",
    imageAlt: "Ambulance and security solution layout",
  },
  {
    slug: "other",
    name: "Other",
    imageSrc: "/Other/Other.png",
    imageAlt: "Other solution layout",
  },
  {
    slug: "all",
    name: "All",
    imageSrc: "/All/All.png",
    imageAlt: "All solutions overview layout",
  },
];

export function getSolutionBySlug(slug: string) {
  return solutions.find((item) => item.slug === slug);
}
