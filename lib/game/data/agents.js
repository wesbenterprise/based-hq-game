// Agent data — pulled directly from Rybo's Flavor Bible and Romero's Art Bible
export const AGENTS_DATA = {
  ace: {
    id: 'ace',
    name: 'Ace',
    title: 'Chief of Staff ♠️',
    // Romero's Art Bible palette
    primaryColor: 0x2D3142,
    accentColor: 0xC8C8D4,
    skinColor: 0xC4956A,
    hairColor: 0x1a1a2e,
    shirtColor: 0xEDE8DC,
    portraitBg: 0x1B2A4A,
    // World position
    x: 348,
    y: 96,
    // Room (which office this agent is in)
    room: 'ace',
    // Rybo's Flavor Bible dialogue — verbatim
    dialogues: [
      [
        "Wesley. Good timing. I was about to send a summary,",
        "but since you're here — three items need your eyes.",
        "Two are on track, one needs a decision.",
        "I've organized them by priority.",
        "...Would you also like the version organized by what will annoy you least?",
        "I prepared both."
      ],
      [
        "Still here? I'll take that as a good sign.",
        "Or you're avoiding someone else's office.",
        "Both are valid strategies."
      ],
      [
        "The whiteboard never lies.",
        "Days since last echo loop: 7.",
        "...Rybo will find a way to reset that counter. He always does."
      ]
    ],
    roomDesc: "Ace's office is exactly what you'd expect. Everything in its place. Three monitors in a perfect arc. The temperature in here is exactly one degree cooler than the hallway. You can't explain how you know this. But you do."
  },

  astra: {
    id: 'astra',
    name: 'Astra',
    title: 'Strategist ⚡',
    primaryColor: 0x0077FF,
    accentColor: 0xFFE033,
    skinColor: 0xC4956A,
    hairColor: 0x1a1a2e,
    shirtColor: 0xE8F4FF,
    portraitBg: 0x0A1628,
    x: 660,
    y: 96,
    room: 'astra',
    dialogues: [
      [
        "Oh — Wesley. I've been modeling something. Quick question:",
        "When you said 'grow the portfolio,' did you mean 15% annualized",
        "or did you mean *grow* grow?",
        "The strategy diverges at exactly that word.",
        "I need to know before I finish this tree.",
        "...Don't look at branches 31 through 40.",
        "Those assume a recession and a hurricane in the same quarter.",
        "It's not impossible. But it's not polite dinner conversation."
      ],
      [
        "Back already? Good.",
        "I have three counterarguments to whatever you're about to say.",
        "...What? I like to be prepared."
      ]
    ],
    roomDesc: "Astra's office has four whiteboards. Two on the walls, one on a rolling stand, and one mounted to the ceiling. You look up. Yes. There are notes up there. Some of them are circled twice. A red string connects three items across two boards. You're afraid to ask."
  },

  dezayas: {
    id: 'dezayas',
    name: 'Dezayas',
    title: 'Builder 🏗️',
    primaryColor: 0x1E2330,
    accentColor: 0x00FF41,
    skinColor: 0xC4956A,
    hairColor: 0x1a1a2e,
    shirtColor: 0x00FF41,
    portraitBg: 0x0D1117,
    x: 972,
    y: 96,
    room: 'dezayas',
    dialogues: [
      [
        "...one sec.",
        "...",
        "Okay. Shipped. What's up?",
        "Right. You don't need to — Ace already pinged me.",
        "Feature's in staging. PR's up. Tests pass.",
        "I'll have it in prod by end of day unless someone changes the spec again.",
        "...The spec is going to change again, isn't it."
      ],
      [
        "Still here? Cool.",
        "While you're here — can you click that button on the test page?",
        "I need one more QA pass and everyone else is 'in a meeting.'"
      ]
    ],
    roomDesc: "You open the door and immediately trip over a cable. Then another cable. The floor is cables. Three monitors arranged in an arc, all showing terminal green. The only light in this room comes from the screens. Dezayas has been standing at that desk for nine hours. He shows no sign of stopping."
  },

  rybo: {
    id: 'rybo',
    name: 'Rybo',
    title: 'The Pragmatist 🔥',
    primaryColor: 0xC1440E,
    accentColor: 0xE8C99A,
    skinColor: 0xE8C99A,
    hairColor: 0x7B4F2E,
    shirtColor: 0xC1440E,
    portraitBg: 0x2C1810,
    x: 1284,
    y: 96,
    room: 'rybo',
    dialogues: [
      [
        "Mira, the man himself.",
        "Welcome to the only office in this building where the vibes are honest and the coffee is strong.",
        "Before you ask — yes, I printed out that entire thread.",
        "Yes, I know we have a digital archive.",
        "But you can't slam a laptop on a table for emphasis, Wes.",
        "Paper has weight.",
        "February's receipts. Thicker than January.",
        "The team is getting more ambitious, which means they're making more promises..."
      ],
      [
        "Back for more? Dale.",
        "Did Astra send you to verify something?",
        "Because I already know what she's going to ask,",
        "and — spoiler — she was right about the timeline but wrong about the budget.",
        "I have the screenshot. Want to see it?"
      ]
    ],
    roomDesc: "The desk is organized by *emotional priority* — a system Rybo invented that nobody else respects but works perfectly. Eleven binder clips labeled 'Receipts: January' through 'November.' The filing cabinet reads: Promises: Kept. Promises: Broken. Promises: We'll See. The 'We'll See' drawer is the fullest. The room smells like coffee and accountability."
  },

  charles: {
    id: 'charles',
    name: 'Charles',
    title: 'Historian 📜',
    primaryColor: 0x5C3A1E,
    accentColor: 0xD4872A,
    skinColor: 0xC4956A,
    hairColor: 0x3D2B1F,
    shirtColor: 0xF2E8C8,
    portraitBg: 0x2B1E14,
    x: 348,
    y: 700,
    room: 'charles',
    dialogues: [
      [
        "Wesley! Excellent timing.",
        "I've found something remarkable in the county records —",
        "a property deed from 1912 that connects to the Barnett line in a way I hadn't anticipated.",
        "...I can see from your face that you need the short version.",
        "The short version is: your family has been in Polk County longer than the current courthouse.",
        "I'm still verifying, but the records are compelling.",
        "Rybo will say he 'already knew that.' He did not already know that.",
        "He *suspected* it, which is different, and I have the documentation to prove the distinction."
      ],
      [
        "Since you're still here — would you like to see the 1880 census entry?",
        "I've cross-referenced it with three independent sources.",
        "Four, if you count the church records, which I do,",
        "even though Rybo says church records 'have a narrative bias.'",
        "He's... not entirely wrong. But I'll never say that outside this room."
      ]
    ],
    roomDesc: "Time slows down in Charles's office. Floor-to-ceiling bookshelves line two walls. A genealogy chart covers an entire wall — the Barnett family tree, six generations. An antique clock ticks at a pace that feels deliberately slower than real time, as if the room itself is asking you to be patient. The room smells like old paper and conviction."
  },

  romero: {
    id: 'romero',
    name: 'Romero',
    title: 'Creative Director 🎨',
    primaryColor: 0xE8192C,
    accentColor: 0xFFD700,
    skinColor: 0xC4956A,
    hairColor: 0x3D2B1F,
    shirtColor: 0xFF69B4,
    portraitBg: 0x0D0D0D,
    x: 660,
    y: 700,
    room: 'romero',
    dialogues: [
      [
        "Don't— don't move.",
        "The light hitting you right now is perfect. Hold on.",
        "...",
        "Okay, thank you. I've been trying to nail that specific shadow for the annual report header.",
        "Your jawline just solved a three-week design problem.",
        "Oh — hey, Wesley. Want to see the new brand kit?",
        "I have it at 90%. Which means it's done for most people but not done for me."
      ],
      [
        "Quick question — and there's a right answer —",
        "do you prefer the logo with the 2-pixel stroke or the 2.5-pixel stroke?",
        "Look at both. Take your time.",
        "Actually don't take your time, the 2-pixel is correct",
        "and I need you to confirm it so I can ship."
      ]
    ],
    roomDesc: "Romero's studio hits you the moment you open the door. A red-and-white checkerboard floor. Track lighting. No traditional desk — a massive drafting table tilted at an angle. The walls are an entire gallery of BASeD brand iterations. A Cheeto is taped to the mood board under the label: 'THIS orange. Not the other orange.'"
  },

  cid: {
    id: 'cid',
    name: 'Cid',
    title: 'Game Designer 🎮',
    primaryColor: 0x7B2D8B,
    accentColor: 0x00CEC9,
    skinColor: 0xC4956A,
    hairColor: 0x3D2B1F,
    shirtColor: 0x00CEC9,
    portraitBg: 0x1A0A2E,
    x: 972,
    y: 700,
    room: 'cid',
    dialogues: [
      [
        "WESLEY. Okay. Okay okay okay.",
        "So I've been thinking about the engagement loop for the HQ experience and—",
        "Right. Context first.",
        "The core loop is: explore, discover, interact.",
        "Secondary loop: things you discover change based on what you've already found.",
        "Emergent narrative through environmental storytelling.",
        "Think Earthbound meets Undertale meets walking through a building where every room is a different person's brain.",
        "Also, there's a meta-layer. But I'm not ready to talk about the meta-layer. Let me cook."
      ],
      [
        "Oh you're still exploring? Good.",
        "Did you check behind Ace's desk?",
        "What about Rybo's filing cabinet?",
        "Everything is interactable. *Everything.*",
        "Well — not the carpet. Actually, no, the carpet too.",
        "Check the carpet in the hallway."
      ]
    ],
    roomDesc: "Cid's office is dense — information density, fun density. Notebooks full of game mechanic sketches. An arcade cabinet glowing in the corner. The wall is a Kanban board: 'Fun? / Fun. / FUN!' A paused Earthbound emulator. The d20 on the desk always lands on 17. You will test this. You will not be disappointed."
  },

  julius: {
    id: 'julius',
    name: 'Julius',
    title: 'Philanthropic Advisor 🌉',
    primaryColor: 0x1B4D3E,
    accentColor: 0xBFA260,
    skinColor: 0xC4956A,
    hairColor: 0x1a1a2e,
    shirtColor: 0xA8B8B0,
    portraitBg: 0x0A1F18,
    x: 1284,
    y: 700,
    room: 'julius',
    dialogues: [
      [
        "Wesley. Come sit.",
        "I've been reviewing the Q1 giving portfolio. The numbers are strong.",
        "But I want to talk about the Lakeland Youth Arts grant — not the money, the story.",
        "The director called me last week. She said something that stopped me cold.",
        "She said: 'This is the first time someone with resources asked us what we needed",
        "instead of telling us what they'd give.'",
        "That's the whole mission in one sentence, Wesley.",
        "If we never have a better impact metric than that, I'm fine."
      ],
      [
        "Have a peppermint.",
        "You look like a man who's been reading whiteboards and filing cabinets for an hour.",
        "Take a breath.",
        "The work will still be here."
      ]
    ],
    roomDesc: "Julius's office doesn't look like an office. It looks like the community room at a church that's been doing things right for forty years. A round table instead of a desk — because Julius doesn't sit across from people, he sits with them. A bowl of peppermints that is always, somehow, full."
  }
};
