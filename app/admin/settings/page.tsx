"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, CreditCard, Banknote, Truck, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { getCurrentUser, authAPI, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface PaymentSettings {
  cod_enabled: boolean
  online_enabled: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cod_enabled: true,
    online_enabled: true
  })
  const [shippingSettings, setShippingSettings] = useState({
    free_delivery_minimum: 800,
    delivery_charge: 85
  })
  const [whatsappSettings, setWhatsappSettings] = useState({
    whatsapp_number: '',
    whatsapp_message: 'Hi! I am interested in your products.'
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !user.is_admin) { router.push("/login"); return }
    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/payment`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data)
      }
      // Fetch shipping settings
      const shippingRes = await fetch(`${API_BASE_URL}/api/settings/shipping`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (shippingRes.ok) {
        const shippingData = await shippingRes.json()
        setShippingSettings(shippingData)
      }
      // Fetch WhatsApp settings
      const whatsappRes = await fetch(`${API_BASE_URL}/api/settings/whatsapp`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      if (whatsappRes.ok) {
        const whatsappData = await whatsappRes.json()
        setWhatsappSettings(whatsappData)
      }
    } catch (error: any) {
      if (error.message?.includes("401")) { authAPI.logout(); router.push("/login") }
    } finally { setIsLoading(false) }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(paymentSettings)
      })
      if (!response.ok) throw new Error('Failed to save payment settings')

      // Save shipping settings
      const shippingRes = await fetch(`${API_BASE_URL}/api/admin/settings/shipping`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(shippingSettings)
      })
      if (!shippingRes.ok) throw new Error('Failed to save shipping settings')

      // Save WhatsApp settings
      const whatsappRes = await fetch(`${API_BASE_URL}/api/admin/settings/whatsapp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(whatsappSettings)
      })
      if (!whatsappRes.ok) throw new Error('Failed to save WhatsApp settings')

      toast({ title: "Success", description: "All settings saved successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings", variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><p>Loading...</p></div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage site-wide settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Methods</CardTitle>
          <CardDescription>Enable or disable payment options for the entire website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* COD Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Cash on Delivery (COD)</h4>
                <p className="text-sm text-muted-foreground">Allow customers to pay when they receive their order</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${paymentSettings.cod_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                {paymentSettings.cod_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={paymentSettings.cod_enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, cod_enabled: checked }))}
              />
            </div>
          </div>

          {/* Online Payment Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Online Payment (Razorpay)</h4>
                <p className="text-sm text-muted-foreground">Allow customers to pay online via UPI, cards, or net banking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${paymentSettings.online_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                {paymentSettings.online_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={paymentSettings.online_enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, online_enabled: checked }))}
              />
            </div>
          </div>

          {/* Warning if both disabled */}
          {!paymentSettings.cod_enabled && !paymentSettings.online_enabled && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">⚠️ Warning: Both payment methods are disabled. Customers will not be able to place orders.</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping Settings</CardTitle>
          <CardDescription>Configure delivery charges based on order value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium block mb-2">Free Delivery Minimum (₹)</label>
              <Input
                type="number"
                value={shippingSettings.free_delivery_minimum}
                onChange={(e) => setShippingSettings(prev => ({ ...prev, free_delivery_minimum: parseInt(e.target.value) || 0 }))}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Orders above this amount get free delivery</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium block mb-2">Delivery Charge (₹)</label>
              <Input
                type="number"
                value={shippingSettings.delivery_charge}
                onChange={(e) => setShippingSettings(prev => ({ ...prev, delivery_charge: parseInt(e.target.value) || 0 }))}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Charge for orders below minimum</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current Policy:</strong> Free delivery for orders ₹{shippingSettings.free_delivery_minimum}+ |
              ₹{shippingSettings.delivery_charge} charge for orders below ₹{shippingSettings.free_delivery_minimum}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save All Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Settings Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp Settings</CardTitle>
          <CardDescription>Configure WhatsApp chat button</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium block mb-2">WhatsApp Number (with country code)</label>
              <Input
                type="text"
                placeholder="919876543210"
                value={whatsappSettings.whatsapp_number}
                onChange={(e) => setWhatsappSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-2">Enter number without + or spaces (e.g., 919876543210)</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium block mb-2">Default Message</label>
              <Input
                type="text"
                value={whatsappSettings.whatsapp_message}
                onChange={(e) => setWhatsappSettings(prev => ({ ...prev, whatsapp_message: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-2">Pre-filled message when user clicks WhatsApp</p>
            </div>
          </div>

          {!whatsappSettings.whatsapp_number && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">⚠️ WhatsApp button will not show until you add a phone number.</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save All Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
