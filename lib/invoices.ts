export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatPercent: number;
};

export type InvoiceRecord = {
  id: string;
  customer: string;
  attention: string;
  addressLines: string[];
  date: string;
  dueDate: string;
  reference: string;
  vatNumber: string;
  items: InvoiceItem[];
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateLineTotal = (item: InvoiceItem) => item.quantity * item.unitPrice;

export const calculateSubtotal = (items: InvoiceItem[]) =>
  items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

export const calculateVatTotal = (items: InvoiceItem[]) =>
  items.reduce((sum, item) => sum + calculateLineTotal(item) * (item.vatPercent / 100), 0);

export const calculateGrandTotal = (items: InvoiceItem[]) =>
  calculateSubtotal(items) + calculateVatTotal(items);

export const invoices: InvoiceRecord[] = [
  {
    id: 'INV-0001',
    customer: 'Sarah Johnson',
    attention: 'Accounts Dept',
    addressLines: ['145 Lofglade Way', 'Copertown', 'CP89 TN8'],
    date: 'Mar 2, 2026',
    dueDate: 'Mar 9, 2026',
    reference: 'Q-0001',
    vatNumber: 'GB123456789',
    items: [
      { description: 'Premium kitchen cabinets (custom fit)', quantity: 1, unitPrice: 3500, vatPercent: 20 },
      { description: 'Installation and fitting', quantity: 3, unitPrice: 450, vatPercent: 20 },
      { description: 'Integrated appliances package', quantity: 1, unitPrice: 2200, vatPercent: 20 },
    ],
  },
  {
    id: 'INV-0002',
    customer: 'Michael Turner',
    attention: 'Site Manager',
    addressLines: ['22 Orchard Lane', 'Bristol', 'BS1 4QJ'],
    date: 'Mar 5, 2026',
    dueDate: 'Mar 12, 2026',
    reference: 'Q-0002',
    vatNumber: 'GB987654321',
    items: [
      { description: 'Bathroom plumbing materials', quantity: 6, unitPrice: 120, vatPercent: 20 },
      { description: 'Labour for fitting and testing', quantity: 2, unitPrice: 380, vatPercent: 20 },
    ],
  },
  {
    id: 'INV-0003',
    customer: 'Olivia Green',
    attention: 'Finance Team',
    addressLines: ['8 River Court', 'Leeds', 'LS2 8HG'],
    date: 'Mar 9, 2026',
    dueDate: 'Mar 16, 2026',
    reference: 'Q-0003',
    vatNumber: 'GB456789123',
    items: [
      { description: 'Office repainting package', quantity: 1, unitPrice: 1800, vatPercent: 20 },
      { description: 'Protective floor covering', quantity: 2, unitPrice: 95, vatPercent: 20 },
      { description: 'Cleanup and disposal', quantity: 1, unitPrice: 220, vatPercent: 20 },
    ],
  },
  {
    id: 'INV-0004',
    customer: 'Daniel White',
    attention: 'Operations',
    addressLines: ['71 Abbey Road', 'Manchester', 'M4 1JP'],
    date: 'Mar 12, 2026',
    dueDate: 'Mar 19, 2026',
    reference: 'Q-0004',
    vatNumber: 'GB741852963',
    items: [
      { description: 'Electrical rewiring (ground floor)', quantity: 1, unitPrice: 2600, vatPercent: 20 },
      { description: 'Safety certification', quantity: 1, unitPrice: 390, vatPercent: 20 },
    ],
  },
];
