import { useRef, useState } from 'react'
import { CanchasService } from '@/services'
import type { ChatMensaje } from '@/types'

const SALUDO_INICIAL: ChatMensaje =
{
  rol: 'bot',
  texto:
    '¡Hola! Contame qué tipo de cancha buscás (5, 7 u 11), alguna zona o si la querés techada, y te ayudo a encontrarla cerca tuyo.',
}

interface Coords {
  lat: number
  lng: number
}

export function useChatCanchas() {
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([SALUDO_INICIAL])
  const [enviando, setEnviando] = useState(false)
  const coordsRef = useRef<Coords | null>(null)

  function obtenerUbicacion(): Promise<Coords> {
    if (coordsRef.current) return Promise.resolve(coordsRef.current)
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización.'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          coordsRef.current = { lat: coords.latitude, lng: coords.longitude }
          resolve(coordsRef.current)
        },
        (err) => {
          reject(
            new Error(
              err.code === err.PERMISSION_DENIED
                ? 'Necesito tu ubicación para buscar canchas cerca tuyo. Dale permiso desde el navegador e intentá de nuevo.'
                : 'No pude obtener tu ubicación. Probá de nuevo en un momento.',
            ),
          )
        },
        { enableHighAccuracy: false, timeout: 10000 },
      )
    })
  }

  async function enviar(texto: string) {
    const limpio = texto.trim()
    if (!limpio || enviando) return

    const historial = mensajes.slice(-6).map(({ rol, texto }) => ({ rol, texto }))
    setMensajes((m) => [...m, { rol: 'usuario', texto: limpio }])
    setEnviando(true)
    try {
      const { lat, lng } = await obtenerUbicacion()
      const data = await CanchasService.chat(lat, lng, limpio, historial)
      setMensajes((m) => [...m, { rol: 'bot', texto: data.respuesta, canchas: data.canchas }])
    } catch (err) {
      setMensajes((m) => [...m, { rol: 'bot', texto: (err as Error).message || 'Uy, algo salió mal. Probá de nuevo.' }])
    } finally {
      setEnviando(false)
    }
  }

  return { mensajes, enviando, enviar }
}
