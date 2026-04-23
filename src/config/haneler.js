/**
 * Hane Konfigürasyonu
 * arma: src/assets/haneler/ klasöründeki dosya adı
 */

const AZAM_HANELER = [
  '1495870555004469461', // Targaryen
  '1495773001650802739', // Kraliyet
  '1495773001650802738', // Baratheon
  '1495773001633894409', // Lannister
  '1495773001633894408', // Stark
  '1495773001633894407', // Martell
  '1495773001633894406', // Tyrell
  '1495773001633894405', // Arryn
  '1495773001633894404', // Tully
  '1495773001633894403', // Greyjoy
];

const HANELER = [
  { rolId: '1495773001650802739', isim: 'Kraliyet Hanesi',    bolge: 'Taç Toprakları',    arma: 'kraliyet.webp',    azam: true },
  { rolId: '1495773001650802738', isim: 'Baratheon Hanesi',   bolge: 'Fırtına Toprakları', arma: 'baratheon.webp',   azam: true },
  { rolId: '1495773001633894409', isim: 'Lannister Hanesi',   bolge: 'Batı Toprakları',    arma: 'lannister.webp',   azam: true },
  { rolId: '1495773001633894408', isim: 'Stark Hanesi',       bolge: 'Kuzey Toprakları',   arma: 'stark.webp',       azam: true },
  { rolId: '1495773001633894407', isim: 'Martell Hanesi',     bolge: 'Dorne',              arma: 'martell.webp',     azam: true },
  { rolId: '1495773001633894406', isim: 'Tyrell Hanesi',      bolge: 'Menzil Toprakları',  arma: 'tyrell.webp',      azam: true },
  { rolId: '1495773001633894405', isim: 'Arryn Hanesi',       bolge: 'Vadi Toprakları',    arma: 'arryn.webp',       azam: true },
  { rolId: '1495773001633894404', isim: 'Tully Hanesi',       bolge: 'Nehir Toprakları',   arma: 'tully.webp',       azam: true },
  { rolId: '1495773001633894403', isim: 'Greyjoy Hanesi',     bolge: 'Demir Adalar',       arma: 'greyjoy.webp',     azam: true },
  { rolId: '1495773001633894402', isim: 'Karstark Hanesi',    bolge: 'Kuzey Toprakları',   arma: 'karstark.webp',    azam: false },
  { rolId: '1495773001633894401', isim: 'Umber Hanesi',       bolge: 'Kuzey Toprakları',   arma: 'umber.webp',       azam: false },
  { rolId: '1495773001633894400', isim: 'Manderly Hanesi',    bolge: 'Kuzey Toprakları',   arma: 'manderly.webp',    azam: false },
  { rolId: '1495773001608724709', isim: 'Bolton Hanesi',      bolge: 'Kuzey Toprakları',   arma: 'bolton.webp',      azam: false },
  { rolId: '1495773001608724708', isim: 'Cerwyn Hanesi',      bolge: 'Kuzey Toprakları',   arma: 'cerwyn.webp',      azam: false },
  { rolId: '1495773001608724707', isim: 'Reed Hanesi',        bolge: 'Kuzey Toprakları',   arma: 'reed.webp',        azam: false },
  { rolId: '1495773001608724706', isim: 'Mormont Hanesi',     bolge: 'Kuzey Toprakları',   arma: 'mormont.webp',     azam: false },
  { rolId: '1495773001608724705', isim: 'Glover Hanesi',      bolge: 'Kuzey Toprakları',   arma: 'glover.webp',      azam: false },
  { rolId: '1495773001608724704', isim: 'Frey Hanesi',        bolge: 'Nehir Toprakları',   arma: 'frey.webp',        azam: false },
  { rolId: '1495773001608724703', isim: 'Mallister Hanesi',   bolge: 'Nehir Toprakları',   arma: 'mallister.webp',   azam: false },
  { rolId: '1495773001608724702', isim: 'Blackwood Hanesi',   bolge: 'Nehir Toprakları',   arma: 'blackwood.webp',   azam: false },
  { rolId: '1495773001608724701', isim: 'Bracken Hanesi',     bolge: 'Nehir Toprakları',   arma: 'bracken.webp',     azam: false },
  { rolId: '1495773001608724700', isim: 'Vance Hanesi',       bolge: 'Nehir Toprakları',   arma: 'vance.webp',       azam: false },
  { rolId: '1495773001575305235', isim: 'Piper Hanesi',       bolge: 'Nehir Toprakları',   arma: 'piper.webp',       azam: false },
  { rolId: '1495773001575305234', isim: 'Darry Hanesi',       bolge: 'Nehir Toprakları',   arma: 'darry.webp',       azam: false },
  { rolId: '1495773001575305233', isim: 'Whent Hanesi',       bolge: 'Nehir Toprakları',   arma: 'whent.webp',       azam: false },
  { rolId: '1495773001575305232', isim: 'Royce Hanesi',       bolge: 'Vadi Toprakları',    arma: 'royce.webp',       azam: false },
  { rolId: '1495773001575305231', isim: 'Corbray Hanesi',     bolge: 'Vadi Toprakları',    arma: 'corbray.webp',     azam: false },
  { rolId: '1495773001575305230', isim: 'Waynwood Hanesi',    bolge: 'Vadi Toprakları',    arma: 'waynwood.webp',    azam: false },
  { rolId: '1495773001575305229', isim: 'Grafton Hanesi',     bolge: 'Vadi Toprakları',    arma: 'grafton.webp',     azam: false },
  { rolId: '1495773001575305228', isim: 'Redfort Hanesi',     bolge: 'Vadi Toprakları',    arma: 'redfort.webp',     azam: false },
  { rolId: '1495773001575305227', isim: 'Belmore Hanesi',     bolge: 'Vadi Toprakları',    arma: 'belmore.webp',     azam: false },
  { rolId: '1495773001575305226', isim: 'Lefford Hanesi',     bolge: 'Batı Toprakları',    arma: 'lefford.webp',     azam: false },
  { rolId: '1495773001428238365', isim: 'Crakehall Hanesi',   bolge: 'Batı Toprakları',    arma: 'crakehall.webp',   azam: false },
  { rolId: '1495773001428238364', isim: 'Marbrand Hanesi',    bolge: 'Batı Toprakları',    arma: 'marbrand.webp',    azam: false },
  { rolId: '1495773001428238363', isim: 'Westerling Hanesi',  bolge: 'Batı Toprakları',    arma: 'westerling.webp',  azam: false },
  { rolId: '1495773001428238362', isim: 'Brax Hanesi',        bolge: 'Batı Toprakları',    arma: 'brax.webp',        azam: false },
  { rolId: '1495773001428238361', isim: 'Farman Hanesi',      bolge: 'Batı Toprakları',    arma: 'farman.webp',      azam: false },
  { rolId: '1495773001428238360', isim: 'Hightower Hanesi',   bolge: 'Menzil Toprakları',  arma: 'hightower.webp',   azam: false },
  { rolId: '1495773001428238359', isim: 'Redwyne Hanesi',     bolge: 'Menzil Toprakları',  arma: 'redwyne.webp',     azam: false },
  { rolId: '1495773001428238358', isim: 'Florent Hanesi',     bolge: 'Menzil Toprakları',  arma: 'florent.webp',     azam: false },
  { rolId: '1495773001428238357', isim: 'Tarly Hanesi',       bolge: 'Menzil Toprakları',  arma: 'tarly.webp',       azam: false },
  { rolId: '1495773001428238356', isim: 'Rowan Hanesi',       bolge: 'Menzil Toprakları',  arma: 'rowan.webp',       azam: false },
  { rolId: '1495773001306734751', isim: 'Oakheart Hanesi',    bolge: 'Menzil Toprakları',  arma: 'oakheart.webp',    azam: false },
  { rolId: '1495773001306734750', isim: 'Fossoway Hanesi',    bolge: 'Menzil Toprakları',  arma: 'fossoway.webp',    azam: false },
  { rolId: '1495773001306734749', isim: 'Harlaw Hanesi',      bolge: 'Demir Adalar',       arma: 'harlaw.webp',      azam: false },
  { rolId: '1495773001306734748', isim: 'Goodbrother Hanesi', bolge: 'Demir Adalar',       arma: 'goodbrother.webp', azam: false },
  { rolId: '1495773001306734747', isim: 'Drumm Hanesi',       bolge: 'Demir Adalar',       arma: 'drumm.webp',       azam: false },
  { rolId: '1495773001306734746', isim: 'Blacktyde Hanesi',   bolge: 'Demir Adalar',       arma: 'blacktyde.webp',   azam: false },
  { rolId: '1495773001306734745', isim: 'Botley Hanesi',      bolge: 'Demir Adalar',       arma: 'botley.webp',      azam: false },
  { rolId: '1495773001306734744', isim: 'Velaryon Hanesi',    bolge: 'Taç Toprakları',     arma: 'velaryon.webp',    azam: false },
  { rolId: '1495773001306734743', isim: 'Celtigar Hanesi',    bolge: 'Taç Toprakları',     arma: 'celtigar.webp',    azam: false },
  { rolId: '1495773001306734742', isim: 'Rosby Hanesi',       bolge: 'Taç Toprakları',     arma: 'rosby.webp',       azam: false },
  { rolId: '1495773001235562555', isim: 'Massey Hanesi',      bolge: 'Taç Toprakları',     arma: 'massey.webp',      azam: false },
  { rolId: '1495773001235562554', isim: 'Rykker Hanesi',      bolge: 'Taç Toprakları',     arma: 'rykker.webp',      azam: false },
  { rolId: '1495773001235562553', isim: 'Yronwood Hanesi',    bolge: 'Dorne',              arma: 'yronwood.webp',    azam: false },
  { rolId: '1495773001235562552', isim: 'Dayne Hanesi',       bolge: 'Dorne',              arma: 'dayne.webp',       azam: false },
  { rolId: '1495773001235562551', isim: 'Fowler Hanesi',      bolge: 'Dorne',              arma: 'fowler.webp',      azam: false },
  { rolId: '1495773001235562550', isim: 'Blackmont Hanesi',   bolge: 'Dorne',              arma: 'blackmont.webp',   azam: false },
  { rolId: '1495773001235562549', isim: 'Uller Hanesi',       bolge: 'Dorne',              arma: 'uller.webp',       azam: false },
  { rolId: '1495773001235562548', isim: 'Tarth Hanesi',       bolge: 'Fırtına Toprakları', arma: 'tarth.webp',       azam: false },
  { rolId: '1495773001235562547', isim: 'Dondarrion Hanesi',  bolge: 'Fırtına Toprakları', arma: 'dondarrion.webp',  azam: false },
  { rolId: '1495773001235562546', isim: 'Selmy Hanesi',       bolge: 'Fırtına Toprakları', arma: 'selmy.webp',       azam: false },
  { rolId: '1495773001214328962', isim: 'Swann Hanesi',       bolge: 'Fırtına Toprakları', arma: 'swann.webp',       azam: false },
  { rolId: '1495773001214328961', isim: 'Estermont Hanesi',   bolge: 'Fırtına Toprakları', arma: 'estermont.webp',   azam: false },
  { rolId: '1495773001214328960', isim: 'Caron Hanesi',       bolge: 'Fırtına Toprakları', arma: 'caron.webp',       azam: false },
  { rolId: '1495870555004469461', isim: 'Targaryen Hanesi',  bolge: 'Taç Toprakları',  arma: 'targaryen.webp',  azam: true },
  { rolId: '1495773001214328959', isim: 'Rogare Hanesi',      bolge: 'Essos',              arma: 'rogare.webp',      azam: false },
  { rolId: '1495773001214328958', isim: 'Altın Kumpanya',     bolge: 'Essos',              arma: 'altinkumpanya.webp',azam: false },
];

