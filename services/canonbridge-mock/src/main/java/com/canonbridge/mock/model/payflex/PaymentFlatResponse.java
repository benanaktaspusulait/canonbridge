package com.canonbridge.mock.model.payflex;

public record PaymentFlatResponse(
        String pay_id,
        Double amt,
        String ccy,
        String src_iban,
        String dst_iban,
        String merchant_ref,
        String created_ts,
        String risk_lvl,
        String status,
        String payer_name,
        String beneficiary_name,
        String settlement_date,
        String correlation_id
) {}
