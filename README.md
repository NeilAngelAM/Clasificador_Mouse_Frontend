# Web de identificación de mouse

React + Vite. Permite subir fotos o usar el selector de cámara trasera del celular. El comportamiento de la cámara depende del navegador.

```bash
npm ci
```

Copia `.env.example` como `.env` y configura `VITE_API_URL` con la URL del backend.

```bash
npm run dev
npm run build
```

Netlify: Base Directory `frontend` si subes todo el proyecto, comando `npm run build`, carpeta `dist`. Configura `VITE_API_URL` antes de compilar y vuelve a desplegar si cambias su valor. Usa HTTPS tanto para frontend como backend y agrega la URL del frontend a `ALLOWED_ORIGINS` del servidor.