// Bölge → Kontenjan bilgisi
const BOLGELER = [
  { isim: 'Kuzey Toprakları',   emoji: '❄️' },
  { isim: 'Nehir Toprakları',   emoji: '🐟' },
  { isim: 'Taç Toprakları',     emoji: '👑' },
  { isim: 'Batı Toprakları',    emoji: '🦁' },
  { isim: 'Fırtına Toprakları', emoji: '🦌' },
  { isim: 'Vadi Toprakları',    emoji: '🦅' },
  { isim: 'Dorne',              emoji: '☀️' },
  { isim: 'Menzil Toprakları',  emoji: '🌿' },
  { isim: 'Demir Adalar',       emoji: '🐙' },
  { isim: 'Essos',              emoji: '🌍' },
];

// Meslek maaşları (AE / haftalık)
const MAASLAR = {
  '1495773001868771502': 1000, // Kral/Kraliçe
  '1495773001868771501': 750,  // Prens/Prenses
  '1495773001868771500': 750,  // Dorne Prensi
  '1495773001868771499': 600,  // Kral Eli
  '1495773001868771498': 500,  // Yüce Lord
  '1495773001713713311': 500,  // Kral Muhafızları L.K.
  '1495773001713713310': 400,  // Şehir Muhafızları L.K.
  '1495773001713713309': 400,  // Gece Nöbetçileri L.K.
  '1495773001713713308': 400,  // Yüce Septon
  '1495773001713713306': 350,  // Büyük Üstat
  '1495773001713713305': 350,  // Hazinedar
  '1495773001713713304': 350,  // Kanun Başı
  '1495773001713713303': 350,  // Donanma Başı
  '1495773001713713302': 350,  // Fısıltıların Efendisi
  '1495773001675702565': 300,  // Kral Muhafızı
  '1495773001675702564': 250,  // Lord/Leydi
  '1495773001675702563': 200,  // Şövalye
  '1495773001675702562': 150,  // Gece Nöbetçisi
  '1495773001675702561': 100,  // Kızıl Rahip/Rahibe
  '1495773001675702560': 100,  // Paralı Asker
  '1495773001675702559': 100,  // Tüccar
  '1495773001675702558': 100,  // Korsan
  '1495773001675702557': 75,   // Haydut
  '1495773001675702556': 75,   // Nedime
  '1495773001663123476': 50,   // Yaver
  '1495879727586742396': 500,  // Altın Kumpanya Kaptan Generali
  '1495880035805040670': 700,  // Rogare Leydisi
};

// Lord/Leydi rolü
const LORD_LEYDI_ROL = '1495773001675702564';

module.exports = { HANELER, AZAM_HANELER, BOLGELER, MAASLAR, LORD_LEYDI_ROL };