# Backend Implementation TODO

## 🎯 Overview
The frontend fee structure system is complete. This document outlines exactly what needs to be implemented on the backend.

---

## 📋 Database Changes

### 1. Create `fee_structures` Table

```sql
CREATE TABLE fee_structures (
  id SERIAL PRIMARY KEY,
  program VARCHAR(50) NOT NULL,
  plan_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  academic_year VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(program, plan_type, academic_year)
);

-- Create index for faster lookups
CREATE INDEX idx_fee_structures_lookup 
ON fee_structures(program, plan_type, academic_year, is_active);
```

**Valid Values:**
- `program`: 'Playgroup', 'Nursery', 'Junior KG', 'Senior KG'
- `plan_type`: 'Monthly', '6 Months', 'Yearly'
- `academic_year`: '2025-26', '2026-27', etc.

### 2. Update `students` Table

```sql
ALTER TABLE students 
ADD COLUMN fee_plan VARCHAR(20) DEFAULT 'Monthly';

-- Add check constraint
ALTER TABLE students
ADD CONSTRAINT check_fee_plan 
CHECK (fee_plan IN ('Monthly', '6 Months', 'Yearly'));
```

### 3. Update `fees` Table

```sql
ALTER TABLE fees 
ADD COLUMN fee_plan VARCHAR(20);

-- Backfill existing records
UPDATE fees f
SET fee_plan = s.fee_plan
FROM students s
WHERE f.student_id = s.id;
```

---

## 🔌 API Endpoints to Implement

### Fee Structures Endpoints

#### 1. Get Fee Structures
```
GET /api/fee-structures?year=2025-26

Response:
[
  {
    "id": 1,
    "program": "Playgroup",
    "plan_type": "Monthly",
    "amount": 5000,
    "discount_percentage": 0,
    "academic_year": "2025-26",
    "is_active": true,
    "created_at": "2026-05-19T10:00:00Z",
    "updated_at": "2026-05-19T10:00:00Z"
  },
  {
    "id": 2,
    "program": "Playgroup",
    "plan_type": "6 Months",
    "amount": 28500,
    "discount_percentage": 5,
    "academic_year": "2025-26",
    "is_active": true,
    "created_at": "2026-05-19T10:00:00Z",
    "updated_at": "2026-05-19T10:00:00Z"
  }
]
```

#### 2. Bulk Save Fee Structures
```
POST /api/fee-structures/bulk

Request Body:
[
  {
    "program": "Playgroup",
    "plan_type": "Monthly",
    "amount": 5000,
    "discount_percentage": 0,
    "academic_year": "2025-26",
    "is_active": true
  },
  {
    "program": "Playgroup",
    "plan_type": "6 Months",
    "amount": 28500,
    "discount_percentage": 5,
    "academic_year": "2025-26",
    "is_active": true
  },
  {
    "program": "Playgroup",
    "plan_type": "Yearly",
    "amount": 54000,
    "discount_percentage": 10,
    "academic_year": "2025-26",
    "is_active": true
  }
]

Response:
{
  "success": true,
  "message": "Fee structures saved successfully",
  "count": 3
}

Logic:
- Use UPSERT (INSERT ... ON CONFLICT UPDATE)
- Match on (program, plan_type, academic_year)
- Update amount, discount_percentage, is_active if exists
- Insert if doesn't exist
```

#### 3. Update Single Fee Structure
```
PUT /api/fee-structures/:id

Request Body:
{
  "amount": 5500,
  "discount_percentage": 0,
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Fee structure updated",
  "data": { ... updated record ... }
}
```

#### 4. Delete Fee Structure
```
DELETE /api/fee-structures/:id

Response:
{
  "success": true,
  "message": "Fee structure deleted"
}

Note: Consider soft delete (set is_active = false) instead of hard delete
```

---

### Students Endpoints (Update Existing)

