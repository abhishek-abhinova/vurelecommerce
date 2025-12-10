"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Mail, MailOpen, Reply, CheckCircle, MoreHorizontal, Trash2 } from "lucide-react"
import { getCurrentUser, authAPI, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Contact {
    id: number
    first_name: string
    last_name: string
    email: string
    subject: string
    message: string
    status: "new" | "read" | "replied" | "closed"
    created_at: string
}

const statusConfig = {
    new: { label: "New", icon: Mail, color: "bg-blue-100 text-blue-700" },
    read: { label: "Read", icon: MailOpen, color: "bg-yellow-100 text-yellow-700" },
    replied: { label: "Replied", icon: Reply, color: "bg-green-100 text-green-700" },
    closed: { label: "Closed", icon: CheckCircle, color: "bg-gray-100 text-gray-700" },
}

export default function AdminContacts() {
    const router = useRouter()
    const { toast } = useToast()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")

    useEffect(() => {
        const user = getCurrentUser()
        if (!user || !user.is_admin) {
            router.push("/login")
            return
        }
        fetchContacts()
    }, [router])

    const fetchContacts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/contacts`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            })
            if (!response.ok) throw new Error("Failed to fetch contacts")
            const data = await response.json()
            setContacts(data)
        } catch (error: any) {
            if (error.message?.includes("401") || error.message?.includes("403")) {
                authAPI.logout()
                router.push("/login")
            } else {
                toast({ title: "Error", description: "Failed to load contacts", variant: "destructive" })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (contactId: number, status: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/contacts/${contactId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ status })
            })
            if (!response.ok) throw new Error("Failed to update status")
            toast({ title: "Success", description: "Status updated" })
            fetchContacts()
            if (selectedContact?.id === contactId) {
                setSelectedContact({ ...selectedContact, status: status as any })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        }
    }

    const deleteContact = async (contactId: number) => {
        if (!confirm("Delete this message?")) return
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/contacts/${contactId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            })
            if (!response.ok) throw new Error("Failed to delete")
            toast({ title: "Success", description: "Message deleted" })
            setSelectedContact(null)
            fetchContacts()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
        }
    }

    const filteredContacts = contacts.filter(c => {
        const matchesSearch =
            c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === "all" || c.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const newCount = contacts.filter(c => c.status === "new").length

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Contact Messages</h1>
                    <p className="text-muted-foreground">Manage customer inquiries</p>
                </div>
                {newCount > 0 && (
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        {newCount} new message{newCount > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {Object.entries(statusConfig).map(([key, config]) => {
                    const count = contacts.filter(c => c.status === key).length
                    return (
                        <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                                    <config.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-sm text-muted-foreground">{config.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {filterStatus !== "all" && (
                    <Button variant="outline" onClick={() => setFilterStatus("all")}>
                        Clear Filter
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact List */}
                <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">No messages found</CardContent></Card>
                    ) : (
                        filteredContacts.map((contact) => {
                            const config = statusConfig[contact.status]
                            return (
                                <Card
                                    key={contact.id}
                                    className={`cursor-pointer transition-all ${selectedContact?.id === contact.id ? "ring-2 ring-[#2E5E99]" : "hover:shadow-md"}`}
                                    onClick={() => {
                                        setSelectedContact(contact)
                                        if (contact.status === "new") updateStatus(contact.id, "read")
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${contact.status === "new" ? "text-[#0D2440]" : "text-gray-600"}`}>
                                                    {contact.first_name} {contact.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">{contact.subject}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(contact.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2">
                    {selectedContact ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#0D2440]">{selectedContact.subject}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            From: {selectedContact.first_name} {selectedContact.last_name} &lt;{selectedContact.email}&gt;
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(selectedContact.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Status: {statusConfig[selectedContact.status].label}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {Object.entries(statusConfig).map(([key, config]) => (
                                                    <DropdownMenuItem key={key} onClick={() => updateStatus(selectedContact.id, key)}>
                                                        <config.icon className="w-4 h-4 mr-2" />
                                                        {config.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="ghost" size="icon" onClick={() => deleteContact(selectedContact.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <p className="text-[#0D2440] whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <Button asChild className="bg-[#2E5E99] hover:bg-[#0D2440]">
                                        <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}>
                                            <Reply className="w-4 h-4 mr-2" /> Reply via Email
                                        </a>
                                    </Button>
                                    <Button variant="outline" onClick={() => updateStatus(selectedContact.id, "replied")}>
                                        Mark as Replied
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-16 text-center text-muted-foreground">
                                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>Select a message to view details</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
