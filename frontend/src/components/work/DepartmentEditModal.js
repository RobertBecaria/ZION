import React from 'react';
import { X } from 'lucide-react';

const colorOptions = [
  { color: '#1D4ED8', name: 'Синий' },
  { color: '#059669', name: 'Зеленый' },
  { color: '#7E22CE', name: 'Фиолетовый' },
  { color: '#A16207', name: 'Желтый' },
  { color: '#BE185D', name: 'Розовый' },
  { color: '#DC2626', name: 'Красный' },
  { color: '#EA580C', name: 'Оранжевый' },
  { color: '#0891B2', name: 'Голубой' }
];

const DepartmentEditModal = ({
  department,
  formData,
  organizationMembers,
  moduleColor,
  onClose,
  onSave,
  onFormChange
}) => {
  if (!department) return null;

  return (
    <div className="member-modal-overlay">
      <div className="member-modal">
        <div className="member-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Редактировать отдел</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#65676B' }}>
              {department.name}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div className="member-modal-body" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Название отдела *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="Введите название"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E4E6EB',
                borderRadius: '10px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Введите описание"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E4E6EB',
                borderRadius: '10px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Цвет
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colorOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => onFormChange({ ...formData, color: option.color })}
                  title={option.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: option.color,
                    border: formData.color === option.color ? '3px solid #050505' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Руководитель
            </label>
            <select
              value={formData.head_id}
              onChange={(e) => onFormChange({ ...formData, head_id: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E4E6EB',
                borderRadius: '10px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Не назначен</option>
              {organizationMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#F0F2F5',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
            <button
              onClick={onSave}
              style={{
                padding: '12px 24px',
                background: moduleColor,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentEditModal;
