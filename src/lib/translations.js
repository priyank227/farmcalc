
// Central translations dictionary for FarmCalc

const translations = {
  // Common
  cancel: { en: 'Cancel', hi: 'रद्द करें', gu: 'રદ કરો' },
  save: { en: 'Save', hi: 'सेव करें', gu: 'સેવ કરો' },
  saving: { en: 'Saving...', hi: 'सेव हो रहा है...', gu: 'સેવ થઈ રહ્યું છે...' },
  delete: { en: 'Delete', hi: 'हटाएं', gu: 'કાઢો' },
  deleting: { en: 'Deleting...', hi: 'हटाया जा रहा है...', gu: 'કાઢી રહ્યું છે...' },
  edit: { en: 'Edit', hi: 'संपादित करें', gu: 'સંપાદિત કરો' },
  add: { en: 'Add', hi: 'जोड़ें', gu: 'ઉમેરો' },
  create: { en: 'Create', hi: 'बनाएं', gu: 'બનાવો' },
  refresh: { en: 'Refresh', hi: 'रिफ्रेश', gu: 'રિફ્રેશ' },
  allEntries: { en: 'All Entries', hi: 'सभी एंट्री', gu: 'બધી નોંધ' },
  noData: { en: 'No data yet', hi: 'अभी कोई डेटा नहीं', gu: 'હજી કોઈ ડેટા નથી' },
  enterPin: { en: 'Enter PIN', hi: 'PIN दर्ज करें', gu: 'PIN દાખલ કરો' },
  pin4digit: { en: '4-digit PIN', hi: '4 अंकों का PIN', gu: '4 આંકડાનો PIN' },
  note: { en: 'Note (optional)', hi: 'नोट (वैकल्पिक)', gu: 'નોંધ (વૈકલ્પિક)' },
  amount: { en: 'Amount (₹)', hi: 'राशि (₹)', gu: 'રકમ (₹)' },
  updateDetails: { en: 'Update entry details', hi: 'एंट्री विवरण अपडेट करें', gu: 'નોંધ વિગત અપડેટ કરો' },

  // Login
  loginTagline: { en: 'Khet nu Hisab, Easy Raahe', hi: 'खेत का हिसाब, आसान राहें', gu: 'ખેતનું હિસાબ, સરળ રીતે' },
  welcomeBack: { en: 'Welcome Back', hi: 'वापसी पर स्वागत है', gu: 'પાછા સ્વાગત છે' },
  createAccount: { en: 'Create Account', hi: 'खाता बनाएं', gu: 'ખાતું બનાવો' },
  loginSubtitle: { en: 'Enter your mobile number to continue', hi: 'जारी रखने के लिए मोबाइल नंबर दर्ज करें', gu: 'આગળ વધવા મોબાઇલ નંબર દાખલ કરો' },
  registerSubtitle: { en: 'Register with your mobile number', hi: 'अपने मोबाइल नंबर से रजिस्टर करें', gu: 'તમારા મોબાઇલ નંબરથી નોંધણી કરો' },
  mobileNumber: { en: 'Mobile Number', hi: 'मोबाइल नंबर', gu: 'મોબાઇલ નંબર' },
  continueBtn: { en: 'Continue →', hi: 'आगे बढ़ें →', gu: 'આગળ →' },
  enterPinSubtitle: { en: 'Enter your 4-digit PIN', hi: 'अपना 4 अंकों का PIN दर्ज करें', gu: 'તમારો 4 આંકડાનો PIN દાખલ કરો' },

  // Dashboard
  workerUpad: { en: 'Worker Upad', hi: 'मजदूर उपाड़', gu: 'મજૂર ઉપાડ' },
  farmExpenses: { en: 'Farm Expenses', hi: 'खेत के खर्चे', gu: 'ખેતરના ખર્ચ' },
  cropIncome: { en: 'Crop Income', hi: 'फसल की कमाई', gu: 'પાકની આવક' },
  workers: { en: 'Workers', hi: 'मजदूर', gu: 'કામદારો' },
  settlement: { en: 'Settlement', hi: 'हिसाब', gu: 'હિસાબ' },

  workerMajuri: { en: 'Workers Expense', hi: 'मजदूरी', gu: 'મજૂરી' },
  workerMajuriDesc: { en: 'Daily wages & labour', hi: 'दैनिक मजदूरी और श्रम', gu: 'દૈનિક મજૂરી અને કામદાર' },
  workerUpadDesc: { en: 'Add worker advances', hi: 'मजदूर अग्रिम जोड़ें', gu: 'કામદારોને આપેલી આગોતરી રકમ ઉમેરો' },
  farmExpensesDesc: { en: 'Pesticide & materials', hi: 'कीटनाशक और सामग्री', gu: 'જંતુનાશક અને સામગ્રી' },
  cropIncomeDesc: { en: 'Money from crops', hi: 'फसल से पैसे', gu: 'પાકથી પૈસા' },
  workersDesc: { en: 'Manage & set shares', hi: 'प्रबंधन और हिस्से तय करें', gu: 'કામદારોનું સંચાલન અને ભાગ નક્કી કરો' },

  // Majuri
  totalMajuriGiven: { en: 'Total Majuri Paid', hi: 'कुल मज़ूरी दी', gu: 'કુલ મજૂરી આપવામાં આવી' },
  addMajuri: { en: 'Add Majuri', hi: 'मज़ूरी जोड़ें', gu: 'મજૂરી ઉમેરો' },
  noMajuriYet: { en: 'No majuri recorded yet', hi: 'अभी कोई मज़ूरी नहीं जोड़ी', gu: 'હજી કોઈ મજૂરી નોંધાઈ નથી' },
  editMajuri: { en: 'Edit Majuri', hi: 'मज़ूरी संपादित करें', gu: 'મજૂરી સંપાદિત કરો' },

  // Upad
  totalUpadGiven: { en: 'Total Upad Given', hi: 'कुल उपाड़ दिया', gu: 'કુલ ઉપાડ આપ્યો' },
  addUpad: { en: 'Add Upad', hi: 'उपाड़ जोड़ें', gu: 'ઉપાડ ઉમેરો' },
  noUpadYet: { en: 'No upad recorded yet', hi: 'अभी कोई उपाड़ नहीं जोड़ा', gu: 'હજી કોઈ ઉપાડ નોંધાયો નથી' },
  editUpad: { en: 'Edit Upad', hi: 'उपाड़ संपादित करें', gu: 'ઉપાડ સંપાદિત કરો' },

  // Expenses
  totalFarmExpenses: { en: 'Total Farm Expenses', hi: 'कुल खेत खर्चे', gu: 'કુલ ખેતર ખર્ચ' },
  addExpense: { en: 'Add Expense', hi: 'खर्च जोड़ें', gu: 'ખર્ચ ઉમેરો' },
  expenseNamePlaceholder: { en: 'Expense name (e.g. Urea)', hi: 'खर्च का नाम', gu: 'ખર્ચનું નામ' },

  // Workers
  manageWorkers: { en: 'Manage Workers', hi: 'मजदूर प्रबंधन', gu: 'કામદારો મેનેજ કરો' },
  addWorker: { en: 'Add Worker', hi: 'मजदूर जोड़ें', gu: 'કામદાર ઉમેરો' },
  workersCount: { en: 'Workers', hi: 'मजदूर', gu: 'કામદારો' },

  // Settlement
  finalSettlement: { en: 'Final Settlement', hi: 'अंतिम हिसाब', gu: 'અંતિમ હિસાબ' },
  netPayable: { en: 'Net Payable', hi: 'कुल देय', gu: 'કુલ ચૂકવવાનું છે' },
};

export default translations;