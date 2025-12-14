# Tables Management API Documentation - Overview

This directory contains comprehensive API documentation for the Tables Management feature, designed to help backend developers implement the required endpoints.

---

## Documentation Files

### 📘 [TABLES_API_DOCUMENTATION.md](./TABLES_API_DOCUMENTATION.md)

**Main API Documentation** - Complete reference for all endpoints

Contains:

- All 14 API endpoints with detailed specifications
- Request/Response schemas with examples
- Authentication & authorization details
- Database operations and queries
- Error handling
- QR code generation logic
- Data models

**Use this for:** Implementing the backend API endpoints

---

### 💡 [API_EXAMPLES.md](./API_EXAMPLES.md)

**Practical Usage Examples** - Real-world code examples

Contains:

- Common use cases with step-by-step examples
- JavaScript/TypeScript code snippets
- React hooks for API integration
- Error handling patterns
- Integration patterns (optimistic updates, debouncing, etc.)

**Use this for:** Integrating the API in frontend code

---

### ✅ [API_COMPLETENESS_REVIEW.md](./API_COMPLETENESS_REVIEW.md)

**Completeness Verification** - Ensures all UI features are covered

Contains:

- Feature-by-feature mapping between UI and API
- Coverage statistics
- Recommendations
- Missing features analysis

**Use this for:** Verification that all requirements are met

---

## Quick Start

1. **Backend Developers:**
   - Start with [TABLES_API_DOCUMENTATION.md](./TABLES_API_DOCUMENTATION.md)
   - Review endpoint specifications
   - Implement endpoints following the documented schemas

2. **Frontend Developers:**
   - Start with [API_EXAMPLES.md](./API_EXAMPLES.md)
   - Use the code examples as templates
   - Reference the main documentation for response schemas

3. **Project Managers/QA:**
   - Review [API_COMPLETENESS_REVIEW.md](./API_COMPLETENESS_REVIEW.md)
   - Verify all features are covered

---

## API Endpoints Summary

### Tables List & Statistics (2 endpoints)

- `GET /api/tables` - List tables with filtering and pagination
- `GET /api/tables/stats` - Get table statistics

### Table CRUD (4 endpoints)

- `POST /api/tables` - Create new table
- `GET /api/tables/:id` - Get table details
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Floor Plan Layout (4 endpoints)

- `GET /api/tables/layout` - Get layout by floor
- `PUT /api/tables/:id/position` - Update table position
- `POST /api/tables/layout/batch-update` - Batch update layout
- `GET /api/tables/floors` - Get available floors

### QR Code Management (4 endpoints)

- `GET /api/tables/qr` - Get all QR codes
- `POST /api/tables/:id/qr/generate` - Generate QR code
- `POST /api/tables/qr/batch-generate` - Batch generate QR codes
- `GET /api/tables/:id/qr` - Get QR code for table

**Total: 14 endpoints**

---

## Key Features Documented

✅ Multi-tenant isolation (tenant_id from JWT)  
✅ Pagination and filtering  
✅ Position storage (JSON format)  
✅ QR code generation (JWT-based tokens)  
✅ Batch operations  
✅ Error handling  
✅ Validation rules  
✅ Database queries

---

## Database Schema Reference

See:

- `DATABASE_DESIGN.txt` - Full database schema
- `DATABASE_DESCRIPTION.txt` - Detailed field descriptions

**Main Table:** `tables`

- Fields: id, tenant_id, table_number, capacity, floor, shape, status, position, qr_code_token, qr_code_url, is_active, created_at, updated_at

---

## Status Mapping

| UI Status          | Database Status                                   |
| ------------------ | ------------------------------------------------- |
| 'Available'        | 'available'                                       |
| 'Occupied'         | 'occupied'                                        |
| 'Waiting for bill' | 'occupied' (with order status = 'ready'/'served') |
| 'Disabled'         | 'maintenance'                                     |

**Note:** API should handle this transformation.

---

## Next Steps

1. ✅ Review documentation files
2. ✅ Implement backend endpoints
3. ✅ Test with frontend UI
4. ✅ Update documentation if needed

---

## Questions?

Refer to the detailed documentation in [TABLES_API_DOCUMENTATION.md](./TABLES_API_DOCUMENTATION.md) or contact the development team.
