import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { ShoppingBag, QrCode, Copy, Check, ShieldCheck, Plus, Trash2, Coins, User, AlertCircle, Sparkles } from 'lucide-react';

interface ShopOffer {
  id: number;
  item_id: number;
  name: string;
  price: number;
  count: number;
}

interface PixConfig {
  qr_code_url: string;
  pix_key: string;
}

export const ShopView: React.FC = () => {
  const { currentAccount, isStaff } = useServer();
  const [offers, setOffers] = useState<ShopOffer[]>([]);
  const [pix, setPix] = useState<PixConfig>({ qr_code_url: '', pix_key: 'marleyot@empresa.com' });
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Buy Modal state
  const [selectedOffer, setSelectedOffer] = useState<ShopOffer | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [buyLoading, setBuyLoading] = useState<boolean>(false);
  const [buyMessage, setBuyMessage] = useState<{ success: boolean; text: string } | null>(null);

  // GM Management States
  const [newItemId, setNewItemId] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemCount, setNewItemCount] = useState<string>('1');
  const [gmAccounts, setGmAccounts] = useState<any[]>([]);
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [coinAmount, setCoinAmount] = useState<string>('');
  const [coinMode, setCoinMode] = useState<'add' | 'sub' | 'set'>('add');
  const [gmMsg, setGmMsg] = useState<string | null>(null);
  const [newPixKey, setNewPixKey] = useState<string>('');
  const [newQrUrl, setNewQrUrl] = useState<string>('');

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const resOffers = await fetch('/api/shop/offers');
      const dataOffers = await resOffers.json();
      if (dataOffers.success) setOffers(dataOffers.offers);

      const resPix = await fetch('/api/shop/pix');
      const dataPix = await resPix.json();
      if (dataPix.success && dataPix.pix) {
        setPix(dataPix.pix);
        setNewPixKey(dataPix.pix.pix_key || '');
        setNewQrUrl(dataPix.pix.qr_code_url || '');
      }

      if (isStaff) {
        const resAccs = await fetch('/api/admin/accounts-coins');
        const dataAccs = await resAccs.json();
        if (dataAccs.success) setGmAccounts(dataAccs.accounts);
      }
    } catch (e) {
      console.warn('Failed to fetch shop data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [isStaff]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pix.pix_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleBuyItem = async () => {
    if (!currentAccount) {
      alert('Você precisa estar logado na sua conta para comprar itens.');
      return;
    }
    if (!selectedOffer || !selectedCharacter) {
      alert('Selecione um personagem para receber o item.');
      return;
    }

    try {
      setBuyLoading(true);
      setBuyMessage(null);
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccount.id,
          characterName: selectedCharacter,
          offerId: selectedOffer.id
        })
      });
      const data = await res.json();
      setBuyMessage({ success: data.success, text: data.message });
      if (data.success) {
        // Refresh account info if needed
      }
    } catch (e: any) {
      setBuyMessage({ success: false, text: e?.message || 'Erro ao processar compra.' });
    } finally {
      setBuyLoading(false);
    }
  };

  const handleGmAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemId || !newItemName || !newItemPrice) return;
    try {
      const res = await fetch('/api/shop/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          itemId: newItemId,
          name: newItemName,
          price: newItemPrice,
          count: newItemCount
        })
      });
      const data = await res.json();
      setGmMsg(data.message);
      if (data.success) {
        setNewItemId('');
        setNewItemName('');
        setNewItemPrice('');
        fetchShopData();
      }
    } catch (err: any) {
      setGmMsg(err?.message || 'Erro ao adicionar item.');
    }
  };

  const handleGmDeleteOffer = async (id: number) => {
    if (!confirm('Deseja realmente remover este item da loja?')) return;
    try {
      const res = await fetch('/api/shop/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const data = await res.json();
      setGmMsg(data.message);
      if (data.success) fetchShopData();
    } catch (err: any) {
      setGmMsg(err?.message || 'Erro ao remover item.');
    }
  };

  const handleGmAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId || !coinAmount) return;
    try {
      const res = await fetch('/api/admin/accounts-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: targetAccountId,
          amount: coinAmount,
          mode: coinMode
        })
      });
      const data = await res.json();
      setGmMsg(data.message);
      if (data.success) fetchShopData();
    } catch (err: any) {
      setGmMsg(err?.message || 'Erro ao ajustar pontos.');
    }
  };

  const handleGmUpdatePix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shop/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code_url: newQrUrl, pix_key: newPixKey })
      });
      const data = await res.json();
      setGmMsg(data.message);
      if (data.success) fetchShopData();
    } catch (err: any) {
      setGmMsg(err?.message || 'Erro ao atualizar PIX.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* TOP PIX & DONATION TABLE BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#14120e] border-2 border-[#8C6B1C]/50 rounded-2xl p-6 shadow-2xl">
        {/* PIX QR Code & Key */}
        <div className="bg-[#111111] border border-[#332a15] rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 text-[#C9A227] font-bold font-mono text-sm uppercase">
            <QrCode className="w-5 h-5 text-[#C9A227]" />
            Doação Instantânea PIX
          </div>
          <div className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-[#C9A227]/40 shadow-inner flex items-center justify-center overflow-hidden">
            <img 
              src={pix.qr_code_url || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126580014br.gov.bcb.pix..."} 
              alt="PIX QR Code" 
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.tibia.com/items/2157.gif'; }}
            />
          </div>
          <div className="w-full space-y-1.5">
            <div className="text-[11px] font-mono text-gray-400">Chave PIX (Copia e Cola):</div>
            <div className="flex items-center gap-2 bg-[#1a1710] border border-[#332a15] px-3 py-2 rounded-lg">
              <input 
                type="text" 
                readOnly 
                value={pix.pix_key || 'marleyot@empresa.com'} 
                className="bg-transparent text-xs font-mono text-gray-200 w-full outline-none select-all" 
              />
              <button 
                onClick={handleCopyPix}
                className="bg-[#C9A227] hover:bg-[#b58f1f] text-black p-1.5 rounded transition cursor-pointer"
                title="Copiar Chave PIX"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedKey && <span className="text-[10px] text-emerald-400 font-mono font-bold">Chave copiada com sucesso!</span>}
          </div>
        </div>

        {/* Donation Table & Bonus Multiplier */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#332a15] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#E0C068] text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Tabela de Doação & Multiplicadores
            </span>
            <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
              Marley Points (Sistema de Pontos)
            </h2>
            <p className="text-xs text-gray-300">
              Faça uma doação via PIX para apoiar o servidor MarleyOT 7.72 e receba Marley Points automaticamente para adquirir itens e vantagens exclusivas.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#17140f] border border-[#332a15] p-3 rounded-xl text-center">
              <div className="text-[11px] text-gray-400 font-mono">R$ 10,00</div>
              <div className="text-base font-bold text-[#C9A227] mt-1">10 Pontos</div>
              <div className="text-[9px] text-gray-500 font-mono mt-0.5">Base (1x)</div>
            </div>
            <div className="bg-[#17140f] border border-[#332a15] p-3 rounded-xl text-center">
              <div className="text-[11px] text-gray-400 font-mono">R$ 50,00</div>
              <div className="text-base font-bold text-[#C9A227] mt-1">50 Pontos</div>
              <div className="text-[9px] text-gray-500 font-mono mt-0.5">Base (1x)</div>
            </div>
            <div className="bg-gradient-to-b from-[#241e17] to-[#17140f] border-2 border-[#C9A227]/60 p-3 rounded-xl text-center relative shadow-lg">
              <span className="absolute -top-2.5 right-2 bg-[#C9A227] text-black text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded">BÔNUS 2x</span>
              <div className="text-[11px] text-gray-300 font-mono">R$ 100,00</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">200 Pontos</div>
              <div className="text-[9px] text-[#C9A227] font-mono mt-0.5">Multiplicador +1</div>
            </div>
            <div className="bg-gradient-to-b from-[#241e17] to-[#17140f] border-2 border-[#C9A227]/60 p-3 rounded-xl text-center relative shadow-lg">
              <span className="absolute -top-2.5 right-2 bg-[#C9A227] text-black text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded">BÔNUS 2x</span>
              <div className="text-[11px] text-gray-300 font-mono">R$ 200,00</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">400 Pontos</div>
              <div className="text-[9px] text-[#C9A227] font-mono mt-0.5">Multiplicador +1</div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 font-mono bg-[#17140f] p-3 rounded-lg border border-[#332a15] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>Após efetuar o PIX, envie o comprovante no Discord oficial para liberação imediata dos seus pontos.</span>
          </div>
        </div>
      </div>

      {/* GM MANAGEMENT PANEL (ONLY IF STAFF) */}
      {isStaff && (
        <div className="bg-[#1a150e] border-2 border-[#C9A227]/60 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#332a15] pb-4">
            <div className="flex items-center gap-2 text-[#C9A227] font-bold font-mono uppercase text-sm">
              <ShieldCheck className="w-5 h-5" /> Painel de Gerenciamento do GM (Marley Shop)
            </div>
            <span className="bg-[#C9A227]/20 text-[#E0C068] text-xs font-mono px-3 py-1 rounded-full font-bold">Modo Administrador</span>
          </div>

          {gmMsg && (
            <div className="bg-[#111] border border-[#C9A227]/40 text-[#E0C068] text-xs font-mono p-3 rounded-lg flex items-center justify-between">
              <span>{gmMsg}</span>
              <button onClick={() => setGmMsg(null)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Add Item to Shop */}
            <form onSubmit={handleGmAddOffer} className="bg-[#111111] border border-[#332a15] p-5 rounded-xl space-y-3">
              <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#C9A227]" /> Adicionar Item na Loja
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Item ID (Sprite):</label>
                  <input 
                    type="number" 
                    value={newItemId} 
                    onChange={e => setNewItemId(e.target.value)} 
                    placeholder="Ex: 2160 (Crystal Coin)" 
                    className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Nome do Item:</label>
                  <input 
                    type="text" 
                    value={newItemName} 
                    onChange={e => setNewItemName(e.target.value)} 
                    placeholder="Ex: 100 Crystal Coins" 
                    className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400">Preço (Pontos):</label>
                    <input 
                      type="number" 
                      value={newItemPrice} 
                      onChange={e => setNewItemPrice(e.target.value)} 
                      placeholder="Ex: 50" 
                      className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-gray-400">Quantidade:</label>
                    <input 
                      type="number" 
                      value={newItemCount} 
                      onChange={e => setNewItemCount(e.target.value)} 
                      placeholder="Ex: 1" 
                      className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono text-xs rounded-lg transition cursor-pointer">
                Cadastrar Oferta
              </button>
            </form>

            {/* 2. Adjust Account Points */}
            <form onSubmit={handleGmAdjustCoins} className="bg-[#111111] border border-[#332a15] p-5 rounded-xl space-y-3">
              <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#C9A227]" /> Dar / Remover Pontos
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Conta / Personagem:</label>
                  <select 
                    value={targetAccountId} 
                    onChange={e => setTargetAccountId(e.target.value)}
                    className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                    required
                  >
                    <option value="">Selecione a Conta / Personagem...</option>
                    {gmAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        Conta ID {acc.id} ({acc.coins || 0} pts) - Pgs: {acc.characters || 'Nenhum'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400">Modo:</label>
                    <select 
                      value={coinMode} 
                      onChange={e => setCoinMode(e.target.value as any)}
                      className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                    >
                      <option value="add">Adicionar (+)</option>
                      <option value="sub">Remover (-)</option>
                      <option value="set">Definir (=)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-gray-400">Quantidade:</label>
                    <input 
                      type="number" 
                      value={coinAmount} 
                      onChange={e => setCoinAmount(e.target.value)} 
                      placeholder="Ex: 100" 
                      className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono text-xs rounded-lg transition cursor-pointer">
                Atualizar Saldo da Conta
              </button>
            </form>

            {/* 3. Configure PIX */}
            <form onSubmit={handleGmUpdatePix} className="bg-[#111111] border border-[#332a15] p-5 rounded-xl space-y-3">
              <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#C9A227]" /> Configurar PIX
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-gray-400">Chave PIX:</label>
                  <input 
                    type="text" 
                    value={newPixKey} 
                    onChange={e => setNewPixKey(e.target.value)} 
                    placeholder="marleyot@empresa.com" 
                    className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-400">URL do QR Code (Imagem):</label>
                  <input 
                    type="text" 
                    value={newQrUrl} 
                    onChange={e => setNewQrUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full bg-[#17140f] border border-[#332a15] text-xs font-mono text-white p-2 rounded-lg outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono text-xs rounded-lg transition cursor-pointer">
                Salvar Configuração PIX
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHOP OFFERS CATALOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C9A227]" /> Catálogo de Itens Disponíveis
          </h3>
          <span className="text-xs font-mono text-gray-400">{offers.length} itens cadastrados</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 font-mono text-sm">Carregando itens da loja...</div>
        ) : offers.length === 0 ? (
          <div className="bg-[#111] border border-[#332a15] rounded-2xl p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-[#C9A227] mx-auto opacity-60" />
            <div className="text-white font-bold font-serif text-lg">Nenhum item à venda no momento</div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {isStaff ? 'Use o painel de administrador acima para cadastrar os primeiros itens na loja.' : 'Fique atento! Novas ofertas e itens lendários serão adicionados em breve.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map(offer => (
              <div key={offer.id} className="bg-[#111111] border border-[#332a15] rounded-2xl p-5 shadow-xl space-y-4 hover:border-[#C9A227] transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto bg-[#17140f] border border-[#332a15] rounded-xl flex items-center justify-center p-2 relative shadow-inner">
                    <img 
                      src={`https://images.tibia.com/items/${offer.item_id}.gif`} 
                      alt={offer.name} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.tibia.com/items/2160.gif'; }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono text-gray-300 px-1.5 py-0.5 rounded">
                      x{offer.count}
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-bold font-serif text-white truncate" title={offer.name}>{offer.name}</div>
                    <div className="text-xs font-mono text-[#E0C068] font-bold flex items-center justify-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-[#C9A227]" /> {offer.price} Marley Points
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222] flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (!currentAccount) {
                        alert('Você precisa fazer login na sua conta para comprar itens.');
                        return;
                      }
                      setSelectedOffer(offer);
                      setSelectedCharacter(currentAccount.characters?.[0]?.name || '');
                      setBuyMessage(null);
                    }}
                    className="w-full py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Comprar
                  </button>
                  {isStaff && (
                    <button 
                      onClick={() => handleGmDeleteOffer(offer.id)}
                      className="p-2 bg-red-900/40 hover:bg-red-900/70 text-red-300 rounded-lg transition cursor-pointer"
                      title="Remover Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUY CONFIRMATION MODAL */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14120e] border-2 border-[#C9A227] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#332a15] pb-4">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C9A227]" /> Confirmar Compra
              </h3>
              <button 
                onClick={() => { setSelectedOffer(null); setBuyMessage(null); }}
                className="text-gray-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {buyMessage ? (
              <div className={`p-4 rounded-xl border text-center space-y-3 ${buyMessage.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-red-950/40 border-red-500/50 text-red-300'}`}>
                <div className="font-bold font-serif text-base">{buyMessage.success ? 'Compra Realizada com Sucesso!' : 'Falha na Compra'}</div>
                <p className="text-xs font-mono">{buyMessage.text}</p>
                <button 
                  onClick={() => { setSelectedOffer(null); setBuyMessage(null); window.location.reload(); }}
                  className="px-4 py-2 bg-[#C9A227] text-black font-bold font-mono text-xs rounded-lg cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#332a15]">
                  <img src={`https://images.tibia.com/items/${selectedOffer.item_id}.gif`} alt="" className="w-12 h-12 object-contain" />
                  <div>
                    <div className="text-sm font-bold text-white">{selectedOffer.name} (x{selectedOffer.count})</div>
                    <div className="text-xs font-mono text-[#E0C068] font-bold">{selectedOffer.price} Marley Points</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-300 block">Enviar para qual personagem:</label>
                  <select 
                    value={selectedCharacter}
                    onChange={e => setSelectedCharacter(e.target.value)}
                    className="w-full bg-[#17140f] border border-[#332a15] text-sm font-mono text-white p-3 rounded-xl outline-none focus:border-[#C9A227]"
                  >
                    {currentAccount?.characters?.map(char => (
                      <option key={char.id} value={char.name}>{char.name} (Level {char.level})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400">O item será entregue automaticamente no depot do personagem selecionado.</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setSelectedOffer(null)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleBuyItem}
                    disabled={buyLoading}
                    className="px-6 py-2.5 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {buyLoading ? 'Processando...' : 'Confirmar Compra'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
