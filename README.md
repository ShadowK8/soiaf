# ASOIAF™ Discord Roleplay Bot

## Kurulum

### 1. Gereksinimler
- Node.js 18+
- MongoDB (local veya Atlas)

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla
`.env.example` dosyasını `.env` olarak kopyala ve doldur:
```bash
cp .env.example .env
```

```env
BOT_TOKEN=bot_tokenin_buraya
CLIENT_ID=bot_client_id_buraya
GUILD_ID=sunucu_id_buraya
MONGODB_URI=mongodb://localhost:27017/asoiaf
```

### 4. Slash Komutlarını Kaydet
```bash
npm run deploy
```

### 5. Botu Başlat
```bash
# Prodüksiyon
npm start

# Geliştirme (otomatik yeniden başlatma)
npm run dev
```

---

## Bot İzinleri

Bot'a şu izinleri ver:
- `Manage Roles` — Rol atama
- `View Audit Log` — Log'larda kim yaptı tespiti
- `Manage Guild` — Sunucu bilgisi
- `View Channels`
- `Send Messages`
- `Embed Links`

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `/kayit isim yaş` | Kullanıcıyı kayıt eder, Rol Dışı rolü verir |

---

## Log Kanalları

| Kanal | Olay |
|-------|------|
| Mesaj Log | Silinen & düzenlenen mesajlar |
| Ses Log | Ses kanalı giriş/çıkış/geçiş |
| Giriş/Çıkış Log | Sunucuya katılma/ayrılma + davet takibi |
| Sunucu Log | Kanal/rol oluşturma/silme, sunucu güncellemeleri |
| Üye Log | Rol değişimi, takma ad değişimi |
| Kayıt Log | `/kayit` komutu kullanımları |

---

## Klasör Yapısı

```
asoiaf-bot/
├── index.js
├── .env
├── package.json
└── src/
    ├── commands/
    │   └── kayit/
    │       └── kayit.js
    ├── config/
    │   ├── config.js      ← Kanal ID'leri
    │   └── roles.js       ← Rol ID'leri
    ├── events/
    │   ├── ready.js
    │   ├── interactionCreate.js
    │   ├── guildMemberAdd.js
    │   ├── guildMemberRemove.js
    │   ├── guildMemberUpdate.js
    │   ├── guildUpdate.js
    │   ├── channelCreate.js
    │   ├── channelDelete.js
    │   ├── roleCreate.js
    │   ├── roleDelete.js
    │   ├── messageDelete.js
    │   ├── messageUpdate.js
    │   └── voiceStateUpdate.js
    ├── handlers/
    │   ├── commandHandler.js
    │   └── eventHandler.js
    ├── models/
    │   └── User.js
    └── utils/
        ├── components.js  ← Components V2 builder
        ├── emojis.js      ← Emoji sabitleri
        ├── inviteCache.js ← Davet takibi
        └── deploy.js      ← Komut kayıt scripti
```

---

## Emoji Güncelleme

`src/utils/emojis.js` dosyasında unicode emojiler kullanılıyor.
Custom animated emoji yükledikten sonra şu formatta güncelle:

```js
// Animated
const CHECK = '<a:check:EMOJI_ID>';

// Statik
const SHIELD = '<:shield:EMOJI_ID>';
```
