import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { api } from '../lib/api'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in leaflet with bundlers
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function CrimeMap() {
    const [hotspots, setHotspots] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHotspots() {
            try {
                const data = await api.getCrimeHotspots()
                // Filter out those without valid coordinates
                setHotspots(data?.filter(f => f.incident?.coordinates) || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchHotspots()
    }, [])

    if (loading) return <div className="p-6">Loading Map...</div>

    const center = [28.6139, 77.2090] // Default to New Delhi or similar central point

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 flex flex-col h-[calc(100vh-6rem)]">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">Crime Hotspot Map</h1>
                <p className="text-slate-500">Interactive visualization of reported incidents.</p>
            </div>

            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                <MapContainer center={center} zoom={11} className="w-full h-full z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {hotspots.map(spot => {
                        const [lng, lat] = spot.incident.coordinates.coordinates
                        return (
                            <CircleMarker
                                key={spot._id}
                                center={[lat, lng]}
                                radius={8}
                                pathOptions={{
                                    color: spot.incident.severity === 'critical' ? 'red' : spot.incident.severity === 'high' ? 'orange' : 'blue',
                                    fillColor: spot.incident.severity === 'critical' ? 'red' : spot.incident.severity === 'high' ? 'orange' : 'blue',
                                    fillOpacity: 0.6
                                }}
                            >
                                <Popup>
                                    <div className="font-semibold">{spot.incident.crimeType}</div>
                                    <div className="text-sm text-slate-600">Status: {spot.status}</div>
                                </Popup>
                            </CircleMarker>
                        )
                    })}
                </MapContainer>
            </div>
        </div>
    )
}
