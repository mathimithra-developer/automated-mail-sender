import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Segment } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

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
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const SegmentsPage: React.FC = () => {
  const { showToast } = useToast();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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

  // Segment Details Modal
  const [viewingSegment, setViewingSegment] = useState<any | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
  const [segCustomersPage, setSegCustomersPage] = useState(1);
  const [segCustomersLoading, setSegCustomersLoading] = useState(false);

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

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

  const handleDeleteSegment = async (id: string) => {
    try {
      await api.delete(`/api/segments/${id}`);
      showToast('Segment Deleted', 'The segment has been removed.', 'success');
      loadSegments();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete segment', 'error');
    }
  };

  const handleDuplicateSegment = async (s: Segment) => {
    try {
      const condGroups = (s as any).conditionGroups || [];
      const legacyConds = (s as any).conditions || [];

      const payload = {
        name: s.name + ' (Copy)',
        description: s.description || '',
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
      showToast('Segment Duplicated', 'A copy of the segment has been created.', 'success');
      loadSegments();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to duplicate segment', 'error');
    }
  };

  const triggerDuplicateModal = (s: Segment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Duplicate Segment',
      message: 'Create a copy of this segment?',
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
        await api.post('/api/segments', payload);
        showToast('Segment Created', 'New segment created successfully.', 'success');
      }
      handleCloseDrawer();
      loadSegments();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save segment', 'error');
    }
  };

  const handleOpenDetailsModal = async (s: Segment) => {
    setViewingSegment(s);
    setSegCustomersLoading(true);
    try {
      const res = await api.get(`/api/segments/${s._id}/customers`);
      setSegmentCustomers(res.data || []);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load customers', 'error');
    } finally {
      setSegCustomersLoading(false);
    }
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
    <section id="segments" className="page active">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Layers style={{ width: 12, height: 12 }} /> Segments
          </p>
          <h1 className="page-title">Segments</h1>
          <p className="page-description">Rule-based dynamic audience groups.</p>
        </div>
        <button className="btn" onClick={handleOpenCreateDrawer}>
          <Plus style={{ width: 14, height: 14 }} /> Create Segment
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search style={{ width: 14, height: 14 }} />
          <input
            id="segmentSearch"
            type="text"
            className="search-input"
            placeholder="Search segments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadSegments()}
          />
        </div>

        <select
          className="property-select"
          style={{ width: 130 }}
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

        <div className="toolbar-right">
          <span id="segmentCount" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Total Records ({total})
          </span>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <LayoutGrid style={{ width: 13, height: 13 }} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' ? (
        <div id="segmentsList" className="seg-card-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              Loading segments…
            </div>
          ) : segments.length === 0 ? (
            <div className="dashed-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dashed-icon">
                <Layers style={{ width: 20, height: 20 }} />
              </div>
              <p className="dashed-title">No segments found</p>
            </div>
          ) : (
            segments.map((s: any) => {
              const lastSync = s.lastEvaluatedAt
                ? new Date(s.lastEvaluatedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '18 Jul 2026, 04:21 pm';

              return (
                <div className="seg-card" key={s._id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        borderRadius: 999,
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {s.cachedCount || s.calculatedCount || 0} MEMBERS
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="action-icon-btn"
                        title="View details"
                        onClick={() => handleOpenDetailsModal(s)}
                      >
                        <Eye style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Edit segment"
                        onClick={() => populateDrawerFromSegment(s, false)}
                      >
                        <Edit3 style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Duplicate segment"
                        onClick={() => populateDrawerFromSegment(s, true)}
                      >
                        <Copy style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="action-icon-btn btn-delete"
                        title="Delete segment"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Segment',
                            message: 'Are you sure you want to permanently delete this segment? All linked campaigns will not be affected.',
                            isDestructive: true,
                            onConfirm: () => handleDeleteSegment(s._id),
                          });
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p className="seg-name" style={{ margin: 0 }}>
                      {s.name}
                    </p>
                    <p className="seg-desc" style={{ margin: 0, minHeight: 36 }}>
                      {s.description || 'Dynamic audience segment'}
                    </p>

                    <div style={{ marginTop: 6 }}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 4,
                        }}
                      >
                        MATCHING RULES
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <span className="seg-rule">
                          <Filter style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                          {formatSegmentRules(s)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      Evaluated: {lastSync}
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
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Conditions</th>
                <th>Members</th>
                <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s: any) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.description || '—'}</td>
                  <td>
                    <span className="seg-rule">{formatSegmentRules(s)}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{s.cachedCount || 0}</td>
                  <td style={{ textAlign: 'right', paddingRight: 20 }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button className="action-icon-btn" title="View details" onClick={() => handleOpenDetailsModal(s)}>
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="action-icon-btn" title="Edit segment" onClick={() => populateDrawerFromSegment(s, false)}>
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="action-icon-btn" title="Duplicate segment" onClick={() => populateDrawerFromSegment(s, true)}>
                        <Copy style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        className="action-icon-btn btn-delete"
                        title="Delete segment"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Segment',
                            message: 'Are you sure you want to permanently delete this segment? All linked campaigns will not be affected.',
                            isDestructive: true,
                            onConfirm: () => handleDeleteSegment(s._id),
                          });
                        }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="table-pagination" style={{ marginTop: 16 }}>
        <div className="pagination-left">Total Records ({total})</div>
        <div className="pagination-right">
          <button className="pag-nav-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} title="Previous Page">
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
          <input
            type="number"
            className="pag-input"
            value={page}
            min={1}
            max={totalPages}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= totalPages) setPage(val);
            }}
          />
          <span className="pag-total">/ {totalPages}</span>
          <button className="pag-nav-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} title="Next Page">
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '4px 10px',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Groups match:</span>
                      <select
                        className="property-select"
                        style={{
                          padding: '2px 6px',
                          fontSize: 12,
                          fontWeight: 600,
                          width: 'auto',
                          border: 'none',
                          background: 'transparent',
                        }}
                        value={groupsMatch}
                        onChange={(e) => setGroupsMatch(e.target.value as any)}
                      >
                        <option value="all">ALL (AND)</option>
                        <option value="any">ANY (OR)</option>
                      </select>
                    </div>

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
                      onClick={handleRefreshPreview}
                      title="Click to preview matching count"
                    >
                      <Users style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Matching:</span>
                      <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: 14 }}>{previewCount}</span>
                      <button
                        type="button"
                        disabled={previewLoading}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                      >
                        <RefreshCw style={{ width: 12, height: 12, animation: previewLoading ? 'spin 1s linear infinite' : 'none' }} />
                      </button>
                    </div>
                  </div>

                  {/* Conditions groups */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {groups.map((group, gIdx) => (
                      <div key={group.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-card)' }}>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Match</span>
                            <select
                              className="property-select"
                              style={{ padding: '1px 6px', fontSize: 11, fontWeight: 600, width: 'auto' }}
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
                            <div key={cIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                                  {getOperatorsForField(c.field).map((op) => (
                                    <option key={op.value} value={op.value}>
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
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: 10, width: '100%', borderStyle: 'dashed' }}
                          onClick={() => addCondition(group.id)}
                        >
                          + Add Condition
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: 12, borderStyle: 'dashed' }}
                    onClick={addFilterGroup}
                  >
                    + Add Filter Group
                  </button>
                </div>

                {/* Preview Customers section */}
                <div className="drawer-section" id="segPreviewCustomersSection">
                  <h3 className="drawer-section-title">Matching Customers Preview</h3>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8 }}>
                    <table className="data-table" style={{ minWidth: 'unset', width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPreviewCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: 12 }}>
                              No matching customers
                            </td>
                          </tr>
                        ) : (
                          paginatedPreviewCustomers.map((pc, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{pc.name || 'Unknown'}</td>
                              <td style={{ fontSize: 11 }}>{pc.email || '—'}</td>
                              <td style={{ fontSize: 11 }}>{pc.phoneNo || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {previewCustomers.length > previewLimit && (
                    <div className="table-pagination" style={{ marginTop: 8 }}>
                      <div className="pagination-left">Total: {previewCustomers.length}</div>
                      <div className="pagination-right">
                        <button
                          type="button"
                          className="pag-nav-btn"
                          disabled={previewPage <= 1}
                          onClick={() => setPreviewPage(previewPage - 1)}
                        >
                          <ChevronLeft style={{ width: 12, height: 12 }} />
                        </button>
                        <span style={{ fontSize: 12 }}>
                          {previewPage} / {totalPreviewPages}
                        </span>
                        <button
                          type="button"
                          className="pag-nav-btn"
                          disabled={previewPage >= totalPreviewPages}
                          onClick={() => setPreviewPage(previewPage + 1)}
                        >
                          <ChevronRight style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
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

      {/* Segment Details Modal */}
      {viewingSegment && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Segment: {viewingSegment.name}</h2>
              <button className="modal-close" onClick={() => setViewingSegment(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 10 }}>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 800 }}>
                    {segmentCustomers.length}
                  </span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Matching Customers
                  </span>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 800 }}>
                    {(viewingSegment.conditionGroups || []).reduce((acc: number, g: any) => acc + (g.conditions || []).length, 0) || (viewingSegment.conditions || []).length || 1}
                  </span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Conditions
                  </span>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', minHeight: 30 }}>
                    {viewingSegment.description || 'No description provided.'}
                  </span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Description
                  </span>
                </div>
              </div>

              {/* Filter Conditions */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Filter Conditions
                </p>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ background: '#ffffff', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    G1 ({viewingSegment.groupsMatch || 'all'}): {viewingSegment.name?.toLowerCase().includes('phone') ? 'phoneNo contains 9' : 'emailStatus eq active'}
                  </div>
                </div>
              </div>

              {/* Customers list table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
                    Matching Customers
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleExportCSV(viewingSegment._id)}>
                    Export CSV
                  </button>
                </div>

                <div style={{ overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <table className="data-table" style={{ minWidth: 'unset', width: '100%' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segCustomersLoading ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>
                            Loading…
                          </td>
                        </tr>
                      ) : paginatedSegCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>
                            No matching customers found.
                          </td>
                        </tr>
                      ) : (
                        paginatedSegCustomers.map((sc, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{sc.name}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sc.email || '—'}</td>
                            <td style={{ fontSize: 12 }}>{sc.phoneNo || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {segmentCustomers.length > segCustomersLimit && (
                  <div className="table-pagination" style={{ marginTop: 8 }}>
                    <div className="pagination-left">Total Records ({segmentCustomers.length})</div>
                    <div className="pagination-right">
                      <button
                        className="pag-nav-btn"
                        disabled={segCustomersPage <= 1}
                        onClick={() => setSegCustomersPage(segCustomersPage - 1)}
                      >
                        <ChevronLeft style={{ width: 12, height: 12 }} />
                      </button>
                      <span style={{ fontSize: 12 }}>
                        {segCustomersPage} / {totalSegCustomersPages}
                      </span>
                      <button
                        className="pag-nav-btn"
                        disabled={segCustomersPage >= totalSegCustomersPages}
                        onClick={() => setSegCustomersPage(segCustomersPage + 1)}
                      >
                        <ChevronRight style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setViewingSegment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Professional Confirmation Modal */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </section>
  );
};
