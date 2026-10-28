import {
  DesertRoseIcon, JadePlantIcon, IrishRoseIcon,
  HouseleekIcon, MandarinIcon, TomatoIcon, TradescantiaIcon,
} from './Icons';
import { Emoji } from './Emoji';
import type { CategoryDef, Plant, Severity, TabId } from './Types';
export const SOIL_OPTIONS = [
  'General',
  'Farmland',
  'Succulent',
  'Succulent with Perlite',
  'Citrus',
  'Orchid',
  'Bonsai',
  'Cactus',
  'Bromeliad',
  'Carnivorous',
  'African violet',
  'Seed starting',
  'Hydroponic',
];

export const POT_TYPE_OPTIONS = ['Planter', 'Round', 'Squared', 'Custom'];

export const POT_MATERIAL_OPTIONS = ['Ceramic', 'Plastic', 'Terracotta', 'Recycled wood'];

// Keep standard log choices separate so Settings can store only user-added fertilizers.
export const FERTILIZER_OPTIONS = ['Cucumber water', 'Normal', 'Banana Water'];

export const CATEGORIES: CategoryDef[] = [
  { id: 'succulents', label: 'Succulents',             emoji: Emoji.cactus, color: '#4A8C3A', bg: 'linear-gradient(135deg,#E8F5E0,#D0EBC0)' },
  { id: 'tropicals',  label: 'Tropicals & Houseplants',emoji: Emoji.hibiscus, color: '#8B3A7A', bg: 'linear-gradient(135deg,#FAF0F8,#EDD8EA)' },
  { id: 'citrus',     label: 'Citrus',                 emoji: Emoji.tangerine, color: '#C07010', bg: 'linear-gradient(135deg,#FFF3D0,#FFE090)' },
  { id: 'vegetables', label: 'Vegetables & Edibles',   emoji: Emoji.tomato, color: '#C03020', bg: 'linear-gradient(135deg,#FFE8E0,#FFCCC0)' },
];

