-- Required for one portfolio per account and one holding per symbol.
-- This migration deliberately stops if duplicate data exists, rather than
-- silently deleting a user's transactions. Resolve the reported duplicates,
-- then rerun it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.portfolios GROUP BY user_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add portfolios(user_id) uniqueness: duplicate user_id rows exist';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.holdings GROUP BY portfolio_id, symbol HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add holdings(portfolio_id, symbol) uniqueness: duplicate rows exist';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'portfolios_user_id_key'
  ) THEN
    ALTER TABLE public.portfolios
      ADD CONSTRAINT portfolios_user_id_key UNIQUE (user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'holdings_portfolio_id_symbol_key'
  ) THEN
    ALTER TABLE public.holdings
      ADD CONSTRAINT holdings_portfolio_id_symbol_key UNIQUE (portfolio_id, symbol);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS transactions_portfolio_id_created_at_idx
  ON public.transactions (portfolio_id, created_at DESC);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own portfolios" ON public.portfolios;
CREATE POLICY "Users manage own portfolios" ON public.portfolios
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users manage own holdings" ON public.holdings;
CREATE POLICY "Users manage own holdings" ON public.holdings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users manage own transactions" ON public.transactions;
CREATE POLICY "Users manage own transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
    )
  );
