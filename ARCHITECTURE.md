# 资金拨付工具（重构）- System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    User Browser (SPA Client)                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Vue 3 Application                         │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Router (Vue Router)                                 │  │  │
│  │  │  • WeChat Disbursement                               │  │  │
│  │  │  • Bank Disbursement                                 │  │  │
│  │  │  • B2B Receipts                                      │  │  │
│  │  │  • B2C Receipts                                      │  │  │
│  │  │  • Batch Reconciliation                              │  │  │
│  │  │  • Reconciliation Receipts                           │  │  │
│  │  │  • Dashboard                                         │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  State Management (Pinia/Vuex)                       │  │  │
│  │  │  • Fund Data Store                                   │  │  │
│  │  │  • Receipt Store                                     │  │  │
│  │  │  • Reconciliation Store                              │  │  │
│  │  │  • User/Auth Store                                   │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  TDesign Component Library                           │  │  │
│  │  │  • Tables, Forms, Modals, Tabs                       │  │  │
│  │  │  • Buttons, Inputs, Selects                          │  │  │
│  │  │  • Pagination, Filters                               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↕ (HTTP/HTTPS)
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend API Services                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Fund Disbursement API                                       │  │
│  │  • POST /api/disbursement/create                            │  │
│  │  • GET /api/disbursement/list                               │  │
│  │  • PUT /api/disbursement/update                             │  │
│  │  • GET /api/disbursement/status                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Receipt Management API                                      │  │
│  │  • POST /api/receipt/generate                               │  │
│  │  • GET /api/receipt/list                                    │  │
│  │  • POST /api/receipt/verify                                 │  │
│  │  • GET /api/receipt/{id}                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Reconciliation API                                          │  │
│  │  • POST /api/reconcile/batch                                │  │
│  │  • GET /api/reconcile/status                                │  │
│  │  • POST /api/reconcile/match                                │  │
│  │  • GET /api/reconcile/report                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  File Upload/Import API                                      │  │
│  │  • POST /api/import/excel                                   │  │
│  │  • GET /api/template/download                               │  │
│  │  • POST /api/import/validate                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Auth/Organization API                                       │  │
│  │  • POST /api/auth/login                                     │  │
│  │  • GET /api/user/profile                                    │  │
│  │  • GET /api/org/list                                        │  │
│  │  • POST /api/permission/check                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend Services                                │
│                                                                      │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │   Bank Integration      │  │  Document Processing    │          │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │          │
│  │  │ Bank of China API │  │  │  │ Receipt Generator │  │          │
│  │  └───────────────────┘  │  │  └───────────────────┘  │          │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │          │
│  │  │ Bohai Bank API    │  │  │  │ Excel Processor   │  │          │
│  │  └───────────────────┘  │  │  └───────────────────┘  │          │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │          │
│  │  │ Bank of Comm API  │  │  │  │ Stamp/Seal Gen    │  │          │
│  │  └───────────────────┘  │  │  └───────────────────┘  │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                      │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │   Business Logic        │  │   Data Persistence     │          │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │          │
│  │  │ Reconciliation    │  │  │  │ Database          │  │          │
│  │  │ Engine            │  │  │  │ (MySQL/PostgreSQL)│  │          │
│  │  └───────────────────┘  │  │  └───────────────────┘  │          │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │          │
│  │  │ Status Manager    │  │  │  │ Cache Layer       │  │          │
│  │  └───────────────────┘  │  │  │ (Redis)           │  │          │
│  │  ┌───────────────────┐  │  │  └───────────────────┘  │          │
│  │  │ Amount Validator  │  │  │                         │          │
│  │  └───────────────────┘  │  │                         │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.vue                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Layout Component                                         │  │
│  │ ┌──────────────────┐  ┌──────────────────────────────┐  │  │
│  │ │ Sidebar (Nav)    │  │ MainContent                  │  │  │
│  │ │ • Home           │  │ ┌──────────────────────────┐ │  │  │
│  │ │ • WeChat         │  │ │ RouterView               │ │  │  │
│  │ │ • Bank           │  │ │ • Page Components        │ │  │  │
│  │ │ • Reconcile      │  │ │ • Tables                 │ │  │  │
│  │ │ • Organization   │  │ │ • Forms                  │ │  │  │
│  │ │ • Settings       │  │ └──────────────────────────┘ │  │  │
│  │ └──────────────────┘  │ ┌──────────────────────────┐ │  │  │
│  │                        │ │ Pagination               │ │  │  │
│  │                        │ │ Filters                  │ │  │  │
│  │                        │ │ Action Buttons           │ │  │  │
│  │                        │ └──────────────────────────┘ │  │  │
│  │                        └──────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Shared Components:
├─ DataTable (with sorting, filtering, pagination)
├─ StatusBadge (with color coding)
├─ TransferForm (for disbursement)
├─ ReceiptViewer (for display)
├─ ReconciliationPanel
├─ SearchFilter
└─ Modal Dialogs (Confirm, Alert, Success)
```

## Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
API Call (HTTP Request)
    ↓
Backend Validation & Processing
    ↓
Database Query/Update
    ↓
Response to Frontend
    ↓
Store Update (Pinia/Vuex)
    ↓
Component Re-render
    ↓
UI Update
```