export const PLANTS: Plant[] = [
  // ─── SUCCULENTS ─────────────────────────────────────────────────────────────
  {
    id: 'desert-rose',
    name: 'Desert Rose',
    latin: 'Adenium Obesum',
    category: 'succulents',
    pot: 'Ceramic',
    substrate: 'Succulent mix',
    potSize: '11.5 cm',
    color: '#E8B4A0',
    accent: '#C0574A',
    icon: DesertRoseIcon,
    details: {
      watering: { summer: 'Every 7–10 days', winter: 'Every 3–4 weeks', summerMl: 100, winterMl: 50 },
      light: 'Full direct sun (5–6h)',
      temp: '20–35°C',
      warning: 'White stones trap moisture — probe before watering!',
      tips: [
        'Water deeply, let drain fully through hole',
        'Check caudex for mealybugs regularly',
        'Repot every 2–3 years in spring',
        'Goes semi-dormant in winter — reduce water drastically',
      ],
    },
    fertilizer: {
      type: 'Bloom booster / Low-N phosphorus-rich',
      schedule: 'Once a month, spring & summer only',
      npk: { n: 10, p: 30, k: 20 },
      npkLabel: '10-30-20',
      method: 'Dilute to half the recommended dose. Apply to moist soil — never dry roots. Stop completely in autumn & winter.',
      extras: [
        'Add a tiny pinch of Epsom salt (MgSO₄) monthly for deeper flower colour',
        'A trace-element supplement once in spring supports caudex growth',
      ],
      avoid: 'High-nitrogen fertilizers — they grow leaves at the expense of flowers and the caudex.',
    },
    tricks: [
      { icon: Emoji.sunFace, title: 'Stress for colour', body: 'A few hours of very strong direct sun stress the plant into producing deeper pink/red flowers. Ease into it gradually.' },
      { icon: Emoji.scissors, title: 'Prune for branching', body: 'Cut branches just above a node after flowering — each cut tip will sprout 2–3 new branches, multiplying your flower count next season.' },
      { icon: Emoji.rock, title: 'Expose the caudex', body: 'Raise it slightly above the soil surface when repotting. The swollen base is the visual highlight — showing it off also reduces rot risk at the base.' },
      { icon: Emoji.zzz, title: 'Force dormancy trick', body: 'Stop watering entirely in November–December. The plant will drop leaves — that\'s fine. Resume in February to trigger a burst of spring blooms.' },
    ],
    diseases: [
      { symptom: 'Soft, mushy stem base', severity: 'high', cause: 'Root/crown rot from overwatering or poor drainage', fix: 'Remove from pot immediately. Cut away all black/mushy tissue with a sterile blade. Dust cuts with powdered cinnamon or sulphur. Let dry 2–3 days, then repot in fresh dry succulent mix. Do not water for 1 week.' },
      { symptom: 'Yellow leaves dropping', severity: 'medium', cause: 'Overwatering, cold stress, or normal dormancy leaf drop in winter', fix: 'Check soil moisture — if wet, hold off watering. If temperature dropped below 15°C, move to a warmer spot. If it\'s winter, it\'s likely just dormancy — reduce watering and wait.' },
      { symptom: 'White cottony fluff on caudex or stem joints', severity: 'medium', cause: 'Mealybugs — the most common Adenium pest', fix: 'Dab each cluster with a cotton swab soaked in 70% rubbing alcohol. Repeat every 5–7 days for 3 weeks. For heavy infestations, spray with neem oil solution (5ml neem + 1L water + drop of dish soap).' },
      { symptom: 'Brown crispy leaf tips', severity: 'low', cause: 'Low humidity, sunburn, or salt buildup from over-fertilizing', fix: 'Trim the brown tips with clean scissors. Flush the soil with plain water 2–3 times to remove fertilizer salt buildup. Move away from direct harsh midday sun if scorching.' },
      { symptom: 'Black or dark brown spots on leaves', severity: 'medium', cause: 'Fungal leaf spot — typically from water sitting on leaves or poor airflow', fix: 'Remove affected leaves. Avoid wetting foliage when watering. Improve air circulation. Spray with a diluted copper fungicide or neem oil weekly for 3 weeks.' },
      { symptom: 'No flowers despite healthy growth', severity: 'low', cause: 'Too much nitrogen, insufficient light, or no dormancy period', fix: 'Switch to a bloom-booster fertilizer (low N, high P). Ensure 5–6h of direct sun. Allow a dry winter rest — this stress triggers flowering in spring.' },
    ],
  },
  {
    id: 'jade',
    name: 'Jade Plant',
    latin: 'Crassula Ovata',
    category: 'succulents',
    pot: 'Plastic',
    substrate: 'Succulent mix',
    potSize: '16 cm',
    color: '#A8C89A',
    accent: '#4A7C3F',
    icon: JadePlantIcon,
    details: {
      watering: { summer: 'Every 10–14 days', winter: 'Every 3–5 weeks', summerMl: 220, winterMl: 100 },
      light: 'Bright indirect + some direct sun',
      temp: '18–24°C',
      warning: 'Plastic pot retains moisture — always check before watering!',
      tips: [
        'Prefers to be slightly root-bound — don\'t rush repotting',
        'Mildly toxic to cats & dogs',
        'Wipe dusty leaves with a damp cloth monthly',
        'Red leaf edges = healthy sun stress (a good sign!)',
      ],
    },
    fertilizer: {
      type: 'Balanced succulent fertilizer',
      schedule: 'Once a month, spring & summer only — half strength',
      npk: { n: 20, p: 20, k: 20 },
      npkLabel: '20-20-20',
      method: 'Dilute to exactly half the label dose. Always water the plant first, then apply fertilizer to moist soil. Never feed in autumn or winter.',
      extras: [
        'A potassium-rich feed in late summer hardens the plant for winter',
        'Liquid seaweed extract once in spring is a gentle organic boost',
      ],
      avoid: 'Over-fertilizing — causes soft, leggy growth and increases pest susceptibility.',
    },
    tricks: [
      { icon: Emoji.redCircle, title: 'Red edge trick', body: 'Place it in bright direct sun for 1–2 hours daily. The leaf edges turn red/orange — it\'s a sign of healthy stress and looks stunning.' },
      { icon: Emoji.scissors, title: 'Bonsai shaping', body: 'Jade responds beautifully to bonsai-style pruning. Remove lower leaves and branches to expose a trunk. Prune in spring for best results.' },
      { icon: Emoji.seedling, title: 'Leaf propagation', body: 'Twist off a healthy leaf cleanly, let it callous 2 days, then lay it on dry succulent mix. A new plant sprouts from the base in 3–4 weeks.' },
      { icon: Emoji.desert, title: 'Drought stress blooming', body: 'Jade plants bloom more readily when slightly root-bound and given a cool, dry winter rest (around 10–15°C). Reward is tiny star-shaped white flowers.' },
    ],
    diseases: [
      { symptom: 'Leaves become squishy and translucent', severity: 'high', cause: 'Severe overwatering leading to root rot', fix: 'Remove from pot. Trim all black/brown mushy roots. Let air dry 2–3 days. Repot in fresh dry succulent mix. Water sparingly for 3–4 weeks to allow root recovery.' },
      { symptom: 'White powdery coating on leaves', severity: 'medium', cause: 'Powdery mildew — a fungal disease triggered by poor airflow and inconsistent humidity', fix: 'Remove the worst affected leaves. Spray with diluted neem oil or a baking soda solution (1 tsp per litre of water). Improve air circulation around the plant. Avoid misting.' },
      { symptom: 'Fine webs and pale stippled leaves', severity: 'medium', cause: 'Spider mites — especially in warm dry indoor conditions', fix: 'Wipe leaves with a damp cloth. Spray thoroughly with neem oil or insecticidal soap, covering all leaf surfaces. Repeat every 4 days for 3 weeks. Increase humidity.' },
      { symptom: 'Soft water blisters on leaf surfaces', severity: 'low', cause: 'Oedema — the plant is absorbing water faster than it can transpire, often in low light conditions', fix: 'Move to a brighter spot. Reduce watering frequency slightly. Improve air circulation. Affected leaves won\'t recover but new growth will be healthy.' },
      { symptom: 'Leaves drop suddenly with no yellowing', severity: 'medium', cause: 'Cold shock or sudden temperature drop, often from cold window glass or drafts', fix: 'Move away from cold windows and drafts. Maintain stable temperatures above 10°C. Reduce watering slightly until new leaves emerge.' },
    ],
  },
  {
    id: 'irish-rose',
    name: 'Irish Rose',
    latin: 'Aeonium Arboreum',
    category: 'succulents',
    pot: 'Terracotta',
    substrate: 'Succulent mix',
    potSize: '11.5 cm',
    color: '#C8A0C0',
    accent: '#8B3A6A',
    icon: IrishRoseIcon,
    details: {
      watering: { summer: 'Every 3–4 weeks (dormant!)', winter: 'Every 10–14 days (active!)', summerMl: 40, winterMl: 110 },
      light: 'Bright indirect, gentle morning sun',
      temp: '15–24°C — cooler than most succulents',
      warning: 'Flipped schedule! Water MORE in winter, LESS in summer.',
      tips: [
        'Summer dormancy + leaf curl = totally normal',
        'Fertilize in autumn & spring only',
        'Each rosette is monocarpic — it dies after flowering, side shoots carry on',
        'Loves a cool windowsill in winter',
      ],
    },
    fertilizer: {
      type: 'Balanced liquid fertilizer (low dose)',
      schedule: 'Once a month in autumn & spring only — never in summer dormancy',
      npk: { n: 15, p: 15, k: 15 },
      npkLabel: '15-15-15',
      method: 'Apply at half strength to moist soil during its active growing period (autumn–spring). Stop completely once temperatures exceed 25°C.',
      extras: [
        'Seaweed extract in early autumn kick-starts the growing season gently',
        'A very light top-dress of worm castings in autumn is an excellent organic alternative',
      ],
      avoid: 'Any fertilizer in summer — the plant is dormant and can\'t use nutrients, causing salt buildup in the soil.',
    },
    tricks: [
      { icon: Emoji.newMoon, title: 'Dark colour trick', body: 'The purple/black varieties (like \'Zwartkop\') deepen in colour with more sun. Irish Rose stays green but develops red tips with gentle morning direct sun.' },
      { icon: Emoji.scissors, title: 'Stem cutting propagation', body: 'Cut a rosette with 5–8 cm of stem, let it dry 24h, then plant in dry succulent mix. Don\'t water for a week — roots form from the cut end.' },
      { icon: Emoji.fallenLeaf, title: 'Autumn reset', body: 'At the end of summer dormancy, remove any dried or shrivelled leaves from the stem base. Fresh autumn rain (or a good watering) wakes it up dramatically.' },
      { icon: Emoji.herb, title: 'Multi-head branching', body: 'Pinch off the central growing tip in early autumn to encourage the plant to branch into multiple rosette heads instead of one tall stem.' },
    ],
    diseases: [
      { symptom: 'Leaves curl inward and plant looks wilted in summer', severity: 'low', cause: 'Normal summer dormancy response — Aeonium naturally shuts down in heat', fix: 'Do nothing. Move to a slightly shadier spot and reduce watering to once every 3–4 weeks. The plant will reopen fully when autumn temperatures arrive.' },
      { symptom: 'Stem is soft and black at the base', severity: 'high', cause: 'Crown rot from overwatering during summer dormancy', fix: 'Remove from pot immediately. Cut away all blackened tissue with a sterile blade. Dust with powdered cinnamon. Let dry 2–3 days. Repot in fresh dry mix. Do not water for 10 days.' },
      { symptom: 'Brown dry leaf tips on outer leaves', severity: 'low', cause: 'Natural ageing of outer leaves, or low humidity combined with dry air from heating', fix: 'Remove the dried outer leaves by gently pulling downward. No treatment needed — this is cosmetic. If excessive, move away from heating vents.' },
      { symptom: 'Leggy stem with small leaves far apart', severity: 'medium', cause: 'Insufficient light — plant is stretching toward the nearest light source', fix: 'Move to a brighter spot with more indirect light. Prune the stretched stem back to where the leaves were compact — it will re-branch. Rotate pot every 2 weeks.' },
      { symptom: 'White fluffy patches in leaf axils', severity: 'medium', cause: 'Mealybugs hiding in the rosette centre', fix: 'Blast the rosette centre with a strong jet of water. Dab remaining insects with a cotton swab in 70% rubbing alcohol. Spray weekly with diluted neem oil for 3 weeks.' },
      { symptom: 'Rosette flowers then the head dies', severity: 'low', cause: 'Normal monocarpic behaviour — each rosette naturally dies after flowering', fix: 'Cut the dead rosette off cleanly at the stem. The plant will produce new side shoots from below the cut. These will grow into new rosette heads over the following months.' },
    ],
  },
  {
    id: 'houseleek',
    name: 'Houseleek',
    latin: 'Sempervivum Tectorum',
    category: 'succulents',
    pot: 'Plastic',
    substrate: `${Emoji.warning} Farmland — repot soon!`,
    potSize: '13 cm',
    color: '#90C0A0',
    accent: '#2A6A3A',
    icon: HouseleekIcon,
    details: {
      watering: { summer: 'Every 10–14 days', winter: 'Every 3–5 weeks', summerMl: 130, winterMl: 50 },
      light: 'Full direct sun (6h+)',
      temp: 'Hardy to –15°C! Loves cool winters.',
      warning: `${Emoji.warning} Farmland substrate + plastic = root rot risk. Repot into succulent mix ASAP!`,
      tips: [
        `No decorative stones = easy moisture check ${Emoji.checkMark}`,
        'Each rosette dies after flowering — chicks live on',
        'Fertilize lightly — overfeeding = floppy rosettes',
        'Great candidate for outdoor balcony in summer',
      ],
    },
    fertilizer: {
      type: 'Very diluted succulent fertilizer — less is more',
      schedule: 'Once every 6–8 weeks in spring & summer only',
      npk: { n: 5, p: 10, k: 10 },
      npkLabel: '5-10-10',
      method: 'Use at quarter strength — Sempervivum is adapted to poor soils and gets easily overfed. Apply to moist soil in spring only. Skip entirely in years when the plant flowers.',
      extras: [
        'A light handful of coarse sand or perlite mixed into the soil when repotting is more beneficial than any fertilizer',
        'One application of diluted worm casting tea in spring is sufficient for the whole year',
      ],
      avoid: 'High nitrogen and frequent feeding — causes oversized, floppy rosettes that lose their tight architectural form.',
    },
    tricks: [
      { icon: Emoji.mountain, title: 'Rock garden effect', body: 'Sempervivum looks best planted in clusters of different varieties. Their rosettes interlock beautifully — consider grouping 3–5 offsets in a wide shallow bowl.' },
      { icon: Emoji.thermometer, title: 'Freeze for colour', body: 'Cold winter temperatures (even near 0°C) intensify the red and purple hues in the leaves. Don\'t protect it from mild frost — embrace it.' },
      { icon: Emoji.baby, title: 'Chick harvesting', body: 'Gently twist off offset \'chicks\' when they\'re about 1/3 the size of the mother. Let them callous 1 day, then press onto dry succulent mix — no burying needed.' },
      { icon: Emoji.amphora, title: 'No deep pots', body: 'Sempervivum roots are shallow. A wide, shallow dish (even 5–6 cm deep) works better than a tall pot. More surface = more chick space = more spread.' },
    ],
    diseases: [
      { symptom: 'Centre of rosette turns brown and mushy', severity: 'high', cause: 'Crown rot — the most common killer, especially in farmland substrate + plastic combo', fix: 'Remove affected rosettes entirely. Check remaining roots and trim any black ones. Repot IMMEDIATELY into proper succulent/cactus mix. Water only when completely dry going forward.' },
      { symptom: 'Tiny flies hovering around the soil', severity: 'medium', cause: 'Fungus gnats — larvae live in moist organic soil (farmland substrate is especially prone)', fix: 'Let the soil dry out completely between waterings — larvae die in dry conditions. Apply a layer of coarse sand on the soil surface. Repotting into succulent mix with less organic matter is the long-term fix.' },
      { symptom: 'Orange or rust-coloured pustules on leaves', severity: 'medium', cause: 'Rust fungus (Endophyllum sempervivi) — rare but specific to Sempervivum', fix: 'Remove all affected leaves immediately and bin them. Spray with copper fungicide. Improve air circulation. Avoid overhead watering. Severely affected plants may not recover.' },
      { symptom: 'Rosettes stretch and open wide, pale colour', severity: 'low', cause: 'Etiolation from insufficient light — the plant is reaching for more sun', fix: 'Move to a sunnier location with 6+ hours of direct sun. Stretched growth won\'t revert but new growth will be compact and well-coloured.' },
    ],
  },

  // ─── TROPICALS ──────────────────────────────────────────────────────────────
  {
    id: 'tradescantia',
    name: 'Tradescantia Nanouk',
    latin: 'Tradescantia Albiflora \'Nanouk\'',
    category: 'tropicals',
    pot: 'Ceramic',
    substrate: 'Succulent mix',
    potSize: '11.5 cm',
    color: '#D8A8CC',
    accent: '#8B3A7A',
    icon: TradescantiaIcon,
    details: {
      watering: { summer: 'Every 5–7 days', winter: 'Every 10–14 days', summerMl: 110, winterMl: 55 },
      light: 'Bright indirect light — some morning sun keeps colours vivid',
      temp: '15–26°C — no cold drafts or frost',
      warning: 'Not a true succulent! Needs more frequent watering. Don\'t let it dry out completely.',
      tips: [
        `No decorative stones = easy moisture check ${Emoji.checkMark}`,
        'Succulent mix is fine — drains well but retains just enough moisture',
        'Trailing stems look best in a hanging pot or on a shelf edge',
        'Pinch off leggy stems to keep growth bushy and compact',
        'Vibrant pink/green colour fades in low light — keep it bright',
        'Mildly toxic to cats and dogs if ingested',
      ],
    },
    fertilizer: {
      type: 'Balanced liquid fertilizer — light feeder',
      schedule: 'Once every 2–3 weeks in spring & summer; stop in autumn & winter',
      npk: { n: 20, p: 20, k: 20 },
      npkLabel: '20-20-20',
      method: 'Dilute to half the recommended dose. Apply to moist soil during active growth (spring–summer). Stop feeding from October to February.',
      extras: [
        'Slow-release fertilizer pellets mixed in at repotting time feeds it gently all season',
        'Liquid seaweed extract once a month in spring supports lush, colourful foliage',
      ],
      avoid: 'Over-fertilizing — causes fast but leggy, weak growth with pale, washed-out leaf colour.',
    },
    tricks: [
      { icon: Emoji.palette, title: 'Maximise pink variegation', body: 'The pink and white variegation intensifies with more bright indirect light. Move it closer to a window (but avoid harsh midday sun which scorches the leaves). Too little light = plain green leaves.' },
      { icon: Emoji.scissors, title: 'Pinch for bushiness', body: 'Tradescantia naturally gets leggy over time. Pinch or cut stems just above a leaf node regularly — this triggers 2 new shoots per cut. The cuttings root easily in water or moist soil in 1–2 weeks.' },
      { icon: Emoji.droplet, title: 'Water propagation', body: 'Place any cut stem (5–8 cm) in a glass of water on a bright windowsill. Roots appear in 7–10 days. Once 2–3 cm long, pot up in succulent mix.' },
      { icon: Emoji.herb, title: 'Refresh every 1–2 years', body: 'After 1–2 years the base gets woody and bare. Take cuttings from healthy tips, root them, and start fresh — it\'s faster than reviving an old leggy plant.' },
      { icon: Emoji.pottedPlant, title: 'Ceramic pot advantage', body: 'Your ceramic pot retains slightly more moisture than terracotta — ideal for Tradescantia which appreciates consistent moisture. Always check before watering.' },
    ],
    diseases: [
      { symptom: 'Leaves fade to plain green, pink variegation disappears', severity: 'medium', cause: 'Insufficient light — the plant reverts to producing more chlorophyll (green) when light is too low', fix: 'Move to a brighter spot with more indirect light or a few hours of gentle morning sun. New growth will regain the pink/white variegation within a few weeks.' },
      { symptom: 'Stems become long and bare with few leaves', severity: 'medium', cause: 'Natural legginess as the plant ages, or insufficient light causing stretching', fix: 'Cut leggy stems back to 5–8 cm above the soil. New bushy growth will emerge from the cuts within 2 weeks. Use the cut stems as cuttings — root them in water and replant.' },
      { symptom: 'Leaves are soft, yellowing and stems feel mushy at base', severity: 'high', cause: 'Root rot from overwatering — ceramic pots retain moisture longer', fix: 'Remove from pot immediately. Trim all black/mushy roots. Dust with cinnamon. Repot in fresh dry succulent mix. Withhold water for 5–7 days. In severe cases, take cuttings from healthy tips and start fresh.' },
      { symptom: 'Brown dry leaf tips and edges', severity: 'low', cause: 'Low humidity, dry air from heating, or fluoride in tap water', fix: 'Trim brown edges with clean scissors. Move away from radiators. Water with filtered or rainwater if possible. Mist leaves occasionally.' },
      { symptom: 'Tiny silvery speckling on leaves, fine webbing underneath', severity: 'medium', cause: 'Spider mites — thrive in warm, dry indoor conditions', fix: 'Shower the plant under lukewarm water to dislodge mites. Spray with neem oil or insecticidal soap covering leaf undersides. Repeat every 3–4 days for 3 weeks.' },
      { symptom: 'White cottony fluff in leaf joints and stem nodes', severity: 'medium', cause: 'Mealybugs hiding in the stem junctions', fix: 'Dab each visible mealybug with a cotton swab soaked in 70% rubbing alcohol. Spray with diluted neem oil. Repeat weekly for 4 weeks. Isolate from other plants.' },
    ],
  },

  // ─── CITRUS ──────────────────────────────────────────────────────────────────
  {
    id: 'mandarin',
    name: 'Mandarin Trees',
    latin: 'Citrus Reticulata (×4)',
    category: 'citrus',
    pot: 'Plastic & Ceramic ×2',
    substrate: `${Emoji.warning} General — repot soon!`,
    potSize: '11.5 cm',
    color: '#FFD080',
    accent: '#E07820',
    icon: MandarinIcon,
    details: {
      watering: { summer: 'Every 5–7 days', winter: 'Every 10–14 days', summerMl: 180, winterMl: 90 },
      light: 'Full direct sun (6–8h)',
      temp: '18–30°C — protect below 10°C!',
      warning: `${Emoji.warning} Pots too small! Repot into 16–18 cm pots + citrus/well-draining mix ASAP.`,
      tips: [
        'Plastic pots: water less / Ceramic: slightly more often',
        'Rotate pots every 2 weeks for even growth',
        'Not a succulent — never let it dry out completely',
        'Yellow leaves = likely nitrogen or iron deficiency',
      ],
    },
    fertilizer: {
      type: 'Citrus-specific fertilizer (high N + micronutrients)',
      schedule: 'Every 2–3 weeks in spring & summer; once a month in autumn; stop in winter',
      npk: { n: 30, p: 10, k: 10 },
      npkLabel: '30-10-10',
      method: 'Use a dedicated citrus fertilizer that includes iron (Fe), manganese (Mn), and zinc (Zn). Apply to moist soil at the label dose. For baby trees, use half dose until established.',
      extras: [
        'Iron chelate supplement if leaves yellow between the veins (interveinal chlorosis)',
        'Epsom salt (1 tsp per litre) monthly prevents magnesium deficiency',
        'Switch to a high-potassium feed in late summer to harden wood before winter',
      ],
      avoid: 'Generic all-purpose fertilizers without micronutrients — citrus needs iron, zinc and manganese that generic fertilizers skip.',
    },
    tricks: [
      { icon: Emoji.blossom, title: 'Trigger flowering', body: 'A cool, dry rest period (8–12°C, minimal watering) for 6–8 weeks in winter mimics the Mediterranean climate and triggers spring blooming.' },
      { icon: Emoji.rotate, title: 'Rotate religiously', body: 'Indoor citrus grows lopsided fast. Rotate 90° every time you water. This single habit makes a huge difference in canopy symmetry.' },
      { icon: Emoji.scissors, title: 'Pinch new growth', body: 'Pinch off the tip of long new shoots to encourage bushier, more compact growth. Do this throughout spring and summer.' },
      { icon: Emoji.beetle, title: 'Scale & mite patrol', body: 'Check the stems and leaf undersides weekly — scale insects look like tiny brown bumps. Remove with a cotton swab dipped in rubbing alcohol at first sight.' },
      { icon: Emoji.wind, title: 'Ventilation matters', body: 'Citrus hates stagnant air. Keep it near a slightly open window or use a small fan nearby — good airflow prevents fungal issues and strengthens stems.' },
    ],
    diseases: [
      { symptom: 'Leaves turn uniformly pale yellow', severity: 'medium', cause: 'Nitrogen deficiency — very common in small pots where nutrients deplete fast', fix: 'Apply a citrus-specific fertilizer with high nitrogen (30-10-10) at half dose. You should see new leaves emerge green within 2–3 weeks.' },
      { symptom: 'Leaves yellow between the veins but veins stay green', severity: 'medium', cause: 'Iron or manganese deficiency (interveinal chlorosis) — common in alkaline soil or when pH is too high', fix: 'Apply an iron chelate supplement directly to the soil or as a foliar spray. Use rainwater or filtered water if your tap water is hard/alkaline.' },
      { symptom: 'Sticky leaves with brown bumps on stems', severity: 'high', cause: 'Scale insects — a very common citrus pest indoors', fix: 'Scrape off the brown bumps manually with a soft toothbrush. Wipe all surfaces with rubbing alcohol. Spray with neem oil solution weekly for 4 weeks.' },
      { symptom: 'Fine webbing on leaf undersides, leaves look dusty and pale', severity: 'medium', cause: 'Spider mites — thrive in dry indoor air, especially near heating', fix: 'Shower the plant under lukewarm water. Spray thoroughly with neem oil or insecticidal soap, especially leaf undersides. Repeat every 4 days for 3 weeks.' },
      { symptom: 'Brown tips and edges on leaves', severity: 'low', cause: 'Low humidity, salt buildup from over-fertilizing, or fluoride sensitivity in tap water', fix: 'Trim the brown edges with clean scissors. Flush the soil with plain water 3–4 times to remove salt buildup. Switch to filtered or rainwater.' },
      { symptom: 'Leaves drop suddenly, plant looks bare', severity: 'high', cause: 'Cold shock, sudden temperature change, overwatering, or repotting stress', fix: 'Check the root ball — if roots are black and mushy, treat for root rot. If roots are white/healthy, the cause is environmental stress — move to a stable warm spot (20–25°C).' },
      { symptom: 'Flowers drop before fruit forms', severity: 'medium', cause: 'Low humidity, insufficient light, temperature fluctuations, or the tree is too young', fix: 'Ensure 6–8h of direct sun. Maintain stable temperatures (18–24°C). Mist the flowers lightly with water to aid pollination indoors.' },
    ],
  },

  // ─── VEGETABLES ─────────────────────────────────────────────────────────────
  {
    id: 'tomato',
    name: 'Tomato Plant',
    latin: 'Solanum Lycopersicum',
    category: 'vegetables',
    pot: 'Plastic Planter',
    substrate: `${Emoji.warning} Farmland — enrich soon!`,
    potSize: 'Planter',
    color: '#F4A090',
    accent: '#C03020',
    icon: TomatoIcon,
    details: {
      watering: { summer: 'Every 1–2 days (check daily!)', winter: 'N/A — tomatoes are seasonal', summerMl: 750, winterMl: 0 },
      light: 'Full direct sun — minimum 8h daily',
      temp: '18–27°C — sensitive to frost and extreme heat',
      warning: `${Emoji.warning} Tomatoes in plastic planters dry out FAST in summer. Check soil daily!`,
      tips: [
        '3 tomatoes growing = fruiting stage — switch to high-K fertilizer NOW',
        'Water at soil level only — wet leaves invite fungal disease',
        'Farmland substrate drains poorly — add perlite or mix in some compost',
        'Stake or support the plant if not already done — the fruit weight bends stems',
        'Pinch off suckers (shoots in the leaf axils) to direct energy to your 3 fruits',
        'Rotate planter if indoors to ensure even sun exposure',
      ],
    },
    fertilizer: {
      type: 'Tomato-specific fertilizer — switch to high-K now that fruit is forming',
      schedule: 'Every 7–10 days during fruiting; every 14 days before fruiting',
      npk: { n: 10, p: 10, k: 30 },
      npkLabel: '10-10-30',
      method: 'Since you already have 3 tomatoes growing, use a HIGH POTASSIUM formula (like 10-10-30 or any \'tomato feed\'). Apply to moist soil. Water first, then feed. Do not splash on leaves or fruit.',
      extras: [
        'Calcium supplement (calcium nitrate) prevents blossom end rot',
        'Epsom salt (1 tsp per litre) every 2 weeks provides magnesium',
        'Liquid seaweed extract improves fruit flavour and plant resilience',
        'Farmland substrate is low in nutrients — compensate with slightly more frequent feeding',
      ],
      avoid: 'High-nitrogen fertilizer now that fruit is setting — it grows leaves instead of ripening your tomatoes.',
    },
    tricks: [
      { icon: Emoji.tomato, title: 'Sucker pinching = bigger tomatoes', body: 'Pinch off all suckers (small shoots growing between the main stem and a branch) with your fingers. This redirects energy into ripening your 3 existing tomatoes.' },
      { icon: Emoji.sun, title: 'Maximise sun for ripening', body: 'Gently tuck or remove leaves that are shading your 3 tomatoes directly. The fruit needs direct sun to ripen evenly and develop full flavour.' },
      { icon: Emoji.droplet, title: 'Consistent watering = no cracking', body: 'Inconsistent watering (dry then soaked) causes tomatoes to crack as they expand suddenly. Try to water the same amount at the same time every day.' },
      { icon: Emoji.thermometer, title: 'Warmth speeds ripening', body: 'If your tomatoes are green and slow to colour, place the planter in the warmest sunniest spot available. A south-facing wall that reflects heat is ideal.' },
      { icon: Emoji.scissors, title: 'Top the plant now', body: 'Since you already have fruit, pinch off the very top growing tip of the main stem. This stops upward energy and puts everything into ripening your existing tomatoes.' },
      { icon: Emoji.worm, title: 'Enrich the farmland substrate', body: 'Mix a handful of compost or worm castings into the top layer of soil. Farmland substrate alone is poor in available nutrients — this gives your tomatoes a natural boost.' },
    ],
    diseases: [
      { symptom: 'Dark brown leathery patch on the bottom of tomatoes', severity: 'high', cause: 'Blossom End Rot — calcium deficiency, worsened by inconsistent watering', fix: 'This fruit is not recoverable but the plant is fine. Add a calcium supplement. Water consistently every day — fluctuating moisture blocks calcium uptake.' },
      { symptom: 'Dark brown/black patches on leaves spreading fast, white mould underneath', severity: 'high', cause: 'Late Blight (Phytophthora infestans) — the most destructive tomato disease', fix: 'Remove all affected leaves and stems immediately. Do NOT compost them — bin them. Spray with copper fungicide every 5–7 days. Stop wetting leaves.' },
      { symptom: 'Yellow leaves with small brown spots, lower leaves first', severity: 'medium', cause: 'Early Blight (Alternaria) — fungal, triggered by wet leaves and poor airflow', fix: 'Remove all affected lower leaves. Always water at soil level. Spray with copper fungicide or neem oil weekly. Remove any leaves touching the planter surface.' },
      { symptom: 'Leaves curl upward along the edges', severity: 'low', cause: 'Heat stress or inconsistent watering — very common in plastic planters in summer sun', fix: 'Water more frequently (daily in hot weather). Move planter to avoid harsh afternoon sun. Mulch the top of the soil with compost to retain moisture.' },
      { symptom: 'Sticky leaves, tiny green or black insects on new shoots', severity: 'medium', cause: 'Aphids — cluster on soft new growth and undersides of leaves', fix: 'Blast them off with a strong jet of water. Spray with insecticidal soap or diluted neem oil. Repeat every 3 days for 2 weeks.' },
      { symptom: 'Tomatoes split or crack open while on the vine', severity: 'medium', cause: 'Sudden heavy watering after a dry period — fruit skin can\'t expand fast enough', fix: 'Water daily and consistently. Once cracked, harvest immediately — it\'s still edible if used promptly.' },
      { symptom: 'Mosaic pattern of light and dark green on leaves, stunted growth', severity: 'high', cause: 'Tomato Mosaic Virus — spread by aphids or contaminated hands/tools', fix: 'There is no cure. Remove and bin the affected plant immediately. Sterilise your tools and hands with soap before touching other plants.' },
    ],
  },
];

