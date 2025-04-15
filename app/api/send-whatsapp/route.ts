import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { to, body } = await request.json()

    if (!to || !body) {
      return NextResponse.json(
        { success: false, error: "Telefonnummer und Nachricht sind erforderlich" },
        { status: 400 },
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = "whatsapp:+14155238886" // Twilio-Sandbox-Nummer

    if (!accountSid || !authToken) {
      return NextResponse.json({ success: false, error: "Twilio-Anmeldeinformationen fehlen" }, { status: 500 })
    }

    // Formatieren Sie die Telefonnummer für WhatsApp
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`

    console.log(`Versuche, WhatsApp-Nachricht zu senden an: ${formattedTo}`)
    console.log(`Von: ${fromNumber}`)
    console.log(`Nachrichteninhalt: ${body}`)

    // Erstellen der Authentifizierung
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    // Erstellen der Formular-Daten
    const formData = new URLSearchParams()
    formData.append("To", formattedTo)
    formData.append("From", fromNumber)
    formData.append("Body", body)

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
    const result = await response.json()

    if (!response.ok) {
      console.error("Twilio API-Fehler:", result)
      return NextResponse.json(
        {
          success: false,
          error: `Twilio API-Fehler: ${result.message || JSON.stringify(result)}`,
          code: result.code,
          details: result,
        },
        { status: response.status },
      )
    }

    console.log(`WhatsApp-Nachricht erfolgreich gesendet: ${result.sid}`)

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      details: result,
    })
  } catch (error) {
    console.error("Allgemeiner Fehler beim Senden der WhatsApp-Nachricht:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Allgemeiner Fehler: ${error.message || "Unbekannter Fehler"}`,
      },
      { status: 500 },
    )
  }
}
