/**
 * Hane varsayılan değerlerini MongoDB'ye yükler.
 * Tek seferlik çalıştırılacak: node src/utils/haneTohumla.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const House = require('../models/House');

const DEFAULTS = [
  // Batı Toprakları
  { rolId: '1495773001633894409', isim: 'Lannister Hanesi',  kasa: 10000000, haftalikGelir: 280000, duzenliAsker: 20000, paraliAsker: 0, donanma: 20 },
  { rolId: '1495773001575305226', isim: 'Lefford Hanesi',    kasa: 3000000,  haftalikGelir: 120000, duzenliAsker: 4000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238362', isim: 'Brax Hanesi',       kasa: 2800000,  haftalikGelir: 120000, duzenliAsker: 4500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238365', isim: 'Crakehall Hanesi',  kasa: 2800000,  haftalikGelir: 110000, duzenliAsker: 3500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238364', isim: 'Marbrand Hanesi',   kasa: 2750000,  haftalikGelir: 110000, duzenliAsker: 3500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238361', isim: 'Farman Hanesi',     kasa: 2500000,  haftalikGelir: 100000, duzenliAsker: 1500,  paraliAsker: 0, donanma: 30 },
  // Kuzey Toprakları
  { rolId: '1495773001633894408', isim: 'Stark Hanesi',      kasa: 3500000,  haftalikGelir: 140000, duzenliAsker: 20000, paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001633894400', isim: 'Manderly Hanesi',   kasa: 4500000,  haftalikGelir: 180000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 30 },
  { rolId: '1495773001608724709', isim: 'Bolton Hanesi',     kasa: 2000000,  haftalikGelir: 120000, duzenliAsker: 5000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001633894402', isim: 'Karstark Hanesi',   kasa: 1850000,  haftalikGelir: 100000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001633894401', isim: 'Umber Hanesi',      kasa: 1700000,  haftalikGelir: 100000, duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724705', isim: 'Glover Hanesi',     kasa: 1500000,  haftalikGelir: 95000,  duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724708', isim: 'Cerwyn Hanesi',     kasa: 1400000,  haftalikGelir: 95000,  duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724706', isim: 'Mormont Hanesi',    kasa: 1000000,  haftalikGelir: 90000,  duzenliAsker: 2000,  paraliAsker: 0, donanma: 10 },
  { rolId: '1495773001608724707', isim: 'Reed Hanesi',       kasa: 950000,   haftalikGelir: 90000,  duzenliAsker: 2000,  paraliAsker: 0, donanma: 0 },
  // Menzil Toprakları
  { rolId: '1495773001633894406', isim: 'Tyrell Hanesi',     kasa: 7000000,  haftalikGelir: 240000, duzenliAsker: 30000, paraliAsker: 0, donanma: 30 },
  { rolId: '1495773001428238360', isim: 'Hightower Hanesi',  kasa: 7000000,  haftalikGelir: 220000, duzenliAsker: 15000, paraliAsker: 0, donanma: 60 },
  { rolId: '1495773001428238359', isim: 'Redwyne Hanesi',    kasa: 5000000,  haftalikGelir: 180000, duzenliAsker: 4000,  paraliAsker: 0, donanma: 120 },
  { rolId: '1495773001428238357', isim: 'Tarly Hanesi',      kasa: 2800000,  haftalikGelir: 140000, duzenliAsker: 7000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238356', isim: 'Rowan Hanesi',      kasa: 2200000,  haftalikGelir: 120000, duzenliAsker: 8000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001428238358', isim: 'Florent Hanesi',    kasa: 1900000,  haftalikGelir: 115000, duzenliAsker: 4000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001306734751', isim: 'Oakheart Hanesi',   kasa: 1850000,  haftalikGelir: 110000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001306734750', isim: 'Fossoway Hanesi',   kasa: 1500000,  haftalikGelir: 105000, duzenliAsker: 2000,  paraliAsker: 0, donanma: 0 },
  // Nehir Toprakları
  { rolId: '1495773001633894404', isim: 'Tully Hanesi',      kasa: 3000000,  haftalikGelir: 150000, duzenliAsker: 10000, paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724704', isim: 'Frey Hanesi',       kasa: 3350000,  haftalikGelir: 160000, duzenliAsker: 5500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724703', isim: 'Mallister Hanesi',  kasa: 2850000,  haftalikGelir: 125000, duzenliAsker: 3500,  paraliAsker: 0, donanma: 25 },
  { rolId: '1495773001608724702', isim: 'Blackwood Hanesi',  kasa: 2000000,  haftalikGelir: 110000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724701', isim: 'Bracken Hanesi',    kasa: 2000000,  haftalikGelir: 110000, duzenliAsker: 2750,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001608724700', isim: 'Vance Hanesi',      kasa: 1850000,  haftalikGelir: 120000, duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305235', isim: 'Piper Hanesi',      kasa: 1600000,  haftalikGelir: 110000, duzenliAsker: 1500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305234', isim: 'Darry Hanesi',      kasa: 1450000,  haftalikGelir: 100000, duzenliAsker: 1000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305233', isim: 'Whent Hanesi',      kasa: 700000,   haftalikGelir: 70000,  duzenliAsker: 500,   paraliAsker: 0, donanma: 0 },
  // Vadi Toprakları
  { rolId: '1495773001633894405', isim: 'Arryn Hanesi',      kasa: 3600000,  haftalikGelir: 170000, duzenliAsker: 12000, paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305232', isim: 'Royce Hanesi',      kasa: 2900000,  haftalikGelir: 150000, duzenliAsker: 8000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305229', isim: 'Grafton Hanesi',    kasa: 3200000,  haftalikGelir: 160000, duzenliAsker: 5000,  paraliAsker: 0, donanma: 30 },
  { rolId: '1495773001575305230', isim: 'Waynwood Hanesi',   kasa: 2700000,  haftalikGelir: 120000, duzenliAsker: 2800,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305228', isim: 'Redfort Hanesi',    kasa: 2700000,  haftalikGelir: 120000, duzenliAsker: 4000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001575305227', isim: 'Belmore Hanesi',    kasa: 2000000,  haftalikGelir: 110000, duzenliAsker: 2000,  paraliAsker: 0, donanma: 0 },
  // Demir Adalar
  { rolId: '1495773001633894403', isim: 'Greyjoy Hanesi',    kasa: 2500000,  haftalikGelir: 110000, duzenliAsker: 4000,  paraliAsker: 0, donanma: 200 },
  { rolId: '1495773001306734749', isim: 'Harlaw Hanesi',     kasa: 2750000,  haftalikGelir: 120000, duzenliAsker: 2500,  paraliAsker: 0, donanma: 80 },
  { rolId: '1495773001306734748', isim: 'Goodbrother Hanesi',kasa: 1500000,  haftalikGelir: 100000, duzenliAsker: 1500,  paraliAsker: 0, donanma: 40 },
  { rolId: '1495773001306734747', isim: 'Drumm Hanesi',      kasa: 1250000,  haftalikGelir: 80000,  duzenliAsker: 1000,  paraliAsker: 0, donanma: 30 },
  { rolId: '1495773001306734746', isim: 'Blacktyde Hanesi',  kasa: 1000000,  haftalikGelir: 75000,  duzenliAsker: 800,   paraliAsker: 0, donanma: 20 },
  { rolId: '1495773001306734745', isim: 'Botley Hanesi',     kasa: 750000,   haftalikGelir: 70000,  duzenliAsker: 700,   paraliAsker: 0, donanma: 15 },
  // Taç Toprakları
  { rolId: '1495773001650802739', isim: 'Kraliyet Hanesi',   kasa: 8500000,  haftalikGelir: 300000, duzenliAsker: 22500, paraliAsker: 0, donanma: 80 },
  { rolId: '1495773001306734744', isim: 'Velaryon Hanesi',   kasa: 5500000,  haftalikGelir: 180000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 150 },
  { rolId: '1495773001306734743', isim: 'Celtigar Hanesi',   kasa: 2800000,  haftalikGelir: 140000, duzenliAsker: 1500,  paraliAsker: 0, donanma: 20 },
  { rolId: '1495773001306734742', isim: 'Rosby Hanesi',      kasa: 2200000,  haftalikGelir: 100000, duzenliAsker: 1000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562555', isim: 'Massey Hanesi',     kasa: 1400000,  haftalikGelir: 95000,  duzenliAsker: 950,   paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562554', isim: 'Rykker Hanesi',     kasa: 1400000,  haftalikGelir: 100000, duzenliAsker: 1000,  paraliAsker: 0, donanma: 0 },
  // Dorne
  { rolId: '1495773001633894407', isim: 'Martell Hanesi',    kasa: 5000000,  haftalikGelir: 160000, duzenliAsker: 8500,  paraliAsker: 0, donanma: 20 },
  { rolId: '1495773001235562553', isim: 'Yronwood Hanesi',   kasa: 4500000,  haftalikGelir: 140000, duzenliAsker: 7000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562552', isim: 'Dayne Hanesi',      kasa: 3750000,  haftalikGelir: 140000, duzenliAsker: 5500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562551', isim: 'Fowler Hanesi',     kasa: 3000000,  haftalikGelir: 120000, duzenliAsker: 3500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562550', isim: 'Blackmont Hanesi',  kasa: 2500000,  haftalikGelir: 110000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562549', isim: 'Uller Hanesi',      kasa: 2000000,  haftalikGelir: 100000, duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  // Fırtına Toprakları
  { rolId: '1495773001650802738', isim: 'Baratheon Hanesi',  kasa: 3000000,  haftalikGelir: 140000, duzenliAsker: 6000,  paraliAsker: 0, donanma: 60 },
  { rolId: '1495773001235562548', isim: 'Tarth Hanesi',      kasa: 1000000,  haftalikGelir: 100000, duzenliAsker: 3000,  paraliAsker: 0, donanma: 10 },
  { rolId: '1495773001235562547', isim: 'Dondarrion Hanesi', kasa: 1500000,  haftalikGelir: 110000, duzenliAsker: 2750,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001235562546', isim: 'Selmy Hanesi',      kasa: 1500000,  haftalikGelir: 105000, duzenliAsker: 2500,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001214328962', isim: 'Swann Hanesi',      kasa: 1450000,  haftalikGelir: 120000, duzenliAsker: 2000,  paraliAsker: 0, donanma: 0 },
  { rolId: '1495773001214328961', isim: 'Estermont Hanesi',  kasa: 1400000,  haftalikGelir: 110000, duzenliAsker: 1500,  paraliAsker: 0, donanma: 10 },
  { rolId: '1495773001214328960', isim: 'Caron Hanesi',      kasa: 1000000,  haftalikGelir: 95000,  duzenliAsker: 1250,  paraliAsker: 0, donanma: 0 },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB baglandi.');

  let eklenen = 0;
  for (const h of DEFAULTS) {
    const mevcut = await House.findOne({ rolId: h.rolId });
    if (!mevcut) {
      await House.create(h);
      eklenen++;
      console.log('Eklendi: ' + h.isim);
    } else {
      console.log('Zaten var: ' + h.isim);
    }
  }

  console.log('\nTamamlandi. Eklenen: ' + eklenen);
  process.exit(0);
})();