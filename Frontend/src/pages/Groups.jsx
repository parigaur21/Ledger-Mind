import { useState, useEffect } from 'react';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, ArrowLeft, Copy, UserPlus, CreditCard, Receipt, Download, ArrowRight
} from 'lucide-react';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Create / Join State
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  
  // Shared Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '', category: 'food' });
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupAPI.getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (id) => {
    try {
      setLoading(true);
      const res = await groupAPI.getGroupDetails(id);
      setActiveGroup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeGroup) {
      fetchGroups();
    }
  }, [activeGroup]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await groupAPI.createGroup(createForm);
      setGroups([res.data, ...groups]);
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    try {
      await groupAPI.joinGroup(joinCode);
      setJoinCode('');
      fetchGroups();
    } catch (err) {
      alert('Invalid invite code or already joined.');
    }
  };

  const handleAddSharedExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amount = parseFloat(expenseForm.amount);
      const perPerson = amount / activeGroup.group.members.length;
      
      const splits = activeGroup.group.members.map(m => ({
        user: m.user._id,
        amount: perPerson
      }));

      await groupAPI.addSharedExpense(activeGroup.group._id, {
        ...expenseForm,
        amount,
        splits
      });

      setShowExpenseModal(false);
      setExpenseForm({ amount: '', description: '', category: 'food' });
      fetchGroupDetails(activeGroup.group._id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(activeGroup.group.inviteCode);
    alert('Invite code copied to clipboard!');
  };

  const exportGroupToCSV = () => {
    if (!activeGroup || !activeGroup.expenses.length) return;
    
    let content = "LEDGERMIND GROUP REPORT\n";
    content += `Group: ${activeGroup.group.name}\n`;
    content += `Members: ${activeGroup.group.members.length}\n\n`;
    
    content += "--- EXPENSES ---\n";
    content += "Date,Paid By,Description,Amount\n";
    activeGroup.expenses.forEach(exp => {
      content += `${new Date(exp.date).toLocaleDateString('en-IN')},${exp.paidBy.name},"${exp.description}",${exp.amount}\n`;
    });
    
    content += "\n--- BALANCES ---\n";
    content += "Member,Net Balance\n";
    activeGroup.balances.forEach(b => {
      content += `${b.user.name},${b.netBalance}\n`;
    });
    
    if (activeGroup.settlements && activeGroup.settlements.length > 0) {
      content += "\n--- SETTLEMENT PLAN ---\n";
      content += "Who,Pays To,Amount\n";
      activeGroup.settlements.forEach(s => {
        content += `${s.from.name},${s.to.name},${s.amount}\n`;
      });
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LedgerMind_${activeGroup.group.name.replace(/\s+/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 loading-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 loading-skeleton" />)}
        </div>
      </div>
    );
  }

  // Active Group Details View
  if (activeGroup) {
    const { group, expenses, balances } = activeGroup;
    const myBalance = balances.find(b => b.user._id === user._id)?.netBalance || 0;

    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setActiveGroup(null)}
            className="p-2 rounded-xl border border-dark-600/50 text-dark-200 hover:text-white hover:bg-dark-700/50 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
            <p className="text-dark-300 text-sm mt-0.5">{group.members.length} members</p>
          </div>
          <div className="ml-auto flex gap-3">
            <button
              onClick={exportGroupToCSV}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dark-600/50 text-dark-200 hover:text-white hover:border-dark-400 hover:bg-dark-700/50 transition-all text-sm font-semibold"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-primary-500/20"
            >
              <Plus size={18} />
              Split a Bill
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center py-10">
              <p className="text-sm font-medium text-dark-300 uppercase tracking-widest mb-2">Your Group Balance</p>
              <h2 className={`text-4xl font-black tracking-tighter ${myBalance > 0 ? 'text-emerald-400' : myBalance < 0 ? 'text-danger' : 'text-white'}`}>
                {myBalance > 0 ? '+' : myBalance < 0 ? '-' : ''}₹{Math.abs(myBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-sm text-dark-400 mt-2">
                {myBalance > 0 ? 'You are owed this amount.' : myBalance < 0 ? 'You owe this amount.' : 'You are settled up!'}
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Group Expenses</h3>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <p className="text-dark-400 text-sm text-center py-6">No expenses added yet. Split your first bill!</p>
                ) : (
                  expenses.map(exp => (
                    <div key={exp._id} className="flex items-center justify-between p-4 rounded-xl border border-dark-600/30 hover:bg-dark-800/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-dark-900 font-bold">
                          <Receipt size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{exp.description}</p>
                          <p className="text-xs text-dark-300">Paid by {exp.paidBy.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold text-white tracking-tight">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-dark-400">{new Date(exp.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card-strong p-6 border-primary-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <UserPlus size={16} className="text-primary-400" />
                Invite Friends
              </h3>
              <p className="text-xs text-dark-300 mb-3">Share this invite code to let friends join this split group.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-dark-900 border border-dark-600/50 text-emerald-400 font-mono text-center tracking-widest font-bold">
                  {group.inviteCode}
                </code>
                <button onClick={copyInvite} className="p-2.5 rounded-lg gradient-primary text-white hover:opacity-90">
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Users size={16} className="text-primary-400" />
                Group Members
              </h3>
              <div className="space-y-3">
                {group.members.map((m) => {
                  const bal = balances.find(b => b.user._id === m.user._id)?.netBalance || 0;
                  return (
                    <div key={m.user._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                          {m.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{m.user._id === user._id ? 'You' : m.user.name}</span>
                      </div>
                      <span className={`text-xs font-bold tracking-wider ${bal > 0 ? 'text-emerald-400' : bal < 0 ? 'text-danger' : 'text-dark-400'}`}>
                        {bal > 0 ? '+' : bal < 0 ? '-' : ''}₹{Math.abs(bal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {activeGroup.settlements && activeGroup.settlements.length > 0 && (
              <div className="glass-card-strong p-6 border-emerald-500/20">
                <h3 className="text-base font-bold text-white mb-4">How to Settle Up</h3>
                <div className="space-y-3">
                  {activeGroup.settlements.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-600/30">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-danger">{s.from._id === user._id ? 'You' : s.from.name}</span>
                        <ArrowRight size={14} className="text-dark-400" />
                        <span className="text-sm font-semibold text-emerald-400">{s.to._id === user._id ? 'You' : s.to.name}</span>
                      </div>
                      <span className="text-sm font-bold text-white">₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
            <div className="relative w-full max-w-md glass-card-strong p-6 shadow-2xl animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6">Split a Bill</h2>
              <form onSubmit={handleAddSharedExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1.5">Total Bill Amount (₹)</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-dark-400 mt-2 text-center">Will be split equally among {group.members.length} members.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1.5">What was this for?</label>
                  <input
                    type="text" required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Dinner at Mama's"
                  />
                </div>
                <div className="flex gap-3 pt-2 mt-4">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white transition-all text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary-500/20">
                    {submitting ? 'Splicing...' : 'Split Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Group List View
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Groups & Sharing</h1>
          <p className="text-dark-300 text-sm mt-1">Split bills with roommates, friends, or trips effortlessly.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-dark-900 text-sm font-bold hover:opacity-90 shadow-lg"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>

      <div className="glass-card-strong p-6 mb-6">
        <form onSubmit={handleJoinGroup} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Enter invite code to join..." 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:border-primary-500 font-mono tracking-widest uppercase"
          />
          <button type="submit" className="px-6 py-2.5 rounded-xl border border-dark-400 text-white font-semibold hover:bg-dark-600/50 transition-all">
            Join Group
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map(group => (
          <div 
            key={group._id} 
            onClick={() => fetchGroupDetails(group._id)}
            className="glass-card p-6 cursor-pointer hover:border-primary-500/30 transition-all group-hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-primary-500/20">
              {group.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{group.name}</h3>
            <p className="text-xs text-dark-400 mb-4 truncate">{group.description || 'No description provided'}</p>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary-400" />
              <span className="text-sm font-medium text-dark-200">{group.members.length} Members</span>
            </div>
          </div>
        ))}
        {groups.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-dark-600/50 rounded-2xl">
            <Users size={40} className="mx-auto text-dark-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Groups Yet</h3>
            <p className="text-sm text-dark-300">Create a group or enter an invite code to get started splitting tabs.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {[
          { icon: Users, title: 'Trip Groups', desc: 'Create a dedicated ledger for your Miami vacation so everyone pays their fair share.' },
          { icon: CreditCard, title: 'Roommate Tabs', desc: 'Keep track of utilities, groceries, and wifi bills seamlessly month-to-month.' }
        ].map((feature, i) => (
          <div key={i} className="glass-card p-5 flex items-start gap-4 opacity-70 border-dark-600/30">
            <div className="p-2.5 rounded-xl bg-dark-700/50">
              <feature.icon size={20} className="text-primary-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
              <p className="text-xs text-dark-400 leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md glass-card-strong p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Create Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Group Name</label>
                <input
                  type="text" required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold"
                  placeholder="e.g. Miami Trip 🌴"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700/50 border border-dark-500/50 rounded-xl text-white focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Expenses for the bach trip"
                />
              </div>
              <div className="flex gap-3 pt-2 mt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-dark-500/50 text-dark-200 hover:text-white transition-all text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all text-sm shadow-lg shadow-primary-500/20">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
