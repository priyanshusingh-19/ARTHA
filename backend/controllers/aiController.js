// backend/controllers/aiController.js
// No longer importing OpenAI, as we're doing rule-based summary
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Helper function to format data for the summary generation
const formatFinancialData = (expenses, budgets) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    const categorizedExpenses = {};
    expenses.forEach(exp => {
        if (exp.amount > 0) {
            incomeTotal += exp.amount;
        } else {
            expenseTotal += Math.abs(exp.amount);
            const category = exp.category || 'Uncategorized';
            if (!categorizedExpenses[category]) {
                categorizedExpenses[category] = 0;
            }
            categorizedExpenses[category] += Math.abs(exp.amount);
        }
    });

    const sortedCategories = Object.entries(categorizedExpenses).sort(([,a], [,b]) => b - a);

    const summary = {
        incomeTotal,
        expenseTotal,
        netBalance: incomeTotal - expenseTotal,
        categorizedExpenses: sortedCategories,
        budgets: {}, // Map budgets by category for easy lookup
        budgetAdherence: {}, // Track spending vs budget
    };

    budgets.forEach(bgt => {
        summary.budgets[bgt.category.toLowerCase()] = bgt.amount;
    });

    // Calculate budget adherence
    for (const [category, spent] of sortedCategories) {
        const budgetAmount = summary.budgets[category.toLowerCase()];
        if (budgetAmount !== undefined) {
            if (spent > budgetAmount) {
                summary.budgetAdherence[category] = { status: 'over', difference: spent - budgetAmount, budget: budgetAmount, spent: spent };
            } else {
                summary.budgetAdherence[category] = { status: 'under', difference: budgetAmount - spent, budget: budgetAmount, spent: spent };
            }
        }
    }

    return summary;
};


// @desc    Get rule-based financial summary
// @route   GET /api/ai/summary
// @access  Private
const getFinancialSummary = async (req, res) => {
    const user = req.user._id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required for summary.' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        const expenses = await Expense.find({
            user,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).lean();

        const budgets = await Budget.find({
            user,
            month: parseInt(month),
            year: parseInt(year)
        }).lean();

        const summaryData = formatFinancialData(expenses, budgets);
        const { incomeTotal, expenseTotal, netBalance, categorizedExpenses, budgetAdherence } = summaryData;

        // --- Generate Summary Paragraph ---
        let summaryParagraph = `Your financial overview for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}: `;

        if (incomeTotal > 0) {
            summaryParagraph += `You earned a total of ₹${incomeTotal.toFixed(2)}. `;
        } else {
            summaryParagraph += `You had no recorded income. `;
        }

        if (expenseTotal > 0) {
            summaryParagraph += `Your total expenses were ₹${expenseTotal.toFixed(2)}. `;
        } else {
            summaryParagraph += `You had no recorded expenses. `;
        }

        summaryParagraph += `Your net balance is ₹${netBalance.toFixed(2)}. `;

        if (categorizedExpenses.length > 0) {
            const topCategories = categorizedExpenses.slice(0, 2); // Get top 2 spending categories
            if (topCategories.length === 1) {
                summaryParagraph += `Your highest spending was on ${topCategories[0][0]} (₹${topCategories[0][1].toFixed(2)}). `;
            } else if (topCategories.length > 1) {
                summaryParagraph += `Your top spending areas were ${topCategories[0][0]} (₹${topCategories[0][1].toFixed(2)}) and ${topCategories[1][0]} (₹${topCategories[1][1].toFixed(2)}). `;
            }
        }

        const overBudgetCategories = Object.keys(budgetAdherence).filter(cat => budgetAdherence[cat].status === 'over');
        const underBudgetCategories = Object.keys(budgetAdherence).filter(cat => budgetAdherence[cat].status === 'under');

        if (overBudgetCategories.length > 0) {
            summaryParagraph += `Be careful! You went over budget in ${overBudgetCategories.join(', ')}. `;
        }
        if (underBudgetCategories.length > 0) {
            summaryParagraph += `Great job! You stayed under budget in ${underBudgetCategories.join(', ')}. `;
        } else if (overBudgetCategories.length === 0 && Object.keys(budgetAdherence).length > 0) {
            summaryParagraph += `You managed to stay within all your set budgets. `;
        }

        if (expenses.length === 0 && budgets.length === 0) {
            summaryParagraph = `No financial activity or budgets recorded for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}. Start tracking your expenses and setting budgets to see your financial summary!`;
        } else if (expenses.length === 0 && budgets.length > 0) {
            summaryParagraph = `You set budgets for ${Object.keys(summaryData.budgets).length} categories this month, but no expenses were recorded. Start adding expenses to track your progress!`;
        }

        res.json({ summary: summaryParagraph });

    } catch (error) {
        console.error('Error generating rule-based summary:', error);
        res.status(500).json({ message: 'Failed to generate summary. Please try again.' });
    }
};

module.exports = { getFinancialSummary };