import { useEffect, useRef, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export default function App() {
  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const selectFile = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith('image/')) {
      setError('Selecciona una imagen válida.')
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('La imagen supera el límite de 10 MB.')
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  const classify = async () => {
    if (!file) {
      setError('Primero toma una foto o selecciona una imagen.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo clasificar la imagen.')
      }

      setResult(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'No se pudo conectar con el servidor. Intenta nuevamente en unos momentos.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setFile(null)
    setPreview('')
    setResult(null)
    setError('')
    if (cameraInput.current) cameraInput.current.value = ''
    if (galleryInput.current) galleryInput.current.value = ''
  }

  return (
    <main className="page">
      <section className="card">
        <header>
          <p className="eyebrow">Inteligencia Artificial</p>
          <h1>Clasificador de mouse</h1>
          <p className="subtitle">
            Toma una foto con la cámara del celular o selecciona una imagen para identificar si aparece un mouse de computadora.
          </p>
        </header>

        <div className="actions">
          <button className="primary" disabled={loading} onClick={() => cameraInput.current?.click()}>
            Tomar foto
          </button>

          <button className="secondary" disabled={loading} onClick={() => galleryInput.current?.click()}>
            Subir foto
          </button>
        </div>

        <input
          ref={cameraInput}
          className="hidden-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={selectFile}
        />

        <input
          ref={galleryInput}
          className="hidden-input"
          type="file"
          accept="image/*"
          onChange={selectFile}
        />

        <div className="preview-box">
          {preview ? (
            <img src={preview} alt="Vista previa de la imagen" />
          ) : (
            <div className="placeholder">
              <span>No hay una imagen seleccionada</span>
            </div>
          )}
        </div>

        {file && <p className="filename">{file.name}</p>}

        <button
          className="classify"
          onClick={classify}
          disabled={!file || loading}
        >
          {loading ? 'Clasificando...' : 'Identificar mouse'}
        </button>

        {error && <div className="error">{error}</div>}

        {result && (
          <section className="result">
            <p className="result-label">Resultado</p>
            <h2>{result.clase}</h2>
            <p className="confidence">Confianza: {Number(result.confianza).toFixed(2)}%</p>

            <div className="probabilities">
              <div>
                <span>Mouse</span>
                <strong>{Number(result.probabilidad_mouse).toFixed(2)}%</strong>
              </div>
              <div>
                <span>No es mouse</span>
                <strong>{Number(result.probabilidad_no_mouse).toFixed(2)}%</strong>
              </div>
            </div>
          </section>
        )}

        {(file || result) && (
          <button className="clear" disabled={loading} onClick={clear}>
            Probar otra imagen
          </button>
        )}
      </section>
    </main>
  )
}
