
# JwalkeyBB API Documentation

Base URL: `/api/`

Authentication: JWT Bearer token
- Get token from `auth/register/` or `auth/login/`
- Send header: `Authorization: Bearer <access_token>`

Common error response:
```json
{
	"detail": "Error message"
}
```

Pagination (list endpoints):
```json
{
	"count": 25,
	"next": "http://host/api/customer/list/?page=2",
	"previous": null,
	"results": []
}
```

---

## Auth

### Register
`POST /api/auth/register/`

Request body:
```json
{
	"full_name": "John Doe",
	"email": "john@example.com",
	"password": "StrongPass123"
}
```

Response `201`:
```json
{
	"refresh": "<refresh_token>",
	"access": "<access_token>",
	"user": {
		"id": 1,
		"full_name": "John Doe",
		"email": "john@example.com",
		"phone_number": null,
		"date_of_birth": null,
		"usergender": null,
		"usertype": null,
		"role": "User",
		"is_profile_completed": false,
		"profile_picture": null
	}
}
```

### Login
`POST /api/auth/login/`

Request body:
```json
{
	"email": "john@example.com",
	"password": "StrongPass123"
}
```

Response `200`: same as register response format.

### Profile (Get/Update)
`GET /api/auth/profile/`
`PATCH /api/auth/profile/`

Updatable fields: `full_name`, `phone_number`, `date_of_birth`, `usergender`, `profile_picture`

`PATCH` example:
```json
{
	"full_name": "John D",
	"phone_number": "+44-7000-000000",
	"usergender": "Male"
}
```

Response `200`:
```json
{
	"id": 1,
	"full_name": "John D",
	"email": "john@example.com",
	"phone_number": "+44-7000-000000",
	"date_of_birth": null,
	"usergender": "Male",
	"usertype": null,
	"role": "User",
	"is_profile_completed": false,
	"profile_picture": null
}
```

---

## Business Details

All endpoints require authentication. File upload fields (`company_logo`) use `multipart/form-data`.

### Sole Trade Business (Create/List)
`GET /api/Details-sole-trade-business/`
`POST /api/Details-sole-trade-business/`

Required fields (non-null in model):
`business_name`, `full_name`, `email`

Optional fields: `trading_name`, `date_business_started`, `business_address`, `utr`, `National_insurance_number`, `industry`, `is_vat_registered`, `is_cis_registered`, `vat_scheme`, `cis_role`, `accounting_method`, `phone_number`, `full_address`, `secondary_full_name`, `secondary_email`, `secondary_phone_number`, `company_logo`, `invoice_prefix`, `quote_number_format`, `invoice_number_format`, `currency`, `tax_display`

Request body (example):
```json
{
	"business_name": "ABC Trade",
	"full_name": "John Doe",
	"email": "john@example.com",
	"is_vat_registered": false,
	"currency": "USD",
	"tax_display": "Exclusive"
}
```

Response `200/201` (example):
```json
{
	"id": 1,
	"user": 1,
	"usertype": "ST",
	"business_name": "ABC Trade",
	"trading_name": null,
	"date_business_started": null,
	"business_address": null,
	"utr": null,
	"National_insurance_number": null,
	"industry": null,
	"is_vat_registered": false,
	"is_cis_registered": false,
	"vat_scheme": null,
	"cis_role": null,
	"accounting_method": null,
	"full_name": "John Doe",
	"email": "john@example.com",
	"phone_number": null,
	"full_address": null,
	"secondary_full_name": null,
	"secondary_email": null,
	"secondary_phone_number": null,
	"company_logo": null,
	"invoice_prefix": null,
	"quote_number_format": null,
	"invoice_number_format": null,
	"currency": "USD",
	"tax_display": "Exclusive",
	"default_payment_terms": 30,
	"created_at": "2026-05-09T10:00:00Z",
	"updated_at": "2026-05-09T10:00:00Z"
}
```

### Sole Trade Business (Retrieve/Update/Delete)
`GET /api/Details-sole-trade-business/update/`
`PATCH /api/Details-sole-trade-business/update/`
`DELETE /api/Details-sole-trade-business/update/`

Same fields and response format as create.

### Limited Company (Create)
`POST /api/Details-limited-company/`

Required fields: `company_name`, `registration_number`, `primary_contact_email`, `full_name`, `email`

Optional fields: `date_of_incorporation`, `company_address`, `trading_address`, `directors`, `primary_phone_number`, `corporation_tax_utr`, `is_vat_registered`, `is_cis_registered`, `is_paye_registered`, `cis_role`, `accounting_method`, `phone_number`, `full_address`, `secondary_full_name`, `secondary_email`, `secondary_phone_number`, `company_logo`, `invoice_prefix`, `quote_number_format`, `invoice_number_format`, `currency`, `tax_display`

