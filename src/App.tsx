import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated revenue data - in a real app this would come from an API
const INITIAL_REVENUE = 47832.56;
const REVENUE_PER_SECOND = 0.23; // Simulated earnings rate

interface Transaction {
  id: string;
  amount: number;
  timestamp: Date;
  type: 'subscription' | 'one-time' | 'enterprise';
  description: string;
}

const generateRandomTransaction = (): Transaction => {
  const types: Array<'subscription' | 'one-time' | 'enterprise'> = ['subscription', 'one-time', 'enterprise'];
  const type = types[Math.floor(Math.random() * types.length)];
  const descriptions = {
    subscription: ['Pro Plan Renewal', 'Team License', 'Annual Subscription', 'Monthly Pro'],
    'one-time': ['API Credits', 'Export Package', 'Custom Report', 'Data Bundle'],
    enterprise: ['Enterprise Contract', 'Custom Integration', 'SLA Upgrade', 'Volume License']
  };
  const amounts = {
    subscription: [9.99, 19.99, 49.99, 99.99],
    'one-time': [4.99, 14.99, 29.99, 49.99],
    enterprise: [499.99, 999.99, 2499.99, 4999.99]
  };

  return {
    id: Math.random().toString(36).substring(7),
    amount: amounts[type][Math.floor(Math.random() * amounts[type].length)],
    timestamp: new Date(),
    type,
    description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)]
  };
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const duration = 500;
    const startTime = Date.now();
    const startValue = previousValue.current;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(startValue + (endValue - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = formatCurrency(displayValue);

  return (
    <div className="font-mono text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
      {formatted.split('').map((char, i) => (
        <span
          key={i}
          className={char === '$' ? 'text-emerald-400' : char === ',' || char === '.' ? 'text-emerald-600' : 'text-emerald-300'}
          style={{
            textShadow: char === '$' ? '0 0 30px rgba(52, 211, 153, 0.8), 0 0 60px rgba(52, 211, 153, 0.4)' :
                       char.match(/[0-9]/) ? '0 0 20px rgba(52, 211, 153, 0.5)' : 'none'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/50 border border-emerald-900/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm"
  >
    <div className="text-emerald-600 text-xs uppercase tracking-widest mb-1">{label}</div>
    <div className="text-emerald-300 font-mono text-lg sm:text-xl md:text-2xl">
      {value}{suffix}
    </div>
  </motion.div>
);

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const typeColors = {
    subscription: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/30',
    'one-time': 'text-amber-400 bg-amber-950/50 border-amber-800/30',
    enterprise: 'text-fuchsia-400 bg-fuchsia-950/50 border-fuchsia-800/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-emerald-900/30 gap-2 sm:gap-0"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        <span className={`text-xs px-2 py-1 rounded border ${typeColors[transaction.type]} font-mono uppercase whitespace-nowrap`}>
          {transaction.type}
        </span>
        <span className="text-gray-400 text-sm truncate max-w-[180px] sm:max-w-none">{transaction.description}</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
        <span className="text-gray-600 text-xs font-mono">
          {transaction.timestamp.toLocaleTimeString()}
        </span>
        <span className="text-emerald-400 font-mono font-bold">
          +{formatCurrency(transaction.amount)}
        </span>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [revenue, setRevenue] = useState(INITIAL_REVENUE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate continuous revenue growth
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setRevenue(prev => prev + REVENUE_PER_SECOND);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Simulate random transactions
  useEffect(() => {
    if (!isLive) return;

    const addTransaction = () => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
      setRevenue(prev => prev + newTransaction.amount);
    };

    // Add initial transactions
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addTransaction(), i * 200);
    }

    // Random transactions every 3-8 seconds
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        addTransaction();
        scheduleNext();
      }, delay);
    };

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, [isLive]);

  const todayRevenue = revenue * 0.032; // ~3.2% of total is "today"
  const monthRevenue = revenue * 0.41; // ~41% of total is "this month"
  const avgPerDay = monthRevenue / 30;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative flex flex-col">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(52, 211, 153, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(52, 211, 153, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[800px] h-[300px] sm:h-[500px] md:h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-emerald-900/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <span className="text-gray-950 font-bold text-sm sm:text-lg">F</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight">Felix Craft AI</h1>
                <p className="text-emerald-600 text-xs font-mono">REVENUE DASHBOARD</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-mono text-xs sm:text-sm transition-all ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                {isLive ? 'LIVE' : 'PAUSED'}
              </button>

              <div className="hidden sm:block text-xs text-gray-600 font-mono">
                PUBLIC ACCESS
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 w-full">
          {/* Hero revenue display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="text-emerald-700 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-4 font-mono">
              Total Revenue Earned
            </div>

            <div className="relative inline-block">
              {/* Glow behind the number */}
              <div className="absolute inset-0 blur-2xl bg-emerald-500/20 scale-150" />

              <AnimatedCounter value={revenue} />

              {/* Decorative lines */}
              <div className="absolute -left-4 sm:-left-8 top-1/2 w-2 sm:w-4 h-px bg-gradient-to-r from-transparent to-emerald-600" />
              <div className="absolute -right-4 sm:-right-8 top-1/2 w-2 sm:w-4 h-px bg-gradient-to-l from-transparent to-emerald-600" />
            </div>

            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-emerald-500">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs sm:text-sm font-mono"
              >
                ↗ +{formatCurrency(REVENUE_PER_SECOND)}/sec
              </motion.span>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            <StatCard label="Today" value={formatCurrency(todayRevenue)} />
            <StatCard label="This Month" value={formatCurrency(monthRevenue)} />
            <StatCard label="Avg / Day" value={formatCurrency(avgPerDay)} />
            <StatCard label="Growth" value="+34.7" suffix="%" />
          </div>

          {/* Transaction feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/30 border border-emerald-900/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-emerald-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
                Live Transactions
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                STREAMING
              </div>
            </div>

            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {transactions.map(tx => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </AnimatePresence>

              {transactions.length === 0 && (
                <div className="text-gray-600 text-center py-8 font-mono text-sm">
                  Waiting for transactions...
                </div>
              )}
            </div>
          </motion.div>

          {/* ASCII decoration */}
          <div className="mt-8 sm:mt-12 text-center text-emerald-900/50 font-mono text-[8px] sm:text-[10px] leading-tight hidden sm:block">
            <pre>{`
    ╔══════════════════════════════════════════════════════════════╗
    ║  ███████╗███████╗██╗     ██╗██╗  ██╗     █████╗ ██╗          ║
    ║  ██╔════╝██╔════╝██║     ██║╚██╗██╔╝    ██╔══██╗██║          ║
    ║  █████╗  █████╗  ██║     ██║ ╚███╔╝     ███████║██║          ║
    ║  ██╔══╝  ██╔══╝  ██║     ██║ ██╔██╗     ██╔══██║██║          ║
    ║  ██║     ███████╗███████╗██║██╔╝ ██╗    ██║  ██║██║          ║
    ║  ╚═╝     ╚══════╝╚══════╝╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝          ║
    ╚══════════════════════════════════════════════════════════════╝
            `}</pre>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-emerald-900/20 py-4 sm:py-6 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gray-600 text-xs font-mono">
              Requested by <a href="https://twitter.com/villainmonkey" className="text-gray-500 hover:text-emerald-500 transition-colors">@villainmonkey</a> · Built by <a href="https://twitter.com/clonkbot" className="text-gray-500 hover:text-emerald-500 transition-colors">@clonkbot</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
