import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Users,
  RefreshCw,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { Segment } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SegmentMembersPanel } from '../components/segments/SegmentMembersPanel';
import { SegmentPreviewModal } from '../components/segments/SegmentPreviewModal';

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  id: string;
  matchType: 'all' | 'any';
  conditions: Condition[];
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const SegmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [newSegmentToast, setNewSegmentToast] = useState<{ id: string; name: string; count: number } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // New/Edit Segment Drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [animateDrawer, setAnimateDrawer] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupsMatch, setGroupsMatch] = useState<'all' | 'any'>('all');
  const [groups, setGroups] = useState<ConditionGroup[]>([
    {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      matchType: 'all',
      conditions: [{ field: 'name', operator: 'contains', value: '' }],
    },
  ]);

  // Preview targeting rules inside drawer
  const [previewCount, setPreviewCount] = useState<number | string>('—');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewCustomers, setPreviewCustomers] = useState<any[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [showPreviewSection, setShowPreviewSection] = useState(false);

  // Dedicated Enterprise View Panel & Full Preview Modal
  const [selectedSegmentForPanel, setSelectedSegmentForPanel] = useState<Segment | null>(null);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState<boolean>(false);

  // Legacy Details Modal State
  const [viewingSegment, setViewingSegment] = useState<any | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
  const [segCustomersPage, setSegCustomersPage] = useState(1);
  const [segCustomersLoading, setSegCustomersLoading] = useState(false);

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const handleNavigateToMatches = () => {
    if (editingSegmentId) {
      navigate(`/segments/${editingSegmentId}/matches`);
    } else {
      showToast('Save Segment First', 'Please save the segment first to view its full matching customer list', 'info');
    }
  };

  const loadSegments = async () => {
    setLoading(true);
    try {
      let query = `/api/segments?page=${page}&limit=${limit}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await api.get(query);
      setSegments(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast('Error loading segments', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
    const handleSegmentsUpdated = () => {
      loadSegments();
    };
    window.addEventListener('segments-updated', handleSegmentsUpdated);
    return () => window.removeEventListener('segments-updated', handleSegmentsUpdated);
  }, [page, search, statusFilter]);

  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDrawer]);

  // Recalculate live preview count and matching customers automatically on every condition/operator/value change
  useEffect(() => {
    if (!showDrawer) return;

    const timer = setTimeout(async () => {
      try {
        const systemFieldNames = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];
        const formatCond = (c: Condition) => {
          const isCustomAttr = !systemFieldNames.includes(c.field);
          return {
            field: isCustomAttr ? 'attribute' : c.field,
            attrKey: isCustomAttr ? c.field : undefined,
            operator: c.operator,
            value: c.value,
            valueType: c.field === 'lead_score' ? 'num' : 'str',
          };
        };

        const res = await api.post('/api/segments/preview', {
          conditionGroups: groups.map((g) => ({
            matchType: g.matchType,
            conditions: g.conditions.map(formatCond),
          })),
          groupsMatch,
        });
        setPreviewCount(res.count ?? 0);
        setPreviewCustomers(res.customers || res.data || []);
      } catch (err) {
        // quiet catch during transient typing
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [groups, groupsMatch, showDrawer]);

  const handleDeleteSegment = async (s: Segment) => {
    try {
      await api.delete(`/api/segments/${s._id}`);
      setSegments((prev) => prev.filter((item) => item._id !== s._id));
      setTotal((prev) => Math.max(0, prev - 1));
      showToast('Segment Deleted', `Segment "${s.name}" deleted successfully.`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete segment', 'error');
      loadSegments();
    }
  };

  const triggerDeleteModal = (s: Segment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Segment',
      message: `Delete "${s.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: () => handleDeleteSegment(s),
    });
  };

  const handleDuplicateSegment = async (s: Segment) => {
    try {
      const condGroups = (s as any).conditionGroups || [];
      const legacyConds = (s as any).conditions || [];
      const dupName = `${s.name} (Copy)`;

      const payload = {
        name: dupName,
        description: s.description ? `${s.description} (Copy)` : `Copy of ${s.name}`,
        groupsMatch: (s as any).groupsMatch || 'all',
        conditionGroups: condGroups.length > 0 ? condGroups : [
          {
            matchType: 'all',
            conditions: legacyConds.length > 0 ? legacyConds : [{ field: 'name', operator: 'contains', value: '' }],
          }
        ],
        conditions: legacyConds,
      };

      await api.post('/api/segments', payload);
      showToast('Segment Duplicated', `Segment "${dupName}" created successfully.`, 'success');
      loadSegments();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to duplicate segment', 'error');
    }
  };

  const triggerDuplicateModal = (s: Segment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Duplicate Segment',
      message: `Create a duplicate copy of "${s.name}"?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      isDestructive: false,
      onConfirm: () => handleDuplicateSegment(s),
    });
  };

  const handleRefreshPreview = async () => {
    setPreviewLoading(true);
    try {
      const systemFieldNames = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];
      const formatCond = (c: Condition) => {
        const isCustomAttr = !systemFieldNames.includes(c.field);
        return {
          field: isCustomAttr ? 'attribute' : c.field,
          attrKey: isCustomAttr ? c.field : undefined,
          operator: c.operator,
          value: c.value,
          valueType: c.field === 'lead_score' ? 'num' : 'str',
        };
      };

      const res = await api.post('/api/segments/preview', {
        conditionGroups: groups.map((g) => ({
          matchType: g.matchType,
          conditions: g.conditions.map(formatCond),
        })),
        groupsMatch,
      });
      setPreviewCount(res.count ?? 0);
      setPreviewCustomers(res.customers || res.data || []);
      setShowPreviewSection(true);

      setTimeout(() => {
        const el = document.getElementById('segPreviewCustomersSection');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } catch (err: any) {
      showToast('Preview Error', err.message || 'Failed to fetch matching count', 'warning');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenCreateDrawer = () => {
    setEditingSegmentId(null);
    setName('');
    setDescription('');
    setGroupsMatch('all');
    setGroups([
      {
        id: 'g_' + Math.random().toString(36).substring(2, 9),
        matchType: 'all',
        conditions: [{ field: 'name', operator: 'eq', value: '' }],
      },
    ]);
    setPreviewCount(0);
    setPreviewCustomers([]);
    setShowPreviewSection(false);
    setShowDrawer(true);
    setAnimateDrawer(true);
  };

  const handleCloseDrawer = () => {
    setAnimateDrawer(false);
    setTimeout(() => setShowDrawer(false), 200);
  };

  // Decode a raw DB condition value+operator back into a human-friendly pair
  // Old segments saved via the static JS stored MongoDB query objects as values.
  const normalizeConditionFromDB = (c: any): Condition => {
    const field = c.attrKey || c.field || 'name';
    let operator = c.operator || 'eq';
    let value = c.value;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.$regex !== undefined && value.$options !== undefined && !value.$not) {
        const rx: string = value.$regex || '';
        if (rx.startsWith('^')) { operator = 'starts_with'; value = rx.slice(1); }
        else if (rx.endsWith('$')) { operator = 'ends_with'; value = rx.slice(0, -1); }
        else { operator = 'contains'; value = rx; }
      } else if (value.$not) {
        const inner = value.$not;
        const src: string = (inner instanceof RegExp ? inner.source : inner.$regex) || '';
        if (src.startsWith('^')) { operator = 'not_starts_with'; value = src.slice(1); }
        else if (src.endsWith('$')) { operator = 'not_ends_with'; value = src.slice(0, -1); }
        else { operator = 'not_contains'; value = src; }
      } else if (value.$ne !== undefined) { operator = 'is_not'; value = String(value.$ne); }
      else if (value.$gt !== undefined) { operator = 'gt'; value = String(value.$gt); }
      else if (value.$lt !== undefined) { operator = 'lt'; value = String(value.$lt); }
      else if (value.$gte !== undefined) { operator = 'gte'; value = String(value.$gte); }
      else if (value.$lte !== undefined) { operator = 'lte'; value = String(value.$lte); }
      else if (value.$in) { operator = 'is_empty'; value = ''; }
      else if (value.$nin) { operator = 'is_not_empty'; value = ''; }
      else { value = ''; }
    } else {
      value = value !== null && value !== undefined ? String(value) : '';
    }

    return { field, operator, value };
  };

  const populateDrawerFromSegment = (s: Segment, isDuplicate = false) => {
    if (isDuplicate) {
      triggerDuplicateModal(s);
      return;
    }
    setEditingSegmentId(s._id);
    setName(s.name);
    setDescription(s.description || '');
    setGroupsMatch((s as any).groupsMatch || 'all');

    const condGroups = (s as any).conditionGroups;
    const legacyConds = (s as any).conditions;

    if (condGroups && condGroups.length > 0) {
      setGroups(
        condGroups.map((g: any) => ({
          id: 'g_' + Math.random().toString(36).substring(2, 9),
          matchType: g.matchType || 'all',
          conditions: (g.conditions || []).map(normalizeConditionFromDB),
        }))
      );
    } else if (legacyConds && legacyConds.length > 0) {
      setGroups([
        {
          id: 'g_' + Math.random().toString(36).substring(2, 9),
          matchType: 'all',
          conditions: legacyConds.map(normalizeConditionFromDB),
        },
      ]);
    } else {
      setGroups([
        {
          id: 'g_' + Math.random().toString(36).substring(2, 9),
          matchType: 'all',
          conditions: [{ field: 'name', operator: 'eq', value: '' }],
        },
      ]);
    }

    setPreviewCount((s as any).cachedCount ?? 0);
    setPreviewCustomers([]);
    setShowPreviewSection(false);
    setShowDrawer(true);
    setAnimateDrawer(true);
  };

  const handleSaveSegment = async (e: React.FormEvent) => {
    e.preventDefault();

    const systemFieldNames = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];

    const flatConditions: any[] = [];
    groups.forEach((g) => {
      g.conditions.forEach((c) => {
        const isCustomAttr = !systemFieldNames.includes(c.field);
        flatConditions.push({
          field: isCustomAttr ? 'attribute' : c.field,
          attrKey: isCustomAttr ? c.field : undefined,
          operator: c.operator,
          value: c.value,
          valueType: c.field === 'lead_score' ? 'num' : 'str',
        });
      });
    });

    const payload = {
      name: name.trim(),
      description,
      groupsMatch,
      conditions: flatConditions,
      conditionGroups: groups.map((g) => ({
        matchType: g.matchType,
        conditions: g.conditions.map((c) => {
          const isCustomAttr = !systemFieldNames.includes(c.field);
          return {
            field: isCustomAttr ? 'attribute' : c.field,
            attrKey: isCustomAttr ? c.field : undefined,
            operator: c.operator,
            value: c.value,
            valueType: c.field === 'lead_score' ? 'num' : 'str',
          };
        }),
      })),
    };

    try {
    if (editingSegmentId) {
      await api.patch(`/api/segments/${editingSegmentId}`, payload);
      showToast('Segment Updated', 'Changes saved successfully.', 'success');
    } else {
      const res = await api.post('/api/segments', payload);
      const created = res.data || res;
      showToast('Segment Created', 'New segment created successfully.', 'success');

      if (created && (created._id || created.id)) {
        const createdId = created._id || created.id;
        const createdName = created.name || name.trim();
        const createdCount = created.cachedCount || created.calculatedCount || 0;
        setNewSegmentToast({
          id: createdId,
          name: createdName,
          count: createdCount,
        });

        setTimeout(() => {
          setNewSegmentToast((prev) => (prev?.id === createdId ? null : prev));
        }, 8000);
      }
    }
    handleCloseDrawer();
    loadSegments();
  } catch (err: any) {
    showToast('Error', err.message || 'Failed to save segment', 'error');
  }
};

  const handleOpenDetailsModal = (s: Segment) => {
    setSelectedSegmentForPanel(s);
  };

  const handleExportCSV = async (id: string) => {
    try {
      const res = await api.get(`/api/segments/${id}/customers`);
      const custs = res.data || [];
      const rows = custs.map((c: any) => [
        c.name || '',
        c.email || '',
        c.phoneNo || '',
        c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '',
        c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '',
        c.emailStatus || 'active',
      ]);
      const csv = ['Name,Email,Phone,Plan,Lead Score,Status', ...rows.map((r: any) => r.map((v: any) => `"${v}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `segment-${id}.csv`;
      a.click();
      showToast('Exported', 'Segment CSV downloaded successfully.', 'success');
    } catch (err: any) {
      showToast('Export Failed', err.message, 'error');
    }
  };

  const addFilterGroup = () => {
    setGroups([
      ...groups,
      {
        id: 'g_' + Math.random().toString(36).substring(2, 9),
        matchType: 'all',
        conditions: [{ field: 'name', operator: 'contains', value: '' }],
      },
    ]);
  };

  const addCondition = (groupId: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: [...g.conditions, { field: 'name', operator: 'contains', value: '' }] }
          : g
      )
    );
  };

  const updateCondition = (groupId: string, condIdx: number, key: keyof Condition, val: string) => {
    setGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const newConds = [...g.conditions];
        newConds[condIdx] = { ...newConds[condIdx], [key]: val };
        return { ...g, conditions: newConds };
      })
    );
  };

  const removeCondition = (groupId: string, condIdx: number) => {
    setGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, conditions: g.conditions.filter((_, idx) => idx !== condIdx) };
      })
    );
  };

  const updateGroupMatchType = (groupId: string, matchType: 'all' | 'any') => {
    setGroups(
      groups.map((g) => (g.id === groupId ? { ...g, matchType } : g))
    );
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const handleFieldChange = (groupId: string, condIdx: number, newField: string) => {
    setGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const newConds = [...g.conditions];
        let defaultOp = 'eq';
        let defaultVal = '';

        if (newField === 'emailStatus') {
          defaultOp = 'eq';
          defaultVal = 'active';
        } else if (newField === 'allowBroadcast') {
          defaultOp = 'eq';
          defaultVal = 'true';
        }

        newConds[condIdx] = {
          ...newConds[condIdx],
          field: newField,
          operator: defaultOp,
          value: defaultVal,
        };
        return { ...g, conditions: newConds };
      })
    );
  };

  const getOperatorsForField = (field: string) => {
    if (field === 'phoneNo') {
      return [
        { value: 'eq', label: '=' },
        { value: 'is_not', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'does not contain' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
        { value: 'not_starts_with', label: 'does not start with' },
        { value: 'not_ends_with', label: 'does not end with' },
        { value: 'matches_pattern', label: 'matches pattern' },
        { value: 'not_matches_pattern', label: 'does not match pattern' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
      ];
    }

    if (field === 'lead_score') {
      return [
        { value: 'eq', label: '=' },
        { value: 'is_not', label: 'is not' },
        { value: 'gt', label: 'greater than' },
        { value: 'lt', label: 'less than' },
        { value: 'gte', label: 'greater than or equal to' },
        { value: 'lte', label: 'less than or equal to' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
      ];
    }

    if (field === 'emailStatus' || field === 'allowBroadcast') {
      return [
        { value: 'eq', label: 'is' },
        { value: 'is_not', label: 'is not' },
      ];
    }

    return [
      { value: 'eq', label: 'is' },
      { value: 'is_not', label: 'is not' },
      { value: 'contains', label: 'contains' },
      { value: 'not_contains', label: 'does not contain' },
      { value: 'starts_with', label: 'starts with' },
      { value: 'ends_with', label: 'ends with' },
    ];
  };

  const renderValueInput = (group: ConditionGroup, cIdx: number, c: Condition) => {
    if (c.operator === 'is_empty' || c.operator === 'is_not_empty') {
      return (
        <input
          type="text"
          className="property-input"
          disabled
          placeholder="(No value needed)"
          value=""
        />
      );
    }

    if (c.field === 'emailStatus') {
      return (
        <select
          className="property-select"
          value={c.value || 'active'}
          onChange={(e) => updateCondition(group.id, cIdx, 'value', e.target.value)}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="bounced">bounced</option>
          <option value="unsubscribed">unsubscribed</option>
        </select>
      );
    }

    if (c.field === 'allowBroadcast') {
      return (
        <select
          className="property-select"
          value={c.value !== undefined ? String(c.value) : 'true'}
          onChange={(e) => updateCondition(group.id, cIdx, 'value', e.target.value)}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        className="property-input"
        placeholder="Enter value..."
        value={c.value}
        onChange={(e) => updateCondition(group.id, cIdx, 'value', e.target.value)}
      />
    );
  };

  const formatSegmentRules = (s: any) => {
    const condGroups = s.conditionGroups || [];
    if (condGroups.length > 0) {
      return condGroups
        .map((g: any, idx: number) => {
          const condStrs = (g.conditions || [])
            .map((c: any) => {
              const field = c.attrKey || c.field || 'name';
              const op = c.operator || 'contains';
              const val = c.value ?? '';
              return `${field} ${op} ${val}`.trim();
            })
            .join(', ');
          return `G${idx + 1} (${g.matchType || 'all'}): ${condStrs || 'All'}`;
        })
        .join(' | ');
    }

    const legacyConds = s.conditions || [];
    if (legacyConds.length > 0) {
      const condStrs = legacyConds
        .map((c: any) => {
          const field = c.attrKey || c.field || 'name';
          const op = c.operator || 'contains';
          const val = c.value ?? '';
          return `${field} ${op} ${val}`.trim();
        })
        .join(', ');
      return `G1 (${s.groupsMatch || 'all'}): ${condStrs}`;
    }

    return 'All contacts';
  };

  const getSegmentRulePills = (s: any): string[] => {
    const formatOp = (op: string) => {
      if (!op || op === 'eq') return '=';
      if (op === 'is_not') return '≠';
      if (op === 'gt') return '>';
      if (op === 'lt') return '<';
      if (op === 'gte') return '≥';
      if (op === 'lte') return '≤';
      if (op === 'contains') return 'contains';
      if (op === 'starts_with') return 'starts with';
      if (op === 'ends_with') return 'ends with';
      return op;
    };

    const condGroups = s.conditionGroups || [];
    if (condGroups.length > 0) {
      const pills: string[] = [];
      condGroups.forEach((g: any) => {
        (g.conditions || []).forEach((c: any) => {
          const field = c.attrKey || c.field || 'name';
          const opStr = formatOp(c.operator);
          const val = c.value ?? '';
          pills.push(`${field} ${opStr} ${val}`.trim());
        });
      });
      if (pills.length > 0) return pills;
    }

    const legacyConds = s.conditions || [];
    if (legacyConds.length > 0) {
      return legacyConds.map((c: any) => {
        const field = c.attrKey || c.field || 'name';
        const opStr = formatOp(c.operator);
        const val = c.value ?? '';
        return `${field} ${opStr} ${val}`.trim();
      });
    }

    return ['All contacts'];
  };

  const totalPages = Math.ceil(total / limit) || 1;

  // Pagination for preview customers inside drawer
  const previewLimit = 5;
  const totalPreviewPages = Math.ceil(previewCustomers.length / previewLimit) || 1;
  const paginatedPreviewCustomers = previewCustomers.slice(
    (previewPage - 1) * previewLimit,
    previewPage * previewLimit
  );

  // Pagination for details modal customers
  const segCustomersLimit = 10;
  const totalSegCustomersPages = Math.ceil(segmentCustomers.length / segCustomersLimit) || 1;
  const paginatedSegCustomers = segmentCustomers.slice(
    (segCustomersPage - 1) * segCustomersLimit,
    segCustomersPage * segCustomersLimit
  );

  return (
    <section id="segments" className="page active" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 24px 0' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h1 className="page-title">Segments</h1>
          <p className="page-description">Manage customer audience groups for campaigns.</p>
        </div>
        <button className="btn" onClick={handleOpenCreateDrawer}>
          <Plus style={{ width: 16, height: 16 }} /> Create Segment
        </button>
      </div>

      {/* Toolbar */}
      <div className="seg-toolbar" style={{ marginBottom: 16 }}>
        <div className="seg-toolbar-left">
          <div className="seg-search-wrap">
            <Search style={{ width: 16, height: 16 }} className="seg-search-icon" />
            <input
              id="segmentSearch"
              type="text"
              className="seg-search-input"
              placeholder="Search segments by name or description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="seg-status-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="seg-toolbar-right">
          <span className="seg-total-count">
            Total Records ({total})
          </span>
          <div className="seg-view-toggle">
            <button
              type="button"
              className={`seg-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <LayoutGrid style={{ width: 16, height: 16 }} />
            </button>
            <button
              type="button"
              className={`seg-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' ? (
        <div id="segmentsList" className="seg-card-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B', gridColumn: '1 / -1' }}>
              Loading segments…
            </div>
          ) : segments.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                border: '1px dashed #CBD5E1',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers style={{ width: 28, height: 28 }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>No Segments Found</h3>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0, maxWidth: 400 }}>
                Create your first dynamic audience segment to send targeted email broadcasts and automated campaigns.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleOpenCreateDrawer}
                style={{ height: 40, padding: '0 18px', borderRadius: 10, marginTop: 8, background: '#2563EB', color: '#FFF' }}
              >
                <Plus style={{ width: 16, height: 16 }} /> Create Segment
              </button>
            </div>
          ) : (
            segments.map((s: any, idx: number) => {
              const lastSync = s.lastEvaluatedAt
                ? new Date(s.lastEvaluatedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '18 Jul 2026, 04:21 pm';

              const allPills = getSegmentRulePills(s);
              const displayPills = allPills.slice(0, 3);
              const remainingCount = allPills.length - 3;

              return (
                <div className="seg-card" key={s._id ? `${s._id}-${idx}` : `seg-${idx}`}>
                  {/* Row 1: Segment Title (left) + 4 Action Icons (right) */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <h3 className="seg-card-title" style={{ flex: 1, minWidth: 0 }}>
                      {s.name}
                    </h3>

                    <div className="seg-card-actions" style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                      <button
                        className="seg-action-btn"
                        title="View"
                        onClick={() => navigate(`/segments/${s._id}/matches`)}
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="seg-action-btn" title="Edit" onClick={() => populateDrawerFromSegment(s, false)}>
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="seg-action-btn btn-duplicate" title="Duplicate" onClick={() => triggerDuplicateModal(s)}>
                        <Copy style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        className="seg-action-btn btn-delete"
                        title="Delete"
                        onClick={() => triggerDeleteModal(s)}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="seg-card-body">
                    <p className="seg-card-desc">{s.description || 'Dynamic audience segment'}</p>

                    <div className="seg-card-rules-sec">
                      <div className="seg-section-label">MATCHING RULES</div>
                      <div className="seg-rules-wrapper">
                        {displayPills.map((pillText, pIdx) => (
                          <span key={pIdx} className="seg-rule-pill" title={pillText}>
                            <Filter style={{ width: 10, height: 10 }} />
                            {pillText}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span
                            className="seg-rule-pill"
                            style={{ background: '#F1F5F9', borderColor: '#CBD5E1', color: '#475569' }}
                            title={`${remainingCount} more rules`}
                          >
                            +{remainingCount} More
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Row: Evaluated Date + View Details Link */}
                    <div className="seg-card-footer">
                      <span>Evaluated: {lastSync}</span>
                      <span
                        style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => navigate(`/segments/${s._id}/matches`)}
                        title="View matching contacts"
                      >
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrap">
          <table className="data-table" style={{ width: '100%', minWidth: 900, tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '18%', minWidth: 140 }}>Name</th>
                <th style={{ width: '18%', minWidth: 140, maxWidth: 180 }}>Description</th>
                <th style={{ width: '24%', minWidth: 160 }}>Conditions</th>
                <th style={{ width: '26%', minWidth: 200 }}>Members</th>
                <th className="sticky-actions-col" style={{ textAlign: 'right', paddingRight: 16, width: '14%', minWidth: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s: any, idx: number) => {
                const allPills = getSegmentRulePills(s);
                const displayPills = allPills.slice(0, 3);
                const remainingCount = allPills.length - 3;

                return (
                  <tr key={s._id ? `${s._id}-${idx}` : `seg-${idx}`}>
                    <td style={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }} title={s.name}>
                      {s.name}
                    </td>
                    <td style={{ color: '#64748B', fontSize: 13.5, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.description || '—'}>
                      {s.description || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 260 }}>
                        {displayPills.map((pillText, pIdx) => (
                          <span key={pIdx} className="seg-rule-pill" title={pillText}>
                            <Filter style={{ width: 10, height: 10 }} />
                            {pillText}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span
                            className="seg-rule-pill"
                            style={{ background: '#F1F5F9', borderColor: '#CBD5E1', color: '#475569' }}
                            title={`${remainingCount} more rules`}
                          >
                            +{remainingCount} More
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, minWidth: 200 }}>
                      <button
                        type="button"
                        className="seg-members-badge"
                        style={{
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          height: 32,
                          padding: '0 12px',
                          fontSize: 12,
                          minWidth: 180,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        onClick={() => navigate(`/segments/${s._id}/matches`)}
                        aria-label="View matching contacts"
                      >
                        <Users style={{ width: 13, height: 13 }} />
                        <span>{s.cachedCount || 0} Matching Contacts</span>
                      </button>
                    </td>
                    <td className="sticky-actions-col" style={{ textAlign: 'right', paddingRight: 16 }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button className="seg-action-btn" title="View" onClick={() => handleOpenDetailsModal(s)}>
                          <Eye style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="seg-action-btn" title="Edit" onClick={() => populateDrawerFromSegment(s, false)}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="seg-action-btn btn-duplicate" title="Duplicate" onClick={() => triggerDuplicateModal(s)}>
                          <Copy style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          className="seg-action-btn btn-delete"
                          title="Delete"
                          onClick={() => triggerDeleteModal(s)}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="pagination-footer-card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> Segments
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
              <span>Rows per page:</span>
              <select
                className="seg-status-select"
                style={{ height: 36, padding: '0 8px', borderRadius: 8, fontSize: 13 }}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Previous Page"
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: pNum === page ? 'none' : '1px solid #E5E7EB',
                      background: pNum === page ? '#2563EB' : '#FFFFFF',
                      color: pNum === page ? '#FFFFFF' : '#334155',
                      fontWeight: pNum === page ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: 13,
                      transition: 'all 200ms ease',
                    }}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Next Page"
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Segment Right Drawer */}
      {showDrawer && (
        <div className={`drawer-overlay ${animateDrawer ? 'active' : ''}`} style={{ display: 'block' }} onClick={handleCloseDrawer}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveSegment} className="drawer-form">
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" className="drawer-back" onClick={handleCloseDrawer}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                  </button>
                  <h2 className="drawer-title">
                    {editingSegmentId ? 'Edit Segment' : 'New Segment'}
                  </h2>
                </div>
                <button type="button" className="drawer-close" onClick={handleCloseDrawer}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <div className="drawer-body">
                {/* Segment Details */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">SEGMENT DETAILS</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="property-label">SEGMENT NAME *</span>
                      <input
                        type="text"
                        className="property-input"
                        required
                        placeholder="e.g., VIP Customers"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ fontSize: 14, fontWeight: 500 }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="property-label">DESCRIPTION</span>
                      <input
                        type="text"
                        className="property-input"
                        placeholder="Optional description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Targeting Rules */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">TARGETING RULES</h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Groups match:</span>
                      <select
                        className="pill-select"
                        value={groupsMatch}
                        onChange={(e) => setGroupsMatch(e.target.value as any)}
                      >
                        <option value="all">ALL (AND)</option>
                        <option value="any">ANY (OR)</option>
                      </select>
                    </div>

                    {editingSegmentId && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                          border: '1px solid rgba(139,92,246,0.2)',
                          borderRadius: 10,
                          padding: '6px 14px',
                          cursor: 'pointer',
                        }}
                        onClick={handleNavigateToMatches}
                        title="Click to view full matching customers page"
                      >
                        <Users style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Matching:</span>
                        <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: 14 }}>{previewCount}</span>
                        <button
                          type="button"
                          disabled={previewLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshPreview();
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', marginLeft: 4 }}
                          title="Refresh preview count"
                        >
                          <RefreshCw style={{ width: 12, height: 12, animation: previewLoading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Conditions groups */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {groups.map((group, gIdx) => (
                      <div key={group.id ? `${group.id}-${gIdx}` : `grp-${gIdx}`} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: '#2563eb',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {gIdx + 1}
                          </span>
                          <strong style={{ fontSize: 13, color: 'var(--text)' }}>Condition Group</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>Match</span>
                            <select
                              className="pill-select"
                              value={group.matchType}
                              onChange={(e) => updateGroupMatchType(group.id, e.target.value as any)}
                            >
                              <option value="all">ALL (AND)</option>
                              <option value="any">ANY (OR)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            className="action-icon-btn btn-delete"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => removeGroup(group.id)}
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {group.conditions.map((c, cIdx) => (
                            <div key={(c as any).id ? `${(c as any).id}-${cIdx}` : `cond-${cIdx}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FIELD</span>
                                <select
                                  className="property-select"
                                  value={c.field}
                                  onChange={(e) => handleFieldChange(group.id, cIdx, e.target.value)}
                                >
                                  <option value="name">Name</option>
                                  <option value="email">Email</option>
                                  <option value="phoneNo">Phone Number</option>
                                  <option value="city">City (Attribute)</option>
                                  <option value="plan">Plan (Attribute)</option>
                                  <option value="lead_score">Lead Score (Attribute)</option>
                                  <option value="emailStatus">Email Status</option>
                                  <option value="allowBroadcast">Allow Broadcast</option>
                                </select>
                              </div>

                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>OPERATOR</span>
                                <select
                                  className="property-select"
                                  value={c.operator}
                                  onChange={(e) => updateCondition(group.id, cIdx, 'operator', e.target.value)}
                                >
                                  {getOperatorsForField(c.field).map((op, opIdx) => (
                                    <option key={`${op.value}-${opIdx}`} value={op.value}>
                                      {op.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>VALUE</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {renderValueInput(group, cIdx, c)}
                                  <button
                                    type="button"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: 4,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                    }}
                                    onClick={() => removeCondition(group.id, cIdx)}
                                    title="Remove condition"
                                  >
                                    <X style={{ width: 13, height: 13 }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addCondition(group.id)}
                          style={{
                            width: '100%',
                            height: 38,
                            marginTop: 12,
                            background: '#FFFFFF',
                            border: '1px solid #BFDBFE',
                            borderRadius: 8,
                            color: '#2563EB',
                            fontWeight: 600,
                            fontSize: 13,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                            boxShadow: '0 1px 2px rgba(37,99,235,0.05)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EFF6FF';
                            e.currentTarget.style.borderColor = '#2563EB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                          }}
                        >
                          <Plus style={{ width: 14, height: 14 }} /> Add Condition
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addFilterGroup}
                    style={{
                      width: '100%',
                      height: 40,
                      marginTop: 14,
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: 8,
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#EFF6FF';
                      e.currentTarget.style.borderColor = '#2563EB';
                      e.currentTarget.style.color = '#2563EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add Filter Group
                  </button>

                  {/* Live Match Count Indicator — Only for Existing Segments Being Edited */}
                  {editingSegmentId && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                        <Users style={{ width: 14, height: 14, color: '#2563EB' }} />
                        <span>
                          {typeof previewCount === 'number'
                            ? `${previewCount.toLocaleString()} matching customer${previewCount === 1 ? '' : 's'}`
                            : previewCount || 'Calculating matches...'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleCloseDrawer();
                          navigate(`/segments/${editingSegmentId}/matches`);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title="Open dedicated matching contacts page"
                      >
                        View Full List →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDrawer}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  {editingSegmentId ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Enterprise Slide-over Panel for Viewing Members */}
      {selectedSegmentForPanel && (
        <SegmentMembersPanel
          segment={selectedSegmentForPanel}
          onClose={() => setSelectedSegmentForPanel(null)}
          showToast={showToast}
        />
      )}

      {/* Dedicated Enterprise Segment Creation Full Preview Modal */}
      {showFullPreviewModal && (
        <SegmentPreviewModal
          isOpen={true}
          totalCount={typeof previewCount === 'number' ? previewCount : 0}
          groups={groups}
          groupsMatch={groupsMatch}
          onClose={() => setShowFullPreviewModal(false)}
          onSave={() => {
            handleSaveSegment({ preventDefault: () => {} } as any);
          }}
          isEditing={Boolean(editingSegmentId)}
          showToast={showToast}
        />
      )}

      {/* Bottom-Left Toast for Newly Created Segments */}
      {newSegmentToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 9999,
            background: '#FFFFFF',
            border: '1.5px solid #2563EB',
            borderRadius: 14,
            padding: '14px 18px',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 440,
            cursor: 'pointer',
          }}
          onClick={() => {
            const targetId = newSegmentToast.id;
            setNewSegmentToast(null);
            navigate(`/segments/${targetId}/matches`);
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle style={{ width: 20, height: 20 }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
              Segment '{newSegmentToast.name}' Created
            </div>
            <div style={{ fontSize: 12.5, color: '#64748B' }}>
              <span style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'underline' }}>
                {newSegmentToast.count} matching contacts →
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNewSegmentToast(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
            }}
            title="Dismiss"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Delete and Duplicate */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText || 'Cancel'}
          isDestructive={confirmDialog.isDestructive ?? true}
          onConfirm={async () => {
            const action = confirmDialog.onConfirm;
            setConfirmDialog(null);
            await action();
          }}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </section>
  );
};
