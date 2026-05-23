# 🔧 Quick Fix: Student Creation Error

## The Problem
When you try to create a student, you get an error saying "Fee Structure Not Configured" for 2026-27 academic year.

## Why This Happened
- The system only has fee structures for 2025-26 academic year
- We're currently in May 2026, so the system needs 2026-27 fee structures
- Academic years run from April to March (April 2026 - March 2027 = 2026-27)

## ✅ SOLUTION: Add Fee Structures to Database

### Step 1: Go to Railway
1. Open: https://railway.app
2. Login to your account
3. Click on your **mr-littles-api** project
4. Click on your **PostgreSQL** database (not the API service)

### Step 2: Run the SQL Script
1. Click on the **"Query"** tab (or **"Data"** tab, then **"Query"**)
2. Copy this SQL and paste it into the query box:

```sql
INSERT INTO fee_structures (program, plan_type, amount, discount_percentage, academic_year) VALUES
-- Playgroup
('Playgroup', 'Monthly', 5000.00, 0, '2026-27'),
('Playgroup', '6 Months', 28500.00, 5, '2026-27'),
('Playgroup', 'Yearly', 54000.00, 10, '2026-27'),

-- Nursery
('Nursery', 'Monthly', 5500.00, 0, '2026-27'),
('Nursery', '6 Months', 31350.00, 5, '2026-27'),
('Nursery', 'Yearly', 59400.00, 10, '2026-27'),

-- Junior KG
('Junior KG', 'Monthly', 6000.00, 0, '2026-27'),
('Junior KG', '6 Months', 34200.00, 5, '2026-27'),
('Junior KG', 'Yearly', 64800.00, 10, '2026-27'),

-- Senior KG
('Senior KG', 'Monthly', 6500.00, 0, '2026-27'),
('Senior KG', '6 Months', 37050.00, 5, '2026-27'),
('Senior KG', 'Yearly', 70200.00, 10, '2026-27')
ON CONFLICT (program, plan_type, academic_year) DO NOTHING;
```

3. Click **"Run Query"** or **"Execute"**
4. You should see: **"12 rows inserted"** or similar success message

### Step 3: Test Student Creation
1. Go to your app: https://mr-littles.vercel.app
2. Login as owner
3. Go to Students → Add Student
4. Fill in the form:
   - Name: Test Student
   - Program: Playgroup (or any program)
   - Fee Plan: Monthly (or any plan)
   - Parent Name: Test Parent
   - Phone: 9876543210
   - Date of Birth: Select any date
5. Click "Add Student"
6. It should work now! ✅

## 📱 What You'll See Now
- If fee structure is missing: You'll get a clear error message telling you which program/plan needs configuration
- If everything is configured: Student will be created successfully with automatic fee record

## 🎯 Fee Structures Added
After running the SQL, you'll have fee structures for all combinations:

| Program | Monthly | 6 Months | Yearly |
|---------|---------|----------|--------|
| Playgroup | ₹5,000 | ₹28,500 | ₹54,000 |
| Nursery | ₹5,500 | ₹31,350 | ₹59,400 |
| Junior KG | ₹6,000 | ₹34,200 | ₹64,800 |
| Senior KG | ₹6,500 | ₹37,050 | ₹70,200 |

## 💡 Alternative: Use the UI
Instead of SQL, you can also add fee structures through the app:
1. Login as owner
2. Go to "Fee Structure Manager"
3. Click "Add Fee Structure"
4. Add each program/plan combination manually

But the SQL method is much faster! 🚀

## ❓ Need Help?
If you still see errors after running the SQL:
1. Check the Railway query result - did it say "12 rows inserted"?
2. Try refreshing your app page
3. Check the exact error message - it will tell you which program/plan is missing
4. You can verify by going to Fee Structure Manager and checking if 2026-27 structures are listed

---

**Note:** Every year in April, you'll need to add fee structures for the new academic year. You can adjust the amounts as needed.
