"use client";

import React, { useState, useMemo } from "react";
import { format as formatDate } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Search, Filter, Eye, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { koboToNaira } from "@/lib/money";
import { SALON_TIMEZONE } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  created_at: string;
  starts_at: string;
  services: { name: string };
  staff: { name: string };
}

interface Reminder {
  id: string;
  booking_id: string;
  kind: "confirmation" | "24h" | "2h";
  scheduled_for: string;
  status: "pending" | "sent" | "failed" | "skipped";
  sent_at: string | null;
  provider_message_id: string | null;
  attempts: number;
  last_error: string | null;
}

interface DemoConversationsClientProps {
  bookings: Booking[];
  remindersByBooking: Map<string, Reminder[]>;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  sent: { label: "Sent (Simulated)", color: "bg-green-100 text-green-800", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertTriangle },
  skipped: { label: "Skipped", color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
} as const;

const KIND_LABELS = {
  confirmation: "Booking Confirmed",
  "24h": "24h Reminder",
  "2h": "2h Reminder",
} as const;

function formatPhone(phone: string): string {
  return phone.replace(/^\+234/, "0");
}

function formatDateTime(iso: string): string {
  const date = toZonedTime(new Date(iso), SALON_TIMEZONE);
  return formatDate(date, "EEE, MMM d, yyyy 'at' h:mm a");
}

function formatDateOnly(iso: string): string {
  const date = toZonedTime(new Date(iso), SALON_TIMEZONE);
  return formatDate(date, "EEE, MMM d, yyyy");
}

export function DemoConversationsClient({ bookings, remindersByBooking }: DemoConversationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer_phone.includes(searchQuery) ||
        booking.services.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.slice(0, 8).includes(searchQuery.toUpperCase());

      const bookingReminders = remindersByBooking.get(booking.id) || [];
      const matchesStatus =
        statusFilter === "all" ||
        bookingReminders.some((r) => r.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [bookings, remindersByBooking, searchQuery, statusFilter]);

  const allReminders = useMemo(() => {
    const reminders: (Reminder & { booking: Booking })[] = [];
    for (const booking of bookings) {
      const bookingReminders = remindersByBooking.get(booking.id) || [];
      for (const reminder of bookingReminders) {
        reminders.push({ ...reminder, booking });
      }
    }
    return reminders.sort((a, b) => new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime());
  }, [bookings, remindersByBooking]);

  const stats = useMemo(() => {
    let total = 0;
    let sent = 0;
    let pending = 0;
    let failed = 0;
    for (const reminders of remindersByBooking.values()) {
      for (const r of reminders) {
        total++;
        if (r.status === "sent") sent++;
        else if (r.status === "pending") pending++;
        else if (r.status === "failed") failed++;
      }
    }
    return { total, sent, pending, failed };
  }, [remindersByBooking]);

  return (
    <div className="min-h-dvh bg-muted/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Demo Conversations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simulated WhatsApp messages — no real messages sent. Use this to demonstrate the reminder flow to clients.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse" />
              </span>
              Demo Mode
            </Badge>
            <Badge variant="outline">{stats.total} total messages</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{stats.sent} simulated</Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{stats.pending} pending</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{stats.failed} failed</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, service, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent (Simulated)</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>

        {selectedBooking ? (
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {selectedBooking.customer_name} — {selectedBooking.services.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatPhone(selectedBooking.customer_phone)} • {selectedBooking.staff.name} •{" "}
                  {formatDateOnly(selectedBooking.starts_at)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Back to list
              </Button>
            </div>
            <div className="space-y-3">
              {remindersByBooking.get(selectedBooking.id)?.map((reminder) => (
                <div key={reminder.id} className="rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{KIND_LABELS[reminder.kind]}</Badge>
                      <Badge variant="secondary" className={STATUS_CONFIG[reminder.status].color}>
                        {React.createElement(STATUS_CONFIG[reminder.status].icon, { className: "h-3 w-3 mr-1" })}
                        {STATUS_CONFIG[reminder.status].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scheduled: {formatDateTime(reminder.scheduled_for)}
                      {reminder.sent_at && ` • Sent: ${formatDateTime(reminder.sent_at)}`}
                    </div>
                  </div>
                  {reminder.provider_message_id && (
                    <p className="mt-2 text-xs text-muted-foreground font-mono">
                      ID: {reminder.provider_message_id}
                    </p>
                  )}
                  {reminder.last_error && (
                    <p className="mt-2 text-sm text-red-600">Error: {reminder.last_error}</p>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>Attempts: {reminder.attempts}</span>
                    <span>Status: {reminder.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Service / Staff
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Simulated Messages
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        No conversations match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => {
                      const bookingReminders = remindersByBooking.get(booking.id) || [];
                      const lastReminder = bookingReminders[0];
                      const statusConfig = lastReminder ? STATUS_CONFIG[lastReminder.status] : STATUS_CONFIG.pending;

                      return (
                        <tr key={booking.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                          <td className="px-4 py-4">
                            <div className="font-medium text-foreground">{booking.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{formatPhone(booking.customer_phone)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-foreground">{booking.services.name}</div>
                            <div className="text-sm text-muted-foreground">with {booking.staff.name}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-foreground">{formatDateOnly(booking.starts_at)}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(booking.starts_at)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary" className={statusConfig.color}>
                              <statusConfig.icon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {bookingReminders.map((r) => (
                                <Badge key={r.id} variant="outline" className="text-xs">
                                  {KIND_LABELS[r.kind]}
                                </Badge>
                              ))}
                              {bookingReminders.length === 0 && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  No reminders
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <MessageSquare className="h-4 w-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">How Demo Mode Works</h3>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">No Real Messages</h4>
              <p className="text-muted-foreground">
                WHATSAPP_LIVE_MODE=false by default. All WhatsApp messages are simulated — stored in memory with
                <code className="bg-muted px-1 rounded">simulated: true</code> flag and <code className="bg-muted px-1 rounded">fake_</code>-prefixed IDs.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">Safe for Demos</h4>
              <p className="text-muted-foreground">
                No Meta template approval needed. No paid API calls. No real phone numbers contacted. Perfect for
                portfolio demonstrations and client presentations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">Enable Live Mode</h4>
              <p className="text-muted-foreground">
                Set <code className="bg-muted px-1 rounded">WHATSAPP_LIVE_MODE=true</code> and add
                <code className="bg-muted px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> +
                <code className="bg-muted px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> to <code className="bg-muted px-1 rounded">.env.local</code>
                for production use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}