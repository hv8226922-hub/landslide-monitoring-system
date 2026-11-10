# AI-Based Landslide Early Warning System

A student MVP for landslide risk monitoring and early warning in Northeast India.

## Project modules
- `client/`: React + Tailwind + Leaflet dashboard and citizen reporting UI
- `server/`: Node.js + Express API and PostgreSQL/PostGIS integration
- `ml-service/`: Python risk scoring and machine-learning service
- `docs/`: architecture, API notes, and project documentation

## Build order
1. Create the React client and dashboard shell
2. Add the Express API and sample endpoints
3. Add PostgreSQL/PostGIS schema and connect the API
4. Add Python risk scoring, then train/evaluate a model when suitable data is ready
5. Add map layers, reporting, alerts, and offline support

This is a prototype. A risk score from sample data is not an official warning.
