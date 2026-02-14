# Tessella – Multi-Display WebSocket System

Interaktive Installation: Bis zu 30 Displays zeigen synchron Texte, Bilder und Effekte,
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
npm run build
```
`npm install` installiert alle Abhängigkeiten (inkl. Pilot-App und Schriftarten).
`npm run build` baut die Pilot-App nach `dist/pilot/`.

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
├── ansible/            # Ansible Kiosk-Provisioning (siehe unten)
├── scripts/            # Postinstall-Skripte (Fonts, Libs kopieren)
├── dist/pilot/         # Gebaute Pilot-App
├── uploads/            # Hochgeladene Medien (Bilder, Videos)
├── lib/                # Client-seitige Libraries (Three.js etc.)
└── fonts/              # Lokale Schriftarten
```

## Features

### Pilot Control Panel
- **Text senden** – mit Animationen (Fade, Schreibmaschine, Slide)
- **Bilder hochladen** – werden auf dem Server gespeichert
- **Bilder kacheln** – ein Bild über mehrere Displays verteilen
- **Videos senden** – Upload und Wiedergabe mit Play/Pause/Sync-Steuerung
- **Hintergrundfarbe** – auf allen oder einzelnen Displays
- **Effekte** – Pulsieren, Glitch, Welle, Flash
- **Kaskade** – Text erscheint nacheinander auf jedem Display
- **Wörter verteilen** – ein Satz wird auf alle Displays aufgeteilt
- **Eyeball/Gaze-Tracking** – 3D-Auge mit Blickverfolgung via Kamera (MediaPipe)
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

## Ansible Kiosk-Provisioning

Im Verzeichnis `ansible/` liegt eine Ansible-Konfiguration zur automatischen Einrichtung von
Client-PCs als Kiosk-Displays. Damit lassen sich beliebig viele Laptops per Kommando als
dedizierte Displays konfigurieren – inklusive Autologin, Firefox-Kiosk, Screensaver-Deaktivierung u.v.m.

### Was wird konfiguriert?

- Firefox im Kiosk-Modus mit automatischem Start und Reconnect-Loop
- Autologin (LightDM oder SDDM)
- Firefox Enterprise Policies (keine Updates, keine Telemetrie, Homepage gelockt)
- Bildschirmschoner und DPMS deaktiviert
- Mauszeiger automatisch versteckt
- Audio stummgeschaltet
- Sleep/Suspend/Hibernate deaktiviert

### Unterstützte Distributionen

| Distribution      | Display-Manager | Firefox-Paket     |
|-------------------|-----------------|-------------------|
| MX Linux 25.1     | LightDM         | `firefox-esr`     |
| openSUSE          | SDDM            | `MozillaFirefox`  |

### Schnellstart

```bash
cd ansible/

# Inventory aus Template erstellen und IPs anpassen
cp inventories/hosts.yml.example inventories/hosts.yml

# Server-IP in group_vars/all.yml setzen
# tessella_server_ip: "192.168.1.100"

# SSH-Schlüssel auf Clients verteilen
ssh-copy-id <user>@<client-ip>

# Alle Clients provisionieren
ansible-playbook site.yml

# Nur bestimmte Gruppe
ansible-playbook site.yml --limit clients_mx

# Trockenlauf
ansible-playbook site.yml --check --diff
```

### Voraussetzungen

- Ansible >= 2.14 auf dem Steuerrechner
- SSH-Zugang + sudo-Rechte auf allen Clients
- Python 3 auf den Clients
- Tessella-Server läuft und ist im LAN erreichbar

> **Hinweis:** Der Tessella-Server selbst wird **nicht** von Ansible verwaltet.

Alle Features sind über Boolean-Flags in `group_vars/all.yml` einzeln steuerbar.
Ausführliche Dokumentation: [`ansible/README.md`](ansible/README.md)

## Erweitern

Das Kommunikationsprotokoll ist JSON über WebSocket. Neue Message-Types in `server.js`
in `handlePilotMessage()` hinzufügen und in `client.html` in `handleMessage()` behandeln.

Für die Pilot-UI neue Komponenten in `pilot/src/components/panels/` erstellen.

Bestehende Message-Types:
`send-text`, `send-image`, `send-tiled-image`, `send-video`, `video-control`,
`send-color`, `cascade-text`, `cascade-words`, `clear`, `effect`,
`show-eyeball`, `hide-eyeball`, `eyeball-gaze`, `config-display`

Ideen:
- Audio-Synchronisation
- Resolume-Integration via OSC
- Interaktive Inputs (Kamera, Mikrofon)
- AI-generierte Inhalte live einspeisen
