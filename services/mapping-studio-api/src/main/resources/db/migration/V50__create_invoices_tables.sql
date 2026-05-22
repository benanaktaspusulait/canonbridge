-- TASK-009: Invoices and invoice line items for billing.

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    subtotal_cents INT NOT NULL DEFAULT 0,
    tax_cents INT NOT NULL DEFAULT 0,
    total_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    provider_ref VARCHAR(255),
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible'))
);

CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    metric VARCHAR(100),
    qty BIGINT NOT NULL DEFAULT 0,
    unit_price_cents INT NOT NULL DEFAULT 0,
    amount_cents INT NOT NULL DEFAULT 0,
    line_type VARCHAR(30) NOT NULL DEFAULT 'usage',
    CONSTRAINT invoice_line_items_type_check CHECK (line_type IN ('base', 'usage', 'overage', 'addon', 'credit', 'tax'))
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

COMMENT ON TABLE invoices IS 'Monthly invoices generated for each organization.';
COMMENT ON TABLE invoice_line_items IS 'Individual line items on an invoice (base plan, overage, add-ons, credits).';
