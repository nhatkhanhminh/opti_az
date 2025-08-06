
  import React from 'react';
  import Image from 'next/image';
  import { Button } from '@/components/ui/button';
  import { Check, ChevronDown } from 'lucide-react';
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
  
  export type Token = {
    symbol: string;
    name: string;
    icon: string;
    address: string;
  };
  
type TokenSelectorProps = {
    selectedToken: Token;
    tokens: readonly Token[];
    onSelect: (token: Token) => void;
    className?: string;
  };

  const TokenSelector = ({ selectedToken, tokens, onSelect, className = '' }: TokenSelectorProps) => {
    const [open, setOpen] = React.useState(false)
    return (
      <Popover  open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 rounded-lg transition-all duration-200 ${className}`}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={selectedToken.icon}
                width={30}
                height={30}
                className="object-contain transition-all duration-200"
                alt={`${selectedToken.symbol} icon`}
              />
            </div>
            <span className="font-medium hidden lg:flex">{selectedToken.symbol}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <div className="flex flex-col">
            {tokens.map((token) => (
              <Button
              
                key={token.address}
                variant="ghost"
                className="flex items-center justify-between px-4 py-2 hover:bg-accent transition-colors duration-200"
                onClick={() => { onSelect(token); setOpen(false); }}
                
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-[24px] h-[24px]">
                    <Image
                      src={token.icon}
                      fill
                      className="object-contain"
                      alt={`${token.symbol} icon`}
                    />
                  </div>
                  <span>{token.symbol}</span>
                </div>
                {selectedToken.address === token.address && (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  export default TokenSelector;