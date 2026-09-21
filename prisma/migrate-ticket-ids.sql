BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Ticket" WHERE id = 'TICKET-1')
    AND EXISTS (SELECT 1 FROM "Ticket" WHERE id = '10000001') THEN
    RAISE EXCEPTION 'Both legacy and new ticket IDs already exist';
  END IF;
END $$;

UPDATE "Ticket" SET id = '10000001' WHERE id = 'TICKET-1';
UPDATE "Ticket" SET id = '10000002' WHERE id = 'TICKET-2';
UPDATE "Ticket" SET id = '10000003' WHERE id = 'TICKET-3';
UPDATE "Ticket" SET id = '10000004' WHERE id = 'TICKET-4';
UPDATE "Ticket" SET id = '10000005' WHERE id = 'TICKET-5';

COMMIT;
