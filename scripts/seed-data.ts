/**
 * Starter content for the real estate site.
 * Condo pages are adapted from Nadeem Khan's existing building pages on propertylimit.com.
 * Articles are general guidance (no market statistics) and can be edited or replaced in the admin panel.
 * Photos are bundled stock images (public/images/re). Condo photos are generic placeholders, not the actual buildings.
 */
import { SITE_IMAGES } from "../src/lib/content-types";

export const SAMPLE_CONDOS = [
  {
    slug: "absolute-city-centre-mississauga",
    name: "Absolute City Centre",
    address: "70, 80 & 90 Absolute Avenue, Mississauga, ON L4Z 0A3",
    city: "Mississauga",
    neighbourhood: "City Centre (Square One)",
    intersection: "Burnhamthorpe Road & Hurontario Street",
    developer: "",
    summary:
      "A lifestyle community at the heart of Mississauga's City Centre, close to Square One, with a three-storey recreation club, 24-hour gatehouse and landscaped grounds.",
    description:
      "Absolute City Centre is a large-scale condominium community right at the four corners of Burnhamthorpe and Hurontario in Mississauga's City Centre. Each tower is joined to a central recreation facility, the Absolute Club, by pathways and landscaped grounds with an outdoor trail.\n\nResidents are steps from Square One Shopping Centre, Celebration Square, transit and the restaurants and services of the downtown core, with quick access to Highways 403, 401 and the QEW.\n\n## Thinking of buying, selling or renting here?\n\nContact Nadeem for current availability, recent sales in the building and a personal tour.",
    details: [
      { label: "Property type", value: "Condominium apartment" },
      { label: "Parking", value: "Underground, with secured visitor parking" },
    ],
    featureGroups: [
      {
        heading: "The Absolute Club",
        items: [
          "Heated indoor pool with whirlpool",
          "Seasonal outdoor pool and sun deck with BBQs",
          "Gym for volleyball, half-court basketball and badminton",
          "Indoor running and walking track",
          "Fitness centre, strength training area and studio for yoga and pilates",
          "Squash courts, billiards room and card room",
          "Theatre room, party rooms and guest suites",
        ],
      },
      {
        heading: "Security & convenience",
        items: [
          "24-hour manned gatehouse",
          "Card access throughout common areas",
          "Camera-monitored entrances and parking",
          "Car wash bay in the underground garage",
          "Professionally landscaped grounds with walkways and fountains",
        ],
      },
    ],
    images: [SITE_IMAGES.condoTowers1, SITE_IMAGES.condoTowers2],
    mapQuery: "70 Absolute Ave, Mississauga, ON",
    featured: true,
    order: 1,
  },
  {
    slug: "the-essex-etobicoke",
    name: "The Essex",
    address: "5229 & 5233 Dundas Street West, Etobicoke, ON",
    city: "Toronto",
    neighbourhood: "Etobicoke City Centre",
    intersection: "Dundas Street West & Kipling Avenue",
    developer: "Tridel",
    summary:
      "A 21-storey Tridel residence set in parkland near Kipling Station, with a 24-hour concierge, indoor pool and easy access to downtown Toronto and Pearson Airport.",
    description:
      "Located on the south side of Dundas Street West, just west of Kipling Avenue, The Essex sits within a well-established Etobicoke neighbourhood surrounded by gardens, courtyards and walkways. Kipling subway and GO station are a short walk away, putting downtown Toronto about 20 minutes away by transit.\n\nResidents enjoy nearby shopping along Bloor Street and in Bloor West Village, Cloverdale Mall, and the ravine trails of the Humber River and Etobicoke and Mimico Creeks. Highways 401, 427 and the QEW are minutes away, and Pearson International Airport is about a ten-minute drive.\n\n## Thinking of buying, selling or renting here?\n\nContact Nadeem for current availability, recent sales in the building and a personal tour.",
    details: [
      { label: "Property type", value: "Condominium apartment" },
      { label: "Suites", value: "One, two and two-plus-den bedroom layouts" },
      { label: "Maintenance fees include", value: "Heat, water, building insurance, central air, parking, common elements" },
      { label: "Heating", value: "Gas, forced air with central air conditioning" },
      { label: "Laundry", value: "Ensuite" },
      { label: "Parking", value: "Underground" },
    ],
    featureGroups: [
      {
        heading: "Amenities",
        items: [
          "24-hour concierge",
          "Indoor swimming pool",
          "Exercise room",
          "Theatre",
          "Virtual golf and sports lounge",
          "Two party rooms with kitchens",
          "Barbecue area",
        ],
      },
    ],
    images: [SITE_IMAGES.condoMidrise1, SITE_IMAGES.condoMidrise2],
    mapQuery: "5233 Dundas St W, Etobicoke, ON",
    featured: true,
    order: 2,
  },
];

