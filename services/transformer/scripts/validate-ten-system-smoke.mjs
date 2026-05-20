import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonata from 'jsonata';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = path.join(rootDir, 'fixtures/ten-system-smoke.json');

const expressions = {
  'payflex-payment': `{
    "transactionId": transactionId,
    "merchantId": merchantId,
    "amount": amount,
    "currency": currency,
    "status": status,
    "paymentMethod": paymentMethod,
    "cardLast4": cardLast4,
    "cardBrand": cardBrand,
    "customerEmail": customerEmail,
    "customerName": customerName,
    "billingAddress": billingAddress,
    "metadata": metadata,
    "timestamp": timestamp
  }`,
  'shopmax-order': `{
    "eventId": eventId,
    "orderId": orderId,
    "customerId": customerId,
    "customerEmail": customerEmail,
    "items": items,
    "subtotal": subtotal,
    "taxTotal": taxTotal,
    "shippingCost": shippingCost,
    "totalAmount": totalAmount,
    "currency": currency,
    "paymentMethod": paymentMethod,
    "paymentStatus": paymentStatus,
    "shippingAddress": shippingAddress,
    "billingAddress": billingAddress,
    "shippingMethod": shippingMethod,
    "estimatedDelivery": estimatedDelivery,
    "timestamp": timestamp
  }`,
  'fastcargo-shipment': `{
    "trackingNumber": trackingNumber,
    "status": status,
    "currentLocation": currentLocation,
    "estimatedDelivery": estimatedDelivery,
    "weight": weight,
    "weightUnit": weightUnit,
    "deliveryDetails": deliveryDetails,
    "history": history
  }`,
  'profilehub-customer': `{
    "customerId": data.customer.id,
    "name": data.customer.name,
    "email": data.customer.email,
    "tier": data.customer.tier,
    "marketingOptIn": data.customer.marketingOptIn,
    "updatedAt": data.customer.updatedAt
  }`,
  'customergateway-profile': `{
    "customerId": customerId,
    "name": displayName,
    "email": email,
    "tier": tier,
    "riskScore": riskScore,
    "updatedAt": updatedAt
  }`,
  'foodmarket-order': `{
    "orderId": order.id,
    "restaurantId": order.restaurantId,
    "customerId": order.customerId,
    "status": order.status,
    "currency": order.currency,
    "totalAmount": order.total,
    "itemCount": $count(order.items),
    "deliveryCity": order.delivery.city,
    "estimatedDelivery": order.delivery.eta,
    "updatedAt": order.updatedAt
  }`,
  'inventorypro-stock': `{
    "stockItemId": sku,
    "sku": sku,
    "name": name,
    "category": category,
    "availableQuantity": availableQuantity,
    "reservedQuantity": reservedQuantity,
    "warehouseId": warehouse.id,
    "warehouseCity": warehouse.city,
    "reorderPoint": reorderPoint,
    "updatedAt": updatedAt
  }`,
  'ticketdesk-ticket': `{
    "ticketId": ticketId,
    "status": status,
    "priority": priority,
    "subject": subject,
    "customerId": customer.id,
    "customerName": customer.name,
    "customerTier": customer.tier,
    "assigneeId": assignee.id,
    "assigneeName": assignee.name,
    "tags": tags,
    "updatedAt": updatedAt
  }`,
  'cloudbill-invoice': `{
    "invoiceId": invoiceId,
    "accountId": accountId,
    "currency": currency,
    "status": status,
    "periodStart": periodStart,
    "periodEnd": periodEnd,
    "lineCount": $count(lines),
    "lines": lines,
    "totalAmount": totalAmount,
    "dueDate": dueDate
  }`,
  'peopleops-employee': `{
    "employeeId": employeeId,
    "externalRef": externalRef,
    "fullName": firstName & " " & lastName,
    "email": email,
    "department": department,
    "title": title,
    "employmentStatus": employmentStatus,
    "updatedAt": updatedAt
  }`
};

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)])
    );
  }
  return value;
}

const fixtures = JSON.parse(await readFile(fixturePath, 'utf8'));
const ids = new Set(fixtures.map((fixture) => fixture.id));
const systems = new Set(fixtures.map((fixture) => fixture.system));

assert.equal(fixtures.length, 10, 'expected exactly 10 smoke fixtures');
assert.equal(ids.size, 10, 'expected 10 unique fixture ids');
assert.equal(systems.size, 10, 'expected 10 unique external systems');

for (const fixture of fixtures) {
  const expression = expressions[fixture.id];
  assert.ok(expression, `missing JSONata expression for ${fixture.id}`);

  const actual = await jsonata(expression).evaluate(fixture.input);
  assert.deepEqual(
    sortValue(actual),
    sortValue(fixture.expected),
    `${fixture.system} canonical output mismatch`
  );
  console.log(`ok ${fixture.system}`);
}

console.log(`Validated ${fixtures.length} ten-system smoke fixture(s).`);
