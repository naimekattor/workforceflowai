"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';

export default function VerifyEmail() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, '').split('');
    const newCode = [...code];
    pasted.forEach((digit, i) => { if (i < 4) newCode[i] = digit; });
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length < 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setIsVerifying(true);
    
    setTimeout(() => {
      if (fullCode === '1234' || fullCode.length === 4) {
        router.push('/onboarding');
      } else {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResend = () => {
    alert('Verification code sent!');
  };

  return (
    <div className="min-h-screen bg-[#f4f8fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/40 sm:rounded-xl sm:px-10 border border-slate-100">
          <div className="flex justify-center mb-6">
           <Image src={"/images/workforceflowailogo1.png"} alt='Revoostai logo' height={40} width={40}/>
          </div>
          
          <h2 className="text-center text-[28px] font-bold tracking-tight text-[#22d3ee] mb-2">
            Verify your email
          </h2>
          <p className="text-center text-[15px] text-slate-500 mb-8 font-medium">
            Enter the 4-digit code sent to your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-16 text-center text-2xl font-bold rounded-lg border-2 border-slate-200 bg-[#f4f6f8] text-slate-900 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/20 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="flex w-full justify-center rounded-lg bg-[#22d3ee] px-4 py-3 text-[15px] font-semibold text-white hover:bg-[#06b6d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-slate-500">
              Didn't receive the code?{' '}
              <button onClick={handleResend} className="font-medium text-[#22d3ee] hover:text-[#06b6d4] transition-colors">
                Resend
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/signup" className="text-[14px] text-slate-500 hover:text-slate-700 transition-colors">
              Use a different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}