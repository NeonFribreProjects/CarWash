-- AddVehicleColumns
ALTER TABLE "Service" ADD COLUMN "vehicleType" TEXT;
ALTER TABLE "Booking" ADD COLUMN "vehicleMake" TEXT;
ALTER TABLE "Booking" ADD COLUMN "vehicleModel" TEXT;
ALTER TABLE "Booking" ADD COLUMN "vehicleColor" TEXT;
ALTER TABLE "Booking" ADD COLUMN "licensePlate" TEXT;
