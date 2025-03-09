# RPG Table Generator

Aplikacja webowa do generowania i zarządzania losowymi tabelami RPG.

## Struktura Projektu

```
├── frontend/           # Aplikacja React
├── backend/           # API PHP
├── public/            # Pliki statyczne
└── src/               # Współdzielony kod źródłowy
    ├── components/    # Komponenty React
    ├── pages/         # Strony aplikacji
    ├── hooks/         # Custom React hooks
    ├── utils/         # Funkcje pomocnicze
    ├── styles/        # Style CSS/SCSS
    ├── types/         # TypeScript types
    └── api/           # Integracja z API
```

## Wymagania systemowe

- PHP 8.x
- MySQL/MariaDB
- Node.js 18+
- npm/yarn

## Instalacja

1. Sklonuj repozytorium
2. Zainstaluj zależności frontendu:
   ```bash
   cd frontend
   npm install
   ```
3. Zainstaluj zależności backendu:
   ```bash
   cd backend
   composer install
   ```
4. Skonfiguruj bazę danych w pliku `.env`
5. Uruchom migracje bazy danych:
   ```bash
   php artisan migrate
   ```

## Uruchomienie w trybie developerskim

1. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Backend:
   ```bash
   cd backend
   php artisan serve
   ```

## Deployment

1. Zbuduj frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Przenieś pliki na serwer seohost.pl:
   - Zawartość katalogu `frontend/dist` do katalogu `public_html`
   - Zawartość katalogu `backend` do katalogu `backend`
   - Skonfiguruj `.htaccess` dla prawidłowego routingu

## Licencja

MIT 