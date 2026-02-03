/**
 * ACCOUNTING - Бухгалтерия и налоговая отчётность
 * Формирование отчётов для ФНС, первичные документы, налоговый учёт
 * Интеграция с финансовой системой
 * Adaptive: 320px → 4K
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Download, Send, CheckCircle, Clock, AlertCircle,
  XCircle, Calendar, DollarSign, TrendingUp, TrendingDown,
  Filter, Search, Eye, Plus, Edit2, Trash2, X, Save,
  Calculator, Building2, FileCheck, FileX, FilePlus,
  Archive, Upload, Printer, Mail, Phone, MapPin,
  Receipt, CreditCard, Wallet, BarChart3, PieChart,
  Tag, User, Users, Package, ShoppingBag, Percent,
  BookOpen, ClipboardList, FileSpreadsheet, FolderOpen,
  Bell, RefreshCw, CheckSquare, Settings, Info,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
  Zap, Shield, Lock, Unlock, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== TYPES ====================

type ReportType = 
  | 'vat' // НДС
  | 'profit' // Налог на прибыль
  | 'usn' // УСН (Упрощенная система налогообложения)
  | 'income' // Декларация о доходах
  | 'insurance' // Страховые взносы
  | 'salary'; // Зарплата и НДФЛ

type ReportStatus = 'draft' | 'ready' | 'sent' | 'accepted' | 'rejected';
type DocumentType = 'invoice' | 'act' | 'receipt' | 'waybill' | 'contract';
type DocumentStatus = 'draft' | 'issued' | 'paid' | 'cancelled';
type TaxPeriod = 'month' | 'quarter' | 'year';
type TabType = 'reports' | 'documents' | 'ledger' | 'counterparties' | 'calendar';

interface TaxReport {
  id: number;
  type: ReportType;
  period: string;
  taxPeriod: TaxPeriod;
  status: ReportStatus;
  amount: number;
  taxAmount: number;
  deadline: string;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  fileName?: string;
  inn?: string;
  kpp?: string;
  oktmo?: string;
}

interface PrimaryDocument {
  id: number;
  type: DocumentType;
  number: string;
  date: string;
  counterparty: string;
  counterpartyINN: string;
  amount: number;
  vatAmount: number;
  vatRate: number;
  status: DocumentStatus;
  description: string;
  paymentDeadline?: string;
  paidAt?: string;
  attachments?: string[];
}

interface LedgerEntry {
  id: number;
  date: string;
  documentNumber: string;
  counterparty: string;
  operation: string;
  debit: string;
  credit: string;
  amount: number;
  description: string;
}

interface Counterparty {
  id: number;
  name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  address: string;
  phone?: string;
  email?: string;
  director: string;
  accountant?: string;
  bankName: string;
  bik: string;
  accountNumber: string;
  corrAccountNumber: string;
  type: 'customer' | 'supplier' | 'partner';
  totalReceived: number;
  totalPaid: number;
  balance: number;
  contractsCount: number;
  lastActivityDate: string;
  status: 'active' | 'blocked' | 'archived';
}

interface TaxCalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  type: ReportType;
  completed: boolean;
  amount?: number;
}

export function Accounting() {
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<PrimaryDocument | null>(null);
  const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ReportStatus>('all');
  const [filterType, setFilterType] = useState<'all' | ReportType>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | TaxPeriod>('all');
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);

  // ==================== MOCK DATA ====================

  const [taxReports] = useState<TaxReport[]>([
    {
      id: 1,
      type: 'vat',
      period: '2026-Q1',
      taxPeriod: 'quarter',
      status: 'accepted',
      amount: 5840000,
      taxAmount: 1051200,
      deadline: '2026-04-25',
      createdAt: '2026-04-15T10:30:00',
      sentAt: '2026-04-20T14:20:00',
      acceptedAt: '2026-04-22T09:15:00',
      fileName: 'VAT_Q1_2026.xml',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
    {
      id: 2,
      type: 'profit',
      period: '2026-01',
      taxPeriod: 'month',
      status: 'sent',
      amount: 2450000,
      taxAmount: 490000,
      deadline: '2026-02-28',
      createdAt: '2026-02-20T11:00:00',
      sentAt: '2026-02-25T16:45:00',
      fileName: 'PROFIT_JAN_2026.xml',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
    {
      id: 3,
      type: 'usn',
      period: '2025',
      taxPeriod: 'year',
      status: 'ready',
      amount: 18650000,
      taxAmount: 1119000,
      deadline: '2026-03-31',
      createdAt: '2026-03-10T09:00:00',
      fileName: 'USN_2025.xml',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
    {
      id: 4,
      type: 'insurance',
      period: '2026-01',
      taxPeriod: 'month',
      status: 'draft',
      amount: 850000,
      taxAmount: 255000,
      deadline: '2026-02-15',
      createdAt: '2026-02-05T14:30:00',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
    {
      id: 5,
      type: 'salary',
      period: '2026-01',
      taxPeriod: 'month',
      status: 'accepted',
      amount: 1250000,
      taxAmount: 162500,
      deadline: '2026-02-05',
      createdAt: '2026-01-31T16:00:00',
      sentAt: '2026-02-03T10:30:00',
      acceptedAt: '2026-02-04T15:20:00',
      fileName: 'SALARY_JAN_2026.xml',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
    {
      id: 6,
      type: 'vat',
      period: '2026-02',
      taxPeriod: 'month',
      status: 'rejected',
      amount: 1980000,
      taxAmount: 356400,
      deadline: '2026-03-25',
      createdAt: '2026-03-15T11:20:00',
      sentAt: '2026-03-20T13:45:00',
      fileName: 'VAT_FEB_2026.xml',
      inn: '7701234567',
      kpp: '770101001',
      oktmo: '45000000',
    },
  ]);

  const [primaryDocuments] = useState<PrimaryDocument[]>([
    {
      id: 1,
      type: 'invoice',
      number: 'СЧ-00245',
      date: '2026-02-01',
      counterparty: 'ООО "МузТех"',
      counterpartyINN: '7704567890',
      amount: 125000,
      vatAmount: 22500,
      vatRate: 18,
      status: 'paid',
      description: 'Подписка Premium - 245 пользователей',
      paymentDeadline: '2026-02-15',
      paidAt: '2026-02-10',
      attachments: ['invoice_245.pdf', 'act_245.pdf'],
    },
    {
      id: 2,
      type: 'act',
      number: 'АКТ-00123',
      date: '2026-01-31',
      counterparty: 'ИП Волков А.С.',
      counterpartyINN: '771234567890',
      amount: 65000,
      vatAmount: 11700,
      vatRate: 18,
      status: 'issued',
      description: 'Продвижение треков - январь 2026',
      paymentDeadline: '2026-02-14',
      attachments: ['act_123.pdf'],
    },
    {
      id: 3,
      type: 'receipt',
      number: 'КВ-00456',
      date: '2026-01-30',
      counterparty: 'АО "Русское Радио"',
      counterpartyINN: '7705123456',
      amount: 42000,
      vatAmount: 7560,
      vatRate: 18,
      status: 'paid',
      description: 'Партнерская программа - январь',
      paidAt: '2026-01-30',
      attachments: ['receipt_456.pdf'],
    },
    {
      id: 4,
      type: 'invoice',
      number: 'СЧ-00246',
      date: '2026-01-29',
      counterparty: 'ООО "Продакшн Студия"',
      counterpartyINN: '7706789012',
      amount: 180000,
      vatAmount: 32400,
      vatRate: 18,
      status: 'issued',
      description: 'Production 360 - Full Package',
      paymentDeadline: '2026-02-12',
      attachments: ['invoice_246.pdf'],
    },
    {
      id: 5,
      type: 'waybill',
      number: 'ТТН-00089',
      date: '2026-01-28',
      counterparty: 'ООО "Серверные решения"',
      counterpartyINN: '7707654321',
      amount: 45000,
      vatAmount: 8100,
      vatRate: 18,
      status: 'paid',
      description: 'Серверное оборудование',
      paidAt: '2026-01-28',
      attachments: ['waybill_089.pdf'],
    },
  ]);

  const [ledgerEntries] = useState<LedgerEntry[]>([
    {
      id: 1,
      date: '2026-02-01',
      documentNumber: 'СЧ-00245',
      counterparty: 'ООО "МузТех"',
      operation: 'Поступление от покупателя',
      debit: '51',
      credit: '62.01',
      amount: 125000,
      description: 'Оплата по счету СЧ-00245',
    },
    {
      id: 2,
      date: '2026-01-31',
      documentNumber: 'АКТ-00123',
      counterparty: 'ИП Волков А.С.',
      operation: 'Оказание услуг',
      debit: '62.01',
      credit: '90.01',
      amount: 65000,
      description: 'Выручка от оказания услуг',
    },
    {
      id: 3,
      date: '2026-01-31',
      documentNumber: 'АКТ-00123',
      counterparty: 'ИП Волков А.С.',
      operation: 'Начисление НДС',
      debit: '90.03',
      credit: '68.02',
      amount: 11700,
      description: 'НДС с выручки',
    },
    {
      id: 4,
      date: '2026-01-30',
      documentNumber: 'КВ-00456',
      counterparty: 'АО "Русское Радио"',
      operation: 'Поступление от покупателя',
      debit: '51',
      credit: '62.01',
      amount: 42000,
      description: 'Оплата партнерских услуг',
    },
    {
      id: 5,
      date: '2026-01-28',
      documentNumber: 'ТТН-00089',
      counterparty: 'ООО "Серверные решения"',
      operation: 'Оплата поставщику',
      debit: '60.01',
      credit: '51',
      amount: 45000,
      description: 'Оплата за серверное оборудование',
    },
  ]);

  const [counterparties] = useState<Counterparty[]>([
    {
      id: 1,
      name: 'ООО "МузТех"',
      inn: '7704567890',
      kpp: '770401001',
      ogrn: '1147746123456',
      address: '125167, г. Москва, ул. Примерная, д. 12',
      phone: '+7 (495) 123-45-67',
      email: 'info@muztech.ru',
      director: 'Петров Иван Сергеевич',
      accountant: 'Смирнова Мария Александровна',
      bankName: 'ПАО "Сбербанк"',
      bik: '044525225',
      accountNumber: '40702810400000123456',
      corrAccountNumber: '30101810400000000225',
      type: 'customer',
      totalReceived: 2450000,
      totalPaid: 0,
      balance: 125000,
      contractsCount: 5,
      lastActivityDate: '2026-02-01',
      status: 'active',
    },
    {
      id: 2,
      name: 'ИП Волков Алексей Сергеевич',
      inn: '771234567890',
      ogrn: '315774600012345',
      address: '115211, г. Москва, ул. Каширское ш., д. 45',
      phone: '+7 (916) 234-56-78',
      email: 'volkov@example.com',
      director: 'Волков Алексей Сергеевич',
      bankName: 'ПАО "Альфа-Банк"',
      bik: '044525593',
      accountNumber: '40802810100000234567',
      corrAccountNumber: '30101810200000000593',
      type: 'customer',
      totalReceived: 890000,
      totalPaid: 0,
      balance: 65000,
      contractsCount: 12,
      lastActivityDate: '2026-01-31',
      status: 'active',
    },
    {
      id: 3,
      name: 'АО "Русское Радио"',
      inn: '7705123456',
      kpp: '770501001',
      ogrn: '1037700123456',
      address: '119021, г. Москва, ул. Тимура Фрунзе, д. 11',
      phone: '+7 (495) 789-01-23',
      email: 'partners@rusradio.ru',
      director: 'Соколов Дмитрий Владимирович',
      accountant: 'Новикова Елена Петровна',
      bankName: 'ПАО "ВТБ"',
      bik: '044525187',
      accountNumber: '40702810300000345678',
      corrAccountNumber: '30101810700000000187',
      type: 'partner',
      totalReceived: 520000,
      totalPaid: 180000,
      balance: 42000,
      contractsCount: 3,
      lastActivityDate: '2026-01-30',
      status: 'active',
    },
    {
      id: 4,
      name: 'ООО "Серверные решения"',
      inn: '7707654321',
      kpp: '770701001',
      ogrn: '1157746654321',
      address: '121151, г. Москва, наб. Тараса Шевченко, д. 23А',
      phone: '+7 (495) 456-78-90',
      email: 'sales@servers.ru',
      director: 'Козлов Максим Андреевич',
      accountant: 'Морозова Ольга Викторовна',
      bankName: 'ПАО "Сбербанк"',
      bik: '044525225',
      accountNumber: '40702810500000456789',
      corrAccountNumber: '30101810400000000225',
      type: 'supplier',
      totalReceived: 0,
      totalPaid: 1250000,
      balance: -45000,
      contractsCount: 8,
      lastActivityDate: '2026-01-28',
      status: 'active',
    },
    {
      id: 5,
      name: 'ООО "Продакшн Студия"',
      inn: '7706789012',
      kpp: '770601001',
      ogrn: '1167746789012',
      address: '109544, г. Москва, ул. Рабочая, д. 84',
      phone: '+7 (499) 567-89-01',
      email: 'studio@production360.ru',
      director: 'Белов Сергей Николаевич',
      bankName: 'АО "Тинькофф Банк"',
      bik: '044525974',
      accountNumber: '40702810600000567890',
      corrAccountNumber: '30101810145250000974',
      type: 'customer',
      totalReceived: 1850000,
      totalPaid: 0,
      balance: 180000,
      contractsCount: 7,
      lastActivityDate: '2026-01-29',
      status: 'active',
    },
  ]);

  const [taxCalendar] = useState<TaxCalendarEvent[]>([
    {
      id: 1,
      title: 'НДС за 1 квартал 2026',
      description: 'Декларация по НДС',
      date: '2026-04-25',
      type: 'vat',
      completed: true,
      amount: 1051200,
    },
    {
      id: 2,
      title: 'Налог на прибыль за январь',
      description: 'Авансовый платеж',
      date: '2026-02-28',
      type: 'profit',
      completed: false,
      amount: 490000,
    },
    {
      id: 3,
      title: 'Страховые взносы',
      description: 'За январь 2026',
      date: '2026-02-15',
      type: 'insurance',
      completed: false,
      amount: 255000,
    },
    {
      id: 4,
      title: 'НДФЛ',
      description: 'Зарплата за январь',
      date: '2026-02-05',
      type: 'salary',
      completed: true,
      amount: 162500,
    },
    {
      id: 5,
      title: 'УСН за 2025 год',
      description: 'Годовая декларация',
      date: '2026-03-31',
      type: 'usn',
      completed: false,
      amount: 1119000,
    },
  ]);

  // ==================== CALCULATIONS ====================

  const totalTaxAmount = taxReports
    .filter(r => r.status === 'accepted' || r.status === 'sent')
    .reduce((sum, r) => sum + r.taxAmount, 0);

  const pendingTaxAmount = taxReports
    .filter(r => r.status === 'ready' || r.status === 'draft')
    .reduce((sum, r) => sum + r.taxAmount, 0);

  const totalDocumentsAmount = primaryDocuments
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalVATAmount = primaryDocuments
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + d.vatAmount, 0);

  const pendingPaymentsAmount = primaryDocuments
    .filter(d => d.status === 'issued')
    .reduce((sum, d) => sum + d.amount, 0);

  const upcomingDeadlines = taxCalendar
    .filter(e => !e.completed && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Filtering
  const filteredReports = taxReports.filter(report => {
    const matchesSearch = 
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.fileName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesPeriod = filterPeriod === 'all' || report.taxPeriod === filterPeriod;

    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });

  const filteredDocuments = primaryDocuments.filter(doc => 
    doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCounterparties = counterparties.filter(cp =>
    cp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cp.inn.includes(searchQuery) ||
    cp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleSendReport = (reportId: number) => {
    toast.loading('Отправка отчёта в ФНС...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Отчёт успешно отправлен в ФНС');
    }, 2000);
  };

  const handleDownloadReport = (report: TaxReport) => {
    toast.success(`Файл ${report.fileName} загружен`);
  };

  const handleExportData = () => {
    const csv = [
      ['ID', 'Тип', 'Период', 'Статус', 'Сумма', 'Налог', 'Срок'].join(','),
      ...filteredReports.map(r =>
        [
          r.id,
          getReportTypeLabel(r.type),
          r.period,
          getReportStatusLabel(r.status),
          r.amount,
          r.taxAmount,
          new Date(r.deadline).toLocaleDateString('ru-RU')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Данные экспортированы');
  };

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      vat: 'НДС',
      profit: 'Налог на прибыль',
      usn: 'УСН',
      income: 'Декларация о доходах',
      insurance: 'Страховые взносы',
      salary: 'Зарплата и НДФЛ',
    };
    return labels[type];
  };

  const getReportStatusConfig = (status: ReportStatus) => {
    const configs = {
      draft: { label: 'Черновик', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30', icon: Edit2 },
      ready: { label: 'Готов', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30', icon: CheckCircle },
      sent: { label: 'Отправлен', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30', icon: Send },
      accepted: { label: 'Принят', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', icon: CheckSquare },
      rejected: { label: 'Отклонён', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', icon: XCircle },
    };
    return configs[status];
  };

  const getReportStatusLabel = (status: ReportStatus): string => {
    return getReportStatusConfig(status).label;
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      invoice: 'Счёт',
      act: 'Акт',
      receipt: 'Квитанция',
      waybill: 'Накладная',
      contract: 'Договор',
    };
    return labels[type];
  };

  const getDocumentStatusConfig = (status: DocumentStatus) => {
    const configs = {
      draft: { label: 'Черновик', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30', icon: Edit2 },
      issued: { label: 'Выставлен', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30', icon: Clock },
      paid: { label: 'Оплачен', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', icon: CheckCircle },
      cancelled: { label: 'Отменён', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', icon: XCircle },
    };
    return configs[status];
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 xs:gap-4">
          <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 shrink-0">
            <Calculator className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
              Бухгалтерия
            </h1>
            <p className="text-xs xs:text-sm sm:text-base text-gray-400">
              Налоговая отчётность и документооборот
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 xs:gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 xs:gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-gradient-to-r from-blue-500 to-cyan-500
              hover:from-blue-600 hover:to-cyan-600
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95 shadow-lg"
          >
            <Download className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Экспорт</span>
          </button>
          <button
            onClick={() => setShowCreateReport(true)}
            className="flex items-center gap-1.5 xs:gap-2
              px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
              rounded-lg xs:rounded-xl
              bg-gradient-to-r from-green-500 to-emerald-500
              hover:from-green-600 hover:to-emerald-600
              text-white font-medium
              text-xs xs:text-sm sm:text-base
              transition-all active:scale-95 shadow-lg"
          >
            <Plus className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Создать отчёт</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
        {[
          {
            title: 'Уплачено налогов',
            value: `${(totalTaxAmount / 1000000).toFixed(2)}M ₽`,
            subtitle: 'За текущий период',
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500',
          },
          {
            title: 'К уплате',
            value: `${(pendingTaxAmount / 1000000).toFixed(2)}M ₽`,
            subtitle: 'Готово к отправке',
            icon: Clock,
            color: 'from-yellow-500 to-orange-500',
          },
          {
            title: 'Оплачено счетов',
            value: `${(totalDocumentsAmount / 1000000).toFixed(2)}M ₽`,
            subtitle: `НДС: ${(totalVATAmount / 1000).toFixed(0)}K ₽`,
            icon: FileCheck,
            color: 'from-blue-500 to-cyan-500',
          },
          {
            title: 'Ожидает оплаты',
            value: `${(pendingPaymentsAmount / 1000).toFixed(0)}K ₽`,
            subtitle: `Документов: ${primaryDocuments.filter(d => d.status === 'issued').length}`,
            icon: AlertCircle,
            color: 'from-red-500 to-pink-500',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5
                rounded-lg xs:rounded-xl sm:rounded-2xl
                border border-white/10
                p-3 xs:p-4 sm:p-5 md:p-6
                hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
                <div className={`p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl
                  bg-gradient-to-br ${stat.color} bg-opacity-20`}
                >
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm mb-0.5 xs:mb-1">
                {stat.title}
              </p>
              <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 xs:mb-2">
                {stat.value}
              </p>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                {stat.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* TABS */}
      <div className="flex gap-1 xs:gap-2 p-1 xs:p-1.5 rounded-lg xs:rounded-xl bg-white/5 overflow-x-auto">
        {[
          { id: 'reports', label: 'Налоговые отчёты', icon: FileText },
          { id: 'documents', label: 'Первичные документы', icon: Receipt },
          { id: 'ledger', label: 'Книга учёта', icon: BookOpen },
          { id: 'counterparties', label: 'Контрагенты', icon: Users },
          { id: 'calendar', label: 'Налоговый календарь', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 xs:gap-2
                px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3
                rounded-md xs:rounded-lg
                text-xs xs:text-sm sm:text-base font-medium
                transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-3 xs:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2
              w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'reports' ? 'Поиск по отчётам...' :
                activeTab === 'documents' ? 'Поиск по документам...' :
                activeTab === 'counterparties' ? 'Поиск по контрагентам...' :
                'Поиск...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full
                pl-10 xs:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3
                rounded-lg xs:rounded-xl
                backdrop-blur-md bg-white/5
                border border-white/10
                text-white placeholder-gray-400
                text-xs xs:text-sm sm:text-base
                focus:outline-none focus:border-blue-400/50 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          {activeTab === 'reports' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2
                px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3
                rounded-lg xs:rounded-xl
                backdrop-blur-md border
                text-xs xs:text-sm sm:text-base
                transition-all
                ${showFilters
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
            >
              <Filter className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Фильтры</span>
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {activeTab === 'reports' && (
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 xs:p-4 sm:p-5
                  rounded-lg xs:rounded-xl
                  backdrop-blur-md bg-white/5 border border-white/10
                  space-y-3 xs:space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Тип отчёта
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                          rounded-lg xs:rounded-xl
                          bg-white/5 border border-white/10
                          text-white text-xs xs:text-sm
                          focus:outline-none focus:border-blue-400/50 transition-colors"
                      >
                        <option value="all">Все типы</option>
                        <option value="vat">НДС</option>
                        <option value="profit">Налог на прибыль</option>
                        <option value="usn">УСН</option>
                        <option value="income">Доходы</option>
                        <option value="insurance">Страховые взносы</option>
                        <option value="salary">Зарплата и НДФЛ</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Статус
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                          rounded-lg xs:rounded-xl
                          bg-white/5 border border-white/10
                          text-white text-xs xs:text-sm
                          focus:outline-none focus:border-blue-400/50 transition-colors"
                      >
                        <option value="all">Все статусы</option>
                        <option value="draft">Черновик</option>
                        <option value="ready">Готов</option>
                        <option value="sent">Отправлен</option>
                        <option value="accepted">Принят</option>
                        <option value="rejected">Отклонён</option>
                      </select>
                    </div>

                    {/* Period Filter */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-1.5 xs:mb-2">
                        Период
                      </label>
                      <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value as any)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5
                          rounded-lg xs:rounded-xl
                          bg-white/5 border border-white/10
                          text-white text-xs xs:text-sm
                          focus:outline-none focus:border-blue-400/50 transition-colors"
                      >
                        <option value="all">Все периоды</option>
                        <option value="month">Месяц</option>
                        <option value="quarter">Квартал</option>
                        <option value="year">Год</option>
                      </select>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                      setFilterPeriod('all');
                      setSearchQuery('');
                      toast.success('Фильтры сброшены');
                    }}
                    className="w-full sm:w-auto
                      flex items-center justify-center gap-2
                      px-3 xs:px-4 py-2 xs:py-2.5
                      rounded-lg
                      bg-white/5 hover:bg-white/10
                      border border-white/10
                      text-xs xs:text-sm text-gray-400
                      transition-all"
                  >
                    <RefreshCw className="w-3 h-3 xs:w-4 xs:h-4" />
                    Сбросить фильтры
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* TAX REPORTS TAB */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5
            rounded-lg xs:rounded-xl sm:rounded-2xl
            border border-white/10
            overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-3 xs:p-4 sm:p-5 md:p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white">
                Налоговые отчёты
              </h2>
              <span className="text-xs xs:text-sm text-gray-400">
                Найдено: {filteredReports.length}
              </span>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="p-3 xs:p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
              {filteredReports.map((report, index) => {
                const statusConfig = getReportStatusConfig(report.status);
                const StatusIcon = statusConfig.icon;
                const isOverdue = new Date(report.deadline) < new Date() && report.status !== 'accepted';

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/5
                      rounded-lg xs:rounded-xl sm:rounded-2xl
                      border border-white/10
                      p-4 xs:p-5 sm:p-6
                      hover:border-blue-500/30 transition-all group"
                  >
                    {/* Report Header */}
                    <div className="flex items-start justify-between mb-3 xs:mb-4">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className={`p-2 xs:p-2.5 rounded-lg xs:rounded-xl
                          ${statusConfig.bg} border ${statusConfig.border}`}
                        >
                          <FileText className={`w-4 h-4 xs:w-5 xs:h-5 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm xs:text-base font-bold text-white">
                            {getReportTypeLabel(report.type)}
                          </h3>
                          <p className="text-[10px] xs:text-xs text-gray-400">
                            {report.period}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5
                        rounded-lg border text-[10px] xs:text-xs font-medium
                        ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Report Details */}
                    <div className="space-y-2 xs:space-y-3 mb-3 xs:mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs xs:text-sm text-gray-400">Налоговая база:</span>
                        <span className="text-xs xs:text-sm font-semibold text-white">
                          {(report.amount / 1000).toFixed(0)}K ₽
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs xs:text-sm text-gray-400">К уплате:</span>
                        <span className="text-sm xs:text-base font-bold text-green-400">
                          {(report.taxAmount / 1000).toFixed(0)}K ₽
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs xs:text-sm text-gray-400">Срок:</span>
                        <span className={`text-xs xs:text-sm font-medium
                          ${isOverdue ? 'text-red-400' : 'text-white'}`}
                        >
                          {new Date(report.deadline).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Report Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 flex items-center justify-center gap-1.5
                          px-3 py-2 rounded-lg
                          bg-white/5 hover:bg-white/10
                          text-xs xs:text-sm text-white
                          transition-all"
                      >
                        <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
                        <span>Просмотр</span>
                      </button>
                      {report.status === 'ready' && (
                        <button
                          onClick={() => handleSendReport(report.id)}
                          className="flex-1 flex items-center justify-center gap-1.5
                            px-3 py-2 rounded-lg
                            bg-gradient-to-r from-blue-500 to-cyan-500
                            hover:from-blue-600 hover:to-cyan-600
                            text-xs xs:text-sm text-white
                            transition-all"
                        >
                          <Send className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span>Отправить</span>
                        </button>
                      )}
                      {report.fileName && (
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-2 rounded-lg
                            bg-white/5 hover:bg-white/10
                            text-white transition-all"
                          title="Скачать"
                        >
                          <Download className="w-3 h-3 xs:w-4 xs:h-4" />
                        </button>
                      )}
                    </div>

                    {isOverdue && (
                      <div className="mt-3 flex items-center gap-2
                        px-3 py-2 rounded-lg
                        bg-red-500/10 border border-red-400/30">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-xs text-red-400">
                          Просрочен срок подачи
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* PRIMARY DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5
            rounded-lg xs:rounded-xl sm:rounded-2xl
            border border-white/10
            overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-3 xs:p-4 sm:p-5 md:p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white">
              Первичные документы
            </h2>
            <button
              onClick={() => setShowCreateDocument(true)}
              className="flex items-center gap-1.5 xs:gap-2
                px-3 xs:px-4 py-2 xs:py-2.5
                rounded-lg
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-600 hover:to-emerald-600
                text-white font-medium
                text-xs xs:text-sm
                transition-all active:scale-95"
            >
              <Plus className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="hidden sm:inline">Создать</span>
            </button>
          </div>

          {/* Documents List */}
          <div className="divide-y divide-white/10">
            {filteredDocuments.map((doc, index) => {
              const statusConfig = getDocumentStatusConfig(doc.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-3 xs:p-4 sm:p-5 md:p-6 hover:bg-white/5 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 xs:gap-4">
                    {/* Document Icon & Info */}
                    <div className="flex items-start gap-3 xs:gap-4 flex-1 min-w-0">
                      <div className={`p-2 xs:p-3 rounded-lg xs:rounded-xl shrink-0
                        ${statusConfig.bg} border ${statusConfig.border}`}
                      >
                        <Receipt className={`w-5 h-5 xs:w-6 xs:h-6 ${statusConfig.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm xs:text-base font-bold text-white">
                            {getDocumentTypeLabel(doc.type)} №{doc.number}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5
                            rounded-md border text-[10px] xs:text-xs font-medium
                            ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-xs xs:text-sm text-gray-400 mb-1">
                          {doc.counterparty} • ИНН {doc.counterpartyINN}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Document Amounts */}
                    <div className="flex items-center gap-4 xs:gap-6 lg:gap-8">
                      <div className="text-right">
                        <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5">Сумма</p>
                        <p className="text-sm xs:text-base sm:text-lg font-bold text-white">
                          {(doc.amount / 1000).toFixed(0)}K ₽
                        </p>
                        <p className="text-[10px] xs:text-xs text-gray-400">
                          НДС {doc.vatRate}%: {(doc.vatAmount / 1000).toFixed(1)}K
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5">Дата</p>
                        <p className="text-xs xs:text-sm font-medium text-white">
                          {new Date(doc.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                        {doc.paymentDeadline && !doc.paidAt && (
                          <p className="text-[10px] xs:text-xs text-yellow-400">
                            До {new Date(doc.paymentDeadline).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 xs:gap-2">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="p-2 rounded-lg
                            bg-white/5 hover:bg-white/10
                            text-gray-400 hover:text-white
                            transition-all"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                        </button>
                        <button
                          onClick={() => toast.success('Документ скачан')}
                          className="p-2 rounded-lg
                            bg-white/5 hover:bg-white/10
                            text-gray-400 hover:text-white
                            transition-all"
                          title="Скачать"
                        >
                          <Download className="w-4 h-4 xs:w-5 xs:h-5" />
                        </button>
                        <button
                          className="p-2 rounded-lg
                            bg-white/5 hover:bg-white/10
                            text-gray-400 hover:text-white
                            transition-all"
                          title="Печать"
                        >
                          <Printer className="w-4 h-4 xs:w-5 xs:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {doc.attachments && doc.attachments.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Приложения:</span>
                      {doc.attachments.map((file, idx) => (
                        <button
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1
                            rounded-md bg-white/5 hover:bg-white/10
                            text-[10px] xs:text-xs text-cyan-400
                            transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          {file}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5
            rounded-lg xs:rounded-xl sm:rounded-2xl
            border border-white/10
            overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-3 xs:p-4 sm:p-5 md:p-6 border-b border-white/10">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
              Книга доходов и расходов
            </h2>
            <p className="text-xs xs:text-sm text-gray-400">
              Бухгалтерские проводки
            </p>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-3 xs:gap-4
                px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-3
                bg-white/5 border-b border-white/10">
                <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400">Дата</div>
                <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400">Документ</div>
                <div className="col-span-2 text-xs sm:text-sm font-semibold text-gray-400">Контрагент</div>
                <div className="col-span-2 text-xs sm:text-sm font-semibold text-gray-400">Операция</div>
                <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400">Дебет</div>
                <div className="col-span-1 text-xs sm:text-sm font-semibold text-gray-400">Кредит</div>
                <div className="col-span-2 text-xs sm:text-sm font-semibold text-gray-400 text-right">Сумма</div>
                <div className="col-span-2 text-xs sm:text-sm font-semibold text-gray-400">Примечание</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/10">
                {ledgerEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-12 gap-3 xs:gap-4
                      px-3 xs:px-4 sm:px-5 md:px-6 py-3 xs:py-4
                      hover:bg-white/5 transition-all"
                  >
                    <div className="col-span-1 text-xs xs:text-sm text-white">
                      {new Date(entry.date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </div>
                    <div className="col-span-1 text-xs xs:text-sm text-cyan-400 font-medium">
                      {entry.documentNumber}
                    </div>
                    <div className="col-span-2 text-xs xs:text-sm text-white truncate">
                      {entry.counterparty}
                    </div>
                    <div className="col-span-2 text-xs xs:text-sm text-gray-300 truncate">
                      {entry.operation}
                    </div>
                    <div className="col-span-1">
                      <span className="inline-flex px-2 py-1 rounded-md
                        bg-green-500/10 border border-green-400/30
                        text-xs text-green-400 font-mono">
                        {entry.debit}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="inline-flex px-2 py-1 rounded-md
                        bg-red-500/10 border border-red-400/30
                        text-xs text-red-400 font-mono">
                        {entry.credit}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs xs:text-sm text-white font-bold text-right">
                      {entry.amount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="col-span-2 text-xs text-gray-400 truncate">
                      {entry.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* COUNTERPARTIES TAB */}
      {activeTab === 'counterparties' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 xs:space-y-5 sm:space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {filteredCounterparties.map((cp, index) => (
              <motion.div
                key={cp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5
                  rounded-lg xs:rounded-xl sm:rounded-2xl
                  border border-white/10
                  p-4 xs:p-5 sm:p-6
                  hover:border-blue-500/30 transition-all group cursor-pointer"
                onClick={() => setSelectedCounterparty(cp)}
              >
                {/* Counterparty Header */}
                <div className="flex items-start justify-between mb-3 xs:mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-3 rounded-xl shrink-0
                      ${cp.type === 'customer'
                        ? 'bg-green-500/10 border border-green-400/30'
                        : cp.type === 'supplier'
                        ? 'bg-red-500/10 border border-red-400/30'
                        : 'bg-blue-500/10 border border-blue-400/30'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 xs:w-6 xs:h-6
                        ${cp.type === 'customer'
                          ? 'text-green-400'
                          : cp.type === 'supplier'
                          ? 'text-red-400'
                          : 'text-blue-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm xs:text-base font-bold text-white mb-0.5 truncate">
                        {cp.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        ИНН {cp.inn} {cp.kpp && `• КПП ${cp.kpp}`}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 xs:px-2.5 py-1 xs:py-1.5
                    rounded-full text-[10px] xs:text-xs font-medium
                    ${cp.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-400/30'
                      : cp.status === 'blocked'
                      ? 'bg-red-500/10 text-red-400 border border-red-400/30'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-400/30'
                    }`}
                  >
                    {cp.status === 'active' ? 'Активен' : cp.status === 'blocked' ? 'Заблокирован' : 'Архив'}
                  </span>
                </div>

                {/* Counterparty Stats */}
                <div className="grid grid-cols-3 gap-2 xs:gap-3 mb-3 xs:mb-4">
                  <div className="p-2 xs:p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5">Получено</p>
                    <p className="text-xs xs:text-sm font-bold text-green-400">
                      {(cp.totalReceived / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                  <div className="p-2 xs:p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5">Оплачено</p>
                    <p className="text-xs xs:text-sm font-bold text-red-400">
                      {(cp.totalPaid / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                  <div className="p-2 xs:p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] xs:text-xs text-gray-400 mb-0.5">Баланс</p>
                    <p className={`text-xs xs:text-sm font-bold
                      ${cp.balance > 0 ? 'text-green-400' : cp.balance < 0 ? 'text-red-400' : 'text-gray-400'}`}
                    >
                      {(cp.balance / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                </div>

                {/* Counterparty Contact */}
                <div className="space-y-1.5 xs:space-y-2 mb-3 xs:mb-4">
                  {cp.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
                      <span className="truncate">{cp.phone}</span>
                    </div>
                  )}
                  {cp.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
                      <span className="truncate">{cp.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
                    <span className="truncate">{cp.address}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400">
                  <span>{cp.contractsCount} договоров</span>
                  <span>
                    {new Date(cp.lastActivityDate).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAX CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 xs:space-y-5 sm:space-y-6"
        >
          {/* Upcoming Deadlines */}
          <div className="backdrop-blur-xl bg-white/5
            rounded-lg xs:rounded-xl sm:rounded-2xl
            border border-white/10
            p-4 xs:p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
              <div>
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Ближайшие сроки
                </h2>
                <p className="text-xs xs:text-sm text-gray-400">
                  Важные налоговые даты
                </p>
              </div>
              <Bell className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-yellow-400" />
            </div>

            <div className="space-y-3 xs:space-y-4">
              {upcomingDeadlines.map((event, index) => {
                const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 7;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 xs:p-5 rounded-lg xs:rounded-xl
                      border transition-all
                      ${isUrgent
                        ? 'bg-red-500/10 border-red-400/30'
                        : 'bg-white/5 border-white/10'
                      }`}
                  >
                    <div className="flex items-start gap-3 xs:gap-4">
                      <div className={`p-3 rounded-lg shrink-0
                        ${isUrgent ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
                      >
                        <Calendar className={`w-5 h-5 xs:w-6 xs:h-6
                          ${isUrgent ? 'text-red-400' : 'text-blue-400'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm xs:text-base font-bold text-white">
                            {event.title}
                          </h3>
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-full
                              bg-red-500/20 border border-red-400/30
                              text-[10px] xs:text-xs text-red-400 font-semibold">
                              Срочно
                            </span>
                          )}
                        </div>
                        <p className="text-xs xs:text-sm text-gray-400 mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={`text-xs xs:text-sm font-medium
                              ${isUrgent ? 'text-red-400' : 'text-white'}`}
                            >
                              {new Date(event.date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {event.amount && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-xs xs:text-sm font-bold text-green-400">
                                {(event.amount / 1000).toFixed(0)}K ₽
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-2xl xs:text-3xl font-bold
                          ${isUrgent ? 'text-red-400' : 'text-blue-400'}`}
                        >
                          {daysUntil}
                        </p>
                        <p className="text-xs text-gray-400">
                          {daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* All Calendar Events */}
          <div className="backdrop-blur-xl bg-white/5
            rounded-lg xs:rounded-xl sm:rounded-2xl
            border border-white/10
            p-4 xs:p-5 sm:p-6">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">
              Все события налогового календаря
            </h2>

            <div className="space-y-2 xs:space-y-3">
              {taxCalendar.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4
                    rounded-lg hover:bg-white/5 transition-all group"
                >
                  <div className={`p-2 xs:p-2.5 rounded-lg
                    ${event.completed ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}
                  >
                    {event.completed ? (
                      <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-yellow-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs xs:text-sm font-semibold mb-0.5
                      ${event.completed ? 'text-gray-400 line-through' : 'text-white'}`}
                    >
                      {event.title}
                    </h4>
                    <p className="text-[10px] xs:text-xs text-gray-500">
                      {event.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs xs:text-sm font-medium text-white mb-0.5">
                      {new Date(event.date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                    {event.amount && (
                      <p className="text-[10px] xs:text-xs text-green-400 font-semibold">
                        {(event.amount / 1000).toFixed(0)}K ₽
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* REPORT DETAILS MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed
                inset-2 xs:inset-4 sm:inset-6 md:inset-8
                lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                lg:w-[90vw] lg:max-w-3xl
                max-h-[94vh] sm:max-h-[90vh]
                z-50"
            >
              <div className="h-full
                backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95
                rounded-xl sm:rounded-2xl
                border border-white/10 shadow-2xl
                flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between
                  p-4 xs:p-5 sm:p-6
                  border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1">
                      {getReportTypeLabel(selectedReport.type)}
                    </h2>
                    <p className="text-xs xs:text-sm text-gray-400">
                      Период: {selectedReport.period} • {selectedReport.fileName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                  {/* Report Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    <div className="p-4 xs:p-5 rounded-lg xs:rounded-xl bg-white/5">
                      <p className="text-xs xs:text-sm text-gray-400 mb-2">Налоговая база</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">
                        {selectedReport.amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div className="p-4 xs:p-5 rounded-lg xs:rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <p className="text-xs xs:text-sm text-green-400 mb-2">К уплате</p>
                      <p className="text-2xl xs:text-3xl font-bold text-green-400">
                        {selectedReport.taxAmount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3 xs:space-y-4">
                    <h3 className="text-sm xs:text-base font-semibold text-white">
                      Реквизиты организации
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-gray-400 mb-1">ИНН</p>
                        <p className="text-sm xs:text-base font-mono text-white">{selectedReport.inn}</p>
                      </div>
                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-gray-400 mb-1">КПП</p>
                        <p className="text-sm xs:text-base font-mono text-white">{selectedReport.kpp}</p>
                      </div>
                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-gray-400 mb-1">ОКТМО</p>
                        <p className="text-sm xs:text-base font-mono text-white">{selectedReport.oktmo}</p>
                      </div>
                      <div className="p-3 xs:p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-gray-400 mb-1">Срок подачи</p>
                        <p className="text-sm xs:text-base font-semibold text-white">
                          {new Date(selectedReport.deadline).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Report Status History */}
                  <div className="space-y-3 xs:space-y-4">
                    <h3 className="text-sm xs:text-base font-semibold text-white">
                      История статусов
                    </h3>
                    <div className="space-y-2 xs:space-y-3">
                      <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs xs:text-sm font-medium text-white">Создан</p>
                          <p className="text-[10px] xs:text-xs text-gray-400">
                            {new Date(selectedReport.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      {selectedReport.sentAt && (
                        <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                          <Send className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-xs xs:text-sm font-medium text-white">Отправлен</p>
                            <p className="text-[10px] xs:text-xs text-gray-400">
                              {new Date(selectedReport.sentAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedReport.acceptedAt && (
                        <div className="flex items-center gap-3 p-3 xs:p-4 rounded-lg bg-white/5">
                          <CheckSquare className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-xs xs:text-sm font-medium text-white">Принят ФНС</p>
                            <p className="text-[10px] xs:text-xs text-gray-400">
                              {new Date(selectedReport.acceptedAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 xs:p-5 sm:p-6
                  border-t border-white/10
                  shrink-0
                  flex flex-col sm:flex-row gap-2 xs:gap-3">
                  {selectedReport.status === 'ready' && (
                    <button
                      onClick={() => {
                        handleSendReport(selectedReport.id);
                        setSelectedReport(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2
                        px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                        rounded-lg xs:rounded-xl
                        bg-gradient-to-r from-blue-500 to-cyan-500
                        hover:from-blue-600 hover:to-cyan-600
                        text-white font-medium
                        text-xs xs:text-sm sm:text-base
                        transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Отправить в ФНС</span>
                    </button>
                  )}
                  {selectedReport.fileName && (
                    <button
                      onClick={() => {
                        handleDownloadReport(selectedReport);
                        setSelectedReport(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2
                        px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                        rounded-lg xs:rounded-xl
                        bg-white/10 hover:bg-white/20
                        text-white font-medium
                        text-xs xs:text-sm sm:text-base
                        transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>Скачать XML</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 flex items-center justify-center gap-2
                      px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5
                      rounded-lg xs:rounded-xl
                      bg-white/10 hover:bg-white/20
                      text-white font-medium
                      text-xs xs:text-sm sm:text-base
                      transition-all active:scale-95"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Закрыть</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE DOCUMENT MODAL */}
      <AnimatePresence>
        {showCreateDocument && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateDocument(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-2 xs:inset-4 sm:inset-6 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[90vw] lg:max-w-2xl max-h-[94vh] sm:max-h-[90vh] z-50"
            >
              <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1">Создать документ</h2>
                    <p className="text-xs xs:text-sm text-gray-400">Заполните данные для нового документа</p>
                  </div>
                  <button onClick={() => setShowCreateDocument(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Тип документа</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors">
                      <option value="invoice">Счёт на оплату</option>
                      <option value="act">Акт выполненных работ</option>
                      <option value="receipt">Квитанция</option>
                      <option value="waybill">Товарная накладная</option>
                      <option value="contract">Договор</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Номер документа</label>
                    <input type="text" placeholder="СЧ-00001" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Контрагент</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors">
                      <option value="">Выберите контрагента</option>
                      {counterparties.map(cp => (
                        <option key={cp.id} value={cp.id}>{cp.name} (ИНН {cp.inn})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Сумма без НДС (₽)</label>
                      <input type="number" placeholder="100000" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Ставка НДС (%)</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors">
                        <option value="0">0%</option>
                        <option value="10">10%</option>
                        <option value="18">18%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Описание услуг/товаров</label>
                    <textarea rows={3} placeholder="Описание оказанных услуг или поставленных товаров" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Дата документа</label>
                      <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Срок оплаты</label>
                      <input type="date" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs xs:text-sm text-blue-400 font-medium mb-1">Автоматический расчёт НДС</p>
                      <p className="text-xs text-gray-400">НДС и итоговая сумма будут рассчитаны автоматически при сохранении документа</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 xs:p-5 sm:p-6 border-t border-white/10 shrink-0 flex flex-col sm:flex-row gap-2 xs:gap-3">
                  <button onClick={() => { toast.success('Документ успешно создан'); setShowCreateDocument(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <Save className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Создать документ</span>
                  </button>
                  <button onClick={() => setShowCreateDocument(false)} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE REPORT MODAL */}
      <AnimatePresence>
        {showCreateReport && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateReport(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-2 xs:inset-4 sm:inset-6 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[90vw] lg:max-w-2xl max-h-[94vh] sm:max-h-[90vh] z-50">
              <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1">Создать налоговый отчёт</h2>
                    <p className="text-xs xs:text-sm text-gray-400">Подготовка отчётности для ФНС</p>
                  </div>
                  <button onClick={() => setShowCreateReport(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 xs:p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Тип отчёта</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors">
                      <option value="vat">НДС (налог на добавленную стоимость)</option>
                      <option value="profit">Налог на прибыль организаций</option>
                      <option value="usn">УСН (упрощённая система)</option>
                      <option value="income">Декларация о доходах</option>
                      <option value="insurance">Страховые взносы</option>
                      <option value="salary">Зарплата и НДФЛ</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Налоговый период</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors">
                        <option value="month">Месяц</option>
                        <option value="quarter">Квартал</option>
                        <option value="year">Год</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Период</label>
                      <input type="text" placeholder="2026-01" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Налоговая база (₽)</label>
                      <input type="number" placeholder="5000000" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-400 mb-2">Сумма налога (₽)</label>
                      <input type="number" placeholder="900000" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs xs:text-sm text-yellow-400 font-medium mb-1">XML файл будет сформирован автоматически</p>
                      <p className="text-xs text-gray-400">После создания отчёт будет сохранён как черновик</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 xs:p-5 sm:p-6 border-t border-white/10 shrink-0 flex flex-col sm:flex-row gap-2 xs:gap-3">
                  <button onClick={() => { toast.success('Налоговый отчёт создан как черновик'); setShowCreateReport(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <Save className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Создать отчёт</span>
                  </button>
                  <button onClick={() => setShowCreateReport(false)} className="flex-1 flex items-center justify-center gap-2 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs xs:text-sm sm:text-base transition-all active:scale-95">
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}
