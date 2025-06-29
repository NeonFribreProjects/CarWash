import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  User as UserIcon, 
  Mail as MailIcon, 
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Check as CheckIcon,
  X as XIcon,
  RefreshCw
} from "lucide-react";
import { format, parse } from "date-fns";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import type { Booking } from '../../types/booking';

const CATEGORIES = ['Car Wash Packages', 'Detailing Services', 'Premium Services'];

const AdminDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('Car Wash Packages');
  const queryClient = useQueryClient();
  
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.getBookings()
  });

  // Filter bookings by category first
  const categoryBookings = bookings.filter(booking => 
    booking.service?.category?.name === selectedCategory
  );

  const today = new Date().toISOString().split('T')[0];

  const getFormattedBooking = (booking: Booking): FormattedBooking => {
    let dateLabel = 'N/A';
    let startTime = '--:--';
    let endTime = '--:--';
    let date: string | null = null;

    if (booking.appointmentStart && booking.appointmentEnd) {
      const startDate = booking.appointmentStart;
      const endDate = booking.appointmentEnd;

      dateLabel = format(startDate, 'MMM dd, yyyy');
      startTime = format(startDate, 'HH:mm');
      endTime = format(endDate, 'HH:mm');
      date = format(startDate, 'yyyy-MM-dd');
    }

    return {
      ...booking,
      dateLabel,
      startTime,
      endTime,
      date
    };
  };

  // Before filtering, format all bookings
  const formattedBookings = categoryBookings.map(booking => getFormattedBooking(booking));

  // Update the filtering logic to use formatted bookings
  const confirmedBookings = formattedBookings.filter(b => b.status === 'confirmed');
  const todayBookings = confirmedBookings.filter(b => {
    return b.date === today;
  });
  const upcomingBookings = confirmedBookings.filter(b => {
    return b.date && b.date > today;
  });
  const pendingBookings = formattedBookings.filter(b => b.status === 'pending');
  const cancelledBookings = formattedBookings.filter(b => b.status === 'cancelled');
  
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      return;
    }

    try {
      await api.updateBookingStatus(bookingId, newStatus);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: `Booking ${newStatus}`,
        description: `The booking has been ${newStatus} successfully.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${newStatus} booking`
      });
    }
  };

  interface FormattedBooking extends Booking {
    dateLabel: string;
    startTime: string;
    endTime: string;
    date: string | null;
  }

  const renderBooking = (booking: FormattedBooking) => (
    <Card key={booking.id} className="mb-4 hover:shadow-lg transition-all">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="space-y-3 w-full sm:w-auto">
            {/* Service Info */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{booking.service.name}</h3>
              <Badge 
                variant={
                  booking.status === 'confirmed' ? 'secondary' :
                  booking.status === 'pending' ? 'outline' : 'destructive'
                }
              >
                {booking.status}
              </Badge>
            </div>
            
            {/* Customer Info */}
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                <span className="break-all">{booking.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>{booking.customerPhone}</span>
              </div>
            </div>
            
            {/* Time Info */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{booking.dateLabel}</span>
              <ClockIcon className="w-4 h-4 ml-0 sm:ml-2" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            {booking.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none sm:w-28 bg-green-50 text-green-600 hover:bg-green-100"
                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            )}
            {booking.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none sm:w-28 bg-red-50 text-red-600 hover:bg-red-100"
                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
              >
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const tabs = ['Bookings', 'Availability'] as const;
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Bookings');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Last updated: {format(new Date(), 'HH:mm')}
            </span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof tabs[number])}>
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Bookings">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Tabs defaultValue="Car Wash Packages" onValueChange={setSelectedCategory}>
                {/* Mobile Category Selector */}
                <div className="block sm:hidden mb-6">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop Category Tabs */}
                <div className="hidden sm:block">
                  <TabsList className="mb-6 bg-gray-100/80 p-1">
                    {CATEGORIES.map(category => (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        className="px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {CATEGORIES.map(category => (
                  <TabsContent key={category} value={category}>
                    <div className="space-y-6">
                      <Tabs defaultValue="today" className="w-full">
                        <TabsList className="w-full justify-start bg-transparent border-b overflow-x-auto scrollbar-hide whitespace-nowrap">
                          <TabsTrigger 
                            value="today"
                            className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-600"
                          >
                            Today ({todayBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="upcoming">
                            Upcoming ({upcomingBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="pending">
                            Pending ({pendingBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="cancelled">
                            Cancelled ({cancelledBookings.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="today" className="pt-6">
                          {todayBookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              No bookings for today
                            </div>
                          ) : (
                            todayBookings.map(booking => {
                              const formattedBooking = getFormattedBooking(booking);
                              return renderBooking(formattedBooking);
                            })
                          )}
                        </TabsContent>
                        <TabsContent value="upcoming">
                          {upcomingBookings.map(booking => {
                            const formattedBooking = getFormattedBooking(booking);
                            return renderBooking(formattedBooking);
                          })}
                        </TabsContent>
                        <TabsContent value="pending">
                          {pendingBookings.map(booking => {
                            const formattedBooking = getFormattedBooking(booking);
                            return renderBooking(formattedBooking);
                          })}
                        </TabsContent>
                        <TabsContent value="cancelled">
                          {cancelledBookings.map(booking => {
                            const formattedBooking = getFormattedBooking(booking);
                            return renderBooking(formattedBooking);
                          })}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="Availability">
            <AvailabilityManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
