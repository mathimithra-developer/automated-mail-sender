/**
 * /api/customfields — Custom Fields Manager & automated Segment linker
 */
import { Router } from 'express';
import { CustomField, Segment } from '../lib/models.js';

const router = Router();

// GET /api/customfields
router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const fields = await CustomField.find({ belongsTo: orgId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: fields });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customfields
router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const {
      name, label, dataType, hint, isMandatory,
      defaultValue, options, autoCreateSegment
    } = req.body;

    if (!label || !dataType) {
      return res.status(400).json({ error: 'Label and data type are required' });
    }

    // Clean name: alphanumeric lowercase
    const cleanName = name || label.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Create the custom field
    const customField = await CustomField.create({
      name: cleanName,
      label,
      dataType,
      hint,
      isMandatory: !!isMandatory,
      defaultValue,
      options: options ? options.split(',').map(o => o.trim()).filter(Boolean) : [],
      belongsTo: orgId,
      userDefine: true
    });

    let linkedSegment = null;

    // Automated link to segment if option is enabled
    if (autoCreateSegment) {
      // Map schema dataType to builder segment valueType
      let valueType = 'str';
      if (dataType === 'number') valueType = 'num';
      if (dataType === 'date') valueType = 'date';

      // Create a segment automatically linked to this field
      linkedSegment = await Segment.create({
        name: `${label} Segment`,
        organization: orgId,
        description: `Automated segment linked to custom field ${label}`,
        conditions: [{
          field: 'attribute',
          operator: 'eq',
          attrKey: cleanName,
          valueType,
          value: defaultValue || (dataType === 'number' ? 0 : '')
        }],
        createdBy: req.session?.userId
      });
    }

    res.status(201).json({
      success: true,
      data: customField,
      linkedSegment
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/customfields/:id
router.delete('/:id', async (req, res) => {
  try {
    const field = await CustomField.findById(req.params.id);
    if (!field) return res.status(404).json({ error: 'Custom field not found' });

    // Delete matching automated segments
    await Segment.deleteMany({
      organization: field.belongsTo,
      name: `${field.label} Segment`
    });

    await field.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