export const TABS: { id: TabId; label: string }[] = [
  { id: 0, label: `${Emoji.pottedPlant} Setup` },
  { id: 1, label: `${Emoji.herb} Care` },
  { id: 2, label: `${Emoji.testTube} Fertilizer` },
  { id: 3, label: `${Emoji.sparkles} Tricks` },
  { id: 4, label: `${Emoji.stethoscope} Diseases` },
];

export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  high: { color: '#C04040', bg: '#FFF0F0', border: '#FFCCCC', label: `${Emoji.redCircle} Urgent` },
  medium: { color: '#B06010', bg: '#FFF8E8', border: '#FFD080', label: `${Emoji.yellowCircle} Attention` },
  low: { color: '#2A6A3A', bg: '#F0FAF2', border: '#A8D8B0', label: `${Emoji.greenCircle} Minor` },
};

const createSizeOptions = (min: number, max: number, step: number) => {
  if (step <= 0 || max < min) return [];
  const precision = Math.max(...[min, max, step].map(value => `${value}`.split('.')[1]?.length ?? 0));
  const options: { value: string; label: string }[] = [];
  for (let index = 0; ; index += 1) {
    const size = Number((min + index * step).toFixed(precision));
    if (size > max + Number.EPSILON) break;
    const label = `${size} cm`;
    options.push({ value: label, label });
  }
  return options;
};

export const POT_SIZE_OPTIONS = createSizeOptions(6, 20, 0.5);
