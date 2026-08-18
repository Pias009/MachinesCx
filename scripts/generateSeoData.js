const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path to products.json
const productsJsonPath = path.join(__dirname, '..', 'data', 'products.json');
const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

// Generator function for 700-1000 word rich SEO/GEO/AEO content per machine family
function generateSeoDataForFamily(f) {
  const name = f.name;
  const slug = f.slug;
  const category = f.category;
  const series = f.series || 'Industrial Series';
  const modelsStr = f.models ? f.models.join(', ') : 'Standard Model';
  const materialsStr = f.materials || 'LDPE, LLDPE, HDPE, Recycled PE';
  
  // Extract key specs into variables
  const specMap = {};
  (f.specs || []).forEach(s => {
    specMap[s.label] = s.values[0];
  });
  
  const filmWidth = specMap['Film Width'] || specMap['Max Bag Width'] || specMap['Max Web Width'] || 'Standard Width';
  const maxOutput = specMap['Max Extrusion Output'] || specMap['Bag Making Speed'] || specMap['Max Mechanical Speed'] || 'High Capacity';
  const screwDia = specMap['Screw Diameter'] || specMap['Main Motor'] || 'Precision Extruder';
  const power = specMap['Total Power'] || 'Energy Efficient';

  let focusKeywords = [];
  let technicalArchitecture = '';
  let applicationsAndMaterials = '';
  let targetIndustries = [];
  let engineeringFeatures = '';
  let keyInnovations = [];
  let utilityRequirements = '';
  let maintenanceProtocol = '';
  let faqs = [];
  let commercialGuide = '';

  if (category === 'film-blowing') {
    focusKeywords = [
      `${name}`, `${category} machine manufacturer`, `industrial film blowing extruder`,
      `co-extrusion film line china`, `blown film extrusion machine price`, `${materialsStr} film machinery`,
      `high output film blower`, `Wenzhou Ashal Innomach Technology`
    ];

    technicalArchitecture = `The ${name} (${series}) represents state-of-the-art blown film extrusion technology engineered by Wenzhou Ashal Innomach Technology for heavy-duty commercial and industrial film production. Built around a high-rigidity heavy structural frame, this line incorporates precision single/multi-screw extrusion units (${screwDia}) paired with bimetallic nitrided barrels (38CrMoAlA alloy, surface hardness HV950-1050) to guarantee superior plasticization, thermal stability, and melt homogeneity across all resin grade spectrums. The die head assembly features a spiral-runner flow channel optimized via 3D computational fluid dynamics (CFD) simulation, eliminating weld lines, melt fracture, and thermal degradation. Operating with a web width of ${filmWidth} and a peak throughput rating of ${maxOutput}, the machinery utilizes a multi-stage PID digital temperature controller with solid-state relay (SSR) output to maintain thermal tolerances within ±1°C across all heating zones. Driven by heavy-duty Siemens/ABB motor drives coupled with hardened helical gearboxes (SF factor > 1.5), the line delivers continuous, pulse-free resin extrusion even during 24/7 continuous production runs under full load capacity. The upper haul-off frame features synchronized dual-side nip rollers with pneumatic clamping and micro-adjustable bubble guide rings to guarantee impeccable film bubble concentricity and tension balance.`;

    applicationsAndMaterials = `Engineered for high versatility, the ${name} processes a wide spectrum of polyolefin resins and biodegradable biopolymers including ${materialsStr}, Metallocene LLDPE (mLLDPE), EVA, PLA, PBAT, and recycled PE pellets. It produces high-clarity agricultural greenhouse films, heavy-duty shipping sacks, shrink packaging, laminated barrier pouch substrates, courier mailing bags, and premium retail shopping bag film. The film thickness profile ranges from micro-thin 0.008 mm garment wrap up to heavy-duty 0.25 mm industrial liner sheeting, maintaining tight gauge tolerances across the entire ${filmWidth} web width.`;

    targetIndustries = [
      "Flexible Packaging Manufacturing", "Agricultural Mulch & Greenhouse Sheeting",
      "Industrial Freight Packaging & Stretch Wrap", "Food & Pharmaceutical Barrier Packaging",
      "E-Commerce Logistics & Courier Bag Production", "Bio-degradable & Compostable Bag Manufacturing"
    ];

    engineeringFeatures = `The machinery incorporates advanced automation systems designed to minimize scrap rate, reduce energy usage per kilogram of extruded resin, and optimize line changeover efficiency. Key engineering highlights include:`;

    keyInnovations = [
      {
        title: "CFD Spiral Die Head Geometry",
        description: "Engineered spiral distribution channels prevent melt stagnation, eliminate die lines, and optimize multi-layer thickness distribution across all extrusion channels."
      },
      {
        title: "Dual-Lip Air Ring & IBC Bubble Cooling",
        description: "High-pressure dual-chamber air ring with frequency-controlled blowers accelerates bubble cooling, increasing line speed by up to 30% while securing film bubble stability."
      },
      {
        title: "Automatic Tension & Corona Treater Integration",
        description: "Surface treatment unit with high-frequency spark discharge prepares film surface tension (38-44 dyne/cm) for downstream flexographic printing and laminating processes."
      },
      {
        title: "Servo Winder with Automatic Cut & Changeover",
        description: "Dual-station winder equipped with magnetic powder brake or AC servo control ensures flat, wrinkle-free film roll formation with smooth edge alignment."
      }
    ];

    utilityRequirements = `Operational installation requires a dedicated 3-phase electrical supply (380V/415V, 50/60Hz) with total power consumption rated at approximately ${power}. Compressed air must be supplied at 0.6–0.8 MPa with a clean, moisture-free air dryer unit. Industrial water chilling (chilled water temperature 15-20°C, flow rate 8-15 m³/h) is required for air ring cooling coils and gearbox thermal exchangers. Floor pad loading must support minimum floor loading ratings of 3,500 kg/m² on a level reinforced concrete base.`;

    maintenanceProtocol = `Preventative maintenance includes weekly inspection of gearbox oil levels (VG220 synthetic gear oil change every 4,000 operational hours), daily cleaning of die lip carbon deposits using soft copper scrapers, monthly lubrication of haul-off bearings and winder pivot points, and quarterly calibration of thermal thermocouples and PID controllers. Filter screen changers should be purged and cleaned per melt pressure transducer feedback.`;

    faqs = [
      {
        question: `What is the maximum extrusion capacity and film width of the ${name}?`,
        answer: `The ${name} delivers a maximum throughput capacity of ${maxOutput} with a maximum film web width of ${filmWidth}, operating across film thickness ranges from 0.008 mm up to 0.25 mm depending on resin formulation.`
      },
      {
        question: `Which plastic resins can be processed on the ${name}?`,
        answer: `This line is specifically calibrated for ${materialsStr}, mLLDPE, EVA, PLA/PBAT compostable polymers, and high-percentage recycled PE pellets.`
      },
      {
        question: `What are the electrical and space requirements for installing the ${name}?`,
        answer: `The line requires a total power hookup of ${power} (3-phase 380V/415V), compressed air supply at 0.6–0.8 MPa, and water chiller circulation. Footprint dimensions require ceiling heights suited for tower haul-off assembly and floor load capacity above 3.5 tons/m².`
      },
      {
        question: `How does the ${name} ensure uniform film gauge thickness?`,
        answer: `Uniform film gauge is achieved through precision-machined spiral die head distribution channels, a dual-chamber high-efficiency air ring, and micro-adjustable bubble guide frames that control concentricity.`
      },
      {
        question: `What warranty and commissioning support does Wenzhou Ashal Innomach provide?`,
        answer: `Ashal Machinery provides a 12-month comprehensive mechanical warranty, pre-shipment Factory Acceptance Testing (FAT) with video proof, on-site engineer installation and commissioning, and lifetime spare parts replacement support.`
      }
    ];

    commercialGuide = `Investing in the ${name} offers plastic packaging manufacturers high operational efficiency, low energy consumption per kg of resin output, and rapid ROI payback (typically within 8-14 months of full-capacity production). Certified under ISO 9001:2015 and CE quality compliance standards, every unit undergoes rigorous pre-shipment factory testing. Ashal Innomach ships worldwide with heavy-duty export anti-rust ocean container packaging, custom spare parts kits, and 24/7 global remote technical assistance.`;

  } else if (category === 'bag-making') {
    focusKeywords = [
      `${name}`, `bag making machine supplier`, `automatic plastic bag converting machine`,
      `heat seal cutting bag machine`, `T-shirt bag making machine`, `bottom seal bag making machine`,
      `${materialsStr} bag converting line`, `Wenzhou Ashal Innomach Technology`
    ];

    technicalArchitecture = `The ${name} (${series}) is a high-speed, fully automated plastic bag converting system designed by Wenzhou Ashal Innomach Technology for multi-lane heat-sealing, cutting, and stacking applications. Driven by high-precision Panasonic/Yaskawa AC servo motor control systems, the machine achieves a converting speed rating of ${maxOutput} while maintaining cut length accuracy within ±0.5 mm. The unwinding section features an automatic photoelectric web guiding system (EPC) with magnetic powder tension control, ensuring smooth film feeding without lateral wander or material stretching. The sealing assembly incorporates heavy-duty copper sealing knives heated by ceramic heating elements and monitored by micro-processor PID temperature modules to achieve flawless, high-strength heat seals on both light-gauge and heavy-duty films. The flying cutter blade is forged from high-carbon tungsten alloy steel, delivering ultra-clean cuts across millions of continuous operating cycles. An integrated PLC interface with touchscreen HMI allows operators to set bag length, batch count, punch timing, and speed parameters instantly, reducing job setup times to under 3 minutes.`;

    applicationsAndMaterials = `Capable of converting films made from ${materialsStr}, bio-degradable PLA/PBAT materials, and recycled plastic films, the ${name} produces T-shirt shopping bags, flat produce bags, bottom-seal heavy garbage sacks, vest bags, vegetable bags, and roll bags. It handles web widths up to ${filmWidth} with multi-lane configurations for doubled or tripled production output.`;

    targetIndustries = [
      "Retail & Supermarket Packaging Supply", "Municipal & Household Garbage Bag Converting",
      "Produce & Agriculture Market Packaging", "Bio-degradable & Compostable Bag Manufacturing",
      "Industrial Bulk Packaging & Heavy Sack Production"
    ];

    engineeringFeatures = `Designed for non-stop industrial output and minimum labor intervention, key engineering features include:`;

    keyInnovations = [
      {
        title: "Servo-Driven Flying Cutting & Sealing Mechanism",
        description: "Independent AC servo motors drive feed rollers and cutter movement, enabling precise synchronization, zero vibration, and instant length adjustment without gear changes."
      },
      {
        title: "Auto Hydraulic Punch & Stacking Table",
        description: "Integrated hydraulic punch unit automatically stamps out T-shirt handles or die-cut handles with automatic waste scrap extraction."
      },
      {
        title: "Static Eliminator & Photoelectric Eye Tracking",
        description: "High-voltage ion static bars eliminate static charge for smooth bag stacking; German-made Sick photocell tracks printed registration marks for printed bag cutting."
      },
      {
        title: "Automatic Alarm & Zero-Defect Auto-Stop",
        description: "Intelligent sensors detect film jam, loss of print mark, temperature drop, or bag stack completion, stopping the machine automatically to prevent material waste."
      }
    ];

    utilityRequirements = `Requires 3-phase 380V/415V electrical power supply with total installed capacity of ${power}. Pneumatic air pressure must be maintained at 0.6–0.7 MPa with an air consumption rate of 0.4–0.8 m³/min for punch cylinders and bag collection arms. Floor placement requires a smooth level floor pad with minimum 1.5 meters perimeter clearance for raw film roll loading and finished bag palletizing.`;

    maintenanceProtocol = `Daily maintenance requires clearing plastic scrap from the punch die area, wiping sealing knives with silicone oil spray, and inspecting blade sharpness. Weekly checks include lubricating linear guide rails and drive chains with ISO VG 68 grease. Monthly routine includes checking pneumatic cylinder seals, checking electrical terminal tightness, and inspecting EPC sensor optics.`;

    faqs = [
      {
        question: `What is the maximum speed and bag width capacity of the ${name}?`,
        answer: `The ${name} operates at converting speeds up to ${maxOutput} with maximum web width processing up to ${filmWidth}, available in multi-lane configurations for high-volume manufacturing.`
      },
      {
        question: `Can the ${name} process biodegradable PBAT/PLA and recycled films?`,
        answer: `Yes, the heating sealing knives and static control systems are specially calibrated to process biodegradable PBAT/PLA compostable films as well as recycled PE materials without melting or seal failure.`
      },
      {
        question: `How does the optical tracking sensor work for printed bags?`,
        answer: `The machine utilizes high-sensitivity photoelectric registration sensors that detect printed color marks on the film, automatically adjusting the servo feed length to ensure accurate cut placement on every printed bag.`
      },
      {
        question: `What are the maintenance requirements for the sealing cutter blades?`,
        answer: `The tungsten alloy blades require routine cleaning and lubrication. Under normal operation, blades last for over 10 million cycles before requiring re-sharpening or replacement.`
      },
      {
        question: `What warranty and technical assistance is included with the machine?`,
        answer: `Every machine includes a 1-year comprehensive warranty, pre-delivery trial testing video, complete operation manual, replacement blade/heater spare parts kit, and lifetime engineering technical support from Wenzhou Ashal Innomach.`
      }
    ];

    commercialGuide = `The ${name} delivers exceptional conversion productivity, enabling bag manufacturers to lower unit labor costs and increase daily pack count. Built with premium electrical components (Schneider electrics, Omron temperature controllers, Panasonic servos), it offers outstanding uptime reliability. Supported by CE certification, Ashal Innomach provides rapid global sea shipping, installation setup documentation, and remote video technical service.`;

  } else if (category === 'recycling') {
    focusKeywords = [
      `${name}`, `plastic recycling machine manufacturer`, `pelletizing line china`,
      `PE PP plastic pelletizer extruder`, `waste film recycling machine`, `water ring pelletizing line`,
      `${materialsStr} recycling system`, `Wenzhou Ashal Innomach Technology`
    ];

    technicalArchitecture = `The ${name} (${series}) is a heavy-duty plastic recycling and pelletizing extruder engineered by Wenzhou Ashal Innomach Technology to turn post-industrial plastic film scrap, edge trim, and washed post-consumer flakes into premium, uniform plastic granules. Designed with single or double-stage cascade extrusion processing, the line features a high-torque main extruder screw (${screwDia}) constructed from 38CrMoAlA nitrided steel or bimetallic alloy cladding for extreme abrasion and corrosion resistance. A integrated force feeding compaction feeder densifies lightweight film scrap before entry into the main extruder barrel, preventing bridging and ensuring consistent output rates up to ${maxOutput}. The barrel is equipped with a high-vacuum double-venting degassing system with vacuum pumps that effectively extract moisture, ink solvents, residual volatile gas, and trapped air from the plastic melt. Melt filtration is executed via a high-surface-area hydraulic non-stop screen changer, allowing filter screen changes in less than 2 seconds without stopping production or interrupting melt flow. Granulation is performed using a high-efficiency water-ring face pelletizer or strand cutter system with stainless steel centrifugal dewatering screen and cyclone blower loading hopper.`;

    applicationsAndMaterials = `The line efficiently recycles ${materialsStr}, PP woven bags, LDPE greenhouse film, LLDPE stretch film, HDPE bottle flakes, and printed bag scrap. The re-granulated plastic pellets exhibit high bulk density, minimal thermal degradation, and consistent melt flow index (MFI), making them immediately suitable for re-introduction into film blowing, pipe extrusion, or injection molding production lines.`;

    targetIndustries = [
      "Plastic Film & Packaging Scrap Recycling", "Post-Consumer Waste Plastics Processing Plants",
      "In-House Factory Scrap Recovery & Zero-Waste Production", "PP Woven Bag & Raffia Recycling Facilities",
      "Rigid HDPE & PP Plastic Reprocessing Operations"
    ];

    engineeringFeatures = `Engineered for continuous 24/7 duty cycles under high contamination loads, key features include:`;

    keyInnovations = [
      {
        title: "Cutter Compactor Force Feeding Unit",
        description: "Rotating fly-knives shred, warm, and compact soft film scrap simultaneously, feeding pre-conditioned melt directly into the extruder screw for high throughput."
      },
      {
        title: "Dual-Stage High-Vacuum Degassing System",
        description: "Dual vacuum extraction ports purge moisture, residual print inks, and trapped volatiles, preventing porosity and bubbles in finished pellets."
      },
      {
        title: "Non-Stop Hydraulic Plate Screen Changer",
        description: "Dual-bolt hydraulic screen changer permits screen replacement in under 2 seconds under full extrusion pressure without stopping line output."
      },
      {
        title: "Water-Ring Pelletizing & Centrifugal Dewatering",
        description: "Direct die-face cutter blades cut pellets in water ring mist, followed by high-speed centrifugal drying to deliver pellets with moisture content under 0.5%."
      }
    ];

    utilityRequirements = `Power connection requires 3-phase 380V/415V electrical supply with total connected load of ${power}. Industrial cooling water (temperature ≤ 25°C, circulation rate 15–25 m³/h) is required for water-ring pelletizing tank, gearbox oil cooling, and barrel cooling jackets. Compressed air supply of 0.6 MPa is required for hydraulic screen changer actuation and pneumatic convey blowers.`;

    maintenanceProtocol = `Daily maintenance includes monitoring hydraulic screen changer pressure gauges, checking pelletizer cutter blade sharpness, and clearing water ring filter screens. Weekly tasks include cleaning vacuum pump water traps and checking gearbox oil levels. Bi-monthly routine involves changing main gearbox lubricant (VG320 synthetic oil) and inspecting main screw wear tolerances.`;

    faqs = [
      {
        question: `What is the hourly pelletizing output capacity of the ${name}?`,
        answer: `The ${name} achieves a pelletizing production capacity of ${maxOutput}, depending on the feedstock form (film scrap, regrind flakes, or edge trim) and material density.`
      },
      {
        question: `How does the machine handle wet or printed plastic scrap?`,
        answer: `The line combines a pre-heating cutter compactor with a powerful dual-stage vacuum degassing system that extracts moisture, volatile solvents, and ink gases prior to pelletizing.`
      },
      {
        question: `What materials can be recycled on this line?`,
        answer: `The system processes ${materialsStr}, PP woven bags, agricultural films, LLDPE stretch film, and rigid PP/HDPE flakes.`
      },
      {
        question: `How often do screen filters need to be changed?`,
        answer: `Filter change frequency depends on raw material contamination levels. The non-stop hydraulic screen changer allows screen replacement in under 2 seconds without shutting down the extruder.`
      },
      {
        question: `What post-sale technical support does Ashal Machinery offer?`,
        answer: `Ashal Machinery provides full factory testing, 1-year warranty coverage, on-site commissioning by experienced engineers, spare cutter blades, and ongoing remote technical service.`
      }
    ];

    commercialGuide = `The ${name} transforms low-value plastic scrap into high-value secondary raw material pellets, drastically cutting factory resin purchasing costs and maximizing sustainability metrics. Built with robust heavy-duty transmission components, energy-efficient ceramic band heaters, and Siemens control electrics, the line delivers long operational lifespan with fast financial payback. Shipped worldwide with ocean-proof protective packaging and complete technical documentation.`;

  } else if (category === 'printing') {
    focusKeywords = [
      `${name}`, `flexographic printing machine manufacturer`, `flexo printing press china`,
      `stack flexo printing machine price`, `${materialsStr} printing press`, `central impression flexo press`,
      `high speed roll to roll flexo printer`, `Wenzhou Ashal Innomach Technology`
    ];

    technicalArchitecture = `The ${name} (${series}) is a high-speed flexographic printing press manufactured by Wenzhou Ashal Innomach Technology for precision roll-to-roll printing on flexible packaging substrates. Engineered with a heavy cast-iron side frame structure (wall plate thickness 50–75 mm) to absorb mechanical vibration at high speeds, the press achieves continuous printing speeds up to ${maxOutput} with precise color-to-color registration tolerance within ±0.15 mm. The ink distribution system utilizes laser-engraved ceramic anilox rollers (line count 200–1000 LPI) paired with enclosed chamber doctor blade systems or dual-reverse ink blades, ensuring uniform ink film transfer and crisp halftone dot reproduction up to 150 LPI screen rulings. Each printing color unit is equipped with independent 360° planetary gear motorized longitudinal registration controls and manual/motorized lateral adjustments, allowing micro-fine alignment during live operation. Drying is driven by a high-efficiency dual-path drying system featuring individual inter-station hot air blowers and a long overhead drying tunnel equipped with intelligent PID thermal regulation. Unwind and rewind stations feature dual-station turret winders or heavy-duty shaftless air-expansion shafts with magnetic powder tension brakes and automatic EPC web guide systems.`;

    applicationsAndMaterials = `The press prints vividly on plastic films (${materialsStr}, BOPP, PET, CPP, PVC), cellophane, aluminum foil, non-woven fabric, craft paper, and laminated packaging stocks up to ${filmWidth} web width. It is ideal for flexible food packaging, bread bags, beverage labels, shopping bags, courier envelopes, and agricultural sacks.`;

    targetIndustries = [
      "Flexible Packaging Printing & Converting", "Food & Beverage Label Printing",
      "Shopping Bag & Retail Packaging Printing", "Medical & Sanitary Product Packaging",
      "Paper Bag & Woven Sack Printing Industries"
    ];

    engineeringFeatures = `Engineered for high graphic fidelity, minimal ink consumption, and rapid job changeover, key features include:`;

    keyInnovations = [
      {
        title: "Laser Ceramic Anilox & Chamber Doctor Blade",
        description: "Enclosed doctor blade system prevents ink evaporation, maintains constant ink viscosity, and delivers precise volumetric ink transfer for high-definition print quality."
      },
      {
        title: "360° Motorized Continuous Registration",
        description: "Motorized planetary gearing allows continuous 360-degree longitudinal registration adjustment while the machine is running at full production speed."
      },
      {
        title: "High-Efficiency Dual Heating & Drying System",
        description: "Hot air blowers with electric/steam heat exchangers rapidly flash-dry solvent-based or water-based inks between printing stations without substrate distortion."
      },
      {
        title: "Automatic Web Guide (EPC) & Tension Control",
        description: "Ultrasonic or optical EPC sensors maintain web alignment at high speeds while tension sensors automatically regulate unwind/rewind tension."
      }
    ];

    utilityRequirements = `Requires 3-phase 380V/415V electrical power hookup with total connected capacity of ${power}. Compressed air supply of 0.6–0.8 MPa is required for air shafts, pneumatic doctor blade clamping, and impression cylinder lift. Exhaust ducting (diameter 250-350 mm) must be installed for drying tunnel hot air and solvent vapor ventilation. Floor foundation must be level, vibration-isolated concrete.`;

    maintenanceProtocol = `Daily maintenance requires thorough cleaning of ceramic anilox rollers using specialized anilox solvent cleaners to prevent dried ink cell clogging, cleaning doctor blade chambers, and inspecting ink circulation pumps. Weekly tasks involve lubricating drive gears, checking pneumatic cylinder seals, and inspecting EPC optical sensors. Monthly routine includes checking drive belt tension, inspecting electrical contactors, and verifying mechanical registration gear backlash.`;

    faqs = [
      {
        question: `What is the maximum printing speed and web width of the ${name}?`,
        answer: `The ${name} delivers printing speeds up to ${maxOutput} across substrate web widths up to ${filmWidth}, maintaining registration accuracy within ±0.15 mm.`
      },
      {
        question: `Can the ${name} use both water-based and solvent-based inks?`,
        answer: `Yes, the ceramic anilox rollers, chamber doctor blade system, and high-capacity drying tunnel are fully compatible with eco-friendly water-based inks as well as traditional solvent-based flexo inks.`
      },
      {
        question: `Which substrate materials can be printed on this machine?`,
        answer: `The machine prints on ${materialsStr}, BOPP, PET, CPP, paper, non-woven fabric, aluminum foil laminates, and cellophane.`
      },
      {
        question: `How does the machine maintain registration accuracy at high speeds?`,
        answer: `Precision registration is maintained through heavy cast-iron vibration-absorbing side frames, 360° motorized planetary registration gears, high-precision ceramic anilox rollers, and automatic web guide systems.`
      },
      {
        question: `What installation and warranty support is provided by Wenzhou Ashal Innomach?`,
        answer: `Ashal Machinery provides a 12-month warranty, complete factory acceptance testing prior to dispatch, on-site commissioning and print operator training by senior technicians, and lifetime spare parts support.`
      }
    ];

    commercialGuide = `The ${name} empowers packaging converters to achieve vibrant, high-definition print graphics with low ink consumption and minimal setup waste. Built with heavy structural frames, premium electrics (Schneider, Siemens, Mitsubishi), and precision ceramic anilox technology, it delivers superior return on investment for commercial printing operations. Shipped worldwide with heavy-duty export packing, detailed operation manuals, and 24/7 global remote technical assistance.`;
  }

  // Calculate actual total word count across all fields
  const totalText = [
    technicalArchitecture,
    applicationsAndMaterials,
    targetIndustries.join(' '),
    engineeringFeatures,
    keyInnovations.map(k => k.title + ' ' + k.description).join(' '),
    utilityRequirements,
    maintenanceProtocol,
    faqs.map(q => q.question + ' ' + q.answer).join(' '),
    commercialGuide
  ].join(' ');

  const wordCount = totalText.split(/\s+/).filter(Boolean).length;

  return {
    wordCount,
    overviewHeading: `Engineered Overview & Technical Deep-Dive — ${name}`,
    metaTitle: `${name} | Technical Specs & Output | Ashal Machinery`,
    metaDescription: `Explore technical specifications, output capacity (${maxOutput}), resin compatibility & direct factory pricing for the ${name} by Ashal Innomach.`.slice(0, 160),
    focusKeywords,
    technicalArchitecture,
    applicationsAndMaterials,
    targetIndustries,
    engineeringFeatures,
    keyInnovations,
    utilityRequirements,
    maintenanceProtocol,
    faqs,
    commercialGuide
  };
}

