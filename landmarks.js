const ROME_LANDMARKS = [
  // Famous Squares & Steps
  { name: "Spanish Steps (Piazza di Spagna)", lat: 41.9059, lon: 12.4828, type: "square", desc: "Monumental 135-step staircase leading up to the Trinita dei Monti church." },
  { name: "Piazza del Popolo", lat: 41.9107, lon: 12.4764, type: "square", desc: "Large urban square featuring an Egyptian obelisk and twin churches." },
  { name: "Campo de' Fiori", lat: 41.8956, lon: 12.4722, type: "square", desc: "Lively square known for its daily open-air market and nightlife." },

  // Parks & Scenic Views
  { name: "Villa Borghese Gardens", lat: 41.9128, lon: 12.4852, type: "park", desc: "Expansive landscape park featuring gardens, lakes, and walking paths." },
  { name: "Janiculum Hill (Gianicolo)", lat: 41.8917, lon: 12.4616, type: "park", desc: "Scenic hill west of the Tiber offering panoramic views across Rome." },
  { name: "Orange Garden (Giardino degli Aranci)", lat: 41.8848, lon: 12.4797, type: "park", desc: "Quiet park on the Aventine Hill with city vistas and the Aventine Keyhole." },

  // Ancient Monuments & Historic Neighborhoods
  { name: "Castel Sant'Angelo", lat: 41.9031, lon: 12.4663, type: "ancient", desc: "Cylindrical fortress originally built as Emperor Hadrian's mausoleum." },
  { name: "Baths of Caracalla", lat: 41.8792, lon: 12.4925, type: "ancient", desc: "Massive ruins of one of Rome's largest ancient public thermal complexes." },
  { name: "Trastevere", lat: 41.8895, lon: 12.4705, type: "district", desc: "Charming historic neighborhood famous for cobblestone alleyways and trattorias." },
  
  // Historical & Cultural
  { name: "Colosseum", lat: 41.8902, lon: 12.4922, type: "ancient", desc: "Flavian Amphitheatre completed in 80 AD." },
  { name: "Pantheon", lat: 41.8986, lon: 12.4769, type: "ancient", desc: "Former Roman temple, now a church with a dome interior." },
  { name: "Trevi Fountain", lat: 41.9009, lon: 12.4833, type: "fountain", desc: "Iconic 18th-century Baroque fountain." },
  { name: "St. Peter's Basilica", lat: 41.9022, lon: 12.4539, type: "vatican", desc: "Major papal basilica in Vatican City." },
  { name: "Roman Forum", lat: 41.8925, lon: 12.4853, type: "ancient", desc: "Plaza surrounded by ruins of ancient government buildings." },
  { name: "Piazza Navona", lat: 41.8992, lon: 12.4731, type: "square", desc: "Built on the site of the Stadium of Domitian." },

  // Museums & Galleries
  { name: "Vatican Museums & Sistine Chapel", lat: 41.9065, lon: 12.4536, type: "museum", desc: "World-renowned art collection featuring Michelangelo's ceiling fresco." },
  { name: "Borghese Gallery and Museum", lat: 41.9142, lon: 12.4921, type: "museum", desc: "Renowned art gallery housing Bernini sculptures and Caravaggio paintings." },
  { name: "Capitoline Museums", lat: 41.8931, lon: 12.4828, type: "museum", desc: "World's oldest public museum located on Capitoline Hill." },
  { name: "National Roman Museum (Palazzo Massimo)", lat: 41.9014, lon: 12.4984, type: "museum", desc: "Premier collection of classical Roman sculptures, mosaics, and frescoes." },
  { name: "MAXXI National Museum", lat: 41.9282, lon: 12.4667, type: "gallery", desc: "National Museum of 21st Century Arts designed by Zaha Hadid." },
  { name: "Galleria Doria Pamphilj", lat: 41.8978, lon: 12.4813, type: "gallery", desc: "Large private art collection housed in a historic palazzo." },

  // Airports
  { name: "FCO - Leonardo da Vinci–Fiumicino Airport", lat: 41.8003, lon: 12.2389, type: "airport", desc: "Rome's primary international airport." },
  { name: "CIA - Ciampino–G. B. Pastine Airport", lat: 41.7994, lon: 12.5949, type: "airport", desc: "Rome's secondary airport, hub for budget airlines." },

  // Train Stations
  { name: "Roma Termini Station", lat: 41.9010, lon: 12.5018, type: "transit", desc: "Main railway station of Rome with express airport links." },
  { name: "Roma Tiburtina Station", lat: 41.9108, lon: 12.5312, type: "transit", desc: "Major high-speed rail hub in northeastern Rome." },
  { name: "Roma Ostiense Station", lat: 41.8726, lon: 12.4842, type: "transit", desc: "Key railway hub serving southern Rome and commuter routes." },

  // Shopping Malls
  { name: "Euroma2", lat: 41.8268, lon: 12.4646, type: "mall", desc: "Large multi-level shopping center in the EUR district." },
  { name: "Porta di Roma", lat: 41.9723, lon: 12.5385, type: "mall", desc: "One of the largest shopping malls in Italy with over 200 stores." },
  { name: "RomaEst", lat: 41.9174, lon: 12.6685, type: "mall", desc: "Expansive retail complex located in east Rome." },
  

  // --- FLORENCE (DAY TRIP) ---
  { name: "Florence Cathedral (Duomo)", lat: 43.7731, lon: 11.2560, type: "vatican", desc: "Florence's landmark cathedral with Brunelleschi's dome." },
  { name: "Uffizi Gallery", lat: 43.7678, lon: 11.2553, type: "gallery", desc: "World-famous Renaissance art museum." },
  { name: "Ponte Vecchio", lat: 43.7680, lon: 11.2531, type: "ancient", desc: "Medieval stone arch bridge with shops over the Arno River." },
  { name: "Firenze Santa Maria Novella", lat: 43.7765, lon: 11.2479, type: "transit", desc: "Main high-speed railway station in Florence." },

  // --- NAPLES (DAY TRIP) ---
  { name: "Naples Cathedral (Duomo di Napoli)", lat: 40.8525, lon: 14.2592, type: "vatican", desc: "Main Roman Catholic cathedral of Naples." },
  { name: "Naples National Archaeological Museum", lat: 40.8534, lon: 14.2505, type: "museum", desc: "Extensive collection of Greco-Roman artifacts and Pompeii frescoes." },
  { name: "Castel Nuovo", lat: 40.8384, lon: 14.2525, type: "ancient", desc: "Medieval castle overlooking the Port of Naples." },
  { name: "Napoli Centrale Station", lat: 40.8529, lon: 14.2723, type: "transit", desc: "Main terminal station in Naples for high-speed trains from Rome." }

// --- FLORENCE TRAIN STATIONS ---
  { name: "Firenze Santa Maria Novella (SMN)", lat: 43.7765, lon: 11.2479, type: "transit", desc: "Main central station for high-speed trains from Rome and regional routes." },
  { name: "Firenze Campo di Marte", lat: 43.7745, lon: 11.2778, type: "transit", desc: "Secondary high-speed and regional rail station east of Florence center." },
  { name: "Firenze Rifredi", lat: 43.7928, lon: 11.2361, type: "transit", desc: "Key northern commuter hub and regional transfer station." },

  // --- NAPLES TRAIN STATIONS ---
  { name: "Napoli Centrale / Piazza Garibaldi", lat: 40.8529, lon: 14.2723, type: "transit", desc: "Main terminal station in Naples for high-speed Frecciarossa/Italo trains." },
  { name: "Napoli Afragola", lat: 40.9238, lon: 14.3128, type: "transit", desc: "Modern architectural high-speed bypass station north of Naples." },
  { name: "Napoli Mergellina", lat: 40.8300, lon: 14.2201, type: "transit", desc: "Western seaside station serving the Mergellina and Posillipo districts." }

];
