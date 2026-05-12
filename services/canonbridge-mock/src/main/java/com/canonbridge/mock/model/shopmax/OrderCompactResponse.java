package com.canonbridge.mock.model.shopmax;

import java.util.List;

public record OrderCompactResponse(
        String oid,
        String buyer,
        String ship_to,
        List<CompactLine> lines,
        Double gross,
        String cur,
        String ts,
        String status
) {
    public record CompactLine(
            String sku,
            int qty,
            Double price
    ) {}
}
