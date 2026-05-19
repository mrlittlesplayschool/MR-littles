# 💰 Mr. Littles - Fee Structure System Design

## Overview
A flexible fee management system supporting multiple programs with monthly, 6-month, and yearly payment plans.

---

## 1. Database Schema

### Table: `fee_structures`
Master table defining fee plans for each program.

```sql
CREATE TABLE fee_structures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  program VARCHAR(50) NOT NULL,           -- 'Playgroup', 'Nursery', 'Junior KG', 'Senior KG'
  plan_type VARCHAR(20) NOT NULL,         -- 'Monthly', '6 Months', 'Yearly'
  amount DECIMAL(10,2) NOT NULL,          -- Fee amount
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  academic_year VARCHAR(10) NOT NULL,     -- '2025-26', '2026-27'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_program_plan (program, plan_type, academic_year)
);
```

### Table: `student_fees` (Modified)
Links students to their chosen fee plan.

```sql
CREATE TABLE student_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  fee_structure_id INT NOT NULL,          -- Links to fee_structures
  academic_year VARCHAR(10) NOT NULL,
  total_fee DECIMAL(10,2) NOT NULL,       -- Total amount for the plan
  paid_amount DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
  status ENUM('Pending', 'Partial', 'Paid', 'Overdue') DEFAULT 'Pending',
  due_date DATE,
  enrollment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id),
  INDEX idx_student_year (student_id, academic_year)
);
```

### Table: `fee_payments`
Tracks individual payment transactions.

```sql
CREATE TABLE fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_fee_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque') DEFAULT 'Cash',
  transaction_id VARCHAR(100),
  receipt_number VARCHAR(50) UNIQUE,
  notes TEXT,
  collected_by INT,                       -- User ID who collected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
  INDEX idx_payment_date (payment_date)
);
```

---

## 2. Sample Fee Structure Data

### Academic Year 2025-26

| Program    | Plan Type | Amount   | Discount | Effective Monthly |
|------------|-----------|----------|----------|-------------------|
| Playgroup  | Monthly   | ₹3,000   | 0%       | ₹3,000           |
| Playgroup  | 6 Months  | ₹17,000  | 5%       | ₹2,833           |
| Playgroup  | Yearly    | ₹32,000  | 11%      | ₹2,667           |
| Nursery    | Monthly   | ₹3,500   | 0%       | ₹3,500           |
| Nursery    | 6 Months  | ₹20,000  | 5%       | ₹3,333           |
| Nursery    | Yearly    | ₹38,000  | 10%      | ₹3,167           |
| Junior KG  | Monthly   | ₹4,000   | 0%       | ₹4,000           |
| Junior KG  | 6 Months  | ₹23,000  | 4%       | ₹3,833           |
| Junior KG  | Yearly    | ₹44,000  | 8%       | ₹3,667           |
| Senior KG  | Monthly   | ₹4,500   | 0%       | ₹4,500           |
| Senior KG  | 6 Months  | ₹26,000  | 4%       | ₹4,333           |
| Senior KG  | Yearly    | ₹50,000  | 7%       | ₹4,167           |

---

## 3. User Flow

### For School Owner/Admin:

1. **Setup Fee Structure** (One-time per academic year)
   - Navigate to Settings → Fee Structure
   - Define fees for each program
   - Set payment plans (Monthly, 6 Months, Yearly)
   - Apply discounts for advance payments
   - Activate for academic year

2. **Enroll Student with Fee Plan**
   - Add student details
   - Select program
   - Choose payment plan (Monthly/6 Months/Yearly)
   - System auto-calculates total fee
   - Set due date based on plan
   - Generate fee record

3. **Collect Payments**
   - View pending fees
   - Select student
   - Enter payment amount
   - Choose payment method
   - Generate receipt
   - Update balance automatically

### For Parents (Future Feature):
- View fee structure
- See payment history
- Download receipts
- Get payment reminders

---

## 4. Business Logic

### Payment Plan Rules:

**Monthly Plan:**
- Due date: 5th of every month
- No discount
- Flexible (can stop anytime)
- Late fee: ₹100 after 10th

