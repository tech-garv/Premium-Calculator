import React, { useState, useEffect } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [ripples, setRipples] = useState([]);

  // Sound effects simulation
  const playSound = (type) => {
    // In a real app, you'd use actual audio files
    console.log(`Playing ${type} sound`);
  };

  // Ripple effect for button clicks
  const createRipple = (e, buttonRef) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x, y, size,
      id: Date.now() + Math.random()
    };
    
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const inputNumber = (num) => {
    playSound('click');
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    playSound('click');
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    playSound('clear');
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation) => {
    playSound('operation');
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      // Add to history
      setHistory(prev => [...prev, `${currentValue} ${operation} ${inputValue} = ${newValue}`]);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    playSound('equals');
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      
      // Add to history
      setHistory(prev => [...prev, `${previousValue} ${operation} ${inputValue} = ${newValue}`]);
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clear();
      } else if (e.key === 'Backspace') {
        setDisplay(display.slice(0, -1) || '0');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation]);

  const Button = ({ onClick, className = '', children, variant = 'default', special = false }) => {
    const baseClasses = 'relative h-16 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl overflow-hidden backdrop-blur-sm';
    
    const variants = {
      default: `bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 text-white border border-gray-600/50 ${special ? 'hover:border-blue-400/50' : ''}`,
      operator: 'bg-gradient-to-br from-orange-500/90 to-pink-500/90 hover:from-orange-400/90 hover:to-pink-400/90 text-white border border-orange-400/50 hover:border-orange-300/50',
      equals: 'bg-gradient-to-br from-emerald-500/90 to-blue-500/90 hover:from-emerald-400/90 hover:to-blue-400/90 text-white border border-emerald-400/50 hover:border-emerald-300/50',
      clear: 'bg-gradient-to-br from-red-500/90 to-orange-500/90 hover:from-red-400/90 hover:to-orange-400/90 text-white border border-red-400/50 hover:border-red-300/50',
      function: 'bg-gradient-to-br from-purple-500/90 to-indigo-500/90 hover:from-purple-400/90 hover:to-indigo-400/90 text-white border border-purple-400/50 hover:border-purple-300/50'
    };

    const handleClick = (e) => {
      createRipple(e);
      onClick();
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${className} group`}
        onClick={handleClick}
      >
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          {children}
        </div>
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/20 rounded-full animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </button>
    );
  };

  const themes = {
    dark: 'from-purple-900 via-blue-900 to-indigo-900',
    neon: 'from-pink-900 via-purple-900 to-indigo-900',
    ocean: 'from-blue-900 via-teal-900 to-cyan-900',
    sunset: 'from-orange-900 via-red-900 to-pink-900'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[theme]} flex items-center justify-center p-4 relative overflow-hidden`}>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main calculator container */}
      <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/20 relative">
        
        {/* Header with theme switcher */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white/80 text-sm font-light">Premium Calc</h1>
          <div className="flex gap-2">
            {Object.keys(themes).map((themeName) => (
              <button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  theme === themeName ? 'border-white scale-125' : 'border-white/30'
                }`}
                style={{
                  background: themeName === 'dark' ? '#4c1d95' :
                             themeName === 'neon' ? '#be185d' :
                             themeName === 'ocean' ? '#0891b2' : '#ea580c'
                }}
              />
            ))}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="ml-2 text-white/60 hover:text-white transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        <div className="w-80 relative">
          {/* Display with enhanced styling */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl rounded-2xl p-6 mb-4 border border-gray-700/50 shadow-inner">
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-1 min-h-[20px] font-mono">
                {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
              </div>
              <div className="text-white text-4xl font-light overflow-hidden font-mono tracking-wider">
                {display.length > 10 ? parseFloat(display).toExponential(5) : display}
              </div>
            </div>
            
            {/* Display glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-sm -z-10"></div>
          </div>

          {/* Enhanced button grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button variant="clear" onClick={clear}>AC</Button>
            <Button variant="function" onClick={() => setDisplay(display.slice(0, -1) || '0')}>⌫</Button>
            <Button onClick={() => performOperation('÷')} variant="operator">÷</Button>
            <Button onClick={() => performOperation('×')} variant="operator">×</Button>

            {/* Row 2 */}
            <Button onClick={() => inputNumber(7)} special>7</Button>
            <Button onClick={() => inputNumber(8)} special>8</Button>
            <Button onClick={() => inputNumber(9)} special>9</Button>
            <Button onClick={() => performOperation('-')} variant="operator">−</Button>

            {/* Row 3 */}
            <Button onClick={() => inputNumber(4)} special>4</Button>
            <Button onClick={() => inputNumber(5)} special>5</Button>
            <Button onClick={() => inputNumber(6)} special>6</Button>
            <Button onClick={() => performOperation('+')} variant="operator">+</Button>

            {/* Row 4 */}
            <Button onClick={() => inputNumber(1)} special>1</Button>
            <Button onClick={() => inputNumber(2)} special>2</Button>
            <Button onClick={() => inputNumber(3)} special>3</Button>
            <Button onClick={handleEquals} variant="equals" className="row-span-2 text-2xl">
              =
            </Button>

            {/* Row 5 */}
            <Button onClick={() => inputNumber(0)} className="col-span-2" special>0</Button>
            <Button onClick={inputDecimal} special>•</Button>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="absolute top-0 left-full ml-4 w-64 bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/20 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-sm font-semibold">History</h3>
                <button 
                  onClick={() => setHistory([])}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {history.slice(-10).reverse().map((calc, index) => (
                  <div key={index} className="text-gray-300 text-xs font-mono bg-white/5 rounded p-2">
                    {calc}
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-gray-500 text-xs text-center py-4">No calculations yet</div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced branding */}
          <div className="text-center mt-4">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-xs font-semibold">
              ✨ Premium Calculator ✨
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Press keys for quick input • {theme.charAt(0).toUpperCase() + theme.slice(1)} theme
            </div>
          </div>
        </div>
      </div>

      {/* Ambient lighting effect */}
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}