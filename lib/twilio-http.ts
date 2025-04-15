// Alternative Implementierung, die die Twilio-API direkt über HTTP aufruft
export async function sendTwilioWhatsAppMessageHttp(to: string, body: string) {
  try {
    // Verwenden der bereitgestellten Anmeldeinformationen
    const accountSid = "AC4905f0e3001d0105849733d417929575"
    const authToken = "c62b194775aa64e301f83351e44305d8"

    // Verwenden der KORREKTEN Sandbox-Nummer
    const fromNumber = "whatsapp:+14155238886"

    // Formatieren Sie die Telefonnummer für WhatsApp
    // Stellen Sie sicher, dass die Nummer im internationalen Format ist und mit whatsapp: beginnt
    let formattedTo = to
    if (!formattedTo.startsWith("+")) {
      // Fügen Sie das Plus-Zeichen hinzu, wenn es fehlt
      formattedTo = `+${formattedTo.replace(/^0/, "")}`
    }

    // Fügen Sie das whatsapp: Präfix hinzu, wenn es fehlt
    if (!formattedTo.startsWith("whatsapp:")) {
      formattedTo = `whatsapp:${formattedTo}`
    }

    console.log(`Versuche, WhatsApp-Nachricht über HTTP zu senden:`)
    console.log(`Von: ${fromNumber}`)
    console.log(`An: ${formattedTo}`)
    console.log(`Nachrichteninhalt: ${body}`)
    console.log(`Account SID: ${accountSid.substring(0, 5)}...`)

    // Erstellen der Authentifizierung
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    // Erstellen der Formular-Daten
    const formData = new URLSearchParams()
    formData.append("To", formattedTo)
    formData.append("From", fromNumber)
    formData.append("Body", body)

    console.log("Formular-Daten:", formData.toString())

    // Senden der Anfrage an die Twilio-API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    // Verarbeiten der Antwort
    const responseText = await response.text()
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("Fehler beim Parsen der Twilio-Antwort:", responseText)
      return {
        success: false,
        error: `Fehler beim Parsen der Twilio-Antwort: ${responseText}`,
      }
    }

    if (!response.ok) {
      console.error("Twilio API-Fehler:", result)
      return {
        success: false,
        error: `Twilio API-Fehler: ${result.message || JSON.stringify(result)}`,
        code: result.code,
        details: result,
      }
    }

    console.log(`WhatsApp-Nachricht erfolgreich gesendet: ${result.sid}`)

    return {
      success: true,
      messageId: result.sid,
      details: result,
    }
  } catch (error) {
    console.error("Allgemeiner Fehler beim Senden der WhatsApp-Nachricht über HTTP:", error)
    return {
      success: false,
      error: `Allgemeiner Fehler: ${error.message || "Unbekannter Fehler"}`,
    }
  }
}
