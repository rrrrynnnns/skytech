BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Installation" WHERE id = 'INS-001')
    AND EXISTS (SELECT 1 FROM "Installation" WHERE id = '1000001') THEN
    RAISE EXCEPTION 'Both legacy and new installation IDs already exist';
  END IF;
END $$;

UPDATE "Installation" SET id = '1000001' WHERE id = 'INS-001';
UPDATE "Installation" SET id = '1000002' WHERE id = 'INS-002';
UPDATE "Installation" SET id = '1000003' WHERE id = 'INS-003';
UPDATE "Installation" SET id = '1000004' WHERE id = 'INS-004';
UPDATE "Installation" SET id = '1000005' WHERE id = 'INS-005';
UPDATE "Installation" SET id = '1000006' WHERE id = 'INS-006';
UPDATE "Installation" SET id = '1000007' WHERE id = 'INS-007';
UPDATE "Installation" SET id = '1000008' WHERE id = 'INS-008';
UPDATE "Installation" SET id = '1000009' WHERE id = 'INS-009';

COMMIT;