## Key Features by Module

### 1. WeChat Disbursement Module
```
Input: Student/Recipient Data
  ↓
Process: Create Disbursement Orders
  ↓
Action: Send WeChat Transfers
  ↓
Track: Status (Pending → Success/Rejected)
  ↓
Output: Transfer Records & Reports
```

### 2. Bank Disbursement Module
```
Input: Bank Account Information
  ↓
Process: Create Transfer Orders
  ↓
Integration: Bank APIs
  ↓
Generate: Receipt with Digital Stamp
  ↓
Output: Archivable Receipt Document
```

### 3. Reconciliation Module
```
Input: Transaction Data (Excel/API)
  ↓
Parse & Validate Data
  ↓
Match: Transactions with Bank Records
  ↓
Verify: Against Disbursement Records
  ↓
Generate: Reconciliation Report
  ↓
Output: Verified Statements
```

## Security & Access Control

```
┌─────────────────────────────────────┐
│        User Authentication          │
│  ┌─────────────────────────────────┐│
│  │ Login → JWT Token → Store in App││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│    Role-Based Access Control        │
│  ┌─────────────────────────────────┐│
│  │ • Admin                         ││
│  │ • Manager                       ││
│  │ • Staff                         ││
│  │ • Viewer                        ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│    Permission Checking              │
│  ┌─────────────────────────────────┐│
│  │ • Route Guards                  ││
│  │ • API Authorization             ││
│  │ • Data Filtering                ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│    Organization Isolation           │
│  ┌─────────────────────────────────┐│
│  │ • Org-specific Data             ││
│  │ • Department-level Access       ││
│  │ • User Permissions              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Database Schema (Conceptual)

```
┌──────────────────┐         ┌──────────────────┐
│   Organizations  │────────→│   Departments    │
│   • org_id (PK)  │ 1      │ • dept_id (PK)   │
│   • org_name     │    ∞    │ • dept_name      │
│   • created_at   │         │ • org_id (FK)    │
└──────────────────┘         └──────────────────┘
        ↕                             ↕
        │                             │
        └─────────────────┬───────────┘
                          ↓
                ┌──────────────────────┐
                │      Users           │
                │ • user_id (PK)       │
                │ • username           │
                │ • org_id (FK)        │
                │ • dept_id (FK)       │
                │ • role               │
                │ • permissions        │
                └──────────────────────┘
                          ↕
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Disbursements   │ │    Receipts      │ │  Reconciliation  │
│ • disb_id (PK)   │ │ • receipt_id(PK) │ │ • recon_id(PK)   │
│ • user_id (FK)   │ │ • disb_id(FK)    │ │ • user_id (FK)   │
│ • status         │ │ • payer_info     │ │ • batch_number   │
│ • amount         │ │ • payee_info     │ │ • status         │
│ • created_at     │ │ • stamp_seal     │ │ • created_at     │
│ • updated_at     │ │ • created_at     │ │ • matched_count  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        ↕
┌──────────────────┐
│  Beneficiaries   │
│ • bene_id (PK)   │
│ • disb_id (FK)   │
│ • name           │
│ • id_number      │
│ • bank_account   │
│ • amount         │
└──────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CDN / Static Hosting                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Netlify / Vercel / Traditional Web Server         │  │
│  │ • Serves SPA HTML/JS/CSS                          │  │
│  │ • _redirects for SPA routing                      │  │
│  │ • Caching & compression                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ (HTTPS)
┌─────────────────────────────────────────────────────────┐
│                  API Gateway / LB                        │
│  • Load balancing                                       │
│  • SSL/TLS termination                                  │
│  • Rate limiting                                        │
│  • Request routing                                      │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Backend Application Servers                │
│  • API endpoints                                        │
│  • Business logic                                       │
│  • Database access                                      │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   Databases                              │
│  • Primary DB (MySQL/PostgreSQL)                        │
│  • Cache (Redis)                                        │
│  • File Storage (S3/OSS)                                │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
Frontend Optimizations:
├─ Code Splitting (Route-based)
├─ Lazy Loading (Components & Images)
├─ Bundle Minification
├─ CSS Optimization
├─ Pagination for Large Lists
└─ Client-side Caching

Backend Optimizations:
├─ Database Indexing
├─ Query Optimization
├─ Caching Strategy (Redis)
├─ Connection Pooling
├─ Batch Processing
└─ Async Task Processing
```

## Error Handling Flow

```
User Action
    ↓
Try/Catch Error Boundary
    ├─ Validation Error → Show Toast Message
    ├─ Network Error → Retry/Fallback
    ├─ Auth Error → Redirect to Login
    ├─ Permission Error → Show Access Denied
    └─ Server Error → Show Error Modal
    ↓
Log Error
    ├─ Client Logs
    ├─ Server Logs
    └─ Error Tracking Service
    ↓
User Notification
    └─ Toast / Modal / Inline Message
```

---

This architecture supports the comprehensive fund disbursement and reconciliation system with scalability, security, and maintainability in mind.