export const SAMPLE_POSTS = [
  {
    slug: "preparing-your-home-for-sale",
    title: "Preparing your home for sale: a practical checklist",
    category: "Seller Advice" as const,
    excerpt: "Small, inexpensive improvements can help your home make a great first impression and sell with confidence.",
    coverImage: SITE_IMAGES.articlePrepareHome,
    body:
      "First impressions matter. Buyers often decide how they feel about a home within minutes of walking through the door, and many first see it online. A little preparation goes a long way.\n\n## Outside\n\n- Tidy the lawn, garden beds and walkways\n- Clean windows, the front door and light fixtures\n- Make sure the house number is easy to read\n- Clear snow and ice promptly in winter\n\n## Inside\n\n- Declutter every room and clear kitchen and bathroom counters\n- Repair small things: dripping taps, loose handles, burnt-out bulbs\n- Consider fresh, neutral paint where walls are marked or very bold\n- Let in as much natural light as possible\n\n## Pricing and timing\n\nThe right price depends on recent comparable sales, current competition and market conditions in your area. **A market evaluation** before you list helps you set expectations and avoid sitting on the market too long.\n\nThinking of selling? Contact Nadeem for a free market evaluation of your home.",
  },
  {
    slug: "closing-costs-for-ontario-home-buyers",
    title: "Closing costs every Ontario home buyer should budget for",
    category: "Buyer Advice" as const,
    excerpt: "Your down payment is only part of the picture. Here are the closing costs to plan for before you buy.",
    coverImage: SITE_IMAGES.articleClosingCosts,
    body:
      "When you budget for a home, plan for more than the purchase price and down payment. Closing costs are paid on or before closing day and can add up quickly.\n\n## Common closing costs\n\n- **Land transfer tax:** Ontario land transfer tax applies to every purchase, and properties in the City of Toronto also pay a municipal land transfer tax. First-time buyers may qualify for refunds.\n- **Legal fees and disbursements:** your real estate lawyer handles title searches, registration and the closing itself.\n- **Title insurance:** protects against certain title problems and is often arranged by your lawyer.\n- **Home inspection:** strongly recommended before you firm up an offer.\n- **Mortgage default insurance:** usually required if your down payment is below 20%. It is typically added to the mortgage, but provincial sales tax on the premium is paid at closing.\n- **Adjustments:** you may reimburse the seller for property taxes or utilities they have prepaid.\n- **Moving and setup:** movers, utility connections and any immediate repairs.\n\n## Plan ahead\n\nUse the land transfer tax calculator and mortgage calculator on this site for an estimate, then confirm the details with your lawyer and lender.\n\nQuestions about budgeting for your purchase? Contact Nadeem.",
  },
  {
    slug: "why-work-with-a-real-estate-professional",
    title: "Why work with a real estate professional?",
    category: "Market Commentary" as const,
    excerpt: "With so much information online, why hire an agent? Here is what a professional brings to your purchase or sale.",
    coverImage: SITE_IMAGES.articleWhyAgent,
    body:
      "With listings available online, some buyers and sellers wonder whether they need an agent at all. Here is what a real estate professional brings to the table.\n\n## Education and experience\n\nYou do not need to know everything about buying and selling real estate when you work with someone who does.\n\n## Neighbourhood knowledge\n\nAgents know the area, can identify comparable sales and can point you to information on schools, transit and amenities.\n\n## Price guidance\n\nAn agent helps you weigh the data so you can make the right choice on price, then builds a negotiation strategy around market supply, demand and conditions.\n\n## Market conditions\n\nAverage prices, days on market and list-to-sale ratios all influence how you should approach a purchase or sale.\n\n## Negotiation and confidentiality\n\nAgents can take the emotion out of negotiations and keep your information confidential from the other side.\n\n## Paperwork and follow-through\n\nToday's agreements are detailed, and small mistakes can be costly. A good agent manages the details, and is still there to answer questions after closing.\n\nReady to talk about your plans? Contact Nadeem.",
  },
];
