'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFinanceStore, type Wallet, type Client, type Order, type OrderStatus } from '@/hooks/useFinanceStore';
import { getClients, getOrders, deleteClient, deleteOrder, settleOrdersAction } from '@/app/actions';
import { ClientModal } from '@/components/ClientModal';
import { OrderModal } from '@/components/OrderModal';
import { useToast } from '@/components/Toast';
import {
  Plus,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  Loader2,
  Filter,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  CheckCircle2,
  CircleDashed,
  PlayCircle,
  Banknote,
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialClients: Client[];
  initialOrders: Order[];
  initialWallets: Wallet[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof CircleDashed; color: string; bg: string }> = {
  pending: { label: 'Oczekujace', icon: CircleDashed, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  in_progress: { label: 'W trakcie', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  completed: { label: 'Wykonane', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  settled: { label: 'Rozliczone', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
};

export function ProjectsPageClient({ initialClients, initialOrders, initialWallets }: Props) {
  const { toast, confirm } = useToast();
  const { clients, setClients, orders, setOrders, setWallets, wallets } = useFinanceStore();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [settling, setSettling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    setWallets(initialWallets);
    setClients(initialClients);
    setOrders(initialOrders);
  }, [initialWallets, initialClients, initialOrders, setWallets, setClients, setOrders]);

  const refreshData = useCallback(async () => {
    const [clientsData, ordersData] = await Promise.all([getClients(), getOrders()]);
    setClients(clientsData.clients);
    setOrders(ordersData.orders);
  }, [setClients, setOrders]);

  // All unique tags across orders
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const o of orders) {
      for (const t of o.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }, [orders]);

  // Orders grouped by client
  const ordersByClient = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      const filtered =
        (statusFilter === 'all' || o.status === statusFilter) &&
        (!tagFilter || o.tags.includes(tagFilter));
      if (!filtered) continue;
      const existing = map.get(o.client_id);
      if (existing) {
        existing.push(o);
      } else {
        map.set(o.client_id, [o]);
      }
    }
    return map;
  }, [orders, statusFilter, tagFilter]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let total = 0;
    let settled = 0;
    let unsettled = 0;
    let orderCount = 0;

    for (const o of orders) {
      const created = new Date(o.created_at);
      if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
        orderCount++;
        total += o.amount;
        if (o.is_settled) {
          settled += o.amount;
        } else {
          unsettled += o.amount;
        }
      }
    }

    return { total, settled, unsettled, orderCount };
  }, [orders]);

  const handleClientModalClose = (didChange?: boolean) => {
    setIsClientModalOpen(false);
    setEditingClient(null);
    if (didChange) refreshData();
  };

  const handleOrderModalClose = (didChange?: boolean) => {
    setIsOrderModalOpen(false);
    setEditingOrder(null);
    setPreselectedClientId(null);
    if (didChange) refreshData();
  };

  const handleDeleteClient = async (client: Client) => {
    const clientOrders = ordersByClient.get(client.id);
    const msg = clientOrders && clientOrders.length > 0
      ? `Klient "${client.name}" ma ${clientOrders.length} zlecen. Usuniecie klienta usunie rowniez wszystkie zlecenia.`
      : `Czy na pewno chcesz usunac klienta "${client.name}"?`;

    const ok = await confirm({
      title: 'Usun klienta',
      description: msg,
      variant: 'danger',
      confirmLabel: 'Usun',
    });
    if (!ok) return;

    try {
      await deleteClient(client.id);
      toast('Klient usuniety', 'success');
      refreshData();
    } catch {
      toast('Blad przy usuwaniu', 'error');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    const ok = await confirm({
      title: 'Usun zlecenie',
      description: `Czy na pewno chcesz usunac zlecenie "${order.title}"?`,
      variant: 'danger',
      confirmLabel: 'Usun',
    });
    if (!ok) return;

    try {
      await deleteOrder(order.id);
      toast('Zlecenie usuniete', 'success');
      refreshData();
    } catch {
      toast('Blad przy usuwaniu', 'error');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleBatchSettle = async () => {
    if (selectedOrders.size === 0) return;
    const ids = Array.from(selectedOrders);
    const ordersToSettle = orders.filter(o => ids.includes(o.id) && !o.is_settled);

    if (ordersToSettle.length === 0) {
      toast('Wybrane zlecenia sa juz rozliczone', 'warning');
      return;
    }

    const withoutWallet = ordersToSettle.filter(o => !o.wallet_id);
    if (withoutWallet.length > 0) {
      toast(`${withoutWallet.length} zlecen nie ma przypisanego portfela`, 'warning');
    }

    const totalAmount = ordersToSettle.filter(o => o.wallet_id).reduce((sum, o) => sum + o.amount, 0);
    const ok = await confirm({
      title: 'Rozlicz zlecenia',
      description: `Rozliczyc ${ordersToSettle.filter(o => o.wallet_id).length} zlecen na laczna kwote ${totalAmount.toFixed(2)} PLN?`,
      confirmLabel: 'Rozlicz',
    });
    if (!ok) return;

    setSettling(true);
    try {
      const result = await settleOrdersAction(ids);
      toast(`Rozliczono ${result.settled} zlecen`, 'success');
      setSelectedOrders(new Set());
      refreshData();
    } catch {
      toast('Blad przy rozliczaniu', 'error');
    } finally {
      setSettling(false);
    }
  };

  const selectAllClientOrders = (clientId: string) => {
    const clientOrds = ordersByClient.get(clientId) || [];
    const unsettledIds = clientOrds.filter(o => !o.is_settled && o.wallet_id).map(o => o.id);
    setSelectedOrders(prev => {
      const next = new Set(prev);
      const allSelected = unsettledIds.every(id => next.has(id));
      if (allSelected) {
        for (const id of unsettledIds) next.delete(id);
      } else {
        for (const id of unsettledIds) next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      {/* Monthly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Zlecenia (ten miesiac)</div>
          <div className="text-2xl font-bold text-foreground">{monthlySummary.orderCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Laczna kwota</div>
          <div className="text-2xl font-bold text-foreground">{monthlySummary.total.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">PLN</span></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Rozliczone</div>
          <div className="text-2xl font-bold text-green-500">{monthlySummary.settled.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">PLN</span></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Do rozliczenia</div>
          <div className="text-2xl font-bold text-amber-500">{monthlySummary.unsettled.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">PLN</span></div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }}
          className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          Nowy klient
        </button>
        <button
          onClick={() => { setEditingOrder(null); setPreselectedClientId(null); setIsOrderModalOpen(true); }}
          disabled={clients.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Nowe zlecenie
        </button>

        {selectedOrders.size > 0 && (
          <button
            onClick={handleBatchSettle}
            disabled={settling}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {settling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
            Rozlicz ({selectedOrders.size})
          </button>
        )}

        <div className="flex-1" />

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none"
          >
            <option value="all">Wszystkie statusy</option>
            {Array.from(Object.entries(STATUS_CONFIG)).map(([value, cfg]) => (
              <option key={value} value={value}>{cfg.label}</option>
            ))}
          </select>
          {allTags.length > 0 && (
            <select
              value={tagFilter || ''}
              onChange={e => setTagFilter(e.target.value || null)}
              className="bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none"
            >
              <option value="">Wszystkie tagi</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Brak klientow</p>
          <p className="text-sm text-muted-foreground/70">Dodaj pierwszego klienta, zeby zaczac zarzadzac zleceniami</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => {
            const clientOrders = ordersByClient.get(client.id) || [];
            const allClientOrders = orders.filter(o => o.client_id === client.id);
            const isExpanded = expandedClientId === client.id;
            const unsettledAmount = allClientOrders.filter(o => !o.is_settled).reduce((s, o) => s + o.amount, 0);
            const activeCount = allClientOrders.filter(o => o.status !== 'settled').length;

            return (
              <div key={client.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Client header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedClientId(isExpanded ? null : client.id); } }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{client.name}</span>
                      {client.company_name && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {client.company_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                      <span>{activeCount} aktywnych</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {unsettledAmount > 0 && (
                      <div className="text-sm font-semibold text-amber-500">{unsettledAmount.toFixed(2)} PLN</div>
                    )}
                    <div className="text-xs text-muted-foreground">{allClientOrders.length} zlecen</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); setEditingClient(client); setIsClientModalOpen(true); }}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteClient(client); }}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded orders */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Quick actions for client */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                      <button
                        onClick={() => { setPreselectedClientId(client.id); setEditingOrder(null); setIsOrderModalOpen(true); }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Dodaj zlecenie
                      </button>
                      {clientOrders.some(o => !o.is_settled && o.wallet_id) && (
                        <button
                          onClick={() => selectAllClientOrders(client.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-md text-xs font-medium transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Zaznacz do rozliczenia
                        </button>
                      )}
                    </div>

                    {clientOrders.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        {statusFilter !== 'all' || tagFilter ? 'Brak zlecen z wybranymi filtrami' : 'Brak zlecen dla tego klienta'}
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {clientOrders.map(order => {
                          const statusCfg = STATUS_CONFIG[order.status];
                          const StatusIcon = statusCfg.icon;
                          const isSelected = selectedOrders.has(order.id);

                          return (
                            <div
                              key={order.id}
                              className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                            >
                              {/* Checkbox for settlement */}
                              {!order.is_settled && order.wallet_id && (
                                <button
                                  onClick={() => toggleOrderSelection(order.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              )}
                              {(order.is_settled || !order.wallet_id) && <div className="w-5 shrink-0" />}

                              {/* Status icon */}
                              <div className={`p-1.5 rounded-md ${statusCfg.bg}`}>
                                <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
                              </div>

                              {/* Order info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-foreground truncate">{order.title}</span>
                                  {order.tags.map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span className={statusCfg.color}>{statusCfg.label}</span>
                                  {order.billing_type === 'hourly' && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                      <Clock className="w-3 h-3" />
                                      {order.tracked_hours.toFixed(1)}h x {order.hourly_rate} PLN/h
                                    </span>
                                  )}
                                  {order.completion_date && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(order.completion_date), 'd MMM yyyy', { locale: pl })}
                                    </span>
                                  )}
                                  {order.walletName && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {order.walletName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="text-right shrink-0">
                                <span className={`font-semibold text-sm ${order.is_settled ? 'text-green-500' : 'text-foreground'}`}>
                                  {order.amount.toFixed(2)} PLN
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  onClick={() => { setEditingOrder(order); setIsOrderModalOpen(true); }}
                                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleClientModalClose}
        editingClient={editingClient}
      />
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={handleOrderModalClose}
        editingOrder={editingOrder}
        preselectedClientId={preselectedClientId}
      />
    </>
  );
}
