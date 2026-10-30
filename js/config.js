/* ─────────────────────────────────────────────────────────────
   ✏️  EDIT ME!  Everything personal lives in this one file.
   ───────────────────────────────────────────────────────────── */
window.BDAY = {
  name: "Justin",
  from: "me",                 // how you sign the letter
  candles: 5,                 // how many candles on the cake

  // little scribbles on the cake page
  cakeScribbles: ["you make life sweeter ♡", "birthday boy!!"],
  stickyFront: "Good things with you",
  stickyBack: "(and this is only the beginning)",

  // ── Scrapbook ────────────────────────────────────────────────
  // Drop your photos in /photos and point `src` at them.
  // `tape` is the washi tape color: green | yellow | pink | blue
  // Add or remove entries freely.
  memories: [
    {
      src: "photos/placeholder-1.svg",
      caption: "Our first date",
      date: "The day it all started",
      story: "I was so nervous. You made it easy.",
      tape: "green",
    },
    {
      src: "photos/placeholder-2.svg",
      caption: "Your terrible dance moves",
      date: "Already a classic",
      story: "Objectively the worst dancer I know. Also my favorite one.",
      tape: "yellow",
    },
    {
      src: "photos/placeholder-3.svg",
      caption: "That brunch",
      date: "A very good Sunday",
      story: "Somewhere between the pancakes and the second coffee, I knew I liked you a lot.",
      tape: "pink",
    },
    {
      src: "photos/placeholder-4.svg",
      caption: "Just us",
      date: "Any random day",
      story: "Two months in and the boring days with you are already my favorite.",
      tape: "blue",
    },
  ],

  // ── The letter ───────────────────────────────────────────────
  // Each string is one line. Wrap words in *stars* to underline them in pink.
  letter: [
    "Dear Justin,",
    "Happy birthday!!",
    "I know we're still new, but I'm so happy I get to celebrate this one with you.",
    "I hope today is full of good food, good people, and at least one really big slice of cake.",
    "Here's to your best year yet.",
    "*I love you so much.*",
  ],

  // ── Photo booth ──────────────────────────────────────────────
  // one prompt per photo. The last prompt is always saved for the last photo.
  boothPrompts: ["big smiles!", "make a silly face", "look at each other ♡", "now a kiss! 💋"],
  // what the booth frog says after each flash
  boothCheers: ["cute!!", "oh that's a good one", "stop, so cute", "frame-worthy", "ok wow", "adorable"],
  boothCaption: "",           // printed on every strip (blank = "Justin + me")

  // things the frog says when you poke him
  frogLines: [
    "ribbit!",
    "happy bday!!",
    "ribbit = happy birthday in frog",
    "she made this for u",
    "hop hop hooray",
    "make a wish!",
    "ok stop poking me",
  ],
};
