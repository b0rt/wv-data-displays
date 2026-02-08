# 🖥️ Laptop Installation – Multi-Display WebSocket System

Interaktive Installation: Bis zu 30 Laptops zeigen synchron Texte, Bilder und Effekte,
gesteuert von einem Pilot-Computer im selben LAN.

## Architektur

```
  ┌──────────────┐      WebSocket       ┌────────────────┐
  │   Pilot UI   │ ──────────────────── │   Node.js      │
  │  (Vue.js)    │                      │   Server       │
  │  /pilot      │                      │   :3000        │
  └──────────────┘                      └───────┬────────┘
                                               │ WebSocket
                   ┌───────────────────────────┼───────────────────┐
                   │         │         │        │       │           │
                ┌──┴──┐  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐ ┌──┴──┐  ┌──┴──┐
                │ L1  │  │ L2  │  │ L3  │  │ L4  │ │ L5  │  │ ... │
                └─────┘  └─────┘  └─────┘  └─────┘ └─────┘  └─────┘
                                 Laptops → /
```

## Setup

### 1. Voraussetzungen
- Node.js (v18+) auf dem Server-Rechner
- Alle Geräte im selben LAN/WLAN

### 2. Installation
```bash
npm install
```
Dies installiert alle Abhängigkeiten und baut die Pilot-App automatisch.

### 3. Server starten
```bash
npm start
```

### 4. IP-Adresse ermitteln
```bash
# Windows:
ipconfig

# Linux/Mac:
hostname -I
# oder
ip addr show | grep "inet "
```

### 5. Laptops verbinden
Auf jedem Laptop im Browser öffnen:
```
http://<SERVER-IP>:3000/
```
→ Klick auf "Vollbild" für Kiosk-Modus

### 6. Pilot öffnen
Auf dem Steuer-Computer:
```
http://<SERVER-IP>:3000/pilot
```

## Development

### Pilot-App entwickeln
Die Pilot-Oberfläche ist eine Vue.js-App mit shadcn-vue Components.

```bash
# In das pilot-Verzeichnis wechseln
cd pilot

# Development-Server starten (mit Hot-Reload)
npm run dev
```

Der Dev-Server läuft auf Port 5173 und proxied API-Aufrufe zum Hauptserver (Port 3000).
Der Hauptserver muss parallel laufen (`npm start` im Root-Verzeichnis).

### Pilot-App bauen
```bash
# Vom Root-Verzeichnis
npm run build

# Oder direkt im pilot-Verzeichnis
cd pilot && npm run build
```

Die gebaute App wird nach `dist/pilot/` geschrieben und vom Server ausgeliefert.

### Projektstruktur
```
├── server.js           # HTTP + WebSocket Server
├── client.html         # Display-Interface für Laptops
├── pilot/              # Vue.js Pilot-App
│   ├── src/
│   │   ├── App.vue
│   │   ├── components/ # UI-Komponenten
│   │   └── composables/# WebSocket-Verbindung
│   └── package.json
├── dist/pilot/         # Gebaute Pilot-App
├── uploads/            # Hochgeladene Bilder
└── fonts/              # Lokale Schriftarten
```

## Features

### Pilot Control Panel
- **Text senden** – mit Animationen (Fade, Schreibmaschine, Slide)
- **Bilder hochladen** – werden auf dem Server gespeichert
- **Bilder kacheln** – ein Bild über mehrere Displays verteilen
- **Hintergrundfarbe** – auf allen oder einzelnen Displays
- **Effekte** – Pulsieren, Glitch, Welle, Flash
- **Kaskade** – Text erscheint nacheinander auf jedem Display
- **Wörter verteilen** – ein Satz wird auf alle Displays aufgeteilt
- **Zielauswahl** – alle Displays oder einzelne ansprechen

### Client Features
- Auto-Reconnect bei Verbindungsabbruch
- Fullscreen-Modus
- Subtile Idle-Animation wenn leer
- Connection-Status-Indikator

## Tipps für die Installation

### Browser-Kiosk-Modus
Für einen cleanen Look ohne Browser-UI:

**Chromium/Chrome:**
```bash
chromium-browser --kiosk http://<IP>:3000/
```

**Firefox:**
```bash
firefox --kiosk http://<IP>:3000/
```

### Screensaver deaktivieren
```bash
# Linux:
xset s off
xset -dpms
xset s noblank
```

### Auto-Start beim Booten (Linux)
Erstelle `~/.config/autostart/installation.desktop`:
```ini
[Desktop Entry]
Type=Application
Name=Installation Display
Exec=chromium-browser --kiosk http://<SERVER-IP>:3000/
```

## Erweitern

Das Kommunikationsprotokoll ist JSON über WebSocket. Neue Message-Types in `server.js`
in `handlePilotMessage()` hinzufügen und in `client.html` in `handleMessage()` behandeln.

Für die Pilot-UI neue Komponenten in `pilot/src/components/panels/` erstellen.

Ideen:
- Video-Streams einbinden
- Audio-Synchronisation
- Resolume-Integration via OSC
- Interaktive Inputs (Kamera, Mikrofon)
- AI-generierte Inhalte live einspeisen
