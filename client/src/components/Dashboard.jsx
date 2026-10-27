{/* Add Transaction Form */}
        <form onSubmit={addTransaction} className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Description (e.g., Salary, Rent)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800 placeholder-gray-500"
              required
            />
            <input
              type="number"
              placeholder="Amount (e.g., 50000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800 placeholder-gray-500"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/60 border border-white/60 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-full text-gray-800"
            >
              <option value="Food">Food & Drinks</option>
              <option value="Rent">Rent & Bills</option>
              <option value="Salary">Salary</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-sky-500 text-white p-2 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-600 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Adding Transaction...' : 'Add Transaction'}
          </button>
        </form>
