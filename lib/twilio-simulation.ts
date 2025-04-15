// Simulierte Implementierung für Tests
export async function sendTwilioWhatsAppMessageSimulation(to: string, body: string) {
  try {
    console.log(`[SIMULATION] Sende WhatsApp-Nachricht an: ${to}`)
    console.log(`[SIMULATION] Nachrichteninhalt: ${body}`)

    // Simuliere eine erfolgreiche Antwort
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      details: {
        sid: `sim_${Date.now()}`,
        status: "queued",
        to: to,
        body: body,
      },
    }
  } catch (error) {
    console.error("[SIMULATION] Fehler beim Simulieren der WhatsApp-Nachricht:", error)
    return {
      success: false,
      error: `[SIMULATION] Fehler: ${error.message || "Unbekannter Fehler"}`,
    }
  }
}