### Limited Company (Retrieve/Update)
`GET /api/Details-limited-company/update/`
`PATCH /api/Details-limited-company/update/`

### Partner (Create)
`POST /api/Details-partner/`

Required fields: `partnership_name`, `partner_name`, `full_name`, `email`

Optional fields: `business_address`, `date_started`, `date_partnership_started`, `partnership_address`, `utr`, `National_insurance_number`, `industry`, `partner_utr`, `partnership_utr`, `is_vat_registered`, `is_cis_registered`, `vat_scheme`, `cis_role`, `accounting_method`, `phone_number`, `full_address`, `secondary_full_name`, `secondary_email`, `secondary_phone_number`, `company_logo`, `invoice_prefix`, `quote_number_format`, `invoice_number_format`, `currency`, `tax_display`

### Partner (Retrieve/Update)
`GET /api/Details-partner/update/`
`PATCH /api/Details-partner/update/`

### Limited Liability Partnership (Create)
`POST /api/Details-limited-liability-partnership/`

Required fields: `llp_name`, `registration_number`, `member_name`, `primary_contact_email`, `full_name`, `email`

Optional fields: `register_address`, `member_utr`, `trading_address`, `designated_members`, `primary_phone_number`, `corporation_tax_utr`, `is_vat_registered`, `is_cis_registered`, `is_paye_registered`, `cis_role`, `accounting_method`, `phone_number`, `full_address`, `secondary_full_name`, `secondary_email`, `secondary_phone_number`, `company_logo`, `invoice_prefix`, `quote_number_format`, `invoice_number_format`, `currency`, `tax_display`

### Limited Liability Partnership (Retrieve/Update)
`GET /api/Details-limited-liability-partnership/update/`
`PATCH /api/Details-limited-liability-partnership/update/`

---

## Customers

### Create Customer
`POST /api/customer/create/`

Request body:
```json
{
	"customer_name": "Alice",
	"customer_email": "alice@example.com",
	"phone_number": "+44-7000-111111",
	"customer_type": "Domestic",
	"billing_address": "1 Street, London",
	"site_address": "2 Street, London",
	"notes": "Regular client"
}
```

Response `201`:
```json
{
	"id": 10,
	"owner": 1,
	"customer_name": "Alice",
	"customer_email": "alice@example.com",
	"phone_number": "+44-7000-111111",
	"customer_type": "Domestic",
	"billing_address": "1 Street, London",
	"site_address": "2 Street, London",
	"notes": "Regular client",
	"created_at": "2026-05-09T10:00:00Z",
	"updated_at": "2026-05-09T10:00:00Z"
}
```

### List Customers
`GET /api/customer/list/`

Response `200`:
```json
{
	"count": 1,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 10,
			"customer_name": "Alice",
			"customer_email": "alice@example.com",
			"phone_number": "+44-7000-111111",
			"customer_type": "Domestic",
			"created_at": "2026-05-09T10:00:00Z"
		}
	]
}
```

### Update/Delete Customer
`GET /api/customer/<id>/`
`PATCH /api/customer/<id>/`
`DELETE /api/customer/<id>/`

Request body (example):
```json
{
	"phone_number": "+44-7000-222222",
	"notes": "Updated note"
}
```

---

## Quotes

### Create Quote
`POST /api/quote/create/`

Request body:
```json
{
	"customer": 10,
	"job_type": "No_Job",
	"quote_date": "2026-05-09",
	"valid_until": "2026-06-09",
	"deposit": "50.00",
	"payment_note": "Pay within 30 days",
	"notes": "Quote notes",
	"invoice_number": "INV-1001"
}
```

Response `201`:
```json
{
	"id": 20,
	"owner": 1,
	"customer": 10,
	"quote_status": "Draft",
	"quote_uuid": "c1b5c6f3-1f4a-4d5b-a6a4-2e2a8f5d3f1d",
	"job_type": "No_Job",
	"quote_date": "2026-05-09",
	"valid_until": "2026-06-09",
	"deposit": "50.00",
	"payment_note": "Pay within 30 days",
	"notes": "Quote notes",
	"invoice_number": "INV-1001",
	"created_at": "2026-05-09T10:00:00Z",
	"updated_at": "2026-05-09T10:00:00Z"
}
```

### List Quotes
`GET /api/quote/list/`