**6 Months Plan:**
- Due date: Start of term (June/December)
- 4-5% discount
- Two installments allowed
- Commitment: 6 months

**Yearly Plan:**
- Due date: Start of academic year (June)
- 7-11% discount
- Up to 3 installments allowed
- Commitment: Full year
- Maximum savings

### Auto-Status Updates:
```
Pending  → When balance = total_fee
Partial  → When 0 < paid_amount < total_fee
Paid     → When paid_amount >= total_fee
Overdue  → When due_date passed and status != Paid
```

---

## 5. API Endpoints Needed

### Fee Structure Management
```
GET    /api/fee-structures                    # List all structures
GET    /api/fee-structures/:year              # Get by academic year
POST   /api/fee-structures                    # Create new structure
PUT    /api/fee-structures/:id                # Update structure
DELETE /api/fee-structures/:id                # Delete structure
GET    /api/fee-structures/active             # Get active structures
```

### Student Fee Management
```
GET    /api/student-fees                      # List all student fees
GET    /api/student-fees/:studentId           # Get student's fees
POST   /api/student-fees                      # Create fee record for student
PUT    /api/student-fees/:id                  # Update fee record
GET    /api/student-fees/pending              # Get all pending fees
GET    /api/student-fees/overdue              # Get overdue fees
```

### Payment Collection
```
POST   /api/fee-payments                      # Record payment
GET    /api/fee-payments/:studentFeeId        # Get payment history
GET    /api/fee-payments/receipt/:id          # Generate receipt
DELETE /api/fee-payments/:id                  # Reverse payment (admin only)
```

---

## 6. UI Components Needed

### 1. Fee Structure Manager (Admin)
```
┌─────────────────────────────────────────────┐
│ Fee Structure - Academic Year 2025-26       │
├─────────────────────────────────────────────┤
│                                             │
│ Program: [Playgroup ▼]                     │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Monthly Plan                         │   │
│ │ Amount: ₹ [3000]                    │   │
│ │ Discount: [0]%                      │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 6 Months Plan                        │   │
│ │ Amount: ₹ [17000]                   │   │
│ │ Discount: [5]%                      │   │
│ │ Effective: ₹2,833/month             │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Yearly Plan                          │   │
│ │ Amount: ₹ [32000]                   │   │
│ │ Discount: [11]%                     │   │
│ │ Effective: ₹2,667/month             │   │
│ └─────────────────────────────────────┘   │
│                                             │
│         [Save Structure]                    │
└─────────────────────────────────────────────┘
```

### 2. Student Enrollment with Fee Selection
```
┌─────────────────────────────────────────────┐
│ Enroll Student - Fee Plan Selection         │
├─────────────────────────────────────────────┤
│                                             │
│ Student: Rahul Sharma                       │
│ Program: Junior KG                          │
│                                             │
│ Select Payment Plan:                        │
│                                             │
│ ○ Monthly - ₹4,000/month                   │
│   Pay every month, no commitment            │
│                                             │
│ ○ 6 Months - ₹23,000 (Save ₹1,000)        │
│   Pay ₹23,000 for 6 months                 │
│   Effective: ₹3,833/month                  │
│                                             │
│ ● Yearly - ₹44,000 (Save ₹4,000)          │
│   Pay ₹44,000 for full year                │
│   Effective: ₹3,667/month                  │
│   🎉 Best Value!                           │
│                                             │
│ Due Date: [05/06/2025]                     │
│                                             │
│         [Confirm Enrollment]                │
└─────────────────────────────────────────────┘
```

