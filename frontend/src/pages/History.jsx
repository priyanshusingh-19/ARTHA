import React from "react";

function History() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
      <ul className="space-y-2">
        <li className="flex justify-between bg-gray-100 p-2 rounded">
          <span>Sample Expense</span>
          <span className="text-red-500">-₹100</span>
        </li>
      </ul>
    </div>
  );
}

export default History;
