import { useState, useEffect } from 'react';
import { Select, Row, Col } from 'antd';
import type { ParsedFolderPathDto } from '../types';

interface FolderPathSelectorProps {
  value?: string;
  onChange?: (val: string) => void;
  folderPaths: ParsedFolderPathDto[];
}

export default function FolderPathSelector({ value, onChange, folderPaths }: FolderPathSelectorProps) {
  const [drive, setDrive] = useState<string>('');
  const [parent, setParent] = useState<string>('');
  const [child1, setChild1] = useState<string>('');
  const [child2, setChild2] = useState<string>('');
  const [child3, setChild3] = useState<string>('');
  const [child4, setChild4] = useState<string>('');

  // Synchronize internal states if value is changed externally (e.g., reset)
  useEffect(() => {
    if (!value) {
      setDrive('');
      setParent('');
      setChild1('');
      setChild2('');
      setChild3('');
      setChild4('');
    }
  }, [value]);

  const propagate = (d: string, p: string, c1: string, c2: string, c3: string, c4: string) => {
    const parts = [d, p, c1, c2, c3, c4].filter(Boolean);
    const combined = parts.join('\\');
    if (onChange) {
      onChange(combined);
    }
  };

  // Option generators
  const driveOptions = Array.from(new Set(folderPaths.map(p => p.driveName)))
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  const parentOptions = Array.from(
    new Set(folderPaths.filter(p => p.driveName === drive).map(p => p.parentFolder))
  )
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  const child1Options = Array.from(
    new Set(
      folderPaths
        .filter(p => p.driveName === drive && p.parentFolder === parent)
        .map(p => p.childDepth1)
    )
  )
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  const child2Options = Array.from(
    new Set(
      folderPaths
        .filter(
          p =>
            p.driveName === drive &&
            p.parentFolder === parent &&
            p.childDepth1 === child1
        )
        .map(p => p.childDepth2)
    )
  )
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  const child3Options = Array.from(
    new Set(
      folderPaths
        .filter(
          p =>
            p.driveName === drive &&
            p.parentFolder === parent &&
            p.childDepth1 === child1 &&
            p.childDepth2 === child2
        )
        .map(p => p.childDepth3)
    )
  )
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  const child4Options = Array.from(
    new Set(
      folderPaths
        .filter(
          p =>
            p.driveName === drive &&
            p.parentFolder === parent &&
            p.childDepth1 === child1 &&
            p.childDepth2 === child2 &&
            p.childDepth3 === child3
        )
        .map(p => p.childDepth4)
    )
  )
    .filter(Boolean)
    .map(val => ({ value: val, label: val }));

  return (
    <div style={{ background: 'rgba(241, 245, 249, 0.5)', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}>
      <Row gutter={[8, 8]}>
        {/* Drive Selector */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Drive / Server Share</div>
          <Select
            showSearch
            allowClear
            value={drive || undefined}
            onChange={(val) => {
              const d = val || '';
              setDrive(d);
              setParent('');
              setChild1('');
              setChild2('');
              setChild3('');
              setChild4('');
              propagate(d, '', '', '', '', '');
            }}
            placeholder="Select root share"
            options={driveOptions}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>

        {/* Parent Directory */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Parent Folder</div>
          <Select
            showSearch
            allowClear
            disabled={!drive}
            value={parent || undefined}
            onChange={(val) => {
              const p = val || '';
              setParent(p);
              setChild1('');
              setChild2('');
              setChild3('');
              setChild4('');
              propagate(drive, p, '', '', '', '');
            }}
            placeholder="Root folder"
            options={parentOptions}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>

        {/* Depth 1 Child */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Subfolder Level 1</div>
          <Select
            showSearch
            allowClear
            disabled={!parent}
            value={child1 || undefined}
            onChange={(val) => {
              const c1 = val || '';
              setChild1(c1);
              setChild2('');
              setChild3('');
              setChild4('');
              propagate(drive, parent, c1, '', '', '');
            }}
            placeholder="Child level 1"
            options={child1Options}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>

        {/* Depth 2 Child */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Subfolder Level 2</div>
          <Select
            showSearch
            allowClear
            disabled={!child1}
            value={child2 || undefined}
            onChange={(val) => {
              const c2 = val || '';
              setChild2(c2);
              setChild3('');
              setChild4('');
              propagate(drive, parent, child1, c2, '', '');
            }}
            placeholder="Child level 2"
            options={child2Options}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>

        {/* Depth 3 Child */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Subfolder Level 3</div>
          <Select
            showSearch
            allowClear
            disabled={!child2}
            value={child3 || undefined}
            onChange={(val) => {
              const c3 = val || '';
              setChild3(c3);
              setChild4('');
              propagate(drive, parent, child1, child2, c3, '');
            }}
            placeholder="Child level 3"
            options={child3Options}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>

        {/* Depth 4 Child */}
        <Col span={8}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Subfolder Level 4</div>
          <Select
            showSearch
            allowClear
            disabled={!child3}
            value={child4 || undefined}
            onChange={(val) => {
              const c4 = val || '';
              setChild4(c4);
              propagate(drive, parent, child1, child2, child3, c4);
            }}
            placeholder="Child level 4"
            options={child4Options}
            style={{ width: '100%' }}
            optionFilterProp="label"
          />
        </Col>
      </Row>
    </div>
  );
}
