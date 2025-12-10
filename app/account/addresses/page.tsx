"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Plus, Trash2, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Address {
    id: string
    name: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    isDefault: boolean
}

export default function AddressesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
        name: "", phone: "", address: "", city: "", state: "", zip: "", country: "India"
    })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) { router.push("/signup"); return }

        // Load addresses from localStorage
        const saved = localStorage.getItem("savedAddresses")
        if (saved) setAddresses(JSON.parse(saved))
    }, [router])

    const saveAddresses = (newAddresses: Address[]) => {
        setAddresses(newAddresses)
        localStorage.setItem("savedAddresses", JSON.stringify(newAddresses))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip) {
            toast({ title: "Error", description: "Please fill all fields", variant: "destructive" })
            return
        }

        if (editingId) {
            // Update existing
            const updated = addresses.map(a =>
                a.id === editingId ? { ...formData, id: editingId, isDefault: a.isDefault } : a
            )
            saveAddresses(updated)
            toast({ title: "Address Updated", description: "Your address has been updated" })
        } else {
            // Add new
            const newAddress: Address = {
                ...formData,
                id: Date.now().toString(),
                isDefault: addresses.length === 0 // First address is default
            }
            saveAddresses([...addresses, newAddress])
            toast({ title: "Address Added", description: "Your new address has been saved" })
        }

        setFormData({ name: "", phone: "", address: "", city: "", state: "", zip: "", country: "India" })
        setShowForm(false)
        setEditingId(null)
    }

    const handleEdit = (address: Address) => {
        setFormData({
            name: address.name, phone: address.phone, address: address.address,
            city: address.city, state: address.state, zip: address.zip, country: address.country
        })
        setEditingId(address.id)
        setShowForm(true)
    }

    const handleDelete = (id: string) => {
        const updated = addresses.filter(a => a.id !== id)
        if (updated.length > 0 && !updated.some(a => a.isDefault)) {
            updated[0].isDefault = true
        }
        saveAddresses(updated)
        toast({ title: "Address Deleted" })
    }

    const setDefaultAddress = (id: string) => {
        const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }))
        saveAddresses(updated)
        toast({ title: "Default Address Updated" })
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-2xl mx-auto">
                        <Link href="/account" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                            <ChevronLeft className="h-4 w-4" /><span>Back to Account</span>
                        </Link>

                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold">My Addresses</h1>
                            {!showForm && (
                                <Button onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Address
                                </Button>
                            )}
                        </div>

                        {/* Address Form */}
                        {showForm && (
                            <div className="bg-card rounded-xl border border-border p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Address" : "Add New Address"}</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Full Name</Label>
                                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="House no, Street, Area" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>City</Label>
                                            <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" />
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="Maharashtra" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>PIN Code</Label>
                                            <Input value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} placeholder="400001" />
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="India" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit">{editingId ? "Update" : "Save"} Address</Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Address List */}
                        {addresses.length === 0 && !showForm ? (
                            <div className="text-center py-12 bg-card rounded-xl border border-border">
                                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">No addresses saved yet</p>
                                <Button onClick={() => setShowForm(true)}>Add Your First Address</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map(address => (
                                    <div key={address.id} className={`bg-card rounded-xl border-2 p-5 relative ${address.isDefault ? 'border-primary' : 'border-border'}`}>
                                        {address.isDefault && (
                                            <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Default</span>
                                        )}
                                        <p className="font-semibold">{address.name}</p>
                                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                                        <p className="text-sm mt-2">{address.address}</p>
                                        <p className="text-sm">{address.city}, {address.state} {address.zip}</p>
                                        <p className="text-sm text-muted-foreground">{address.country}</p>

                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(address)}>Edit</Button>
                                            {!address.isDefault && (
                                                <Button size="sm" variant="outline" onClick={() => setDefaultAddress(address.id)}>
                                                    <Check className="h-3 w-3 mr-1" /> Set Default
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(address.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