#### 1. Create Student (Update)
```
POST /api/students

Request Body:
{
  "name": "John Doe",
  "program": "Junior KG",
  "dob": "2020-05-15",
  "parent_name": "Mary Doe",
  "phone": "9876543210",
  "address": "123 Main St",
  "fee_plan": "Yearly"  // NEW FIELD
}

Backend Logic:
1. Create student record with fee_plan
2. AUTOMATICALLY create initial fee record:
   - Lookup fee structure (program + fee_plan + current year)
   - Calculate due date based on plan type
   - Create fee record with total_fee from structure
   - Set status as "Pending"
3. Return student data

Response:
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 123,
    "name": "John Doe",
    "program": "Junior KG",
    "fee_plan": "Yearly",
    ...
  }
}

IMPORTANT: Fee record is created automatically in the same transaction!
```

#### 2. Update Student (Update)
```
PUT /api/students/:id

Request Body:
{
  "name": "John Doe",
  "program": "Junior KG",
  "fee_plan": "Monthly"  // Can be changed
  ...
}

Response:
{
  "success": true,
  "message": "Student updated successfully",
  "data": { ... }
}
```

#### 3. Get Students (Update)
```
GET /api/students

Response:
[
  {
    "id": 123,
    "name": "John Doe",
    "program": "Junior KG",
    "fee_plan": "Yearly",  // NEW FIELD
    "parent_name": "Mary Doe",
    ...
  }
]
```

---

### Fees Endpoints (Update Existing)

#### 1. Get Fees (Update)
```
GET /api/fees

Response:
[
  {
    "id": 1,
    "student_id": 123,
    "student_name": "John Doe",
    "program": "Junior KG",
    "fee_plan": "Yearly",  // NEW FIELD (from student)
    "parent_name": "Mary Doe",
    "phone": "9876543210",
    "total_fee": 64800,
    "paid_amount": 64800,
    "due_date": "2026-04-05",
    "status": "Paid",
    "month": "May 2026"
  }
]

SQL Query Example:
SELECT 
  f.*,
  s.name as student_name,
  s.program,
  s.fee_plan,  -- NEW
  s.parent_name,
  s.phone
FROM fees f
JOIN students s ON f.student_id = s.id
ORDER BY f.due_date DESC;
```

#### 2. Create Fee (Update Logic)
```
POST /api/fees

Request Body:
{
  "student_id": 123,
  "month": "May 2026",
  "due_date": "2026-05-05"
}

Backend Logic:
1. Get student record (includes program and fee_plan)
2. Lookup fee structure:
   - WHERE program = student.program
   - AND plan_type = student.fee_plan
   - AND academic_year = current_year
   - AND is_active = true
3. Use fee_structure.amount as total_fee
4. Calculate due_date based on plan_type:
   - Monthly: 5th of each month
   - 6 Months: 5th of Apr and Oct
   - Yearly: 5th of April
5. Insert fee record with fee_plan from student

Response:
{
  "success": true,
  "message": "Fee record created",
  "data": {
    "id": 456,
    "student_id": 123,
    "total_fee": 64800,  // From fee_structure
    "fee_plan": "Yearly",  // From student
    ...
  }
}
```

---

## 🔄 Business Logic

### Automatic Fee Generation on Student Creation

**IMPORTANT**: When a new student is created, their initial fee record should be automatically generated!

```javascript
// Pseudo-code for student creation with automatic fee generation

async function createStudent(studentData) {
  // Start database transaction
  const transaction = await db.beginTransaction();
  
  try {
    // 1. Create student record
    const student = await db.query(
      `INSERT INTO students (name, program, fee_plan, parent_name, phone, address, dob)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [studentData.name, studentData.program, studentData.fee_plan, 
       studentData.parent_name, studentData.phone, studentData.address, studentData.dob]
    );
    
    // 2. AUTOMATICALLY create initial fee record
    const feeRecord = await createInitialFeeRecord(student.id, transaction);
    
    // 3. Commit transaction
    await transaction.commit();
    
    return {
      success: true,
      student: student,
      feeRecord: feeRecord
    };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function createInitialFeeRecord(studentId, transaction) {
  // 1. Get student details
  const student = await db.query(
    'SELECT program, fee_plan FROM students WHERE id = ?',
    [studentId]
  );
  
  // 2. Get current academic year
  const academicYear = getCurrentAcademicYear(); // e.g., "2025-26"
  
  // 3. Lookup fee structure
  const feeStructure = await db.query(
    `SELECT amount, discount_percentage 
     FROM fee_structures 
     WHERE program = ? 
     AND plan_type = ? 
     AND academic_year = ? 
     AND is_active = true`,
    [student.program, student.fee_plan, academicYear]
  );
  
  if (!feeStructure) {
    throw new Error(
      `Fee structure not configured for ${student.program} - ${student.fee_plan} plan for ${academicYear}`
    );
  }
  
  // 4. Calculate due date based on plan type
  const now = new Date();
  const dueDate = calculateDueDate(student.fee_plan, now);
  
  // 5. Determine month/period based on plan type
  const period = calculatePeriod(student.fee_plan, now);
  
  // 6. Create fee record
  const feeRecord = await db.query(
    `INSERT INTO fees (
      student_id, 
      total_fee, 
      paid_amount, 
      due_date, 
      status, 
      month,
      fee_plan
    ) VALUES (?, ?, 0, ?, 'Pending', ?, ?)
    RETURNING *`,
    [studentId, feeStructure.amount, dueDate, period, student.fee_plan],
    { transaction }
  );
  
  return feeRecord;
}

