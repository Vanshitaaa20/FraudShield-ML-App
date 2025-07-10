'use client'

import { useState } from 'react'
import Datatable from '@/components/Datatable'
import ProbabilityBar from '@/components/ProbabilityBar'
import { TableColumn } from 'react-data-table-component'

type RecordType = Record<string, any>

export default function Home() {
  // — Single prediction state
  const initialFormData = Object.fromEntries(
    [...Array(29).keys()].map(i =>
      i < 28 ? [`v${i + 1}`, 0] : ['amount', 0]
    )
  ) as RecordType

  const [formData, setFormData] = useState<RecordType>(initialFormData)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // — Bulk prediction state
  const [bulkResult, setBulkResult] = useState<RecordType[]>([])
  const [fileLoaded, setFileLoaded] = useState(false)

  // Handlers for single prediction
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('https://fraudshield-ml-app-production.up.railway.app/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const fillRandomData = () => {
    const rnd: RecordType = {}
    Object.keys(initialFormData).forEach((k) => {
      rnd[k] =
        k === 'amount'
          ? parseFloat((Math.random() * 5000).toFixed(2))
          : parseFloat((Math.random() * 5 - 2.5).toFixed(2))
    })
    setFormData(rnd)
  }

  // Handler for bulk CSV upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('fetch("https://fraudshield-ml-app-production.up.railway.app/bulk_predict")', {
      method: 'POST',
      body: fd,
    })
    const data = await res.json()
    console.log(data)
    setBulkResult(data)
    setFileLoaded(true)
  }

  // Download bulk results as CSV in-browser
  const handleDownloadCSV = () => {
    if (!bulkResult.length) return
    const headers = Object.keys(bulkResult[0])
    const rows = [
      headers.join(','),
      ...bulkResult.map((r) =>
        headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fraudshield_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Build columns for Datatable from the first record
  const columns = bulkResult.length > 0 ? Object.keys(bulkResult[0]) : []
    bulkResult.length > 0
      ? Object.keys(bulkResult[0]).map((key): TableColumn<RecordType> => ({
      name: key,
      selector: (row: RecordType) => row[key],
      sortable: true,
      wrap: true,
      }))
      : []

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans px-6 py-10">
      {/* Sample CSV download */}
      <div className="mb-4 text-sm">
        <a
          href="/sample.csv"
          download
          className="text-yellow-400 underline hover:text-yellow-500"
        >
          📂 Download sample CSV
        </a>
      </div>

      {/* Single prediction form */}
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">
        FraudShield Transaction Predictor
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 p-6 rounded"
      >
        {Object.entries(formData).map(([key, val]) => (
          <div key={key}>
            <label className="block text-sm text-gray-300 mb-1 capitalize">
              {key}
            </label>
            <input
              name={key}
              type="number"
              step="any"
              value={val}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
              required
            />
          </div>
        ))}
        <div className="col-span-full flex gap-4 mt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 py-3 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Predicting…' : 'Predict'}
          </button>
          <button
            type="button"
            onClick={fillRandomData}
            className="flex-1 bg-gray-600 py-3 rounded hover:bg-gray-500 transition"
          >
            Fill Random Data
          </button>
        </div>
      </form>

      {/* Single prediction result */}
      {result && (
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded max-w-md">
          <h2 className="text-2xl font-semibold text-blue-400 mb-2">
            Prediction Result
          </h2>
          <p
            className={`text-lg font-semibold ${result.data.prediction === 1 ? 'text-red-500' : 'text-green-500'
              }`}
          >
            Fraud Status:{' '}
            {result.data.prediction === 1 ? 'Fraudulent 🚨' : 'Legitimate ✅'}
          </p>
          <div className="text-lg mt-1">
            Fraud Probability:{' '}
            <strong className="text-yellow-400">
              {(result.data.fraud_probability * 100).toFixed(2)}%
            </strong>
            <ProbabilityBar value={result.data.fraud_probability} />
          </div>
        </div>
      )}

      {/* CSV upload */}
      <div className="mt-12">
        <label className="block text-sm text-gray-300 mb-1">
          Upload CSV for Bulk Predictions
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
        />
      </div>

      {/* Upload success alert */}
      {fileLoaded && (
        <div className="mt-4 p-3 bg-green-700 text-green-100 rounded text-sm max-w-md">
          ✅ File loaded successfully!
        </div>
      )}

      {/* Bulk results table + summary + download */}
      {bulkResult.length > 0 && (
        <div className="mt-8 max-w-full">
          <h2 className="text-xl text-blue-400 mb-2">
            Bulk Prediction Results
          </h2>

          <Datatable data={bulkResult} columns={columns} />

          <div className="mt-4 p-3 bg-blue-900 rounded text-blue-200 font-medium max-w-md">
            📊 Detected{' '}
            <span className="font-bold">
              {bulkResult.filter((r) => r.Prediction === 1).length}
            </span>{' '}
            fraudulent and{' '}
            <span className="font-bold">
              {bulkResult.filter((r) => r.Prediction === 0).length}
            </span>{' '}
            legitimate transactions.
          </div>

          <button
            onClick={handleDownloadCSV}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            📥 Download Results as CSV
          </button>
        </div>
      )}
    </div>
  )
}
