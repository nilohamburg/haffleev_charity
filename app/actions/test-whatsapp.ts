"use server"

import { supabase } from "@/lib/supabase"
import { sendTwilioWhatsAppMessageHttp } from "@/lib/twilio-http"
import { sendTwilioWhatsAppMessageSimulation } from "@/lib/twilio-simulation"

export async function sendTestWhatsAppMessage(formData: FormData) {
  try {
    const phoneNumber = formData.get("phoneNumber") as string
    const message = formData.get("message") as string
    const useSimulation = formData.get("useSimulation") === "true"

    if (!phoneNumber || !message) {
      return {
        success: false,
        error: "Telefonnummer und Nachricht sind erforderlich",
      }
    }

    // Protokollieren des Testversuchs in der Datenbank
    const { error: logStartError } = await supabase.from("whatsapp_test_logs").insert({
      phone_number: phoneNumber,
      message: message,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (logStartError) {
      console.error("Fehler beim Protokollieren des Testversuchs:", logStartError)
    }

    // WhatsApp-Nachricht senden
    let result

    if (useSimulation) {
      // Verwenden der Simulations-Implementierung
      result = await sendTwilioWhatsAppMessageSimulation(phoneNumber, message)
    } else {
      // Verwenden der HTTP-Implementierung
      result = await sendTwilioWhatsAppMessageHttp(phoneNumber, message)
    }

    // Ergebnis in der Datenbank aktualisieren
    const { error: logResultError } = await supabase
      .from("whatsapp_test_logs")
      .update({
        status: result.success ? "success" : "error",
        error_message: result.success ? null : result.error,
        message_id: result.success ? result.messageId : null,
        completed_at: new Date().toISOString(),
      })
      .eq("phone_number", phoneNumber)
      .eq("status", "pending")

    if (logResultError) {
      console.error("Fehler beim Aktualisieren des Testergebnisses:", logResultError)
    }

    return result
  } catch (error) {
    console.error("Fehler beim Senden der Test-WhatsApp-Nachricht:", error)
    return {
      success: false,
      error: "Ein unerwarteter Fehler ist aufgetreten",
    }
  }
}

export async function getWhatsAppTestLogs() {
  try {
    const { data, error } = await supabase
      .from("whatsapp_test_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Fehler beim Abrufen der WhatsApp-Testprotokolle:", error)
      return { logs: [], error: "Fehler beim Abrufen der Protokolle" }
    }

    return { logs: data || [], error: null }
  } catch (error) {
    console.error("Fehler beim Abrufen der WhatsApp-Testprotokolle:", error)
    return { logs: [], error: "Ein unerwarteter Fehler ist aufgetreten" }
  }
}