function calculatePeriod(planType, date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  switch(planType) {
    case 'Monthly':
      // Current month
      return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      
    case '6 Months':
      // April-September or October-March
      if (month >= 3 && month < 9) {
        return `Apr-Sep ${year}`;
      }
      return `Oct ${year}-Mar ${year + 1}`;
      
    case 'Yearly':
      // Academic year (April to March)
      if (month < 3) {
        return `${year - 1}-${year.toString().slice(2)}`;
      }
      return `${year}-${(year + 1).toString().slice(2)}`;
      
    default:
      return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }
}
```

### Fee Calculation Logic

```javascript
// Pseudo-code for fee calculation

async function calculateFeeForStudent(studentId, month) {
  // 1. Get student details
  const student = await db.query(
    'SELECT program, fee_plan FROM students WHERE id = ?',
    [studentId]
  );
  
  // 2. Get current academic year
  const academicYear = getCurrentAcademicYear(); // e.g., "2025-26"
  
  // 3. Lookup fee structure
  const feeStructure = await db.query(
    `SELECT amount, discount_percentage 
     FROM fee_structures 
     WHERE program = ? 
     AND plan_type = ? 
     AND academic_year = ? 
     AND is_active = true`,
    [student.program, student.fee_plan, academicYear]
  );
  
  if (!feeStructure) {
    throw new Error('Fee structure not configured for this program and plan');
  }
  
  // 4. Calculate due date based on plan type
  const dueDate = calculateDueDate(student.fee_plan, month);
  
  // 5. Return fee details
  return {
    totalFee: feeStructure.amount,
    discountPercentage: feeStructure.discount_percentage,
    dueDate: dueDate,
    feePlan: student.fee_plan
  };
}

