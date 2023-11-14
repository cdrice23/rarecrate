import cx from 'classnames';
import { useState } from 'react';
import { FieldArray } from 'formik';
import { Plus } from '@phosphor-icons/react';
import { SocialLink } from '../SocialLink/SocialLink';

const SocialLinksArrayInput = ({ socialLinks, setFieldValue }) => {
  const [values, setValues] = useState(socialLinks.map(link => ({ platform: link.platform, username: link.username })));
  const [isEditing, setIsEditing] = useState(socialLinks.map(link => false));

  const handleEdit = index => {
    setIsEditing(isEditingState => isEditingState.map((isEditing, i) => (i === index ? true : isEditing)));
  };

  const handleUpdateValues = (index, field, value) => {
    setValues(valuesState => {
      const newValues = [...valuesState];
      newValues[index] = { ...newValues[index], [field]: value };
      return newValues;
    });
    setFieldValue(`socialLinks.${index}.${field}`, value);
  };

  return (
    <>
      <label htmlFor="socialLinks">Social Links</label>
      <FieldArray name="socialLinks">
        {({ push, remove }) => (
          <div className={cx('socialLinkArea')}>
            {values.map((socialLink, index) => (
              <SocialLink
                key={index}
                index={index}
                data={values[index]}
                isEditing={isEditing[index]}
                onEdit={handleEdit}
                onRemove={() => {
                  remove(index);
                }}
                onConfirm={() => {
                  setIsEditing(isEditingState =>
                    isEditingState.map((isEditing, i) => (i === index ? false : isEditing)),
                  );
                }}
                hasUsername={values.map(i => i.platform)}
                onUpdateValue={handleUpdateValues}
                setValues={setValues}
                setIsEditing={setIsEditing}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                push({});
                setValues([...values, {}]);
                setIsEditing(isEditingState => [...isEditingState, true]);
              }}
            >
              <Plus />
            </button>
          </div>
        )}
      </FieldArray>
    </>
  );
};

export { SocialLinksArrayInput };
