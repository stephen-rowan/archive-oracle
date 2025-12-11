-- Generated seed data
-- TRUNCATE statements (commented out by default)
-- Uncomment to clear existing data before inserting:
-- TRUNCATE TABLE meetingsummaries CASCADE;
-- TRUNCATE TABLE workgroups CASCADE;
-- TRUNCATE TABLE names CASCADE;
-- TRUNCATE TABLE tags CASCADE;

INSERT INTO workgroups (workgroup_id, workgroup, created_at, user_id, preferred_template)
VALUES ('72ce0bc0-276e-4cde-bfb9-cdabc5ed953e', 'Test Workgroup', '2025-01-27 00:00:00', 'e0a892f1-a562-ae29-b9e2-b2e77167fb75', NULL);

INSERT INTO workgroups (workgroup_id, workgroup, created_at, user_id, preferred_template)
VALUES ('ba4753aa-07ec-77e0-8520-b47e6384573d', 'Another Workgroup', '2025-01-28 00:00:00', '315be6f9-bb8f-9ec0-9614-7cc11aa1f29c', NULL);

INSERT INTO meetingsummaries (meeting_id, name, date, workgroup_id, user_id, template, summary, confirmed, created_at, updated_at)
VALUES ('46ce0517-8370-18ce-9f13-2f89c3b62aa1', 'Test Meeting', '2025-01-27 00:00:00', '72ce0bc0-276e-4cde-bfb9-cdabc5ed953e', 'e0a892f1-a562-ae29-b9e2-b2e77167fb75', 'custom', '{"workgroup":"Test Workgroup","workgroup_id":"72ce0bc0-276e-4cde-bfb9-cdabc5ed953e","meetingInfo":{"name":"Test Meeting","date":"2025-01-27","host":"Alice","documenter":"Bob","peoplePresent":"Alice, Bob, Carol"},"agendaItems":[],"tags":{"topicsCovered":"testing, development","emotions":"focused, productive"},"type":"custom"}', false, '2025-01-27 00:00:00', '2025-01-27 00:00:00');

INSERT INTO meetingsummaries (meeting_id, name, date, workgroup_id, user_id, template, summary, confirmed, created_at, updated_at)
VALUES ('04985923-3981-885f-26b6-610e2a790bf9', 'Second Meeting', '2025-01-28 00:00:00', 'ba4753aa-07ec-77e0-8520-b47e6384573d', '315be6f9-bb8f-9ec0-9614-7cc11aa1f29c', 'custom', '{"workgroup":"Another Workgroup","meetingInfo":{"name":"Second Meeting","date":"2025-01-28","peoplePresent":"Dave, Eve"},"agendaItems":[],"tags":{"gamesPlayed":"Chess"},"type":"custom"}', false, '2025-01-28 00:00:00', '2025-01-28 00:00:00');

INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Alice', '70b76478-3657-ecbf-df40-500b7d8784b1', true, '2025-01-27 00:00:00');

INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Bob', '7e96301c-4252-e91a-ba2f-e3b14a346937', true, '2025-01-27 00:00:00');

INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Carol', '0889c36f-499f-c29f-f011-71ade1023b58', true, '2025-01-27 00:00:00');

INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Dave', '024f1924-5d39-d63a-0536-6c0e93eb0e01', true, '2025-01-28 00:00:00');

INSERT INTO names (name, user_id, approved, created_at)
VALUES ('Eve', 'c4215fc9-ba2b-97cb-bdcb-9a0fe5dda9e7', true, '2025-01-28 00:00:00');

INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('testing', 'topicsCovered', 'cf1325f5-96e1-903d-3505-8400d21bae2b', '2025-01-27 00:00:00');

INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('development', 'topicsCovered', '694d18c6-ac7c-3e51-9dc9-0b59c1f65d25', '2025-01-27 00:00:00');

INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('focused', 'emotions', 'b9908290-a747-4b92-0d6e-be65c50e8640', '2025-01-27 00:00:00');

INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('productive', 'emotions', '71637a8e-c8b8-c480-d386-de71b65ba80a', '2025-01-27 00:00:00');

INSERT INTO tags (tag, type, user_id, created_at)
VALUES ('Chess', 'gamesPlayed', 'b5a9fd0a-f8c0-83c0-7ef1-e5f90b1babc7', '2025-01-28 00:00:00');

