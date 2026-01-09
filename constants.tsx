
import { Article } from './types';

export const INITIAL_ARTICLES: Article[] = [
  // Prepared Articles (Roof Category)
  { id: 'k6', name: 'Kari 6 feet', unit: 'pcs', category: 'Roof' },
  { id: 'k55', name: 'Kari 5.5 Feet', unit: 'pcs', category: 'Roof' },
  { id: 'k5', name: 'Kari 5 Feet', unit: 'pcs', category: 'Roof' },
  { id: 'rt', name: 'Roof Tiles', unit: 'pcs', category: 'Roof' },
  { id: 'ex', name: 'Exaust', unit: 'pcs', category: 'Roof' },
  { id: 'kf', name: 'Khaprail Foot', unit: 'pcs', category: 'Roof' },
  { id: 'k6i', name: 'Khaprail 6 inch', unit: 'pcs', category: 'Roof' },
  
  // Floor Category
  { id: 'ft-12', name: 'Floor Tile 12x12', unit: 'pcs', category: 'Floor' },
  { id: 'ft-24', name: 'Floor Tile 24x24', unit: 'pcs', category: 'Floor' },
  { id: 'pc-blk', name: 'Paver Block', unit: 'pcs', category: 'Floor' },

  // Prepared Articles (Material/General Category)
  { id: 'st', name: 'Stove', unit: 'pcs', category: 'Material' },
  { id: 'pl', name: 'Piller', unit: 'pcs', category: 'Material' },
  { id: 'ps', name: 'Piller stand', unit: 'pcs', category: 'Material' },
  { id: 'j25', name: 'Jali 2.5x2.5', unit: 'pcs', category: 'Material' },
  { id: 'j225', name: 'Jali 2x2.5', unit: 'pcs', category: 'Material' },
  { id: 'j22', name: 'Jali 2x2', unit: 'pcs', category: 'Material' },
  { id: 'j152', name: 'Jali 1.5x2', unit: 'pcs', category: 'Material' },
  { id: 'j1515', name: 'Jali 1.5x1.5', unit: 'pcs', category: 'Material' },
  { id: 'j115', name: 'Jali 1x1.5', unit: 'pcs', category: 'Material' },
  { id: 'j1f', name: 'Jali 1 feet', unit: 'pcs', category: 'Material' },
  { id: 'j6i', name: 'Jali 6 inch', unit: 'pcs', category: 'Material' },
  { id: 'j4i', name: 'Jali 4 inch', unit: 'pcs', category: 'Material' },
  { id: 'mg', name: 'Mogha', unit: 'pcs', category: 'Material' },
  { id: 'nk', name: 'Naka', unit: 'pcs', category: 'Material' },

  // Imported Items (From other factories)
  { id: 'imp-gs', name: 'Gas Stove (Imported)', unit: 'pcs', category: 'Imported' },
  { id: 'imp-cp', name: 'Concrete Pipe (External)', unit: 'pcs', category: 'Imported' },
  { id: 'imp-bf', name: 'Brick Facade (Premium)', unit: 'pcs', category: 'Imported' },

  // Raw Materials for Purchases
  { id: 'cmt', name: 'Portland Cement', unit: 'bags', category: 'Material' },
  { id: 'snd', name: 'Fine Sand', unit: 'cum', category: 'Material' },
  { id: 'agg', name: 'Crushed Stone (Aggregates)', unit: 'cum', category: 'Material' },

  // Special "Other" Article
  { id: 'other', name: 'Other (Custom)', unit: 'pcs', category: 'Other' },
];

export const CATEGORIES = ['Roof', 'Floor', 'Material', 'Imported', 'Other'] as const;