function calculateDueDate(planType, month) {
  const year = new Date(month).getFullYear();
  
  switch(planType) {
    case 'Monthly':
      // Due on 5th of each month
      return new Date(year, new Date(month).getMonth(), 5);
      
    case '6 Months':
      // Due on 5th of April and October
      const currentMonth = new Date(month).getMonth();
      if (currentMonth < 4) return new Date(year, 3, 5); // April
      if (currentMonth < 10) return new Date(year, 9, 5); // October
      return new Date(year + 1, 3, 5); // Next April
      
    case 'Yearly':
      // Due on 5th of April (start of academic year)
      if (new Date(month).getMonth() < 4) {
        return new Date(year, 3, 5);
      }
      return new Date(year + 1, 3, 5);
      
    default:
      return new Date(year, new Date(month).getMonth(), 5);
  }
}

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Academic year starts in April (month 3)
  if (month < 3) {
    return `${year - 1}-${year.toString().slice(2)}`;
  }
  return `${year}-${(year + 1).toString().slice(2)}`;
}
```

---

## 🧪 Testing Scenarios

### 1. Fee Structure Management
- [ ] Create fee structures for all programs
- [ ] Update existing fee structure
- [ ] Retrieve fee structures by year
- [ ] Bulk save multiple structures at once
- [ ] Handle duplicate entries (UPSERT)

### 2. Student Enrollment
- [ ] Create student with Monthly plan
- [ ] Create student with 6 Months plan
- [ ] Create student with Yearly plan
- [ ] Update student's fee plan
- [ ] Retrieve student with fee_plan field

### 3. Fee Generation
- [ ] Generate fee for Monthly plan student
- [ ] Generate fee for 6 Months plan student
- [ ] Generate fee for Yearly plan student
- [ ] Verify correct amount from fee structure
- [ ] Verify correct due date based on plan
- [ ] Handle missing fee structure gracefully

### 4. Fee Retrieval
- [ ] Get all fees with fee_plan field
- [ ] Filter fees by plan type
- [ ] Export fees with plan information

---

## 🚨 Error Handling

### Common Errors to Handle:

1. **Fee Structure Not Found**
```json
{
  "error": "Fee structure not configured for Junior KG - Yearly plan for 2025-26",
  "code": "FEE_STRUCTURE_NOT_FOUND"
}
```

2. **Invalid Plan Type**
```json
{
  "error": "Invalid fee plan. Must be: Monthly, 6 Months, or Yearly",
  "code": "INVALID_FEE_PLAN"
}
```

3. **Duplicate Fee Structure**
```json
{
  "error": "Fee structure already exists for this program, plan, and year",
  "code": "DUPLICATE_FEE_STRUCTURE"
}
```

---

## 📊 Sample Data for Testing

```sql
-- Insert sample fee structures
INSERT INTO fee_structures (program, plan_type, amount, discount_percentage, academic_year) VALUES
-- Playgroup
('Playgroup', 'Monthly', 5000, 0, '2025-26'),
('Playgroup', '6 Months', 28500, 5, '2025-26'),
('Playgroup', 'Yearly', 54000, 10, '2025-26'),

-- Nursery
('Nursery', 'Monthly', 5500, 0, '2025-26'),
('Nursery', '6 Months', 31350, 5, '2025-26'),
('Nursery', 'Yearly', 59400, 10, '2025-26'),

-- Junior KG
('Junior KG', 'Monthly', 6000, 0, '2025-26'),
('Junior KG', '6 Months', 34200, 5, '2025-26'),
('Junior KG', 'Yearly', 64800, 10, '2025-26'),

-- Senior KG
('Senior KG', 'Monthly', 6500, 0, '2025-26'),
('Senior KG', '6 Months', 37050, 5, '2025-26'),
('Senior KG', 'Yearly', 70200, 10, '2025-26');
```

---

## ✅ Checklist

### Database
- [ ] Create `fee_structures` table
- [ ] Add `fee_plan` column to `students` table
- [ ] Add `fee_plan` column to `fees` table
- [ ] Create indexes for performance
- [ ] Add constraints for data integrity
- [ ] Insert sample data for testing

### API Endpoints
- [ ] GET /api/fee-structures?year=:year
- [ ] POST /api/fee-structures/bulk
- [ ] PUT /api/fee-structures/:id
- [ ] DELETE /api/fee-structures/:id
- [ ] Update POST /api/students (accept fee_plan)
- [ ] Update PUT /api/students/:id (accept fee_plan)
- [ ] Update GET /api/students (return fee_plan)
- [ ] Update GET /api/fees (return fee_plan)
- [ ] Update POST /api/fees (use fee structure)

### Business Logic
- [ ] Fee calculation based on structure
- [ ] Due date calculation by plan type
- [ ] Academic year calculation
- [ ] UPSERT logic for fee structures
- [ ] Error handling for missing structures

### Testing
- [ ] Unit tests for fee calculation
- [ ] Integration tests for API endpoints
- [ ] Test all plan types (Monthly, 6 Months, Yearly)
- [ ] Test fee structure CRUD operations
- [ ] Test student enrollment with plans
- [ ] Test fee generation with structures

---

## 📞 Questions?

If you need clarification on any of these requirements, check:
1. `FEE_STRUCTURE_PROPOSAL.md` - Original design document
2. `FEE_STRUCTURE_INTEGRATION.md` - Integration details
3. `IMPLEMENTATION_SUMMARY.md` - Frontend implementation summary

---

**Priority**: High
**Estimated Effort**: 4-6 hours
**Dependencies**: None (all frontend work is complete)
**Status**: Ready for Implementation

---

**Created**: May 19, 2026