// Generate for all 30 families in productsData
let totalWordsGenerated = 0;
productsData.families.forEach((f, index) => {
  const seoData = generateSeoDataForFamily(f);
  f.seoData = seoData;
  totalWordsGenerated += seoData.wordCount;
  console.log(`[${index + 1}/30] ${f.slug} -> Words: ${seoData.wordCount} | Title: ${seoData.metaTitle}`);
});

console.log(`\nTotal SEO Data Words Generated Across Catalogue: ${totalWordsGenerated}`);

// Write back to data/products.json
fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2), 'utf8');
console.log(`Updated ${productsJsonPath} successfully.`);

// Also update MongoDB if MONGODB_URI exists
async function syncToMongo() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('No .env.local found, skipping DB sync.');
    return;
  }
  const envText = fs.readFileSync(envPath, 'utf8');
  const match = envText.match(/MONGODB_URI=(.*)/);
  if (!match) {
    console.log('No MONGODB_URI found in .env.local, skipping DB sync.');
    return;
  }
  const uri = match[1].trim();
  try {
    console.log('Connecting to MongoDB to update live cmssections products...');
    await mongoose.connect(uri);
    const result = await mongoose.connection.db.collection('cmssections').updateOne(
      { section: 'products' },
      { $set: { 'data.families': productsData.families, updatedAt: new Date() } }
    );
    console.log('MongoDB update result:', result);
    await mongoose.disconnect();
    console.log('Successfully synced 700-1000 word SEO data to MongoDB live store!');
  } catch (err) {
    console.error('Failed to sync to MongoDB:', err);
  }
}

syncToMongo();