Response `200`:
```json
{
	"count": 1,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 20,
			"quote_uuid": "c1b5c6f3-1f4a-4d5b-a6a4-2e2a8f5d3f1d",
			"customer_name": "Alice",
			"job_type": "No_Job",
			"created_at": "2026-05-09T10:00:00Z",
			"price": "150.00",
			"quote_status": "Draft"
		}
	]
}
```

### Update/Delete Quote
`GET /api/quote/<id>/`
`PATCH /api/quote/<id>/`
`DELETE /api/quote/<id>/`

---

## Line Items

### Create Line Item
`POST /api/line-item/create/`

Request body:
```json
{
	"quote": 20,
	"description": "Labor",
	"quantity": 3,
	"unit_price": "50.00"
}
```

Response `201`:
```json
{
	"id": 100,
	"quote": 20,
	"description": "Labor",
	"quantity": 3,
	"unit_price": "50.00",
	"total_price": "150.00"
}
```

---

## Dashboard

### Stats
`GET /api/dashboard/stats/`

Response `200`:
```json
{
	"total_customers": 10,
	"active_jobs": 2,
	"quote_awating_response": 3,
	"quote_accepted": 1,
	"invoice_created": 1
}
```

### Recent Quotes
`GET /api/dashboard/recent-quotes/`

Response `200`:
```json
[
	{
		"id": 20,
		"quote_uuid": "c1b5c6f3-1f4a-4d5b-a6a4-2e2a8f5d3f1d",
		"customer": 10,
		"quote_status": "Draft",
		"total_price": "150.00",
		"created_at": "2026-05-09T10:00:00Z"
	}
]
```

### Recent Invoices
`GET /api/dashboard/recent-invoices/`

Response `200`:
```json
[
	{
		"id": 21,
		"quote_uuid": "9c1a7a8a-3d2a-4a6c-b2d2-1b2f7b6e3a1c",
		"invoice_number": "INV-1001",
		"customer": 10,
		"quote_status": "invoice_created",
		"total_price": "300.00",
		"created_at": "2026-05-09T10:00:00Z"
	}
]
```

### Quote List (Dashboard)
`GET /api/dashboard/quotes-list/`

Response format same as `/api/quote/list/` but without pagination.

### Quote Detail (Dashboard)
`GET /api/dashboard/quote/<id>/`
`PATCH /api/dashboard/quote/<id>/`
`DELETE /api/dashboard/quote/<id>/`

### Send Quote Email
`POST /api/dashboard/quote/send-email/`

Request body:
```json
{
	"quote_id": 20
}
```

Response `200`:
```json
{
	"success": "Email sent successfully to customer"
}
```

### Stripe Checkout Session
`POST /api/quote/checkout/`

Request body:
```json
{
	"quote_id": 20
}
```

Response `200`:
```json
{
	"checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

## Stripe Webhook

`POST /api/webhook/stripe/`

Headers:
`Stripe-Signature: <signature>`

Response `200`:
```json
{
	"status": "success"
}
```

---

## Terms & Privacy

### Admin Terms/Privacy (Get/Update)
`GET /api/admin/terms-privacy/`
`PUT /api/admin/terms-privacy/`

Note: the view expects a `pk` lookup; if you get 404, adjust URL to `/api/admin/terms-privacy/<id>/`.

Request body:
```json
{
	"type": "terms",
	"content": "Terms text..."
}
```

Response `200`:
```json
{
	"id": 1,
	"type": "terms",
	"content": "Terms text...",
	"created_at": "2026-05-09T10:00:00Z",
	"updated_at": "2026-05-09T10:00:00Z"
}
```

### User Terms
`GET /api/user/terms/`

Response `200`: same as above (latest terms).

### User Privacy
`GET /api/user/privacy/`

Response `200`: same as above (latest privacy).

---

## Choice Fields Reference

**User**
- `role`: `Admin`, `User`
- `usertype`: `ST`, `LTD`, `PT`, `LLP`
- `usergender`: `Male`, `Female`, `Other`

**Business**
- `vat_scheme`: `Standard_VAT`, `Flat_Rate_Scheme`
- `cis_role`: `Contractor`, `Subcontractor`, `Both`
- `accounting_method`: `Cash`, `Accrual`
- `currency`: `GBP`, `USD`, `EUR`
- `tax_display`: `Inclusive`, `Exclusive`

**Customer/Quote**
- `customer_type`: `Domestic`, `International`, `Commercial`
- `job_type`: `No_Job`, `Electrical`, `Plumbing`, `Carpentry`
- `quote_status`: `Draft`, `Sent`, `Accepted`, `Rejected`

Note: dashboard filters also reference `awaiting_response` and `invoice_created` statuses.

