#!/bin/bash
# 🧹 Clean Data Script - Quick Reset (macOS/Linux)

echo "================================"
echo "   InvoiceRWA Data Reset"
echo "================================"
echo ""

echo "⚠️  WARNING: This will delete ALL data except admin account!"
echo ""
read -p "Type 'YES' to continue: " confirm

if [ "$confirm" != "YES" ]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🧹 Cleaning database..."

cd Backend
source venv/bin/activate
python clear_data_except_admin.py

echo ""
echo "✅ Database cleaned!"
echo "🔐 Admin account: admin@invoicerwa.com / Admin123!"
echo ""
