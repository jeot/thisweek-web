-- 1. Create Enum Types
create type item_type as enum (
  'todo', 'note', 'event', 'habit', 'journal', 'reminder'
);

create type item_status as enum (
  'undone', 'done', 'pending', 'blocked', 'canceled', 'delegated', 'snoozed', 'inprogress'
);

create type item_category as enum (
  'daily', 'weekly', 'monthly', 'yearly', 'project', 'personal', 'work', 'goal', 'life'
);

create type item_due_type as enum (
  'allday', 'fixed', 'range', 'floating'
);
