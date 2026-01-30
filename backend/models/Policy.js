const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    employeeId: {
        type: String,
        required: true,
    },

    // Basic Details
    contactPerson: { type: String },
    agentName: { type: String },

    // Quotation Details
    quotation: {
        isGiven: { type: Boolean, default: false },
        isSent: { type: Boolean, default: false },
        insuredAmount: { type: Number },
        thirdPartyPremium: { type: Number }, // Third party
        odPremium: { type: Number }, // Insurance of Vehicle (Own Damage)
        netPremium: { type: Number }, // Insurance premium
        actualPaymentAmount: { type: Number },
        paymentGateway: { type: String },
        fromAccount: { type: String },
        toAccount: { type: String }
    },

    // Policy - Payment Analysis
    policyPaymentMode: { type: String, enum: ['Direct Link', 'GI', 'Other'], default: 'GI' },
    paymentDifference: { type: Number }, // Difference amount

    // Policy Issues (Final Details)
    policyIssueDate: { type: Date },
    insuranceCompany: { type: String },

    // Core Policy Fields (Backwards compatibility + Final Policy Details)
    policyNumber: { type: String },
    policyType: {
        type: String,
        default: 'Comprehensive',
        enum: ['Comprehensive', 'Third Party Liability', 'Zero Depreciation', 'Own Damage']
    },
    premiumAmount: { // This serves as the 'Insurance premium' in Policy Issues
        type: Number,
        required: true,
    },
    finalInsuredAmount: { type: Number }, // IDV in Policy Issues
    finalThirdPartyPremium: { type: Number },
    finalOdPremium: { type: Number },

    policyDuration: {
        type: String,
        default: '1 Year'
    },
    policyStartDate: { type: Date, default: Date.now },
    policyEndDate: { type: Date },

    coverageDetails: { type: String },

    // Entries (Outgoing Payments)
    paymentsOut: [{
        category: { type: String }, // 'Payment to Insurance Company', 'Payment to Direct Link'
        companyName: { type: String }, // Name of Insurance co / Agent
        amount: { type: Number },
        date: { type: Date },
        paymentLinkType: { type: String }, // 'Link', 'GI'
        paymentMode: { type: String }, // 'CC', 'Bank', 'Other'
        accountNumber: { type: String }
    }],

    // Receipts (Incoming Payments)
    receiptsIn: [{
        fromType: { type: String }, // 'Agent', 'Owner'
        paymentMode: { type: String }, // 'Cash', 'Credit', 'Bank'
        date: { type: Date },
        amount: { type: Number },
        bankAccountType: { type: String },
        bankAccountNumber: { type: String },
        creditDetails: { type: String }
    }]
}, {
    timestamps: true,
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
