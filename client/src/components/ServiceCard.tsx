import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/types/booking';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatDurationCompact = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const serviceDetails = service.description?.split('\n') || [];

  return (
    <Link to={`/booking/${service.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
              <div className="text-sm text-gray-500 mt-1">
                Duration: {formatDurationCompact(service.duration)}
              </div>
            </div>
            
            <div className="space-y-2">
              {serviceDetails.map((detail, index) => (
                <div key={index} className="flex items-start text-sm">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-600">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-gray-50 px-6 py-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">${service.price}</span>
            {service.discount && (
              <div className="text-sm text-gray-500 mt-1">{service.discount}</div>
            )}
          </div>
          <Badge className="bg-blue-500 hover:bg-blue-600">
            Book Now
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
} 