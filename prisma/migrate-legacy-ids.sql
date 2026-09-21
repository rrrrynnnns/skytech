BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Subscriber" WHERE id = 'SKY-001')
    AND EXISTS (SELECT 1 FROM "Subscriber" WHERE id = '100000001') THEN
    RAISE EXCEPTION 'Both legacy and new subscriber IDs already exist';
  END IF;
END $$;

SET LOCAL session_replication_role = replica;

UPDATE "User" SET "subscriberId" = '100000001' WHERE "subscriberId" = 'SKY-001';
UPDATE "Bill" SET "subscriberId" = '100000001' WHERE "subscriberId" = 'SKY-001';
UPDATE "Ticket" SET "subscriberId" = '100000001' WHERE "subscriberId" = 'SKY-001';
UPDATE "Booking" SET "subscriberId" = '100000001' WHERE "subscriberId" = 'SKY-001';
UPDATE "Installation" SET "subscriberId" = '100000001' WHERE "subscriberId" = 'SKY-001';
UPDATE "Subscriber" SET id = '100000001' WHERE id = 'SKY-001';

UPDATE "User" SET "technicianId" = '100002' WHERE "technicianId" = 'EMP-001';
UPDATE "Installation" SET "technicianId" = '100002' WHERE "technicianId" = 'EMP-001';
UPDATE "Technician" SET id = '100002' WHERE id = 'EMP-001';

COMMIT;
