import { useState, useRef } from 'react';

export default function StepperInput() {
  const [unit, setUnit] = useState('%');
  const [value, setValue] = useState('1.0');
  const [lastValidValue, setLastValidValue] = useState('1.0');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    //Nếu input chứa dấu phẩy -> Thay thế thành dấu chấm
    if (newValue.includes(',')) {
      newValue = newValue.replace(',', '.');
    }
    
    //Nếu input chứa các kí tự khác giá trị số phù hợp => tự động loại bỏ các giá trị:
    if (/[^\d.-]/.test(newValue)) {
      //a123 -> Nhận giá trị đúng gần nhất
      if (/^[^\d.-]+/.test(newValue)) {
        const numbers = newValue.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          newValue = numbers[0];
        } else {
          newValue = '0';
        }
      } else {
        //123a -> 123, 12a3 -> 12
        let validPart = '';
        for (let i = 0; i < newValue.length; i++) {
          if (/[\d.-]/.test(newValue[i])) {
            validPart += newValue[i];
          } else {
            break;
          }
        }
        newValue = validPart;
      }
    }
    
    setValue(newValue);
  };

  //Lưu lại giá trị hợp lệ cuối cùng
  const handleFocus = () => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && (unit !== '%' || numValue <= 100)) {
      setLastValidValue(value);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(value) || 0;
    
    // User nhập < 0 và out focus sẽ tự động nhảy về 0
    if (numValue < 0) {
      setValue('0');
      return;
    }

    // Nếu Unit là %, User nhập > 100 và out focus sẽ tự động nhảy về giá trị hợp lệ trước khi nhập
    if (unit === '%' && numValue > 100) {
      setValue(lastValidValue);
      return;
    }

    if (value !== '') {
      setValue(numValue.toString());
      setLastValidValue(numValue.toString());
    }
  };

  const handleStep = (direction: number) => {
    const currentValue = parseFloat(value) || 0;
    let newValue = currentValue + (direction * 1);
    
    if (newValue < 0) newValue = 0;

    if (unit === '%' && newValue > 100) newValue = 100;
    
    const newValueString = newValue.toString();
    setValue(newValueString);
    setLastValidValue(newValueString);
  };

  const handleUnitChange = (newUnit: string) => {
    if (newUnit === unit) return;
    
    setUnit(newUnit);
    
    //Nếu switch từ px sang % và giá trị hiện tại lớn hơn 100 => Update về 100
    if (newUnit === '%') {
      const numValue = parseFloat(value) || 0;
      if (numValue > 100) {
        setValue('100');
        setLastValidValue('100');
      }
    }
  };

  //Nếu giá trị trong ô input hiện tại là 0 => Disable button “-”
  const isDecrementDisabled = parseFloat(value) <= 0;
  
  //Nếu Unit là %, Nếu giá trị trong ô input hiện tại là 100 => Disable button “+”
  const isIncrementDisabled = unit === '%' && parseFloat(value) >= 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <div className="text-sm mr-4 w-24">Unit</div>
          <div className="flex h-8 w-36">
            <button 
              className={`flex-1 h-full rounded-l-md ${unit === '%' ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'}`} 
              onClick={() => handleUnitChange('%')}
            >
              %
            </button>
            <button 
              className={`flex-1 h-full rounded-r-md ${unit === 'px' ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'}`}
              onClick={() => handleUnitChange('px')}
            >
              px
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-sm mr-4 w-24">Value</div>
          <div className="flex items-center w-36 group">
            <button 
              className={`w-9 px-2 py-1 relative bg-gray-900 rounded-l-md hover:bg-gray-700 disabled:pointer-events-none`}
              onClick={() => !isDecrementDisabled && handleStep(-1)}
              disabled={isDecrementDisabled}
            > 
              <p className={isDecrementDisabled ? 'opacity-30' : ''}>-</p>
              {isDecrementDisabled && (
                <div className="text-xs tooltip-decrement">Value must greater than 0</div>
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              className="bg-gray-900 hover:bg-gray-700 text-center outline-none py-1 w-full" 
              value={value}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <button 
              className={`w-9 px-2 py-1 relative bg-gray-900 rounded-r-md hover:bg-gray-700 disabled:text-opacity-20 disabled:pointer-events-none`}
              onClick={() => !isIncrementDisabled && handleStep(1)}
              disabled={isIncrementDisabled}
            >
              <p className={isIncrementDisabled ? 'opacity-30' : ''}>+</p>
              {isIncrementDisabled && (
                <p className="text-xs tooltip-increment">Value must smaller than 100</p>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}