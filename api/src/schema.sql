CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  monthly_amount numeric(10, 2) NOT NULL CHECK (monthly_amount > 0),
  renewal_day smallint NOT NULL CHECK (renewal_day BETWEEN 1 AND 31),
  created_at timestamptz NOT NULL DEFAULT now()
);
