export type ShayriGlossaryEntry = {
  key: string
  word: string
  urdu: string
  roman: string
  origin?: string
  grammar?: string
  english: string
  romanUrdu: string
  aliases?: string[]
}

export const shayriGlossary: Record<string, ShayriGlossaryEntry> = {
  dastaras: {
    key: 'dastaras',
    word: 'dastaras',
    urdu: 'دسترس',
    roman: 'dastaras',
    origin: 'Persian',
    grammar: 'Feminine noun',
    english: 'Access, reach, command, or control.',
    romanUrdu: 'Kisi cheez tak pahunch, ikhtiyar, ya qaboo hona; jaise kisi hunar ya cheez par poori pakad.',
    aliases: ['dastaras']
  },
  falsafa: {
    key: 'falsafa',
    word: 'falsafa',
    urdu: 'فلسفہ',
    roman: 'falsafa',
    origin: 'Arabic, from Greek',
    grammar: 'Masculine noun',
    english: 'Philosophy; reflective inquiry into reality, causes, and knowledge.',
    romanUrdu: 'Soch-vichaar ka ilm; zindagi, haqeeqat, ilm, aur wajah ko gehrai se samajhne ki koshish.',
    aliases: ['falsafa']
  },
  riyazi: {
    key: 'riyazi',
    word: 'riyazi',
    urdu: 'ریاضی',
    roman: 'riyazi',
    origin: 'Arabic',
    grammar: 'Feminine noun / adjective',
    english: 'Mathematics; mathematical sciences.',
    romanUrdu: 'Hisaab aur numbers ka ilm; woh cheez jo mathematics ya hisaab se talluq rakhti ho.',
    aliases: ['riyazi']
  },
  ahem: {
    key: 'ahem',
    word: 'aham',
    urdu: 'اہم',
    roman: 'aham',
    origin: 'Arabic',
    grammar: 'Adjective',
    english: 'Important, significant, necessary.',
    romanUrdu: 'Zaroori ya khaas ahmiyat rakhne wali baat; jis par tawajjoh dena zaroori ho.',
    aliases: ['ahem', 'aham']
  }
}
