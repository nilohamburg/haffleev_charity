"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { sendTestWhatsAppMessage, getWhatsAppTestLogs } from "@/app/actions/test-whatsapp"
import { Checkbox } from "@/components/ui/checkbox"

export default function WhatsAppTestPage() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("+4917636387395") // Vorausgefüllte verifizierte Nummer
  const [message, setMessage] = useState("Dies ist eine Testnachricht vom HAFFleev Festival!")
  const [useSimulation, setUseSimulation] = useState(false) // Standardmäßig keine Simulation verwenden
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Protokolle beim Laden der Seite abrufen
  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    setLogsLoading(true)
    const result = await getWhatsAppTestLogs()
    setLogsLoading(false)
    if (result.error) {
      toast({
        title: "Fehler beim Abrufen der Protokolle",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setLogs(result.logs)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("phoneNumber", phoneNumber)
    formData.append("message", message)
    formData.append("useSimulation", useSimulation.toString())

    const result = await sendTestWhatsAppMessage(formData)
    setLoading(false)

    if (result.success) {
      toast({
        title: "Nachricht gesendet!",
        description: `Die Nachricht wurde erfolgreich an ${phoneNumber} gesendet.`,
      })
    } else {
      toast({
        title: "Fehler beim Senden der Nachricht",
        description: result.error || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      })
    }

    // Protokolle aktualisieren
    fetchLogs()
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>WhatsApp-Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Telefonnummer (mit Ländervorwahl)
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+49123456789"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Hinweis: Die Nummer muss für WhatsApp verifiziert sein.</p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Nachricht
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ihre Testnachricht"
                required
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="useSimulation" checked={useSimulation} onCheckedChange={setUseSimulation} />
              <label
                htmlFor="useSimulation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Simulation verwenden (keine echte Nachricht senden)
              </label>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Wird gesendet..." : "Nachricht senden"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testprotokolle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Zeitpunkt</th>
                  <th className="border p-2 text-left">Telefonnummer</th>
                  <th className="border p-2 text-left">Nachricht</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Fehler</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr>
                    <td colSpan={5} className="border p-2 text-center">
                      Protokolle werden geladen...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border p-2 text-center">
                      Keine Testprotokolle vorhanden
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="border p-2">{new Date(log.created_at).toLocaleString("de-DE")}</td>
                      <td className="border p-2">{log.phone_number}</td>
                      <td className="border p-2">{log.message}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.status === "success"
                              ? "bg-green-100 text-green-800"
                              : log.status === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {log.status === "success" ? "Erfolgreich" : log.status === "error" ? "Fehler" : "Ausstehend"}
                        </span>
                      </td>
                      <td className="border p-2">{log.error_message || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button onClick={fetchLogs} variant="outline" disabled={logsLoading}>
              {logsLoading ? "Wird aktualisiert..." : "Protokolle aktualisieren"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Twilio WhatsApp Sandbox-Konfiguration</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="mb-2">
            <strong>Sandbox-Nummer:</strong> +1 415 523 8886
          </p>
          <p className="mb-2">
            <strong>Einladungscode:</strong> join someone-it
          </p>
          <p>
            Ihre Nummer (+4917636387395) ist bereits als Teilnehmer verifiziert. Sie können sofort Nachrichten senden
            und empfangen.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Fehlerbehebung</h3>
        <p className="mb-2">
          Wenn Sie weiterhin Probleme beim Senden von WhatsApp-Nachrichten haben, überprüfen Sie Folgendes:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-yellow-700">
          <li>
            Stellen Sie sicher, dass die Empfängernummer für WhatsApp aktiviert ist und im internationalen Format
            angegeben wird (z.B. +4917636387395).
          </li>
          <li>
            Das 24-Stunden-Fenster: Nach dem ersten Kontakt haben Sie 24 Stunden Zeit, um Nachrichten zu senden. Danach
            müssen Sie eine von Twilio genehmigte Nachrichtenvorlage verwenden oder erneut "join someone-it" senden.
          </li>
          <li>
            Wenn Sie die Simulation verwenden, werden keine echten Nachrichten gesendet, aber die Funktionalität der
            Anwendung kann getestet werden.
          </li>
        </ul>
      </div>

      <Toaster />
    </div>
  )
}
