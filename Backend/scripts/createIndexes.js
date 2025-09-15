// scripts/createIndexes.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Employee Collection Indexes
        await db.collection('employees').createIndex({ employeeId: 1 }, { unique: true });
        await db.collection('employees').createIndex({ email: 1 }, { unique: true });
        await db.collection('employees').createIndex({ department: 1 });
        await db.collection('employees').createIndex({ position: 1 });
        await db.collection('employees').createIndex({ isActive: 1 });
        await db.collection('employees').createIndex({ firstName: 'text', lastName: 'text', employeeId: 'text' });
        await db.collection('employees').createIndex({ department: 1, isActive: 1 });

        // Attendance Collection Indexes
        await db.collection('attendances').createIndex({ employee: 1, date: 1 }, { unique: true });
        await db.collection('attendances').createIndex({ date: 1 });
        await db.collection('attendances').createIndex({ status: 1 });
        await db.collection('attendances').createIndex({ employee: 1, date: -1 });
        await db.collection('attendances').createIndex({ date: 1, status: 1 });

        // Payroll Collection Indexes
        await db.collection('payrolls').createIndex({ employee: 1, month: 1, year: 1 }, { unique: true });
        await db.collection('payrolls').createIndex({ year: -1, month: -1 });
        await db.collection('payrolls').createIndex({ status: 1 });
        await db.collection('payrolls').createIndex({ employee: 1, year: -1, month: -1 });

        // Tasks Collection Indexes
        await db.collection('tasks').createIndex({ assignedTo: 1 });
        await db.collection('tasks').createIndex({ status: 1 });
        await db.collection('tasks').createIndex({ dueDate: 1 });
        await db.collection('tasks').createIndex({ assignedTo: 1, status: 1 });

        // Leaves Collection Indexes
        await db.collection('leaves').createIndex({ employeeId: 1 });
        await db.collection('leaves').createIndex({ status: 1 });
        await db.collection('leaves').createIndex({ startDate: 1, endDate: 1 });

        // Notifications Collection Indexes
        await db.collection('notifications').createIndex({ recipient: 1, read: 1 });
        await db.collection('notifications').createIndex({ createdAt: -1 });

        console.log('✅ All indexes created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
};

createIndexes();