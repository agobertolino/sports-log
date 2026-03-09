# Sports Log 🏋️

App iOS per tracciare i tuoi allenamenti. Costruita con Expo + React Native + TypeScript.

## Stack
- **Expo** (SDK 52) + **Expo Router** per la navigazione
- **expo-sqlite** per il database locale (offline-first)
- **TypeScript** ovunque
- Font: DM Sans + DM Serif Display

## Setup

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Avvia il progetto
```bash
npx expo start
```

### 3. Apri sull'iPhone
- Installa **Expo Go** dall'App Store
- Scansiona il QR code che appare nel terminale

## Struttura del progetto

```
app/
├── _layout.tsx               # Root: font, DB init, redirect onboarding
├── onboarding.tsx            # Setup iniziale (nome + dati opzionali)
├── (tabs)/
│   ├── _layout.tsx           # Tab bar
│   ├── index.tsx             # Home
│   ├── storico.tsx           # Lista allenamenti passati
│   └── profilo.tsx           # Profilo utente
└── nuovo-allenamento/
    ├── _layout.tsx
    ├── index.tsx             # Scelta sport
    └── palestra.tsx          # Selezione muscoli

components/
├── Button.tsx                # Bottone riutilizzabile
├── SportCard.tsx             # Card sport
└── MuscleChip.tsx            # Chip muscolo

constants/
└── theme.ts                  # Colori, font, spacing, radius

db/
├── database.ts               # Init SQLite + schema
├── users.ts                  # Query profilo
└── workouts.ts               # Query allenamenti

hooks/
└── useProfile.ts             # Hook profilo utente
```

## Database (SQLite locale)

```sql
users         → nome, data_nascita, peso, altezza
workouts      → id, sport, muscoli, note, durata_secondi, data
workout_sets  → id, workout_id, esercizio, muscolo, serie, reps, peso_kg
```

## Build per iOS (senza Mac)

```bash
# Installa EAS CLI
npm install -g eas-cli

# Login Expo
eas login

# Configura il build
eas build:configure

# Build in cloud (richiede Apple Developer Account)
eas build --platform ios
```
