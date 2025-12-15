import React, { useState, useEffect } from 'react';
import { InsuranceMode, Region, TaxInput, TaxResult, TaxPolicy } from './types';
import { calculateSalary, formatCurrency } from './utils/calculator';
import { POLICIES, TAX_BRACKETS_CURRENT, TAX_BRACKETS_JULY_2026 } from './constants';
import NumberInput from './components/NumberInput';
import { DetailRow } from './components/DetailRow';
import { Calculator, ShieldCheck, Wallet, Info } from 'lucide-react';

function App() {
  const [input, setInput] = useState<TaxInput>({
    grossSalary: 20000000, 
    otherNonTaxableAllowance: 0,
    insuranceMode: InsuranceMode.ON_GROSS,
    insuranceSalary: 5000000, 
    dependents: 0,
    region: Region.I
  });

  const [results, setResults] = useState<Record<string, TaxResult>>({});

  useEffect(() => {
    const newResults: Record<string, TaxResult> = {};
    POLICIES.forEach(policy => {
      newResults[policy.id] = calculateSalary(input, policy);
    });
    setResults(newResults);
  }, [input]);

  const handleModeChange = (mode: InsuranceMode) => {
    setInput(prev => ({ ...prev, insuranceMode: mode }));
  };

  const getRegionName = (r: Region) => {
    switch(r) {
      case Region.I: return "Vùng I (HN/HCM)";
      case Region.II: return "Vùng II";
      case Region.III: return "Vùng III";
      case Region.IV: return "Vùng IV";
      default: return "";
    }
  };

  const formatMillion = (val: number) => (val / 1000000);
  
  const formatRange = (min: number, max: number | null) => {
    if (min === 0 && max) return `Đến ${formatMillion(max)} tr`;
    if (max === null) return `Trên ${formatMillion(min)} tr`;
    return `${formatMillion(min)} tr - ${formatMillion(max)} tr`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Tính thu nhập 2026</h1>
          </div>
          <!-- <a 
            href="https://github.com/vietvudanh/vietnam-tax-2025" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors hidden sm:block"
          >
            Dựa trên bản gốc
          </a> -->
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls - Left Side (or Top on mobile) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet size={20} className="text-blue-500" />
                Thu nhập
              </h2>
              
              <NumberInput 
                label="Lương (Gross)" 
                value={input.grossSalary}
                onChange={(val) => setInput(prev => ({ ...prev, grossSalary: val }))}
                suffix="VND"
                className="mb-4"
              />

              <div className="mb-4">
                 <NumberInput 
                  label="PC khác (Không chịu thuế)" 
                  value={input.otherNonTaxableAllowance}
                  onChange={(val) => setInput(prev => ({ ...prev, otherNonTaxableAllowance: val }))}
                  suffix="VND"
                />
                 <p className="text-[10px] text-gray-500 mt-1">
                   Trang phục, điện thoại, công tác phí...
                </p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bảo hiểm</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                    <input 
                      type="radio" 
                      name="insuranceMode"
                      checked={input.insuranceMode === InsuranceMode.ON_GROSS}
                      onChange={() => handleModeChange(InsuranceMode.ON_GROSS)}
                      className="text-blue-600"
                    />
                    <span>Lương chính thức</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                    <input 
                      type="radio" 
                      name="insuranceMode"
                      checked={input.insuranceMode === InsuranceMode.FIXED_AMOUNT}
                      onChange={() => handleModeChange(InsuranceMode.FIXED_AMOUNT)}
                      className="text-blue-600"
                    />
                    <span>Mức cố định</span>
                  </label>
                </div>

                {input.insuranceMode === InsuranceMode.FIXED_AMOUNT && (
                  <div className="mt-2">
                    <NumberInput 
                      label="Mức đóng BHXH" 
                      value={input.insuranceSalary}
                      onChange={(val) => setInput(prev => ({ ...prev, insuranceSalary: val }))}
                      suffix="VND"
                    />
                    <p className="text-[10px] text-orange-600 mt-1">
                      * Vẫn chịu giới hạn trần
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mb-2">
                <NumberInput 
                  label="Người phụ thuộc" 
                  value={input.dependents}
                  onChange={(val) => setInput(prev => ({ ...prev, dependents: val }))}
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Vùng</label>
                  <select 
                    value={input.region}
                    onChange={(e) => setInput(prev => ({ ...prev, region: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {[Region.I, Region.II, Region.III, Region.IV].map(r => (
                      <option key={r} value={r}>{getRegionName(r)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results - Comparison Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POLICIES.map((policy, index) => {
                const result = results[policy.id];
                if (!result) return null;
                const isCurrent = index === 0;

                return (
                  <div key={policy.id} className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${isCurrent ? 'border-blue-200 shadow-md md:-mt-2 md:mb-2 bg-white z-10' : 'border-gray-100 bg-gray-50/50 opacity-90 hover:opacity-100 hover:bg-white hover:shadow-sm'}`}>
                    
                    {/* Header Card */}
                    <div className={`${isCurrent ? 'bg-blue-600' : 'bg-gray-700'} p-4 text-white text-center`}>
                      <h3 className="font-bold text-lg">{policy.name}</h3>
                      {policy.subLabel && <p className="text-xs opacity-80 mt-1">{policy.subLabel}</p>}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="text-xs uppercase opacity-70 font-semibold tracking-wider">Lương Net</div>
                        <div className="text-3xl font-bold mt-1 tracking-tight">
                           {formatCurrency(result.netSalary).replace('₫', '')}
                        </div>
                        <div className="text-xs opacity-70 mt-1">VND</div>
                      </div>
                    </div>

                    {/* Key Differences */}
                    <div className="px-4 py-3 bg-opacity-10 bg-gray-200 border-b border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                       <span>Giảm trừ bản thân:</span>
                       <span className="font-semibold text-gray-700">{formatCurrency(policy.personalDeduction)}</span>
                    </div>

                    {/* Detail Table */}
                    <div className="p-4 flex-1">
                      <DetailRow 
                         label="Lương Gross" 
                         value={result.grossSalary} 
                         highlight
                      />
                      {result.otherNonTaxableAllowance > 0 && (
                        <DetailRow 
                          label="Phụ cấp khác" 
                          value={result.otherNonTaxableAllowance}
                          subText="Không chịu thuế TNCN" 
                        />
                      )}
                      
                      <div className="my-3 border-t border-gray-100"></div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">BHXH (8%)</span>
                          <span className="text-red-600 font-medium">-{formatCurrency(result.socialInsurance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">BHYT (1.5%)</span>
                          <span className="text-red-600 font-medium">-{formatCurrency(result.healthInsurance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">BHTN (1%)</span>
                          <span className="text-red-600 font-medium">-{formatCurrency(result.unemploymentInsurance)}</span>
                        </div>
                      </div>

                      <div className="my-3 border-t border-gray-100"></div>

                      <DetailRow 
                        label="TN chịu thuế" 
                        value={result.assessableIncome} 
                        highlight
                      />
                      
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GT bản thân</span>
                          <span className="text-red-600">-{formatCurrency(result.personalDeduction)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GT phụ thuộc</span>
                          <span className="text-red-600">-{formatCurrency(result.dependentDeduction)}</span>
                        </div>
                      </div>

                      <div className="my-3 border-t border-gray-100"></div>

                      <DetailRow 
                        label="TN tính thuế" 
                        value={result.taxableIncome} 
                        highlight
                      />
                      <div className="mt-2 flex justify-between text-sm">
                          <span className="text-gray-600 font-semibold">Thuế TNCN</span>
                          <span className="text-red-600 font-bold">-{formatCurrency(result.taxAmount)}</span>
                      </div>
                    </div>
                    
                    {/* Footer Summary */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Tổng bảo hiểm</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(result.totalInsurance)}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Assumptions Note */}
            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
               <Info className="text-blue-600 shrink-0" size={20} />
               <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Ghi chú:</p>
                  <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li><strong>Hiện tại:</strong> Giảm trừ gia cảnh 11M (bản thân) / 4.4M (phụ thuộc). Biểu thuế 7 bậc.</li>
                    <li><strong>Từ 01/01/2026:</strong> Tăng giảm trừ gia cảnh lên <strong>15.5M</strong> (bản thân) và <strong>6.2M</strong> (phụ thuộc). Vẫn dùng biểu thuế hiện tại.</li>
                    <li><strong>Từ 01/07/2026:</strong> Áp dụng <strong>biểu thuế lũy tiến mới (5 bậc)</strong>. Giảm trừ gia cảnh giữ nguyên mức mới (15.5M/6.2M).</li>
                  </ul>
               </div>
            </div>

            {/* Combined Tax Bracket Comparison Table */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">
                So sánh biểu thuế lũy tiến từng phần
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                    <tr>
                      <th rowSpan={2} className="px-4 py-2 w-12 border-r border-gray-100 text-center">Bậc</th>
                      <th colSpan={2} className="px-4 py-2 text-center border-r border-gray-100 bg-gray-100/50">Hiện tại (7 bậc)</th>
                      <th colSpan={2} className="px-4 py-2 text-center bg-blue-50/50 text-blue-700">Mới (5 bậc) <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full normal-case">Từ 01/07/2026</span></th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-100 bg-gray-50">Thu nhập tính thuế</th>
                      <th className="px-4 py-2 border-r border-gray-100 bg-gray-50 text-right">Thuế suất</th>
                      <th className="px-4 py-2 bg-blue-50/30">Thu nhập tính thuế</th>
                      <th className="px-4 py-2 bg-blue-50/30 text-right">Thuế suất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const currentBracket = TAX_BRACKETS_CURRENT[i];
                      const newBracket = TAX_BRACKETS_JULY_2026[i];
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center font-medium text-gray-400 border-r border-gray-100">{i + 1}</td>
                          
                          {/* Current */}
                          <td className="px-4 py-3 text-gray-700">
                            {currentBracket ? formatRange(currentBracket.min, currentBracket.max) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 border-r border-gray-100">
                             {currentBracket ? `${currentBracket.rate * 100}%` : '-'}
                          </td>

                          {/* New */}
                          <td className="px-4 py-3 text-gray-700 bg-blue-50/10">
                            {newBracket ? formatRange(newBracket.min, newBracket.max) : <span className="text-gray-300 italic">Bỏ</span>}
                          </td>
                           <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/10">
                             {newBracket ? `${newBracket.rate * 100}%` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
