<div align="center">

# Tekla Connection Manager

**Automatizacion de conexiones estructurales en Tekla Structures 2020**

![Tekla Structures](https://img.shields.io/badge/Tekla_Structures-2020-00598C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDIgN3YxMGwxMCA1IDEwLTVIN0w3IDE3bDUtMi41TDcgMTJsNS0yLjVINnoiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3-000000?style=for-the-badge&logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

[Descripcion](#descripcion) · [Caracteristicas](#caracteristicas) · [Instalacion](#instalacion) · [Uso](#uso) · [API](#referencia-api) · [Arquitectura](#arquitectura)

</div>

---

## Descripcion

**Tekla Connection Manager** es una aplicacion web full-stack que permite aplicar y gestionar conexiones estructurales (placas de cortante, placas finales, angulos de clip, etc.) directamente desde el navegador, comunicandose en tiempo real con un modelo abierto en **Tekla Structures 2020**.

Elimina la necesidad de navegar manualmente por los menus de Tekla para cada conexion. Desde una sola interfaz puedes ver todos los elementos de tu modelo, seleccionar vigas y columnas, elegir el tipo de conexion y aplicarla con un clic — o generar cientos de conexiones en lote.

<div align="center">

```
┌─────────────┐      ┌──────────┐      ┌──────────┐      ┌─────────────────┐
│  Navegador  │ ───▶ │ Vite     │ ───▶ │ Flask    │ ───▶ │ Tekla Structures│
│  React 18   │      │ :5176    │      │ :3001    │      │ 2020 Open API   │
└─────────────┘      └──────────┘      └──────────┘      └─────────────────┘
                              proxy /api      pythonnet
```

</div>

---

## Caracteristicas

| Funcionalidad | Descripcion |
|:---|:---|
| **Estado en tiempo real** | Verifica la conexion con Tekla Structures y muestra el nombre del modelo activo |
| **Listado de elementos** | Carga y muestra todas las vigas y columnas del modelo con perfil, material y coordenadas |
| **Seleccion interactiva** | Selecciona elementos haciendo clic en la tabla para usarlos en conexiones |
| **Conexion individual** | Aplica una conexion entre dos elementos con parametros personalizados (tornillo, placa) |
| **Aplicacion en lote** | Genera automaticamente conexiones Shear Tab entre todas las combinaciones viga-columna |
| **Catalogo de conexiones** | 10 tipos de conexion predefinidos: Clip Angle, End Plate, Splice Plate, Shear Tab, Column Seat, Stiffened End Plate, Bolted Bracket, Purlin Clip Angle, Sleeve Connection, Corner Bracket |
| **Resultados detallados** | Resumen visual de conexiones exitosas vs fallidas despues de cada operacion en lote |

---

## Requisitos

| Componente | Version | Notas |
|:---|:---:|:---|
| **Tekla Structures** | 2020.0 | Debe estar abierto con un modelo cargado |
| **Python** | 3.11+ | Backend Flask + pythonnet |
| **Node.js** | 18+ | Frontend Vite |
| **.NET Framework** | 4.x | Pre-instalado en Windows |
| **pythonnet** | 3.0.5 | Puente Python → DLLs de Tekla |

> **Nota:** Los DLLs de Tekla se encuentran en `C:\Program Files\Tekla Structures\2020.0\nt\bin\plugins\`

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/gcorrea2005/tekla-app.git
cd tekla-app
```

### 2. Instalar dependencias del backend

```bash
cd server
pip install flask flask-cors pythonnet
```

### 3. Instalar dependencias del frontend

```bash
cd ../client
npm install
```

---

## Uso

### Iniciar la aplicacion

**Terminal 1 — Backend (Flask):**
```bash
cd server
python app.py
```
El servidor arranca en `http://localhost:3001`

**Terminal 2 — Frontend (Vite):**
```bash
cd client
npm run dev
```
La interfaz estara disponible en `http://localhost:5176`

### Flujo de trabajo

```
1. Abre Tekla Structures 2020 con tu modelo
2. Inicia el backend y el frontend
3. Abre http://localhost:5176 en tu navegador
4. Haz clic en "Cargar Elementos" para listar vigas y columnas
5. Selecciona "Conexion Individual" o "Aplicacion en Lote"
6. Configura los parametros y aplica
```

### Conexion individual

1. Selecciona el **Elemento Primario** (columna/soporte)
2. Selecciona el **Elemento Secundario** (viga/miembro)
3. Elige el **Tipo de Conexion** del catalogo
4. Ajusta **tamano de tornillo** y **espesor de placa**
5. Haz clic en **"Aplicar Conexion"**

### Aplicacion en lote

1. Carga los elementos del modelo
2. Cambia a la pestana **"Aplicacion en Lote"**
3. Revisa el conteo de columnas, vigas y conexiones estimadas
4. Haz clic en **"Generar y Aplicar Todas las Conexiones"**
5. Revisa el resumen de resultados

> **Advertencia:** El lote genera una conexion Shear Tab (#44) por cada combinacion viga-columna. Si tienes 10 vigas y 5 columnas, se crearan 50 conexiones.

---

## Tipos de Conexion

| # | Nombre | Categoria | Descripcion |
|:---:|:---|:---|:---|
| 1 | **Clip Angle** | Beam to Column | Angulo de clip atornillado |
| 10 | **End Plate** | Beam to Column | Placa final soldada |
| 11 | **Splice Plate** | Beam to Beam | Empalme entre vigas |
| 44 | **Shear Tab** | Beam to Column | Placa de cortante — la mas comun |
| 134 | **Column Seat** | Beam to Column | Asiento de columna |
| 142 | **Stiffened End Plate** | Beam to Column | Placa final rigidizada |
| 146 | **Bolted Bracket** | Beam to Column | Cartela atornillada |
| 80 | **Purlin Clip Angle** | Purlin to Beam | Angulo de clip para correas |
| 81 | **Sleeve Connection** | Beam to Beam | Conexion manguito |
| 82 | **Corner Bracket** | Beam to Column | Cartela de esquina |

---

## Referencia API

El backend expone los siguientes endpoints REST en `http://localhost:3001`:

### Estado

```
GET /api/status
```
Respuesta:
```json
{ "connected": true, "name": "Tekla Model" }
```

### Modelo

```
GET /api/beams          → Lista de vigas
GET /api/columns        → Lista de columnas
GET /api/objects        → Todos los elementos (vigas + columnas)
GET /api/components     → Catalogo de tipos de conexion
```

### Conexiones

```
POST /api/connections           → Aplicar una conexion individual
POST /api/connections/advanced  → Conexion con parametros avanzados
POST /api/connections/batch     → Aplicar multiples conexiones en lote
DELETE /api/connections/:id     → Eliminar una conexion por ID
```

### Ejemplo: Aplicar conexion

```bash
curl -X POST http://localhost:3001/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "primaryId": 12345,
    "secondaryId": 67890,
    "componentNumber": 44,
    "componentName": "Shear Tab",
    "boltSize": "M16",
    "plateThickness": 10
  }'
```

Respuesta exitosa:
```json
{
  "success": true,
  "message": "Conexion aplicada correctamente",
  "connectionId": 98765
}
```

---

## Arquitectura

### Stack tecnologico

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                │
│   React 18 · Vite 5 · Axios                                    │
│   Puerto 5176                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ proxy /api
┌────────────────────────▼────────────────────────────────────────┐
│                     SERVIDOR FLASK                               │
│   Python 3.11 · Flask 3.1 · flask-cors                          │
│   Puerto 3001                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ pythonnet
┌────────────────────────▼────────────────────────────────────────┐
│                   TEKLA OPEN API 2020                            │
│   .NET DLLs → Tekla.Structures.Model                            │
│   C:\Program Files\Tekla Structures\2020.0\nt\bin\plugins\      │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura del proyecto

```
tekla-app/
│
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── tekla.js            # Capa de comunicacion con la API
│   │   ├── components/
│   │   │   ├── StatusBar.jsx       # Barra de estado de conexion
│   │   │   ├── BeamTable.jsx       # Tabla de elementos del modelo
│   │   │   ├── ConnectionForm.jsx  # Formulario de conexion individual
│   │   │   └── BatchPanel.jsx      # Panel de aplicacion en lote
│   │   ├── hooks/
│   │   │   └── useTekla.js         # Hook central de estado y logica
│   │   ├── styles/
│   │   │   └── app.css             # Estilos de la aplicacion
│   │   ├── App.jsx                 # Componente raiz
│   │   └── main.jsx                # Entry point
│   ├── index.html                  # HTML base
│   ├── vite.config.js              # Config de Vite con proxy a Flask
│   └── package.json
│
├── server/                         # Backend Python
│   ├── app.py                      # Servidor Flask con todas las rutas
│   ├── tekla_bridge.py             # Puente pythonnet a DLLs de Tekla
│   ├── index.js                    # (Alternativo) Servidor Express/Node.js
│   ├── tekla/                      # (Alternativo) Modulos Node.js
│   │   ├── status.js
│   │   ├── model.js
│   │   └── connection.js
│   └── package.json
│
├── manual.html                     # Manual de usuario en HTML
├── documentacion.html              # Documentacion adicional
├── .gitignore
└── README.md                       # Este archivo
```

### Decisiones de diseno

| Decision | Razon |
|:---|:---|
| **Python + pythonnet** en vez de .NET | Funciona sin .NET SDK — solo necesita .NET Framework runtime (pre-instalado en Windows) |
| **Flask** como backend | Ligero, sin configuracion compleja, ideal para API REST local |
| **Vite** como bundler | HMR instantaneo, proxy integrado para desarrollo |
| **Un solo enum BEAM** | Tekla 2020 no tiene `ModelObjectEnum.COLUMN` — se clasifica por clase u orientacion |
| **Clasificacion por clase** | Clase "1" = viga, clase "2" = columna (estandar Tekla). Fallback: orientacion vertical |

---

## Solucion de Problemas

| Problema | Causa | Solucion |
|:---|:---|:---|
| "Desconectado" en la barra de estado | Tekla no esta abierto o sin modelo | Abre Tekla 2020 y carga un modelo |
| "No hay elementos cargados" | No se hizo clic en "Cargar Elementos" | Haz clic en el boton de la tabla |
| Error al aplicar conexion | IDs invalidos o elementos incompatibles | Verifica que los IDs existen y son geometricamente compatibles |
| Puerto 3001 en uso | Otra instancia del servidor corriendo | Cierra la instancia anterior o cambia el puerto en `.env` |
| pythonnet no encuentra DLLs | Ruta incorrecta a Tekla | Verifica la instalacion en `C:\Program Files\Tekla Structures\2020.0\` |

---

## Licencia

MIT

---

<div align="center">

**Hecho con Python, React y mucho acero estructural**

</div>
