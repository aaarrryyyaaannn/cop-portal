import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { addPendingFir } from '../lib/db'
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react'

const crimeTypes = ['Theft', 'Assault', 'Cybercrime', 'Fraud', 'Robbery', 'Domestic Violence', 'Other']
const steps = ['Complainant Details', 'Incident Details', 'Evidence Upload']

export default function FirFiling() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: '',
    crimeType: '',
  })
  const [files, setFiles] = useState([])
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selected])
  }
  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const handleSaveDraft = () => {
    localStorage.setItem('fir_draft', JSON.stringify({ form }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const canNext = () => {
    if (step === 0) return form.name && form.phone && form.address
    if (step === 1) return form.incidentDate && form.location && form.description && form.crimeType
    return true
  }

  const firPayload = () => ({
    complainant: {
      name: form.name,
      email: form.email || '',
      phone: form.phone,
      address: form.address,
    },
    incident: {
      date: form.incidentDate,
      time: form.incidentTime || '',
      location: form.location,
      description: form.description,
      crimeType: form.crimeType,
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
      return
    }
    setSubmitting(true)
    try {
      const data = await api.createFir(firPayload())
      localStorage.removeItem('fir_draft')
      if (files.length > 0 && data._id) {
        for (const file of files) {
          await api.uploadEvidence(data._id, file)
        }
      }
      alert(`FIR submitted successfully! FIR Number: ${data.firNumber}`)
      window.location.href = '/'
    } catch (err) {
      if (!navigator.onLine) {
        await addPendingFir(firPayload())
        alert('You are offline. FIR saved locally and will sync when online.')
      } else {
        setError(err.message || 'Submission failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">File New FIR</h1>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${i === step ? 'bg-amber-500 text-white' : i < step ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {i + 1}. {s}
              </span>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />}
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">Complainant Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">Incident Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Incident *</label>
                <input
                  type="date"
                  value={form.incidentDate}
                  onChange={(e) => update('incidentDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={form.incidentTime}
                  onChange={(e) => update('incidentTime', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Enter incident location"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type of Crime *</label>
              <select
                value={form.crimeType}
                onChange={(e) => update('crimeType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                required
              >
                <option value="">Select crime type</option>
                {crimeTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                placeholder="Describe the incident in detail"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">Evidence Upload</h2>
            <p className="text-slate-500 text-sm">Upload images, documents, or video evidence (optional)</p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-500/50 hover:bg-amber-50/30 transition">
              <Upload className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">Click to upload or drag and drop</span>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            {saved ? '✓ Draft saved' : 'Save as draft'}
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              type="submit"
              disabled={!canNext() || submitting}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {submitting ? 'Submitting...' : step < steps.length - 1 ? 'Next' : 'Submit FIR'}
              {step < steps.length - 1 && !submitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