### 3. Enhanced Fees Dashboard
```
┌─────────────────────────────────────────────┐
│ Fees Management                             │
├─────────────────────────────────────────────┤
│                                             │
│ Summary by Payment Plan:                    │
│ ┌──────────┬──────────┬──────────┐        │
│ │ Monthly  │ 6 Months │  Yearly  │        │
│ │ 15 students│ 8 students│ 22 students│    │
│ │ ₹60K/mo  │ ₹1.84L   │ ₹9.68L   │        │
│ └──────────┴──────────┴──────────┘        │
│                                             │
│ Filters:                                    │
│ [All Programs ▼] [All Plans ▼] [Overdue]  │
│                                             │
│ Student List:                               │
│ ┌─────────────────────────────────────┐   │
│ │ Rahul Sharma - Junior KG            │   │
│ │ Plan: Yearly | ₹44,000              │   │
│ │ Paid: ₹30,000 | Balance: ₹14,000   │   │
│ │ Due: 05 Dec 2025                    │   │
│ │ [Collect Payment]                   │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 7. Implementation Priority

### Phase 1: Core Setup (Week 1)
- [ ] Create database tables
- [ ] Add fee structure management API
- [ ] Build fee structure UI for admin
- [ ] Seed initial fee data

### Phase 2: Student Integration (Week 2)
- [ ] Modify student enrollment to include fee plan selection
- [ ] Update student fees table
- [ ] Link students to fee structures
- [ ] Display fee plan in student details

### Phase 3: Payment Collection (Week 3)
- [ ] Update fees dashboard to show plan types
- [ ] Add payment collection with plan awareness
- [ ] Generate receipts with plan details
- [ ] Payment history tracking

### Phase 4: Reporting & Analytics (Week 4)
- [ ] Revenue by payment plan report
- [ ] Conversion rate (monthly → yearly)
- [ ] Discount impact analysis
- [ ] Renewal reminders

---

## 8. Sample SQL Insert Statements

```sql
-- Insert fee structures for 2025-26
INSERT INTO fee_structures (program, plan_type, amount, discount_percentage, academic_year) VALUES
-- Playgroup
('Playgroup', 'Monthly', 3000.00, 0, '2025-26'),
('Playgroup', '6 Months', 17000.00, 5.56, '2025-26'),
('Playgroup', 'Yearly', 32000.00, 11.11, '2025-26'),

-- Nursery
('Nursery', 'Monthly', 3500.00, 0, '2025-26'),
('Nursery', '6 Months', 20000.00, 4.76, '2025-26'),
('Nursery', 'Yearly', 38000.00, 9.52, '2025-26'),

-- Junior KG
('Junior KG', 'Monthly', 4000.00, 0, '2025-26'),
('Junior KG', '6 Months', 23000.00, 4.17, '2025-26'),
('Junior KG', 'Yearly', 44000.00, 8.33, '2025-26'),

-- Senior KG
('Senior KG', 'Monthly', 4500.00, 0, '2025-26'),
('Senior KG', '6 Months', 26000.00, 3.70, '2025-26'),
('Senior KG', 'Yearly', 50000.00, 7.41, '2025-26');
```

---

## 9. Benefits of This Structure

### For School:
✅ Predictable cash flow with yearly plans
✅ Reduced monthly collection effort
✅ Better financial planning
✅ Incentivizes advance payments
✅ Easy to update fees per academic year
✅ Clear reporting by plan type

### For Parents:
✅ Flexibility to choose payment frequency
✅ Savings with advance payment
✅ Clear fee structure
✅ No hidden charges
✅ Easy to understand

### For System:
✅ Scalable design
✅ Easy to add new programs
✅ Historical fee tracking
✅ Automated calculations
✅ Audit trail for all payments

---

## 10. Additional Features (Future)

1. **Auto-renewal**: Remind parents before plan expires
2. **Sibling discount**: 10% off for second child
3. **Early bird discount**: 5% extra if paid before May
4. **Installment plans**: Split yearly into 3 payments
5. **Late fee automation**: Auto-add ₹100 after due date
6. **SMS/Email reminders**: 7 days before due date
7. **Online payment gateway**: Razorpay/Paytm integration
8. **Fee comparison tool**: Help parents choose best plan
9. **Refund management**: Handle mid-year withdrawals
10. **Tax receipts**: Generate 80C receipts for parents

---

## Recommendation

**Start with Option 1** - It's simple, flexible, and covers all your needs. You can:
1. Set up fee structures once per year
2. Let parents choose their preferred payment plan
3. Track everything in one place
4. Generate reports by plan type
5. Scale easily as you grow

Would you like me to implement this system for you?
