// Hilfsfunktion zum Senden einer WhatsApp-Nachricht über die API-Route
export async function sendTwilioWhatsAppMessageApi(to: string, body: string) {
  try {
    console.log(`Versuche, WhatsApp-Nachricht über API-Route zu senden an: ${to}`)
    console.log(`Nachrichteninhalt: ${body}`)

    const response = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, body }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("API-Fehler:", result)
      return {
        success: false,
        error: result.error || "Unbekannter API-Fehler",
        details: result,
      }
    }

    console.log(`WhatsApp-Nachricht erfolgreich gesendet: ${result.messageId}`)

    return {
      success: true,
      messageId: result.messageId,
      details: result.details,
    }
  } catch (error) {
    console.error("Allgemeiner Fehler beim Senden der WhatsApp-Nachricht über API:", error)
    return {
      success: false,
      error: `Allgemeiner Fehler: ${error.message || "Unbekannter Fehler"}`,
    }
  }
}
